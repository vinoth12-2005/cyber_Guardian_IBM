const ThreatRule = require("../../../core/threats/ThreatRule");

class SuspiciousParentRule extends ThreatRule {

    constructor() {
        super(
            "Suspicious Parent Process",
            "High"
        );
    }

    async evaluate(process) {

        // Will be implemented after the collector
        // captures parent process information.

        return null;

    }

}

module.exports = SuspiciousParentRule;