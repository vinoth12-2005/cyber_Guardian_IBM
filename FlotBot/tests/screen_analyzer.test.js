const ScreenAnalyzer = require("../modules/screen/ScreenAnalyzer");

describe("ScreenAnalyzer Visual Threat & Privacy Tests", () => {
    test("should redact passwords and sensitive API keys from text", () => {
        const rawText = "Connecting with password: SuperSecretPassword123 and API key AIzaSyD3x4mP13k3y99999999999999999";
        const redacted = ScreenAnalyzer.redactSecrets(rawText);
        expect(redacted).toContain("password: [REDACTED]");
        expect(redacted).toContain("[REDACTED_API_KEY]");
        expect(redacted).not.toContain("SuperSecretPassword123");
    });

    test("should detect visual phishing warnings on unencrypted login pages", async () => {
        const analyzer = new ScreenAnalyzer();
        const res = await analyzer.analyzeScreen({
            ocrText: "Please Sign In and enter your account password to verify your banking details",
            visibleUrl: "http://insecure-bank-login.xyz",
            windowTitle: "Bank Login Portal",
            windows: [{ pid: 900, windowTitle: "powershell -enc malicious" }]
        });

        expect(res.success).toBe(true);
        expect(res.warnings.length).toBeGreaterThan(0);
        expect(res.warnings.some(w => w.includes("unencrypted"))).toBe(true);
    });
});
