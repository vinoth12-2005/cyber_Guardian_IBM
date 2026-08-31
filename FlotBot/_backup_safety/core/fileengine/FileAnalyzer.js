const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const FileIdentifier = require("./FileIdentifier");
const EntropyCalculator = require("./EntropyCalculator");
const StaticExecutableAnalyzer = require("./StaticExecutableAnalyzer");
const StringExtractor = require("./StringExtractor");
const ImportAnalyzer = require("./ImportAnalyzer");
const SignatureAnalyzer = require("./SignatureAnalyzer");
const PathContextAnalyzer = require("./PathContextAnalyzer");
const FileSizeAnalyzer = require("./FileSizeAnalyzer");
const ReputationEngine = require("./ReputationEngine");
const MLFeatureExtractor = require("./MLFeatureExtractor");
const MLThreatClassifier = require("./MLThreatClassifier");
const YaraEngine = require("../detection/YaraEngine");
const HashEngine = require("../detection/HashEngine");

/**
 * FileAnalyzer (Base Core)
 * ─────────────────────────────────────────────────────────────
 * Master cross-platform file threat analysis engine.
 *
 * Execution Pipeline:
 *   FILE
 *    ↓
 *   IDENTIFICATION (Magic bytes / format / masquerade check)
 *    ↓
 *   HASHING (SHA-256 primary, SHA-1, MD5 + Hash Cache)
 *    ↓
 *   LOCAL REPUTATION (Known Benign / Malicious / Unknown)
 *    ↓
 *   THREAT INTELLIGENCE (VirusTotal hash lookup if enabled)
 *    ↓
 *   STATIC ANALYSIS (PE / Mach-O / ELF header & section parser)
 *    ↓
 *   ENTROPY (Shannon entropy overall & per section)
 *    ↓
 *   STRINGS (Safe ASCII/UTF-16LE indicator extraction)
 *    ↓
 *   IMPORTS (8 threat capability vectors)
 *    ↓
 *   SIGNATURE (Authenticode / CodeSign / ELF verification)
 *    ↓
 *   PATH & SIZE CONTEXT (Path score + Size anomaly score)
 *    ↓
 *   YARA (Local compiled rule matching)
 *    ↓
 *   ML CLASSIFIER (20-feature normalized probability)
 *    ↓
 *   CORRELATION & RISK ENGINE (Deterministic explainable score)
 *    ↓
 *   AI ANALYST (Structured grounded explanation)
 */
class FileAnalyzer {

    constructor(options = {}) {
        this.yaraEngine = options.yaraEngine || new YaraEngine();
        this.hashEngine = options.hashEngine || new HashEngine();
        this.reputationEngine = options.reputationEngine || new ReputationEngine();
        this.mlClassifier = options.mlClassifier || new MLThreatClassifier();
        this.threatIntelEngine = options.threatIntelEngine || null;
        this.aiEngine = options.aiEngine || null;

        this.initialized = false;
    }

    async init() {
        if (!this.initialized) {
            await this.yaraEngine.loadRules();
            this.initialized = true;
        }
    }

    /**
     * Read normalized metadata from a target file.
     * @param {string} filePath
     * @returns {object}
     */
    getNormalizedMetadata(filePath) {
        if (!fs.existsSync(filePath)) return null;

        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const filename = path.basename(filePath);

        return {
            filePath,
            filename,
            extension: ext,
            sizeBytes: stats.size,
            mtime: stats.mtime,
            ctime: stats.ctime,
            birthtime: stats.birthtime,
            isExecutable: (stats.mode & 0o111) !== 0 || [".exe", ".dll", ".so", ".dylib", ".bin", ".sh", ".bat", ".ps1"].includes(ext),
            mode: stats.mode,
            ino: stats.ino,
            platform: process.platform
        };
    }

