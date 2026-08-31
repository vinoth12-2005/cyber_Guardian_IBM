const ThreatManager = require("./ThreatManager");

class ThreatEngine {

    constructor() {
        this.manager = new ThreatManager();
    }

    registerRule(rule) {
        this.manager.register(rule);
    }

    async analyze(data) {
        return await this.manager.evaluate(data);
    }

}

module.exports = ThreatEngine;