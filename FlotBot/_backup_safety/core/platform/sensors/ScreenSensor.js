const PlatformSensor = require("../PlatformSensor");

class ScreenSensor extends PlatformSensor {
    constructor(platform) {
        super("screen_sensor", platform);
        this.mode = "MANUAL"; // "OFF" | "MANUAL" | "PERIODIC" | "EVENT_TRIGGERED"
    }

    setMode(mode) {
        if (["OFF", "MANUAL", "PERIODIC", "EVENT_TRIGGERED"].includes(mode)) {
            this.mode = mode;
        }
    }

    async captureScreen() {
        throw new Error("captureScreen() must be implemented by native sensor");
    }

    async extractText(imageBuffer) {
        throw new Error("extractText() must be implemented by native sensor");
    }
}

module.exports = ScreenSensor;
