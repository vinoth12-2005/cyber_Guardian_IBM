const os = require("os");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const URLEngine = require("./URLEngine");

/**
 * ScreenSecurityEngine
 * ─────────────────────────────────────────────────────────────
 * Cross-platform screen security and visual threat analysis.
 * Modes: OFF | MANUAL | PERIODIC | EVENT_TRIGGERED
 *
 * Privacy Guarantees:
 *   - Local OCR & heuristic inspection
 *   - Automatic credential & secret redaction
 *   - Never continuously upload raw screenshots to external cloud
 */
class ScreenSecurityEngine {

    constructor(aiEngine = null, options = {}) {
        this.aiEngine = aiEngine;
        this.mode = options.mode || "MANUAL";
        this.intervalMs = options.intervalMs || 30_000;
        this._intervalHandle = null;
        this.lastInspection = null;
    }

    setMode(mode) {
        if (["OFF", "MANUAL", "PERIODIC", "EVENT_TRIGGERED"].includes(mode)) {
            this.mode = mode;
            if (mode === "PERIODIC") {
                this.startPeriodicScan();
            } else {
                this.stopPeriodicScan();
            }
        }
        return this.mode;
    }

    /**
     * Sanitize and redact passwords, API keys, and sensitive tokens from text.
     * @param {string} text
     * @returns {string}
     */
    static redactSensitiveData(text) {
        if (!text || typeof text !== "string") return "";
        let clean = text;
        clean = clean.replace(/password\s*[:=]\s*\S+/gi, "password: [REDACTED]");
        clean = clean.replace(/\b(sk-[a-zA-Z0-9_\-]{16,}|AIzaSy[a-zA-Z0-9_\-]{16,})\b/g, "[REDACTED_API_KEY]");
        clean = clean.replace(/\b(bearer\s+[a-zA-Z0-9\-\._~\+\/]{16,}=*)\b/gi, "Bearer [REDACTED_TOKEN]");
        clean = clean.replace(/\b[a-f0-9]{32,64}\b/gi, "[REDACTED_HASH_SECRET]");
        return clean;
    }

    /**
     * Capture desktop screenshot.
     * @returns {Promise<{imageBase64: string, dataUrl: string, source: string}>}
     */
    async captureScreenshot() {
        // 1. Electron desktopCapturer if running in Electron renderer/main
        try {
            const { desktopCapturer, screen } = require("electron");
            if (desktopCapturer) {
                const primary = screen ? screen.getPrimaryDisplay() : null;
                const bounds = primary ? primary.bounds : { width: 1280, height: 720 };
                const width = Math.min(1280, bounds.width || 1280);
                const height = Math.min(720, Math.round(width * ((bounds.height || 720) / (bounds.width || 1280))));

                const sources = await desktopCapturer.getSources({
                    types: ["screen"],
                    thumbnailSize: { width, height },
                    fetchWindowIcons: false
                });

                if (sources && sources.length > 0 && !sources[0].thumbnail.isEmpty()) {
                    const jpeg = sources[0].thumbnail.toJPEG(75);
                    const b64 = jpeg.toString("base64");
                    return {
                        imageBase64: b64,
                        dataUrl: `data:image/jpeg;base64,${b64}`,
                        source: "desktopCapturer"
                    };
                }
            }
        } catch {}

        // 2. Native OS CLI Fallback
        return this._captureNativeCLI();
    }

    _captureNativeCLI() {
        const platform = process.platform;
        const tempPath = path.join(os.tmpdir(), `flotbot_screen_${Date.now()}.png`);

        return new Promise((resolve) => {
            let cmd = "";
            if (platform === "linux") {
                cmd = `import -window root "${tempPath}" 2>/dev/null || scrot "${tempPath}" 2>/dev/null || gnome-screenshot -f "${tempPath}" 2>/dev/null`;
            } else if (platform === "darwin") {
                cmd = `screencapture -x -C "${tempPath}" 2>/dev/null`;
            } else if (platform === "win32") {
                cmd = `powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms,System.Drawing; $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $bmp = New-Object System.Drawing.Bitmap($b.Width, $b.Height); $g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size); $bmp.Save('${tempPath}', [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose();"`;
            }

            if (!cmd) return resolve({ imageBase64: "", dataUrl: "", source: "none" });

            exec(cmd, { timeout: 7000 }, (err) => {
                if (!err && fs.existsSync(tempPath)) {
                    try {
                        const buf = fs.readFileSync(tempPath);
                        fs.unlinkSync(tempPath);
                        const b64 = buf.toString("base64");
                        return resolve({
                            imageBase64: b64,
                            dataUrl: `data:image/png;base64,${b64}`,
                            source: "native_cli"
                        });
                    } catch {
                        return resolve({ imageBase64: "", dataUrl: "", source: "read_error" });
                    }
                }
                resolve({ imageBase64: "", dataUrl: "", source: "capture_unavailable" });
            });
        });
    }

