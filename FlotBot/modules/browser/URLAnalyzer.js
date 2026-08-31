const URLEngine = require("../../core/detection/URLEngine");
const DetectionManager = require("../../core/security/DetectionManager");

const detectionManager = new DetectionManager();

/**
 * URLAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Inspects URLs using external security intelligence (VirusTotal + Google Safe Browsing)
 * via DetectionManager while attaching local telemetry findings.
 */
class URLAnalyzer {

    /**
     * Analyze URL safety.
     * @param {string} urlString
     * @returns {Promise<object>} { riskLevel, classification, confidence, score, reasons, warnings, recommendation, domain, protocol, isPhishing, provider_results }
     */
    static async analyze(urlString) {
        // 1. Gather local telemetry findings
        const telemetryResult = URLEngine.analyze(urlString);

        // 2. Query authoritative external security intelligence providers
        const externalCheck = await detectionManager.checkUrl(urlString);

        const reasons = [...(externalCheck.evidence || [])];
        if (telemetryResult.protocol === "https") {
            reasons.push("[Local Telemetry] HTTPS transport encryption verified.");
        }

        // Map external classification to UI risk level
        let riskLevel = "NO_AUTHORITATIVE_VERDICT";
        let isPhishing = false;

        if (externalCheck.classification === "malicious") {
            riskLevel = "CRITICAL";
            isPhishing = true;
        } else if (externalCheck.classification === "suspicious") {
            riskLevel = "HIGH";
        } else if (externalCheck.classification === "no_known_threat") {
            riskLevel = "SAFE";
        } else if (externalCheck.classification === "unavailable") {
            riskLevel = "SECURITY_SERVICE_UNAVAILABLE";
        }

        return {
            url: urlString,
            domain: telemetryResult.domain,
            protocol: telemetryResult.protocol,
            classification: externalCheck.classification,
            riskLevel,
            confidence: Math.round((externalCheck.confidence || 0) * 100),
            score: externalCheck.classification === "malicious" ? 100 : externalCheck.classification === "suspicious" ? 65 : telemetryResult.score,
            reasons,
            warnings: telemetryResult.warnings,
            isPhishing,
            mitre: telemetryResult.mitre,
            provider_results: externalCheck.provider_results,
            summary: externalCheck.summary,
            recommendation: externalCheck.classification === "malicious"
                ? "CRITICAL RISK: Confirmed malicious threat by external security intelligence. Do NOT proceed."
                : externalCheck.classification === "suspicious"
                    ? "HIGH RISK: Flagged as suspicious. Exercise caution before entering credentials."
                    : externalCheck.classification === "no_known_threat"
                        ? "No known threat indicators detected by active external security databases."
                        : "External security verification unavailable. Exercise standard security hygiene."
        };
    }
}

module.exports = URLAnalyzer;

