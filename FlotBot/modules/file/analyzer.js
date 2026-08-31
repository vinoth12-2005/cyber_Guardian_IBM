const FileThreatEngine = require("../../core/fileengine/FileThreatEngine");

/**
 * FileAnalyzer
 * ─────────────────────────────────────────────────────────────
 * File module analyzer wrapping rules and the Master File Threat Engine.
 */
class FileAnalyzer {

    constructor(threatEngine, alertManager, options = {}) {
        this.threatEngine = threatEngine;
        this.alertManager = alertManager;
        this.fileThreatEngine = new FileThreatEngine(options);
    }

    async analyze(events) {
        if (!events || events.length === 0) return [];

        const detections = await this.threatEngine.analyze({ events });

        this.alertManager.clear();

        for (const detection of detections) {
            this.alertManager.add(detection);
        }

        // Also run fast-path scan on any CREATED file events
        for (const ev of events) {
            if (ev.action === "CREATED" && ev.file?.filePath) {
                try {
                    const fast = await this.fileThreatEngine.fastPathScan(ev.file.filePath);
                    if (fast && fast.riskScore >= 60) {
                        const deep = await this.fileThreatEngine.analyzeFile(ev.file.filePath);
                        if (deep && (deep.isMalicious || deep.isSuspicious)) {
                            this.alertManager.add({
                                title: `Suspicious File Dropped: ${deep.filename}`,
                                severity: deep.verdict === "MALICIOUS" ? "CRITICAL" : "HIGH",
                                category: "FILE_THREAT",
                                source: "FileThreatEngine",
                                description: `File flagged with risk score ${deep.riskScore}/100: ${deep.evidenceBreakdown.map(e => e.factor).join(", ")}`,
                                recommendation: deep.remediation?.explanation || "Quarantine and inspect file.",
                                evidence: deep,
                                mitre: ["T1105", "T1036"]
                            });
                        }
                    }
                } catch {}
            }
        }

        return this.alertManager.getAll();
    }
}

module.exports = FileAnalyzer;
