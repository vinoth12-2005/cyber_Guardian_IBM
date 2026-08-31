const ThreatRule = require("../../../core/threats/ThreatRule");
const path = require("path");

/**
 * ExecutableDropRule
 * ─────────────────────────────────────────────────────────────
 * Detects high-risk executable or script files dropped into monitored directories.
 * Focuses on compiled binaries, scripts in temp/downloads, and double-extension masquerading.
 */
class ExecutableDropRule extends ThreatRule {

    constructor() {
        super("Executable File Dropped", "HIGH");

        // High-risk binary and script extensions that execute directly
        this.highRiskExtensions = new Set([
            ".exe", ".dll", ".scr", ".cpl",
            ".com", ".pif", ".hta", ".vbs",
            ".vbe", ".jse", ".msi", ".msp"
        ]);

        this.scriptExtensions = new Set([
            ".bat", ".cmd", ".ps1", ".sh"
        ]);
    }

    async evaluate({ events }) {
        if (!events || !events.length) return null;

        for (const event of events) {
            if (event.action !== "CREATED") continue;

            const file = event.file;
            const ext  = (file.extension || "").toLowerCase();
            const filePathLower = (file.filePath || "").toLowerCase();

            // 1. Double extension masquerading (e.g. invoice.pdf.exe, report.docx.vbs)
            const baseName = path.basename(file.filePath || "");
            const isDoubleExt = /\.(pdf|docx?|xlsx?|txt|jpg|png|zip)\.(exe|scr|vbs|bat|cmd|ps1)$/i.test(baseName);

            // 2. High-risk executable dropped
            const isHighRiskExt = this.highRiskExtensions.has(ext);

            // 3. Script dropped in temporary execution directories
            const isInTempDir = filePathLower.includes("/tmp/") || filePathLower.includes("\\temp\\") || filePathLower.includes("\\appdata\\local\\temp\\");
            const isScriptInTemp = this.scriptExtensions.has(ext) && isInTempDir;

            if (isDoubleExt || isHighRiskExt || isScriptInTemp) {
                const isCritical = isDoubleExt || (isHighRiskExt && isInTempDir);

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       isCritical ? "CRITICAL" : "HIGH",
                    process:        file.fileName,
                    pid:            "N/A",
                    reason:         isDoubleExt
                        ? `Masqueraded double-extension file dropped: "${file.filePath}"`
                        : `Executable binary dropped: "${file.filePath}"`,
                    recommendation: "Scan this file with antivirus immediately. Do not execute it until verified safe. Check what process created it.",
                    evidence: {
                        filePath:  file.filePath,
                        extension: ext,
                        size:      file.size,
                        isDoubleExtension: isDoubleExt
                    },
                    mitre: ["T1105", "T1204.002", "T1036.007"]
                };
            }
        }

        return null;
    }
}

module.exports = ExecutableDropRule;
