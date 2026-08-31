/**
 * FileWatcher
 * ─────────────────────────────────────────────────────────────
 * Diffs consecutive file system snapshots to detect
 * file creation, modification, and deletion events.
 *
 * Establishes an initial baseline on the first scan cycle without
 * flooding false-positive CREATED/MODIFIED alerts on existing files.
 */
class FileWatcher {

    constructor(collector, eventBus) {
        this.collector   = collector;
        this.eventBus    = eventBus;
        this.previous    = new Map();
        this.initialized = false;
    }

    async scan() {
        let current;

        try {
            current = await this.collector.collect();
        } catch (err) {
            console.error("[FileWatcher] Collection error:", err.message);
            return { events: [], snapshot: new Map() };
        }

        const events = [];

        // 1. Initial Baseline Scan: Record existing files without emitting creation bursts
        if (!this.initialized && this.previous.size === 0) {
            this.previous = current;
            this.initialized = true;
            return { events: [], snapshot: current, isInitialBaseline: true };
        }

        // 2. Subsequent Scans: Detect newly created and modified files
        for (const [filePath, entry] of current.entries()) {
            if (!this.previous.has(filePath)) {
                events.push({ action: "CREATED", file: entry });

                if (this.eventBus) {
                    this.eventBus.publish({ type: "FILE_CREATED", data: entry, file: entry });
                }
            } else {
                const prev = this.previous.get(filePath);
                if (prev.modified !== entry.modified || prev.size !== entry.size) {
                    events.push({ action: "MODIFIED", file: entry, oldSize: prev.size });

                    if (this.eventBus) {
                        this.eventBus.publish({ type: "FILE_MODIFIED", data: { ...entry, oldSize: prev.size }, file: entry });
                    }
                }
            }
        }

        // 3. Detect deleted files
        for (const [filePath, entry] of this.previous.entries()) {
            if (!current.has(filePath)) {
                events.push({ action: "DELETED", file: entry });

                if (this.eventBus) {
                    this.eventBus.publish({ type: "FILE_DELETED", data: entry, file: entry });
                }
            }
        }

        this.previous = current;
        return { events, snapshot: current };
    }
}

module.exports = FileWatcher;
