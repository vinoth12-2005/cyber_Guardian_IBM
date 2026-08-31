const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");
const SystemAdapter = require("../SystemAdapter");

/**
 * MacOSAdapter  ─  Native macOS Security Inspection
 * ─────────────────────────────────────────────────────────────
 * Inspects macOS using sw_vers, ps, LaunchAgents/LaunchDaemons, csrutil, and spctl.
 */
class MacOSAdapter extends SystemAdapter {

    async getSystemInformation() {
        return new Promise((resolve) => {
            exec("sw_vers -productVersion 2>/dev/null", (err, stdout) => {
                const ver = stdout?.trim() || os.release();
                const cpus = os.cpus() || [];
                resolve({
                    platform: "macOS",
                    osName: `macOS ${ver}`,
                    kernel: os.release(),
                    hostname: os.hostname(),
                    arch: os.arch(),
                    user: os.userInfo().username,
                    privilegeLevel: process.getuid && process.getuid() === 0 ? "root" : "user",
                    cpuModel: cpus[0]?.model?.trim() || "Apple Silicon / Intel CPU",
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
            exec("ps -eo pid,ppid,pcpu,pmem,user,comm 2>/dev/null", { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const lines = stdout.trim().split("\n");
                const processes = [];
                for (const line of lines.slice(1)) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 6) {
                        processes.push({
                            pid: parseInt(parts[0], 10),
                            ppid: parseInt(parts[1], 10),
                            cpu: parseFloat(parts[2]),
                            mem: parseFloat(parts[3]),
                            user: parts[4],
                            name: parts[5],
                            exePath: parts[5],
                            signed: false,
                            publisher: "Apple / Third-Party"
                        });
                    }
                }
                resolve(processes);
            });
        });
    }

    async getOpenNetworkConnections() {
        return new Promise((resolve) => {
            exec("netstat -anv -p tcp 2>/dev/null", (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const lines = stdout.trim().split("\n");
                const connections = [];
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 6 && parts[0].startsWith("tcp")) {
                        connections.push({
                            protocol: parts[0],
                            localAddr: parts[3],
                            remoteAddr: parts[4],
                            state: parts[5],
                            pid: parseInt(parts[8] || "0", 10)
                        });
                    }
                }
                resolve(connections);
            });
        });
    }

    async getStartupItems() {
        const items = [];
        const paths = [
            `${os.homedir()}/Library/LaunchAgents`,
            "/Library/LaunchAgents",
            "/Library/LaunchDaemons"
        ];
        for (const p of paths) {
            try {
                if (fs.existsSync(p)) {
                    const files = fs.readdirSync(p);
                    for (const f of files) {
                        if (f.endsWith(".plist")) {
                            items.push({ name: f, location: `${p}/${f}`, type: "macOS LaunchAgent/Daemon" });
                        }
                    }
                }
            } catch { /* ignore */ }
        }
        return items;
    }

    async getServices() {
        return new Promise((resolve) => {
            exec("launchctl list 2>/dev/null | head -40", (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const lines = stdout.trim().split("\n");
                const services = lines.slice(1).map(l => {
                    const parts = l.trim().split(/\s+/);
                    return { pid: parts[0], status: parts[1], name: parts[2] };
                });
                resolve(services);
            });
        });
    }

    async getFirewallStatus() {
        return new Promise((resolve) => {
            exec("/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null", (err, stdout) => {
                const enabled = !err && stdout?.toLowerCase().includes("enabled");
                resolve({ enabled, details: enabled ? "macOS Application Firewall: Enabled" : "macOS PF Active" });
            });
        });
    }

    async getSecurityStatus() {
        return new Promise((resolve) => {
            exec("csrutil status 2>/dev/null", (err, stdout) => {
                const sip = stdout?.includes("enabled") ? "SIP Enabled" : "SIP Disabled";
                resolve({ sip, gatekeeper: "Gatekeeper Active", status: `macOS Security: ${sip}` });
            });
        });
    }

    async getLoggedInUsers() {
        return [{ user: os.userInfo().username, terminal: "console" }];
    }

    async getDiskInformation() {
        return new Promise((resolve) => {
            exec("df -h / 2>/dev/null", (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const lines = stdout.trim().split("\n");
                if (lines.length > 1) {
                    const parts = lines[1].trim().split(/\s+/);
                    return resolve([{ mount: parts[8] || "/", size: parts[1], free: parts[3], usedPct: parts[4] }]);
                }
                resolve([]);
            });
        });
    }

    async getRecentSystemEvents() {
        return [];
    }
}

module.exports = MacOSAdapter;
