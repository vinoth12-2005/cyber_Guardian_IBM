/**
 * SecurityResult
 * Standardized result wrapper for external threat intelligence providers.
 * Classifications: "malicious" | "suspicious" | "no_known_threat" | "unknown" | "unavailable"
 */
class SecurityResult {
    constructor({
        provider,
        target_type,
        target,
        status = "completed",
        classification = "unknown",
        confidence = 0.0,
        detections = { malicious: 0, suspicious: 0, total: 0 },
        evidence = {},
        timestamp = new Date().toISOString(),
        error = null,
        raw_reference = null
    }) {
        this.provider = provider;
        this.target_type = target_type; // "file" | "hash" | "url" | "ip" | "domain"
        this.target = target;
        this.status = status; // "completed" | "error" | "unavailable" | "rate_limited"
        this.classification = classification; // "malicious" | "suspicious" | "no_known_threat" | "unknown" | "unavailable"
        this.confidence = confidence;
        this.detections = detections;
        this.evidence = evidence;
        this.timestamp = timestamp;
        this.error = error;
        this.raw_reference = raw_reference;
    }

    static unavailable(provider, target_type, target, errorMsg = "Provider unavailable or unconfigured") {
        return new SecurityResult({
            provider,
            target_type,
            target,
            status: "unavailable",
            classification: "unavailable",
            confidence: 0.0,
            error: errorMsg
        });
    }

    static error(provider, target_type, target, errorMsg) {
        return new SecurityResult({
            provider,
            target_type,
            target,
            status: "error",
            classification: "unknown",
            confidence: 0.0,
            error: errorMsg
        });
    }
}

module.exports = SecurityResult;
