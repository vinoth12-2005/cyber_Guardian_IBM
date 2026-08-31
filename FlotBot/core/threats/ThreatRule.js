/**
 * Base class for every detection rule.
 * All rules in FlotBot must extend this class.
 */

class ThreatRule {

    constructor(name, severity = "LOW") {
        this.name = name;
        this.severity = severity;
    }

    async evaluate(data) {
        throw new Error("evaluate() must be implemented.");
    }

}

module.exports = ThreatRule;