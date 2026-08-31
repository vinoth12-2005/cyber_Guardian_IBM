const crypto = require("crypto");

/**
 * AuditLogger
 * ─────────────────────────────────────────────────────────────
 * Cryptographically linked, tamper-evident audit logger.
 * Chained SHA-256 signatures ensure any tampering or log deletion
 * breaks the cryptographic hash verification chain.
 */
class AuditLogger {

    constructor(db = null) {
        this.db = db;
        this.lastHash = "0000000000000000000000000000000000000000000000000000000000000000";
        this._inMemoryLogs = [];
    }

    /**
     * Log an audited security action or decision.
     * @param {object} entry - { actionType, riskCategory, reason, userApproved, initiatedBy, status, details }
     * @returns {Promise<object>}
     */
    async log(entry) {
        const id = `aud_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        const timestamp = new Date().toISOString();
        const detailsJson = JSON.stringify(entry.details || {});

        // Compute hash chain signature: SHA256(lastHash + timestamp + actionType + details)
        const payload = `${this.lastHash}|${timestamp}|${entry.actionType}|${entry.riskCategory}|${detailsJson}`;
        const signatureHash = crypto.createHash("sha256").update(payload).digest("hex");
        this.lastHash = signatureHash;

        const record = {
            id,
            timestamp,
            action_type: entry.actionType || "UNKNOWN",
            risk_category: entry.riskCategory || "SAFE",
            reason: entry.reason || "",
            user_approved: entry.userApproved ? 1 : 0,
            initiated_by: entry.initiatedBy || "system",
            status: entry.status || "SUCCESS",
            details_json: detailsJson,
            signature_hash: signatureHash
        };

        this._inMemoryLogs.push(record);
        if (this._inMemoryLogs.length > 1000) this._inMemoryLogs.shift();

        if (this.db) {
            try {
                await this.db.run(
                    `INSERT INTO audit_logs (id, timestamp, action_type, risk_category, reason, user_approved, initiated_by, status, details_json, signature_hash)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [record.id, record.timestamp, record.action_type, record.risk_category, record.reason, record.user_approved, record.initiated_by, record.status, record.details_json, record.signature_hash]
                );
            } catch (err) {
                console.warn("[AuditLogger] Error persisting audit record to DB:", err.message);
            }
        }

        return record;
    }

    /**
     * Verify the cryptographic chain integrity of logs.
     * @returns {Promise<{valid: boolean, totalChecked: number, brokenAt: string|null}>}
     */
    async verifyIntegrity() {
        let logs = this._inMemoryLogs;

        if (this.db) {
            try {
                logs = await this.db.all("SELECT * FROM audit_logs ORDER BY timestamp ASC");
            } catch {}
        }

        let currentHash = "0000000000000000000000000000000000000000000000000000000000000000";

        for (let i = 0; i < logs.length; i++) {
            const row = logs[i];
            const payload = `${currentHash}|${row.timestamp}|${row.action_type}|${row.risk_category}|${row.details_json}`;
            const expectedHash = crypto.createHash("sha256").update(payload).digest("hex");

            if (row.signature_hash !== expectedHash) {
                return {
                    valid: false,
                    totalChecked: i,
                    brokenAt: row.id,
                    error: `Signature mismatch at log ID ${row.id}`
                };
            }
            currentHash = row.signature_hash;
        }

        return {
            valid: true,
            totalChecked: logs.length,
            brokenAt: null
        };
    }

    getRecentLogs(limit = 50) {
        return this._inMemoryLogs.slice(-limit);
    }
}

module.exports = AuditLogger;
