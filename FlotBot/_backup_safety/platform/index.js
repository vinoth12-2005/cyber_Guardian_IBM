const LinuxAdapter = require("./linux/LinuxAdapter");
const WindowsAdapter = require("./windows/WindowsAdapter");
const MacOSAdapter = require("./macos/MacOSAdapter");

function getPlatformAdapter() {
    const platform = process.platform;
    if (platform === "win32") {
        return new WindowsAdapter();
    } else if (platform === "darwin") {
        return new MacOSAdapter();
    } else {
        return new LinuxAdapter();
    }
}

const activeAdapter = getPlatformAdapter();

module.exports = {
    getPlatformAdapter,
    activeAdapter,
    LinuxAdapter,
    WindowsAdapter,
    MacOSAdapter
};
