const { exec } = require("child_process");
const NetworkSensor = require("../../core/platform/sensors/NetworkSensor");

class MacOSNetworkSensor extends NetworkSensor {
    constructor() {
        super("darwin");
    }

    async getActiveSockets() {
        const t0 = Date.now();
        return new Promise((resolve) => {
            exec("netstat -anf inet 2>/dev/null", { timeout: 8000 }, (err, stdout) => {
                if (err || !stdout) {
                    this._recordError(err || new Error("macOS netstat failed"));
                    return resolve([]);
                }

                const connections = [];
                const lines = stdout.split("\n").slice(2);

                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 5) continue;
                    const protocol = (parts[0] || "tcp").toUpperCase();
                    const localFull = parts[3] || "";
                    const peerFull = parts[4] || "";
                    const state = parts[5] || "ESTABLISHED";
                    const [localAddr, localPort] = this._splitAddr(localFull);
                    const [remoteAddr, remotePort] = this._splitAddr(peerFull);

                    connections.push({
                        protocol,
                        localAddr,
                        localPort,
                        remoteAddr,
                        remotePort,
                        state: state.toUpperCase(),
                        pid: "0"
                    });
                }

                this._recordCollection(Date.now() - t0);
                resolve(connections);
            });
        });
    }

    async getDnsCache() {
        return new Promise((resolve) => {
            exec("cat /etc/hosts 2>/dev/null", { timeout: 3000 }, (err, stdout) => {
                const entries = [];
                if (!err && stdout) {
                    for (const line of stdout.split("\n")) {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 2) {
                            const ip = parts[0];
                            const name = parts[1];
                            if (ip && name && !ip.startsWith("127") && !ip.startsWith("::1")) {
                                entries.push({ name, ip, type: "A" });
                            }
                        }
                    }
                }
                resolve(entries);
            });
        });
    }

    _splitAddr(addrStr) {
        if (!addrStr || addrStr === "*.*") return ["*", "*"];
        const lastDot = addrStr.lastIndexOf(".");
        if (lastDot === -1) return [addrStr, "0"];
        return [addrStr.substring(0, lastDot), addrStr.substring(lastDot + 1)];
    }

    async collect() {
        const [connections, dnsCache] = await Promise.all([
            this.getActiveSockets(),
            this.getDnsCache()
        ]);
        return { connections, dnsCache };
    }
}

module.exports = MacOSNetworkSensor;
