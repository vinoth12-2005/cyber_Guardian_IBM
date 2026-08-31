const StringExtractor = require("../core/fileengine/StringExtractor");

describe("StringExtractor", () => {

    test("Extracts ASCII and UTF-16LE strings and flags suspicious webhook endpoints", () => {
        const payload = "Hello normal text discord.com/api/webhooks/1234567890/token\0\0";
        const buf = Buffer.from(payload, "ascii");
        const res = StringExtractor.extract(buf);

        expect(res.totalExtracted).toBeGreaterThan(0);
        expect(res.network.webhooks.length).toBe(1);
        expect(res.stringThreatScore).toBeGreaterThanOrEqual(40);
        expect(res.indicators.some(i => i.category === "WEBHOOK_EXFILTRATION")).toBe(true);
    });

    test("Extracts and flags suspicious command-line execution indicators", () => {
        const payload = "powershell.exe -exec bypass -enc aW52b2tl";
        const buf = Buffer.from(payload, "ascii");
        const res = StringExtractor.extract(buf);

        expect(res.commands.length).toBeGreaterThan(0);
        expect(res.indicators.some(i => i.category === "SUSPICIOUS_COMMAND")).toBe(true);
    });

    test("Extracts and flags AMSI bypass / memory patch evasion keywords", () => {
        const payload = "function patch() { amsiInitFailed = true; }";
        const buf = Buffer.from(payload, "ascii");
        const res = StringExtractor.extract(buf);

        expect(res.evasion.length).toBeGreaterThan(0);
        expect(res.indicators.some(i => i.category === "DEFENSE_EVASION_STRING")).toBe(true);
    });

});
