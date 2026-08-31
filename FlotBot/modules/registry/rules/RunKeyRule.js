const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * RunKeyRule
 * ─────────────────────────────────────────────────────────────
 * Detects new or modified persistence autostart entries.
 * Cross-platform: Windows Registry Run/RunOnce, Linux XDG autostart, macOS LaunchAgents.
 */
class RunKeyRule extends ThreatRule {

    constructor() {
        const isWin = process.platform === "win32";
        const isMac = process.platform === "darwin";
        const ruleName = isWin
            ? "Windows Registry Run Key Persistence"
            : isMac
                ? "macOS LaunchAgent Persistence"
                : "Linux Autostart Persistence";

        super(ruleName, "HIGH");

        // Known-safe Run key and autostart entry names (lowercase)
        this.whitelist = new Set([
            "windows defender", "securityhealth", "onedrive", "teams", "discord", "steam",
            "nvbackend", "realtekhd", "igfxtray", "igfxhkcmd", "igfxpers", "hkcmd",
            // Linux standard desktop autostart entries
            "at-spi-bus-launcher", "at-spi-dbus-bus", "at-spi d-bus bus", "pulseaudio",
            "pipewire", "wireplumber", "gnome-keyring-daemon", "gnome-keyring-pkcs11",
            "gnome-keyring-secrets", "gnome-keyring-ssh", "tracker-miner-fs",
            "xdg-user-dirs", "im-config", "geoclue-demo-agent", "orca", "kaccess",
            "polkit-kde-authentication-agent-1", "xembedsniproxy", "org.kde.plasma.volume",
            "gmenudbusmenuproxy", "org.kde.kdeconnect.daemon", "ibus-autostart"
        ]);

        // Suspicious path patterns in persistence values
        this.suspiciousPaths = [
            "\\temp\\", "\\tmp\\", "/tmp/", "/dev/shm/",
            "\\appdata\\local\\temp\\", "\\downloads\\", "\\users\\public\\",
            "curl", "wget", "base64", "powershell -enc", "bash -c"
        ];
    }

    async evaluate({ changes }) {
        if (!changes || !changes.length) return null;

        for (const change of changes) {
            if (change.type !== "runKey") continue;
            if (change.action !== "ADDED" && change.action !== "MODIFIED") continue;

            const entry = change.entry;
            const name  = (entry.valueName || "").toLowerCase();
            const data  = (entry.data      || "").toLowerCase();

            // Ignore whitelisted standard desktop and OS autostart components
            if (this.whitelist.has(name)) continue;
            if (Array.from(this.whitelist).some(w => name.includes(w))) continue;

            // Flag if data points to a suspicious execution path or payload
            const suspicious = this.suspiciousPaths.some(p => data.includes(p));

            if (suspicious) {
                const label = process.platform === "win32"
                    ? "Registry Run key"
                    : process.platform === "darwin"
                        ? "macOS LaunchAgent"
                        : "Linux Autostart entry";

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       suspicious ? "HIGH" : "MEDIUM",
                    process:        entry.valueName,
                    pid:            "N/A",
                    reason:         `${label} ${change.action.toLowerCase()}: "${entry.valueName}" → "${entry.data}" in ${entry.keyPath}`,
                    recommendation: "Verify this startup entry is legitimate. Inspect the referenced executable binary before allowing it to run at boot.",
                    evidence: {
                        action:    change.action,
                        keyPath:   entry.keyPath,
                        valueName: entry.valueName,
                        data:      entry.data,
                        oldData:   change.oldData || null
                    },
                    mitre: ["T1547.001", "T1060"]
                };
            }
        }

        return null;
    }
}

module.exports = RunKeyRule;
