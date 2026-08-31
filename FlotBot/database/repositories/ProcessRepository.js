/**
 * ProcessRepository
 * Stores and queries process snapshot data.
 */
class ProcessRepository {

    constructor(db) {
        this.db = db;
    }

    async save(process) {
        return this.db.run(
            `INSERT INTO process_logs
             (timestamp, pid, image, cmd_line, parent_pid, exe_path, memory_raw, session)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                new Date().toISOString(),
                process.pid,
                process.image,
                process.cmdLine  || "",
                process.parentPid || "0",
                process.exePath  || "",
                process.memoryRaw || "0 K",
                process.session  || ""
            ]
        );
    }

    async saveMany(processes) {
        const stmts = processes.map(p => ({
            sql: `INSERT INTO process_logs
                  (timestamp, pid, image, cmd_line, parent_pid, exe_path, memory_raw, session)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
                new Date().toISOString(),
                p.pid, p.image, p.cmdLine || "",
                p.parentPid || "0", p.exePath || "",
                p.memoryRaw || "0 K", p.session || ""
            ]
        }));
        return this.db.transaction(stmts);
    }

    async getByPid(pid) {
        return this.db.all(
            "SELECT * FROM process_logs WHERE pid = ? ORDER BY timestamp DESC LIMIT 50",
            [String(pid)]
        );
    }

    async getRecent(limit = 100) {
        return this.db.all(
            "SELECT * FROM process_logs ORDER BY timestamp DESC LIMIT ?",
            [limit]
        );
    }

    async deleteOlderThan(days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return this.db.run(
            "DELETE FROM process_logs WHERE timestamp < ?",
            [cutoff.toISOString()]
        );
    }

}

module.exports = ProcessRepository;
