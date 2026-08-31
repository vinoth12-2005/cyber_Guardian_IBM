const ImportAnalyzer = require("../core/fileengine/ImportAnalyzer");

describe("ImportAnalyzer", () => {

    test("Flags process injection and remote thread manipulation APIs", () => {
        const apis = ["VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread"];
        const res = ImportAnalyzer.analyze(apis);

        expect(res.threatScore).toBeGreaterThanOrEqual(25);
        expect(res.verdict).not.toBe("NORMAL");
        expect(res.matchedCapabilities.some(c => c.capability === "PROCESS_INJECTION")).toBe(true);
    });

    test("Flags combination of injection, C2 network, and persistence with synergy boost", () => {
        const apis = [
            "VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread",
            "WSAStartup", "connect", "HttpSendRequestA",
            "RegSetValueExA", "CreateServiceA"
        ];
        const res = ImportAnalyzer.analyze(apis);

        expect(res.threatScore).toBeGreaterThanOrEqual(70);
        expect(res.verdict).toBe("SUSPICIOUS");
        expect(res.matchedCapabilities.length).toBeGreaterThanOrEqual(3);
    });

    test("Standard benign runtime APIs do not produce high risk score", () => {
        const apis = ["printf", "malloc", "free", "strlen", "fopen", "fclose", "ExitProcess"];
        const res = ImportAnalyzer.analyze(apis);

        expect(res.threatScore).toBe(0);
        expect(res.verdict).toBe("NORMAL");
    });

});
