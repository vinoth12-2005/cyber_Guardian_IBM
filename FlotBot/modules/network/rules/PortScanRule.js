const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * PortScanRule
 * Detects when a single PID is connecting to many distinct ports
 * on the same host — a classic port scanning pattern.
 */
class PortScanRule extends ThreatRule {

    constructor() {
        super("Port Scanning Activity", "HIGH");
        this.portCountThreshold = 10;  // distinct ports in one scan
    }

    async evaluate({ connections }) {

        if (!connections) return null;

        // Group by pid + remoteAddr, collect unique remote ports
        const portMap = new Map();

        for (const conn of connections) {

            if (!conn.remoteAddr || conn.remoteAddr === "0.0.0.0") continue;
            if (conn.remoteAddr.startsWith("127.")) continue;

            const key = `${conn.pid}:${conn.remoteAddr}`;
            if (!portMap.has(key)) portMap.set(key, new Set());
            portMap.get(key).add(conn.remotePort);

        }

        for (const [key, ports] of portMap.entries()) {

            if (ports.size >= this.portCountThreshold) {

                const [pid, remoteAddr] = key.split(":");

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       this.severity,
                    process:        `PID ${pid}`,
                    pid,
                    reason:         `PID ${pid} is connected to ${ports.size} distinct ports on ${remoteAddr}, indicating port scanning activity.`,
                    recommendation: "Identify the process performing this scan. Port scanning within the network may indicate lateral movement reconnaissance.",
                    evidence:       {
                        pid,
                        remoteAddr,
                        portCount: ports.size,
                        ports:     [...ports].slice(0, 20)
                    },
                    mitre: ["T1046", "T1595.001"]
                };

            }

        }

        return null;

    }

}

module.exports = PortScanRule;
