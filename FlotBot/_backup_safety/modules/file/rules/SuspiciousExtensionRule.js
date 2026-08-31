const ThreatRule = require("../../../core/threats/ThreatRule");
const path = require("path");

/**
 * SuspiciousExtensionRule
 * Detects double-extension tricks and disguised executables.
 */
class SuspiciousExtensionRule extends ThreatRule {

    constructor() {
        super("Suspicious File Extension", "HIGH");

        // Extensions that should never appear in user-facing names
        this.execExtensions = new Set([
            ".exe", ".dll", ".scr", ".com", ".pif"
        ]);

        // Fake "safe" extensions used in double-extension attacks
        this.decoyExtensions = [
            ".pdf", ".doc", ".docx", ".xls", ".xlsx",
            ".jpg", ".jpeg", ".png", ".gif", ".txt",
            ".zip", ".rar", ".mp4", ".mp3"
        ];
    }

    async evaluate({ events }) {

        if (!events) return null;

        for (const event of events) {

            if (event.action !== "CREATED") continue;

            const file = event.file;
            const name = (file.fileName || "").toLowerCase();

            // Check for double extensions: invoice.pdf.exe
            for (const decoy of this.decoyExtensions) {
                for (const exec of this.execExtensions) {
                    if (name.endsWith(decoy + exec) || name.endsWith(exec + decoy)) {
                        return {
                            detected:       true,
                            rule:           this.name,
                            severity:       this.severity,
                            process:        file.fileName,
                            pid:            "N/A",
                            reason:         `Double-extension file detected: "${file.filePath}" — classic social engineering trick to disguise executables.`,
                            recommendation: "Do not open this file. Delete it immediately and investigate its origin.",
                            evidence:       {
                                filePath:  file.filePath,
                                fileName:  file.fileName,
                                technique: "double-extension"
                            },
                            mitre: ["T1036.007", "T1204.001"]
                        };
                    }
                }
            }

            // Check for right-to-left override (RTLO) in filename
            if (file.filePath.includes("\u202e")) {
                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       "CRITICAL",
                    process:        file.fileName,
                    pid:            "N/A",
                    reason:         `Right-to-left override (RTLO) character detected in filename: "${file.filePath}". This is used to disguise file extensions.`,
                    recommendation: "This file is almost certainly malicious. Do not open it. Delete immediately.",
                    evidence:       { filePath: file.filePath, technique: "RTLO" },
                    mitre:          ["T1036.002"]
                };
            }

        }

        return null;

    }

}

module.exports = SuspiciousExtensionRule;
