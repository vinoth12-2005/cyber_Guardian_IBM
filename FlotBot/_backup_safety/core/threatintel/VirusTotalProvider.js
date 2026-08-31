const axios = require("axios");
const ThreatIntelProvider = require("./ThreatIntelProvider");

/**
 * VirusTotalProvider
 * ─────────────────────────────────────────────────────────────
 * Cloud threat intelligence provider querying VirusTotal v3 REST API.
 * Uses hash lookup first before any file upload, handles 429 rate limits,
 * timeouts, and graceful offline fallback.
 */
class VirusTotalProvider extends ThreatIntelProvider {

    constructor(apiKey = null) {
        super("VirusTotal");
        this.apiKey = apiKey || process.env.VIRUSTOTAL_API_KEY || "";
        this.baseUrl = "https://www.virustotal.com/api/v3";
        this.ready = !!(this.apiKey && this.apiKey.trim().length > 10);
    }

    async lookupHash(sha256) {
        if (!this.ready || !sha256) return null;
        try {
            const url = `${this.baseUrl}/files/${sha256}`;
            const res = await axios.get(url, {
                headers: { "x-apikey": this.apiKey },
                timeout: 7000
            });

            const stats = res.data?.data?.attributes?.last_analysis_stats || {};
            const malicious = stats.malicious || 0;
            const suspicious = stats.suspicious || 0;
            const total = Object.values(stats).reduce((a, b) => a + b, 0);

            return {
                provider: "VirusTotal",
                indicator: sha256,
                type: "hash",
                verdict: malicious > 3 ? "MALICIOUS" : malicious > 0 ? "SUSPICIOUS" : "CLEAN",
                maliciousCount: malicious,
                suspiciousCount: suspicious,
                totalEngines: total,
                permalink: `https://www.virustotal.com/gui/file/${sha256}`,
                confidence: Math.min(1.0, (malicious + suspicious) / Math.max(1, total || 70))
            };

        } catch (err) {
            if (err.response?.status === 404) {
                return {
                    provider: "VirusTotal",
                    indicator: sha256,
                    type: "hash",
                    verdict: "UNKNOWN",
                    details: "Hash not found in VirusTotal database"
                };
            }
            if (err.response?.status === 429) {
                console.warn("[VirusTotal] Rate limit exceeded (HTTP 429)");
                throw new Error("VIRUSTOTAL_RATE_LIMIT");
            }
            return null;
        }
    }

    async lookupIP(ip) {
        if (!this.ready || !ip) return null;
        try {
            const url = `${this.baseUrl}/ip_addresses/${ip}`;
            const res = await axios.get(url, {
                headers: { "x-apikey": this.apiKey },
                timeout: 7000
            });

            const stats = res.data?.data?.attributes?.last_analysis_stats || {};
            const malicious = stats.malicious || 0;
            return {
                provider: "VirusTotal",
                indicator: ip,
                type: "ip",
                verdict: malicious > 2 ? "MALICIOUS" : malicious > 0 ? "SUSPICIOUS" : "CLEAN",
                maliciousCount: malicious
            };
        } catch {
            return null;
        }
    }

    async lookupDomain(domain) {
        if (!this.ready || !domain) return null;
        try {
            const url = `${this.baseUrl}/domains/${domain}`;
            const res = await axios.get(url, {
                headers: { "x-apikey": this.apiKey },
                timeout: 7000
            });

            const stats = res.data?.data?.attributes?.last_analysis_stats || {};
            const malicious = stats.malicious || 0;
            return {
                provider: "VirusTotal",
                indicator: domain,
                type: "domain",
                verdict: malicious > 2 ? "MALICIOUS" : malicious > 0 ? "SUSPICIOUS" : "CLEAN",
                maliciousCount: malicious
            };
        } catch {
            return null;
        }
    }
}

module.exports = VirusTotalProvider;
