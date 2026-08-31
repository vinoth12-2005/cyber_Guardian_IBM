class ThreatManager {

    constructor() {
        this.rules = [];
    }

    register(rule) {
        this.rules.push(rule);
    }

    async evaluate(data) {

        const alerts = [];

        for (const rule of this.rules) {

            const result = await rule.evaluate(data);

            if (result) {
                alerts.push(result);
            }

        }

        return alerts;
    }

}

module.exports = ThreatManager;