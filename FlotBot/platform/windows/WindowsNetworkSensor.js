const { exec } = require("child_process");
const NetworkSensor = require("../../core/platform/sensors/NetworkSensor");

class WindowsNetworkSensor extends NetworkSensor {
    constructor() {
        super("win32");
    }

    async getActiveSockets() {
        const t0 = Date.now();
        return new Promise((resolve) => {
            exec("netstat -ano", { timeout: 8000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
                if (err || !stdout) {
                    this._recordError(err || new Error("Netstat failed"));
                    return resolve([]);
                }

                const lines = stdout.split("\n");
                const connections = [];

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith("Active") || trimmed.startsWith("Proto")) continue;
                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 4) continue;

                    const protocol = parts[0].toUpperCase();
                    const isTcp = protocol.startsWith("TCP");
                    const state = isTcp ? (parts[3] || "") : "LISTENING";
                    const pid = isTcp ? (parts[4] || "0") : (parts[3] || "0");
                    const [localAddr, localPort] = this._splitAddr(parts[1] || "");
                    const [remoteAddr, remotePort] = this._splitAddr(parts[2] || "");

                    connections.push({
                        protocol,
                        localAddr,
                        localPort,
                        remoteAddr,
                        remotePort,
                        state: state.toUpperCase(),
                        pid: pid.replace(/\r/g, "")
                    });
                }

                this._recordCollection(Date.now() - t0);
                resolve(connections);
            });
        });
    }

    async getDnsCache() {
        return new Promise((resolve) => {
            exec("ipconfig /displaydns", { timeout: 6000 }, (err, stdout) => {
                if (err || !stdout) return resolve([]);
                const entries = [];
                const recordNameRx = /Record Name\s*\.+\s*:\s*(.+)/i;
                const recordTypeRx = /Record Type\s*\.+\s*:\s*(.+)/i;
                const dataRx = /A \(Host\) Record\s*\.+\s*:\s*(.+)/i;
                let currentEntry = {};

                for (const line of stdout.split("\n")) {
                    const nameMatch = recordNameRx.exec(line);
                    const typeMatch = recordTypeRx.exec(line);
                    const dataMatch = dataRx.exec(line);
                    if (nameMatch) currentEntry.name = nameMatch[1].trim();
                    if (typeMatch) currentEntry.type = typeMatch[1].trim();
                    if (dataMatch) {
                        currentEntry.ip = dataMatch[1].trim();
                        if (currentEntry.name) entries.push({ ...currentEntry });
                        currentEntry = {};
                    }
                }
                resolve(entries);
            });
        });
    }

    _splitAddr(addrStr) {
        if (!addrStr || addrStr === "*:*") return ["*", "*"];
        const ipv6Match = /^\[(.+)\]:(\d+)$/.exec(addrStr);
        if (ipv6Match) return [ipv6Match[1], ipv6Match[2]];
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

module.exports = WindowsNetworkSensor;
