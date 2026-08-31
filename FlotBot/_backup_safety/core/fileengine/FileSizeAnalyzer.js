/**
 * FileSizeAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Analyzes file size anomalies and structure ratios.
 *
 * Rules:
 *   - LARGE FILE != MALWARE.
 *   - Detects:
 *       1. Suspicious tiny droppers (< 4KB executable binaries)
 *       2. Bloated binaries with huge zero-padding / low-entropy overlays (sandbox evasion)
 *       3. Mass size anomalies
 *   - Generates SIZE_ANOMALY_SCORE, not a malware score.
 */
class FileSizeAnalyzer {

    /**
     * Analyze file size anomalies.
     * @param {number} sizeBytes
     * @param {boolean} [isExecutable=false]
     * @param {object} [staticResult]
     * @returns {object} Size anomaly metrics
     */
    static analyze(sizeBytes, isExecutable = false, staticResult = null) {
        let anomalyScore = 0;
        const flags = [];

        if (sizeBytes <= 0) {
            return {
                sizeBytes: 0,
                sizeFormatted: "0 B",
                anomalyScore: 0,
                flags: ["EMPTY_FILE"]
            };
        }

        // Format helper
        let sizeFormatted = `${sizeBytes} B`;
        if (sizeBytes >= 1024 * 1024 * 1024) sizeFormatted = `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        else if (sizeBytes >= 1024 * 1024) sizeFormatted = `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
        else if (sizeBytes >= 1024) sizeFormatted = `${(sizeBytes / 1024).toFixed(1)} KB`;

        // 1. Tiny Executable (Dropper / Shellcode Stager)
        if (isExecutable && sizeBytes < 4096) {
            flags.push("UNUSUALLY_SMALL_EXECUTABLE_DROPPER_SIZE (< 4 KB)");
            anomalyScore += 25;
        }

        // 2. Bloated Binary with potential padding
        if (isExecutable && sizeBytes > 50 * 1024 * 1024) {
            flags.push("VERY_LARGE_EXECUTABLE_BINARY (> 50 MB)");
            anomalyScore += 10;
        }

        // 3. Overlay Detection (Raw file size much larger than defined section sizes)
        if (staticResult && Array.isArray(staticResult.sections) && staticResult.sections.length > 0) {
            let totalSectionRaw = 0;
            for (const s of staticResult.sections) {
                totalSectionRaw = Math.max(totalSectionRaw, (s.pointerToRawData || 0) + (s.sizeOfRawData || 0));
            }
            if (totalSectionRaw > 0 && sizeBytes > totalSectionRaw + (1024 * 1024)) { // > 1MB overlay appended
                const overlaySize = sizeBytes - totalSectionRaw;
                flags.push(`SUSPICIOUS_APPENDED_OVERLAY_DATA (${(overlaySize / 1024).toFixed(1)} KB extra data appended past sections)`);
                anomalyScore += 30;
            }
        }

        return {
            sizeBytes,
            sizeFormatted,
            anomalyScore: Math.min(100, anomalyScore),
            flags,
            summary: flags.length > 0 ? flags.join(", ") : `Normal file size (${sizeFormatted})`
        };
    }
}

module.exports = FileSizeAnalyzer;
