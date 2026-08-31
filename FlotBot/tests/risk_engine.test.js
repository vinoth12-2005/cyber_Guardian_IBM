const RiskEngine = require("../core/risk/RiskEngine");

describe("RiskEngine Deterministic Scoring Tests", () => {

    test("should score empty signal list as SAFE 0", () => {
        const result = RiskEngine.calculate([]);
        expect(result.riskScore).toBe(0);
        expect(result.tier).toBe("SAFE");
        expect(result.confidence).toBe(1.0);
    });

    test("should compute HIGH/CRITICAL score for ransomware and reverse shell signals", () => {
        const signals = [
            { type: "RANSOMWARE_ACTIVITY", severity: "CRITICAL", confidence: 0.95 },
            { type: "REVERSE_SHELL", severity: "CRITICAL", confidence: 0.9 }
        ];

        const result = RiskEngine.calculate(signals);
        expect(result.riskScore).toBeGreaterThanOrEqual(80);
        expect(result.tier).toBe("CRITICAL");
        expect(result.confidence).toBeGreaterThanOrEqual(0.9);
        expect(result.breakdown).toHaveLength(2);
    });

    test("should accurately categorize medium and low risk signals", () => {
        const signals = [
            { type: "SUSPICIOUS_EXTENSION", severity: "LOW", confidence: 0.8 }
        ];

        const result = RiskEngine.calculate(signals);
        expect(result.tier).toBe("LOW");
        expect(result.riskScore).toBe(20);
    });
});
