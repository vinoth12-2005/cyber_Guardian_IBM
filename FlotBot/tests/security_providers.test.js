const VirusTotalProvider = require("../core/security/VirusTotalProvider");
const SafeBrowsingProvider = require("../core/security/SafeBrowsingProvider");
const HybridAnalysisProvider = require("../core/security/HybridAnalysisProvider");
const DetectionManager = require("../core/security/DetectionManager");

describe("External Security Providers Test Suite (Mocked)", () => {

    test("VirusTotalProvider returns unavailable when API key is missing", async () => {
        const vt = new VirusTotalProvider("");
        const res = await vt.checkFileHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        expect(res.status).toBe("unavailable");
        expect(res.classification).toBe("unavailable");
    });

    test("SafeBrowsingProvider returns unavailable when API key is missing", async () => {
        const sb = new SafeBrowsingProvider("");
        const res = await sb.checkUrl("http://example.com");
        expect(res.status).toBe("unavailable");
        expect(res.classification).toBe("unavailable");
    });

    test("HybridAnalysisProvider returns unavailable when API key is missing", async () => {
        const ha = new HybridAnalysisProvider("");
        const res = await ha.checkFileHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        expect(res.status).toBe("unavailable");
        expect(res.classification).toBe("unavailable");
    });

    test("DetectionManager handles missing keys gracefully without crashing", async () => {
        const dm = new DetectionManager({});
        const urlRes = await dm.checkUrl("https://testingmcafeesites.com");
        expect(urlRes.classification).toBe("unavailable");
        expect(urlRes.provider_results.length).toBe(2);

        const fileRes = await dm.checkFile({ sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" });
        expect(fileRes.classification).toBe("unavailable");
    });
});
