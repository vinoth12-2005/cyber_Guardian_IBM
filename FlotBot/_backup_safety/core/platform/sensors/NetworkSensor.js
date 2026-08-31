const PlatformSensor = require("../PlatformSensor");

class NetworkSensor extends PlatformSensor {
    constructor(platform) {
        super("network_sensor", platform);
    }

    async getActiveSockets() {
        throw new Error("getActiveSockets() must be implemented by native sensor");
    }

    async getDnsCache() {
        throw new Error("getDnsCache() must be implemented by native sensor");
    }
}

module.exports = NetworkSensor;
