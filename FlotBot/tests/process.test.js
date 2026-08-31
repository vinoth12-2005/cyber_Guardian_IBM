const SystemCollector = require("../modules/system/collector");

describe("SystemCollector Process Collection Tests", () => {

    test("should collect processes and return list with PIDs", async () => {
        const collector = new SystemCollector();

        // Mock OS calls to prevent slow execution and hangs inside sandboxed environments
        jest.spyOn(collector, "_getProcessList").mockResolvedValue([
            { image: "chrome.exe", pid: "1024", session: "Console", sessionNumber: "1", memoryRaw: "15,000 K" }
        ]);

        jest.spyOn(collector, "_getProcessDetails").mockResolvedValue(
            new Map([
                ["1024", { cmdLine: "chrome.exe --mock-flag", exePath: "C:\\chrome.exe", parentPid: "500" }]
            ])
        );

        const processes = await collector.collect();

        expect(Array.isArray(processes)).toBe(true);
        expect(processes.length).toBe(1);
        expect(processes[0].pid).toBe("1024");
        expect(processes[0].image).toBe("chrome.exe");
        expect(processes[0].cmdLine).toBe("chrome.exe --mock-flag");
        expect(processes[0].parentPid).toBe("500");
    });

});