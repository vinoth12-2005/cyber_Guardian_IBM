const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * BeaconRule
 * Detects repeated connections to the same remote IP from the same PID,
 * a pattern consistent with C2 beaconing behavior.
 */
class BeaconRule extends ThreatRule {

    constructor() {
        super("C2 Beaconing Pattern", "HIGH");

        // Minimum repeat count to flag as beaconing
        this.repeatThreshold = 3;

        this.whitelist = new Set([
            "chrome.exe", "firefox.exe", "msedge.exe",
            "onedrive.exe", "dropbox.exe", "teams.exe",
            "svchost.exe", "wuauclt.exe"
        ]);

        // Track history across scan cycles: Map<pid:remoteIP, count>
        this._history = new Map();
    }

    async evaluate({ connections }) {

        if (!connections) return null;

        // Count established connections per pid+remoteAddr combo
        const counts = new Map();

        for (const conn of connections) {

            if (conn.state !== "ESTABLISHED") continue;
            if (!conn.remoteAddr || conn.remoteAddr === "0.0.0.0") continue;
            if (conn.remoteAddr.startsWith("127.") || conn.remoteAddr === "::1") continue;

            const key = `${conn.pid}:${conn.remoteAddr}`;
            counts.set(key, (counts.get(key) || 0) + 1);

        }

        // Merge with history
        for (const [key, count] of counts.entries()) {
            const prev = this._history.get(key) || 0;
            this._history.set(key, prev + count);
        }

        // Check thresholds
        for (const [key, total] of this._history.entries()) {

            if (total >= this.repeatThreshold) {

                const [pid, remoteAddr] = key.split(":");

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       this.severity,
                    process:        `PID ${pid}`,
                    pid,
                    reason:         `PID ${pid} has made ${total} repeated connections to ${remoteAddr}, suggesting C2 beaconing.`,
                    recommendation: "Investigate the process making these repeated connections. Check for scheduled tasks or persistence mechanisms.",
                    evidence:       { pid, remoteAddr, connectionCount: total },
                    mitre:          ["T1071", "T1132", "T1573"]
                };

            }

        }

        return null;

    }

    reset() {
        this._history.clear();
    }

}

module.exports = BeaconRule;
