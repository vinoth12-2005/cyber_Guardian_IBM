/**
 * AttackStoryGenerator
 * ─────────────────────────────────────────────────────────────
 * Produces structured, chronological narrative summaries from real event evidence.
 * Strictly grounded: never invents fake processes, hashes, or timestamps.
 */
class AttackStoryGenerator {

    /**
     * Generate attack story from an array of UnifiedSecurityEvents.
     * @param {Array<object>} events - Ordered chronological security events
     * @param {object} incidentMeta - Incident metadata
     * @returns {object} { summary, timeline, mitreTactics, narrative }
     */
    static generate(events = [], incidentMeta = {}) {
        if (!events || events.length === 0) {
            return {
                summary: "No attack activity observed.",
                timeline: [],
                mitreTactics: [],
                narrative: "No security events recorded in this incident window."
            };
        }

        // Sort chronologically
        const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const timeline = [];
        const mitreSet = new Set();
        const narrativeLines = [];

        narrativeLines.push(`### Incident Attack Story: ${incidentMeta.title || "Multi-Stage Threat Incident"}`);
        narrativeLines.push(`**Host:** ${sorted[0].host_id || "Local System"} | **Initial Detection:** ${sorted[0].timestamp}\n`);

        let stepNumber = 1;

        for (const e of sorted) {
            const timeFormatted = new Date(e.timestamp).toLocaleTimeString();
            let stepDescription = "";

            if (e.mitre) {
                e.mitre.forEach(m => mitreSet.add(m));
            }

            switch (e.event_type) {
                case "url_detected":
                case "browser_event":
                    stepDescription = `User visited URL \`${e.url?.raw_url || e.url?.domain}\` (Risk: ${e.url?.risk_score || "N/A"}/100)`;
                    break;

                case "file_created":
                    stepDescription = `File \`${e.file?.name}\` dropped at \`${e.file?.path}\` (SHA-256: \`${e.file?.hash ? e.file.hash.slice(0, 16) + "..." : "Pending"}\`)`;
                    break;

                case "file_modified":
                    stepDescription = `File \`${e.file?.name}\` was modified in directory \`${e.file?.path}\``;
                    break;

                case "process_started":
                    stepDescription = `Process \`${e.process?.name}\` (PID ${e.process?.pid}) launched with command line: \`${e.process?.cmd_line || e.process?.name}\``;
                    break;

                case "network_connection":
                    stepDescription = `Process \`${e.process?.name || "PID " + e.process?.pid}\` established outbound socket to \`${e.network?.remote_ip}:${e.network?.remote_port}\` (${e.network?.protocol || "TCP"})`;
                    break;

                case "persistence_created":
                    stepDescription = `Persistence mechanism created at \`${e.persistence?.location}\` targeting \`${e.persistence?.target}\``;
                    break;

                case "yara_match":
                    stepDescription = `YARA rule \`${e.evidence?.[0]?.rule || "Custom Rule"}\` matched file \`${e.file?.name || e.file?.path}\``;
                    break;

                case "canary_triggered":
                    stepDescription = `Decoy canary tripwire \`${e.file?.name}\` was tampered with (potential ransomware indicator)`;
                    break;

                default:
                    stepDescription = `Security event \`${e.event_type}\` triggered with severity ${e.severity.toUpperCase()}`;
                    break;
            }

            timeline.push({
                step: stepNumber,
                time: timeFormatted,
                timestamp: e.timestamp,
                eventType: e.event_type,
                severity: e.severity,
                description: stepDescription
            });

            narrativeLines.push(`${stepNumber}. **[${timeFormatted}]** ${stepDescription}`);
            stepNumber++;
        }

        const summary = `Observed a ${timeline.length}-step multi-stage attack lifecycle spanning ${sorted[0].sensor} to ${sorted[sorted.length - 1].sensor}.`;

        return {
            summary,
            timeline,
            mitreTactics: Array.from(mitreSet),
            narrative: narrativeLines.join("\n")
        };
    }
}

module.exports = AttackStoryGenerator;
