const LocalIOCProvider = require("./LocalIOCProvider");
const VirusTotalProvider = require("./VirusTotalProvider");
const ThreatIntelCache = require("./ThreatIntelCache");

/**
 * ThreatIntelEngine
 * ─────────────────────────────────────────────────────────────
 * Coordinates multi-source threat intelligence with local-first lookup,
 * automatic cache checks, and rate-limit guard.
 */
class ThreatIntelEngine {

    constructor(options = {}) {
        this.cache = new ThreatIntelCache();
        this.localIOC = new LocalIOCProvider();
        this.virusTotal = new VirusTotalProvider(options.vtApiKey);
    }

    /**
     * Check hash reputation across local IOC and VirusTotal.
     * @param {string} sha256
     * @returns {Promise<object>}
     */
    async checkHash(sha256) {
        if (!sha256) return { matched: false, verdict: "UNKNOWN" };

        // 1. Cache check
        const cached = this.cache.get(sha256);
        if (cached) return { ...cached, fromCache: true };

        // 2. Local IOC check (Instant, offline)
        const localHit = await this.localIOC.lookupHash(sha256);
        if (localHit) {
            this.cache.set(sha256, localHit);
            return { ...localHit, fromCache: false };
        }

        // 3. VirusTotal Cloud Lookup (if online and key present)
        if (this.virusTotal.ready && !this.cache.isRateLimited("VirusTotal")) {
            try {
                const vtHit = await this.virusTotal.lookupHash(sha256);
                if (vtHit) {
                    this.cache.set(sha256, vtHit);
                    return { ...vtHit, fromCache: false };
                }
            } catch (err) {
                if (err.message === "VIRUSTOTAL_RATE_LIMIT") {
                    this.cache.setRateLimited("VirusTotal", 120_000);
                }
            }
        }

        const cleanResult = { matched: false, verdict: "CLEAN", indicator: sha256, type: "hash" };
        this.cache.set(sha256, cleanResult, 300_000); // 5 min cache for clean
        return cleanResult;
    }

    /**
     * Check IP address reputation.
     * @param {string} ip
     * @returns {Promise<object>}
     */
    async checkIP(ip) {
        if (!ip) return { matched: false, verdict: "UNKNOWN" };

        const cached = this.cache.get(ip);
        if (cached) return { ...cached, fromCache: true };

        const localHit = await this.localIOC.lookupIP(ip);
        if (localHit) {
            this.cache.set(ip, localHit);
            return { ...localHit, fromCache: false };
        }

        if (this.virusTotal.ready && !this.cache.isRateLimited("VirusTotal")) {
            try {
                const vtHit = await this.virusTotal.lookupIP(ip);
                if (vtHit) {
                    this.cache.set(ip, vtHit);
                    return { ...vtHit, fromCache: false };
                }
            } catch (err) {
                if (err.message === "VIRUSTOTAL_RATE_LIMIT") {
                    this.cache.setRateLimited("VirusTotal", 120_000);
                }
            }
        }

        const cleanResult = { matched: false, verdict: "CLEAN", indicator: ip, type: "ip" };
        this.cache.set(ip, cleanResult, 300_000);
        return cleanResult;
    }

    /**
     * Check domain reputation.
     * @param {string} domain
     * @returns {Promise<object>}
     */
    async checkDomain(domain) {
        if (!domain) return { matched: false, verdict: "UNKNOWN" };

        const cached = this.cache.get(domain);
        if (cached) return { ...cached, fromCache: true };

        const localHit = await this.localIOC.lookupDomain(domain);
        if (localHit) {
            this.cache.set(domain, localHit);
            return { ...localHit, fromCache: false };
        }

        if (this.virusTotal.ready && !this.cache.isRateLimited("VirusTotal")) {
            try {
                const vtHit = await this.virusTotal.lookupDomain(domain);
                if (vtHit) {
                    this.cache.set(domain, vtHit);
                    return { ...vtHit, fromCache: false };
                }
            } catch {}
        }

        const cleanResult = { matched: false, verdict: "CLEAN", indicator: domain, type: "domain" };
        this.cache.set(domain, cleanResult, 300_000);
        return cleanResult;
    }
}

module.exports = ThreatIntelEngine;
