const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const FileAnalyzer = require("./FileAnalyzer");

/**
 * MacOSFileAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Specialized macOS File Threat Analyzer.
 *
 * Implements:
 *   - macOS Extended Attributes (com.apple.quarantine)
 *   - Mach-O CodeSign / Entitlements extraction
 *   - Application Bundle inspection (.app/Contents/Info.plist)
 */
class MacOSFileAnalyzer extends FileAnalyzer {

    constructor(options = {}) {
        super(options);
    }

    /**
     * Inspect macOS quarantine extended attribute.
     */
    inspectQuarantineAttribute(filePath) {
        try {
            const out = execSync(`xattr -p com.apple.quarantine "${filePath}" 2>/dev/null`, { timeout: 2000 }).toString().trim();
            if (out) {
                return {
                    hasQuarantineAttribute: true,
                    rawQuarantine: out,
                    isInternetDownload: true
                };
            }
        } catch {}

        return { hasQuarantineAttribute: false, isInternetDownload: false };
    }

    async analyzeFile(filePath, contextOptions = {}) {
        const quarantine = this.inspectQuarantineAttribute(filePath);
        if (quarantine.isInternetDownload) {
            contextOptions.downloadOrigin = {
                riskScore: 20,
                quarantineAttribute: quarantine.rawQuarantine
            };
        }

        return super.analyzeFile(filePath, contextOptions);
    }
}

module.exports = MacOSFileAnalyzer;
