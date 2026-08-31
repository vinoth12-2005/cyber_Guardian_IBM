const { exec } = require("child_process");
const ProcessSensor = require("../../core/platform/sensors/ProcessSensor");

class WindowsProcessSensor extends ProcessSensor {
    constructor() {
        super("win32");
    }

    async getRunningProcesses() {
        const t0 = Date.now();
        return new Promise((resolve) => {
            const psCmd = 'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,ExecutablePath,CommandLine,Name | ConvertTo-Json -Compress';
            const cmd = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${psCmd}"`;

            exec(cmd, { maxBuffer: 15 * 1024 * 1024, timeout: 10000 }, (err, stdout) => {
                if (err || !stdout || !stdout.trim()) {
                    return this._fallbackTasklist(t0).then(resolve);
                }

                try {
                    const parsed = JSON.parse(stdout.trim());
                    const list = Array.isArray(parsed) ? parsed : [parsed];
                    const processes = list.map(p => ({
                        pid: parseInt(p.ProcessId, 10),
                        ppid: parseInt(p.ParentProcessId || "0", 10),
                        name: p.Name || "Unknown",
                        cmdLine: p.CommandLine || p.Name || "",
                        exePath: p.ExecutablePath || "",
                        user: "SYSTEM / User",
                        cpu: 0,
                        mem: "N/A"
                    }));
                    this._recordCollection(Date.now() - t0);
                    resolve(processes);
                } catch {
                    this._fallbackTasklist(t0).then(resolve);
                }
            });
        });
    }

    _fallbackTasklist(t0) {
        return new Promise((resolve) => {
            exec("tasklist /FO CSV /NH", { timeout: 8000 }, (err, stdout) => {
                if (err || !stdout) {
                    this._recordError(err || new Error("Tasklist failed"));
                    return resolve([]);
                }
                const lines = stdout.trim().split("\n").filter(l => l.trim());
                const procs = lines.map(line => {
                    const values = line.replace(/\r/g, "").replace(/^"|"$/g, "").split('","');
                    return {
                        pid: parseInt(values[1] || "0", 10),
                        ppid: 0,
                        name: values[0] || "",
                        cmdLine: values[0] || "",
                        exePath: "",
                        user: "User",
                        mem: values[4] || "0 K"
                    };
                });
                this._recordCollection(Date.now() - t0);
                resolve(procs);
            });
        });
    }

    async getProcessTree() {
        const processes = await this.getRunningProcesses();
        const tree = new Map();
        const roots = [];

        for (const p of processes) {
            tree.set(p.pid, { ...p, children: [] });
        }

        for (const p of processes) {
            const node = tree.get(p.pid);
            if (p.ppid && tree.has(p.ppid)) {
                tree.get(p.ppid).children.push(node);
            } else {
                roots.push(node);
            }
        }

        return { processes, tree, roots };
    }

    async getProcessThreads(pid) {
        return new Promise((resolve) => {
            const filter = pid ? `? {$_.Id -eq ${pid}}` : `? {$_.Threads.Count -gt 5}`;
            const psCmd = `Get-Process | ${filter} | Select-Object Id, ProcessName, @{N='ThreadCount';E={$_.Threads.Count}}, CPU, Path | Sort-Object ThreadCount -Descending | Select-Object -First 30 | ConvertTo-Json -Compress`;
            const cmd = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${psCmd}"`;

            exec(cmd, { timeout: 8000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);
                try {
                    const parsed = JSON.parse(stdout.trim());
                    const list = Array.isArray(parsed) ? parsed : [parsed];
                    resolve(list.map(item => ({
                        pid: item.Id,
                        name: item.ProcessName,
                        threadCount: item.ThreadCount || 0,
                        cpu: item.CPU ? parseFloat(item.CPU.toFixed(1)) : 0,
                        path: item.Path || ""
                    })));
                } catch {
                    resolve([]);
                }
            });
        });
    }

    async collect() {
        return this.getRunningProcesses();
    }
}

module.exports = WindowsProcessSensor;
