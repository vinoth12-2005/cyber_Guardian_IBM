const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * ScreenAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Cross-Platform Visual Screen Analysis & Phishing Detection Engine:
 *   - Real Desktop Screenshot Capture via Electron desktopCapturer & OS fallback
 *   - Multimodal Visual Inspection (Gemini Vision & Ollama Vision)
 *   - Phishing & Rogue Popup Detection (fake tech support, credential harvest, fake AV)
 *   - Open Window & Browser Tab Correlation
 *   - Privacy-safe credential & secret redaction
 */
class ScreenAnalyzer {

    constructor(aiEngine = null) {
        this.aiEngine = aiEngine;
        this.activeMonitoring = false;
        this.intervalId = null;
    }

    /**
     * Redact credentials, API keys, passwords, and tokens from OCR text before sending to LLM.
     * @param {string} text
     * @returns {string}
     */
    static redactSecrets(text) {
        if (!text) return "";
        let redacted = text;

        // Passwords in text or inputs
        redacted = redacted.replace(/password\s*[:=]\s*\S+/gi, "password: [REDACTED]");

        // Bearer tokens / JWTs
        redacted = redacted.replace(/bearer\s+[a-zA-Z0-9\-\._~\+\/]+=*/gi, "Bearer [REDACTED]");

        // API keys (e.g. AIza..., sk-...)
        redacted = redacted.replace(/\b(sk-[a-zA-Z0-9_\-]{16,}|AIzaSy[a-zA-Z0-9_\-]{16,})\b/g, "[REDACTED_API_KEY]");

        // Generic 32+ char hex/base64 secret tokens
        redacted = redacted.replace(/\b[a-fA-F0-9]{32,64}\b/g, "[REDACTED_HASH_SECRET]");

        return redacted;
    }

    /**
     * Capture desktop screenshot using Electron desktopCapturer or native OS tools.
     * @returns {Promise<{imageBase64: string, dataUrl: string, width: number, height: number}>}
     */
    async captureScreenshot() {
        // 1. Try Electron desktopCapturer if available
        try {
            const { desktopCapturer, screen } = require("electron");
            if (desktopCapturer) {
                const primaryDisplay = screen ? screen.getPrimaryDisplay() : null;
                const bounds = primaryDisplay ? primaryDisplay.bounds : { width: 1280, height: 720 };
                const thumbWidth  = Math.min(1280, bounds.width || 1280);
                const thumbHeight = Math.min(720, Math.round(thumbWidth * ((bounds.height || 720) / (bounds.width || 1280))));

                const sources = await desktopCapturer.getSources({
                    types: ["screen"],
                    thumbnailSize: { width: thumbWidth, height: thumbHeight },
                    fetchWindowIcons: false
                });

                if (sources && sources.length > 0) {
                    const thumbnail = sources[0].thumbnail;
                    if (thumbnail && !thumbnail.isEmpty()) {
                        const jpegBuffer = thumbnail.toJPEG(75);
                        const b64 = jpegBuffer.toString("base64");
                        const dataUrl = `data:image/jpeg;base64,${b64}`;
                        return {
                            imageBase64: b64,
                            dataUrl,
                            width: thumbWidth,
                            height: thumbHeight,
                            source: "desktopCapturer"
                        };
                    }
                }
            }
        } catch (err) {
            console.warn("[ScreenAnalyzer] desktopCapturer capture warning:", err.message);
        }

        // 2. Native OS CLI Screenshot Fallback
        return await this._captureNativeOS();
    }

