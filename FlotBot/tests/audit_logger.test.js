const AuditLogger = require("../core/audit/AuditLogger");

describe("AuditLogger Cryptographic Chaining Tests", () => {
    let auditLogger;

    beforeEach(() => {
        auditLogger = new AuditLogger();
    });

    test("should log actions and maintain valid cryptographic signature chain", async () => {
        await auditLogger.log({
            actionType: "quarantine_file",
            riskCategory: "MODERATE",
            reason: "Malicious hash match",
            userApproved: true,
            details: { file: "test.exe" }
        });

        await auditLogger.log({
            actionType: "terminate_process",
            riskCategory: "MODERATE",
            reason: "C2 socket active",
            userApproved: true,
            details: { pid: 4821 }
        });

        const integrity = await auditLogger.verifyIntegrity();
        expect(integrity.valid).toBe(true);
        expect(integrity.totalChecked).toBe(2);
        expect(integrity.brokenAt).toBeNull();
    });

    test("should detect tampering if log signature or payload is modified", async () => {
        await auditLogger.log({
            actionType: "quarantine_file",
            riskCategory: "MODERATE",
            reason: "Initial log",
            details: {}
        });

        // Simulate tampering
        auditLogger._inMemoryLogs[0].action_type = "tampered_action";

        const integrity = await auditLogger.verifyIntegrity();
        expect(integrity.valid).toBe(false);
        expect(integrity.brokenAt).toBeDefined();
    });
});
