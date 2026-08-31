const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * ServiceRule
 * ─────────────────────────────────────────────────────────────
 * Detects new or modified system services with suspicious characteristics.
 * Cross-platform: Windows Services (Win32_Service), Linux (systemd), macOS (launchd).
 */
class ServiceRule extends ThreatRule {

    constructor() {
        const isWin = process.platform === "win32";
        const isMac = process.platform === "darwin";
        const ruleName = isWin
            ? "Suspicious Windows Service"
            : isMac
                ? "Suspicious macOS Launchd Service"
                : "Suspicious Linux Systemd Service";

        super(ruleName, "HIGH");

        this.suspiciousPaths = [
            "\\temp\\", "\\tmp\\", "/tmp/", "/dev/shm/",
            "\\appdata\\", "\\downloads\\", "\\users\\public\\",
            "\\desktop\\", "/home/"
        ];

        this.whitelist = [
            "lsm", "localsessionmanager", "svchost", "rpcss", "dcomlaunch",
            // Linux standard services & drivers
            "alsa", "alsa-utils", "alsa-restore", "alsa-state", "systemd", "dbus",
            "cron", "crond", "apparmor", "ufw", "ssh", "sshd", "rsyslog",
            "networkmanager", "wpa_supplicant", "bluetooth", "cups", "avahi",
            "polkit", "udisks", "upower", "pipewire", "wireplumber", "pulseaudio",
            "getty", "keyboard-setup", "console-setup", "networking"
        ];
    }

    async evaluate({ changes, services }) {
        // 1. Check new/modified services via change log
        if (changes && changes.length > 0) {
            for (const change of changes) {
                if (change.type !== "service") continue;
                if (change.action !== "ADDED" && change.action !== "MODIFIED") continue;

                const svc  = change.entry;
                const name = (svc.name || "").toLowerCase();
                const displayName = (svc.displayName || "").toLowerCase();

                // Allowlist check: ignore standard system core services and sound/network drivers
                if (this.whitelist.some(w => name.includes(w) || displayName.includes(w))) {
                    continue;
                }

                const path = (svc.path || "").toLowerCase();
                const inSuspiciousPath = this.suspiciousPaths.some(p => path.includes(p));

                if (inSuspiciousPath) {
                    return this._buildDetection(svc, change.action, "Service binary is located in an untrusted or user-writable path commonly used by malware.");
                }

                // If path directly invokes a reverse shell / script payload
                if (path.includes("curl ") || path.includes("wget ") || path.includes("base64") || (path.includes("powershell") && path.includes("-enc"))) {
                    return this._buildDetection(svc, change.action, "Service invokes an obfuscated script or network download command.");
                }
            }
        }

        // 2. Scan all existing services for high-risk attributes
        if (services) {
            for (const svc of services) {
                const path = (svc.path || "").toLowerCase();
                const name = (svc.name || "").toLowerCase();

                if (this.whitelist.some(w => name.includes(w))) continue;

                // Services running cmd/powershell directly with encoded commands are highly suspicious
                if ((path.includes("cmd.exe /c") || path.includes("powershell.exe -enc") || path.includes("bash -c")) &&
                    (path.includes("http://") || path.includes("https://") || path.includes("base64") || path.includes("/tmp/"))) {
                    return this._buildDetection(svc, "EXISTING", "Service directly invokes an interactive command shell with suspicious network or temp arguments.");
                }
            }
        }

        return null;
    }

    _buildDetection(svc, action, reason) {
        const serviceType = process.platform === "win32"
            ? "Windows service"
            : process.platform === "darwin"
                ? "macOS service"
                : "Linux systemd service";

        return {
            detected:       true,
            rule:           this.name,
            severity:       this.severity,
            process:        svc.name,
            pid:            "N/A",
            reason:         `${serviceType} "${svc.displayName || svc.name}" [${action}]: ${reason}`,
            recommendation: "Investigate this service immediately. Inspect its configuration before allowing it to start.",
            evidence: {
                action:      action,
                name:        svc.name,
                displayName: svc.displayName,
                path:        svc.path,
                runAs:       svc.runAs,
                startMode:   svc.startMode
            },
            mitre: ["T1543.003", "T1050"]
        };
    }
}

module.exports = ServiceRule;
