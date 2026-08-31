/**
 * ThreatIntelProvider
 * ─────────────────────────────────────────────────────────────
 * Base interface for threat intelligence feeds and reputation services.
 */
class ThreatIntelProvider {

    constructor(name) {
        this.name = name;
        this.ready = false;
    }

    async lookupHash(sha256) {
        throw new Error(`lookupHash() not implemented by ${this.name}`);
    }

    async lookupIP(ip) {
        throw new Error(`lookupIP() not implemented by ${this.name}`);
    }

    async lookupDomain(domain) {
        throw new Error(`lookupDomain() not implemented by ${this.name}`);
    }

    async lookupURL(url) {
        throw new Error(`lookupURL() not implemented by ${this.name}`);
    }
}

module.exports = ThreatIntelProvider;
