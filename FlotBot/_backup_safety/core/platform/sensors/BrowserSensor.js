const PlatformSensor = require("../PlatformSensor");

class BrowserSensor extends PlatformSensor {
    constructor(platform) {
        super("browser_sensor", platform);
    }

    async getVisitedUrls() {
        throw new Error("getVisitedUrls() must be implemented by native sensor");
    }

    async getActiveBrowserTabs() {
        throw new Error("getActiveBrowserTabs() must be implemented by native sensor");
    }
}

module.exports = BrowserSensor;
