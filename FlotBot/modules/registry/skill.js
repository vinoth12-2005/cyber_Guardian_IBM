/**
 * RegistrySkill
 * Orchestrates registry monitoring: collect → watch (diff) → analyze → alert.
 */
class RegistrySkill {

    constructor(watcher, threatEngine, alertManager) {
        this.watcher      = watcher;
        this.threatEngine = threatEngine;
        this.alertManager = alertManager;
    }

    async execute() {

        const { changes, runKeys, services } = await this.watcher.scan();

        const detections = await this.threatEngine.analyze({ runKeys, services, changes });

        this.alertManager.clear();

        for (const detection of detections) {
            this.alertManager.add(detection);
        }

        return {
            alerts:   this.alertManager.getAll(),
            runKeys,
            services,
            changes
        };

    }

}

module.exports = RegistrySkill;
