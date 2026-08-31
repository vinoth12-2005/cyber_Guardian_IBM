const PlatformSensor = require("../PlatformSensor");

class ProcessSensor extends PlatformSensor {
    constructor(platform) {
        super("process_sensor", platform);
    }

    async getProcessTree() {
        throw new Error("getProcessTree() must be implemented by native sensor");
    }

    async getRunningProcesses() {
        throw new Error("getRunningProcesses() must be implemented by native sensor");
    }

    async getProcessThreads(pid) {
        throw new Error("getProcessThreads() must be implemented by native sensor");
    }
}

module.exports = ProcessSensor;
