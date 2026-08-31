const ThreatRule = require("../../../core/threats/ThreatRule");

class WmicRule extends ThreatRule {

    constructor() {
        super(
            "WMIC Execution",
            "Medium"
        );
    }

    async evaluate(process) {

        if (!process.image) return null;

        if (process.image.toLowerCase() === "wmic.exe") {

            return {
                detected: true,
                rule: this.name,
                severity: this.severity,
                process: process.image,
                pid: process.pid,
                reason: "WMIC execution detected.",
                recommendation: "Check for reconnaissance or remote management activity."
            };

        }

        return null;
    }

}

module.exports = WmicRule;