const crypto = require("crypto");
const UnifiedSecurityEvent = require("../events/UnifiedSecurityEvent");

/**
 * DemoSimulator
 * ─────────────────────────────────────────────────────────────
 * Safe synthetic attack scenarios for product demonstration.
 * Never executes real malware or destructive commands.
 * All telemetry events are strictly tagged with is_demo: true and [DEMO MODE].
 */
class DemoSimulator {

    static SCENARIOS = {
        PHISHING_TO_C2: "phishing_to_c2",
        LOLBIN_EXECUTION: "lolbin_execution",
        RANSOMWARE_BURST: "ransomware_burst"
    };

    /**
     * Generate synthetic attack scenario events.
     * @param {string} scenarioName
     * @returns {Array<UnifiedSecurityEvent>}
     */
    static generateScenario(scenarioName = DemoSimulator.SCENARIOS.PHISHING_TO_C2) {
        const baseTime = Date.now();
        const events = [];

        if (scenarioName === DemoSimulator.SCENARIOS.PHISHING_TO_C2) {
            // Step 1: User visits Phishing URL
            events.push(new UnifiedSecurityEvent({
                timestamp: new Date(baseTime).toISOString(),
                sensor: "browser_sensor",
                event_type: UnifiedSecurityEvent.EVENT_TYPES.URL_DETECTED,
                severity: "high",
                confidence: 0.95,
                url: {
                    raw_url: "http://micros0ft-security-auth.top/login/update.php",
                    domain: "micros0ft-security-auth.top",
                    protocol: "http",
                    risk_score: 92
                },
                evidence: [{ warning: "[DEMO MODE] Brand lookalike phishing domain targeting Microsoft authentication." }],
                mitre: ["T1566.002"],
                is_demo: true
            }));

            // Step 2: Malicious file dropped in Downloads
            events.push(new UnifiedSecurityEvent({
                timestamp: new Date(baseTime + 4000).toISOString(),
                sensor: "filesystem_sensor",
                event_type: UnifiedSecurityEvent.EVENT_TYPES.FILE_CREATED,
                severity: "high",
                confidence: 0.9,
                file: {
                    path: "/home/user/Downloads/SecUpdate_Invoice.pdf.exe",
                    name: "SecUpdate_Invoice.pdf.exe",
                    size: 245760,
                    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    extension: ".exe",
                    action: "CREATED"
                },
                evidence: [{ reason: "[DEMO MODE] Executable disguised with double-extension (.pdf.exe)" }],
                mitre: ["T1036.007"],
                is_demo: true
            }));

            // Step 3: Process execution
            events.push(new UnifiedSecurityEvent({
                timestamp: new Date(baseTime + 7000).toISOString(),
                sensor: "process_sensor",
                event_type: UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED,
                severity: "high",
                confidence: 0.95,
                process: {
                    pid: "9182",
                    ppid: "1024",
                    name: "SecUpdate_Invoice.pdf.exe",
                    exe_path: "/home/user/Downloads/SecUpdate_Invoice.pdf.exe",
                    cmd_line: "./SecUpdate_Invoice.pdf.exe --silent",
                    user: "demouser"
                },
                evidence: [{ reason: "[DEMO MODE] Execution of unverified downloaded binary" }],
                mitre: ["T1204.002"],
                is_demo: true
            }));

            // Step 4: C2 Outbound Socket Connection
            events.push(new UnifiedSecurityEvent({
                timestamp: new Date(baseTime + 11000).toISOString(),
                sensor: "network_sensor",
                event_type: UnifiedSecurityEvent.EVENT_TYPES.NETWORK_CONNECTION,
                severity: "critical",
                confidence: 0.96,
                process: {
                    pid: "9182",
                    name: "SecUpdate_Invoice.pdf.exe"
                },
                network: {
                    protocol: "TCP",
                    local_ip: "192.168.1.105",
                    local_port: "49182",
                    remote_ip: "198.51.100.42",
                    remote_port: "4444",
                    state: "ESTABLISHED",
                    domain: "c2.darknetwork.top"
                },
                evidence: [{ reason: "[DEMO MODE] Interactive reverse shell communication with C2 server" }],
                mitre: ["T1071.001", "T1059"],
                is_demo: true
            }));

            // Step 5: Persistence created
            events.push(new UnifiedSecurityEvent({
                timestamp: new Date(baseTime + 15000).toISOString(),
                sensor: "persistence_sensor",
                event_type: UnifiedSecurityEvent.EVENT_TYPES.PERSISTENCE_CREATED,
                severity: "high",
                confidence: 0.92,
                persistence: {
                    type: "Startup Autostart",
                    location: "~/.config/autostart/security_update.desktop",
                    key: "security_update",
                    target: "/home/user/Downloads/SecUpdate_Invoice.pdf.exe"
                },
                evidence: [{ reason: "[DEMO MODE] Auto-launch persistence established" }],
                mitre: ["T1547"],
                is_demo: true
            }));

        } else if (scenarioName === DemoSimulator.SCENARIOS.RANSOMWARE_BURST) {
            // Canary tripwire & mass encryption indicators
            events.push(new UnifiedSecurityEvent({
                timestamp: new Date(baseTime).toISOString(),
                sensor: "filesystem_sensor",
                event_type: UnifiedSecurityEvent.EVENT_TYPES.CANARY_TRIGGERED,
                severity: "critical",
                confidence: 0.98,
                file: {
                    path: "~/.flotbot/canaries/financial_forecast_2026.docx",
                    name: "financial_forecast_2026.docx",
                    action: "MODIFIED"
                },
                evidence: [{ reason: "[DEMO MODE] Decoy Canary Tripwire file modified by rogue process" }],
                mitre: ["T1486"],
                is_demo: true
            }));

            events.push(new UnifiedSecurityEvent({
                timestamp: new Date(baseTime + 2000).toISOString(),
                sensor: "process_sensor",
                event_type: UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED,
                severity: "critical",
                confidence: 0.99,
                process: {
                    pid: "4820",
                    name: "vssadmin.exe",
                    cmd_line: "vssadmin.exe delete shadows /all /quiet",
                    user: "SYSTEM"
                },
                evidence: [{ reason: "[DEMO MODE] Volume Shadow Copy backup deletion attempt" }],
                mitre: ["T1490"],
                is_demo: true
            }));
        }

        return events;
    }
}

module.exports = DemoSimulator;
