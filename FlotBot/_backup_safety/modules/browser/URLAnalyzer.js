const URLEngine = require("../../core/detection/URLEngine");

/**
 * URLAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Inspects URLs for structure, HTTPS status, TLD, homograph attacks,
 * suspicious characters, leetspeak brand impersonations, and known phishing indicators.
 */
class URLAnalyzer {

    /**
     * Analyze URL safety.
     * @param {string} urlString
     * @returns {object} { riskLevel, confidence, score, reasons, warnings, recommendation, domain, protocol, isPhishing }
     */
    static analyze(urlString) {
        const engineResult = URLEngine.analyze(urlString);

        const reasons = [];
        if (engineResult.protocol === "https") {
            reasons.push("HTTPS transport encryption verified.");
        }

        return {
            url: urlString,
            domain: engineResult.domain,
            protocol: engineResult.protocol,
            riskLevel: engineResult.riskLevel,
            confidence: Math.round(engineResult.confidence * 100),
            score: engineResult.score,
            reasons,
            warnings: engineResult.warnings,
            isPhishing: engineResult.isPhishing,
            mitre: engineResult.mitre,
            recommendation: engineResult.warnings.length === 0
                ? "No known threat indicators or phishing patterns detected. Safe to browse."
                : engineResult.riskLevel === "CRITICAL" || engineResult.riskLevel === "HIGH"
                    ? "HIGH RISK: Do not enter sensitive credentials or download files from this site."
                    : "Exercise standard security hygiene before entering credentials or executing downloads."
        };
    }
}

module.exports = URLAnalyzer;