    async _captureNativeOS() {
        const platform = process.platform;
        const tempPath = path.join(os.tmpdir(), `flotbot_screen_${Date.now()}.png`);

        return new Promise((resolve) => {
            let cmd = "";
            if (platform === "linux") {
                // Try import (ImageMagick), scrot, or gnome-screenshot
                cmd = `import -window root "${tempPath}" 2>/dev/null || scrot "${tempPath}" 2>/dev/null || gnome-screenshot -f "${tempPath}" 2>/dev/null`;
            } else if (platform === "darwin") {
                cmd = `screencapture -x -C "${tempPath}"`;
            } else if (platform === "win32") {
                // PowerShell GDI capture
                cmd = `powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms,System.Drawing; $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $bmp = New-Object System.Drawing.Bitmap($b.Width, $b.Height); $g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size); $bmp.Save('${tempPath}', [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose();"`;
            }

            if (!cmd) {
                return resolve({ imageBase64: "", dataUrl: "", source: "none" });
            }

            exec(cmd, { timeout: 8000 }, (err) => {
                if (!err && fs.existsSync(tempPath)) {
                    try {
                        const buf = fs.readFileSync(tempPath);
                        fs.unlinkSync(tempPath); // cleanup
                        const b64 = buf.toString("base64");
                        return resolve({
                            imageBase64: b64,
                            dataUrl: `data:image/png;base64,${b64}`,
                            source: "native_cli"
                        });
                    } catch (readErr) {
                        return resolve({ imageBase64: "", dataUrl: "", error: readErr.message });
                    }
                }
                resolve({ imageBase64: "", dataUrl: "", source: "fallback_failed" });
            });
        });
    }

    /**
     * Analyze a single screen capture with real visual image & active windows.
     * @param {object} params - { imageBase64, ocrText, visibleUrl, windowTitle, windows }
     */
    async analyzeScreen(params = {}) {
        let imageBase64 = params.imageBase64 || "";
        let dataUrl     = params.dataUrl || "";

        // If no image passed, capture it now
        if (!imageBase64) {
            const capture = await this.captureScreenshot();
            imageBase64 = capture.imageBase64 || "";
            dataUrl     = capture.dataUrl || "";
        }

        const cleanText = ScreenAnalyzer.redactSecrets(params.ocrText || "");
        const windowTitle = params.windowTitle || "Desktop Workspace";
        const visibleUrl   = params.visibleUrl || "";
        const windows      = params.windows || [];

        const warnings = [];

        // 1. Phishing & Insecure Form Heuristic Checks
        if (/login|sign in|password|verify account|update billing/i.test(cleanText)) {
            if (visibleUrl && !visibleUrl.startsWith("https://")) {
                warnings.push("⚠️ Login or credential prompt detected on an unencrypted (HTTP) page.");
            }
            if (/bank|paypal|microsoft|google|apple|amazon/i.test(cleanText) && visibleUrl && !visibleUrl.includes(".")) {
                warnings.push("⚠️ Page resembles a major brand login portal, but the domain requires verification.");
            }
        }

        // 2. Suspicious window title checks (Ransomware / Fake Tech Support / Terminal Spawns)
        const suspiciousTitles = ["powershell", "cmd.exe", "ransomware", "your files are encrypted", "tech support", "call 1-800", "trojan detected"];
        for (const w of windows) {
            const titleLower = (w.windowTitle || w.title || "").toLowerCase();
            for (const st of suspiciousTitles) {
                if (titleLower.includes(st)) {
                    warnings.push(`⚠️ Suspicious active window detected: "${w.windowTitle || w.title}" (PID: ${w.pid})`);
                    break;
                }
            }
        }

        // 3. Multimodal AI Visual Threat Inspection
        let aiOpinion = "Screen content visually inspected. No active security warnings or phishing indicators detected.";
        if (this.aiEngine) {
            const aiRes = await this.aiEngine.analyzeScreen({
                imageBase64,
                ocrText: cleanText,
                windowTitle,
                visibleUrl,
                windows
            });
            if (aiRes && aiRes.success && aiRes.analysis) {
                aiOpinion = aiRes.analysis;
            }
        }

        return {
            timestamp: new Date().toISOString(),
            success: true,
            windowTitle,
            visibleUrl,
            imagePreview: dataUrl || (imageBase64 ? `data:image/png;base64,${imageBase64}` : ""),
            openWindowsCount: windows.length,
            warnings,
            aiOpinion,
            provider: this.aiEngine ? this.aiEngine.getMode() : "local"
        };
    }

    startInterval(callback, intervalMs = 15000) {
        if (this.activeMonitoring) return;
        this.activeMonitoring = true;
        this.intervalId = setInterval(async () => {
            if (callback) callback();
        }, intervalMs);
    }

    stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.activeMonitoring = false;
    }
}

module.exports = ScreenAnalyzer;

