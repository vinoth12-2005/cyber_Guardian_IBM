const ReverseShellRule = require("../modules/network/rules/ReverseShellRule");
const BeaconRule = require("../modules/network/rules/BeaconRule");
const SuspiciousOutboundRule = require("../modules/network/rules/SuspiciousOutboundRule");

describe("Network Threat Detection Rules Tests", () => {

    test("ReverseShellRule should trigger on suspicious outbound port", async () => {
        const rule = new ReverseShellRule();
        const connections = [
            { protocol: "TCP", localAddr: "192.168.1.100", localPort: "51020", remoteAddr: "8.8.8.8", remotePort: "4444", state: "ESTABLISHED", pid: "4004" }
        ];

        const result = await rule.evaluate({ connections });
        expect(result).not.toBeNull();
        expect(result.detected).toBe(true);
        expect(result.pid).toBe("4004");
        expect(result.evidence.remotePort).toBe("4444");
    });

    test("BeaconRule should trigger on repeated connections", async () => {
        const rule = new BeaconRule();
        // Repeat connections 3 times (threshold = 3)
        const connections = [
            { protocol: "TCP", localAddr: "192.168.1.100", localPort: "51021", remoteAddr: "45.142.212.10", remotePort: "80", state: "ESTABLISHED", pid: "5005" }
        ];

        // Cycle 1
        let result = await rule.evaluate({ connections });
        expect(result).toBeNull();

        // Cycle 2
        result = await rule.evaluate({ connections });
        expect(result).toBeNull();

        // Cycle 3
        result = await rule.evaluate({ connections });
        expect(result).not.toBeNull();
        expect(result.detected).toBe(true);
        expect(result.evidence.connectionCount).toBe(3);
    });

    test("SuspiciousOutboundRule should trigger on system shell connecting externally", async () => {
        const rule = new SuspiciousOutboundRule();
        const connections = [
            { protocol: "TCP", localAddr: "192.168.1.100", localPort: "51022", remoteAddr: "185.220.101.5", remotePort: "443", state: "ESTABLISHED", pid: "6006", image: "powershell.exe" }
        ];

        const result = await rule.evaluate({ connections });
        expect(result).not.toBeNull();
        expect(result.detected).toBe(true);
        expect(result.evidence.image).toBe("powershell.exe");
    });

});
