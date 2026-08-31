/**
 * URLEngine
 * ─────────────────────────────────────────────────────────────
 * Multidimensional URL Threat & Phishing Detection Engine:
 *   - Lookalike / typosquatting detection (including leetspeak 0->o, 1->l/i)
 *   - Homograph / punycode detection (IDN attacks)
 *   - High-risk TLD reputation
 *   - IP-based and obfuscated octal/hex hostnames
 *   - Open redirect & credential harvest path patterns
 */
class URLEngine {

    static SUSPICIOUS_TLDS = new Set([
        ".zip", ".mov", ".top", ".xyz", ".work", ".click", ".country",
        ".kim", ".gq", ".cf", ".tk", ".ml", ".icu", ".cam", ".rest"
    ]);

    static BRAND_TARGETS = [
        { brand: "paypal", officialDomains: ["paypal.com"] },
        { brand: "google", officialDomains: ["google.com", "google.co.uk", "accounts.google.com", "drive.google.com"] },
        { brand: "microsoft", officialDomains: ["microsoft.com", "live.com", "office.com", "login.microsoftonline.com", "outlook.com"] },
        { brand: "apple", officialDomains: ["apple.com", "icloud.com", "appleid.apple.com"] },
        { brand: "amazon", officialDomains: ["amazon.com", "aws.amazon.com"] },
        { brand: "github", officialDomains: ["github.com"] },
        { brand: "netflix", officialDomains: ["netflix.com"] }
    ];

    /**
     * Normalize leetspeak substitutions (e.g. paypa1 -> paypal, micros0ft -> microsoft)
     */
    static normalizeLeet(str) {
        return str
            .replace(/1/g, "l")
            .replace(/0/g, "o")
            .replace(/3/g, "e")
            .replace(/4/g, "a")
            .replace(/5/g, "s")
            .replace(/8/g, "b")
            .replace(/vv/g, "w");
    }

    /**
     * Analyze a URL across multiple threat signals.
     * @param {string} rawUrl
     * @returns {object} { url, domain, riskLevel, score, confidence, warnings, mitre, isPhishing }
     */
    static analyze(rawUrl) {
        const warnings = [];
        const mitre = [];
        let score = 5; // Base safe baseline

        let parsed;
        try {
            parsed = new URL(rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`);
        } catch {
            return {
                url: rawUrl,
                domain: "",
                riskLevel: "HIGH",
                score: 75,
                confidence: 0.9,
                warnings: ["Malformed, invalid or unparseable URL syntax"],
                mitre: ["T1566.002"],
                isPhishing: false
            };
        }

        const hostname = parsed.hostname.toLowerCase();
        const normalizedHostname = URLEngine.normalizeLeet(hostname);
        const protocol = parsed.protocol;
        const pathname = parsed.pathname.toLowerCase();
        const search = parsed.search.toLowerCase();

        // 1. Insecure Protocol Check
        if (protocol === "http:") {
            warnings.push("Insecure unencrypted HTTP protocol used for transmission.");
            score += 20;
        }

        // 2. Raw IP address hostname
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
            warnings.push(`URL uses raw IP address hostname (${hostname}) rather than a registered domain name.`);
            score += 35;
            mitre.push("T1071.001");
        }

        // 3. Hex / Dword IP Obfuscation (e.g. 0x7f000001 or 2130706433)
        if (/^0x[0-9a-f]+$/i.test(hostname) || /^\d{8,10}$/.test(hostname)) {
            warnings.push("Host uses decimal/hexadecimal obfuscated IP address encoding.");
            score += 55;
            mitre.push("T1027");
        }

        // 4. Punycode (IDN Homograph Attack)
        if (hostname.includes("xn--")) {
            warnings.push("Punycode internationalized domain detected (potential IDN homograph impersonation).");
            score += 45;
            mitre.push("T1566.002");
        }

        // 5. Suspicious High-Risk TLD
        const parts = hostname.split(".");
        const tld = parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
        if (URLEngine.SUSPICIOUS_TLDS.has(tld)) {
            warnings.push(`Domain uses high-risk Top-Level Domain (${tld}) known for abusive domain registrations.`);
            score += 25;
        }

        // 6. Brand Impersonation / Lookalike & Leetspeak Check
        for (const target of URLEngine.BRAND_TARGETS) {
            if (hostname.includes(target.brand) || normalizedHostname.includes(target.brand)) {
                const isOfficial = target.officialDomains.some(d => hostname === d || hostname.endsWith(`.${d}`));
                if (!isOfficial) {
                    warnings.push(`Brand lookalike detected: Domain contains impersonation of "${target.brand}" but does not belong to authorized domains (${target.officialDomains.join(", ")}).`);
                    score += 50;
                    mitre.push("T1566.002");
                }
            }
        }

        // 7. Phishing Path / Credential Harvesting Keywords
        if (/(\/login|\/signin|\/verify|\/account-update|\/billing|\/secure-banking)/.test(pathname)) {
            if (score > 30) {
                warnings.push("Credential authentication path found on suspicious or non-standard domain.");
                score += 25;
            }
        }

        // 8. Open Redirect Indicator
        if (/(\?redirect=|\?url=|\?next=|\?destination=|\?return=)/.test(search)) {
            warnings.push("Open redirection parameter detected in URL query string.");
            score += 15;
        }

        const finalScore = Math.min(100, Math.max(0, score));
        let telemetryRiskTier = "LOW";
        if (finalScore >= 80) telemetryRiskTier = "HIGH_HEURISTIC_SCORE";
        else if (finalScore >= 60) telemetryRiskTier = "MEDIUM_HEURISTIC_SCORE";

        return {
            url: rawUrl,
            domain: hostname,
            protocol: protocol.replace(":", ""),
            riskLevel: "NO_AUTHORITATIVE_VERDICT", // Deferred to DetectionManager (VirusTotal / Safe Browsing)
            telemetryRiskTier,
            score: finalScore,
            confidence: Math.min(1.0, 0.4 + warnings.length * 0.1),
            warnings,
            mitre: [...new Set(mitre)],
            isPhishingHeuristic: finalScore >= 60 && warnings.some(w => w.includes("lookalike") || w.includes("Credential")),
            isPhishing: false // Authoritative verdict must be set by external security APIs
        };
    }
}

module.exports = URLEngine;
