const ThreatRule = require("../../../core/threats/ThreatRule");

class CmdRule extends ThreatRule {

    constructor() {
        super(
            "CMD Execution",
            "Medium"
        );
    }

    async evaluate(process) {

        if (!process.image) return null;

        if (process.image.toLowerCase() === "cmd.exe") {

            return {
                detected: true,
                rule: this.name,
                severity: this.severity,
                process: process.image,
                pid: process.pid,
                reason: "Command Prompt detected.",
                recommendation: "Verify whether this shell was expected."
            };

        }

        return null;
    }

}

module.exports = CmdRule;