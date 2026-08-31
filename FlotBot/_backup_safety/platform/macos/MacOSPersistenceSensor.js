const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const PersistenceSensor = require("../../core/platform/sensors/PersistenceSensor");

class MacOSPersistenceSensor extends PersistenceSensor {
    constructor() {
        super("darwin");
    }

    async getStartupItems() {
        const items = [];
        const home = os.homedir();
        const dirs = [
            path.join(home, "Library", "LaunchAgents"),
            "/Library/LaunchAgents",
            "/Library/LaunchDaemons"
        ];

        for (const dir of dirs) {
            try {
                if (!fs.existsSync(dir)) continue;
                const files = fs.readdirSync(dir).filter(f => f.endsWith(".plist"));
                for (const file of files) {
                    items.push({
                        type: "macOS LaunchAgent/Daemon",
                        name: file,
                        location: path.join(dir, file),
                        command: path.join(dir, file),
                        user: os.userInfo().username
                    });
                }
            } catch {}
        }

        // Crontab
        try {
            const { execSync } = require("child_process");
            const crontab = execSync("crontab -l 2>/dev/null", { timeout: 3000 }).toString();
            const lines = crontab.split("\n").filter(l => l.trim() && !l.startsWith("#"));
            for (const l of lines) {
                items.push({
                    type: "User Crontab",
                    name: "cron-job",
                    location: "crontab",
                    command: l.trim(),
                    user: os.userInfo().username
                });
            }
        } catch {}

        return items;
    }

    async getServices() {
        return new Promise((resolve) => {
            exec("launchctl list 2>/dev/null | head -40", { timeout: 5000 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const services = [];
                const lines = stdout.trim().split("\n").slice(1);
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 3) {
                        services.push({
                            name: parts[2],
                            displayName: parts[2],
                            pid: parts[0],
                            state: parts[0] !== "-" ? "running" : "stopped",
                            type: "launchd"
                        });
                    }
                }
                resolve(services);
            });
        });
    }

    async getScheduledTasks() {
        return this.getStartupItems();
    }

    async collect() {
        const [startupItems, services] = await Promise.all([
            this.getStartupItems(),
            this.getServices()
        ]);
        return { startupItems, services };
    }
}

module.exports = MacOSPersistenceSensor;
