const SensorSupervisor = require("../core/system/SensorSupervisor");
const PlatformSensor = require("../core/platform/PlatformSensor");

class MockSensor extends PlatformSensor {
    constructor(name, shouldFail = false) {
        super(name, "linux");
        this.shouldFail = shouldFail;
    }
    async collect() {
        if (this.shouldFail) throw new Error("Hardware timeout");
        return { data: "ok" };
    }
}

describe("SensorSupervisor Fault Isolation & Health Tests", () => {

    test("should isolate sensor failures and mark sensor DEGRADED without throwing", async () => {
        const supervisor = new SensorSupervisor();
        const healthySensor = new MockSensor("healthy_sensor", false);
        const faultySensor = new MockSensor("faulty_sensor", true);

        supervisor.registerSensor(healthySensor);
        supervisor.registerSensor(faultySensor);

        await supervisor.startAll();
        const results = await supervisor.collectCycle();

        expect(results.has("healthy_sensor")).toBe(true);
        expect(results.has("faulty_sensor")).toBe(false);

        const health = await supervisor.getHealthReport();
        expect(health.sensors["healthy_sensor"].supervisorStatus).toBe("RUNNING");
        expect(health.sensors["faulty_sensor"].supervisorStatus).toBe("DEGRADED");
        expect(health.overallHealth).toBe("DEGRADED");
    });
});
