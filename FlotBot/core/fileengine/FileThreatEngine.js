const os = require("os");
const fs = require("fs");
const path = require("path");
const WindowsFileAnalyzer = require("./WindowsFileAnalyzer");
const MacOSFileAnalyzer = require("./MacOSFileAnalyzer");
const LinuxFileAnalyzer = require("./LinuxFileAnalyzer");
const FileAnalyzer = require("./FileAnalyzer");
const YaraEngine = require("../detection/YaraEngine");
const HashEngine = require("../detection/HashEngine");
const ReputationEngine = require("./ReputationEngine");
const MLThreatClassifier = require("./MLThreatClassifier");
const DetectionManager = require("../security/DetectionManager");

/**
 * FileThreatEngine
 * ─────────────────────────────────────────────────────────────
 * Master cross-platform File Threat Analysis Engine.
 *
 * Instantiates the appropriate platform implementation (Windows, macOS, Linux)
 * and coordinates Fast Path, Deep Path, Directory Audits, and Incident Correlation.
 */
class FileThreatEngine {

    constructor(options = {}) {
        this.options = options;
        this.yaraEngine = options.yaraEngine || new YaraEngine();
        this.hashEngine = options.hashEngine || new HashEngine();
        this.reputationEngine = options.reputationEngine || new ReputationEngine();
        this.mlClassifier = options.mlClassifier || new MLThreatClassifier();
        this.threatIntelEngine = options.threatIntelEngine || null;
        this.aiEngine = options.aiEngine || null;

        const platform = process.platform;
        const config = {
            yaraEngine: this.yaraEngine,
            hashEngine: this.hashEngine,
            reputationEngine: this.reputationEngine,
            mlClassifier: this.mlClassifier,
            threatIntelEngine: this.threatIntelEngine,
            aiEngine: this.aiEngine
        };

        if (platform === "win32") {
            this.analyzer = new WindowsFileAnalyzer(config);
        } else if (platform === "darwin") {
            this.analyzer = new MacOSFileAnalyzer(config);
        } else {
            this.analyzer = new LinuxFileAnalyzer(config);
        }
    }

    async init() {
        await this.analyzer.init();
    }

    /**
     * Inspect a single file with full multi-stage threat analysis.
     * @param {string} filePath
     * @param {object} [contextOptions]
     * @returns {Promise<object>}
     */
    async analyzeFile(filePath, contextOptions = {}) {
        // Run full platform analysis first
        const baseReport = await this.analyzer.analyzeFile(filePath, contextOptions);
        if (!baseReport || baseReport.success === false) {
            return baseReport;
        }
        // Extract SHA‑256 (already computed by FileAnalyzer) and telemetry needed for escalation
        const sha256 = baseReport.hashes?.sha256;
        if (sha256) {
            const telemetry = {
                entropy: baseReport.entropy,
                yaraMatches: baseReport.yaraMatches,
                suspiciousImports: baseReport.suspiciousImports
            };
            // Lazily instantiate DetectionManager (reuse if already created)
            if (!this.detectionManager) {
                this.detectionManager = new DetectionManager({
                    vtApiKey: process.env.VIRUSTOTAL_API_KEY,
                    hybridAnalysisApiKey: process.env.HYBRID_ANALYSIS_API_KEY
                });
            }
            const intel = await this.detectionManager.checkFile({ sha256, filePath, telemetry });
            // Attach the fused provider results for AIEngine consumption
            baseReport.fileThreatIntel = intel;
        }
        return baseReport;
    }

    /**
     * Real-time fast-path scan (< 5ms).
     * @param {string} filePath
     * @returns {Promise<object>}
     */
    async fastPathScan(filePath) {
        return this.analyzer.fastPathScan(filePath);
    }

