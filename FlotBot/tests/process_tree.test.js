const ProcessTreeEngine = require("../core/detection/ProcessTreeEngine");

describe("ProcessTreeEngine Tests", () => {
    let treeEngine;

    beforeEach(() => {
        treeEngine = new ProcessTreeEngine();
    });

    test("should build hierarchical parent-child process tree", () => {
        const procs = [
            { pid: 100, ppid: 0, name: "systemd" },
            { pid: 200, ppid: 100, name: "explorer.exe" },
            { pid: 300, ppid: 200, name: "chrome.exe" }
        ];

        const { roots, anomalies, totalNodes } = treeEngine.update(procs);
        expect(totalNodes).toBe(3);
        expect(roots).toHaveLength(1);
        expect(roots[0].children[0].name).toBe("explorer.exe");
        expect(anomalies).toHaveLength(0);
    });

    test("should detect suspicious Office/PDF spawning script interpreter", () => {
        const procs = [
            { pid: 1000, ppid: 500, name: "winword.exe" },
            { pid: 1001, ppid: 1000, name: "powershell.exe", cmdLine: "powershell.exe -ExecutionPolicy Bypass" }
        ];

        const { anomalies } = treeEngine.update(procs);
        expect(anomalies).toHaveLength(1);
        expect(anomalies[0].type).toBe("SUSPICIOUS_PARENT_CHILD");
        expect(anomalies[0].severity).toBe("HIGH");
    });

    test("should detect process masquerading in user temp directory", () => {
        const procs = [
            { pid: 8888, ppid: 100, name: "svchost.exe", exePath: "/tmp/svchost.exe" }
        ];

        const { anomalies } = treeEngine.update(procs);
        expect(anomalies).toHaveLength(1);
        expect(anomalies[0].type).toBe("PROCESS_MASQUERADING");
        expect(anomalies[0].severity).toBe("CRITICAL");
    });

    test("should reconstruct full ancestor lineage", () => {
        const procs = [
            { pid: 1, ppid: 0, name: "init" },
            { pid: 10, ppid: 1, name: "parent" },
            { pid: 20, ppid: 10, name: "child" }
        ];

        treeEngine.update(procs);
        const lineage = treeEngine.getLineage(20);
        expect(lineage).toHaveLength(3);
        expect(lineage[0].pid).toBe(1);
        expect(lineage[2].pid).toBe(20);
    });
});
