const SecurityResult = require("./SecurityResult");

/**
 * ThreatIntelProvider
 * Abstract base class / interface for external threat intelligence providers.
 */
class ThreatIntelProvider {
    constructor(name) {
        if (this.constructor === ThreatIntelProvider) {
            throw new Error("Abstract class ThreatIntelProvider cannot be instantiated directly.");
        }
        this.name = name;
    }

    async checkFileHash(sha256) {
        return SecurityResult.unavailable(this.name, "hash", sha256, "Not implemented");
    }

    async checkFile(filePath) {
        return SecurityResult.unavailable(this.name, "file", filePath, "Not implemented");
    }

    async checkUrl(url) {
        return SecurityResult.unavailable(this.name, "url", url, "Not implemented");
    }

    async checkIP(ip) {
        return SecurityResult.unavailable(this.name, "ip", ip, "Not implemented");
    }

    async checkDomain(domain) {
        return SecurityResult.unavailable(this.name, "domain", domain, "Not implemented");
    }
}

module.exports = ThreatIntelProvider;
