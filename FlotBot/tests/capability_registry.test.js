const CapabilityRegistry = require("../core/platform/CapabilityRegistry");
const PermissionManager = require("../core/platform/PermissionManager");

describe("CapabilityRegistry & PermissionManager Tests", () => {

    test("CapabilityRegistry should inspect host and return complete posture matrix", async () => {
        const registry = new CapabilityRegistry();
        const caps = await registry.detectCapabilities(true);

        expect(caps.os).toBeDefined();
        expect(caps.architecture).toBeDefined();
        expect(caps.matrix).toBeDefined();
        expect(caps.subsystems).toHaveProperty("filesystem");
        expect(caps.subsystems).toHaveProperty("processMonitoring");
        expect(caps.subsystems).toHaveProperty("networkMonitoring");
        expect(caps.subsystems).toHaveProperty("yara");
    });

    test("PermissionManager should return actionable remediations for any degraded subsystems", () => {
        const perms = PermissionManager.checkPermissions();
        expect(perms).toHaveProperty("platform");
        expect(perms).toHaveProperty("isElevated");
        expect(perms).toHaveProperty("missingPermissions");
        expect(Array.isArray(perms.missingPermissions)).toBe(true);
    });
});
