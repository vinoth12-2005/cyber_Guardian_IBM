/**
 * RegistryWatcher
 * ─────────────────────────────────────────────────────────────
 * Compares persistence and service snapshots between scan cycles to detect
 * real additions, modifications, and deletions in Run keys, autostart, and services.
 *
 * Establishes an initial baseline on the first scan cycle to avoid
 * false-positive alerts on pre-existing legitimate system services.
 */
class RegistryWatcher {

    constructor(collector, eventBus) {
        this.collector    = collector;
        this.eventBus     = eventBus;
        this.prevRunKeys  = new Map();
        this.prevServices = new Map();
        this.initialized  = false;
    }

    _runKeyId(entry) {
        return `${entry.keyPath}|${entry.valueName}`;
    }

    _serviceId(service) {
        return service.name.toLowerCase();
    }

    async scan() {
        let runKeys, services;

        try {
            ({ runKeys, services } = await this.collector.collect());
        } catch (err) {
            console.error("[RegistryWatcher] Collection error:", err.message);
            return { changes: [], runKeys: [], services: [] };
        }

        const changes = [];

        // ── 1. Run Key / Autostart Delta ──────────────────────────────────
        const currentRunKeys = new Map();
        for (const entry of (runKeys || [])) {
            const id = this._runKeyId(entry);
            currentRunKeys.set(id, entry);
        }

        // ── 2. Service Delta ──────────────────────────────────────────────
        const currentServices = new Map();
        for (const svc of (services || [])) {
            const id = this._serviceId(svc);
            currentServices.set(id, svc);
        }

        // ── 3. Initial Baseline Check ─────────────────────────────────────
        if (!this.initialized && this.prevRunKeys.size === 0 && this.prevServices.size === 0) {
            this.prevRunKeys   = currentRunKeys;
            this.prevServices  = currentServices;
            this.initialized   = true;
            return { changes: [], runKeys, services, isInitialBaseline: true };
        }

        // ── 4. Detect Run Key additions and modifications ─────────────────
        for (const [id, entry] of currentRunKeys.entries()) {
            if (!this.prevRunKeys.has(id)) {
                changes.push({ action: "ADDED", type: "runKey", entry });
            } else {
                const prev = this.prevRunKeys.get(id);
                if (prev.data !== entry.data) {
                    changes.push({ action: "MODIFIED", type: "runKey", entry, oldData: prev.data });
                }
            }
        }

        for (const [id, entry] of this.prevRunKeys.entries()) {
            if (!currentRunKeys.has(id)) {
                changes.push({ action: "DELETED", type: "runKey", entry });
            }
        }

        // ── 5. Detect Service additions and modifications ─────────────────
        for (const [id, svc] of currentServices.entries()) {
            if (!this.prevServices.has(id)) {
                changes.push({ action: "ADDED", type: "service", entry: svc });
            } else {
                const prev = this.prevServices.get(id);
                if (prev.path !== svc.path || prev.state !== svc.state) {
                    changes.push({ action: "MODIFIED", type: "service", entry: svc, oldEntry: prev });
                }
            }
        }

        for (const [id, svc] of this.prevServices.entries()) {
            if (!currentServices.has(id)) {
                changes.push({ action: "DELETED", type: "service", entry: svc });
            }
        }

        this.prevRunKeys  = currentRunKeys;
        this.prevServices = currentServices;

        if (this.eventBus && changes.length > 0) {
            for (const change of changes) {
                this.eventBus.publish({ type: "REGISTRY_MODIFIED", data: change });
            }
        }

        return { changes, runKeys, services };
    }
}

module.exports = RegistryWatcher;
