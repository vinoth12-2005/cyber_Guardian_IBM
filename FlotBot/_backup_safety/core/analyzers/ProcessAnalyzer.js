/**
 * ProcessAnalyzer
 * Performs initial evaluation of process integrity.
 */
class ProcessAnalyzer {

    constructor() {
        this.commonShells = new Set(["cmd.exe", "powershell.exe", "pwsh.exe", "wscript.exe", "cscript.exe", "mshta.exe"]);
    }

    /**
     * Analyze list of processes for general anomalies.
     */
    analyze(processes) {
        const anomalies = [];
        for (const proc of processes) {
            const image = (proc.image || "").toLowerCase();
            const cmd = (proc.cmdLine || "").toLowerCase();

            // Check: System utility running with no command-line
            if (this.commonShells.has(image) && !cmd) {
                anomalies.push({
                    pid: proc.pid,
                    image: proc.image,
                    type: "suspicious_execution",
                    reason: "Common shell running without command line arguments."
                });
            }
        }
        return anomalies;
    }

}

module.exports = ProcessAnalyzer;
