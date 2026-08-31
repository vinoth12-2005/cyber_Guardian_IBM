const os = require("os");
const fs = require("fs");
const { execSync } = require("child_process");

/**
 * PermissionManager
 * ─────────────────────────────────────────────────────────────
 * Inspects OS security permissions across Windows, macOS, and Linux.
 * Provides user-facing instructions and remediation for missing permissions.
 */
class PermissionManager {

    /**
     * Check all system permissions for the current OS.
     * @returns {object} Permission report
     */
    static checkPermissions() {
        const platform = process.platform;
        const report = {
            platform,
            isElevated: false,
            filesystem: "AVAILABLE",
            process: "AVAILABLE",
            network: "AVAILABLE",
            screen: "AVAILABLE",
            persistence: "AVAILABLE",
            response: "AVAILABLE",
            missingPermissions: []
        };

        if (platform === "linux") {
            const isRoot = process.getuid ? process.getuid() === 0 : false;
            report.isElevated = isRoot;

            if (!isRoot) {
                report.response = "ADMIN REQUIRED";
                report.missingPermissions.push({
                    permission: "Root Privileges",
                    subsystem: "Response Engine / Firewall",
                    status: "DEGRADED",
                    remediation: "Run FlotBot with sudo or add CAP_NET_ADMIN capabilities if network firewall control is needed: 'sudo flotbot'"
                });
            }

            // Check display server
            if (process.env.WAYLAND_DISPLAY && !process.env.DISPLAY) {
                report.screen = "WAYLAND DEGRADED";
                report.missingPermissions.push({
                    permission: "Screen Capture (Wayland)",
                    subsystem: "Screen Security Engine",
                    status: "DEGRADED",
                    remediation: "Ensure xdg-desktop-portal is installed and running for Wayland screenshot capabilities."
                });
            }

        } else if (platform === "darwin") {
            const isRoot = process.getuid ? process.getuid() === 0 : false;
            report.isElevated = isRoot;

            // macOS specific permissions check
            report.missingPermissions.push({
                permission: "Screen Recording",
                subsystem: "Screen Security Engine",
                status: "REQUIRED",
                remediation: "Open System Settings → Privacy & Security → Screen Recording, and enable FlotBot."
            });
            report.missingPermissions.push({
                permission: "Full Disk Access",
                subsystem: "Malware Scanner & Persistence",
                status: "RECOMMENDED",
                remediation: "Open System Settings → Privacy & Security → Full Disk Access, and enable FlotBot to scan system directories."
            });

        } else if (platform === "win32") {
            let isAdmin = false;
            try {
                execSync("net session", { stdio: "ignore" });
                isAdmin = true;
            } catch {}
            report.isElevated = isAdmin;

            if (!isAdmin) {
                report.response = "ADMIN REQUIRED";
                report.missingPermissions.push({
                    permission: "Administrator Privileges",
                    subsystem: "Response Engine / Windows Firewall",
                    status: "DEGRADED",
                    remediation: "Right-click FloatBot and select 'Run as Administrator' to enable Windows Defender Firewall blocking and full system process remediation."
                });
            }
        }

        return report;
    }
}

module.exports = PermissionManager;
