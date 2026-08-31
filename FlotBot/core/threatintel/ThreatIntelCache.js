/**
 * ThreatIntelCache
 * ─────────────────────────────────────────────────────────────
 * High-performance in-memory cache for threat intelligence lookups
 * with per-indicator TTL, rate-limiting, and error cooldowns.
 */
class ThreatIntelCache {

    constructor(options = {}) {
        this.defaultTTL = options.defaultTTL || 3600_000; // 1 hour
        this._cache = new Map();
        this._rateLimitCooldown = new Map();
    }

    get(indicator) {
        if (!indicator) return null;
        const key = indicator.toLowerCase().trim();
        const entry = this._cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.ts > entry.ttl) {
            this._cache.delete(key);
            return null;
        }

        return entry.data;
    }

    set(indicator, data, ttl = null) {
        if (!indicator) return;
        const key = indicator.toLowerCase().trim();
        this._cache.set(key, {
            data,
            ts: Date.now(),
            ttl: ttl || this.defaultTTL
        });

        // Bounded capacity
        if (this._cache.size > 5000) {
            const first = this._cache.keys().next().value;
            this._cache.delete(first);
        }
    }

    isRateLimited(providerName) {
        const cooldownUntil = this._rateLimitCooldown.get(providerName);
        if (!cooldownUntil) return false;
        if (Date.now() < cooldownUntil) return true;
        this._rateLimitCooldown.delete(providerName);
        return false;
    }

    setRateLimited(providerName, cooldownMs = 60_000) {
        this._rateLimitCooldown.set(providerName, Date.now() + cooldownMs);
    }

    clear() {
        this._cache.clear();
        this._rateLimitCooldown.clear();
    }
}

module.exports = ThreatIntelCache;
