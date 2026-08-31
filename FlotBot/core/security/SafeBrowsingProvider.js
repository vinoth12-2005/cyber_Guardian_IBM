const axios = require("axios");
const ThreatIntelProvider = require("./ThreatIntelProvider");
const SecurityResult = require("./SecurityResult");

/**
 * SafeBrowsingProvider
 * ─────────────────────────────────────────────────────────────
 * Integration location for Google Safe Browsing v4 Threat Matches API.
 * Never logs or exposes API keys.
 */
class SafeBrowsingProvider extends ThreatIntelProvider {
    constructor(apiKey = null) {
        super("GoogleSafeBrowsing");
        this.apiKey = apiKey || process.env.GOOGLE_SAFE_BROWSING_API_KEY || "";
        this.baseUrl = "https://safebrowsing.googleapis.com/v4/threatMatches:find";
        this.ready = !!(this.apiKey && this.apiKey.trim().length > 10);
    }

    async checkUrl(urlString) {
        if (!this.ready) {
            return SecurityResult.unavailable("GoogleSafeBrowsing", "url", urlString, "GOOGLE_SAFE_BROWSING_API_KEY missing or unconfigured");
        }
        if (!urlString) {
            return SecurityResult.error("GoogleSafeBrowsing", "url", urlString, "No URL provided");
        }

        try {
            // Ensure canonical URL string
            const normalizedUrl = urlString.trim();
            const body = {
                client: {
                    clientId: "flotbot-security-assistant",
                    clientVersion: "1.0.0"
                },
                threatInfo: {
                    threatTypes: [
                        "MALWARE",
                        "SOCIAL_ENGINEERING",
                        "UNWANTED_SOFTWARE",
                        "POTENTIALLY_HARMFUL_APPLICATION"
                    ],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [{ url: normalizedUrl }]
                }
            };

            const res = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, body, {
                headers: { "Content-Type": "application/json" },
                timeout: 8000
            });

            const matches = res.data?.matches || [];
            if (matches.length > 0) {
                const threatTypes = matches.map(m => m.threatType);
                return new SecurityResult({
                    provider: "GoogleSafeBrowsing",
                    target_type: "url",
                    target: urlString,
                    status: "completed",
                    classification: "malicious",
                    confidence: 0.95,
                    detections: { malicious: matches.length, suspicious: 0, total: matches.length },
                    evidence: { matches, threatTypes }
                });
            }

            return new SecurityResult({
                provider: "GoogleSafeBrowsing",
                target_type: "url",
                target: urlString,
                status: "completed",
                classification: "no_known_threat",
                confidence: 0.8,
                detections: { malicious: 0, suspicious: 0, total: 0 },
                evidence: { details: "No matching threat entries found in Safe Browsing list" }
            });

        } catch (err) {
            const safeError = err.response?.data?.error?.message || err.message || "Safe Browsing request failed";
            console.error(`[SafeBrowsing] API Error: ${safeError} (HTTP ${err.response?.status || 'N/A'})`);
            return SecurityResult.error("GoogleSafeBrowsing", "url", urlString, safeError);
        }
    }
}

module.exports = SafeBrowsingProvider;
