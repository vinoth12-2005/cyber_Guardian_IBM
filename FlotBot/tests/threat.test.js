const ThreatEngine = require("../core/threats/ThreatEngine");
const PowerShellRule = require("../modules/system/rules/PowerShellRule");

describe("ThreatEngine Evaluation Tests", () => {

    test("should register rules and evaluate mock data triggering alert on suspicious arguments", async () => {
        const engine = new ThreatEngine();
        engine.registerRule(new PowerShellRule());

        const mockProcesses = [
            { image: "powershell.exe", pid: "9999", cmdLine: "powershell.exe -ExecutionPolicy Bypass -Hidden -EncodedCommand SQBFAFgA", session: "Console", sessionNumber: "1", memoryRaw: "123 K" }
        ];

        const alerts = await engine.analyze(mockProcesses);
        expect(alerts).toHaveLength(1);
        expect(alerts[0].detected).toBe(true);
        expect(alerts[0].rule).toBe("Suspicious PowerShell Execution");
    });

    test("should not trigger alert for benign powershell without suspicious flags", async () => {
        const engine = new ThreatEngine();
        engine.registerRule(new PowerShellRule());

        const mockProcesses = [
            { image: "powershell.exe", pid: "9999", cmdLine: "powershell.exe", session: "Console", sessionNumber: "1", memoryRaw: "123 K" }
        ];

        const alerts = await engine.analyze(mockProcesses);
        expect(alerts).toHaveLength(0);
    });

    test("should not trigger alert for whitelist processes", async () => {
        const engine = new ThreatEngine();
        engine.registerRule(new PowerShellRule());

        const mockProcesses = [
            { image: "svchost.exe", pid: "4", session: "Console", sessionNumber: "1", memoryRaw: "123 K" }
        ];

        const alerts = await engine.analyze(mockProcesses);
        expect(alerts).toHaveLength(0);
    });

});