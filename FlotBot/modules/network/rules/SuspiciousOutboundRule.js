const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * SuspiciousOutboundRule
 * Detects non-network applications making unexpected outbound connections.
 * e.g., Word, Excel, or PDF readers connecting to the internet.
 */
class SuspiciousOutboundRule extends ThreatRule {

    constructor() {
        super("Suspicious Outbound Connection", "HIGH");

        // Office/productivity apps that should NOT make direct internet connections
        this.suspiciousApps = new Set([
            "winword.exe",
            "excel.exe",
            "powerpnt.exe",
            "onenote.exe",
            "acrord32.exe",
            "acrobat.exe",
            "notepad.exe",
            "wordpad.exe",
            "mspaint.exe",
            "calc.exe",
            "cmd.exe",
            "powershell.exe",
            "pwsh.exe",
            "wscript.exe",
            "cscript.exe",
            "mshta.exe",
            "rundll32.exe",
            "regsvr32.exe"
        ]);

        // Private/internal IP ranges (don't flag these)
        this.privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^127\./,
            /^::1$/,
            /^fe80:/i
        ];
    }

    _isPrivate(ip) {
        return this.privateRanges.some(rx => rx.test(ip));
    }

    async evaluate({ connections }) {

        if (!connections) return null;

        for (const conn of connections) {

            if (conn.state !== "ESTABLISHED") continue;
            if (!conn.remoteAddr || conn.remoteAddr === "0.0.0.0") continue;
            if (this._isPrivate(conn.remoteAddr)) continue;

            // We only have PID here; in a full integration, resolve image from process list
            // For now, flag based on port context if process image is available
            const image = (conn.image || "").toLowerCase();

            if (image && this.suspiciousApps.has(image)) {

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       this.severity,
                    process:        image || `PID ${conn.pid}`,
                    pid:            conn.pid,
                    reason:         `"${image}" is making an outbound connection to ${conn.remoteAddr}:${conn.remotePort}, which is unexpected for this application type.`,
                    recommendation: "Office and productivity apps should not make direct internet connections. This may indicate a macro or exploit performing data exfiltration.",
                    evidence:       {
                        image:      image,
                        remoteAddr: conn.remoteAddr,
                        remotePort: conn.remotePort,
                        protocol:   conn.protocol
                    },
                    mitre: ["T1041", "T1071.001", "T1566"]
                };

            }

        }

        return null;

    }

}

module.exports = SuspiciousOutboundRule;
