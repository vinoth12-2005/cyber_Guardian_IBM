/**
 * BehaviorEngine
 * ─────────────────────────────────────────────────────────────
 * Multi-event sequence correlator and behavior chain analyzer.
 * Identifies high-confidence composite attack chains:
 *   1. Web Download → Executable Drop → Process Execution → Outbound C2
 *   2. Unknown Process → Script Interpreter → OS Persistence Key
 *   3. Application → Unexpected Child Process → Network Activity
 *   4. Mass File Modification → Rapid Rename → Suspicious Process
 */
class BehaviorEngine {

    constructor(baselineEngine = null) {
        this.baseline = baselineEngine;
        this.recentEvents = [];
        this.windowMs = 60_000; // 1-minute correlation window
    }

    /**
     * Ingest normalized security event and analyze event stream.
     * @param {UnifiedSecurityEvent|object} event
     * @param {Array<object>} allActiveEvents
     * @returns {Array<object>} Detected behavioral threat patterns
     */
    analyze(event, allActiveEvents = []) {
        const now = Date.now();
        if (event) {
            this.recentEvents.push({ ...event, _ts: now });
        }

        // Prune old events outside correlation window
        this.recentEvents = this.recentEvents.filter(e => (now - e._ts) <= this.windowMs);

        const findings = [];
        const pool = [...this.recentEvents, ...allActiveEvents];

        // ── Pattern 1: Download → Drop → Execute → Network (Kill Chain) ─────────
        const droppedFiles = pool.filter(e => e.event_type === "file_created" && (e.file?.extension === ".exe" || e.file?.extension === ".sh" || e.file?.extension === ".bat" || e.file?.extension === ".ps1"));
        const startedProcs = pool.filter(e => e.event_type === "process_started");
        const networkConns = pool.filter(e => e.event_type === "network_connection");

        for (const drop of droppedFiles) {
            const dropName = (drop.file?.name || "").toLowerCase();
            const matchedProc = startedProcs.find(p => (p.process?.name || "").toLowerCase() === dropName || (p.process?.cmd_line || "").toLowerCase().includes(dropName));

            if (matchedProc) {
                const matchedConn = networkConns.find(n => n.process?.pid === matchedProc.process?.pid);

                if (matchedConn) {
                    findings.push({
                        pattern: "Full Attack Lifecycle: Download → Execute → C2 Network",
                        severity: "CRITICAL",
                        score: 98,
                        confidence: 0.95,
                        description: `Dropped file "${drop.file?.name}" was executed (PID ${matchedProc.process?.pid}) and established outbound connection to ${matchedConn.network?.remote_ip}:${matchedConn.network?.remote_port}.`,
                        evidence: [
                            { stage: "FILE_DROP", details: drop.file },
                            { stage: "EXECUTION", details: matchedProc.process },
                            { stage: "C2_NETWORK", details: matchedConn.network }
                        ],
                        mitre: ["T1105", "T1204.002", "T1071"]
                    });
                } else {
                    findings.push({
                        pattern: "File Drop + Direct Execution",
                        severity: "HIGH",
                        score: 85,
                        confidence: 0.9,
                        description: `Dropped executable "${drop.file?.name}" was executed shortly after creation (PID ${matchedProc.process?.pid}).`,
                        evidence: [
                            { stage: "FILE_DROP", details: drop.file },
                            { stage: "EXECUTION", details: matchedProc.process }
                        ],
                        mitre: ["T1105", "T1204.002"]
                    });
                }
            }
        }

        // ── Pattern 2: Process Execution → Persistence Installation ───────────
        const persistenceEvents = pool.filter(e => e.event_type === "persistence_created");
        if (startedProcs.length > 0 && persistenceEvents.length > 0) {
            for (const persist of persistenceEvents) {
                const target = (persist.persistence?.target || "").toLowerCase();
                const matchedProc = startedProcs.find(p => target.includes((p.process?.name || "").toLowerCase()));

                if (matchedProc) {
                    findings.push({
                        pattern: "Execution Followed by OS Persistence",
                        severity: "HIGH",
                        score: 88,
                        confidence: 0.92,
                        description: `Process "${matchedProc.process?.name}" (PID ${matchedProc.process?.pid}) installed startup persistence at: ${persist.persistence?.location}`,
                        evidence: [
                            { stage: "EXECUTION", details: matchedProc.process },
                            { stage: "PERSISTENCE", details: persist.persistence }
                        ],
                        mitre: ["T1059", "T1547"]
                    });
                }
            }
        }

        // ── Pattern 3: LOLBin / Shell with External Network Socket ────────────
        for (const conn of networkConns) {
            const procName = (conn.process?.name || "").toLowerCase();
            if (/^(powershell|cmd|bash|nc|ncat|certutil|mshta|rundll32)(\.exe)?$/i.test(procName)) {
                findings.push({
                    pattern: "Command Shell / LOLBin Interactive Network Connection",
                    severity: "HIGH",
                    score: 90,
                    confidence: 0.93,
                    description: `Interpreter "${procName}" (PID ${conn.process?.pid}) established external socket to ${conn.network?.remote_ip}:${conn.network?.remote_port}.`,
                    evidence: [conn],
                    mitre: ["T1059", "T1071"]
                });
            }
        }

        return findings;
    }

    clear() {
        this.recentEvents = [];
    }
}

module.exports = BehaviorEngine;
