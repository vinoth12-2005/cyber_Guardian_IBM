/**
 * BaselineEngine
 * ─────────────────────────────────────────────────────────────
 * Establishes per-application behavioral baselines:
 *   - Normal child process lineages
 *   - Normal binary execution paths
 *   - Normal outbound network destinations
 *
 * Distinguishes UNUSUAL (anomaly) from outright MALICIOUS.
 */
class BaselineEngine {

    constructor(baselineRepo = null) {
        this.baselineRepo = baselineRepo;
        this.approvedProcesses = new Set();
        this.approvedNetworkDestinations = new Set();
        this.approvedLaunchPaths = new Set();
        this.learningMode = false;
    }

    async init() {
        if (this.baselineRepo) {
            try {
                const records = await this.baselineRepo.getApproved();
                for (const r of records) {
                    if (r.type === "process") this.approvedProcesses.add(r.value.toLowerCase());
                    if (r.type === "ip" || r.type === "domain") this.approvedNetworkDestinations.add(r.value.toLowerCase());
                    if (r.type === "path") this.approvedLaunchPaths.add(r.value.toLowerCase());
                }
            } catch {}
        }
    }

    isProcessApproved(procName) {
        if (!procName) return false;
        return this.approvedProcesses.has(procName.toLowerCase().trim());
    }

    isDestinationApproved(ipOrDomain) {
        if (!ipOrDomain) return false;
        return this.approvedNetworkDestinations.has(ipOrDomain.toLowerCase().trim());
    }

    approveProcess(procName) {
        if (procName) this.approvedProcesses.add(procName.toLowerCase().trim());
    }

    approveDestination(dest) {
        if (dest) this.approvedNetworkDestinations.add(dest.toLowerCase().trim());
    }

    reset() {
        this.approvedProcesses.clear();
        this.approvedNetworkDestinations.clear();
        this.approvedLaunchPaths.clear();
    }
}

module.exports = BaselineEngine;
