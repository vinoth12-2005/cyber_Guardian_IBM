const ThreatRule = require("../../../core/threats/ThreatRule");

class Regsvr32Rule extends ThreatRule {

    constructor() {
        super(
            "Regsvr32 Execution",
            "High"
        );
    }

    async evaluate(process) {

        if (!process.image) return null;

        if (process.image.toLowerCase() === "regsvr32.exe") {

            return {
                detected: true,
                rule: this.name,
                severity: this.severity,
                process: process.image,
                pid: process.pid,
                reason: "Regsvr32 execution detected.",
                recommendation: "Inspect DLL registration activity."
            };

        }

        return null;
    }

}

module.exports = Regsvr32Rule;