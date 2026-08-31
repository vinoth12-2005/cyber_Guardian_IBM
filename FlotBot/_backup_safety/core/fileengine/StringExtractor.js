/**
 * StringExtractor
 * ─────────────────────────────────────────────────────────────
 * Safe cross-platform string extraction and heuristic classifier.
 *
 * Extracts both ASCII (7-bit) and UTF-16LE (16-bit wide) strings.
 * Categorizes and scores indicators without executing target code:
 *   - Network indicators: URLs, Webhooks, C2 IPs, domains
 *   - Shell commands: PowerShell, CMD, Bash one-liners, reverse shells
 *   - Evasion & Persistence: AMSI bypass, Run keys, services, tasks
 *   - Credential Access: mimikatz keywords, token stealing, webhooks
 */
class StringExtractor {

    /**
     * Extract strings from buffer.
     * @param {Buffer} buffer
     * @param {number} [minLength=4]
     * @param {number} [maxStrings=2000]
     * @returns {object} Extracted strings and matched indicator flags
     */
    static extract(buffer, minLength = 4, maxStrings = 2000) {
        if (!buffer || buffer.length === 0) {
            return {
                totalExtracted: 0,
                indicators: [],
                network: { urls: [], ips: [], domains: [], webhooks: [] },
                commands: [],
                persistence: [],
                evasion: [],
                stringThreatScore: 0
            };
        }

        const maxScanBytes = Math.min(buffer.length, 10 * 1024 * 1024); // Cap scan at 10 MB
        const strings = [];

        // 1. Extract ASCII strings
        let currentAscii = "";
        for (let i = 0; i < maxScanBytes; i++) {
            const b = buffer[i];
            if (b >= 32 && b <= 126) {
                currentAscii += String.fromCharCode(b);
            } else {
                if (currentAscii.length >= minLength) {
                    strings.push(currentAscii);
                    if (strings.length >= maxStrings) break;
                }
                currentAscii = "";
            }
        }
        if (currentAscii.length >= minLength && strings.length < maxStrings) {
            strings.push(currentAscii);
        }

        // 2. Extract UTF-16LE (Wide) strings
        let currentWide = "";
        for (let i = 0; i < maxScanBytes - 1; i += 2) {
            const b1 = buffer[i];
            const b2 = buffer[i + 1];
            if (b2 === 0x00 && b1 >= 32 && b1 <= 126) {
                currentWide += String.fromCharCode(b1);
            } else {
                if (currentWide.length >= minLength) {
                    strings.push(currentWide);
                    if (strings.length >= maxStrings) break;
                }
                currentWide = "";
            }
        }
        if (currentWide.length >= minLength && strings.length < maxStrings) {
            strings.push(currentWide);
        }

        // 3. Classify strings into Security Threat Categories
        const indicators = [];
        const network = { urls: [], ips: [], domains: [], webhooks: [] };
        const commands = [];
        const persistence = [];
        const evasion = [];

        const IP_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
        const URL_REGEX = /https?:\/\/[a-zA-Z0-9\-\._~:\/\?#\[\]@!\$&'\(\)\*\+,;=%]+/i;
        const WEBHOOK_REGEX = /discord(app)?\.com\/api\/webhooks\/\d+|api\.telegram\.org\/bot[0-9]+/i;

        const EVASION_KEYWORDS = [
            { key: "amsiinitfailed", label: "AMSI Bypass / Memory Patching", weight: 35 },
            { key: "amsiutils", label: "AMSI Bypass Utilities Reference", weight: 30 },
            { key: "amsiscanbuffer", label: "AMSI Scan Buffer Patching", weight: 30 },
            { key: "virtualprotect", label: "Memory Page Protection Manipulation", weight: 20 },
            { key: "ntsetinformationthread", label: "Thread Hide From Debugger", weight: 25 },
            { key: "isdebuggerpresent", label: "Anti-Debugging Check", weight: 15 },
            { key: "minidumpwritedump", label: "LSASS Memory Dump Attempt", weight: 35 },
            { key: "openprocesstoken", label: "Process Security Token Access", weight: 20 }
        ];

        const COMMAND_KEYWORDS = [
            { key: "downloadstring", label: "PowerShell Remote Download String", weight: 25 },
            { key: "invoke-expression", label: "PowerShell IEX Execution", weight: 25 },
            { key: "iex ", label: "PowerShell IEX Shortcut", weight: 20 },
            { key: "-enc ", label: "PowerShell Encoded Command", weight: 25 },
            { key: "-encodedcommand", label: "PowerShell Encoded Command", weight: 25 },
            { key: "vssadmin delete shadows", label: "Shadow Copy Deletion (Ransomware)", weight: 40 },
            { key: "bcdedit /set", label: "Boot Configuration Tampering", weight: 30 },
            { key: "curl -s | sh", label: "Remote Shell Pipe", weight: 30 },
            { key: "wget -q0- | bash", label: "Remote Shell Pipe", weight: 30 },
            { key: "nc -e /bin", label: "Netcat Reverse Shell", weight: 35 }
        ];

        const PERSISTENCE_KEYWORDS = [
            { key: "software\\microsoft\\windows\\currentversion\\run", label: "Windows Run Key Persistence", weight: 20 },
            { key: "system\\currentcontrolset\\services", label: "Windows Service Persistence", weight: 20 },
            { key: "/library/launchagents", label: "macOS LaunchAgent Persistence", weight: 20 },
            { key: ".config/autostart", label: "Linux XDG Autostart Persistence", weight: 20 }
        ];

        for (const s of strings) {
            const sLower = s.toLowerCase();

            // Webhook exfiltration
            if (WEBHOOK_REGEX.test(s)) {
                if (!network.webhooks.includes(s)) {
                    network.webhooks.push(s);
                    indicators.push({
                        category: "WEBHOOK_EXFILTRATION",
                        severity: "CRITICAL",
                        description: "Discord / Telegram Webhook Exfiltration Endpoint",
                        weight: 40,
                        sample: s
                    });
                }
            }

            // URLs
            if (URL_REGEX.test(s)) {
                if (!network.urls.includes(s) && network.urls.length < 20) {
                    network.urls.push(s);
                }
            }

            // IPs
            const ipMatch = s.match(IP_REGEX);
            if (ipMatch) {
                const ip = ipMatch[0];
                if (!ip.startsWith("127.") && !ip.startsWith("0.") && !network.ips.includes(ip) && network.ips.length < 20) {
                    network.ips.push(ip);
                }
            }

            // Command execution
            for (const item of COMMAND_KEYWORDS) {
                if (sLower.includes(item.key)) {
                    if (!commands.includes(s) && commands.length < 15) {
                        commands.push(s);
                        indicators.push({
                            category: "SUSPICIOUS_COMMAND",
                            severity: "HIGH",
                            description: item.label,
                            weight: item.weight,
                            sample: s
                        });
                    }
                    break;
                }
            }

            // Evasion / Anti-analysis
            for (const item of EVASION_KEYWORDS) {
                if (sLower.includes(item.key)) {
                    if (!evasion.includes(s) && evasion.length < 15) {
                        evasion.push(s);
                        indicators.push({
                            category: "DEFENSE_EVASION_STRING",
                            severity: "HIGH",
                            description: item.label,
                            weight: item.weight,
                            sample: s
                        });
                    }
                    break;
                }
            }

            // Persistence strings
            for (const item of PERSISTENCE_KEYWORDS) {
                if (sLower.includes(item.key)) {
                    if (!persistence.includes(s) && persistence.length < 15) {
                        persistence.push(s);
                        indicators.push({
                            category: "PERSISTENCE_STRING",
                            severity: "MEDIUM",
                            description: item.label,
                            weight: item.weight,
                            sample: s
                        });
                    }
                    break;
                }
            }
        }

        // Score based on threat strings
        let stringScore = 0;
        if (network.webhooks.length > 0) stringScore += 40;
        for (const ind of indicators) {
            stringScore += (ind.weight || 15);
        }

        return {
            totalExtracted: strings.length,
            sampleStrings: strings.slice(0, 100),
            indicators,
            network,
            commands,
            persistence,
            evasion,
            stringThreatScore: Math.min(100, stringScore)
        };
    }
}

module.exports = StringExtractor;
