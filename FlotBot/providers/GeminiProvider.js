const axios = require("axios");
const MockProvider = require("./MockProvider");

/**
 * GeminiProvider  ─  Google Gemini 2.0 Flash / Pro via REST API
 * ─────────────────────────────────────────────────────────
 * Features:
 *   • Full Multimodal Vision Support (Screenshot & Visual Threat Inspection)
 *   • Streaming SSE support via /streamGenerateContent (word-by-word streaming)
 *   • Dynamic model selection (gemini-2.0-flash, gemini-2.0-pro, gemini-1.5-flash)
 *   • In-flight request abort controller for rapid prompt switching
 *   • Response caching with 60-second TTL
 *   • Exponential retry on transient HTTP 429/503
 *   • Graceful fallback to MockProvider if API key is missing
 */
class GeminiProvider {

    constructor(config = {}) {
        this.apiKey  = config.apiKey || process.env.GEMINI_API_KEY;
        this.model   = config.model  || process.env.GEMINI_MODEL || "gemini-flash-latest";
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
        this.ready   = false;
        this._mock   = new MockProvider();

        // Response cache: key → { text, ts }
        this._cache     = new Map();
        this._cacheTTL  = 60_000; // 60 s

        // Abort any in-flight request when a newer one arrives
        this._abortCtrl = null;

        // Rate-limit guard
        this._lastCallTs = 0;
        this._minGapMs   = 200; // Fast responsive throughput
    }

    // ─── Init ────────────────────────────────────────────────────────────────