    /**
     * Comprehensive analysis of a target file.
     * @param {string} filePath - Absolute path to file
     * @param {object} [contextOptions] - Optional behavioral context (parentProcess, downloadOrigin, networkActivity)
     * @returns {Promise<object>} Unified File Threat Analysis Report
     */
    async analyzeFile(filePath, contextOptions = {}) {
        await this.init();

        const startTime = Date.now();

        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                error: `File not found: "${filePath}"`,
                filePath
            };
        }

        const meta = this.getNormalizedMetadata(filePath);
        if (!meta) {
            return { success: false, error: `Unable to access file: "${filePath}"`, filePath };
        }

        // 1. Safe Read: Read up to 25MB sample into memory for analysis
        const maxReadBytes = 25 * 1024 * 1024;
        let buffer;
        try {
            const fd = fs.openSync(filePath, "r");
            buffer = Buffer.alloc(Math.min(meta.sizeBytes, maxReadBytes));
            const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);
            buffer = buffer.slice(0, bytesRead);
        } catch (err) {
            return { success: false, error: `File read error: ${err.message}`, filePath };
        }

        // 2. Identification (Magic bytes & Masquerading)
        const identification = FileIdentifier.identify(buffer, filePath);

        // 3. Cryptographic Hashing
        const hashes = await this.hashEngine.hash(filePath) || {
            sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
            sha1: crypto.createHash("sha1").update(buffer).digest("hex"),
            md5: crypto.createHash("md5").update(buffer).digest("hex"),
            fromCache: false
        };

        // 4. Threat Intel & VirusTotal (Optional / Rate-limited)
        let threatIntel = null;
        if (this.threatIntelEngine) {
            try {
                threatIntel = await this.threatIntelEngine.checkHash(hashes.sha256);
            } catch { /* offline fallback */ }
        }

        // 5. Local Reputation Lookup
        const reputation = this.reputationEngine.getReputation(hashes.sha256, threatIntel);

        // 6. Static Executable Analysis (PE, Mach-O, ELF)
        const staticAnalysis = StaticExecutableAnalyzer.analyze(buffer, identification.format);

        // 7. Shannon Entropy Calculation (Whole-file + Sections)
        const entropy = EntropyCalculator.calculate(buffer);
        const entropyTier = EntropyCalculator.getTier(entropy);

        // 8. Safe String Extraction & Indicators
        const strings = StringExtractor.extract(buffer, 4, 1000);

        // 9. API Import Analysis
        const importsList = [
            ...(staticAnalysis.importedLibraries || []),
            ...(staticAnalysis.linkedLibraries || []),
            ...(staticAnalysis.linkedDylibs || [])
        ];
        // Merge extracted symbols if available
        if (staticAnalysis.sections) {
            for (const s of staticAnalysis.sections) {
                if (s.name) importsList.push(s.name);
            }
        }
        const imports = ImportAnalyzer.analyze(importsList);

        // 10. Digital Signature Analysis
        const signature = await SignatureAnalyzer.analyze(filePath, staticAnalysis);

        // 11. Path Context & Size Anomaly
        const pathContext = PathContextAnalyzer.analyze(filePath, identification.isExecutable || meta.isExecutable);
        const sizeAnomaly = FileSizeAnalyzer.analyze(meta.sizeBytes, identification.isExecutable, staticAnalysis);

        // 12. Local YARA Scanning
        const yaraMatches = this.yaraEngine.scan(buffer, filePath);

        // 13. ML Feature Extraction & Probability
        const mlEvidence = {
            fileSizeBytes: meta.sizeBytes,
            entropy,
            isExecutable: identification.isExecutable,
            identification,
            signature,
            pathContext,
            yaraMatches,
            virusTotal: threatIntel,
            reputation,
            imports,
            strings,
            sizeAnomaly,
            staticAnalysis,
            parentProcessRisk: contextOptions.parentProcess?.riskScore || 0,
            downloadOriginRisk: contextOptions.downloadOrigin?.riskScore || 0,
            baselineDeviation: contextOptions.baselineDeviation || 0
        };

        const mlPrediction = this.mlClassifier.predict(mlEvidence);

        // 14. Deterministic Risk Score & Evidence Breakdown Calculation
        const riskResult = this._calculateDeterministicRisk({
            reputation,
            threatIntel,
            identification,
            yaraMatches,
            staticAnalysis,
            entropy,
            strings,
            imports,
            signature,
            pathContext,
            sizeAnomaly,
            mlPrediction,
            contextOptions
        });

        // 15. Outcome Classification
        let verdict = "CLEAN";
        if (reputation.verdict === "KNOWN_BENIGN") {
            verdict = "KNOWN_BENIGN";
        } else if (reputation.verdict === "KNOWN_MALICIOUS" || riskResult.riskScore >= 70) {
            verdict = "MALICIOUS";
        } else if (riskResult.riskScore >= 45) {
            verdict = "SUSPICIOUS";
        } else if (riskResult.riskScore >= 25) {
            verdict = "UNUSUAL";
        } else {
            verdict = "CLEAN";
        }

        // 16. Step-by-Step Remediation Recommendations
        const remediation = this._generateRemediation({
            filePath,
            filename: meta.filename,
            verdict,
            riskScore: riskResult.riskScore,
            platform: process.platform
        });

        const scanDurationMs = Date.now() - startTime;

        const report = {
            success: true,
            filePath,
            filename: meta.filename,
            fileSizeBytes: meta.sizeBytes,
            sizeFormatted: sizeAnomaly.sizeFormatted,
            platform: process.platform,
            scanDurationMs,
            hashes,
            identification,
            reputation,
            threatIntel,
            staticAnalysis,
            entropy: {
                score: entropy,
                tier: entropyTier,
                isHigh: entropy >= 7.2
            },
            strings: {
                totalExtracted: strings.totalExtracted,
                indicatorsCount: strings.indicators.length,
                indicators: strings.indicators,
                network: strings.network,
                commands: strings.commands,
                persistence: strings.persistence,
                evasion: strings.evasion
            },
            imports,
            signature,
            pathContext,
            sizeAnomaly,
            yaraMatches: yaraMatches.map(y => ({
                rule: y.rule,
                severity: y.severity,
                tags: y.tags,
                mitre: y.mitre,
                matchedStrings: y.matchedStrings
            })),
            ml: {
                malicious_probability: mlPrediction.malicious_probability,
                confidence: mlPrediction.confidence,
                classification: mlPrediction.classification,
                top_contributing_features: mlPrediction.top_contributing_features
            },
            riskScore: riskResult.riskScore,
            confidence: riskResult.confidence,
            verdict,
            isMalicious: verdict === "MALICIOUS" || riskResult.riskScore >= 70,
            isSuspicious: verdict === "SUSPICIOUS" || riskResult.riskScore >= 45,
            evidenceBreakdown: riskResult.breakdown,
            remediation,
            aiExplanation: null // Populated on-demand by AI Analyst
        };

        // 17. Generate AI Analyst Summary if AI Engine available
        if (this.aiEngine && (report.isMalicious || report.isSuspicious || contextOptions.includeAi)) {
            try {
                report.aiExplanation = await this._generateAIExplanation(report);
            } catch { /* graceful fallback */ }
        }

        return report;
    }

    /**
     * Fast-path analysis (< 5ms) for real-time filesystem events.
     * @param {string} filePath
     * @returns {Promise<object>} Lightweight fast analysis
     */
    async fastPathScan(filePath) {
        if (!filePath || !fs.existsSync(filePath)) return null;

        try {
            const stats = fs.statSync(filePath);
            const ext = path.extname(filePath).toLowerCase();

            // Hash
            const hashes = await this.hashEngine.hash(filePath);
            if (!hashes) return null;

            // Reputation
            const rep = this.reputationEngine.getReputation(hashes.sha256);
            if (rep.verdict === "KNOWN_BENIGN") {
                return { fastVerdict: "BENIGN", riskScore: 0, hashes, sha256: hashes.sha256, filePath, requiresDeepScan: false };
            }
            if (rep.verdict === "KNOWN_MALICIOUS") {
                return { fastVerdict: "MALICIOUS", riskScore: 95, hashes, sha256: hashes.sha256, filePath, requiresDeepScan: true };
            }

            // Quick identification
            const ident = FileIdentifier.identifyFile(filePath);

            // Double extension / masquerade check
            if (ident.isMasquerading || ident.hasDoubleExtension) {
                return { fastVerdict: "SUSPICIOUS_MASQUERADE", riskScore: 70, hashes, sha256: hashes.sha256, filePath, requiresDeepScan: true };
            }

            // Quick YARA scan on small initial buffer
            const buffer = Buffer.alloc(Math.min(stats.size, 65536));
            const fd = fs.openSync(filePath, "r");
            fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);

            const yara = this.yaraEngine.scan(buffer, filePath);
            if (yara.length > 0) {
                return { fastVerdict: "YARA_HIT", riskScore: 65, hashes, sha256: hashes.sha256, filePath, yara, requiresDeepScan: true };
            }

            return {
                fastVerdict: "UNKNOWN_NEUTRAL",
                riskScore: 10,
                hashes,
                sha256: hashes.sha256,
                filePath,
                requiresDeepScan: ident.isExecutable
            };
        } catch {
            return null;
        }
    }

    _calculateDeterministicRisk({
        reputation,
        threatIntel,
        identification,
        yaraMatches,
        staticAnalysis,
        entropy,
        strings,
        imports,
        signature,
        pathContext,
        sizeAnomaly,
        mlPrediction,
        contextOptions
    }) {
        let score = 0;
        let confidenceAcc = 0;
        let factorCount = 0;
        const breakdown = [];

        // 1. Reputation Factor
        if (reputation.verdict === "KNOWN_MALICIOUS") {
            score += 50;
            breakdown.push({ factor: "Known Threat Intelligence Malware Hash", points: +50 });
        } else if (reputation.verdict === "KNOWN_BENIGN") {
            score -= 35;
            breakdown.push({ factor: "Known Benign Whitelisted Hash", points: -35 });
        }
        confidenceAcc += reputation.confidence; factorCount++;

        // 2. Masquerading / Extension Spoofing
        if (identification.hasDoubleExtension) {
            score += 35;
            breakdown.push({ factor: "Spoofed Double File Extension", points: +35 });
        } else if (identification.isMasquerading) {
            score += 30;
            breakdown.push({ factor: "Mismatched Header/Extension Masquerading", points: +30 });
        }

        // 3. YARA Matches
        if (yaraMatches && yaraMatches.length > 0) {
            const hasCrit = yaraMatches.some(y => y.severity === "CRITICAL");
            const yaraPts = hasCrit ? 35 : Math.min(30, yaraMatches.length * 15);
            score += yaraPts;
            breakdown.push({ factor: `YARA Signature Matches (${yaraMatches.length} rules)`, points: +yaraPts });
            confidenceAcc += 0.90; factorCount++;
        }

        // 4. Static Executable Anomalies (Packers, W+X sections, Executable stack)
        if (staticAnalysis?.hasWritableAndExecutableSection) {
            score += 25;
            breakdown.push({ factor: "Writable & Executable (W+X) Memory Section (Shellcode Pattern)", points: +25 });
        }
        if (staticAnalysis?.suspiciousPackers && staticAnalysis.suspiciousPackers.length > 0) {
            score += 20;
            breakdown.push({ factor: `Suspicious Binary Packer/Crypter Signature (${staticAnalysis.suspiciousPackers.join(", ")})`, points: +20 });
        }
        if (staticAnalysis?.hasExecutableStack) {
            score += 20;
            breakdown.push({ factor: "Executable Stack Detected (PT_GNU_STACK PF_X)", points: +20 });
        }

        // 5. Shannon Entropy
        if (entropy > 7.6 && identification.isExecutable) {
            score += 20;
            breakdown.push({ factor: `Extreme Shannon Entropy (${entropy.toFixed(2)}/8.0) in Executable`, points: +20 });
        } else if (entropy > 7.2 && identification.isExecutable) {
            score += 10;
            breakdown.push({ factor: `Elevated Entropy (${entropy.toFixed(2)}/8.0)`, points: +10 });
        }

        // 6. Suspicious Strings & Commands
        if (strings?.stringThreatScore > 0) {
            const strPts = Math.min(45, Math.round(strings.stringThreatScore * 0.6));
            score += strPts;
            breakdown.push({ factor: `Suspicious Payload Strings & Webhooks (${strings.indicators.length} indicators)`, points: +strPts });
        }
        if (strings?.evasion?.length > 0 && strings?.commands?.length > 0) {
            score += 25;
            breakdown.push({ factor: "Obfuscated Weaponized Script (AMSI Evasion + Shell Commands)", points: +25 });
        }

        // 7. API Imports
        if (imports?.threatScore > 0) {
            const impPts = Math.min(25, Math.round(imports.threatScore * 0.3));
            score += impPts;
            breakdown.push({ factor: `Sensitive API Capabilities (${imports.matchedCapabilities.length} vectors)`, points: +impPts });
        }

        // 8. Digital Signature
        score += signature.trustScoreModifier;
        if (signature.isValid) {
            breakdown.push({ factor: `Valid Digital Signature (${signature.publisher})`, points: -25 });
        } else if (signature.status === "TAMPERED_INVALID_SIGNATURE") {
            breakdown.push({ factor: "Invalid / Tampered Code Signature", points: +35 });
        } else if (!signature.isSigned && identification.isExecutable) {
            breakdown.push({ factor: "Unsigned Executable Binary", points: +5 });
        }

        // 9. Path Context
        if (pathContext?.pathScore > 0) {
            const pathPts = Math.min(25, Math.round(pathContext.pathScore * 0.3));
            score += pathPts;
            breakdown.push({ factor: `Unusual Path Location Context (${pathContext.flags.join(", ")})`, points: +pathPts });
        }

        // 10. Size Anomaly
        if (sizeAnomaly?.anomalyScore > 0) {
            const sizePts = Math.min(20, Math.round(sizeAnomaly.anomalyScore * 0.25));
            score += sizePts;
            breakdown.push({ factor: `File Structure Anomaly (${sizeAnomaly.flags.join(", ")})`, points: +sizePts });
        }

        // 11. ML Classifier Contribution
        if (mlPrediction?.malicious_probability > 0.70) {
            score += 20;
            breakdown.push({ factor: `Machine Learning Classifier Risk (${(mlPrediction.malicious_probability * 100).toFixed(0)}% probability)`, points: +20 });
        }

        // 12. Behavioral Correlation (if present in context)
        if (contextOptions.parentProcess?.suspicious) {
            score += 20;
            breakdown.push({ factor: `Spawned by Suspicious Parent Process (${contextOptions.parentProcess.name})`, points: +20 });
        }
        if (contextOptions.networkConnection?.isOutboundC2) {
            score += 25;
            breakdown.push({ factor: `Established Outbound Socket Connection (${contextOptions.networkConnection.remoteAddr})`, points: +25 });
        }
        if (contextOptions.persistenceInstalled) {
            score += 25;
            breakdown.push({ factor: "Created Autostart Persistence Entry", points: +25 });
        }

        const finalScore = Math.min(100, Math.max(0, score));
        const avgConfidence = factorCount > 0 ? Math.min(0.99, Math.max(0.60, confidenceAcc / factorCount)) : 0.75;

        return {
            riskScore: finalScore,
            confidence: parseFloat(avgConfidence.toFixed(2)),
            breakdown
        };
    }

    _generateRemediation({ filePath, filename, verdict, riskScore, platform }) {
        let action = "ALLOW";
        let command = "";
        let explanation = "";

        if (verdict === "MALICIOUS" || verdict === "HIGH_RISK") {
            action = "QUARANTINE_OR_DELETE";
            if (platform === "win32") {
                command = `powershell -Command "Stop-Process -Name '${path.parse(filename).name}' -Force -ErrorAction SilentlyContinue; Remove-Item -Path '${filePath}' -Force"`;
            } else {
                command = `pkill -f "${filename}" 2>/dev/null; rm -f "${filePath}"`;
            }
            explanation = `File flagged with high threat score (${riskScore}/100). Immediate termination and quarantine/deletion is recommended.`;
        } else if (verdict === "SUSPICIOUS") {
            action = "ISOLATE_AND_INSPECT";
            if (platform === "win32") {
                command = `powershell -Command "Move-Item -Path '${filePath}' -Destination '$env:TEMP\\flotbot_quarantine_${Date.now()}'"`;
            } else {
                command = `mkdir -p /tmp/flotbot_quarantine && mv "${filePath}" /tmp/flotbot_quarantine/`;
            }
            explanation = `File exhibits suspicious characteristics. Isolate to quarantine staging directory for further sandbox inspection.`;
        } else {
            action = "ALLOW";
            command = "";
            explanation = `No active threat detected. File verified safe under current posture.`;
        }

        return {
            recommendedAction: action,
            remediationCommand: command,
            explanation
        };
    }

    async _generateAIExplanation(report) {
        if (!this.aiEngine) return null;

        const summaryPrompt = `You are FloatBot AI Principal Security Analyst. Ground your response STRICTLY on the deterministic evidence provided below. NEVER invent facts, hashes, or indicators.\n\n` +
            `FILE THREAT REPORT:\n` +
            `Filename: ${report.filename}\n` +
            `Format: ${report.identification.format} (MIME: ${report.identification.mime})\n` +
            `Verdict: ${report.verdict} (Risk: ${report.riskScore}/100, Confidence: ${(report.confidence * 100).toFixed(0)}%)\n` +
            `SHA-256: ${report.hashes.sha256}\n` +
            `Shannon Entropy: ${report.entropy.score}/8.0 (${report.entropy.tier})\n` +
            `YARA Matches: ${report.yaraMatches.map(y => y.rule).join(", ") || "None"}\n` +
            `Signature: ${report.signature.status} (${report.signature.publisher})\n` +
            `ML Probability: ${(report.ml.malicious_probability * 100).toFixed(0)}%\n` +
            `Key Evidence Factors:\n${report.evidenceBreakdown.map(e => ` - ${e.factor} (${e.points > 0 ? '+' : ''}${e.points} pts)`).join("\n")}\n\n` +
            `Provide a concise 3-paragraph executive summary explaining: 1) What was detected and why it is suspicious, 2) The structural & behavioral evidence, 3) Recommended action for the security operator.`;

        try {
            const response = await this.aiEngine.chat(summaryPrompt);
            return response?.response || response?.text || null;
        } catch {
            return null;
        }
    }
}

module.exports = FileAnalyzer;
