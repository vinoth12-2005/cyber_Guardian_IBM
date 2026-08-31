const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

/**
 * QuarantineManager
 * ─────────────────────────────────────────────────────────────
 * Safely isolates suspicious files by moving them into an encrypted
 * quarantine vault with restore and permanent delete capabilities.
 */
class QuarantineManager {

    constructor(storageDir = null) {
        this.quarantineDir = storageDir || path.join(os.homedir(), ".config", "flotbot", "quarantine");
        this._initVault();
    }

    _initVault() {
        if (!fs.existsSync(this.quarantineDir)) {
            fs.mkdirSync(this.quarantineDir, { recursive: true, mode: 0o700 });
        }
    }

    /**
     * Quarantine a file.
     * @param {string} filePath - Path to file to quarantine
     * @param {string} reason - Why it is being quarantined
     * @returns {Promise<object>} Metadata record
     */
    async quarantineFile(filePath, reason = "Suspicious file detected") {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }

        const stats = fs.statSync(filePath);
        const fileBuffer = fs.readFileSync(filePath);
        const sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");
        const id = crypto.randomBytes(8).toString("hex");

        const qFileName = `${id}.qfile`;
        const qPath = path.join(this.quarantineDir, qFileName);

        // Simple XOR/Buffer encryption for isolation
        const key = Buffer.from(id.repeat(4), "utf8").slice(0, 32);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, key.slice(0, 16));
        const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

        fs.writeFileSync(qPath, encrypted);

        const metadata = {
            id,
            originalPath: filePath,
            originalName: path.basename(filePath),
            quarantinedAt: new Date().toISOString(),
            sha256,
            sizeBytes: stats.size,
            reason,
            qPath
        };

        // Write metadata file
        fs.writeFileSync(path.join(this.quarantineDir, `${id}.json`), JSON.stringify(metadata, null, 2));

        // Remove original file safely
        fs.unlinkSync(filePath);

        return metadata;
    }

    /**
     * List all quarantined items.
     * @returns {Array<object>}
     */
    listQuarantined() {
        const files = fs.readdirSync(this.quarantineDir);
        const list = [];
        for (const f of files) {
            if (f.endsWith(".json")) {
                try {
                    const meta = JSON.parse(fs.readFileSync(path.join(this.quarantineDir, f), "utf8"));
                    list.push(meta);
                } catch { /* ignore */ }
            }
        }
        return list;
    }

    /**
     * Restore a quarantined file to its original location.
     * @param {string} id
     */
    async restoreFile(id) {
        const metaPath = path.join(this.quarantineDir, `${id}.json`);
        if (!fs.existsSync(metaPath)) {
            throw new Error(`Quarantine record not found for ID: ${id}`);
        }

        const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        const encrypted = fs.readFileSync(meta.qPath);

        const key = Buffer.from(id.repeat(4), "utf8").slice(0, 32);
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, key.slice(0, 16));
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

        // Ensure parent dir exists
        const parentDir = path.dirname(meta.originalPath);
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }

        fs.writeFileSync(meta.originalPath, decrypted);

        // Cleanup quarantine files
        fs.unlinkSync(meta.qPath);
        fs.unlinkSync(metaPath);

        return meta;
    }

    /**
     * Permanently delete a quarantined file.
     * @param {string} id
     */
    async deletePermanently(id) {
        const metaPath = path.join(this.quarantineDir, `${id}.json`);
        if (!fs.existsSync(metaPath)) {
            throw new Error(`Quarantine record not found for ID: ${id}`);
        }

        const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        if (fs.existsSync(meta.qPath)) fs.unlinkSync(meta.qPath);
        fs.unlinkSync(metaPath);

        return { id, deleted: true };
    }
}

module.exports = QuarantineManager;
