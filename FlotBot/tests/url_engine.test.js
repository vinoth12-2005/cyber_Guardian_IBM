const URLEngine = require("../core/detection/URLEngine");

describe("URLEngine Threat Detection Tests", () => {

    test("should flag lookalike domain and brand impersonation", () => {
        const url = "http://paypa1-security-verify.com/login";
        const result = URLEngine.analyze(url);
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    test("should flag raw IP address URLs and insecure HTTP", () => {
        const url = "http://192.168.1.100/payload.sh";
        const result = URLEngine.analyze(url);
        expect(result.warnings.some(w => w.includes("raw IP"))).toBe(true);
        expect(result.warnings.some(w => w.includes("HTTP"))).toBe(true);
    });

    test("should flag punycode IDN homograph impersonations", () => {
        const url = "https://xn--appl-43d.com/login";
        const result = URLEngine.analyze(url);
        expect(result.warnings.some(w => w.includes("Punycode"))).toBe(true);
    });

    test("should assign safe baseline score to standard official websites", () => {
        const url = "https://www.google.com/search?q=cybersecurity";
        const result = URLEngine.analyze(url);
        expect(["SAFE", "NO_AUTHORITATIVE_VERDICT"]).toContain(result.riskLevel);
        expect(result.score).toBeLessThan(20);
        expect(result.isPhishing).toBe(false);
    });
});
