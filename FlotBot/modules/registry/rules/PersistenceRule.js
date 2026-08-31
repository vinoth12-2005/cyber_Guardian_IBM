const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * PersistenceRule
 * Flags any registry changes to known persistence locations,
 * regardless of what the content is — a broad catch-all.
 */
class PersistenceRule extends ThreatRule {

    constructor() {
        super("Registry Persistence Mechanism", "MEDIUM");

        this.persistenceKeys = [
            "currentversion\\run",
            "currentversion\\runonce",
            "currentversion\\runservices",
            "winlogon",
            "image file execution options",
            "appinit_dlls",
            "knowndlls",
            "browser helper objects"
        ];
    }

    async evaluate({ changes }) {

        if (!changes || !changes.length) return null;

        for (const change of changes) {

            if (change.type !== "runKey") continue;

            const keyPath = (change.entry.keyPath || "").toLowerCase();

            const isPersistenceKey = this.persistenceKeys.some(k => keyPath.includes(k));

            if (isPersistenceKey && (change.action === "ADDED" || change.action === "MODIFIED")) {

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       this.severity,
                    process:        change.entry.valueName || "Unknown",
                    pid:            "N/A",
                    reason:         `Change detected in persistence registry key: ${change.entry.keyPath} → "${change.entry.valueName}"`,
                    recommendation: "Any change to these keys should be reviewed. Remove unauthorized entries and investigate what made this change.",
                    evidence:       {
                        action:    change.action,
                        keyPath:   change.entry.keyPath,
                        valueName: change.entry.valueName,
                        data:      change.entry.data
                    },
                    mitre: ["T1547", "T1546", "T1543"]
                };

            }

        }

        return null;

    }

}

module.exports = PersistenceRule;
