const LinuxFilesystemSensor = require("./linux/LinuxFilesystemSensor");
const LinuxProcessSensor = require("./linux/LinuxProcessSensor");
const LinuxNetworkSensor = require("./linux/LinuxNetworkSensor");
const LinuxPersistenceSensor = require("./linux/LinuxPersistenceSensor");

const WindowsFilesystemSensor = require("./windows/WindowsFilesystemSensor");
const WindowsProcessSensor = require("./windows/WindowsProcessSensor");
const WindowsNetworkSensor = require("./windows/WindowsNetworkSensor");
const WindowsPersistenceSensor = require("./windows/WindowsPersistenceSensor");

const MacOSFilesystemSensor = require("./macos/MacOSFilesystemSensor");
const MacOSProcessSensor = require("./macos/MacOSProcessSensor");
const MacOSNetworkSensor = require("./macos/MacOSNetworkSensor");
const MacOSPersistenceSensor = require("./macos/MacOSPersistenceSensor");

const CapabilityRegistry = require("../core/platform/CapabilityRegistry");
const PermissionManager = require("../core/platform/PermissionManager");

/**
 * PlatformFactory
 * ─────────────────────────────────────────────────────────────
 * Cross-platform factory returning native platform sensors and providers.
 */
class PlatformFactory {

    static getPlatform() {
        return process.platform;
    }

    static createFilesystemSensor() {
        const platform = process.platform;
        if (platform === "win32") return new WindowsFilesystemSensor();
        if (platform === "darwin") return new MacOSFilesystemSensor();
        return new LinuxFilesystemSensor();
    }

    static createProcessSensor() {
        const platform = process.platform;
        if (platform === "win32") return new WindowsProcessSensor();
        if (platform === "darwin") return new MacOSProcessSensor();
        return new LinuxProcessSensor();
    }

    static createNetworkSensor() {
        const platform = process.platform;
        if (platform === "win32") return new WindowsNetworkSensor();
        if (platform === "darwin") return new MacOSNetworkSensor();
        return new LinuxNetworkSensor();
    }

    static createPersistenceSensor() {
        const platform = process.platform;
        if (platform === "win32") return new WindowsPersistenceSensor();
        if (platform === "darwin") return new MacOSPersistenceSensor();
        return new LinuxPersistenceSensor();
    }

    static getCapabilityRegistry() {
        return new CapabilityRegistry();
    }

    static getPermissionManager() {
        return PermissionManager;
    }
}

module.exports = PlatformFactory;
