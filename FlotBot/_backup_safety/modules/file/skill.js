/**
 * FileSkill
 * Orchestrates the file monitoring pipeline: watch → analyze → alert.
 */
class FileSkill {

    constructor(watcher, threatEngine, alertManager) {
        this.watcher      = watcher;
        this.threatEngine = threatEngine;
        this.alertManager = alertManager;
    }

    async execute() {

        const { events, snapshot } = await this.watcher.scan();

        const detections = await this.threatEngine.analyze({ events });

        this.alertManager.clear();

        for (const detection of detections) {
            this.alertManager.add(detection);
        }

        return {
            alerts:   this.alertManager.getAll(),
            events,
            fileCount: snapshot.size
        };

    }

}

module.exports = FileSkill;
