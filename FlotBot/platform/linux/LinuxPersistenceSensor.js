const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const PersistenceSensor = require("../../core/platform/sensors/PersistenceSensor");

class LinuxPersistenceSensor extends PersistenceSensor {
    constructor() {
        super("linux");
    }

    async getStartupItems() {
        const items = [];
        const home = os.homedir();
        const autostartDirs = [
            path.join(home, ".config", "autostart"),
            "/etc/xdg/autostart"
        ];

        for (const dir of autostartDirs) {
            try {
                if (!fs.existsSync(dir)) continue;
                const files = fs.readdirSync(dir).filter(f => f.endsWith(".desktop"));
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    const content = fs.readFileSync(fullPath, "utf8");
                    const nameMatch = /^Name=(.+)/m.exec(content);
                    const execMatch = /^Exec=(.+)/m.exec(content);
                    items.push({
                        type: "XDG Autostart",
                        name: nameMatch ? nameMatch[1].trim() : file,
                        location: fullPath,
                        command: execMatch ? execMatch[1].trim() : "",
                        user: os.userInfo().username
                    });
                }
            } catch {}
        }

        // Crontabs
        try {
            const { execSync } = require("child_process");
            const cronOutput = execSync("crontab -l 2>/dev/null", { timeout: 3000 }).toString();
            const lines = cronOutput.split("\n").filter(l => l.trim() && !l.startsWith("#"));
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
            const serviceDirs = ["/etc/systemd/system", "/lib/systemd/system"];
            const services = [];

            for (const dir of serviceDirs) {
                try {
                    if (!fs.existsSync(dir)) continue;
                    const files = fs.readdirSync(dir).filter(f => f.endsWith(".service")).slice(0, 40);
                    for (const file of files) {
                        try {
                            const content = fs.readFileSync(path.join(dir, file), "utf8");
                            const execLine = /^ExecStart=(.+)/m.exec(content);
                            const descLine = /^Description=(.+)/m.exec(content);
                            services.push({
                                name: file.replace(".service", ""),
                                displayName: descLine ? descLine[1].trim() : file,
                                path: execLine ? execLine[1].trim() : "",
                                type: "systemd"
                            });
                        } catch {}
                    }
                } catch {}
            }
            resolve(services);
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

module.exports = LinuxPersistenceSensor;
