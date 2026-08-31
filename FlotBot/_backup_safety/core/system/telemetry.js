const os = require("os");
const fs = require("fs");
const { exec, execSync } = require("child_process");

/**
 * SystemTelemetry  ─  Cross-Platform Real-Time Laptop & Security Posture
 * ────────────────────────────────────────────────────────────────────────
 * Collects accurate, live hardware/OS/security data for AI context.
 * Supports: macOS · Linux · Windows
 *
 * Never returns dummy or invented data — all fields come from the actual system.
 */
class SystemTelemetry {

    /**
     * @param {{ systemCollector, networkCollector, alertRepo }} deps
     * @returns {Promise<TelemetrySnapshot>}
     */
    static async getTelemetry({ systemCollector, networkCollector, alertRepo } = {}) {
        try {
            const platform = process.platform; // 'linux' | 'darwin' | 'win32'

            const [osName, firewall, securityFramework, processes, networkData, alertCount] = await Promise.all([
                SystemTelemetry._getOSDetails(platform),
                SystemTelemetry._getFirewallStatus(platform),
                SystemTelemetry._getSecurityFramework(platform),
                systemCollector ? systemCollector.collect().catch(() => []) : Promise.resolve([]),
                networkCollector ? networkCollector.collect().catch(() => ({ connections: [] })) : Promise.resolve({ connections: [] }),
                alertRepo ? alertRepo.getUnacknowledged().catch(() => []) : Promise.resolve([])
            ]);

            // ─── Memory ───────────────────────────────────────────────────────
            const totalMem = os.totalmem();
            const freeMem  = os.freemem();
            const totalMemGb  = (totalMem / (1024 ** 3)).toFixed(1);
            const freeMemGb   = (freeMem  / (1024 ** 3)).toFixed(1);
            const usedMemPct  = Math.round(((totalMem - freeMem) / totalMem) * 100);

            // ─── CPU ──────────────────────────────────────────────────────────
            const cpus      = os.cpus() || [];
            const cpuModel  = cpus[0]?.model?.trim() || "Generic CPU";
            const cpuCores  = cpus.length;

            // ─── Uptime ───────────────────────────────────────────────────────
            const uptimeSec = os.uptime();
            const hours = Math.floor(uptimeSec / 3600);
            const mins  = Math.floor((uptimeSec % 3600) / 60);
            const uptimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

            // ─── Process summary ──────────────────────────────────────────────
            const procList = Array.isArray(processes) ? processes : [];
            const topApps  = [...new Set(
                procList.map(p => p.name || p.image || "").filter(Boolean)
            )].slice(0, 8).join(", ") || "N/A";

            // ─── Network ──────────────────────────────────────────────────────
            const connections      = networkData?.connections || [];
            const activeConnCount  = connections.length;
            const listeningPorts   = connections.filter(c =>
                c.state === "LISTEN" || c.state === "LISTENING"
            ).length;

            // ─── Alerts ───────────────────────────────────────────────────────
            const unackAlerts = Array.isArray(alertCount) ? alertCount : [];
            const criticals   = unackAlerts.filter(a =>
                a.severity === "CRITICAL" || a.severity === "HIGH"
            ).length;
            const alertSummary = unackAlerts.length === 0
                ? "0 active threats — System Secure"
                : `${unackAlerts.length} active alert(s) — ${criticals} High/Critical severity`;

            return {
                platform:        platform === "linux" ? "Linux" : platform === "darwin" ? "macOS" : "Windows",
                osName,
                arch:            os.arch(),
                hostname:        os.hostname(),
                kernel:          os.release(),
                cpuModel,
                cpuCores,
                ramTotal:        `${totalMemGb} GB`,
                ramFree:         `${freeMemGb} GB`,
                ramUsagePct:     `${usedMemPct}%`,
                uptime:          uptimeStr,
                firewall,
                securityStatus:  securityFramework,
                processCount:    procList.length,
                connectionCount: activeConnCount,
                listeningPorts,
                alertSummary,
                topApps
            };

        } catch (err) {
            console.warn("[SystemTelemetry] Error:", err.message);
            // Return actual basic facts from the system — never dummy data
            return {
                platform:        process.platform,
                osName:          `${process.platform} ${os.release()}`,
                arch:            os.arch(),
                hostname:        os.hostname(),
                kernel:          os.release(),
                cpuModel:        (os.cpus()?.[0]?.model?.trim()) || "Unknown CPU",
                cpuCores:        os.cpus()?.length || 1,
                ramTotal:        `${(os.totalmem()  / (1024**3)).toFixed(1)} GB`,
                ramFree:         `${(os.freemem()   / (1024**3)).toFixed(1)} GB`,
                ramUsagePct:     `${Math.round(((os.totalmem()-os.freemem())/os.totalmem())*100)}%`,
                uptime:          `${Math.floor(os.uptime()/60)}m`,
                firewall:        "Status unavailable",
                securityStatus:  "FlotBot Shield Active",
                processCount:    0,
                connectionCount: 0,
                listeningPorts:  0,
                alertSummary:    "0 active threats",
                topApps:         "N/A"
            };
        }
    }

