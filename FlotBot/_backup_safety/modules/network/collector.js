const { exec } = require("child_process");
const fs = require("fs");

/**
 * NetworkCollector  ─  Cross-Platform (Windows + Linux)
 * ─────────────────────────────────────────────────────────────
 * Windows: uses netstat -ano + ipconfig /displaydns
 * Linux:   uses ss -tunp + /proc/net/tcp  + /etc/hosts DNS cache
 */
class NetworkCollector {

    async collect() {
        const [connections, dnsCache] = await Promise.all([
            this._getConnections(),
            this._getDnsCache()
        ]);
        return { connections, dnsCache };
    }

    // ─── Connections ─────────────────────────────────────────────────────────

    _getConnections() {
        if (process.platform === "win32")   return this._getConnectionsWindows();
        if (process.platform === "darwin")  return this._getConnectionsMacos();
        return this._getConnectionsLinux();
    }

    _getConnectionsMacos() {
        return new Promise((resolve) => {
            // netstat -anp tcp works on macOS (note: -p tcp, not -anp together)
            exec("netstat -anf inet 2>/dev/null", { timeout: 8000 }, (error, stdout) => {
                if (error || !stdout) return resolve([]);
                const connections = [];
                const lines = stdout.split("\n").slice(2); // skip headers
                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 5) continue;
                    const protocol  = (parts[0] || "tcp").toUpperCase();
                    const localFull = parts[3] || "";
                    const peerFull  = parts[4] || "";
                    const state     = parts[5] || "ESTABLISHED";
                    const [localAddr, localPort]   = this._splitAddr(localFull);
                    const [remoteAddr, remotePort] = this._splitAddr(peerFull);
                    connections.push({
                        protocol, localAddr, localPort, remoteAddr, remotePort, state, pid: "0"
                    });
                }
                resolve(connections);
            });
        });
    }

    _getConnectionsLinux() {
        return new Promise((resolve) => {
            // ss -tunp: TCP+UDP+numeric+process
            // Columns: Netid State Recv-Q Send-Q Local Address:Port Peer Address:Port Process
            exec("ss -tunp 2>/dev/null", { timeout: 8000 }, (error, stdout) => {
                if (error || !stdout) return resolve(this._fallbackProcNet());

                const connections = [];
                const lines = stdout.trim().split("\n").slice(1); // skip header

                for (const line of lines) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length < 6) continue;

                    const protocol  = (parts[0] || "tcp").toLowerCase();
                    const state     = parts[1] || "UNKNOWN";
                    const localFull = parts[4] || "";
                    const peerFull  = parts[5] || "";
                    const procInfo  = parts.slice(6).join(" ") || "";

                    // Extract PID from process info: users:(("name",pid=1234,fd=5))
                    let pid = "0";
                    const pidMatch = /pid=(\d+)/.exec(procInfo);
                    if (pidMatch) pid = pidMatch[1];

                    const [localAddr, localPort]   = this._splitAddr(localFull);
                    const [remoteAddr, remotePort] = this._splitAddr(peerFull);

                    connections.push({
                        protocol:   protocol.toUpperCase(),
                        localAddr,
                        localPort,
                        remoteAddr,
                        remotePort,
                        state:      state.toUpperCase(),
                        pid
                    });
                }

                resolve(connections);
            });
        });
    }

    /** Fallback: read /proc/net/tcp + /proc/net/tcp6 directly */
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
                    const localHex  = parts[1] || "";
                    const remoteHex = parts[2] || "";
                    const state     = parseInt(parts[3] || "0", 16);
                    const uid       = parts[7] || "0";
                    const inode     = parts[9] || "0";

                    const stateMap = { 1:"ESTABLISHED",2:"SYN_SENT",3:"SYN_RECV",
                        4:"FIN_WAIT1",5:"FIN_WAIT2",6:"TIME_WAIT",7:"CLOSE",
                        8:"CLOSE_WAIT",9:"LAST_ACK",10:"LISTEN",11:"CLOSING" };

                    connections.push({
                        protocol:   "TCP",
                        localAddr:  this._hexToAddr(localHex.split(":")[0]),
                        localPort:  parseInt(localHex.split(":")[1] || "0", 16).toString(),
                        remoteAddr: this._hexToAddr(remoteHex.split(":")[0]),
                        remotePort: parseInt(remoteHex.split(":")[1] || "0", 16).toString(),
                        state:      stateMap[state] || "UNKNOWN",
                        pid:        "0"
                    });
                }
            }
        } catch { /* ignore */ }
        return connections;
    }

    _hexToAddr(hex) {
        if (!hex || hex.length < 8) return "0.0.0.0";
        // Little-endian IPv4
        const bytes = [];
        for (let i = 0; i < 8; i += 2) {
            bytes.unshift(parseInt(hex.slice(i, i + 2), 16));
        }
        return bytes.join(".");
    }

    _getConnectionsWindows() {
        return new Promise((resolve) => {
            exec("netstat -ano", { timeout: 10000 }, (error, stdout) => {
                if (error || !stdout) return resolve([]);
                const connections = [];
                const lines = stdout.split("\n");
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith("Active") || trimmed.startsWith("Proto")) continue;
                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 4) continue;
                    const protocol  = parts[0].toUpperCase();
                    const isTcp     = protocol.startsWith("TCP");
                    const state     = isTcp ? (parts[3] || "") : "LISTENING";
                    const pid       = isTcp ? (parts[4] || "0") : (parts[3] || "0");
                    const [localAddr, localPort]   = this._splitAddr(parts[1] || "");
                    const [remoteAddr, remotePort] = this._splitAddr(parts[2] || "");
                    connections.push({ protocol, localAddr, localPort, remoteAddr, remotePort, state, pid: pid.replace(/\r/g, "") });
                }
                resolve(connections);
            });
        });
    }

    // ─── DNS Cache ────────────────────────────────────────────────────────────

    _getDnsCache() {
        if (process.platform === "win32")  return this._getDnsCacheWindows();
        if (process.platform === "darwin") return this._getDnsCacheMacos();
        return this._getDnsCacheLinux();
    }

    _getDnsCacheMacos() {
        return new Promise((resolve) => {
            // macOS uses mDNSResponder; we read /etc/hosts as the stable source
            exec("cat /etc/hosts 2>/dev/null | grep -v '^#' | grep -v '^$'", { timeout: 5000 }, (err, stdout) => {
                const entries = [];
                if (!err && stdout) {
                    for (const line of stdout.split("\n")) {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 2) {
                            const ip = parts[0]; const name = parts[1];
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

    _getDnsCacheLinux() {
        return new Promise((resolve) => {
            // Try systemd-resolve --statistics or read /etc/hosts
            exec("systemd-resolve --statistics 2>/dev/null || cat /etc/hosts 2>/dev/null | head -50", 
                { timeout: 5000 }, 
                (error, stdout) => {
                    const entries = [];
                    if (!error && stdout) {
                        // Parse /etc/hosts lines: ip hostname
                        const lines = stdout.split("\n");
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || trimmed.startsWith("#")) continue;
                            const parts = trimmed.split(/\s+/);
                            if (parts.length >= 2) {
                                const ip   = parts[0];
                                const name = parts[1];
                                if (ip && name && !ip.startsWith("127") && !ip.startsWith("::")) {
                                    entries.push({ name, ip, type: "A" });
                                }
                            }
                        }
                    }
                    resolve(entries);
                }
            );
        });
    }

    _getDnsCacheWindows() {
        return new Promise((resolve) => {
            exec("C:\\Windows\\System32\\ipconfig.exe /displaydns", { timeout: 8000 }, (error, stdout) => {
                if (error) return resolve([]);
                const entries = [];
                const recordNameRx = /Record Name\s*\.+\s*:\s*(.+)/i;
                const recordTypeRx = /Record Type\s*\.+\s*:\s*(.+)/i;
                const dataRx       = /A \(Host\) Record\s*\.+\s*:\s*(.+)/i;
                let currentEntry   = {};
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

    // ─── Helpers ─────────────────────────────────────────────────────────────

    _splitAddr(addrStr) {
        if (!addrStr || addrStr === "*:*") return ["*", "*"];
        const ipv6Match = /^\[(.+)\]:(\d+)$/.exec(addrStr);
        if (ipv6Match) return [ipv6Match[1], ipv6Match[2]];
        const lastColon = addrStr.lastIndexOf(":");
        if (lastColon === -1) return [addrStr, "0"];
        return [addrStr.substring(0, lastColon), addrStr.substring(lastColon + 1)];
    }
}

module.exports = NetworkCollector;
