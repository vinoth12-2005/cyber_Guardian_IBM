/**
 * AIEngine  ─  FlotBot Dual-Provider AI Coordinator
 * ─────────────────────────────────────────────────────────
 * Features:
 *  • DUAL AI SUPPORT:
 *    - Powerful Offline Local AI (Ollama: llama3.3, llama3.2, deepseek-r1, qwen2.5, mistral, etc.)
 *    - Powerful Online Cloud AI (Google Gemini 2.0 Flash / Pro with Multimodal Vision)
 *  • 3 FLEXIBLE MODES:
 *    1. "auto"    ─ Smart Hybrid: Local analysis stays private on Ollama, web & vision & chat to Gemini
 *    2. "offline" ─ 100% Local: All tasks use Ollama (No internet data sent)
 *    3. "online"  ─ Cloud-First: Uses Gemini for all conversations, vision, and threat intelligence
 *  • REAL URL & PHISHING TELEMETRY INTEGRATION:
 *    - Automatically correlates user URLs with URLEngine findings
 *    - Explains exact domain reputation, HTTP/HTTPS security, and lookalikes
 *  • REAL-TIME STREAMING: Token-by-token word stream push
 */

const MockProvider = require("../../providers/MockProvider");
const URLEngine = require("../detection/URLEngine");

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_SESSION_MESSAGES = 24;

// Online queries requiring real-time web/threat data
const ONLINE_INTENT_REGEX =
    /\b(latest news|current news|today's news|new cve|latest vulnerability|live threat feed|weather|stock price|trending|what's happening|search the web|google|browse|check website|lookup ip|lookup domain|check url|virustotal|shodan|whois|nmap online|public ip|geolocation|translate|news about|current events|this week|this month|real-time web)\b/i;

// Heavy local analysis
const ANALYSIS_INTENT_REGEX =
    /\b(analyze|analyse|scan all|full report|deep scan|every process|all connections|baseline|correlate|forensic|investigate|deep dive|audit|threads|thread count)\b/i;

