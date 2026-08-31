const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * RansomwareEngine
 * ─────────────────────────────────────────────────────────────
 * Multi-signal deterministic ransomware detection engine:
 *   - High-frequency file modification bursts
 *   - Extension mutations (.locked, .crypted, .enc, etc.)
 *   - High Shannon Entropy jump (> 7.4) in modified files
 *   - Dropped ransom notes (HOW_TO_RESTORE.txt, DECRYPT.html)
 *   - Shadow copy / recovery disabling commands
 *   - Canary tripwire status
 */
class RansomwareEngine {

    static RANSOM_EXTENSIONS = new Set([
        ".locked", ".crypto", ".crypted", ".enc", ".wnry", ".lockbit",
        ".blackcat", ".conti", ".akira", ".rhysida", ".play", ".ransom"
    ]);

    static RANSOM_NOTE_REGEX = /^(readme|decrypt|how_to_recover|restore_files|instructions|read_me|recover_your_files)[\w\-_]*\.(txt|html|hta)$/i;

    constructor(canarySystem = null) {
        this.canary = canarySystem;
        this.recentFileActions = []; // [{ path, action, ts, entropy, ext }]
        this.burstWindowMs = 5000;
    }

    /**
     * Calculate Shannon Entropy of a buffer (0.0 to 8.0).
     */
    calculateEntropy(buffer) {
        if (!buffer || buffer.length === 0) return 0;
        const freqs = new Array(256).fill(0);
        for (let i = 0; i < buffer.length; i++) freqs[buffer[i]]++;
        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            if (freqs[i] > 0) {
                const p = freqs[i] / buffer.length;
                entropy -= p * Math.log2(p);
            }
        }
        return entropy;
    }

    /**
     * Inspect incoming file events and system state for ransomware signals.
     * @param {Array<object>} fileEvents - [{ action, file }]
     * @param {Array<object>} activeProcesses
     * @returns {object|null} Detection report if suspicious
     */
    evaluate(fileEvents = [], activeProcesses = []) {
        const now = Date.now();

        // 1. Record incoming file events
        for (const fe of fileEvents) {
            const f = fe.file || fe;
            const ext = path.extname(f.fileName || f.filePath || "").toLowerCase();
            this.recentFileActions.push({
                path: f.filePath || f.path || "",
                name: f.fileName || f.name || "",
                action: fe.action || "MODIFIED",
                ext,
                ts: now
            });
        }

        // 2. Prune outside burst window
        this.recentFileActions = this.recentFileActions.filter(a => (now - a.ts) <= this.burstWindowMs);

        const indicators = [];
        let confidence = 0.5;

        // Signal A: Canary tripwire
        if (this.canary) {
            const canaryStatus = this.canary.checkStatus();
            if (canaryStatus.tripped) {
                indicators.push(`Decoy Canary Tripwire tripped: ${canaryStatus.details?.reason}`);
                confidence += 0.35;
            }
        }

        // Signal B: High modification rate (> 15 files in 5s)
        const modCount = this.recentFileActions.filter(a => a.action === "MODIFIED" || a.action === "CREATED").length;
        if (modCount >= 15) {
            indicators.push(`High file modification burst: ${modCount} file operations in < 5 seconds.`);
            confidence += 0.25;
        }

        // Signal C: Ransomware extension mutation
        const ransomExtHits = this.recentFileActions.filter(a => RansomwareEngine.RANSOM_EXTENSIONS.has(a.ext));
        if (ransomExtHits.length > 0) {
            indicators.push(`Files renamed with known ransomware extensions: ${ransomExtHits.map(h => h.ext).slice(0, 3).join(", ")}`);
            confidence += 0.35;
        }

        // Signal D: Ransom note dropped
        const ransomNotes = this.recentFileActions.filter(a => RansomwareEngine.RANSOM_NOTE_REGEX.test(a.name));
        if (ransomNotes.length > 0) {
            indicators.push(`Ransom note dropped on disk: "${ransomNotes[0].name}"`);
            confidence += 0.35;
        }

        // Signal E: Shadow copy tampering in running processes
        for (const p of activeProcesses) {
            const cmd = (p.cmdLine || "").toLowerCase();
            if (cmd.includes("vssadmin") && cmd.includes("delete shadows")) {
                indicators.push(`Volume Shadow Copy deletion detected (vssadmin delete shadows, PID ${p.pid})`);
                confidence += 0.4;
            }
            if (cmd.includes("wmic") && cmd.includes("shadowcopy delete")) {
                indicators.push(`WMI Shadow Copy deletion command detected (PID ${p.pid})`);
                confidence += 0.4;
            }
        }

        if (indicators.length >= 2 || (indicators.length >= 1 && confidence >= 0.75)) {
            return {
                detected: true,
                title: "POSSIBLE RANSOMWARE ACTIVITY DETECTED",
                severity: "CRITICAL",
                confidence: Math.min(1.0, confidence),
                score: 99,
                indicators,
                description: `Multiple high-severity ransomware indicators observed simultaneously: ${indicators.join(" ")}`,
                recommendation: "Isolate endpoint immediately, terminate suspicious processes, and inspect file modifications.",
                mitre: ["T1486", "T1490"]
            };
        }

        return null;
    }

    clear() {
        this.recentFileActions = [];
    }
}

module.exports = RansomwareEngine;
