const fs = require("fs");
const path = require("path");
const ThreatIntelProvider = require("./ThreatIntelProvider");

/**
 * LocalIOCProvider
 * ─────────────────────────────────────────────────────────────
 * Offline, zero-latency IOC matcher using local JSON/SQLite datasets.
 */
class LocalIOCProvider extends ThreatIntelProvider {

    constructor(iocFilePath = null) {
        super("LocalIOC");
        this.iocFilePath = iocFilePath || path.join(__dirname, "../../data/ioc.json");
        this.data = { hashes: { sha256: [] }, ips: [], domains: [], processNames: [] };
        this._hashSet = new Set();
        this._ipSet = new Set();
        this._domainSet = new Set();
        this._procSet = new Set();
        this._load();
    }

    _load() {
        try {
            if (fs.existsSync(this.iocFilePath)) {
                const raw = fs.readFileSync(this.iocFilePath, "utf8");
                this.data = JSON.parse(raw);
                this._hashSet = new Set(this.data.hashes?.sha256?.map(h => h.toLowerCase()) || []);
                this._ipSet = new Set(this.data.ips?.map(ip => ip.toLowerCase()) || []);
                this._domainSet = new Set(this.data.domains?.map(d => d.toLowerCase()) || []);
                this._procSet = new Set(this.data.processNames?.map(n => n.toLowerCase()) || []);
                this.ready = true;
            }
        } catch (err) {
            console.warn("[LocalIOC] Error loading IOC dataset:", err.message);
        }
    }

    async lookupHash(sha256) {
        if (!sha256) return null;
        const clean = sha256.toLowerCase().trim();
        const hit = this._hashSet.has(clean);
        if (hit) {
            return {
                provider: "LocalIOC",
                indicator: clean,
                type: "hash",
                verdict: "MALICIOUS",
                threatLevel: "CRITICAL",
                source: "Local IOC Signature Database",
                confidence: 1.0
            };
        }
        return null;
    }

    async lookupIP(ip) {
        if (!ip) return null;
        const clean = ip.toLowerCase().trim();
        if (this._ipSet.has(clean)) {
            return {
                provider: "LocalIOC",
                indicator: clean,
                type: "ip",
                verdict: "MALICIOUS",
                threatLevel: "HIGH",
                source: "Local IOC Malicious IP Feed",
                confidence: 0.95
            };
        }
        return null;
    }

    async lookupDomain(domain) {
        if (!domain) return null;
        const clean = domain.toLowerCase().trim();
        if (this._domainSet.has(clean)) {
            return {
                provider: "LocalIOC",
                indicator: clean,
                type: "domain",
                verdict: "MALICIOUS",
                threatLevel: "HIGH",
                source: "Local IOC Malicious Domain Feed",
                confidence: 0.95
            };
        }
        return null;
    }

    async lookupURL(url) {
        if (!url) return null;
        try {
            const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
            return this.lookupDomain(parsed.hostname);
        } catch {
            return null;
        }
    }

    lookupProcessName(procName) {
        if (!procName) return null;
        const clean = procName.toLowerCase().trim();
        if (this._procSet.has(clean)) {
            return {
                provider: "LocalIOC",
                indicator: clean,
                type: "process",
                verdict: "MALICIOUS",
                threatLevel: "CRITICAL",
                source: "Local IOC Known Threat Toolsets",
                confidence: 0.95
            };
        }
        return null;
    }
}

module.exports = LocalIOCProvider;
