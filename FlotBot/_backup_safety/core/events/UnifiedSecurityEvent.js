const crypto = require("crypto");
const os = require("os");

/**
 * UnifiedSecurityEvent
 * ─────────────────────────────────────────────────────────────
 * Universal normalized security event schema for all FloatBot sensors.
 *
 * Schema:
 * {
 *   event_id: string (UUID),
 *   timestamp: string (ISO8601),
 *   host_id: string,
 *   os: "windows" | "macos" | "linux",
 *   sensor: string,
 *   event_type: string,
 *   severity: "info" | "low" | "medium" | "high" | "critical",
 *   confidence: number (0.0 - 1.0),
 *   process: { pid, ppid, name, exe_path, cmd_line, user, hash },
 *   file: { path, name, size, hash, extension, action },
 *   network: { protocol, local_ip, local_port, remote_ip, remote_port, state, domain },
 *   url: { raw_url, domain, protocol, risk_score },
 *   user: { username, privilege_level },
 *   persistence: { type, location, key, target },
 *   evidence: Array<object>,
 *   tags: Array<string>,
 *   is_demo: boolean
 * }
 */
class UnifiedSecurityEvent {

    static EVENT_TYPES = {
        FILE_CREATED: "file_created",
        FILE_MODIFIED: "file_modified",
        FILE_DELETED: "file_deleted",
        FILE_RENAMED: "file_renamed",
        PROCESS_STARTED: "process_started",
        PROCESS_STOPPED: "process_stopped",
        PROCESS_CHILD_CREATED: "process_child_created",
        NETWORK_CONNECTION: "network_connection",
        DNS_QUERY: "dns_query",
        URL_DETECTED: "url_detected",
        BROWSER_EVENT: "browser_event",
        SCREEN_EVENT: "screen_event",
        OCR_EVENT: "ocr_event",
        PERSISTENCE_CREATED: "persistence_created",
        PERSISTENCE_REMOVED: "persistence_removed",
        YARA_MATCH: "yara_match",
        HASH_REPUTATION: "hash_reputation",
        THREAT_INTEL_MATCH: "threat_intel_match",
        AUTHENTICATION_EVENT: "authentication_event",
        SECURITY_EVENT: "security_event",
        INCIDENT_CREATED: "incident_created",
        RESPONSE_ACTION: "response_action",
        RANSOMWARE_SUSPECTED: "ransomware_suspected",
        CANARY_TRIGGERED: "canary_triggered"
    };

    static SEVERITIES = {
        INFO: "info",
        LOW: "low",
        MEDIUM: "medium",
        HIGH: "high",
        CRITICAL: "critical"
    };

    constructor(data = {}) {
        this.event_id   = data.event_id   || crypto.randomUUID();
        this.timestamp  = data.timestamp  || new Date().toISOString();
        this.host_id    = data.host_id    || os.hostname();
        this.os         = data.os         || (process.platform === "win32" ? "windows" : process.platform === "darwin" ? "macos" : "linux");
        this.sensor     = data.sensor     || "system";
        this.event_type = data.event_type || UnifiedSecurityEvent.EVENT_TYPES.SECURITY_EVENT;
        this.severity   = (data.severity  || UnifiedSecurityEvent.SEVERITIES.INFO).toLowerCase();
        this.confidence = typeof data.confidence === "number" ? Math.min(1.0, Math.max(0.0, data.confidence)) : 0.8;

        this.process     = data.process     || {};
        this.file        = data.file        || {};
        this.network     = data.network     || {};
        this.url         = data.url         || {};
        this.user        = data.user        || { username: os.userInfo().username, privilege_level: process.getuid && process.getuid() === 0 ? "root" : "user" };
        this.persistence = data.persistence || {};
        this.evidence    = Array.isArray(data.evidence) ? data.evidence : (data.evidence ? [data.evidence] : []);
        this.tags        = Array.isArray(data.tags) ? data.tags : [];
        this.mitre       = Array.isArray(data.mitre) ? data.mitre : [];
        this.is_demo     = !!data.is_demo;
    }

    addEvidence(item) {
        if (item) this.evidence.push(item);
        return this;
    }

    addTag(tag) {
        if (tag && !this.tags.includes(tag)) this.tags.push(tag);
        return this;
    }

    addMitre(techniqueId) {
        if (techniqueId && !this.mitre.includes(techniqueId)) this.mitre.push(techniqueId);
        return this;
    }

    toJSON() {
        return {
            event_id:   this.event_id,
            timestamp:  this.timestamp,
            host_id:    this.host_id,
            os:         this.os,
            sensor:     this.sensor,
            event_type: this.event_type,
            severity:   this.severity,
            confidence: this.confidence,
            process:    this.process,
            file:       this.file,
            network:    this.network,
            url:        this.url,
            user:       this.user,
            persistence:this.persistence,
            evidence:   this.evidence,
            tags:       this.tags,
            mitre:      this.mitre,
            is_demo:    this.is_demo
        };
    }
}

module.exports = UnifiedSecurityEvent;
