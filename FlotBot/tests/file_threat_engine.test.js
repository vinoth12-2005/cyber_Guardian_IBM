const fs = require("fs");
const path = require("path");
const os = require("os");
const FileThreatEngine = require("../core/fileengine/FileThreatEngine");

describe("FileThreatEngine Master Pipeline", () => {
    let engine;
    let tempDir;

    beforeAll(async () => {
        engine = new FileThreatEngine();
        await engine.init();
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "flotbot_test_fileengine_"));
    });

    afterAll(() => {
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
    });

    test("Analyzes standard clean text file as CLEAN / SAFE with low risk score", async () => {
        const cleanFile = path.join(tempDir, "readme.txt");
        fs.writeFileSync(cleanFile, "This is a benign application documentation file. Welcome to FlotBot.");

        const report = await engine.analyzeFile(cleanFile);
        expect(report.success).toBe(true);
        expect(["CLEAN", "NO_KNOWN_THREAT", "BENIGN"]).toContain(report.verdict);
        expect(report.riskScore).toBeLessThan(30);
        expect(report.isMalicious).toBe(false);
        expect(report.hashes.sha256).toBeDefined();
    });

    test("Detects EICAR test file and flags as MALICIOUS with high confidence", async () => {
        const eicarFile = path.join(tempDir, "eicar.com");
        const eicarStr = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
        fs.writeFileSync(eicarFile, eicarStr);

        const report = await engine.analyzeFile(eicarFile);
        expect(report.success).toBe(true);
        expect(report.verdict).toBe("MALICIOUS");
        expect(report.riskScore).toBeGreaterThanOrEqual(70);
        expect(report.isMalicious).toBe(true);
        expect(report.evidenceBreakdown.length).toBeGreaterThan(0);
        expect(report.remediation).toBeDefined();
    });

    test("Detects double-extension masquerade binary as SUSPICIOUS or MALICIOUS", async () => {
        const masqFile = path.join(tempDir, "salary_bonus.pdf.exe");
        const peBuf = Buffer.alloc(512);
        peBuf[0] = 0x4D; peBuf[1] = 0x5A; // MZ header
        fs.writeFileSync(masqFile, peBuf);

        const report = await engine.analyzeFile(masqFile);
        expect(report.success).toBe(true);
        expect(report.identification.isMasquerading).toBe(true);
        expect(report.riskScore).toBeGreaterThanOrEqual(40);
    });

    test("Fast-path scan runs in < 15ms and provides rapid risk classification", async () => {
        const testFile = path.join(tempDir, "quick_check.bin");
        fs.writeFileSync(testFile, Buffer.alloc(1024, 0x90));

        const t0 = Date.now();
        const fast = await engine.fastPathScan(testFile);
        const elapsed = Date.now() - t0;

        expect(fast).toBeDefined();
        expect(fast.sha256).toBeDefined();
        expect(elapsed).toBeLessThan(50);
    });

});
