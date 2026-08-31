const crypto = require("crypto");
const EntropyCalculator = require("../core/fileengine/EntropyCalculator");

describe("EntropyCalculator", () => {

    test("Uniform 0-byte buffer has zero entropy", () => {
        const buf = Buffer.alloc(1024, 0);
        const ent = EntropyCalculator.calculate(buf);
        expect(ent).toBe(0.0);
        expect(EntropyCalculator.getTier(ent)).toBe("LOW");
    });

    test("Plain ASCII English text has normal moderate entropy", () => {
        const text = "The quick brown fox jumps over the lazy dog. Hello world from FlotBot cybersecurity engine.";
        const buf = Buffer.from(text, "utf8");
        const ent = EntropyCalculator.calculate(buf);
        expect(ent).toBeGreaterThan(3.5);
        expect(ent).toBeLessThan(5.5);
        expect(EntropyCalculator.getTier(ent)).toBe("NORMAL");
    });

    test("Cryptographically random / packed buffer has high entropy (> 7.5)", () => {
        const randBuf = crypto.randomBytes(4096);
        const ent = EntropyCalculator.calculate(randBuf);
        expect(ent).toBeGreaterThan(7.5);
        expect(EntropyCalculator.getTier(ent)).toBe("CRITICAL_PACKED_OR_ENCRYPTED");
    });

    test("Calculates chunked profile and finds high entropy blocks", () => {
        const normalPart = Buffer.from("AAAA".repeat(256), "utf8"); // 1024 bytes low entropy
        const packedPart = crypto.randomBytes(1024); // 1024 bytes high entropy
        const combined = Buffer.concat([normalPart, packedPart]);

        const profile = EntropyCalculator.calculateProfile(combined, 1024);
        expect(profile.totalChunks).toBe(2);
        expect(profile.chunks[0].entropy).toBeLessThan(1.0);
        expect(profile.chunks[1].entropy).toBeGreaterThan(7.5);
        expect(profile.highEntropyChunksCount).toBe(1);
    });

});
