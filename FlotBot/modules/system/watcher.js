const Event = require("../../core/events/Event");
const EventTypes = require("../../core/events/EventTypes");

/**
 * SystemWatcher
 * Monitors active Windows processes, detecting process creation and termination.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 🚀 ARCHITECTURAL ROADMAP: Native C++ Authenticode Verification
 * ─────────────────────────────────────────────────────────────────────────────
 * Future iterations will bind native C++ Win32 CryptoAPI via Node.js N-API / node-gyp:
 *   - Call WinVerifyTrust (wintrust.dll) with WINTRUST_ACTION_GENERIC_VERIFY_V2
 *     to cryptographically validate digital signatures of newly spawned binaries.
 *   - Extract Subject / Issuer X.509 certificate chains and verify against the
 *     Windows Trusted Root Certification Authorities store.
 *   - Enrich PROCESS_CREATED events with { isSigned: boolean, signer: string, trustStatus: string }.
 *   - Flag unsigned binaries spawned in non-standard execution paths (temp, appdata)
 *     for instant high-priority heuristic scoring before behavioral analysis.
 * ─────────────────────────────────────────────────────────────────────────────
 */
class SystemWatcher {

    constructor(collector, eventBus) {

        this.collector = collector;
        this.eventBus = eventBus;
        this.previous = new Map();

    }

    async scan() {

        const processes = await this.collector.collect();

        const current = new Map();

        for (const process of processes) {

            current.set(process.pid, process);

            if (!this.previous.has(process.pid)) {

                this.eventBus.publish(
                    new Event(
                        EventTypes.PROCESS_CREATED,
                        process
                    )
                );

            }

        }

        for (const pid of this.previous.keys()) {

            if (!current.has(pid)) {

                this.eventBus.publish(
                    new Event(
                        EventTypes.PROCESS_TERMINATED,
                        this.previous.get(pid)
                    )
                );

            }

        }

        this.previous = current;

    }

}

module.exports = SystemWatcher;