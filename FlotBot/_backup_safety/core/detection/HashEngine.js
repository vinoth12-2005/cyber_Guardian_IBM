const crypto = require("crypto");
const fs = require("fs");

/**
 * HashEngine
 * ─────────────────────────────────────────────────────────────
 * Calculates cryptographic hashes (SHA-256, SHA-1, MD5) of files.
 * Caches hash results with TTL to avoid redundant expensive disk I/O.
 */
class HashEngine {

    constructor(options = {}) {
        this.cacheTTL = options.cacheTTL || 300_000; // 5 minutes
        this._cache = new Map(); // path -> { sha256, md5, sha1, size, mtimeMs, ts }
    }

    /**
     * Compute SHA-256 hash of a file or buffer with caching.
     * @param {string|Buffer} target - file path or buffer
     * @returns {Promise<{sha256: string, md5: string, sha1: string, fromCache: boolean}>}
     */
    async hash(target) {
        if (Buffer.isBuffer(target)) {
            return this._hashBuffer(target);
        }

        const filePath = String(target);
        if (!fs.existsSync(filePath)) {
            return null;
        }

        try {
            const stats = fs.statSync(filePath);
            if (!stats.isFile()) return null;

            // Check cache
            const cached = this._cache.get(filePath);
            if (cached && (Date.now() - cached.ts) < this.cacheTTL && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
                return {
                    sha256: cached.sha256,
                    md5: cached.md5,
                    sha1: cached.sha1,
                    fromCache: true
                };
            }

            // Read file (up to 50MB for hashing)
            const maxBytes = 50 * 1024 * 1024;
            const buffer = Buffer.alloc(Math.min(stats.size, maxBytes));
            const fd = fs.openSync(filePath, "r");
            fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);

            const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
            const md5    = crypto.createHash("md5").update(buffer).digest("hex");
            const sha1   = crypto.createHash("sha1").update(buffer).digest("hex");

            this._cache.set(filePath, {
                sha256,
                md5,
                sha1,
                size: stats.size,
                mtimeMs: stats.mtimeMs,
                ts: Date.now()
            });

            // Evict old cache entries if map grows large
            if (this._cache.size > 2000) {
                const firstKey = this._cache.keys().next().value;
                this._cache.delete(firstKey);
            }

            return { sha256, md5, sha1, fromCache: false };

        } catch (err) {
            return null;
        }
    }

    _hashBuffer(buffer) {
        const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
        const md5    = crypto.createHash("md5").update(buffer).digest("hex");
        const sha1   = crypto.createHash("sha1").update(buffer).digest("hex");
        return { sha256, md5, sha1, fromCache: false };
    }

    clearCache() {
        this._cache.clear();
    }
}

module.exports = HashEngine;
