const BehaviorEngine = require("../core/detection/BehaviorEngine");
const UnifiedSecurityEvent = require("../core/events/UnifiedSecurityEvent");

describe("BehaviorEngine Attack Lifecycle Tests", () => {
    let behaviorEngine;

    beforeEach(() => {
        behaviorEngine = new BehaviorEngine();
    });

    test("should correlate File Drop → Execution → Outbound C2 Socket", () => {
        const dropEvent = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.FILE_CREATED,
            file: { name: "dropper.exe", path: "/tmp/dropper.exe", extension: ".exe" }
        });

        const execEvent = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED,
            process: { pid: "7777", name: "dropper.exe", cmd_line: "/tmp/dropper.exe" }
        });

        const netEvent = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.NETWORK_CONNECTION,
            process: { pid: "7777", name: "dropper.exe" },
            network: { remote_ip: "185.220.101.5", remote_port: "4444", protocol: "TCP" }
        });

        behaviorEngine.analyze(dropEvent);
        behaviorEngine.analyze(execEvent);
        const findings = behaviorEngine.analyze(netEvent);

        expect(findings.length).toBeGreaterThanOrEqual(1);
        expect(findings.some(f => f.pattern.includes("Full Attack Lifecycle"))).toBe(true);
        expect(findings[0].severity).toBe("CRITICAL");
    });

    test("should correlate Process Execution → Persistence Installation", () => {
        const execEvent = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED,
            process: { pid: "8888", name: "backdoor.sh" }
        });

        const persistEvent = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.PERSISTENCE_CREATED,
            persistence: { location: "/etc/cron.d/job", target: "backdoor.sh" }
        });

        behaviorEngine.analyze(execEvent);
        const findings = behaviorEngine.analyze(persistEvent);

        expect(findings.some(f => f.pattern.includes("Persistence"))).toBe(true);
    });
});
