const CorrelationEngine = require("../core/correlation/CorrelationEngine");
const UnifiedSecurityEvent = require("../core/events/UnifiedSecurityEvent");

describe("CorrelationEngine & Threat Graph Tests", () => {
    let correlationEngine;

    beforeEach(() => {
        correlationEngine = new CorrelationEngine({ windowMs: 10_000 });
    });

    test("should correlate multiple related events into a single Incident", () => {
        const event1 = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED,
            process: { pid: "6123", name: "badproc.exe" },
            host_id: "sec-host"
        });

        const event2 = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.NETWORK_CONNECTION,
            process: { pid: "6123", name: "badproc.exe" },
            network: { remote_ip: "198.51.100.99", remote_port: "4444" },
            host_id: "sec-host"
        });

        const { incident: inc1, isNew: isNew1 } = correlationEngine.ingest(event1);
        expect(isNew1).toBe(true);
        expect(inc1.event_count).toBe(1);

        const { incident: inc2, isNew: isNew2 } = correlationEngine.ingest(event2);
        expect(isNew2).toBe(false);
        expect(inc2.incident_id).toBe(inc1.incident_id);
        expect(inc2.event_count).toBe(2);
        expect(inc2.threat_graph.nodes.length).toBeGreaterThanOrEqual(2);
        expect(inc2.attack_story.timeline).toHaveLength(2);
    });
});
