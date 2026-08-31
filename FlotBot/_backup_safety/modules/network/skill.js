/**
 * NetworkSkill
 * Orchestrates the full network monitoring pipeline:
 * collect → analyze → alert
 */
class NetworkSkill {

    constructor(collector, threatEngine, alertManager) {
        this.collector    = collector;
        this.threatEngine = threatEngine;
        this.alertManager = alertManager;
    }

    async execute() {

        const { connections, dnsCache } = await this.collector.collect();

        const detections = await this.threatEngine.analyze({ connections, dnsCache });

        this.alertManager.clear();

        for (const detection of detections) {
            this.alertManager.add(detection);
        }

        return {
            alerts:      this.alertManager.getAll(),
            connections,
            dnsCache
        };

    }

}

module.exports = NetworkSkill;
