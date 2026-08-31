const axios = require("axios");
const ThreatIntelProvider = require("./ThreatIntelProvider");
const SecurityResult = require("./SecurityResult");

/**
 * HybridAnalysisProvider
 * ─────────────────────────────────────────────────────────────
 * Escalation provider for deeper sandbox analysis of suspicious or unknown file hashes.
 * Never logs or exposes API keys.
 */
class HybridAnalysisProvider extends ThreatIntelProvider {
    constructor(apiKey = null) {
        super("HybridAnalysis");
        this.apiKey = apiKey || process.env.HYBRID_ANALYSIS_API_KEY || "";
        this.baseUrl = "https://www.hybrid-analysis.com/api/v2";
        this.ready = !!(this.apiKey && this.apiKey.trim().length > 10);
    }

    async checkFileHash(sha256) {
        if (!this.ready) {
            return SecurityResult.unavailable("HybridAnalysis", "hash", sha256, "HYBRID_ANALYSIS_API_KEY missing or unconfigured");
        }
        if (!sha256) {
            return SecurityResult.error("HybridAnalysis", "hash", sha256, "No SHA256 provided");
        }

        try {
            const url = `${this.baseUrl}/search/hash`;
            const params = new URLSearchParams();
            params.append("hash", sha256);

            const res = await axios.post(url, params, {
                headers: {
                    "api-key": this.apiKey,
                    "user-agent": "Falcon Sandbox",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: 10000
            });

            const results = Array.isArray(res.data) ? res.data : [];
            if (results.length === 0) {
                return new SecurityResult({
                    provider: "HybridAnalysis",
                    target_type: "hash",
                    target: sha256,
                    status: "completed",
                    classification: "unknown",
                    confidence: 0.0,
                    evidence: { details: "No analysis reports found for this hash in Hybrid Analysis sandbox" }
                });
            }

            const latest = results[0];
            const verdict = (latest.verdict || "").toLowerCase();
            const threatScore = latest.threat_score || 0;

            let classification = "no_known_threat";
            if (verdict === "malicious" || threatScore >= 70) classification = "malicious";
            else if (verdict === "suspicious" || threatScore >= 40) classification = "suspicious";

            return new SecurityResult({
                provider: "HybridAnalysis",
                target_type: "hash",
                target: sha256,
                status: "completed",
                classification,
                confidence: Math.min(1.0, threatScore / 100.0),
                detections: { malicious: classification === "malicious" ? 1 : 0, suspicious: classification === "suspicious" ? 1 : 0, total: 1 },
                evidence: {
                    verdict: latest.verdict,
                    threatScore: latest.threat_score,
                    avDetect: latest.av_detect,
                    vxFamily: latest.vx_family,
                    environment: latest.environment_description
                },
                raw_reference: latest.reporturl ? `https://www.hybrid-analysis.com${latest.reporturl}` : null
            });

        } catch (err) {
            if (err.response?.status === 404) {
                return new SecurityResult({
                    provider: "HybridAnalysis",
                    target_type: "hash",
                    target: sha256,
                    status: "completed",
                    classification: "unknown",
                    evidence: { details: "Hash not found in Hybrid Analysis database" }
                });
            }
            return SecurityResult.error("HybridAnalysis", "hash", sha256, err.message || "Hybrid Analysis API request failed");
        }
    }
}

module.exports = HybridAnalysisProvider;
