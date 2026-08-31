/**
 * MLFeatureExtractor
 * ─────────────────────────────────────────────────────────────
 * Extracts a normalized 20-dimensional numerical feature vector
 * from multi-engine file evidence.
 *
 * Feature Dimensions (all normalized 0.0 - 1.0):
 *   [0]  file_size_norm
 *   [1]  entropy_norm
 *   [2]  is_executable
 *   [3]  extension_matches_type
 *   [4]  is_signed
 *   [5]  signature_valid
 *   [6]  publisher_known
 *   [7]  path_context_score
 *   [8]  yara_match_count_norm
 *   [9]  vt_detection_ratio
 *   [10] hash_known_malicious
 *   [11] hash_known_benign
 *   [12] suspicious_import_count_norm
 *   [13] suspicious_string_count_norm
 *   [14] network_indicator_count_norm
 *   [15] persistence_indicator_count_norm
 *   [16] parent_process_risk_norm
 *   [17] download_origin_risk_norm
 *   [18] baseline_deviation_norm
 *   [19] size_anomaly_score_norm
 */
class MLFeatureExtractor {

    static FEATURE_NAMES = [
        "file_size_norm",
        "entropy_norm",
        "is_executable",
        "extension_matches_type",
        "is_signed",
        "signature_valid",
        "publisher_known",
        "path_context_score",
        "yara_match_count_norm",
        "vt_detection_ratio",
        "hash_known_malicious",
        "hash_known_benign",
        "suspicious_import_count_norm",
        "suspicious_string_count_norm",
        "network_indicator_count_norm",
        "persistence_indicator_count_norm",
        "parent_process_risk_norm",
        "download_origin_risk_norm",
        "baseline_deviation_norm",
        "size_anomaly_score_norm"
    ];

    /**
     * Extract normalized 20-dimensional feature vector.
     * @param {object} evidence - Unified file threat analysis evidence object
     * @returns {Float64Array}
     */
    static extract(evidence = {}) {
        const vec = new Float64Array(20);

        // 0. File size (log normalized)
        const sizeBytes = evidence.fileSizeBytes || evidence.size || 0;
        vec[0] = sizeBytes > 0 ? Math.min(1.0, Math.log10(sizeBytes) / 8.0) : 0.0;

        // 1. Entropy (0.0 to 8.0 -> 0.0 to 1.0)
        const entropy = (typeof evidence.entropy === "number" ? evidence.entropy : evidence.entropy?.score) || (evidence.staticAnalysis?.overallEntropy) || 0.0;
        vec[1] = Math.min(1.0, Math.max(0.0, entropy / 8.0));

        // 2. Executable status
        vec[2] = evidence.isExecutable || evidence.identification?.isExecutable ? 1.0 : 0.0;

        // 3. Extension matches format (1.0 = match, 0.0 = masquerade)
        vec[3] = (evidence.identification?.isMasquerading || evidence.hasDoubleExtension) ? 0.0 : 1.0;

        // 4. Digital signature present
        const sig = evidence.signature || {};
        vec[4] = sig.isSigned ? 1.0 : 0.0;

        // 5. Signature valid
        vec[5] = sig.isValid ? 1.0 : 0.0;

        // 6. Publisher known & trusted
        vec[6] = (sig.publisher && sig.publisher !== "Unknown" && sig.isValid) ? 1.0 : 0.0;

        // 7. Path context score (0 to 100 -> 0.0 to 1.0)
        const pathContext = evidence.pathContext?.pathScore || 0;
        vec[7] = Math.min(1.0, pathContext / 100.0);

        // 8. YARA match count
        const yaraCount = Array.isArray(evidence.yaraMatches) ? evidence.yaraMatches.length : (evidence.yaraCount || 0);
        vec[8] = Math.min(1.0, yaraCount / 5.0);

        // 9. VirusTotal detection ratio
        const vt = evidence.virusTotal || evidence.threatIntel || {};
        const vtTotal = vt.totalEngines || vt.total || 70;
        const vtPositives = (vt.maliciousCount || vt.malicious || 0) + (vt.suspiciousCount || vt.suspicious || 0);
        vec[9] = vtTotal > 0 ? Math.min(1.0, vtPositives / Math.max(1, vtTotal)) : 0.0;

        // 10. Known malicious hash
        const rep = evidence.reputation?.verdict || "";
        vec[10] = rep === "KNOWN_MALICIOUS" ? 1.0 : 0.0;

        // 11. Known benign hash
        vec[11] = rep === "KNOWN_BENIGN" ? 1.0 : 0.0;

        // 12. Suspicious imports count
        const importCount = evidence.imports?.suspiciousApis?.length || evidence.staticAnalysis?.suspiciousPackers?.length || 0;
        vec[12] = Math.min(1.0, importCount / 6.0);

        // 13. Suspicious string count
        const strCount = evidence.strings?.indicators?.length || 0;
        vec[13] = Math.min(1.0, strCount / 8.0);

        // 14. Network indicators count
        const netCount = (evidence.strings?.network?.webhooks?.length || 0) + (evidence.strings?.network?.ips?.length || 0);
        vec[14] = Math.min(1.0, netCount / 5.0);

        // 15. Persistence indicators
        const persistCount = (evidence.strings?.persistence?.length || 0) + (evidence.persistenceDetected ? 1 : 0);
        vec[15] = Math.min(1.0, persistCount / 3.0);

        // 16. Parent process risk
        vec[16] = evidence.parentProcessRisk ? Math.min(1.0, evidence.parentProcessRisk / 100.0) : 0.0;

        // 17. Download origin risk
        vec[17] = evidence.downloadOriginRisk ? Math.min(1.0, evidence.downloadOriginRisk / 100.0) : 0.0;

        // 18. Baseline deviation
        vec[18] = evidence.baselineDeviation ? Math.min(1.0, evidence.baselineDeviation / 100.0) : 0.0;

        // 19. File size anomaly score
        const sizeAnomaly = evidence.sizeAnomaly?.anomalyScore || 0;
        vec[19] = Math.min(1.0, sizeAnomaly / 100.0);

        return vec;
    }
}

module.exports = MLFeatureExtractor;
