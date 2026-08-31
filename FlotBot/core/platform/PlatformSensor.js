/**
 * PlatformSensor
 * ─────────────────────────────────────────────────────────────
 * Base class for all OS-specific security telemetry sensors.
 * Provides lifecycle management, status tracking, error containment,
 * and self-healing hooks.
 */
class PlatformSensor {

    constructor(name, platform) {
        this.name = name;
        this.platform = platform || process.platform;
        this.status = "STOPPED"; // "RUNNING" | "STOPPED" | "DEGRADED" | "PERMISSION_REQUIRED" | "NOT_AVAILABLE"
        this.lastError = null;
        this.lastCollectionTs = null;
        this.metrics = {
            collectionCount: 0,
            errorCount: 0,
            avgLatencyMs: 0
        };
    }

    async initialize() {
        // Override in child classes
        this.status = "INITIALIZED";
        return true;
    }

    async start() {
        this.status = "RUNNING";
        return true;
    }

    async stop() {
        this.status = "STOPPED";
        return true;
    }

    async collect() {
        throw new Error(`Sensor '${this.name}' does not implement collect()`);
    }

    async healthCheck() {
        return {
            name: this.name,
            platform: this.platform,
            status: this.status,
            lastError: this.lastError ? this.lastError.message : null,
            lastCollectionTs: this.lastCollectionTs,
            metrics: { ...this.metrics }
        };
    }

    _recordCollection(latencyMs) {
        this.metrics.collectionCount++;
        this.lastCollectionTs = new Date().toISOString();
        this.metrics.avgLatencyMs = Math.round(
            (this.metrics.avgLatencyMs * (this.metrics.collectionCount - 1) + latencyMs) / this.metrics.collectionCount
        );
        if (this.status === "DEGRADED" && this.lastError === null) {
            this.status = "RUNNING";
        }
    }

    _recordError(err) {
        this.metrics.errorCount++;
        this.lastError = err;
        this.status = "DEGRADED";
        console.warn(`[Sensor:${this.name}] Sensor error (marked DEGRADED):`, err.message);
    }
}

module.exports = PlatformSensor;
