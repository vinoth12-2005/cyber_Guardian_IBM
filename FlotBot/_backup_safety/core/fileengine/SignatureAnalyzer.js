const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * SignatureAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Cross-platform code signature and digital certificate analyzer.
 *
 * Rules:
 *   - VALID SIGNATURE = positive evidence reducing risk.
 *   - UNSIGNED = risk feature, NOT proof of malware.
 *   - INVALID / TAMPERED SIGNATURE = elevated risk indicator.
 */
class SignatureAnalyzer {

    /**
     * Analyze digital signature of a file.
     * @param {string} filePath
     * @param {object} [staticResult] - Pre-parsed static binary result
     * @returns {Promise<object>} Signature analysis result
     */
    static async analyze(filePath, staticResult = null) {
        if (!filePath || !fs.existsSync(filePath)) {
            return {
                isSigned: false,
                isValid: false,
                publisher: "Unknown",
                status: "FILE_NOT_FOUND",
                trustScoreModifier: 0
            };
        }

        const platform = process.platform;
        let isSigned = false;
        let isValid = false;
        let publisher = "Unknown";
        let status = "UNSIGNED";

        // 1. Static binary directory hint check
        if (staticResult?.hasDigitalSignatureDirectory || staticResult?.hasCodeSignature) {
            isSigned = true;
            status = "SIGNED_UNVERIFIED";
        }

        // 2. Platform-native signature verification
        try {
            if (platform === "win32") {
                const cmd = `powershell -NoProfile -NonInteractive -Command "Get-AuthenticodeSignature -LiteralPath '${filePath}' | Select-Object -Property Status, SignerCertificate | ConvertTo-Json"`;
                const out = execSync(cmd, { timeout: 3000, stdio: ["pipe", "pipe", "ignore"] }).toString();
                const json = JSON.parse(out);
                if (json) {
                    const winStatus = String(json.Status || "").toLowerCase();
                    if (winStatus === "valid" || winStatus === "0") {
                        isSigned = true;
                        isValid = true;
                        status = "VALID_SIGNATURE";
                        publisher = json.SignerCertificate?.Subject || "Trusted Windows Publisher";
                    } else if (winStatus.includes("hashmismatch") || winStatus.includes("tampered")) {
                        isSigned = true;
                        isValid = false;
                        status = "TAMPERED_INVALID_SIGNATURE";
                    } else if (winStatus.includes("notsigned")) {
                        isSigned = false;
                        isValid = false;
                        status = "UNSIGNED";
                    }
                }
            } else if (platform === "darwin") {
                try {
                    const out = execSync(`codesign -dv --verbose=2 "${filePath}" 2>&1`, { timeout: 3000 }).toString();
                    if (out.includes("Authority=") || out.includes("valid on disk")) {
                        isSigned = true;
                        isValid = true;
                        status = "VALID_SIGNATURE";
                        const match = out.match(/Authority=([^\n]+)/);
                        if (match) publisher = match[1].trim();
                    }
                } catch {
                    isSigned = false;
                    status = "UNSIGNED";
                }
            } else if (platform === "linux") {
                // Linux binaries: check if signed or package-managed
                status = isSigned ? "SIGNED" : "UNSIGNED";
            }
        } catch {
            // Non-fatal: fallback to static header detection
            if (isSigned) {
                status = "SIGNED_STATIC_DETECTED";
            }
        }

        // Score modifier: Valid signature reduces risk, Tampered signature increases risk
        let trustScoreModifier = 0;
        if (isValid) {
            trustScoreModifier = -25; // Significant risk deduction
        } else if (status === "TAMPERED_INVALID_SIGNATURE") {
            trustScoreModifier = +35; // Critical risk addition
        } else if (!isSigned) {
            trustScoreModifier = +5;  // Mild baseline risk feature for unsigned binaries
        }

        return {
            isSigned,
            isValid,
            publisher,
            status,
            trustScoreModifier,
            summary: isValid
                ? `Valid digital signature verified (Publisher: ${publisher})`
                : status === "TAMPERED_INVALID_SIGNATURE"
                ? "TAMPERED OR INVALID DIGITAL SIGNATURE DETECTED"
                : isSigned
                ? "Digital signature structure detected (Unverified CA)"
                : "Unsigned file (Normal for custom/open-source tools, mild risk factor)"
        };
    }
}

module.exports = SignatureAnalyzer;
