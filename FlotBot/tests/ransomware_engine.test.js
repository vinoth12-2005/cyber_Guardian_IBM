const RansomwareEngine = require("../core/detection/RansomwareEngine");

describe("RansomwareEngine Multi-Signal Detection Tests", () => {
    let ransomwareEngine;

    beforeEach(() => {
        ransomwareEngine = new RansomwareEngine();
    });

    test("should compute Shannon Entropy accurately", () => {
        const uniformBuffer = Buffer.alloc(256);
        for (let i = 0; i < 256; i++) uniformBuffer[i] = i;
        const entropy = ransomwareEngine.calculateEntropy(uniformBuffer);
        expect(entropy).toBeCloseTo(8.0, 1);

        const zeroes = Buffer.alloc(256, 0);
        const zeroEntropy = ransomwareEngine.calculateEntropy(zeroes);
        expect(zeroEntropy).toBe(0);
    });

    test("should detect ransomware extension burst and note creation", () => {
        const fileEvents = [
            { action: "MODIFIED", file: { fileName: "doc1.locked", filePath: "/docs/doc1.locked" } },
            { action: "MODIFIED", file: { fileName: "doc2.locked", filePath: "/docs/doc2.locked" } },
            { action: "CREATED", file: { fileName: "HOW_TO_RESTORE.txt", filePath: "/docs/HOW_TO_RESTORE.txt" } }
        ];

        const procs = [
            { pid: 1234, cmdLine: "vssadmin.exe delete shadows /all /quiet" }
        ];

        const detection = ransomwareEngine.evaluate(fileEvents, procs);
        expect(detection).not.toBeNull();
        expect(detection.detected).toBe(true);
        expect(detection.severity).toBe("CRITICAL");
        expect(detection.score).toBeGreaterThanOrEqual(90);
    });

    test("should return null for normal single benign file saves", () => {
        const fileEvents = [
            { action: "MODIFIED", file: { fileName: "notes.txt", filePath: "/docs/notes.txt" } }
        ];

        const detection = ransomwareEngine.evaluate(fileEvents, []);
        expect(detection).toBeNull();
    });
});
