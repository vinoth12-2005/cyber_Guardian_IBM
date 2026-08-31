/**
 * BaselineRepository
 * ─────────────────────────────────────────────────────────
 * Persistence layer for Learning Mode baseline records.
 * Each record represents one observed value (IP, process image, DNS domain)
 * that was seen during the learning window.
 *
 * Suppression only applies to records where approved = 1.
 * Admin must manually approve records via the Admin Console.
 */
class BaselineRepository {

    constructor(db) {
        this.db = db;
    }

    /**
     * Insert or increment observation count for a baseline value.
     * @param {string} type  - "ip" | "process" | "dns"
     * @param {string} value - the observed value (IP address, process name, domain)
     */
    async upsertRecord(type, value) {
        const now = new Date().toISOString();
        await this.db.run(
            `INSERT INTO baseline_records (type, value, first_seen, last_seen, observation_count, approved)
             VALUES (?, ?, ?, ?, 1, 0)
             ON CONFLICT(value) DO UPDATE SET
                last_seen         = excluded.last_seen,
                observation_count = observation_count + 1`,
            [type, value, now, now]
        );
    }

    /**
     * Fetch all baseline records, ordered by observation count descending.
     * @returns {Promise<Array>}
     */
    async getAll() {
        return await this.db.all(
            `SELECT * FROM baseline_records ORDER BY observation_count DESC`
        );
    }

    /**
     * Fetch only approved baseline records.
     * Used by BehaviorAnalyzer to suppress alerts for known-good items.
     * @returns {Promise<Array>}
     */
    async getApproved() {
        return await this.db.all(
            `SELECT * FROM baseline_records WHERE approved = 1`
        );
    }

    /**
     * Approve a single baseline record.
     * @param {number} id
     */
    async approve(id) {
        await this.db.run(
            `UPDATE baseline_records SET approved = 1 WHERE id = ?`,
            [id]
        );
    }

    /**
     * Reject (delete) a single baseline record.
     * @param {number} id
     */
    async reject(id) {
        await this.db.run(
            `DELETE FROM baseline_records WHERE id = ?`,
            [id]
        );
    }

    /**
     * Approve all pending baseline records at once.
     */
    async approveAll() {
        await this.db.run(`UPDATE baseline_records SET approved = 1`);
    }

    /**
     * Delete all baseline records (used when admin resets learning mode).
     */
    async reset() {
        await this.db.run(`DELETE FROM baseline_records`);
    }

    /**
     * Check if a given value is in the approved baseline.
     * @param {string} value
     * @returns {Promise<boolean>}
     */
    async isApproved(value) {
        const row = await this.db.get(
            `SELECT id FROM baseline_records WHERE value = ? AND approved = 1`,
            [value]
        );
        return !!row;
    }

}

module.exports = BaselineRepository;
