const SafeActionExecutor = require("../core/security/SafeActionExecutor");

describe("SafeActionExecutor Authorization & Safety Tests", () => {
    let executor;

    beforeEach(() => {
        executor = new SafeActionExecutor();
    });

    test("should reject non-allowlisted arbitrary commands", async () => {
        const result = await executor.executeAction({
            actionType: "arbitrary_shell_command",
            params: { cmd: "rm -rf /" },
            userApproved: true
        });

        expect(result.success).toBe(false);
        expect(result.status).toBe("REJECTED");
    });

    test("should prevent terminating protected PID 1 or core OS processes", async () => {
        const result = await executor.executeAction({
            actionType: "terminate_process",
            params: { pid: 1, processName: "systemd" },
            userApproved: true
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("protected");
    });

    test("should require user confirmation for MODERATE / HIGH_RISK actions", async () => {
        const result = await executor.executeAction({
            actionType: "quarantine_file",
            params: { filePath: "/tmp/sample.exe" },
            userApproved: false
        });

        expect(result.success).toBe(false);
        expect(result.requiresApproval).toBe(true);
        expect(result.riskCategory).toBe("MODERATE");
    });
});
