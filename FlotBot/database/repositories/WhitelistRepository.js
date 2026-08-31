/**
 * WhitelistRepository
 * Manages trusted processes, file paths, rules, and IPs that the user has marked as safe.
 */
class WhitelistRepository {

    constructor(db) {
        this.db = db;
        this.cache = new Set();
    }

    async init() {
        // Ensure default trusted IPs and system services are in the safe list
        const defaultEntries = [
            { type: "ip", value: "172.217.115.4", reason: "Google Trusted Cloud/DNS IP" },
            { type: "ip", value: "4.213.25.242", reason: "Microsoft Trusted Azure/Telemetry IP" },
            { type: "service", value: "lsm", reason: "Windows Local Session Manager core service" }
        ];

        for (const entry of defaultEntries) {
            await this.add(entry.type, entry.value, entry.reason);
        }

        const items = await this.getAll();
        this.cache.clear();
        for (const item of items) {
            this.cache.add(item.value.toLowerCase());
        }
        return items;
    }

    async getAll() {
        return await this.db.all("SELECT * FROM whitelist ORDER BY created_at DESC");
    }

    async add(type, value, reason = "Marked as safe by user") {
        if (!value) return false;
        const normalized = String(value).trim().toLowerCase();
        try {
            await this.db.run(
                "INSERT OR REPLACE INTO whitelist (type, value, created_at, reason) VALUES (?, ?, ?, ?)",
                [type, normalized, new Date().toISOString(), reason]
            );
            this.cache.add(normalized);
            return true;
        } catch (err) {
            console.error("[WhitelistRepository] add error:", err.message);
            return false;
        }
    }

    async remove(id) {
        const item = await this.db.get("SELECT * FROM whitelist WHERE id = ?", [id]);
        if (item) {
            this.cache.delete(item.value.toLowerCase());
            await this.db.run("DELETE FROM whitelist WHERE id = ?", [id]);
            return true;
        }
        return false;
    }

    isWhitelisted(value) {
        if (!value) return false;
        const val = String(value).trim().toLowerCase();
        if (this.cache.has(val)) return true;
        
        // Also check if any whitelisted path is a substring
        for (const entry of this.cache) {
            if (val.includes(entry) || entry.includes(val)) {
                return true;
            }
        }
        return false;
    }

}

module.exports = WhitelistRepository;
