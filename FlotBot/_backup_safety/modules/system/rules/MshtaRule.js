const ThreatRule = require("../../../core/threats/ThreatRule");

class MshtaRule extends ThreatRule {

    constructor() {
        super(
            "MSHTA Execution",
            "High"
        );
    }

    async evaluate(process) {

        if (!process.image) return null;

        if (process.image.toLowerCase() === "mshta.exe") {

            return {
                detected: true,
                rule: this.name,
                severity: this.severity,
                process: process.image,
                pid: process.pid,
                reason: "MSHTA execution detected.",
                recommendation: "Possible LOLBin abuse. Verify legitimacy."
            };

        }

        return null;
    }

}

module.exports = MshtaRule;