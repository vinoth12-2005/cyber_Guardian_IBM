const PlatformSensor = require("../PlatformSensor");

class PersistenceSensor extends PlatformSensor {
    constructor(platform) {
        super("persistence_sensor", platform);
    }

    async getStartupItems() {
        throw new Error("getStartupItems() must be implemented by native sensor");
    }

    async getServices() {
        throw new Error("getServices() must be implemented by native sensor");
    }

    async getScheduledTasks() {
        throw new Error("getScheduledTasks() must be implemented by native sensor");
    }
}

module.exports = PersistenceSensor;
