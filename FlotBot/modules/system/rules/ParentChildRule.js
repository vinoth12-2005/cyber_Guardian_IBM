const ThreatRule = require("../../../core/threats/ThreatRule");

/**
 * ParentChildRule
 * Detects anomalous parent-child process relationships.
 * Attackers abuse legitimate processes to spawn shells
 * (e.g., Word spawning PowerShell, or Explorer spawning cmd with args).
 */
class ParentChildRule extends ThreatRule {

    constructor() {
        super("Suspicious Parent-Child Process", "HIGH");

        // Map of parent process → children that are suspicious if spawned by it (e.g. Office apps, browsers, PDF readers)
        this.suspiciousRelationships = {
            "winword.exe":   ["cmd.exe", "powershell.exe", "pwsh.exe", "wscript.exe", "cscript.exe", "mshta.exe"],
            "excel.exe":     ["cmd.exe", "powershell.exe", "pwsh.exe", "wscript.exe", "cscript.exe", "mshta.exe"],
            "outlook.exe":   ["cmd.exe", "powershell.exe", "pwsh.exe", "wscript.exe", "cscript.exe"],
            "onenote.exe":   ["cmd.exe", "powershell.exe", "pwsh.exe"],
            "iexplore.exe":  ["cmd.exe", "powershell.exe", "mshta.exe"],
            "chrome.exe":    ["cmd.exe", "powershell.exe"],
            "firefox.exe":   ["cmd.exe", "powershell.exe"],
            "msedge.exe":    ["cmd.exe", "powershell.exe"],
            "acrobat.exe":   ["cmd.exe", "powershell.exe", "wscript.exe"],
            "acrord32.exe":  ["cmd.exe", "powershell.exe", "wscript.exe"],
            "svchost.exe":   ["cmd.exe", "powershell.exe", "cscript.exe", "wscript.exe"],
            "wmiprvse.exe":  ["cmd.exe", "powershell.exe", "cscript.exe"]
        };
    }

    async evaluate(processes) {

        // Build PID → process map for parent lookup
        const pidMap = new Map();
        for (const proc of processes) {
            pidMap.set(String(proc.pid), proc);
        }

        for (const process of processes) {

            const image     = (process.image || "").toLowerCase();
            const parentPid = String(process.parentPid || "0");
            const parent    = pidMap.get(parentPid);

            if (!parent) continue;

            const parentImage = (parent.image || "").toLowerCase();
            const suspiciousChildren = this.suspiciousRelationships[parentImage];

            if (suspiciousChildren && suspiciousChildren.includes(image)) {

                return {
                    detected:       true,
                    rule:           this.name,
                    severity:       this.severity,
                    process:        process.image,
                    pid:            process.pid,
                    reason:         `Suspicious parent-child: "${parent.image}" (PID ${parentPid}) spawned "${process.image}" (PID ${process.pid})`,
                    recommendation: `"${parent.image}" should not normally launch "${process.image}". This may indicate a macro-based attack or process injection.`,
                    evidence:       {
                        child:     process.image,
                        childPid:  process.pid,
                        parent:    parent.image,
                        parentPid: parentPid,
                        cmdLine:   process.cmdLine || ""
                    }
                };

            }

        }

        return null;
    }

}

module.exports = ParentChildRule;
