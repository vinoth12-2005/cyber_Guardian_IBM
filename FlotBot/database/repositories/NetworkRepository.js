/**
 * NetworkRepository
 * Stores and queries network connection logs.
 */
class NetworkRepository {

    constructor(db) {
        this.db = db;
    }

    async save(connection) {
        return this.db.run(
            `INSERT INTO network_logs
             (timestamp, pid, protocol, local_addr, local_port, remote_addr, remote_port, state)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                new Date().toISOString(),
                connection.pid         || "",
                connection.protocol    || "",
                connection.localAddr   || "",
                connection.localPort   || "",
                connection.remoteAddr  || "",
                connection.remotePort  || "",
                connection.state       || ""
            ]
        );
    }

    async saveMany(connections) {
        if (!connections.length) return;
        const stmts = connections.map(c => ({
            sql: `INSERT INTO network_logs
                  (timestamp, pid, protocol, local_addr, local_port, remote_addr, remote_port, state)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
                new Date().toISOString(),
                c.pid || "", c.protocol || "",
                c.localAddr || "", c.localPort || "",
                c.remoteAddr || "", c.remotePort || "",
                c.state || ""
            ]
        }));
        return this.db.transaction(stmts);
    }

    async getActiveConnections() {
        return this.db.all(
            "SELECT * FROM network_logs WHERE state = 'ESTABLISHED' ORDER BY timestamp DESC LIMIT 200"
        );
    }

    async getByRemoteIp(ip) {
        return this.db.all(
            "SELECT * FROM network_logs WHERE remote_addr = ? ORDER BY timestamp DESC",
            [ip]
        );
    }

    async getRecent(limit = 200) {
        return this.db.all(
            "SELECT * FROM network_logs ORDER BY timestamp DESC LIMIT ?",
            [limit]
        );
    }

    async deleteOlderThan(days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return this.db.run(
            "DELETE FROM network_logs WHERE timestamp < ?",
            [cutoff.toISOString()]
        );
    }

}

module.exports = NetworkRepository;
