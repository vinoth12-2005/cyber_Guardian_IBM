const os = require("os");
const { exec } = require("child_process");
const SystemAdapter = require("../SystemAdapter");

/**
 * WindowsAdapter  ─  Native Windows Security Inspection
 * ─────────────────────────────────────────────────────────────
 * Inspects Windows using WMI, PowerShell, netstat, and Registry.
 */
class WindowsAdapter extends SystemAdapter {

    async getSystemInformation() {
        return new Promise((resolve) => {
            exec("ver", { shell: "cmd.exe" }, (err, stdout) => {
                const verStr = stdout ? stdout.trim() : `Windows ${os.release()}`;
                const cpus = os.cpus() || [];
                resolve({
                    platform: "Windows",
                    osName: verStr,
                    kernel: os.release(),
                    hostname: os.hostname(),
                    arch: os.arch(),
                    user: os.userInfo().username,
                    privilegeLevel: "user",
                    cpuModel: cpus[0]?.model?.trim() || "Generic CPU",
                    cpuCores: cpus.length,
                    totalMemMb: Math.round(os.totalmem() / (1024 * 1024)),
                    freeMemMb: Math.round(os.freemem() / (1024 * 1024)),
                    uptimeSec: os.uptime()
                });
            });
        });
    }

    async getRunningProcesses() {
        return new Promise((resolve) => {
            exec("powershell -NoProfile -NonInteractive -Command \"Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,ExecutablePath,CommandLine,Name | ConvertTo-Json -Compress\"",
                { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
                    if (err || !stdout) return resolve([]);
                    try {
                        const parsed = JSON.parse(stdout);
                        const list = Array.isArray(parsed) ? parsed : [parsed];
                        const procs = list.map(p => ({
                            pid: p.ProcessId,
                            ppid: p.ParentProcessId,
                            name: p.Name,
                            cmdLine: p.CommandLine || p.Name,
                            exePath: p.ExecutablePath || "",
                            user: "Windows System",
                            signed: false,
                            publisher: "Unknown"
                        }));
                        resolve(procs);
                    } catch {
                        resolve([]);
                    }
                });
        });
    }

    async getOpenNetworkConnections() {
        return new Promise((resolve) => {
            exec("netstat -ano", { maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const lines = stdout.trim().split("\n");
                const connections = [];

                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 5 && (parts[0] === "TCP" || parts[0] === "UDP")) {
                        connections.push({
                            protocol: parts[0],
                            localAddr: parts[1],
                            remoteAddr: parts[2],
                            state: parts[3],
                            pid: parseInt(parts[4] || "0", 10)
                        });
                    }
                }
                resolve(connections);
            });
        });
    }

    async getStartupItems() {
        return new Promise((resolve) => {
            exec("powershell -NoProfile -NonInteractive -Command \"Get-CimInstance Win32_StartupCommand | Select-Object Name,Command,Location,User | ConvertTo-Json -Compress\"",
                (err, stdout) => {
                    if (err || !stdout) return resolve([]);
                    try {
                        const parsed = JSON.parse(stdout);
                        const list = Array.isArray(parsed) ? parsed : [parsed];
                        resolve(list.map(s => ({
                            name: s.Name,
                            command: s.Command,
                            location: s.Location,
                            user: s.User,
                            type: "Windows Startup Command"
                        })));
                    } catch {
                        resolve([]);
                    }
                });
        });
    }

    async getServices() {
        return new Promise((resolve) => {
            exec("powershell -NoProfile -NonInteractive -Command \"Get-Service | Select-Object Name,Status,StartType | ConvertTo-Json -Compress\"",
                { maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
                    if (err || !stdout) return resolve([]);
                    try {
                        const parsed = JSON.parse(stdout);
                        const list = Array.isArray(parsed) ? parsed : [parsed];
                        resolve(list.map(s => ({ name: s.Name, state: s.Status, startType: s.StartType })));
                    } catch {
                        resolve([]);
                    }
                });
        });
    }

    async getFirewallStatus() {
        return new Promise((resolve) => {
            exec("netsh advfirewall show allprofiles state", (err, stdout) => {
                const enabled = !err && stdout?.includes("ON");
                resolve({ enabled, details: enabled ? "Windows Defender Firewall: ON" : "Windows Firewall OFF" });
            });
        });
    }

    async getSecurityStatus() {
        return new Promise((resolve) => {
            exec("powershell -NoProfile -NonInteractive -Command \"Get-MpComputerStatus | Select-Object AMRunningMode,RealTimeProtectionEnabled | ConvertTo-Json -Compress\"",
                (err, stdout) => {
                    try {
                        const status = JSON.parse(stdout || "{}");
                        resolve({
                            realTimeProtection: !!status.RealTimeProtectionEnabled,
                            mode: status.AMRunningMode || "Standard",
                            defenderActive: true
                        });
                    } catch {
                        resolve({ realTimeProtection: true, mode: "Active", defenderActive: true });
                    }
                });
        });
    }

    async getLoggedInUsers() {
        return [{ user: os.userInfo().username, terminal: "Console" }];
    }

    async getDiskInformation() {
        return new Promise((resolve) => {
            exec("wmic logicaldisk get caption,description,freespace,size /format:csv 2>nul", (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const lines = stdout.trim().split("\n");
                const disks = [];
                for (const line of lines.slice(1)) {
                    const parts = line.split(",");
                    if (parts.length >= 5) {
                        disks.push({
                            mount: parts[1],
                            filesystem: parts[2],
                            freeSpace: parts[3],
                            size: parts[4]
                        });
                    }
                }
                resolve(disks);
            });
        });
    }

    async getRecentSystemEvents() {
        return [];
    }
}

module.exports = WindowsAdapter;
