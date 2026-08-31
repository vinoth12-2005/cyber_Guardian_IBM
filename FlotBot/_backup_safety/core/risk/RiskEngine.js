/**
 * RiskEngine
 * ─────────────────────────────────────────────────────────────
 * Central deterministic risk and confidence scoring engine.
 *
 * Tiers:
 *   - SAFE:     0 - 19
 *   - LOW:      20 - 39
 *   - MEDIUM:   40 - 59
 *   - HIGH:     60 - 79
 *   - CRITICAL: 80 - 100
 *
 * Confidence: 0.0 - 1.0 (calculated based on evidence completeness)
 */
class RiskEngine {

    static WEIGHTS = {
        RANSOMWARE_ACTIVITY: 60,
        IOC_MATCH: 50,
        REVERSE_SHELL: 50,
        YARA_MATCH_CRITICAL: 45,
        YARA_MATCH_HIGH: 35,
        C2_BEACONING: 40,
        LOLBIN_ANOMALY: 35,
        SUSPICIOUS_PARENT_CHILD: 35,
        PHISHING_URL: 35,
        PERSISTENCE_CREATED: 30,
        SUSPICIOUS_EXTENSION: 20,
        SUSPICIOUS_OUTBOUND: 20
    };

    /**
     * Compute deterministic risk score and confidence.
     * @param {Array<object>} signals - Array of detected threat indicators/events
     * @returns {object} { riskScore, confidence, tier, breakdown }
     */
    static calculate(signals = []) {
        if (!signals || signals.length === 0) {
            return {
                riskScore: 0,
                confidence: 1.0,
                tier: "SAFE",
                breakdown: []
            };
        }

        let rawScore = 0;
        let confidenceAccumulator = 0;
        const breakdown = [];

        for (const s of signals) {
            let weight = 15; // default moderate signal weight
            const type = (s.type || s.pattern || s.rule || s.event_type || "").toUpperCase();

            if (type.includes("RANSOM")) {
                weight = RiskEngine.WEIGHTS.RANSOMWARE_ACTIVITY;
            } else if (type.includes("IOC") || s.verdict === "MALICIOUS") {
                weight = RiskEngine.WEIGHTS.IOC_MATCH;
            } else if (type.includes("REVERSE_SHELL") || type.includes("SHELL")) {
                weight = RiskEngine.WEIGHTS.REVERSE_SHELL;
            } else if (type.includes("YARA")) {
                weight = s.severity === "CRITICAL" ? RiskEngine.WEIGHTS.YARA_MATCH_CRITICAL : RiskEngine.WEIGHTS.YARA_MATCH_HIGH;
            } else if (type.includes("PARENT_CHILD") || type.includes("LOLBIN")) {
                weight = RiskEngine.WEIGHTS.LOLBIN_ANOMALY;
            } else if (type.includes("PHISHING") || s.isPhishing) {
                weight = RiskEngine.WEIGHTS.PHISHING_URL;
            } else if (type.includes("PERSISTENCE")) {
                weight = RiskEngine.WEIGHTS.PERSISTENCE_CREATED;
            } else if (type.includes("EXTENSION")) {
                weight = RiskEngine.WEIGHTS.SUSPICIOUS_EXTENSION;
            } else if (type.includes("OUTBOUND") || type.includes("BEACON")) {
                weight = RiskEngine.WEIGHTS.C2_BEACONING;
            } else if (s.score && typeof s.score === "number") {
                weight = Math.round(s.score * 0.4);
            }

            rawScore += weight;
            confidenceAccumulator += (s.confidence || 0.7);

            breakdown.push({
                signal: s.title || s.pattern || s.rule || type,
                weight,
                severity: s.severity || "MEDIUM"
            });
        }

        // Multi-signal synergy boost
        if (signals.length >= 3) {
            rawScore += 10;
        }

        const finalScore = Math.min(100, Math.max(0, rawScore));
        const avgConfidence = Math.min(1.0, Math.max(0.1, confidenceAccumulator / signals.length));

        let tier = "SAFE";
        if (finalScore >= 80) tier = "CRITICAL";
        else if (finalScore >= 60) tier = "HIGH";
        else if (finalScore >= 40) tier = "MEDIUM";
        else if (finalScore >= 20) tier = "LOW";

        return {
            riskScore: finalScore,
            confidence: parseFloat(avgConfidence.toFixed(2)),
            tier,
            breakdown
        };
    }
}

module.exports = RiskEngine;
