const ThreatRule = require("../../../core/threats/ThreatRule");
const path = require("path");

/**
 * SuspiciousPathRule
 * Detects processes running from high-risk directories
 * commonly abused by malware (temp, appdata, downloads, etc.).
 */
class SuspiciousPathRule extends ThreatRule {

    constructor() {
        super("Suspicious Executable Path", "HIGH");

        this.suspiciousDirs = [
            "\\temp\\",
            "\\tmp\\",
            "\\appdata\\local\\temp\\",
            "\\appdata\\roaming\\",
            "\\downloads\\",
            "\\users\\public\\",
            "\\recycler\\",
            "\\$recycle.bin\\",
            "\\perflogs\\",
            "\\windows\\tasks\\",
            "\\windows\\debug\\"
        ];

        // Processes exempt from this rule (known-good locations)
        this.whitelist = [
            "svchost.exe",
            "dwm.exe",
            "csrss.exe",
            "winlogon.exe",
            "wininit.exe",
            "services.exe",
            "lsass.exe",
            "smss.exe"
        ];
    }

    async evaluate(processes) {

        for (const process of processes) {

            const image = (process.image || "").toLowerCase();
            const exePath = (process.exePath || "").toLowerCase();

            if (!exePath) continue;
            if (this.whitelist.includes(image)) continue;

            for (const dir of this.suspiciousDirs) {
                if (exePath.includes(dir)) {

                    return {
                        detected:       true,
                        rule:           this.name,
                        severity:       this.severity,
                        process:        process.image,
                        pid:            process.pid,
                        reason:         `Process "${process.image}" is running from a suspicious path: ${process.exePath}`,
                        recommendation: "Investigate this executable immediately. Processes in temp/appdata locations are a common malware technique.",
                        evidence:       { path: process.exePath }
                    };

                }
            }
        }

        return null;
    }

}

module.exports = SuspiciousPathRule;
