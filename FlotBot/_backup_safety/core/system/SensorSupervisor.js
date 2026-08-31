/**
 * SensorSupervisor
 * ─────────────────────────────────────────────────────────────
 * Sensor lifecycle coordinator, fault isolator, and self-healing supervisor.
 * Ensures:
 *   - Unhandled sensor errors are isolated and logged without crashing the app
 *   - Degraded sensors are automatically retried with exponential backoff
 *   - Overall sensor health state is tracked in real time
 */
class SensorSupervisor {

    constructor(eventBus = null) {
        this.eventBus = eventBus;
        this.sensors = new Map(); // name -> { sensor, status, consecutiveErrors, nextRetryTs }
        this.isRunning = false;
    }

    /**
     * Register a sensor under supervisory control.
     * @param {PlatformSensor} sensor
     */
    registerSensor(sensor) {
        if (!sensor || !sensor.name) return;
        this.sensors.set(sensor.name, {
            sensor,
            status: "INITIALIZED",
            consecutiveErrors: 0,
            nextRetryTs: 0
        });
        console.log(`[SensorSupervisor] Registered sensor: "${sensor.name}" (${sensor.platform})`);
    }

    async startAll() {
        this.isRunning = true;
        for (const [name, entry] of this.sensors.entries()) {
            try {
                await entry.sensor.initialize();
                await entry.sensor.start();
                entry.status = "RUNNING";
            } catch (err) {
                entry.status = "DEGRADED";
                entry.consecutiveErrors = 1;
                entry.nextRetryTs = Date.now() + 5000;
                console.warn(`[SensorSupervisor] Initial start failed for sensor "${name}":`, err.message);
            }
        }
    }

    async stopAll() {
        this.isRunning = false;
        for (const [, entry] of this.sensors.entries()) {
            try {
                await entry.sensor.stop();
                entry.status = "STOPPED";
            } catch {}
        }
    }

    /**
     * Execute collection cycle across all active healthy sensors safely.
     * @returns {Promise<Map<string, object>>} Sensor outputs
     */
    async collectCycle() {
        const now = Date.now();
        const results = new Map();

        const collectionPromises = Array.from(this.sensors.entries()).map(async ([name, entry]) => {
            // Check backoff if degraded
            if (entry.status === "DEGRADED" && now < entry.nextRetryTs) {
                return;
            }

            try {
                const data = await Promise.race([
                    entry.sensor.collect(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Sensor collection timeout (10s)")), 10_000))
                ]);

                // Reset error backoff on successful collection
                entry.consecutiveErrors = 0;
                entry.status = "RUNNING";
                results.set(name, data);

            } catch (err) {
                entry.consecutiveErrors++;
                entry.status = "DEGRADED";
                // Exponential backoff: 5s, 10s, 20s, max 60s
                const backoffMs = Math.min(60_000, 5000 * Math.pow(2, entry.consecutiveErrors - 1));
                entry.nextRetryTs = now + backoffMs;

                console.warn(`[SensorSupervisor] Error in sensor "${name}" (retry in ${backoffMs / 1000}s):`, err.message);
            }
        });

        await Promise.allSettled(collectionPromises);
        return results;
    }

    /**
     * Get real-time health diagnostics across all sensors.
     */
    async getHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalSensors: this.sensors.size,
            runningCount: 0,
            degradedCount: 0,
            sensors: {}
        };

        for (const [name, entry] of this.sensors.entries()) {
            const sensorHealth = await entry.sensor.healthCheck();
            if (entry.status === "RUNNING") report.runningCount++;
            if (entry.status === "DEGRADED") report.degradedCount++;

            report.sensors[name] = {
                supervisorStatus: entry.status,
                consecutiveErrors: entry.consecutiveErrors,
                ...sensorHealth
            };
        }

        report.overallHealth = report.degradedCount === 0 ? "HEALTHY" : report.runningCount > 0 ? "DEGRADED" : "CRITICAL";
        return report;
    }
}

module.exports = SensorSupervisor;
