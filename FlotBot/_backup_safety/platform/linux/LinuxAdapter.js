const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");
const SystemAdapter = require("../SystemAdapter");

/**
 * LinuxAdapter  ─  Native Linux Security Inspection
 * ─────────────────────────────────────────────────────────────
 * Reads /proc, /etc/os-release, ss, ps, ufw/iptables, systemd, and cron.
 */
class LinuxAdapter extends SystemAdapter {

    async getSystemInformation() {
        let prettyName = `Linux ${os.release()}`;
        try {
            if (fs.existsSync("/etc/os-release")) {
                const content = fs.readFileSync("/etc/os-release", "utf8");
                const match = /^PRETTY_NAME="?([^"\n]+)"?/m.exec(content);
                if (match) prettyName = match[1];
            }
        } catch { /* ignore */ }

        const cpus = os.cpus() || [];
        const totalMem = os.totalmem();
        const freeMem = os.freemem();

        return {
            platform: "Linux",
            osName: prettyName,
            kernel: os.release(),
            hostname: os.hostname(),
            arch: os.arch(),
            user: os.userInfo().username,
            privilegeLevel: process.getuid && process.getuid() === 0 ? "root" : "user",
            cpuModel: cpus[0]?.model?.trim() || "Generic CPU",
            cpuCores: cpus.length,
            totalMemMb: Math.round(totalMem / (1024 * 1024)),
            freeMemMb: Math.round(freeMem / (1024 * 1024)),
            uptimeSec: os.uptime()
        };
    }

    async getRunningProcesses() {
        return new Promise((resolve) => {
            exec("ps -eo pid,ppid,pcpu,pmem,user,comm,args --no-headers", { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);

                const lines = stdout.trim().split("\n");
                const processes = [];

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 6) continue;

                    const pid = parseInt(parts[0], 10);
                    const ppid = parseInt(parts[1], 10);
                    const cpu = parseFloat(parts[2]);
                    const mem = parseFloat(parts[3]);
                    const user = parts[4];
                    const name = parts[5];
                    const cmdLine = parts.slice(6).join(" ");

                    processes.push({
                        pid,
                        ppid,
                        name,
                        cmdLine,
                        user,
                        cpu,
                        mem,
                        exePath: `/proc/${pid}/exe`,
                        publisher: "Linux Core/Package",
                        signed: false
                    });
                }
                resolve(processes);
            });
        });
    }

    async getOpenNetworkConnections() {
        return new Promise((resolve) => {
            exec("ss -tunp 2>/dev/null", { maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const lines = stdout.trim().split("\n");
                const connections = [];

                for (const line of lines.slice(1)) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 5) continue;

                    const protocol = parts[0];
                    const state = parts[1];
                    const local = parts[4] || "";
                    const remote = parts[5] || "";
                    const processInfo = parts[6] || "";

                    const pidMatch = processInfo.match(/pid=(\d+)/);
                    const pid = pidMatch ? parseInt(pidMatch[1], 10) : null;

                    connections.push({
                        protocol,
                        state,
                        localAddr: local,
                        remoteAddr: remote,
                        pid
                    });
                }
                resolve(connections);
            });
        });
    }

    async getStartupItems() {
        const items = [];
        const autostartDir = `${os.homedir()}/.config/autostart`;
        try {
            if (fs.existsSync(autostartDir)) {
                const files = fs.readdirSync(autostartDir);
                for (const file of files) {
                    if (file.endsWith(".desktop")) {
                        items.push({
                            name: file,
                            location: `${autostartDir}/${file}`,
                            type: "XDG Autostart",
                            user: os.userInfo().username
                        });
                    }
                }
            }
        } catch { /* ignore */ }
        return items;
    }

    async getServices() {
        return new Promise((resolve) => {
            exec("systemctl list-unit-files --type=service --no-legend 2>/dev/null | head -50", (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const services = stdout.trim().split("\n").map(line => {
                    const [name, state] = line.trim().split(/\s+/);
                    return { name, state, type: "systemd" };
                });
                resolve(services);
            });
        });
    }

    async getFirewallStatus() {
        return new Promise((resolve) => {
            exec("ufw status 2>/dev/null", (err, stdout) => {
                if (!err && stdout?.toLowerCase().includes("active")) {
                    return resolve({ enabled: true, details: stdout.split("\n")[0].trim() });
                }
                exec("iptables -L INPUT -n 2>/dev/null | head -3", (err2, stdout2) => {
                    if (!err2 && stdout2?.includes("Chain")) {
                        return resolve({ enabled: true, details: "iptables active" });
                    }
                    resolve({ enabled: false, details: "Netfilter / ufw inactive" });
                });
            });
        });
    }

    async getSecurityStatus() {
        const appArmor = fs.existsSync("/sys/kernel/security/apparmor/profiles");
        const selinux = fs.existsSync("/sys/fs/selinux");
        return {
            appArmor,
            selinux,
            lsm: appArmor ? "AppArmor Enabled" : selinux ? "SELinux Enabled" : "LSM Active"
        };
    }

    async getLoggedInUsers() {
        return new Promise((resolve) => {
            exec("who 2>/dev/null", (err, stdout) => {
                if (err || !stdout) return resolve([{ user: os.userInfo().username, terminal: "tty" }]);
                const users = stdout.trim().split("\n").map(l => {
                    const parts = l.trim().split(/\s+/);
                    return { user: parts[0], terminal: parts[1], loginTime: parts.slice(2).join(" ") };
                });
                resolve(users);
            });
        });
    }

    async getDiskInformation() {
        return new Promise((resolve) => {
            exec("df -h --output=source,target,size,pcent 2>/dev/null | tail -n +2", (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const disks = stdout.trim().split("\n").map(line => {
                    const [filesystem, mount, size, usedPct] = line.trim().split(/\s+/);
                    return { filesystem, mount, size, usedPct };
                });
                resolve(disks);
            });
        });
    }

    async getRecentSystemEvents() {
        return new Promise((resolve) => {
            exec("journalctl -n 20 --no-pager 2>/dev/null", (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const events = stdout.trim().split("\n").map(msg => ({ timestamp: new Date().toISOString(), message: msg }));
                resolve(events);
            });
        });
    }
}

module.exports = LinuxAdapter;
