class SystemSkill {

    constructor(collector, threatEngine, alertManager) {
        this.collector = collector;
        this.threatEngine = threatEngine;
        this.alertManager = alertManager;
    }

    async execute() {

        // Collect running processes
        const processes = await this.collector.collect();

        // Analyze them
        const detections = await this.threatEngine.analyze(processes);

        // Clear previous alerts
        this.alertManager.clear();

        // Store new alerts
        for (const detection of detections) {
            this.alertManager.add(detection);
        }

        // Return alerts
        return this.alertManager.getAll();
    }

}

module.exports = SystemSkill;