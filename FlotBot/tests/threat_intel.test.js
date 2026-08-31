const LocalIOCProvider = require("../core/threatintel/LocalIOCProvider");
const ThreatIntelCache = require("../core/threatintel/ThreatIntelCache");
const ThreatIntelEngine = require("../core/threatintel/ThreatIntelEngine");

describe("Threat Intelligence Tests", () => {

    test("LocalIOCProvider should match known malicious SHA-256 hashes", async () => {
        const ioc = new LocalIOCProvider();
        const testMaliciousHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const res = await ioc.lookupHash(testMaliciousHash);
        expect(res).not.toBeNull();
        expect(res.verdict).toBe("MALICIOUS");
        expect(res.threatLevel).toBe("CRITICAL");
    });

    test("ThreatIntelCache should cache indicators with TTL and honor cooldowns", () => {
        const cache = new ThreatIntelCache({ defaultTTL: 1000 });
        cache.set("1.1.1.1", { verdict: "CLEAN" });
        expect(cache.get("1.1.1.1")).toEqual({ verdict: "CLEAN" });

        cache.setRateLimited("VirusTotal", 5000);
        expect(cache.isRateLimited("VirusTotal")).toBe(true);
    });

    test("ThreatIntelEngine should coordinate local and cache checks seamlessly", async () => {
        const engine = new ThreatIntelEngine();
        const testHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const hit = await engine.checkHash(testHash);
        expect(hit.verdict).toBe("MALICIOUS");

        // Second lookup should come from cache
        const cachedHit = await engine.checkHash(testHash);
        expect(cachedHit.fromCache).toBe(true);
    });
});
