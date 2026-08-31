const ThreatRule = require("../../../core/threats/ThreatRule");

class Rundll32Rule extends ThreatRule {

    constructor() {
        super(
            "Rundll32 Execution",
            "High"
        );
    }

    async evaluate(process) {

        if (!process.image) return null;

        if (process.image.toLowerCase() === "rundll32.exe") {

            return {
                detected: true,
                rule: this.name,
                severity: this.severity,
                process: process.image,
                pid: process.pid,
                reason: "Rundll32 execution detected.",
                recommendation: "Inspect loaded DLL and command-line arguments."
            };

        }

        return null;
    }

}

module.exports = Rundll32Rule;