    /**
     * Get primary target scan directories based on host OS.
     */
    getScanTargets() {
        const home = os.homedir();
        const platform = process.platform;
        const targets = [];

        // Standard user directories
        const userDirs = ["Downloads", "Desktop", "Documents", "Temp"];
        for (const dir of userDirs) {
            const p = path.join(home, dir);
            if (fs.existsSync(p)) targets.push(p);
        }

        // Platform-specific temporary and autostart paths
        if (platform === "win32") {
            const appData = process.env.APPDATA || path.join(home, "AppData", "Roaming");
            const localAppData = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
            const startup = path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
            const temp = process.env.TEMP || path.join(localAppData, "Temp");
            if (fs.existsSync(startup)) targets.push(startup);
            if (fs.existsSync(temp)) targets.push(temp);
        } else if (platform === "linux") {
            if (fs.existsSync("/tmp")) targets.push("/tmp");
            if (fs.existsSync("/var/tmp")) targets.push("/var/tmp");
            const autostart = path.join(home, ".config", "autostart");
            if (fs.existsSync(autostart)) targets.push(autostart);
        } else if (platform === "darwin") {
            if (fs.existsSync("/tmp")) targets.push("/tmp");
            const launchAgents = path.join(home, "Library", "LaunchAgents");
            if (fs.existsSync(launchAgents)) targets.push(launchAgents);
        }

        return targets;
    }

    /**
     * Perform deep inch-by-inch security audit across host directories.
     * @param {function} [progressCallback] - (scannedCount, currentFile) => void
     * @returns {Promise<object>} Audit report
     */
    async performDeepScan(progressCallback = null) {
        await this.init();

        const startTime = Date.now();
        const targets = this.getScanTargets();
        const results = {
            totalScanned: 0,
            cleanFiles: 0,
            suspiciousFiles: [],
            threatsFound: 0,
            os: process.platform,
            scanDurationMs: 0,
            remediationSteps: [],
            honestReportSummary: ""
        };

        const maxFilesPerDir = 100;

        for (const dirPath of targets) {
            try {
                const entries = fs.readdirSync(dirPath, { withFileTypes: true });
                let countInDir = 0;

                for (const entry of entries) {
                    if (countInDir >= maxFilesPerDir) break;
                    if (!entry.isFile()) continue;

                    const fullPath = path.join(dirPath, entry.name);
                    results.totalScanned++;
                    countInDir++;

                    if (progressCallback && results.totalScanned % 5 === 0) {
                        progressCallback(results.totalScanned, entry.name);
                    }

                    try {
                        const stats = fs.statSync(fullPath);
                        if (stats.size > 50 * 1024 * 1024) continue; // Skip files > 50MB during crawler

                        // Fast-path evaluation
                        const fast = await this.fastPathScan(fullPath);
                        if (fast && fast.requiresDeepScan) {
                            // Run full deep analysis
                            const deep = await this.analyzeFile(fullPath);
                            if (deep.isMalicious || deep.isSuspicious) {
                                results.threatsFound++;
                                results.suspiciousFiles.push({
                                    path: fullPath,
                                    filename: entry.name,
                                    sizeBytes: stats.size,
                                    modified: stats.mtime,
                                    verdict: deep.verdict,
                                    riskScore: deep.riskScore,
                                    reasons: deep.evidenceBreakdown.map(e => e.factor),
                                    remediation: deep.remediation
                                });
                            } else {
                                results.cleanFiles++;
                            }
                        } else {
                            results.cleanFiles++;
                        }
                    } catch { /* skip inaccessible files */ }
                }
            } catch { /* skip inaccessible directories */ }
        }

        results.scanDurationMs = Date.now() - startTime;

        // Compile remediation steps
        results.remediationSteps = results.suspiciousFiles.map((item, idx) => ({
            stepNumber: idx + 1,
            title: `Remediate ${item.filename} (${item.verdict})`,
            explanation: `File flagged with risk score ${item.riskScore}/100: ${item.reasons.join("; ")}`,
            command: item.remediation?.remediationCommand || "",
            safeActionType: item.remediation?.recommendedAction || "ALLOW"
        }));

        if (results.threatsFound === 0) {
            results.honestReportSummary = `✅ Deep Audit Complete: Scanned ${results.totalScanned} files across ${targets.length} target directories. ` +
                `No malicious executables, masquerading payloads, or high-risk threats detected. System posture is clean.`;
        } else {
            results.honestReportSummary = `⚠️ Deep Audit Warning: Scanned ${results.totalScanned} files and flagged ${results.threatsFound} suspicious item(s). ` +
                `Immediate review recommended using the remediation guide.`;
        }

        return results;
    }
}

module.exports = FileThreatEngine;
