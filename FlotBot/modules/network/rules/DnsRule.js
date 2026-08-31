const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * DnsRule
 * Inspects the DNS cache for recently resolved suspicious domains.
 * Flags known malicious TLDs and DGA-like domain patterns.
 */
class DnsRule extends ThreatRule {

    constructor() {
        super("Suspicious DNS Resolution", "MEDIUM");

        // High-risk TLDs frequently abused by malware
        this.suspiciousTlds = new Set([
            ".tk", ".ml", ".ga", ".cf", ".gq",
            ".top", ".xyz", ".pw", ".cc", ".biz",
            ".work", ".click", ".download", ".stream"
        ]);

        // Known malicious domain patterns (simple IOC list)
        this.maliciousDomains = [
            /cobalt\s*strike/i,
            /metasploit/i,
            /ngrok\.io$/i,
            /\.onion$/i,
            /pastebin\.com$/i,
            /pastie\.org$/i,
            /hastebin\.com$/i
        ];

        // Minimum domain length to evaluate (filter short FQDNs)
        this.minDomainLength = 10;
    }

    _isSuspiciousTld(domain) {
        return [...this.suspiciousTlds].some(tld => domain.endsWith(tld));
    }

    _matchesMaliciousPattern(domain) {
        return this.maliciousDomains.some(rx => rx.test(domain));
    }

    _looksDga(domain) {
        // DGA heuristic: high consonant ratio + long subdomain
        const label = domain.split(".")[0];
        if (label.length < 12) return false;
        const consonants = (label.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
        return (consonants / label.length) > 0.72;
    }

    async evaluate({ dnsCache }) {

        if (!dnsCache || !dnsCache.length) return null;

        for (const entry of dnsCache) {

            const domain = (entry.name || "").toLowerCase().trim();

            if (domain.length < this.minDomainLength) continue;

            if (this._isSuspiciousTld(domain)) {
                return this._buildDetection(domain, entry.ip, "Suspicious TLD commonly associated with free/disposable domains used in malware campaigns.");
            }

            if (this._matchesMaliciousPattern(domain)) {
                return this._buildDetection(domain, entry.ip, "Domain matches a known malicious pattern or service abused for C2 communication.");
            }

            if (this._looksDga(domain)) {
                return this._buildDetection(domain, entry.ip, "Domain name appears algorithmically generated (DGA), a common technique for C2 infrastructure rotation.");
            }

        }

        return null;

    }

    _buildDetection(domain, ip, reason) {
        return {
            detected:       true,
            rule:           this.name,
            severity:       this.severity,
            process:        "DNS Cache",
            pid:            "N/A",
            reason:         `Suspicious DNS resolution: "${domain}" (${ip || "IP unknown"}). ${reason}`,
            recommendation: "Block this domain at the DNS/firewall level. Identify which process resolved it and investigate.",
            evidence:       { domain, ip },
            mitre:          ["T1071.004", "T1568", "T1568.002"]
        };
    }

}

module.exports = DnsRule;
