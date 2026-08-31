const ReputationEngine = require("../core/fileengine/ReputationEngine");

describe("ReputationEngine", () => {

    test("Known benign hash returns KNOWN_BENIGN with negative score modifier", () => {
        const engine = new ReputationEngine();
        const emptySha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const rep = engine.getReputation(emptySha);

        expect(rep.verdict).toBe("KNOWN_BENIGN");
        expect(rep.scoreModifier).toBeLessThan(0);
        expect(rep.confidence).toBeGreaterThanOrEqual(0.9);
    });

    test("Known malicious hash returns KNOWN_MALICIOUS with positive risk modifier", () => {
        const engine = new ReputationEngine();
        const eicarSha = "44d886104b68e1629247dd4f9644f8e2444ffb7f6b92a2a0d0cf6b6a0bb67d98";
        const rep = engine.getReputation(eicarSha);

        expect(rep.verdict).toBe("KNOWN_MALICIOUS");
        expect(rep.scoreModifier).toBeGreaterThan(0);
        expect(rep.confidence).toBeGreaterThanOrEqual(0.95);
    });

    test("Unknown hash returns UNKNOWN with exactly 0 score modifier (UNKNOWN != MALICIOUS)", () => {
        const engine = new ReputationEngine();
        const randHash = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        const rep = engine.getReputation(randHash);

        expect(rep.verdict).toBe("UNKNOWN");
        expect(rep.scoreModifier).toBe(0); // MUST NEVER PENALIZE UNKNOWN AS MALICIOUS
    });

});
