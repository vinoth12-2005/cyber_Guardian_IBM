class SystemAnalyzer {

    constructor(threatEngine, alertManager) {

        this.threatEngine = threatEngine;
        this.alertManager = alertManager;

    }

    async analyze(processes) {

        const detections = await this.threatEngine.analyze(processes);

        this.alertManager.clear();

        for (const detection of detections) {

            this.alertManager.add(detection);

        }

        return this.alertManager.getAll();

    }

}

module.exports = SystemAnalyzer;