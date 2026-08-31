const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * MassModificationRule
 * Detects bulk file modifications in a single scan cycle — a key
 * ransomware behavioral signature (many files modified rapidly).
 */
class MassModificationRule extends ThreatRule {

    constructor() {
        super("Mass File Modification (Ransomware)", "CRITICAL");

        // Number of file modifications in one scan cycle to trigger alert
        this.threshold = 20;

        // Ignore system/temp file churn (common editors, browsers, etc.)
        this.ignoredExtensions = new Set([
            ".tmp", ".log", ".ldb", ".db-shm", ".db-wal",
            ".crdownload", ".part", ".partial"
        ]);
    }

    async evaluate({ events }) {

        if (!events) return null;

        const modifications = events.filter(e => {
            if (e.action !== "MODIFIED" && e.action !== "CREATED") return false;
            const ext = (e.file.extension || "").toLowerCase();
            return !this.ignoredExtensions.has(ext);
        });

        if (modifications.length >= this.threshold) {

            return {
                detected:       true,
                rule:           this.name,
                severity:       this.severity,
                process:        "File System",
                pid:            "N/A",
                reason:         `${modifications.length} files were modified in a single scan cycle — possible ransomware encryption in progress.`,
                recommendation: "IMMEDIATE ACTION REQUIRED: Disconnect from network. Do not reboot. Run antivirus scan. Check backup integrity.",
                evidence:       {
                    count:           modifications.length,
                    threshold:       this.threshold,
                    sampleFiles:     modifications.slice(0, 10).map(e => e.file.filePath)
                },
                mitre: ["T1486", "T1490"]
            };

        }

        return null;

    }

}

module.exports = MassModificationRule;