    /**
     * Inspect screen content and active windows for visual threats.
     * @param {object} params - { imageBase64, ocrText, windowTitle, visibleUrl, windows }
     * @returns {Promise<object>}
     */
    async inspectScreen(params = {}) {
        if (this.mode === "OFF") {
            return { mode: "OFF", message: "Screen analysis is currently disabled." };
        }

        let imageBase64 = params.imageBase64 || "";
        let dataUrl = params.dataUrl || "";

        if (!imageBase64) {
            const capture = await this.captureScreenshot();
            imageBase64 = capture.imageBase64;
            dataUrl = capture.dataUrl;
        }

        const rawText = params.ocrText || "";
        const cleanText = ScreenSecurityEngine.redactSensitiveData(rawText);
        const windowTitle = params.windowTitle || "Desktop Workspace";
        const visibleUrl = params.visibleUrl || "";
        const windows = params.windows || [];

        const warnings = [];
        const detectedThreats = [];

        // 1. Phishing & Insecure Forms Check
        if (/login|sign in|password|verify account|update billing/i.test(cleanText)) {
            if (visibleUrl && !visibleUrl.startsWith("https://")) {
                warnings.push("Credential input prompt observed on unencrypted (HTTP) page.");
            }
            if (/paypal|microsoft|google|apple|amazon|chase|wellsfargo/i.test(cleanText) && visibleUrl) {
                const urlAnalysis = URLEngine.analyze(visibleUrl);
                if (urlAnalysis.isPhishing || urlAnalysis.riskLevel === "HIGH" || urlAnalysis.riskLevel === "CRITICAL") {
                    detectedThreats.push({
                        type: "VISUAL_PHISHING_PAGE",
                        severity: "CRITICAL",
                        url: visibleUrl,
                        description: `Visual credential form on suspicious lookalike URL: ${visibleUrl}`,
                        mitre: ["T1566.002"]
                    });
                }
            }
        }

        // 2. Fake Tech Support / Ransomware Warning Popups
        if (/call 1-800|call technical support|your system is locked|trojan detected call|files have been encrypted/i.test(cleanText)) {
            detectedThreats.push({
                type: "SCAM_ALERT_OR_RANSOM_DIALOG",
                severity: "HIGH",
                description: "Visual rogue dialog detected (fake support or ransom notification)",
                mitre: ["T1204"]
            });
        }

        // 3. Rogue Shell Windows
        for (const win of windows) {
            const t = (win.title || win.windowTitle || "").toLowerCase();
            if (t.includes("powershell -enc") || t.includes("nc.exe -e") || t.includes("mimikatz")) {
                detectedThreats.push({
                    type: "SUSPICIOUS_SHELL_WINDOW",
                    severity: "HIGH",
                    process: win.name,
                    pid: win.pid,
                    title: win.title || win.windowTitle,
                    description: `Active visible shell window running suspicious payload: "${win.title || win.windowTitle}"`
                });
            }
        }

        let aiAnalysis = null;
        if (this.aiEngine && (detectedThreats.length > 0 || warnings.length > 0)) {
            try {
                const res = await this.aiEngine.analyzeScreen({
                    imageBase64,
                    ocrText: cleanText,
                    windowTitle,
                    visibleUrl,
                    windows
                });
                if (res && res.success) aiAnalysis = res.analysis;
            } catch {}
        }

        this.lastInspection = {
            timestamp: new Date().toISOString(),
            windowTitle,
            visibleUrl,
            warnings,
            threats: detectedThreats,
            aiAnalysis,
            imagePreview: dataUrl
        };

        return this.lastInspection;
    }

    startPeriodicScan(callback = null) {
        this.stopPeriodicScan();
        this._intervalHandle = setInterval(async () => {
            const report = await this.inspectScreen();
            if (callback && report.threats && report.threats.length > 0) {
                callback(report);
            }
        }, this.intervalMs);
    }

    stopPeriodicScan() {
        if (this._intervalHandle) {
            clearInterval(this._intervalHandle);
            this._intervalHandle = null;
        }
    }
}

module.exports = ScreenSecurityEngine;
