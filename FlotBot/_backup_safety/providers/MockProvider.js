/**
 * MockProvider — Honest Offline Fallback
 * ─────────────────────────────────────────────────────────
 * Used ONLY when BOTH Gemini and Ollama are unavailable.
 *
 * This provider does NOT return fake or canned responses.
 * It tells the user exactly what is wrong and how to fix it.
 * All responses are honest, polite, and actionable.
 */
class MockProvider {

    constructor() {
        this.ready    = true;
        this.model    = "offline-fallback";
        this.provider = "offline";
    }

    async initialize() {
        console.log("[Offline] Fallback provider ready — both Gemini and Ollama are unreachable.");
    }

    async healthCheck() {
        return true;
    }

    getProviderInfo() {
        return {
            provider: "Offline (No AI Available)",
            model:    "offline-fallback",
            ready:    true
        };
    }

    async generate(input, options = {}) {
        return this._offlineResponse(input, options);
    }

    _offlineResponse(input, options) {
        const userMessage = this._extractUserMessage(input);
        const lower       = userMessage.toLowerCase().trim();

        // ─── Greetings ────────────────────────────────────────────────────────
        if (/^(hello|hi|hey|greetings|good (morning|evening|afternoon))/i.test(lower)) {
            return {
                text: "👋 Hi! I'm FlotBot. Right now, both my AI providers are offline:\n\n" +
                      "• **Gemini (Cloud AI):** No API key set in `.env` or no internet connection.\n" +
                      "• **Ollama (Local AI):** Not running. Start it with: `ollama serve`\n\n" +
                      "Once either provider is available, I'll be able to answer your questions fully. " +
                      "The security monitoring modules are still running and will alert you to any threats!",
                model:    "offline-fallback",
                provider: "offline"
            };
        }

        // ─── OS / System / Laptop Info ────────────────────────────────────────
        if (/\b(os|operating system|my system|laptop|hardware|cpu|ram|specs|machine)\b/i.test(lower)) {
            const os   = require("os");
            const cpus = os.cpus() || [];
            return {
                text: "Here's what I can read directly from your system right now:\n\n" +
                      `• **Hostname:** ${os.hostname()}\n` +
                      `• **Platform:** ${process.platform} (${os.arch()})\n` +
                      `• **Kernel:** ${os.release()}\n` +
                      `• **CPU:** ${cpus[0]?.model?.trim() || "Unknown"} (${cpus.length} cores)\n` +
                      `• **RAM:** ${(os.freemem()/(1024**3)).toFixed(1)} GB free of ${(os.totalmem()/(1024**3)).toFixed(1)} GB total\n` +
                      `• **Uptime:** ${Math.floor(os.uptime()/3600)}h ${Math.floor((os.uptime()%3600)/60)}m\n\n` +
                      "⚠️ For deeper security analysis, please start Ollama (`ollama serve`) or add a `GEMINI_API_KEY` to your `.env` file.",
                model:    "offline-fallback",
                provider: "offline"
            };
        }

        // ─── Security / Alert questions ───────────────────────────────────────
        if (/\b(threat|alert|malware|virus|attack|ransomware|suspicious|safe|danger|hack)\b/i.test(lower)) {
            return {
                text: "⚠️ **AI providers are offline** — I cannot provide a full analysis right now.\n\n" +
                      "**To get a real threat analysis:**\n" +
                      "1. Start Ollama (local AI): run `ollama serve` in a terminal\n" +
                      "2. Or add your `GEMINI_API_KEY=...` to the `.env` file and restart FlotBot\n\n" +
                      "The FlotBot rule-based detection engine is still running and will create alerts automatically if threats are detected.",
                model:    "offline-fallback",
                provider: "offline"
            };
        }

        // ─── Default — honest response ────────────────────────────────────────
        return {
            text: "I'm currently in **offline mode** — both AI providers (Gemini and Ollama) are unavailable.\n\n" +
                  "**To restore full AI capability:**\n" +
                  "• **Local (no internet needed):** Run `ollama serve` and ensure a model is installed (`ollama pull llama3.1`)\n" +
                  "• **Cloud:** Add `GEMINI_API_KEY=your_key` to your `.env` file\n\n" +
                  "Security monitoring is still active in the background.",
            model:    "offline-fallback",
            provider: "offline"
        };
    }

    _extractUserMessage(input) {
        if (typeof input === "string") {
            // Extract last "User:" line if structured
            const lines = input.split("\n");
            for (let i = lines.length - 1; i >= 0; i--) {
                const m = /^User:\s*(.+)$/i.exec(lines[i]);
                if (m) return m[1].trim();
            }
            return input;
        }
        if (Array.isArray(input)) {
            const userMsgs = input.filter(m => m.role === "user");
            if (userMsgs.length > 0) return userMsgs[userMsgs.length - 1].content || "";
            if (input.length > 0)    return input[input.length - 1].content || "";
        }
        return "";
    }
}

module.exports = MockProvider;
