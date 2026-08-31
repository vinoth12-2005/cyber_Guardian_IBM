/**
 * NetworkAnalyzer
 * Runs all registered network rules against connection data.
 */
class NetworkAnalyzer {

    constructor(threatEngine, alertManager) {
        this.threatEngine = threatEngine;
        this.alertManager = alertManager;
    }

    async analyze(connections, dnsCache = []) {

        const detections = await this.threatEngine.analyze({ connections, dnsCache });

        this.alertManager.clear();

        for (const detection of detections) {
            this.alertManager.add(detection);
        }

        return this.alertManager.getAll();

    }

}

module.exports = NetworkAnalyzer;
