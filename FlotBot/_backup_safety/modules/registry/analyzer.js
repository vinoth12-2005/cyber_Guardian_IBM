/**
 * RegistryAnalyzer
 * Runs registry threat rules against collected registry data.
 */
class RegistryAnalyzer {

    constructor(threatEngine, alertManager) {
        this.threatEngine = threatEngine;
        this.alertManager = alertManager;
    }

    async analyze(runKeys, services, changes = []) {

        const detections = await this.threatEngine.analyze({ runKeys, services, changes });

        this.alertManager.clear();

        for (const detection of detections) {
            this.alertManager.add(detection);
        }

        return this.alertManager.getAll();

    }

}

module.exports = RegistryAnalyzer;
