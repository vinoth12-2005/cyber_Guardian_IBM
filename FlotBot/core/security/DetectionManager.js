const VirusTotalProvider = require("./VirusTotalProvider");
const SafeBrowsingProvider = require("./SafeBrowsingProvider");
const HybridAnalysisProvider = require("./HybridAnalysisProvider");
const SecurityResult = require("./SecurityResult");

/**
 * DetectionManager
 * Centralized security integration layer managing external providers
 * and correlating security evidence without declaring homemade malware verdicts.
 */
class DetectionManager {
    constructor(config = {}) {
        this.virusTotal = new VirusTotalProvider(config.vtApiKey);
        this.safeBrowsing = new SafeBrowsingProvider(config.safeBrowsingApiKey);
        this.hybridAnalysis = new HybridAnalysisProvider(config.hybridAnalysisApiKey);
    }

    /**
     * Check a URL across VirusTotal and Google Safe Browsing.
     * @param {string} urlString
     * @returns {Promise<object>} Combined evidence and fused classification
     */
    async checkUrl(urlString) {
        if (!urlString) {
            return { classification: "unknown", overall_score: 0, provider_results: [], evidence: [] };
        }

        console.log(`[DetectionManager] checkUrl started for target`);
        const [vtRes, sbRes] = await Promise.allSettled([
            this.virusTotal.checkUrl(urlString),
            this.safeBrowsing.checkUrl(urlString)
        ]);

        const vtResult = vtRes.status === "fulfilled" ? vtRes.value : SecurityResult.error("VirusTotal", "url", urlString, vtRes.reason?.message);
        const sbResult = sbRes.status === "fulfilled" ? sbRes.value : SecurityResult.error("GoogleSafeBrowsing", "url", urlString, sbRes.reason?.message);

        console.log(`[VirusTotal] response status: ${vtResult.status} | classification: ${vtResult.classification}`);
        console.log(`[SafeBrowsing] response status: ${sbResult.status} | classification: ${sbResult.classification}`);

        const providerResults = [vtResult, sbResult];
        const fused = this._fuseResults(providerResults);

        console.log(`[DetectionManager] fused classification: ${fused.classification}`);

        return {
            target: urlString,
            target_type: "url",
            classification: fused.classification,
            confidence: fused.confidence,
            provider_results: providerResults,
            summary: fused.summary,
            evidence: fused.evidence
        };
    }

    /**
     * Check a File / SHA256 across VirusTotal with Hybrid Analysis escalation if unknown/suspicious.
     * @param {object} fileParams - { sha256, filePath, telemetry }
     * @returns {Promise<object>}
     */
    async checkFile({ sha256 = null, filePath = null, telemetry = {} }) {
        const providerResults = [];

        // 1. Initial VirusTotal Hash Lookup
        let vtResult = null;
        if (sha256) {
            vtResult = await this.virusTotal.checkFileHash(sha256);
            providerResults.push(vtResult);
        } else {
            providerResults.push(SecurityResult.unavailable("VirusTotal", "hash", filePath, "No SHA256 provided"));
        }

        // 2. Escalation to Hybrid Analysis if unknown or suspicious
        let haResult = null;
        if (sha256 && (vtResult?.classification === "unknown" || vtResult?.classification === "suspicious" || vtResult?.status === "unavailable")) {
            haResult = await this.hybridAnalysis.checkFileHash(sha256);
            providerResults.push(haResult);
        } else {
            providerResults.push(SecurityResult.unavailable("HybridAnalysis", "hash", sha256 || filePath, "Escalation not required or SHA256 missing"));
        }

        const fused = this._fuseResults(providerResults, telemetry);

        return {
            target: sha256 || filePath,
            target_type: sha256 ? "hash" : "file",
            classification: fused.classification,
            confidence: fused.confidence,
            provider_results: providerResults,
            telemetry: telemetry,
            summary: fused.summary,
            evidence: fused.evidence
        };
    }

    /**
     * Fuse external security results with non-authoritative local telemetry evidence.
     */
    _fuseResults(providerResults, telemetry = {}) {
        let isMalicious = false;
        let isSuspicious = false;
        let hasActiveProvider = false;
        const evidenceList = [];

        for (const res of providerResults) {
            if (res.status === "completed") {
                hasActiveProvider = true;
                if (res.classification === "malicious") {
                    isMalicious = true;
                    evidenceList.push(`[${res.provider}] Confirmed Malicious threat match (${res.detections.malicious} engine detections).`);
                } else if (res.classification === "suspicious") {
                    isSuspicious = true;
                    evidenceList.push(`[${res.provider}] Flagged as Suspicious (${res.detections.suspicious || 0} detections / indicator flags).`);
                } else if (res.classification === "no_known_threat") {
                    evidenceList.push(`[${res.provider}] No known threat match in external database.`);
                }
            } else if (res.status === "unavailable") {
                evidenceList.push(`[${res.provider}] External verification unavailable (${res.error || "Key missing"}).`);
            } else if (res.status === "error") {
                evidenceList.push(`[${res.provider}] Query error: ${res.error}`);
            }
        }

        // Attach telemetry evidence (non-authoritative)
        if (telemetry.entropy && telemetry.entropy > 7.2) {
            evidenceList.push(`[Local Telemetry] High file entropy calculated (${telemetry.entropy.toFixed(2)}/8.0).`);
        }
        if (telemetry.yaraMatches && telemetry.yaraMatches.length > 0) {
            evidenceList.push(`[Local Telemetry] Local YARA rule heuristic matches: ${telemetry.yaraMatches.join(", ")}.`);
        }
        if (telemetry.suspiciousImports && telemetry.suspiciousImports.length > 0) {
            evidenceList.push(`[Local Telemetry] Executable imports sensitive OS APIs: ${telemetry.suspiciousImports.join(", ")}.`);
        }

        let classification = "unknown";
        if (isMalicious) {
            classification = "malicious";
        } else if (isSuspicious) {
            classification = "suspicious";
        } else if (hasActiveProvider) {
            classification = "no_known_threat";
        } else {
            classification = "unavailable";
        }

        const confidence = isMalicious ? 0.95 : isSuspicious ? 0.70 : hasActiveProvider ? 0.85 : 0.0;

        return {
            classification,
            confidence,
            summary: isMalicious ? "CRITICAL THREAT: Verified malicious by external security intelligence APIs."
                   : isSuspicious ? "SUSPICIOUS TARGET: Flagged by external intelligence or telemetry heuristics."
                   : hasActiveProvider ? "NO KNOWN THREAT: No threat matches found in active external security databases."
                   : "SECURITY SERVICE UNAVAILABLE: External API verification was not available.",
            evidence: evidenceList
        };
    }
}

module.exports = DetectionManager;
