const { exec } = require("child_process");
const fs = require("fs");

/**
 * RegistryCollector  ─  Cross-Platform (Windows + Linux)
 * ─────────────────────────────────────────────────────────────
 * Windows: reads actual Windows Registry via PowerShell
 * Linux:   monitors Linux persistence equivalents:
 *   • ~/.config/autostart/*.desktop  (XDG autostart)
 *   • /etc/systemd/system/*.service  (systemd services)
 *   • /etc/init.d/*                  (SysV init scripts)
 *   • ~/.bashrc, ~/.profile           (shell persistence)
 *   • /etc/crontab + crontabs         (cron persistence)
 */
class RegistryCollector {

    constructor() {
        // Windows registry targets (used on win32 only)
        this.targets = [
            { name: "HKLM Run",          key: "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" },
            { name: "HKLM RunOnce",      key: "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce" },
            { name: "HKCU Run",          key: "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" },
            { name: "HKCU RunOnce",      key: "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce" },
            { name: "HKLM Run (32-bit)", key: "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run" },
            { name: "HKCU Run (32-bit)", key: "HKCU:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run" }
        ];
    }

    async collect() {
        if (process.platform === "win32") {
            return this._collectWindows();
        } else if (process.platform === "darwin") {
            return this._collectMacos();
        } else {
            return this._collectLinux();
        }
    }

    // ─── macOS Persistence Monitoring ────────────────────────────────────────

    async _collectMacos() {
        const [runKeys, services] = await Promise.all([
            this._collectMacosLaunchAgents(),
            this._collectMacosServices()
        ]);
        return { runKeys, services };
    }

    _collectMacosLaunchAgents() {
        return new Promise((resolve) => {
            const entries = [];
            const os = require("os");
            const path = require("path");
            const home = os.homedir();

            const dirs = [
                path.join(home, "Library/LaunchAgents"),
                "/Library/LaunchAgents",
                "/Library/LaunchDaemons"
            ];

            for (const dir of dirs) {
                try {
                    if (!fs.existsSync(dir)) continue;
                    const files = fs.readdirSync(dir).filter(f => f.endsWith(".plist"));
                    for (const file of files) {
                        entries.push({
                            keyPath:   dir,
                            valueName: file,
                            data:      path.join(dir, file)
                        });
                    }
                } catch { /* skip */ }
            }

            // Crontab
            try {
                const crontab = require("child_process")
                    .execSync("crontab -l 2>/dev/null", { timeout: 3000 })
                    .toString();
                const cronLines = crontab.split("\n").filter(l => l.trim() && !l.startsWith("#"));
                for (const line of cronLines) {
                    entries.push({
                        keyPath:   "crontab",
                        valueName: "cron",
                        data:      line.trim()
                    });
                }
            } catch { /* crontab empty or not available */ }

            // Shell files
            const rcFiles = [
                path.join(home, ".zshrc"),
                path.join(home, ".bash_profile"),
                path.join(home, ".profile")
            ];
            for (const rcFile of rcFiles) {
                try {
                    if (!fs.existsSync(rcFile)) continue;
                    const content = fs.readFileSync(rcFile, "utf8");
                    const suspicious = content.split("\n").filter(line => {
                        const l = line.toLowerCase();
                        return (l.includes("curl") || l.includes("wget") || l.includes("base64") ||
                                l.includes("python") || l.includes("bash -c") || l.includes("nc ") ||
                                l.includes("ncat") || l.includes("socat")) &&
                               !l.trim().startsWith("#");
                    });
                    for (const line of suspicious) {
                        entries.push({
                            keyPath:   rcFile,
                            valueName: "shell-persistence",
                            data:      line.trim()
                        });
                    }
                } catch { /* skip */ }
            }

            resolve(entries);
        });
    }