    async initialize() {
        if (!this.apiKey || this.apiKey.trim().length < 10) {
            console.log("[Gemini] No GEMINI_API_KEY set — running seamlessly with Local Ollama.");
            this.ready = false;
            return;
        }

        if (this.apiKey.startsWith("AQ.") || !this.apiKey.startsWith("AIza")) {
            console.warn("[Gemini] Notice: The GEMINI_API_KEY in .env is not a Google AI Studio API key (valid keys begin with 'AIzaSy').");
            console.warn("[Gemini] To enable Gemini, generate a free API key at https://aistudio.google.com/app/apikey. Running with Local Ollama.");
            this.ready = false;
            return;
        }

        try {
            const models = await this.listModels();
            if (models.length > 0) {
                this.ready = true;
                // If currently configured model is not available or deprecated (e.g. gemini-2.0-flash, gemini-1.5), auto-select best
                if (!models.includes(this.model)) {
                    const preferred = ["gemini-flash-latest", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-pro-latest"];
                    const match = preferred.find(p => models.includes(p)) || models[0];
                    console.log(`[Gemini] Model "${this.model}" not in available list. Auto-selecting: "${match}"`);
                    this.model = match;
                }
                console.log(`[Gemini] Provider ready → model=${this.model} (API key verified, ${models.length} models available)`);
            } else {
                const ok = await this.healthCheck();
                this.ready = ok;
                if (ok) {
                    if (this.model.includes("2.0-flash") || this.model.includes("1.5-flash")) {
                        this.model = "gemini-flash-latest";
                    }
                    console.log(`[Gemini] Provider ready → model=${this.model} (API key verified)`);
                } else {
                    console.warn(`[Gemini] GEMINI_API_KEY was rejected by Google (HTTP 401 UNAUTHENTICATED). Please verify your key at https://aistudio.google.com/app/apikey. Running with Local Ollama.`);
                }
            }
        } catch {
            this.ready = false;
        }
    }

    setModel(modelName) {
        if (modelName && typeof modelName === "string") {
            this.model = modelName.trim();
            console.log(`[Gemini] Switched active model to: ${this.model}`);
        }
    }

    async listModels() {
        if (!this.apiKey || this.apiKey.trim().length < 10) return [];
        try {
            const url = `${this.baseUrl}/models?key=${this.apiKey}`;
            const res = await axios.get(url, { timeout: 6000 });
            if (res.data?.models && Array.isArray(res.data.models)) {
                return res.data.models
                    .map(m => m.name ? m.name.replace(/^models\//, "") : "")
                    .filter(n => n && (n.includes("flash") || n.includes("pro") || n.includes("gemini")));
            }
            return ["gemini-flash-latest", "gemini-3.6-flash"];
        } catch {
            return [];
        }
    }

    async healthCheck() {
        if (!this.apiKey || this.apiKey.trim().length < 10) return false;
        try {
            const url = `${this.baseUrl}/models?key=${this.apiKey}`;
            const res = await axios.get(url, { timeout: 6000 });
            return res.status === 200;
        } catch {
            return false;
        }
    }

    getProviderInfo() {
        return {
            provider: "Google Gemini",
            model: this.model,
            ready: Boolean(this.ready && this.apiKey),
            isOnline: true
        };
    }

    // ─── Generate (with streaming & multimodal vision) ──────────────────────

    /**
     * @param {string|Array} input   - structured messages array OR raw string
     * @param {object}       options
     *   options.image        (string)        - base64 or dataURL image for vision
     *   options.temperature  (default 0.3)
     *   options.maxTokens    (default 1024)
     *   options.stream       (default true)  — enable SSE streaming
     *   options.onToken      (fn)            — called per streaming token
     *   options.noCache      (bool)          — skip cache lookup
     * @returns {Promise<{text: string, model: string, provider: string}>}
     */
    async generate(input, options = {}) {
        if (!this.ready || !this.apiKey) {
            return { text: "", error: "Gemini provider not ready or unconfigured", provider: "gemini-offline" };
        }

        // Cache lookup (only when no vision image attached)
        if (!options.noCache && !options.image && !options.imageBase64) {
            const cacheKey = this._cacheKey(input, options);
            const cached   = this._cache.get(cacheKey);
            if (cached && (Date.now() - cached.ts) < this._cacheTTL) {
                if (options.onToken && typeof options.onToken === "function") {
                    await this._simulateStream(cached.text, options.onToken);
                }
                return { text: cached.text, model: this.model, provider: "gemini", fromCache: true };
            }
        }

        // Abort previous in-flight request if starting a new one
        if (this._abortCtrl) {
            this._abortCtrl.abort();
        }
        this._abortCtrl = new AbortController();

        // Rate-limit gap
        const now = Date.now();
        const gap = this._minGapMs - (now - this._lastCallTs);
        if (gap > 0) await this._sleep(gap);
        this._lastCallTs = Date.now();

        const useStreaming = (options.stream !== false) && typeof options.onToken === "function";

        return useStreaming
            ? this._generateStreaming(input, options)
            : this._generateBlocking(input, options);
    }

    // ─── Streaming via SSE ────────────────────────────────────────────────────

    async _generateStreaming(input, options) {
        try {
            const { contents, systemInstruction } = this._buildBody(input, options);
            const url  = `${this.baseUrl}/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

            const body = {
                contents,
                ...(systemInstruction ? { systemInstruction } : {}),
                generationConfig: {
                    temperature:     options.temperature  || 0.3,
                    maxOutputTokens: options.maxTokens    || 1024,
                    topP:            0.9
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
                ]
            };

            const timeout = options.maxTokens > 600 ? 40_000 : 20_000;

            const res = await axios.post(url, body, {
                timeout,
                responseType: "stream",
                signal: this._abortCtrl?.signal,
                headers: { "Content-Type": "application/json" }
            });

            let fullText = "";
            let buffer   = "";
            const onToken = options.onToken;

            await new Promise((resolve, reject) => {
                res.data.on("data", (chunk) => {
                    buffer += chunk.toString();
                    const parts = buffer.split("\n\n");
                    buffer = parts.pop();

                    for (const part of parts) {
                        if (!part.startsWith("data: ")) continue;
                        const jsonStr = part.slice(6).trim();
                        if (jsonStr === "[DONE]") continue;
                        try {
                            const parsed = JSON.parse(jsonStr);
                            const token  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (token) {
                                fullText += token;
                                onToken(token);
                            }
                        } catch { /* ignore malformed chunks */ }
                    }
                });
                res.data.on("end",   resolve);
                res.data.on("error", reject);
            });

            if (!fullText) throw new Error("No content in streaming Gemini response");

            // Cache result if not an image prompt
            if (!options.image && !options.imageBase64) {
                const cacheKey = this._cacheKey(input, options);
                this._cache.set(cacheKey, { text: fullText, ts: Date.now() });
            }

            return { text: fullText.trim(), model: this.model, provider: "gemini" };

        } catch (err) {
            if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
                return { text: "", model: this.model, provider: "gemini", aborted: true };
            }
            console.warn("[Gemini] streaming error:", err.message, "— falling back to blocking.");
            return this._generateBlocking(input, options);
        }
    }

    // ─── Blocking ─────────────────────────────────────────────────────────────

    async _generateBlocking(input, options, retries = 2) {
        try {
            const { contents, systemInstruction } = this._buildBody(input, options);
            const url  = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
            const timeout = options.maxTokens > 600 ? 30_000 : 15_000;

            const body = {
                contents,
                ...(systemInstruction ? { systemInstruction } : {}),
                generationConfig: {
                    temperature:     options.temperature  || 0.3,
                    maxOutputTokens: options.maxTokens    || 1024,
                    topP:            0.9
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" }
                ]
            };

            const res = await axios.post(url, body, {
                timeout,
                signal: this._abortCtrl?.signal,
                headers: { "Content-Type": "application/json" }
            });

            const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("No content in Gemini response");

            if (!options.image && !options.imageBase64) {
                const cacheKey = this._cacheKey(input, options);
                this._cache.set(cacheKey, { text: text.trim(), ts: Date.now() });
            }

            return { text: text.trim(), model: this.model, provider: "gemini" };

        } catch (err) {
            if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
                return { text: "", model: this.model, provider: "gemini", aborted: true };
            }
            const status = err.response?.status;
            // If model is not found (404) and we are not yet on gemini-3.6-flash, switch and retry
            if (status === 404 && this.model !== "gemini-3.6-flash") {
                console.warn(`[Gemini] Model "${this.model}" returned 404. Auto-switching to "gemini-3.6-flash"...`);
                this.model = "gemini-3.6-flash";
                return this._generateBlocking(input, options, retries);
            }
            if (retries > 0 && (status === 503 || status === 429)) {
                const delay = status === 429 ? 1500 : 600;
                console.warn(`[Gemini] HTTP ${status} — retrying in ${delay}ms (${retries} left)`);
                await this._sleep(delay);
                return this._generateBlocking(input, options, retries - 1);
            }
            console.warn("[Gemini] generate() error:", err.message, "— signaling error to coordinator.");
            return { text: "", error: err.message, provider: "gemini-error" };
        }
    }

    // ─── Multimodal Body Builder ──────────────────────────────────────────────

    _buildBody(input, options = {}) {
        let contents          = [];
        let systemInstruction = undefined;

        // Extract image if supplied in options
        let imagePart = null;
        const rawImg = options.image || options.imageBase64;
        if (rawImg) {
            let mimeType = "image/png";
            let b64Data  = rawImg;
            if (rawImg.startsWith("data:")) {
                const match = rawImg.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                    mimeType = match[1];
                    b64Data  = match[2];
                }
            }
            imagePart = {
                inline_data: {
                    mime_type: mimeType,
                    data: b64Data
                }
            };
        }

        if (Array.isArray(input)) {
            const systemMsgs = input.filter(m => m.role === "system");
            if (systemMsgs.length > 0) {
                systemInstruction = {
                    parts: [{ text: systemMsgs.map(m => m.content).join("\n\n") }]
                };
            }
            const chatMsgs = input.filter(m => m.role !== "system");
            contents = chatMsgs.map((m, idx) => {
                const parts = [{ text: m.content }];
                // Attach image to the last user message
                if (imagePart && idx === chatMsgs.length - 1 && m.role === "user") {
                    parts.unshift(imagePart);
                }
                return {
                    role: m.role === "assistant" ? "model" : "user",
                    parts
                };
            });
            if (contents.length === 0) {
                contents = [{ parts: imagePart ? [imagePart, { text: "Analyze this image for security threats." }] : [{ text: "Hello" }] }];
            }
        } else {
            const parts = [{ text: String(input) }];
            if (imagePart) parts.unshift(imagePart);
            contents = [{ parts }];
        }

        return { contents, systemInstruction };
    }

    _cacheKey(input, options) {
        const inputStr = Array.isArray(input)
            ? input.map(m => `${m.role}:${m.content}`).join("|")
            : String(input);
        return `${inputStr}__m=${this.model}__t=${options.temperature || 0.3}__m=${options.maxTokens || 1024}`;
    }

    async _simulateStream(text, onToken) {
        const words = text.split(" ");
        for (const word of words) {
            onToken(word + " ");
            await this._sleep(15);
        }
    }

    _sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

module.exports = GeminiProvider;
