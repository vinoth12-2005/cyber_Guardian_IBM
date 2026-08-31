const CanarySystem = require("../core/detection/CanarySystem");
const path = require("path");
const fs = require("fs");
const os = require("os");

describe("CanarySystem Decoy Tripwire Tests", () => {
    let canary;
    let testCanaryDir;

    beforeEach(async () => {
        testCanaryDir = path.join(os.tmpdir(), `flotbot_test_canaries_${Date.now()}`);
        canary = new CanarySystem(testCanaryDir);
        await canary.deploy();
    });

    afterEach(() => {
        canary.cleanup();
    });

    test("should deploy safe decoy canary files in canary directory", () => {
        const status = canary.checkStatus();
        expect(status.deployed).toBe(true);
        expect(status.tripped).toBe(false);
        expect(fs.existsSync(testCanaryDir)).toBe(true);
    });

    test("should detect canary modification", async () => {
        const canaryFile = path.join(testCanaryDir, "financial_forecast_2026.docx");
        fs.appendFileSync(canaryFile, "MODIFIED_PAYLOAD");

        // Wait brief tick for fs.watch event
        await new Promise(r => setTimeout(r, 100));

        const status = canary.checkStatus();
        expect(status.tripped).toBe(true);
    });
});
