const ThreadAnalyzer = require("../modules/malware/ThreadAnalyzer");

describe("ThreadAnalyzer Process & Thread Anomaly Tests", () => {
    let threadAnalyzer;

    beforeEach(() => {
        threadAnalyzer = new ThreadAnalyzer();
    });

    test("should detect anomalies when process has high thread count and high CPU", () => {
        const mockProcesses = [
            { pid: 1234, name: "xmrig.exe", threadCount: 120, cpu: 95.5, path: "C:\\miner\\xmrig.exe" },
            { pid: 5678, name: "notepad.exe", threadCount: 4, cpu: 0.1, path: "C:\\Windows\\notepad.exe" }
        ];

        const anomalies = threadAnalyzer._detectAnomalies(mockProcesses);
        expect(anomalies.length).toBe(1);
        expect(anomalies[0].pid).toBe(1234);
        expect(anomalies[0].severity).toBe("HIGH");
        expect(anomalies[0].reasons.some(r => r.includes("cryptominer") || r.includes("Known"))).toBe(true);
    });

    test("should audit system processes without errors", async () => {
        const audit = await threadAnalyzer.auditThreads();
        expect(audit).toHaveProperty("totalProcessesAudited");
        expect(audit).toHaveProperty("anomaliesFound");
        expect(audit).toHaveProperty("aiForensicReport");
    });
});
