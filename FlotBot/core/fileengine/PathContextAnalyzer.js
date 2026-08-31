const path = require("path");
const os = require("os");

/**
 * PathContextAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Analyzes filesystem location context and calculates PATH_CONTEXT_SCORE.
 *
 * Rules:
 *   - "Downloads" != Malware.
 *   - Evaluates combinations: Executable in Temp + System binary name + Masquerading.
 *   - Normalizes path context across Windows, macOS, and Linux.
 */
class PathContextAnalyzer {

    /**
     * Analyze file path context.
     * @param {string} filePath
     * @param {boolean} [isExecutable=false]
     * @returns {object} Path context analysis
     */
    static analyze(filePath, isExecutable = false) {
        if (!filePath) {
            return { pathScore: 0, flags: [], contextTier: "UNKNOWN" };
        }

        const normalized = filePath.replace(/\\/g, "/").toLowerCase();
        const filename = path.basename(filePath).toLowerCase();
        const flags = [];
        let score = 0;

        // 1. Temporary / Staging execution paths
        const isInTemp = normalized.includes("/tmp/") ||
                         normalized.includes("/var/tmp/") ||
                         normalized.includes("/dev/shm/") ||
                         normalized.includes("/appdata/local/temp/") ||
                         normalized.includes("/windows/temp/");

        if (isInTemp) {
            if (isExecutable) {
                flags.push("EXECUTABLE_IN_TEMP_DIRECTORY");
                score += 25;
            } else {
                flags.push("FILE_IN_TEMP_DIRECTORY");
                score += 5;
            }
        }

        // 2. Downloads / User Desktop
        const isInDownloads = normalized.includes("/downloads/");
        const isInDesktop = normalized.includes("/desktop/");

        if (isInDownloads && isExecutable) {
            flags.push("EXECUTABLE_IN_DOWNLOADS_FOLDER");
            score += 15;
        }

        // 3. Autostart / Persistence Paths
        const isInAutostart = normalized.includes("/startup/") ||
                              normalized.includes("/launchagents/") ||
                              normalized.includes("/launchdaemons/") ||
                              normalized.includes(".config/autostart") ||
                              normalized.includes("/etc/cron") ||
                              normalized.includes("/systemd/system");

        if (isInAutostart) {
            flags.push("FILE_IN_AUTOSTART_PERSISTENCE_LOCATION");
            score += 30;
        }

        // 4. Hidden or Unusual user paths (e.g. $Recycle.Bin, AppData\Roaming hidden folder, .config)
        const isInRecycleBin = normalized.includes("/$recycle.bin/") || normalized.includes("/.trash/");
        if (isInRecycleBin && isExecutable) {
            flags.push("EXECUTABLE_IN_RECYCLE_BIN_OR_TRASH");
            score += 45;
        }

        // 5. System Binary Impersonation (e.g. svchost.exe or ls running outside system folder)
        const KNOWN_SYSTEM_NAMES = [
            "svchost.exe", "lsass.exe", "csrss.exe", "smss.exe", "explorer.exe",
            "services.exe", "winlogon.exe", "spoolsv.exe", "taskhostw.exe",
            "systemd", "init", "sshd", "crond", "launchd"
        ];

        const isStandardSystemDir = normalized.includes("/windows/system32/") ||
                                    normalized.includes("/windows/syswow64/") ||
                                    normalized.includes("/bin/") ||
                                    normalized.includes("/usr/bin/") ||
                                    normalized.includes("/usr/sbin/") ||
                                    normalized.includes("/system/library/");

        if (KNOWN_SYSTEM_NAMES.includes(filename) && !isStandardSystemDir) {
            flags.push(`SYSTEM_PROCESS_NAME_MASQUERADING_IN_USER_PATH ("${filename}")`);
            score += 50;
        }

        // Context tier
        let contextTier = "NORMAL";
        if (score >= 50) contextTier = "HIGH_RISK_LOCATION";
        else if (score >= 25) contextTier = "ELEVATED_RISK_LOCATION";
        else if (score >= 10) contextTier = "MODERATE_LOCATION";

        return {
            pathScore: Math.min(100, score),
            contextTier,
            flags,
            isInTemp,
            isInDownloads,
            isInAutostart,
            summary: flags.length > 0
                ? `Location risk factors: ${flags.join(", ")}`
                : "Standard application/user path"
        };
    }
}

module.exports = PathContextAnalyzer;
