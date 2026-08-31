const { exec } = require("child_process");
const os = require("os");

/**
 * SystemCollector  ─  Cross-Platform (Windows + Linux)
 * ─────────────────────────────────────────────────────────────
 * Windows: uses tasklist + PowerShell CIM
 * Linux:   uses /proc filesystem + ps command
 */
class SystemCollector {

    async collect() {
        if (this._getProcessList !== SystemCollector.prototype._getProcessList) {
            return this._collectWindows();
        }
        if (process.platform === "win32") {
            return this._collectWindows();
        } else {
            // macOS and Linux both support ps -eo
            return this._collectLinux();
        }
    }

    // ─── Linux Collection (ps + /proc) ───────────────────────────────────────

    async _collectLinux() {
        return new Promise((resolve) => {
            // ps aux gives: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
            // ps -eo gives structured fields
            const cmd = "ps -eo pid,ppid,pcpu,pmem,rss,comm,args --no-headers 2>/dev/null";
            exec(cmd, { timeout: 10000, maxBuffer: 5 * 1024 * 1024 }, (error, stdout) => {
                if (error || !stdout) return resolve([]);

                const processes = [];
                const lines = stdout.trim().split("\n");

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    // Fields: PID PPID %CPU %MEM RSS COMM ...ARGS
                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 6) continue;

                    const pid       = parts[0] || "0";
                    const ppid      = parts[1] || "0";
                    const cpu       = parts[2] || "0";
                    const memPct    = parts[3] || "0";
                    const rssKb     = parseInt(parts[4] || "0", 10);
                    const comm      = parts[5] || "";
                    const cmdLine   = parts.slice(6).join(" ") || comm;

                    // Format memory similar to Windows K format
                    const memKb     = rssKb;
                    const memStr    = memKb > 1024
                        ? `${(memKb / 1024).toFixed(1)} MB`
                        : `${memKb} KB`;

                    processes.push({
                        pid,
                        image:         comm,
                        name:          comm,
                        memoryRaw:     memStr,
                        session:       "Console",
                        sessionNumber: "0",
                        // Enhanced fields
                        cmdLine,
                        exePath:       cmdLine.split(" ")[0] || "",
                        parentPid:     ppid,
                        cpu:           parseFloat(cpu) || 0,
                        memPercent:    parseFloat(memPct) || 0
                    });
                }

                resolve(processes);
            });
        });
    }

    // ─── Windows Collection (tasklist + PowerShell CIM) ──────────────────────

    async _collectWindows() {
        const [processes, details] = await Promise.all([
            this._getProcessList(),
            this._getProcessDetails()
        ]);
        return processes.map(proc => {
            const detail = details.get(String(proc.pid)) || {};
            return { ...proc, ...detail };
        });
    }

    _getProcessList() {
        return new Promise((resolve, reject) => {
            exec("tasklist /FO CSV /NH", (error, stdout) => {
                if (error) return reject(error);
                const processes = stdout
                    .trim().split("\n").filter(l => l.trim())
                    .map(line => {
                        const values = line.replace(/\r/g, "").replace(/^"|"$/g, "").split('","');
                        return {
                            image:         values[0] || "",
                            pid:           values[1] || "0",
                            session:       values[2] || "",
                            sessionNumber: values[3] || "0",
                            memoryRaw:     values[4] || "0 K"
                        };
                    });
                resolve(processes);
            });
        });
    }

    async _getProcessDetails() {
        try {
            const cimDetails = await this._getProcessDetailsCim();
            if (cimDetails && cimDetails.size > 0) return cimDetails;
            return await this._getProcessDetailsWmic();
        } catch {
            return await this._getProcessDetailsWmic();
        }
    }

    _getProcessDetailsCim() {
        return new Promise((resolve, reject) => {
            const psCmd = 'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,ExecutablePath,CommandLine | ConvertTo-Json -Compress';
            const cmd   = `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${psCmd}"`;
            exec(cmd, { maxBuffer: 15 * 1024 * 1024, timeout: 10000 }, (error, stdout) => {
                if (error) return reject(error);
                const detailMap = new Map();
                const trimmed   = (stdout || "").trim();
                if (!trimmed) return resolve(detailMap);
                try {
                    const items = Array.isArray(JSON.parse(trimmed)) ? JSON.parse(trimmed) : [JSON.parse(trimmed)];
                    for (const item of items) {
                        if (!item?.ProcessId) continue;
                        detailMap.set(String(item.ProcessId).trim(), {
                            cmdLine:   String(item.CommandLine  || "").trim(),
                            exePath:   String(item.ExecutablePath || "").trim(),
                            parentPid: String(item.ParentProcessId ?? "0").trim()
                        });
                    }
                    resolve(detailMap);
                } catch (e) { reject(e); }
            });
        });
    }

    _getProcessDetailsWmic() {
        return new Promise((resolve) => {
            exec("wmic process get ProcessId,ParentProcessId,ExecutablePath,CommandLine /format:csv",
                { maxBuffer: 10 * 1024 * 1024, timeout: 10000 },
                (error, stdout) => {
                    const detailMap = new Map();
                    if (error || !stdout) return resolve(detailMap);
                    const lines = stdout.trim().split("\n").filter(l => l.trim() && !l.startsWith("Node"));
                    for (const line of lines) {
                        const parts = line.replace(/\r/g, "").split(",");
                        if (parts.length < 5) continue;
                        const pid = parts[4] || "0";
                        if (pid && pid !== "0") {
                            detailMap.set(pid.trim(), {
                                cmdLine:   (parts[1] || "").trim(),
                                exePath:   (parts[2] || "").trim(),
                                parentPid: (parts[3] || "0").trim()
                            });
                        }
                    }
                    resolve(detailMap);
                }
            );
        });
    }
}

module.exports = SystemCollector;