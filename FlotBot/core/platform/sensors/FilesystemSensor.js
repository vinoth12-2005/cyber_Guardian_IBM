const PlatformSensor = require("../PlatformSensor");

class FilesystemSensor extends PlatformSensor {
    constructor(platform) {
        super("filesystem_sensor", platform);
    }

    async getMonitoredDirectories() {
        throw new Error("getMonitoredDirectories() must be implemented by native sensor");
    }

    async scanFileChanges() {
        throw new Error("scanFileChanges() must be implemented by native sensor");
    }

    async hashFile(filePath) {
        throw new Error("hashFile() must be implemented by native sensor");
    }
}

module.exports = FilesystemSensor;
