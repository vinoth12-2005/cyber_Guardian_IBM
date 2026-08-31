/**
 * ProcessClassifier
 * ─────────────────────────────────────────────────────────────
 * Classifies running processes into five risk tiers:
 *   - KNOWN_SAFE
 *   - LIKELY_SAFE
 *   - UNKNOWN
 *   - SUSPICIOUS
 *   - HIGH_RISK
 *
 * Provides clear evidence-based explanations and recommendations.
 */
class ProcessClassifier {

    static KNOWN_SAFE_PROCESSES = new Set([
        "systemd", "init", "kernel", "kthreadd", "dbus-daemon", "sshd", "dockerd",
        "explorer.exe", "svchost.exe", "lsass.exe", "csrss.exe", "services.exe", "winlogon.exe",
        "launchd", "WindowServer", "kernel_task"
    ]);

    static LIKELY_SAFE_PROCESSES = new Set([
        "chrome", "chrome.exe", "firefox", "firefox.exe", "code", "code.exe", "node", "node.exe",
        "electron", "electron.exe", "bash", "zsh", "sh", "python3", "python", "git", "git.exe",
        "slack", "slack.exe", "spotify", "spotify.exe"
    ]);

    static SUSPICIOUS_PATHS = [
        "/tmp", "/var/tmp", "/dev/shm", "\\temp\\", "\\appdata\\local\\temp\\", "\\downloads\\"
    ];

    /**
     * Classify a process object.
     * @param {object} processObj - { pid, name, exePath, cmdLine, user, cpu, mem, signed, publisher }
     * @returns {object} { classification, score, reasons, recommendation }
     */
    static classify(processObj) {
        const name = (processObj.name || "").toLowerCase();
        const exePath = (processObj.exePath || "").toLowerCase();
        const cmdLine = (processObj.cmdLine || "").toLowerCase();
        const reasons = [];

        // 1. High Risk Indicators
        if (/\b(nc|netcat|ncat)\b.*-e\b/.test(cmdLine) || /powershell.*-enc\b/i.test(cmdLine) || /reverse_shell/i.test(cmdLine)) {
            reasons.push("Command line contains interactive reverse shell or encoded payload flags.");
            return {
                classification: "HIGH_RISK",
                score: 90,
                reasons,
                recommendation: "Immediate investigation required. Consider isolating network or terminating PID after verifying."
            };
        }

        // 2. Check path anomalies
        const inSuspiciousPath = ProcessClassifier.SUSPICIOUS_PATHS.some(p => exePath.includes(p) || cmdLine.includes(p));
        if (inSuspiciousPath && !name.includes("python") && !name.includes("node")) {
            reasons.push(`Executable launched from temporary or unverified directory: ${processObj.exePath}`);
        }

        // 3. Known Safe check
        if (ProcessClassifier.KNOWN_SAFE_PROCESSES.has(name) && !inSuspiciousPath) {
            return {
                classification: "KNOWN_SAFE",
                score: 10,
                reasons: ["Standard operating system core process running from verified location."],
                recommendation: "No action required."
            };
        }

        // 4. Likely Safe check
        if (ProcessClassifier.LIKELY_SAFE_PROCESSES.has(name) && !inSuspiciousPath) {
            return {
                classification: "LIKELY_SAFE",
                score: 25,
                reasons: ["Recognized standard application executable."],
                recommendation: "Standard monitoring active."
            };
        }

        // 5. Suspicious vs Unknown
        if (reasons.length > 0) {
            return {
                classification: "SUSPICIOUS",
                score: 70,
                reasons,
                recommendation: "Investigate execution path and parent process before terminating."
            };
        }

        return {
            classification: "UNKNOWN",
            score: 45,
            reasons: ["Unrecognized third-party binary without digital signature correlation."],
            recommendation: "Review process details and verify software publisher."
        };
    }
}

module.exports = ProcessClassifier;
