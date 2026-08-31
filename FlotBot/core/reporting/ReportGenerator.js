const fs = require("fs");
const path = require("path");

/**
 * ReportGenerator
 * ─────────────────────────────────────────────────────────────
 * Generates enterprise-ready JSON, CSV, and HTML security reports
 * with MITRE ATT&CK mappings, attack stories, and evidence matrices.
 */
class ReportGenerator {

    /**
     * Generate HTML Incident Report
     * @param {object} incident - Correlated Incident object
     * @returns {string} Complete standalone HTML document
     */
    static generateHTML(incident) {
        const title = incident.title || "FloatBot Incident Investigation Report";
        const severity = (incident.severity || "HIGH").toUpperCase();
        const score = incident.risk_score || 0;
        const confidence = Math.round((incident.confidence || 0.8) * 100);
        const story = incident.attack_story || {};
        const events = incident.events || [];

        const sevColor = severity === "CRITICAL" ? "#ef4444" : severity === "HIGH" ? "#f97316" : severity === "MEDIUM" ? "#f59e0b" : "#3b82f6";

        const timelineHtml = (story.timeline || []).map(t => `
            <div class="timeline-step">
                <div class="step-badge">${t.step}</div>
                <div class="step-content">
                    <div class="step-meta"><strong>${t.time}</strong> • <em>${t.eventType}</em> • <span class="sev-tag ${t.severity}">${t.severity.toUpperCase()}</span></div>
                    <div class="step-desc">${t.description}</div>
                </div>
            </div>
        `).join("");

        const mitreHtml = (story.mitreTactics || []).map(m => `<span class="mitre-tag">${m}</span>`).join(" ");

        const evidenceRows = events.map((e, idx) => `
            <tr>
                <td>#${idx + 1}</td>
                <td>${e.timestamp}</td>
                <td>${e.sensor}</td>
                <td>${e.event_type}</td>
                <td><span class="sev-tag ${e.severity}">${e.severity.toUpperCase()}</span></td>
                <td><code>${JSON.stringify(e.process || e.file || e.network || e.url || {})}</code></td>
            </tr>
        `).join("");

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b1329; color: #f1f5f9; padding: 40px; margin: 0; }
        .container { max-width: 960px; margin: 0 auto; background: #111e38; border-radius: 12px; border: 1px solid #1e293b; padding: 36px; }
        .header { border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
        h1 { margin: 0 0 8px 0; font-size: 24px; color: #ffffff; }
        .subtitle { color: #94a3b8; font-size: 13px; }
        .score-box { background: rgba(0,0,0,0.3); border: 2px solid ${sevColor}; border-radius: 8px; padding: 16px 24px; text-align: center; }
        .score-val { font-size: 32px; font-weight: bold; color: ${sevColor}; }
        .score-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; }
        .grid-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .card { background: #0d172e; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; }
        .card-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .card-val { font-size: 16px; font-weight: 600; color: #e2e8f0; }
        h2 { font-size: 18px; color: #38bdf8; margin: 28px 0 14px 0; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
        .timeline-step { display: flex; gap: 14px; margin-bottom: 16px; align-items: flex-start; }
        .step-badge { background: #0284c7; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px; }
        .step-content { background: #091124; padding: 12px 16px; border-radius: 8px; border: 1px solid #1e293b; flex: 1; }
        .step-meta { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
        .step-desc { font-size: 13px; color: #f8fafc; }
        .sev-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .sev-tag.critical { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .sev-tag.high { background: rgba(249, 115, 22, 0.2); color: #f97316; }
        .sev-tag.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .sev-tag.low, .sev-tag.info { background: rgba(59, 130, 246, 0.2); color: #38bdf8; }
        .mitre-tag { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
        th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #1e293b; }
        th { background: #091124; color: #94a3b8; font-weight: 600; }
        code { background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #38bdf8; word-break: break-all; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; color: #475569; font-size: 11px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>🛡️ ${title}</h1>
                <div class="subtitle">Generated by FloatBot AI Endpoint Security Platform • Host: ${incident.host_id || "Localhost"}</div>
            </div>
            <div class="score-box">
                <div class="score-val">${score}</div>
                <div class="score-label">${severity} RISK (${confidence}% CONF)</div>
            </div>
        </div>

        <div class="grid-stats">
            <div class="card">
                <div class="card-label">Incident ID</div>
                <div class="card-val">${incident.incident_id || "INC-LOCAL"}</div>
            </div>
            <div class="card">
                <div class="card-label">Detection Timestamp</div>
                <div class="card-val">${incident.created_at || new Date().toISOString()}</div>
            </div>
            <div class="card">
                <div class="card-label">Correlated Events</div>
                <div class="card-val">${events.length} Telemetry Events</div>
            </div>
        </div>

        <h2>ATT&CK Framework Alignment</h2>
        <div style="margin-bottom: 20px;">
            ${mitreHtml || "<span style='color:#64748b'>No specific MITRE ATT&CK techniques mapped.</span>"}
        </div>

        <h2>Attack Story & Chronological Timeline</h2>
        <div class="timeline-container">
            ${timelineHtml}
        </div>

        <h2>Raw Security Evidence</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>Sensor</th>
                    <th>Event Type</th>
                    <th>Severity</th>
                    <th>Telemetry Evidence</th>
                </tr>
            </thead>
            <tbody>
                ${evidenceRows}
            </tbody>
        </table>

        <div class="footer">
            FloatBot AI Real-Time Endpoint Detection & Response Report • Strictly Grounded Evidence
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Generate JSON Report
     */
    static generateJSON(incident) {
        return JSON.stringify(incident, null, 2);
    }

    /**
     * Generate CSV summary of events
     */
    static generateCSV(incident) {
        const events = incident.events || [];
        const header = "timestamp,sensor,event_type,severity,pid,file_path,remote_ip\n";
        const rows = events.map(e => {
            const pid = e.process?.pid || "";
            const filePath = `"${(e.file?.path || "").replace(/"/g, '""')}"`;
            const remoteIp = e.network?.remote_ip || "";
            return `${e.timestamp},${e.sensor},${e.event_type},${e.severity},${pid},${filePath},${remoteIp}`;
        }).join("\n");
        return header + rows;
    }
}

module.exports = ReportGenerator;
