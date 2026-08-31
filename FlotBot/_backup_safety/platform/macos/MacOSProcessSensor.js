const { exec } = require("child_process");
const ProcessSensor = require("../../core/platform/sensors/ProcessSensor");

class MacOSProcessSensor extends ProcessSensor {
    constructor() {
        super("darwin");
    }

    async getRunningProcesses() {
        const t0 = Date.now();
        return new Promise((resolve) => {
            const cmd = "ps -eo pid,ppid,pcpu,pmem,user,comm 2>/dev/null";
            exec(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 8000 }, (err, stdout) => {
                if (err || !stdout) {
                    this._recordError(err || new Error("macOS ps failed"));
                    return resolve([]);
                }

                const lines = stdout.trim().split("\n");
                const processes = [];

                for (const line of lines.slice(1)) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 6) continue;

                    const pid = parseInt(parts[0], 10);
                    const ppid = parseInt(parts[1], 10);
                    const cpu = parseFloat(parts[2]) || 0;
                    const mem = parseFloat(parts[3]) || 0;
                    const user = parts[4];
                    const name = parts[5];

                    processes.push({
                        pid,
                        ppid,
                        name,
                        cmdLine: name,
                        user,
                        cpu,
                        mem,
                        exePath: name
                    });
                }

                this._recordCollection(Date.now() - t0);
                resolve(processes);
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
            const cmd = "ps -A -o pid,wq,pcpu,comm | sort -k2 -rn | head -n 30";
            exec(cmd, { timeout: 5000 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const results = [];
                const lines = stdout.trim().split("\n").slice(1);
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 4) continue;
                    results.push({
                        pid: parseInt(parts[0], 10),
                        threadCount: parseInt(parts[1], 10) || 1,
                        cpu: parseFloat(parts[2]) || 0,
                        name: parts.slice(3).join(" ")
                    });
                }
                resolve(results);
            });
        });
    }

    async collect() {
        return this.getRunningProcesses();
    }
}

module.exports = MacOSProcessSensor;
