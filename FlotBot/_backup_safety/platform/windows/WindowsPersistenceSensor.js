const { exec } = require("child_process");
const PersistenceSensor = require("../../core/platform/sensors/PersistenceSensor");

class WindowsPersistenceSensor extends PersistenceSensor {
    constructor() {
        super("win32");
        this.runKeyTargets = [
            "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
            "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce",
            "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
            "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce",
            "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run"
        ];
    }

    async getStartupItems() {
        const script = this.runKeyTargets.map(key =>
            `try {
                $v = Get-ItemProperty -Path '${key}' -ErrorAction Stop;
                $v.PSObject.Properties |
                  Where-Object { $_.Name -notlike 'PS*' } |
                  ForEach-Object {
                    [PSCustomObject]@{
                      Location=$('${key}'); Name=$_.Name; Command=$_.Value; Type='Windows Registry Run'
                    }
                  }
            } catch {}`
        ).join(";");

        const psCmd = `powershell -NonInteractive -NoProfile -ExecutionPolicy Bypass -Command "${script} | ConvertTo-Json -Compress"`;

        return new Promise((resolve) => {
            exec(psCmd, { timeout: 10000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout || !stdout.trim()) return resolve([]);
                try {
                    const raw = JSON.parse(stdout.trim());
                    const list = Array.isArray(raw) ? raw : [raw];
                    resolve(list.map(item => ({
                        type: item.Type || "Windows Registry Run",
                        name: item.Name || "",
                        location: item.Location || "",
                        command: item.Command || "",
                        user: "Registry User"
                    })));
                } catch {
                    resolve([]);
                }
            });
        });
    }

    async getServices() {
        const psCmd = 'Get-Service | Select-Object Name,DisplayName,Status,StartType | ConvertTo-Json -Compress';
        const cmd = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${psCmd}"`;

        return new Promise((resolve) => {
            exec(cmd, { timeout: 10000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout || !stdout.trim()) return resolve([]);
                try {
                    const raw = JSON.parse(stdout.trim());
                    const list = Array.isArray(raw) ? raw : [raw];
                    resolve(list.map(s => ({
                        name: s.Name || "",
                        displayName: s.DisplayName || s.Name || "",
                        state: s.Status || "",
                        startType: s.StartType || "",
                        type: "Windows Service"
                    })));
                } catch {
                    resolve([]);
                }
            });
        });
    }

    async getScheduledTasks() {
        const psCmd = 'Get-ScheduledTask | Select-Object TaskName,TaskPath,State | Select-Object -First 50 | ConvertTo-Json -Compress';
        const cmd = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${psCmd}"`;

        return new Promise((resolve) => {
            exec(cmd, { timeout: 10000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout || !stdout.trim()) return resolve([]);
                try {
                    const raw = JSON.parse(stdout.trim());
                    const list = Array.isArray(raw) ? raw : [raw];
                    resolve(list.map(t => ({
                        name: t.TaskName || "",
                        location: t.TaskPath || "",
                        state: t.State || "",
                        type: "Windows Scheduled Task"
                    })));
                } catch {
                    resolve([]);
                }
            });
        });
    }

    async collect() {
        const [startupItems, services, tasks] = await Promise.all([
            this.getStartupItems(),
            this.getServices(),
            this.getScheduledTasks()
        ]);
        return { startupItems, services, scheduledTasks: tasks };
    }
}

module.exports = WindowsPersistenceSensor;
