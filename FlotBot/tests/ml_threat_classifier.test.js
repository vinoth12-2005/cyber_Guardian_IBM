const MLThreatClassifier = require("../core/fileengine/MLThreatClassifier");
const MLFeatureExtractor = require("../core/fileengine/MLFeatureExtractor");

describe("MLThreatClassifier & MLFeatureExtractor", () => {

    test("Feature extractor converts analysis context into normalized 20-dim vector", () => {
        const mockContext = {
            identification: { isExecutable: true, isMasquerading: true },
            entropy: { score: 7.6, tier: "CRITICAL_PACKED_OR_ENCRYPTED", isHighEntropy: true },
            fileSizeBytes: 2048,
            staticAnalysis: {
                isBinary: true,
                is64Bit: true,
                sectionCount: 3,
                hasExecutableStack: true,
                hasSuspiciousPacker: true,
                mitigations: { aslr: false, dep_nx: false }
            },
            strings: {
                stringThreatScore: 40,
                network: { webhooks: ["discord.com/api/webhooks/123/token"] }
            },
            imports: {
                threatScore: 80,
                categories: { PROCESS_INJECTION: 1, PERSISTENCE: 1 }
            },
            signature: { status: "UNSIGNED" },
            pathRisk: { isUserWritable: true, isSuspiciousDropLocation: true },
            yaraMatches: [{ rule: "EICAR" }]
        };

        const vector = MLFeatureExtractor.extract(mockContext);
        expect(vector).toBeInstanceOf(Float64Array);
        expect(vector.length).toBe(20);

        // All features must be normalized between 0.0 and 1.0
        for (let i = 0; i < vector.length; i++) {
            expect(vector[i]).toBeGreaterThanOrEqual(0.0);
            expect(vector[i]).toBeLessThanOrEqual(1.0);
        }
    });

    test("Classifier scores malicious features with high probability and MALICIOUS classification", () => {
        const classifier = new MLThreatClassifier();
        const maliciousVec = new Float64Array(20);
        maliciousVec[0] = 0.4;  // file size
        maliciousVec[1] = 0.95; // high entropy (dimension 1)
        maliciousVec[2] = 1.0;  // is_executable (dimension 2)
        maliciousVec[3] = 0.0;  // masquerading (dimension 3: 0.0 = masquerade)
        maliciousVec[8] = 1.0;  // yara match (dimension 8)
        maliciousVec[12] = 0.8; // injection imports (dimension 12)
        maliciousVec[14] = 0.9; // webhook indicator (dimension 14)

        const pred = classifier.predict(maliciousVec);
        expect(pred.malicious_probability).toBeGreaterThan(0.7);
        expect(pred.classification).toBe("MALICIOUS");
    });

    test("Classifier scores clean benign features with low probability and BENIGN classification", () => {
        const classifier = new MLThreatClassifier();
        const benignVec = new Float64Array(20);
        benignVec[0] = 0.5;  // normal file size
        benignVec[1] = 0.55; // normal entropy (dimension 1)
        benignVec[2] = 1.0;  // is_executable (dimension 2)
        benignVec[3] = 1.0;  // normal matching extension (dimension 3)
        benignVec[4] = 1.0;  // signed binary (dimension 4)
        benignVec[5] = 1.0;  // valid signature (dimension 5)
        benignVec[6] = 1.0;  // publisher known (dimension 6)

        const pred = classifier.predict(benignVec);
        expect(pred.malicious_probability).toBeLessThan(0.3);
        expect(pred.classification).toBe("BENIGN");
    });

});
