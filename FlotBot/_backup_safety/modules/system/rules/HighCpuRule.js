const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * HighCpuRule
 * Detects processes consuming suspiciously high memory.
 * (CPU% requires sustained polling; we flag high memory consumers
 * with suspicious names as a proxy for crypto-mining / malware activity.)
 */
class HighCpuRule extends ThreatRule {

    constructor() {
        super("High Resource Usage", "MEDIUM");

        // Memory threshold in KB (500 MB)
        this.memoryThresholdKB = 500000;

        // Processes known to legitimately use high memory
        this.whitelist = [
            "chrome.exe",
            "firefox.exe",
            "msedge.exe",
            "code.exe",
            "devenv.exe",
            "node.exe",
            "java.exe",
            "javaw.exe",
            "sqlservr.exe",
            "antimalware service executable",
            "msmpeng.exe",
            "searchindexer.exe"
        ];
    }

    _parseMemoryKB(memStr) {
        // Format: "123,456 K" from tasklist
        if (!memStr) return 0;
        return parseInt(memStr.replace(/[^0-9]/g, ""), 10) || 0;
    }

    async evaluate(processes) {

        for (const process of processes) {

            const image = (process.image || "").toLowerCase();

            if (this.whitelist.includes(image)) continue;

            const memKB = this._parseMemoryKB(process.memoryRaw);

            if (memKB > this.memoryThresholdKB) {

                const memMB = Math.round(memKB / 1024);

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       this.severity,
                    process:        process.image,
                    pid:            process.pid,
                    reason:         `Process "${process.image}" (PID ${process.pid}) is consuming ${memMB} MB of memory, which is unusually high.`,
                    recommendation: "Investigate this process for crypto-mining, memory injection, or data exfiltration activity.",
                    evidence:       {
                        memoryMB:  memMB,
                        threshold: Math.round(this.memoryThresholdKB / 1024)
                    }
                };

            }

        }

        return null;
    }

}

module.exports = HighCpuRule;
