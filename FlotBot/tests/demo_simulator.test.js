const DemoSimulator = require("../core/demo/DemoSimulator");

describe("DemoSimulator Synthetic Attack Tests", () => {

    test("should generate synthetic phishing to C2 scenario with explicit is_demo flags", () => {
        const events = DemoSimulator.generateScenario(DemoSimulator.SCENARIOS.PHISHING_TO_C2);
        expect(events.length).toBeGreaterThanOrEqual(4);

        for (const e of events) {
            expect(e.is_demo).toBe(true);
            const evString = JSON.stringify(e);
            expect(evString).toContain("[DEMO MODE]");
        }
    });

    test("should generate ransomware canary burst scenario", () => {
        const events = DemoSimulator.generateScenario(DemoSimulator.SCENARIOS.RANSOMWARE_BURST);
        expect(events.length).toBeGreaterThanOrEqual(2);
        expect(events.some(e => e.event_type === "canary_triggered")).toBe(true);
        expect(events.every(e => e.is_demo === true)).toBe(true);
    });
});
