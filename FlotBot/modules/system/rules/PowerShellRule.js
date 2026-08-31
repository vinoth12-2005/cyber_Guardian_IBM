const ThreatRule = require("../../../core/threats/ThreatRule");

class PowerShellRule extends ThreatRule {

    constructor() {
        super("Suspicious PowerShell Execution", "HIGH");

        this.suspiciousPatterns = [
            "-hidden",
            "-windowstyle hidden",
            "-w hidden",
            "-encodedcommand",
            "-enc",
            "-executionpolicy bypass",
            "-ep bypass",
            "-bypass",
            "-nop",
            "-noprofile",
            "-noni",
            "downloadstring",
            "downloadfile",
            "invoke-expression",
            "iex",
            "bitstransfer",
            "webclient",
            "system.net"
        ];
    }

    async evaluate(processes) {

        for (const process of processes) {

            const image = (process.image || "").toLowerCase();

            if (image === "powershell.exe" || image === "pwsh.exe") {

                const cmd = (process.cmdLine || process.cmd || "").toLowerCase();

                // Do not trigger simply because PowerShell opened.
                // Require suspicious flags or payloads in the command line.
                const matchedPattern = this.suspiciousPatterns.find(p => cmd.includes(p));

                if (matchedPattern) {
                    return {
                        detected: true,
                        rule: this.name,
                        severity: this.severity,
                        process: process.image,
                        pid: process.pid,
                        reason: `PowerShell executed with suspicious argument: "${matchedPattern}"`,
                        recommendation: "Investigate this PowerShell session immediately. Inspect the full command line arguments and parent process.",
                        evidence: {
                            image: process.image,
                            pid: process.pid,
                            cmdLine: process.cmdLine || "N/A",
                            flag: matchedPattern
                        },
                        mitre: ["T1059.001", "T1027"]
                    };
                }

            }

        }

        return null;

    }

}

module.exports = PowerShellRule;