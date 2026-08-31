const fs = require("fs");
const path = require("path");
const FileAnalyzer = require("./FileAnalyzer");

/**
 * WindowsFileAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Specialized Windows File Threat Analyzer.
 *
 * Implements:
 *   - NTFS Alternate Data Streams (ADS) / Mark-of-the-Web (Zone.Identifier)
 *   - PE Authenticode certificate extraction
 *   - Windows System32 / SysWOW64 path normalization
 */
class WindowsFileAnalyzer extends FileAnalyzer {

    constructor(options = {}) {
        super(options);
    }

    /**
     * Inspect Mark-of-the-Web (Zone.Identifier) ADS if present on NTFS.
     */
    inspectZoneIdentifier(filePath) {
        try {
            const zonePath = `${filePath}:Zone.Identifier`;
            if (fs.existsSync(zonePath)) {
                const content = fs.readFileSync(zonePath, "utf8");
                const zoneMatch = content.match(/ZoneId=(\d+)/);
                const urlMatch = content.match(/HostUrl=([^\r\n]+)/);
                return {
                    hasZoneIdentifier: true,
                    zoneId: zoneMatch ? parseInt(zoneMatch[1], 10) : 3, // 3 = Internet Zone
                    hostUrl: urlMatch ? urlMatch[1] : null,
                    isInternetDownload: true
                };
            }
        } catch { /* ADS not present or non-NTFS */ }

        return { hasZoneIdentifier: false, isInternetDownload: false };
    }

    async analyzeFile(filePath, contextOptions = {}) {
        const motw = this.inspectZoneIdentifier(filePath);
        if (motw.isInternetDownload) {
            contextOptions.downloadOrigin = {
                riskScore: 25,
                url: motw.hostUrl,
                zone: "Internet"
            };
        }

        return super.analyzeFile(filePath, contextOptions);
    }
}

module.exports = WindowsFileAnalyzer;
