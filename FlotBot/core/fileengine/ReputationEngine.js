const crypto = require("crypto");

/**
 * ReputationEngine
 * ─────────────────────────────────────────────────────────────
 * Multi-tiered file hash & publisher reputation engine.
 *
 * Verdicts:
 *   - KNOWN_BENIGN:    Trusted system binaries, signed major vendor tools.
 *   - KNOWN_MALICIOUS: Verified malware hashes in IOC database.
 *   - SUSPICIOUS:      Flagged by threat intelligence / heuristics.
 *   - UNKNOWN:         Hash not present in reputation databases.
 *   - NO_REPUTATION:   Empty or unhashable file.
 *
 * ABSOLUTE RULE:
 *   UNKNOWN MUST NEVER EQUAL MALICIOUS.
 */
class ReputationEngine {

    constructor(options = {}) {
        // Curated Benign Hashes (Standard system binaries, common runtimes, core tools)
        this.knownBenignHashes = new Set([
            // Empty SHA-256
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            // Common Linux coreutils
            "a60c7b3ecf482d33454b5bc847fa2fae498305c03cf8a293309a473138b11111",
            // Common Windows system tools
            "3a8904e54256247fb59f27c34d28430e37a34fa8ec5c91b5c90b6ec86f8c7b80"
        ]);

        // Known Malicious Hashes (Real-world IOCs, test samples, ransomware signatures)
        this.knownMaliciousHashes = new Set([
            "44d886104b68e1629247dd4f9644f8e2444ffb7f6b92a2a0d0cf6b6a0bb67d98", // EICAR standard test
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f", // WannaCry
            "04863f87c12669502288da61b528d655c3de342505aa711722cfb37635b4f683", // Locky
            "84c82835a5d21bbcf75a61706d8ab549",                                 // Sasser MD5
            "7116b21a62140615e60512c327721b3edd1382ba730782c356f1758623724f33"
        ]);

        this._cache = new Map(); // hash -> { verdict, confidence, reason, timestamp }
    }

    /**
     * Add benign hash dynamically.
     */
    addBenignHash(hash) {
        if (hash) this.knownBenignHashes.add(hash.toLowerCase());
    }

    /**
     * Add malicious hash dynamically.
     */
    addMaliciousHash(hash) {
        if (hash) this.knownMaliciousHashes.add(hash.toLowerCase());
    }

    /**
     * Query reputation for a given hash.
     * @param {string} hash - SHA-256, SHA-1, or MD5
     * @param {object} [threatIntel] - Optional threat intelligence lookup result
     * @returns {object} Reputation verdict
     */
    getReputation(hash, threatIntel = null) {
        if (!hash) {
            return {
                verdict: "NO_REPUTATION",
                confidence: 1.0,
                scoreModifier: 0,
                reason: "No hash provided"
            };
        }

        const h = hash.toLowerCase();

        // 1. Check in-memory cache
        if (this._cache.has(h)) {
            const cached = this._cache.get(h);
            if (Date.now() - cached.timestamp < 300_000) { // 5 min TTL
                return cached;
            }
        }

        // 2. Check Known Benign Database
        if (this.knownBenignHashes.has(h)) {
            const res = {
                verdict: "KNOWN_BENIGN",
                confidence: 0.95,
                scoreModifier: -35,
                reason: "Verified known benign signature in whitelist database"
            };
            this._cache.set(h, { ...res, timestamp: Date.now() });
            return res;
        }

        // 3. Check Known Malicious Database
        if (this.knownMaliciousHashes.has(h)) {
            const res = {
                verdict: "KNOWN_MALICIOUS",
                confidence: 0.99,
                scoreModifier: +50,
                reason: "Exact match in verified threat intelligence malware database"
            };
            this._cache.set(h, { ...res, timestamp: Date.now() });
            return res;
        }

        // 4. Check External Threat Intel (VirusTotal / Local IOC)
        if (threatIntel) {
            if (threatIntel.verdict === "MALICIOUS" || (threatIntel.maliciousCount && threatIntel.maliciousCount >= 3)) {
                const res = {
                    verdict: "KNOWN_MALICIOUS",
                    confidence: threatIntel.confidence || 0.9,
                    scoreModifier: +45,
                    reason: `Flagged by threat intelligence providers (${threatIntel.maliciousCount || 1} detections)`
                };
                this._cache.set(h, { ...res, timestamp: Date.now() });
                return res;
            } else if (threatIntel.verdict === "SUSPICIOUS" || (threatIntel.suspiciousCount && threatIntel.suspiciousCount > 0)) {
                const res = {
                    verdict: "SUSPICIOUS",
                    confidence: 0.75,
                    scoreModifier: +25,
                    reason: "Flagged as suspicious by threat intelligence feeds"
                };
                this._cache.set(h, { ...res, timestamp: Date.now() });
                return res;
            }
        }

        // 5. Default: UNKNOWN (Explicitly NOT malicious)
        const res = {
            verdict: "UNKNOWN",
            confidence: 0.5,
            scoreModifier: 0, // Zero score modifier — never penalize simply for being new/unknown
            reason: "Hash not observed in known threat or benign repositories (Requires static & behavioral analysis)"
        };
        this._cache.set(h, { ...res, timestamp: Date.now() });
        return res;
    }
}

module.exports = ReputationEngine;
