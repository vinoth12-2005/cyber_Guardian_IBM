const crypto = require("crypto");
const ThreatGraph = require("./ThreatGraph");
const AttackStoryGenerator = require("./AttackStoryGenerator");
const RiskEngine = require("../risk/RiskEngine");

/**
 * CorrelationEngine
 * ─────────────────────────────────────────────────────────────
 * Aggregates multi-sensor security events into unified, contextual Incidents.
 * Correlates via:
 *   - Process PID / lineage
 *   - File paths and SHA-256 hashes
 *   - Network destination IPs and domains
 *   - Time proximity window
 */
class CorrelationEngine {

    constructor(options = {}) {
        this.windowMs = options.windowMs || 60_000;
        this.activeIncidents = new Map(); // incidentId -> Incident
        this.eventToIncident = new Map(); // eventId -> incidentId
    }

    /**
     * Ingest and correlate a new event into existing or new Incident.
     * @param {UnifiedSecurityEvent|object} event
     * @returns {object} { incident, isNew }
     */
    ingest(event) {
        if (!event) return null;

        // 1. Find matching active incident
        let matchedIncident = null;

        for (const [id, inc] of this.activeIncidents.entries()) {
            if (this._isEventRelated(inc, event)) {
                matchedIncident = inc;
                break;
            }
        }

        // 2. Create new Incident if no active correlation found
        let isNew = false;
        if (!matchedIncident) {
            isNew = true;
            const incId = `INC-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
            matchedIncident = {
                incident_id: incId,
                title: this._deriveTitle(event),
                created_at: event.timestamp || new Date().toISOString(),
                updated_at: event.timestamp || new Date().toISOString(),
                events: [],
                status: "OPEN",
                host_id: event.host_id || "local-host",
                pids: new Set(),
                hashes: new Set(),
                ips: new Set(),
                domains: new Set()
            };
            this.activeIncidents.set(incId, matchedIncident);
        }

        // 3. Attach event to incident
        matchedIncident.events.push(event);
        matchedIncident.updated_at = new Date().toISOString();
        this.eventToIncident.set(event.event_id, matchedIncident.incident_id);

        if (event.process?.pid) matchedIncident.pids.add(String(event.process.pid));
        if (event.file?.hash) matchedIncident.hashes.add(event.file.hash.toLowerCase());
        if (event.network?.remote_ip) matchedIncident.ips.add(event.network.remote_ip);
        if (event.url?.domain) matchedIncident.domains.add(event.url.domain.toLowerCase());

        // 4. Re-calculate risk score, threat graph, and attack story
        const risk = RiskEngine.calculate(matchedIncident.events);
        matchedIncident.severity = risk.tier;
        matchedIncident.risk_score = risk.riskScore;
        matchedIncident.confidence = risk.confidence;

        // Build Graph & Story
        const graph = new ThreatGraph();
        matchedIncident.threat_graph = graph.buildFromEvents(matchedIncident.events);
        matchedIncident.attack_story = AttackStoryGenerator.generate(matchedIncident.events, { title: matchedIncident.title });

        return { incident: this._serializeIncident(matchedIncident), isNew };
    }

    _isEventRelated(incident, event) {
        const timeDiff = Math.abs(new Date(event.timestamp).getTime() - new Date(incident.updated_at).getTime());
        if (timeDiff > this.windowMs) return false;

        // Check common PID
        if (event.process?.pid && incident.pids.has(String(event.process.pid))) return true;
        // Check common Hash
        if (event.file?.hash && incident.hashes.has(event.file.hash.toLowerCase())) return true;
        // Check common IP
        if (event.network?.remote_ip && incident.ips.has(event.network.remote_ip)) return true;
        // Check common Domain
        if (event.url?.domain && incident.domains.has(event.url.domain.toLowerCase())) return true;

        return false;
    }

    _deriveTitle(firstEvent) {
        if (firstEvent.event_type === "url_detected") return `Suspicious Web Activity: ${firstEvent.url?.domain || "Unknown Domain"}`;
        if (firstEvent.event_type === "process_started") return `Suspicious Process Execution: ${firstEvent.process?.name || "Process"}`;
        if (firstEvent.event_type === "file_created") return `Suspicious File Drop: ${firstEvent.file?.name || "File"}`;
        if (firstEvent.event_type === "persistence_created") return `Startup Persistence Installed`;
        return `Security Threat Incident on ${firstEvent.host_id || "Endpoint"}`;
    }

    _serializeIncident(inc) {
        return {
            incident_id: inc.incident_id,
            title: inc.title,
            severity: inc.severity,
            risk_score: inc.risk_score,
            confidence: inc.confidence,
            created_at: inc.created_at,
            updated_at: inc.updated_at,
            status: inc.status,
            host_id: inc.host_id,
            event_count: inc.events.length,
            events: inc.events,
            threat_graph: inc.threat_graph,
            attack_story: inc.attack_story
        };
    }

    getIncidents() {
        return Array.from(this.activeIncidents.values()).map(inc => this._serializeIncident(inc));
    }

    clear() {
        this.activeIncidents.clear();
        this.eventToIncident.clear();
    }
}

module.exports = CorrelationEngine;