    _collectMacosServices() {
        return new Promise((resolve) => {
            exec("launchctl list 2>/dev/null", { timeout: 8000 }, (error, stdout) => {
                if (error || !stdout) return resolve([]);
                const services = [];
                const lines = stdout.trim().split("\n").slice(1);
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 3) continue;
                    const pid   = parts[0];
                    const label  = parts[2];
                    services.push({
                        name:        label,
                        displayName: label,
                        path:        "launchd label",
                        startMode:   "automatic",
                        state:       pid !== "-" ? "running" : "stopped",
                        runAs:       "unknown"
                    });
                }
                resolve(services.slice(0, 50));
            });
        });
    }

    // ─── Linux Persistence Monitoring ────────────────────────────────────────

    async _collectLinux() {
        const [runKeys, services] = await Promise.all([
            this._collectLinuxAutostart(),
            this._collectLinuxServices()
        ]);
        return { runKeys, services };
    }

    /** XDG Autostart + cron + shell rc persistence (Linux equivalent of Run keys) */
    _collectLinuxAutostart() {
        return new Promise((resolve) => {
            const entries = [];
            const os = require("os");
            const path = require("path");
            const home = os.homedir();

            // 1. XDG autostart entries
            const autostartDirs = [
                path.join(home, ".config/autostart"),
                "/etc/xdg/autostart"
            ];
            for (const dir of autostartDirs) {
                try {
                    if (!fs.existsSync(dir)) continue;
                    const files = fs.readdirSync(dir).filter(f => f.endsWith(".desktop"));
                    for (const file of files) {
                        try {
                            const content = fs.readFileSync(path.join(dir, file), "utf8");
                            const nameMatch = /^Name=(.+)/m.exec(content);
                            const execMatch = /^Exec=(.+)/m.exec(content);
                            const hiddenMatch = /^Hidden=true/mi.exec(content);
                            entries.push({
                                keyPath:   dir,
                                valueName: nameMatch?.[1]?.trim() || file,
                                data:      execMatch?.[1]?.trim() || "",
                                hidden:    !!hiddenMatch
                            });
                        } catch { /* skip */ }
                    }
                } catch { /* skip */ }
            }

            // 2. Crontab entries (potential persistence)
            try {
                const crontab = require("child_process")
                    .execSync("crontab -l 2>/dev/null", { timeout: 3000 })
                    .toString();
                const cronLines = crontab.split("\n").filter(l => l.trim() && !l.startsWith("#"));
                for (const line of cronLines) {
                    entries.push({
                        keyPath:   "crontab",
                        valueName: "cron",
                        data:      line.trim()
                    });
                }
            } catch { /* crontab empty or not available */ }

            // 3. Check ~/.bashrc and ~/.profile for suspicious additions
            const rcFiles = [
                path.join(home, ".bashrc"),
                path.join(home, ".profile"),
                path.join(home, ".bash_profile"),
                "/etc/rc.local"
            ];
            for (const rcFile of rcFiles) {
                try {
                    if (!fs.existsSync(rcFile)) continue;
                    const content = fs.readFileSync(rcFile, "utf8");
                    // Look for base64 or curl/wget persistence patterns
                    const suspicious = content.split("\n").filter(line => {
                        const l = line.toLowerCase();
                        return (l.includes("curl") || l.includes("wget") || l.includes("base64") ||
                                l.includes("python") || l.includes("bash -c") || l.includes("nc ") ||
                                l.includes("ncat") || l.includes("socat")) &&
                               !l.trim().startsWith("#");
                    });
                    for (const line of suspicious) {
                        entries.push({
                            keyPath:   rcFile,
                            valueName: "shell-persistence",
                            data:      line.trim()
                        });
                    }
                } catch { /* skip */ }
            }

            resolve(entries);
        });
    }

    /** Read systemd service files as the Linux equivalent of Windows services */
    _collectLinuxServices() {
        return new Promise((resolve) => {
            const services = [];
            const serviceDirs = [
                "/etc/systemd/system",
                "/lib/systemd/system",
                "/usr/lib/systemd/system"
            ];
            const path = require("path");

            for (const dir of serviceDirs) {
                try {
                    if (!fs.existsSync(dir)) continue;
                    const files = fs.readdirSync(dir)
                        .filter(f => f.endsWith(".service"))
                        .slice(0, 30); // cap at 30 per dir to avoid flooding

                    for (const file of files) {
                        try {
                            const content  = fs.readFileSync(path.join(dir, file), "utf8");
                            const execLine = /^ExecStart=(.+)/m.exec(content);
                            const descLine = /^Description=(.+)/m.exec(content);
                            const userLine = /^User=(.+)/m.exec(content);
                            const wantedBy = /^WantedBy=(.+)/m.exec(content);

                            services.push({
                                name:        file.replace(".service", ""),
                                displayName: descLine?.[1]?.trim() || file,
                                path:        execLine?.[1]?.trim() || "",
                                startMode:   wantedBy?.[1]?.trim() || "manual",
                                state:       "unknown",
                                runAs:       userLine?.[1]?.trim() || "root"
                            });
                        } catch { /* skip unreadable */ }
                    }
                } catch { /* skip inaccessible dirs */ }
            }

            resolve(services);
        });
    }

    // ─── Windows Registry (unchanged) ────────────────────────────────────────

    async _collectWindows() {
        const [runKeys, services] = await Promise.all([
            this._collectRunKeys(),
            this._collectServices()
        ]);
        return { runKeys, services };
    }

    _collectRunKeys() {
        const script = this.targets.map(({ name, key }) =>
            `try {
                $v = Get-ItemProperty -Path '${key}' -ErrorAction Stop;
                $v.PSObject.Properties |
                  Where-Object { $_.Name -notlike 'PS*' } |
                  ForEach-Object {
                    [PSCustomObject]@{
                      KeyPath=$('${key}'); ValueName=$_.Name; Data=$_.Value
                    }
                  }
            } catch {}`
        ).join(";");
        const psCmd = `powershell -NonInteractive -NoProfile -Command "${script} | ConvertTo-Json -Compress"`;
        return new Promise((resolve) => {
            exec(psCmd, { timeout: 15000, maxBuffer: 5 * 1024 * 1024 }, (error, stdout) => {
                if (error || !stdout.trim()) return resolve([]);
                try {
                    const raw     = JSON.parse(stdout.trim());
                    const entries = Array.isArray(raw) ? raw : [raw];
                    resolve(entries.map(e => ({
                        keyPath:   e.KeyPath   || "",
                        valueName: e.ValueName || "",
                        data:      e.Data      || ""
                    })));
                } catch { resolve([]); }
            });
        });
    }

    _collectServices() {
        const psCmd = [
            "powershell -NonInteractive -NoProfile -Command",
            "\"Get-WmiObject Win32_Service |",
            "Select-Object Name,DisplayName,PathName,StartMode,State,StartName |",
            "ConvertTo-Json -Compress\""
        ].join(" ");
        return new Promise((resolve) => {
            exec(psCmd, { timeout: 20000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout) => {
                if (error || !stdout.trim()) return resolve([]);
                try {
                    const raw      = JSON.parse(stdout.trim());
                    const services = Array.isArray(raw) ? raw : [raw];
                    resolve(services.map(s => ({
                        name:        s.Name        || "",
                        displayName: s.DisplayName || "",
                        path:        s.PathName    || "",
                        startMode:   s.StartMode   || "",
                        state:       s.State       || "",
                        runAs:       s.StartName   || ""
                    })));
                } catch { resolve([]); }
            });
        });
    }
}

module.exports = RegistryCollector;