// Threat/alert intent
const ALERT_INTENT_REGEX =
    /\b(explain alert|active alert|this alert|alert details|why alert|threat #|alert #|kill process|quarantine|contain threat)\b/i;

const EXPLAINER_SYSTEM_PROMPT =
    "You are FlotBot, an expert cybersecurity AI security analyst. " +
    "Provide clear, crisp, and direct security explanations. " +
    "Explain what is happening, why it is dangerous or safe, and what exact action or command to take. " +
    "Use only real provided telemetry. Be extremely direct, clear, and helpful.";

const TUTOR_SYSTEM_PROMPT =
    "You are FlotBot, a premier AI cybersecurity analyst and endpoint defender.\n" +
    "Your objective is to provide authoritative, accurate, and context-grounded security explanations.\n\n" +
    "CORE PRINCIPLES:\n" +
    "1. ACCURACY & GROUNDING: Ground all answers in real telemetry. Never make up fake alerts or mix unrelated threat alerts into URL or general questions.\n" +
    "2. CLEAR STRUCTURE: Use clean Markdown with headings, bullet points, bold key terms, and risk ratings.\n" +
    "3. ACTIONABLE GUIDANCE: Give clear, concrete advice and exact safe terminal commands where appropriate.\n" +
    "4. ADAPTIVE DEPTH: If the user asks for details or asks 'why', provide a comprehensive, educational explanation.";

// ─── AIEngine ────────────────────────────────────────────────────────────────

class AIEngine {

    /**
     * @param {object} options
     * @param {object} options.chatProvider     - GeminiProvider instance
     * @param {object} options.analysisProvider - OllamaProvider instance
     * @param {string} options.mode             - "auto" | "online" | "offline"
     */
    constructor({ chatProvider, analysisProvider, mode = "auto" } = {}) {
        this._mock            = new MockProvider();
        this.chatProvider     = chatProvider     || this._mock;
        this.analysisProvider = analysisProvider || this._mock;
        this.mode             = mode; // "auto" | "online" | "offline"

        /** Active chat sessions: sessionId → [{role, content}] */
        this.sessions     = new Map();

        /** Explain cache: cacheKey → {explanation, ts} */
        this.explainCache = new Map();
        this._explainCacheTTL = 120_000; // 2 min

        /** Latency log for diagnostics */
        this._latencyLog  = [];
    }

    // ═══════════════════════════════════════════════════════════
    //  INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    async initialize() {
        console.log("[AIEngine] Initializing AI providers in parallel...");
        await Promise.allSettled([
            this.chatProvider.initialize(),
            this.analysisProvider.initialize()
        ]);
        const chatInfo     = this.chatProvider.getProviderInfo();
        const analysisInfo = this.analysisProvider.getProviderInfo();
        console.log(`[AIEngine] Online/Chat Provider:     ${chatInfo.provider} (${chatInfo.model}) ready=${chatInfo.ready}`);
        console.log(`[AIEngine] Offline/Analysis Provider: ${analysisInfo.provider} (${analysisInfo.model}) ready=${analysisInfo.ready}`);
    }

    // ═══════════════════════════════════════════════════════════
    //  MODE SWITCHING (MILLISECOND RUNTIME SWITCH)
    // ═══════════════════════════════════════════════════════════

    setMode(mode) {
        if (!["auto", "online", "offline"].includes(mode)) {
            throw new Error(`Invalid AI mode: "${mode}". Valid modes: "auto", "online", "offline".`);
        }
        this.mode = mode;
        console.log(`[AIEngine] AI Mode switched to: ${mode.toUpperCase()}`);
        return { success: true, mode: this.mode };
    }

    getMode() {
        return this.mode;
    }

    getHealthStatus() {
        return {
            mode: this.mode,
            onlineReady: this.chatProvider ? this.chatProvider.ready : false,
            offlineReady: this.analysisProvider ? this.analysisProvider.ready : false,
            chatProviderName: this.chatProvider ? this.chatProvider.name || this.chatProvider.constructor.name : "None",
            analysisProviderName: this.analysisProvider ? this.analysisProvider.name || this.analysisProvider.constructor.name : "None"
        };
    }

    getStatus() {
        const chatInfo     = this.chatProvider.getProviderInfo ? this.chatProvider.getProviderInfo() : { provider: "mock", model: "mock", ready: true };
        const analysisInfo = this.analysisProvider.getProviderInfo ? this.analysisProvider.getProviderInfo() : { provider: "mock", model: "mock", ready: true };
        return {
            mode:     this.mode,
            chat:     chatInfo,
            analysis: analysisInfo,
            active:   this.mode === "offline" ? analysisInfo : (this.mode === "online" ? chatInfo : { provider: "auto-hybrid", model: `${chatInfo.model} + ${analysisInfo.model}` }),
            latency:  this._latencyLog || []
        };
    }

    getProviderInfo() {
        return this.getStatus();
    }

    async listAvailableModels() {
        const [geminiModels, ollamaModels] = await Promise.all([
            this.chatProvider.listModels ? this.chatProvider.listModels() : [],
            this.analysisProvider.listModels ? this.analysisProvider.listModels() : []
        ]);
        const gList = Array.isArray(geminiModels) && geminiModels.length > 0 ? geminiModels : ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
        return {
            gemini: {
                active: this.chatProvider.model || "gemini-2.0-flash",
                models: gList
            },
            ollama: {
                active: this.analysisProvider.model || "qwen2.5:3b",
                models: Array.isArray(ollamaModels) ? ollamaModels : []
            }
        };
    }

    async setModel(providerType, modelName) {
        if (providerType === "gemini" && this.chatProvider.setModel) {
            await this.chatProvider.setModel(modelName);
            console.log(`[AIEngine] Gemini model updated to: ${modelName}`);
        } else if (providerType === "ollama" && this.analysisProvider.setModel) {
            await this.analysisProvider.setModel(modelName);
            console.log(`[AIEngine] Ollama model updated to: ${modelName}`);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  MAIN CHAT PIPELINE
    // ═══════════════════════════════════════════════════════════

    async chat(sessionId, message, context = {}, options = {}) {
        const t0 = Date.now();
        try {
            if (!this.sessions.has(sessionId)) {
                this.sessions.set(sessionId, []);
            }
            const history = this.sessions.get(sessionId);

            // ─── Check for Chat Slash Commands ───────────────────────────────
            const trimmedMsg = (message || "").trim();
            if (trimmedMsg.startsWith("/")) {
                const parts = trimmedMsg.split(/\s+/);
                const cmd = parts[0].toLowerCase();
                const arg = parts[1]?.toLowerCase();

                if (cmd === "/mode") {
                    if (["offline", "online", "auto"].includes(arg)) {
                        this.setMode(arg);
                        const label = arg === "offline" ? "🔒 Offline Local AI (Ollama)" :
                                      arg === "online"  ? "⚡ Online Cloud AI (Gemini)" :
                                                          "🧠 Auto Smart Hybrid";
                        const reply = `Switched AI mode to **${label}**. All future prompts will be routed accordingly.`;
                        if (options.onToken) await this._simulateStream(reply, options.onToken);
                        return { success: true, reply, provider: "system", mode: this.mode };
                    } else {
                        const reply = `Current mode is **${this.mode.toUpperCase()}**. Usage: \`/mode offline\`, \`/mode online\`, or \`/mode auto\`.`;
                        if (options.onToken) await this._simulateStream(reply, options.onToken);
                        return { success: true, reply, provider: "system", mode: this.mode };
                    }
                } else if (cmd === "/models" || cmd === "/model") {
                    if (arg) {
                        if (arg.startsWith("gemini")) {
                            await this.setModel("gemini", arg);
                        } else {
                            await this.setModel("ollama", arg);
                        }
                        const reply = `Active model updated to **${arg}**.`;
                        if (options.onToken) await this._simulateStream(reply, options.onToken);
                        return { success: true, reply, provider: "system" };
                    } else {
                        const modelList = await this.listAvailableModels();
                        const reply = `🤖 **Available AI Models:**\n- **Online (Gemini):** ${modelList.gemini.active} (Available: ${modelList.gemini.models.join(", ")})\n- **Offline (Ollama):** ${modelList.ollama.active} (Installed: ${modelList.ollama.models.join(", ") || "None detected"})\n- Switch via: \`/model <name>\` or \`/mode <offline|online|auto>\``;
                        if (options.onToken) await this._simulateStream(reply, options.onToken);
                        return { success: true, reply, provider: "system" };
                    }
                }
            }

            // ─── Instant Response Engine (< 100ms latency for quick greetings) ────────
            const cleanMsg = message.trim().toLowerCase().replace(/[^\w\s]/g, "");
            const INSTANT_RESPONSES = {
                "hi": "👋 Hello! I'm FlotBot, your AI cybersecurity analyst. How can I protect your system today?",
                "hello": "👋 Hello there! FlotBot is active and monitoring your endpoints. What would you like to inspect?",
                "hey": "👋 Hey! FlotBot here. Shields are active. Ask me about running processes, network connections, or screen audits.",
                "yo": "👋 Yo! FlotBot is online. Ask me about active process threads, recent socket connections, or malicious file scans.",
                "good morning": "🌅 Good morning! System security monitors are operational. How can I assist you?",
                "good evening": "🌆 Good evening! FlotBot is on guard. Ask me to audit your system or check threat levels.",
                "how are you": "🛡️ All security engines are running smoothly! Ready to analyze threats, process threads, or screens.",
                "who are you": "🤖 I'm FlotBot — your high-speed cross-platform AI security assistant, supporting both Offline (Ollama) and Online (Gemini) intelligence.",
                "help": "🛡️ I can perform deep file audits, inspect process threads, analyze screenshots for visual threats, explain alerts, and block malicious IPs or processes."
            };

            if (INSTANT_RESPONSES[cleanMsg]) {
                const replyText = INSTANT_RESPONSES[cleanMsg];
                if (options.onToken) {
                    await this._simulateStream(replyText, options.onToken);
                }
                history.push({ role: "user", content: message });
                history.push({ role: "assistant", content: replyText });
                const latencyMs = Date.now() - t0;
                this._recordLatency("instant", latencyMs);
                return {
                    success: true,
                    reply: replyText,
                    history: [...history],
                    provider: "instant",
                    latencyMs
                };
            }

            // ─── Route Provider Based on Active Mode ───────────────────────
            const provider = this._routeChat(message, context, options);
            const messages = this._buildChatMessages(message, history, context);
            const genOpts  = {
                temperature: 0.25,
                maxTokens:   650,
                onToken:     options.onToken || null,
                image:       options.image || options.imageBase64 || null
            };

            let response = await provider.generate(messages, genOpts);

            if (response.aborted) {
                return { success: false, reply: "", aborted: true };
            }

            // If primary provider produced an empty response, fallback gracefully
            if (!response.text || response.text.trim().length === 0) {
                console.warn("[AIEngine] Primary provider empty response, trying alternate fallback...");
                const fallbackProvider = (provider === this.chatProvider) ? this.analysisProvider : this.chatProvider;
                if (fallbackProvider && fallbackProvider !== provider) {
                    response = await fallbackProvider.generate(messages, genOpts);
                }
            }

            history.push({ role: "user", content: message });
            history.push({ role: "assistant", content: response.text });
            while (history.length > MAX_SESSION_MESSAGES) history.shift();

            const latencyMs = Date.now() - t0;
            this._recordLatency(response.provider, latencyMs);

            return {
                success:   true,
                reply:     response.text,
                history:   [...history],
                provider:  response.provider,
                latencyMs,
                mode:      this.mode
            };

        } catch (err) {
            console.error("[AIEngine] chat() error:", err.message);
            return { success: false, error: `Error: ${err.message}`, reply: `Error: ${err.message}` };
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  SCREEN VISION & MULTIMODAL THREAT ANALYSIS
    // ═══════════════════════════════════════════════════════════

    /**
     * Deep analysis of a real screenshot + open windows for visual security threats.
     */
    async analyzeScreen({ imageBase64 = "", ocrText = "", windowTitle = "", visibleUrl = "", windows = [] }, options = {}) {
        const t0 = Date.now();
        try {
            const openWinStr = Array.isArray(windows) && windows.length > 0
                ? windows.slice(0, 10).map(w => `- ${w.name || "App"} (PID: ${w.pid || "N/A"}, Title: "${w.windowTitle || w.title || ""}")`).join("\n")
                : "None";

            const prompt =
                `You are FlotBot visual cybersecurity analyst. Inspect this desktop screenshot and active window context for security threats.\n\n` +
                `ACTIVE OPEN WINDOWS:\n${openWinStr}\n\n` +
                `FOCUS WINDOW: ${windowTitle || "Desktop"}\n` +
                `URL / CONTEXT: ${visibleUrl || "Local Desktop"}\n\n` +
                `TASK: Provide a sharp, concise 2-part security assessment:\n` +
                `1. 👁️ **Visual Inspection Summary:** Describe visible applications, active sites, or command shells.\n` +
                `2. 🛡️ **Threat Assessment:** Check for visual phishing indicators, fake security alert dialogs, suspicious command windows (PowerShell/cmd), unauthorized remote tools, or credential input on non-HTTPS sites. State clearly whether the screen is SAFE or THREAT DETECTED.`;

            const messages = [
                { role: "system", content: "You are FlotBot, a visual security analyst. Be concise, sharp, and accurate." },
                { role: "user",   content: prompt }
            ];

            const provider = (this.mode === "offline" || !this.chatProvider.ready)
                ? this.analysisProvider
                : this.chatProvider;

            const response = await provider.generate(messages, {
                temperature: 0.2,
                maxTokens:   500,
                image:       imageBase64 || null
            });

            const latencyMs = Date.now() - t0;
            this._recordLatency("vision/" + response.provider, latencyMs);

            return {
                success:  true,
                analysis: response.text,
                provider: response.provider,
                latencyMs
            };

        } catch (err) {
            console.error("[AIEngine] analyzeScreen() error:", err.message);
            return { success: false, error: `Error: ${err.message}`, analysis: `Error: ${err.message}` };
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  THREAD FORENSIC ANALYSIS
    // ═══════════════════════════════════════════════════════════

    async analyzeThreads(anomalousProcesses, context = {}) {
        const t0 = Date.now();
        try {
            const procSummary = anomalousProcesses.map(p =>
                `- PID ${p.pid} (${p.name}): ${p.threadCount} threads, ${p.cpu}% CPU | Reasons: ${p.reasons.join("; ")}`
            ).join("\n");

            const prompt =
                `You are FlotBot process forensics specialist. Analyze these anomalous process thread patterns:\n\n` +
                `${procSummary}\n\n` +
                `Total system processes audited: ${context.processCount || 30}\n\n` +
                `TASK: Provide a concise forensic diagnosis:\n` +
                `1. **Root Cause Diagnosis:** Explain why these thread patterns are abnormal (e.g. multi-threaded cryptomining, thread injection, worker thread exhaustion).\n` +
                `2. **Remediation Commands:** Provide the exact termination and audit command for the user's OS.`;

            const messages = [
                { role: "system", content: "You are FlotBot, a process forensics analyst. Provide exact technical guidance." },
                { role: "user",   content: prompt }
            ];

            const provider = this.analysisProvider.ready ? this.analysisProvider : this.chatProvider;
            const response = await provider.generate(messages, { temperature: 0.2, maxTokens: 400 });

            const latencyMs = Date.now() - t0;
            this._recordLatency("threads/" + response.provider, latencyMs);

            return {
                success:  true,
                analysis: response.text,
                provider: response.provider,
                latencyMs
            };
        } catch (err) {
            console.error("[AIEngine] analyzeThreads() error:", err.message);
            return { success: false, error: `Error: ${err.message}` };
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  ALERT EXPLANATION WITH INTELLIGENT CACHING
    // ═══════════════════════════════════════════════════════════

    async explainAlert(alert, options = {}) {
        const t0 = Date.now();
        try {
            const cacheKey = `${alert.id || alert.title}_${alert.severity}_${alert.process || ""}`;
            if (this.explainCache.has(cacheKey)) {
                const cached = this.explainCache.get(cacheKey);
                if (Date.now() - cached.ts < this._explainCacheTTL) {
                    if (options.onToken) {
                        await this._simulateStream(cached.explanation, options.onToken);
                    }
                    return {
                        success:     true,
                        explanation: cached.explanation,
                        cached:      true,
                        latencyMs:   Date.now() - t0
                    };
                }
            }

            const prompt = this._buildExplainPrompt(alert);
            const messages = [
                { role: "system", content: EXPLAINER_SYSTEM_PROMPT },
                { role: "user",   content: prompt }
            ];

            const provider = (this.mode === "offline" || !this.chatProvider.ready)
                ? this.analysisProvider
                : this.chatProvider;

            const response = await provider.generate(messages, {
                temperature: 0.2,
                maxTokens:   350,
                onToken:     options.onToken || null
            });

            this.explainCache.set(cacheKey, { explanation: response.text, ts: Date.now() });

            const latencyMs = Date.now() - t0;
            this._recordLatency("explain/" + response.provider, latencyMs);

            return {
                success:     true,
                explanation: response.text,
                provider:    response.provider,
                cached:      false,
                latencyMs
            };

        } catch (err) {
            console.error("[AIEngine] explainAlert() error:", err.message);
            return { success: false, error: `Error: ${err.message}`, explanation: `Error: ${err.message}` };
        }
    }

    _buildExplainPrompt(alert) {
        const evidenceStr = this._formatSpecificAlertEvidence(alert);
        return `Analyze this security alert:\n` +
               `- Threat Title: ${alert.title}\n` +
               `- Severity: ${alert.severity}\n` +
               `- Process / Entity: ${alert.process || "N/A"} (PID: ${alert.pid || "N/A"})\n` +
               `- Evidence: ${evidenceStr}\n` +
               `- Category: ${alert.category || "SYSTEM"}\n\n` +
               `Explain in 3 distinct sections:\n` +
               `1. ⚠️ **What Happened**: Clear breakdown of the detected event.\n` +
               `2. 🎯 **Why It's Dangerous / Risk Assessment**: Specific threat potential.\n` +
               `3. 🛠️ **Recommended Fix**: Step-by-step resolution command.`;
    }

    // ═══════════════════════════════════════════════════════════
    //  THREAT DETECTIONS AGGREGATOR
    // ═══════════════════════════════════════════════════════════

    async analyzeThreats(alerts, context = {}) {
        const t0 = Date.now();
        try {
            if (!alerts || alerts.length === 0) {
                return {
                    success:         true,
                    score:           0,
                    summary:         "✅ All monitored system telemetry is clean. No active threats detected.",
                    recommendations: ["Maintain standard security practices.", "Keep software and OS updated."],
                    latencyMs:       0
                };
            }

            const prompt = this._buildThreatPrompt(alerts, context);
            const provider = (this.mode === "online" && this.chatProvider.ready)
                ? this.chatProvider
                : this.analysisProvider;

            const response = await provider.generate(prompt, {
                temperature: 0.2,
                maxTokens:   600
            });

            const latencyMs = Date.now() - t0;
            this._recordLatency("analysis/" + response.provider, latencyMs);

            return {
                success:         true,
                score:           this._extractScore(response.text),
                summary:         response.text,
                recommendations: this._extractRecommendations(response.text),
                latencyMs
            };

        } catch (err) {
            console.error("[AIEngine] analyzeThreats() error:", err.message);
            return { success: false, error: `Error: ${err.message}`, score: 0, summary: `Error: ${err.message}`, recommendations: [] };
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  SMART ROUTER
    // ═══════════════════════════════════════════════════════════

    _routeChat(message, context, options = {}) {
        const lowerMsg = (message || "").toLowerCase();

        // 1. Explicit Offline Mode: Always use Ollama
        if (this.mode === "offline") {
            return this.analysisProvider;
        }

        // 2. Explicit Online Mode: Always use Gemini
        if (this.mode === "online") {
            return this.chatProvider.ready ? this.chatProvider : this.analysisProvider;
        }

        // 3. Auto Smart Hybrid Mode:
        if (options.image || options.imageBase64) {
            return this.chatProvider.ready ? this.chatProvider : this.analysisProvider;
        }

        if (ONLINE_INTENT_REGEX.test(lowerMsg)) {
            return this.chatProvider.ready ? this.chatProvider : this.analysisProvider;
        }

        if (ANALYSIS_INTENT_REGEX.test(lowerMsg)) {
            return this.analysisProvider;
        }

        return this.chatProvider.ready ? this.chatProvider : this.analysisProvider;
    }

    // ═══════════════════════════════════════════════════════════
    //  PROMPT BUILDER & HELPERS
    // ═══════════════════════════════════════════════════════════

    _buildChatMessages(message, history, context) {
        const lowerMsg = (message || "").toLowerCase().trim();

        const isGreeting = /^(hello|hi|hey|greetings|good morning|good evening|howdy|who are you|what are you)\b/i.test(lowerMsg);

        let systemPrompt    = TUTOR_SYSTEM_PROMPT;
        let contextAddition = "";

        // ─── 1. Check for URL Analysis Request ─────────────────────────────
        const urlMatch = message.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/i);
        let discussedUrl = null;

        if (urlMatch) {
            discussedUrl = urlMatch[0];
        } else if (history && history.length > 0) {
            // Check if recent conversation was about a URL
            for (let i = history.length - 1; i >= Math.max(0, history.length - 4); i--) {
                const prev = history[i].content || "";
                const prevMatch = prev.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/i);
                if (prevMatch && !prevMatch[0].includes("flotbot") && !prevMatch[0].includes("127.0.0.1")) {
                    discussedUrl = prevMatch[0];
                    break;
                }
            }
        }

        if (discussedUrl && (urlMatch || /\b(url|site|page|website|link|click|suspicious|safe|benign|mcafee|domain)\b/i.test(lowerMsg))) {
            const urlReport = URLEngine.analyze(discussedUrl);
            const isMcafeeTestSite = discussedUrl.toLowerCase().includes("testingmcafeesites.com");

            contextAddition +=
                `\n\n[VERIFIED URL THREAT ENGINE TELEMETRY:` +
                `\n- Target URL: ${urlReport.url}` +
                `\n- Registered Domain: ${urlReport.domain}` +
                `\n- Transport Protocol: ${urlReport.protocol.toUpperCase()} (${urlReport.protocol === 'https' ? 'TLS/SSL Encrypted' : 'Insecure Plaintext HTTP'})` +
                `\n- Risk Score: ${urlReport.score}/100 (Classification: ${urlReport.riskLevel})` +
                `\n- Safety Warnings: ${urlReport.warnings.join("; ") || "None (Domain structure clean)"}` +
                `\n- Phishing Impersonation: ${urlReport.isPhishing ? "YES" : "NO"}` +
                (isMcafeeTestSite ? `\n- Domain Intelligence Note: "testingmcafeesites.com" is an official, legitimate test domain run by McAfee/Trellix used by security tools to test URL filtering. It is NOT malicious malware or ransomware.` : "") +
                `\n- INSTRUCTION: Focus your answer specifically on this URL (${urlReport.domain}). Explain clearly what the site is, its transport security, whether it is safe or risky, and answer the user's question directly. DO NOT cite unrelated mass file modifications or system alerts unless asked.]`;
        }
        // ─── 2. Check for Specific Alert Explanation Request ──────────────
        else if (context.focusedAlert || (ALERT_INTENT_REGEX.test(lowerMsg) && context.alerts && context.alerts.length > 0)) {
            const alert = context.focusedAlert || context.alerts[0];
            const alertEvidence = this._formatSpecificAlertEvidence(alert);

            contextAddition +=
                `\n\n[ACTIVE SECURITY ALERT CONTEXT:` +
                `\n- Threat Title: ${alert.title}` +
                `\n- Severity: ${alert.severity}` +
                `\n- Category: ${alert.category || "SECURITY"}` +
                `\n- Evidence: ${alertEvidence}` +
                `\n- Recommendation: ${alert.recommendation || "Inspect and verify authorization."}` +
                `\n- INSTRUCTION: Explain this specific alert clearly, why it was triggered, and how to verify or resolve it.]`;
        }
        // ─── 3. Active Window Context for Desktop Questions ───────────────
        else if (/\b(apps?|programs?|windows?|running|open|screen|desktop)\b/i.test(lowerMsg)
            && context.windows && context.windows.length > 0) {
            const cleanList = [...new Set(
                context.windows.slice(0, 12).map(w => `${w.name || 'App'} (${w.title || w.windowTitle || 'Window'})`).filter(Boolean)
            )].join(", ");
            if (cleanList) {
                contextAddition += `\n\n[Active desktop windows: ${cleanList}]`;
            }
        }

        // ─── 4. Real-time System Telemetry ────────────────────────────────
        if (!isGreeting && context.telemetry && /\b(system|cpu|ram|telemetry|firewall|ports|sockets|spec)\b/i.test(lowerMsg)) {
            const t = context.telemetry;
            contextAddition +=
                `\n\n[REAL-TIME SYSTEM TELEMETRY:` +
                `\n- OS: ${t.osName} (${t.arch}) | Hostname: ${t.hostname} | CPU: ${t.cpuModel} (${t.cpuCores} cores) | RAM Free: ${t.ramFree} of ${t.ramTotal}` +
                `\n- Security Posture: Firewall: ${t.firewall} | ${t.processCount} running processes | ${t.connectionCount} active sockets]`;
        }

        const structuredMessages = [{ role: "system", content: systemPrompt }];
        const recentHistory = (history || []).slice(-6);
        for (const h of recentHistory) {
            structuredMessages.push({
                role:    h.role === "assistant" ? "assistant" : "user",
                content: h.content
            });
        }

        structuredMessages.push({
            role:    "user",
            content: `${message}${contextAddition}`
        });

        return structuredMessages;
    }

    _formatSpecificAlertEvidence(alert) {
        if (!alert) return "None";
        const parts = [];
        const ev    = alert.evidence || {};
        if (ev.process || alert.process)     parts.push(`Process: ${ev.process || alert.process} (PID: ${ev.pid || alert.pid || "N/A"})`);
        if (ev.parentProcess)                parts.push(`Parent: ${ev.parentProcess}`);
        if (ev.filePath)                     parts.push(`File: ${ev.filePath}`);
        if (ev.remoteAddress)                parts.push(`Destination IP: ${ev.remoteAddress}:${ev.remotePort || ""}`);
        if (ev.cmdLine)                      parts.push(`Command: ${ev.cmdLine}`);
        return parts.length > 0 ? parts.join(", ") : (alert.description || "N/A");
    }

    _buildThreatPrompt(detections, context) {
        const threatList = detections.slice(0, 10).map((d, i) =>
            `  [${i + 1}] [${d.severity || "UNKNOWN"}] ${d.title} — ${d.source || "?"} | ${d.description || ""}`
        ).join("\n");

        const processCount    = (context.processes   || []).length;
        const connectionCount = (context.connections || []).length;

        return `You are an AI threat analyst. Analyze these security detections:\n\n` +
               `ACTIVE DETECTIONS (${detections.length} total):\n${threatList}\n\n` +
               `SYSTEM CONTEXT: Processes: ${processCount}, Sockets: ${connectionCount}\n\n` +
               `Provide:\n1. Overall threat score (0-100)\n2. Summary of risk\n3. Top 3 mitigation actions\nFormat score as: SCORE: <number>`;
    }

    _extractScore(text) {
        const match = (text || "").match(/SCORE:\s*(\d+)/i);
        if (match) return Math.min(100, Math.max(0, parseInt(match[1], 10)));
        if (/critical|severe|high risk|ransomware/i.test(text)) return 75;
        if (/suspicious|warning/i.test(text))                  return 40;
        return 10;
    }

    _extractRecommendations(text) {
        return (text || "").split("\n")
            .filter(l => /^[\d\-\*\•]/.test(l.trim()) && l.trim().length > 10)
            .slice(0, 5)
            .map(l => l.replace(/^[\d\.\-\*\•]+\s*/, "").trim());
    }

    _recordLatency(provider, ms) {
        this._latencyLog.push({ provider, ms, ts: Date.now() });
        if (this._latencyLog.length > 20) this._latencyLog.shift();
        console.log(`[AIEngine] ${provider} responded in ${ms}ms`);
    }

    async _simulateStream(text, onToken) {
        const words = text.split(" ");
        for (const word of words) {
            onToken(word + " ");
            await this._sleep(14);
        }
    }

    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

module.exports = AIEngine;
