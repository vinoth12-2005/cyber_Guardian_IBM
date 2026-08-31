const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * ReverseShellRule
 * Detects non-browser/non-system processes making outbound connections
 * on ports commonly used for reverse shells and C2 communication.
 */
class ReverseShellRule extends ThreatRule {

    constructor() {
        super("Reverse Shell / C2 Connection", "CRITICAL");

        // Common reverse shell and C2 ports
        this.suspiciousPorts = new Set([
            "4444", "4445", "5555", "1234", "1337", "31337",
            "6666", "7777", "8888", "9999", "2222", "3333",
            "6667", "6697",  // IRC (common C2 channel)
            "1080",          // SOCKS proxy
            "3128",          // Squid proxy abuse
            "8080", "8443",  // Alt web (C2 over HTTP)
        ]);

        // Processes that legitimately make outbound connections
        this.whitelist = new Set([
            "chrome.exe", "firefox.exe", "msedge.exe", "iexplore.exe",
            "opera.exe", "brave.exe",
            "svchost.exe", "lsass.exe", "services.exe",
            "onedrive.exe", "dropbox.exe", "slack.exe", "teams.exe",
            "zoom.exe", "skype.exe", "discord.exe",
            "wuauclt.exe", "msiexec.exe", "windowsupdate.exe"
        ]);
    }

    async evaluate({ connections }) {

        if (!connections) return null;

        for (const conn of connections) {

            if (conn.state !== "ESTABLISHED") continue;
            if (conn.remoteAddr === "0.0.0.0" || conn.remoteAddr === "*") continue;

            // Skip loopback
            if (conn.remoteAddr.startsWith("127.") || conn.remoteAddr === "::1") continue;

            if (this.suspiciousPorts.has(conn.remotePort)) {

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       this.severity,
                    process:        `PID ${conn.pid}`,
                    pid:            conn.pid,
                    reason:         `Outbound connection to ${conn.remoteAddr}:${conn.remotePort} on a known reverse shell/C2 port.`,
                    recommendation: "Immediately inspect this process. Terminate if unauthorized. Block the remote IP at the firewall.",
                    evidence:       {
                        protocol:    conn.protocol,
                        localAddr:   `${conn.localAddr}:${conn.localPort}`,
                        remoteAddr:  `${conn.remoteAddr}:${conn.remotePort}`,
                        remotePort:  conn.remotePort,
                        pid:         conn.pid
                    },
                    mitre: ["T1571", "T1095", "T1219"]
                };

            }

        }

        return null;

    }

}

module.exports = ReverseShellRule;
