/**
 * AlertRepository
 * Persists and queries Alert objects in the database.
 */
class AlertRepository {

    constructor(db) {
        this.db = db;
    }

    async save(alert) {
        return this.db.run(
            `INSERT OR REPLACE INTO alerts
             (id, timestamp, title, severity, category, source, description, recommendation, evidence, mitre, acknowledged)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [
                alert.id,
                (alert.timestamp || new Date()).toISOString(),
                alert.title,
                alert.severity,
                alert.category,
                alert.source,
                alert.description,
                alert.recommendation,
                JSON.stringify(alert.evidence || {}),
                JSON.stringify(alert.mitre || [])
            ]
        );
    }

    async getAll() {
        const rows = await this.db.all("SELECT * FROM alerts ORDER BY timestamp DESC");
        return rows.map(this._parse);
    }

    async getByTimeRange(start, end) {
        const rows = await this.db.all(
            "SELECT * FROM alerts WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC",
            [start.toISOString(), end.toISOString()]
        );
        return rows.map(this._parse);
    }

    async getUnacknowledged() {
        const rows = await this.db.all(
            "SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY timestamp DESC"
        );
        return rows.map(this._parse);
    }

    async getUnackAlerts() {
        return this.getUnacknowledged();
    }

    async getBySeverity(severity) {
        const rows = await this.db.all(
            "SELECT * FROM alerts WHERE severity = ? ORDER BY timestamp DESC",
            [severity]
        );
        return rows.map(this._parse);
    }

    async acknowledge(id) {
        return this.db.run(
            "UPDATE alerts SET acknowledged = 1, acknowledged_at = ? WHERE id = ?",
            [new Date().toISOString(), id]
        );
    }

    async acknowledgeAll() {
        return this.db.run(
            "UPDATE alerts SET acknowledged = 1, acknowledged_at = ? WHERE acknowledged = 0",
            [new Date().toISOString()]
        );
    }

    async deleteOlderThan(days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return this.db.run(
            "DELETE FROM alerts WHERE timestamp < ?",
            [cutoff.toISOString()]
        );
    }

    async count() {
        const row = await this.db.get("SELECT COUNT(*) as total FROM alerts");
        return row ? row.total : 0;
    }

    _parse(row) {
        return {
            ...row,
            evidence: JSON.parse(row.evidence || "{}"),
            mitre:    JSON.parse(row.mitre    || "[]"),
            acknowledged: row.acknowledged === 1
        };
    }

}

module.exports = AlertRepository;
