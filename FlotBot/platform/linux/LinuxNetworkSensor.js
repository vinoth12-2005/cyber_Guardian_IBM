const { exec } = require("child_process");
const fs = require("fs");
const NetworkSensor = require("../../core/platform/sensors/NetworkSensor");

class LinuxNetworkSensor extends NetworkSensor {
    constructor() {
        super("linux");
    }

    async getActiveSockets() {
        const t0 = Date.now();
        return new Promise((resolve) => {
            exec("ss -tunp 2>/dev/null", { maxBuffer: 5 * 1024 * 1024, timeout: 5000 }, (err, stdout) => {
                if (err || !stdout) {
                    const fallback = this._fallbackProcNet();
                    this._recordCollection(Date.now() - t0);
                    return resolve(fallback);
                }

                const lines = stdout.trim().split("\n").slice(1);
                const connections = [];

                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 6) continue;

                    const protocol = (parts[0] || "tcp").toUpperCase();
                    const state = (parts[1] || "UNKNOWN").toUpperCase();
                    const localFull = parts[4] || "";
                    const peerFull = parts[5] || "";
                    const procInfo = parts.slice(6).join(" ") || "";

                    let pid = "0";
                    const pidMatch = /pid=(\d+)/.exec(procInfo);
                    if (pidMatch) pid = pidMatch[1];

                    const [localAddr, localPort] = this._splitAddr(localFull);
                    const [remoteAddr, remotePort] = this._splitAddr(peerFull);

                    connections.push({
                        protocol,
                        state,
                        localAddr,
                        localPort,
                        remoteAddr,
                        remotePort,
                        pid
                    });
                }

                this._recordCollection(Date.now() - t0);
                resolve(connections);
            });
        });
    }

    async getDnsCache() {
        return new Promise((resolve) => {
            exec("cat /etc/hosts 2>/dev/null | head -50", { timeout: 3000 }, (err, stdout) => {
                const entries = [];
                if (!err && stdout) {
                    const lines = stdout.split("\n");
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed.startsWith("#")) continue;
                        const parts = trimmed.split(/\s+/);
                        if (parts.length >= 2) {
                            const ip = parts[0];
                            const name = parts[1];
                            if (ip && name && !ip.startsWith("127") && !ip.startsWith("::")) {
                                entries.push({ name, ip, type: "A" });
                            }
                        }
                    }
                }
                resolve(entries);
            });
        });
    }

    _fallbackProcNet() {
        const connections = [];
        try {
            const files = ["/proc/net/tcp", "/proc/net/tcp6"];
            for (const file of files) {
                if (!fs.existsSync(file)) continue;
                const lines = fs.readFileSync(file, "utf8").split("\n").slice(1);
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 10) continue;
                    const localHex = parts[1] || "";
                    const remoteHex = parts[2] || "";
                    const state = parseInt(parts[3] || "0", 16);

                    const stateMap = { 1:"ESTABLISHED",2:"SYN_SENT",3:"SYN_RECV",4:"FIN_WAIT1",5:"FIN_WAIT2",6:"TIME_WAIT",7:"CLOSE",8:"CLOSE_WAIT",9:"LAST_ACK",10:"LISTEN",11:"CLOSING" };

                    connections.push({
                        protocol: "TCP",
                        localAddr: this._hexToAddr(localHex.split(":")[0]),
                        localPort: parseInt(localHex.split(":")[1] || "0", 16).toString(),
                        remoteAddr: this._hexToAddr(remoteHex.split(":")[0]),
                        remotePort: parseInt(remoteHex.split(":")[1] || "0", 16).toString(),
                        state: stateMap[state] || "UNKNOWN",
                        pid: "0"
                    });
                }
            }
        } catch {}
        return connections;
    }

    _hexToAddr(hex) {
        if (!hex || hex.length < 8) return "0.0.0.0";
        const bytes = [];
        for (let i = 0; i < 8; i += 2) {
            bytes.unshift(parseInt(hex.slice(i, i + 2), 16));
        }
        return bytes.join(".");
    }

    _splitAddr(addrStr) {
        if (!addrStr || addrStr === "*:*") return ["*", "*"];
        const lastColon = addrStr.lastIndexOf(":");
        if (lastColon === -1) return [addrStr, "0"];
        return [addrStr.substring(0, lastColon), addrStr.substring(lastColon + 1)];
    }

    async collect() {
        const [connections, dnsCache] = await Promise.all([
            this.getActiveSockets(),
            this.getDnsCache()
        ]);
        return { connections, dnsCache };
    }
}

module.exports = LinuxNetworkSensor;