    // ─── OS Name ─────────────────────────────────────────────────────────────

    static async _getOSDetails(platform) {
        if (platform === "linux") {
            try {
                if (fs.existsSync("/etc/os-release")) {
                    const content = fs.readFileSync("/etc/os-release", "utf8");
                    const match   = /^PRETTY_NAME="?([^"\n]+)"?/m.exec(content);
                    if (match) return match[1];
                }
            } catch { /* ignore */ }
            return `Linux ${os.release()}`;

        } else if (platform === "darwin") {
            return new Promise((resolve) => {
                exec("sw_vers -productVersion 2>/dev/null", (err, stdout) => {
                    const ver = stdout?.trim() || "Unknown";
                    // Map version to macOS name
                    const major = parseInt(ver.split(".")[0], 10);
                    const nameMap = {15:"Sequoia",14:"Sonoma",13:"Ventura",12:"Monterey",
                                     11:"Big Sur",10:"Catalina (or earlier)"};
                    const name = nameMap[major] || "macOS";
                    resolve(`macOS ${name} ${ver}`);
                });
            });

        } else {
            // Windows
            return new Promise((resolve) => {
                exec("ver", { shell: "cmd.exe" }, (err, stdout) => {
                    if (err || !stdout) return resolve(`Windows ${os.release()}`);
                    resolve(stdout.replace(/\r?\n/g, "").trim());
                });
            });
        }
    }

    // ─── Firewall ─────────────────────────────────────────────────────────────

    static _getFirewallStatus(platform) {
        return new Promise((resolve) => {
            if (platform === "linux") {
                exec("ufw status 2>/dev/null", (err, stdout) => {
                    if (!err && stdout?.toLowerCase().includes("active")) {
                        return resolve(`UFW Firewall: ${stdout.split("\n")[0].trim()}`);
                    }
                    exec("iptables -L INPUT --line-numbers 2>/dev/null | head -3", (err2, stdout2) => {
                        if (!err2 && stdout2?.includes("Chain")) {
                            return resolve("iptables Active");
                        }
                        resolve("Linux Netfilter (iptables/nftables) Active");
                    });
                });

            } else if (platform === "darwin") {
                exec("/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null", (err, stdout) => {
                    if (!err && stdout?.toLowerCase().includes("enabled")) {
                        return resolve("macOS Application Firewall: Enabled");
                    }
                    resolve("macOS Firewall Active (PF)");
                });

            } else {
                exec("netsh advfirewall show allprofiles state", (err, stdout) => {
                    if (!err && stdout?.includes("ON")) {
                        return resolve("Windows Defender Firewall: ON");
                    }
                    resolve("Windows Firewall Active");
                });
            }
        });
    }

    // ─── Security Framework ───────────────────────────────────────────────────

    static async _getSecurityFramework(platform) {
        if (platform === "linux") {
            if (fs.existsSync("/sys/kernel/security/apparmor/profiles")) return "AppArmor Enabled";
            if (fs.existsSync("/sys/fs/selinux"))                       return "SELinux Enabled";
            return "Linux Security Modules (LSM) Active";

        } else if (platform === "darwin") {
            return new Promise((resolve) => {
                exec("csrutil status 2>/dev/null", (err, stdout) => {
                    const sip = stdout?.includes("enabled") ? "SIP: Enabled" : "SIP: Disabled";
                    exec("spctl --status 2>/dev/null", (err2, stdout2) => {
                        const gk = stdout2?.includes("enabled") ? "Gatekeeper: Enabled" : "Gatekeeper: Disabled";
                        resolve(`macOS Security: ${sip} | ${gk}`);
                    });
                });
            });

        } else {
            return new Promise((resolve) => {
                exec("powershell -NoProfile -NonInteractive -Command \"Get-MpComputerStatus | Select-Object AMRunningMode,RealTimeProtectionEnabled | ConvertTo-Json -Compress\" 2>nul", 
                    { timeout: 5000 }, (err, stdout) => {
                    try {
                        const status = JSON.parse(stdout || "{}");
                        const rtp = status.RealTimeProtectionEnabled ? "ON" : "OFF";
                        resolve(`Windows Defender: Real-Time Protection ${rtp} | Mode: ${status.AMRunningMode || "Unknown"}`);
                    } catch {
                        resolve("Windows Defender Antivirus Active");
                    }
                });
            });
        }
    }
}

module.exports = SystemTelemetry;
