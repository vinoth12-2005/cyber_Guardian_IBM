const UnifiedSecurityEvent = require("./UnifiedSecurityEvent");

/**
 * EventNormalizer
 * ─────────────────────────────────────────────────────────────
 * Normalizes raw platform and collector structures into standard UnifiedSecurityEvent objects.
 */
class EventNormalizer {

    /**
     * Normalize process event
     */
    static normalizeProcess(raw, eventType = UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED) {
        const severity = raw.severity || (raw.suspicious ? UnifiedSecurityEvent.SEVERITIES.HIGH : UnifiedSecurityEvent.SEVERITIES.INFO);
        return new UnifiedSecurityEvent({
            sensor: "process_sensor",
            event_type: eventType,
            severity,
            confidence: raw.confidence || 0.85,
            process: {
                pid: String(raw.pid || raw.ProcessId || "0"),
                ppid: String(raw.ppid || raw.parentPid || raw.ParentProcessId || "0"),
                name: raw.name || raw.image || raw.ProcessName || "",
                exe_path: raw.exePath || raw.ExecutablePath || raw.path || "",
                cmd_line: raw.cmdLine || raw.CommandLine || raw.args || "",
                user: raw.user || "",
                cpu: raw.cpu || 0,
                mem: raw.mem || raw.memoryRaw || ""
            },
            evidence: raw.evidence || (raw.reason ? [{ reason: raw.reason }] : []),
            mitre: raw.mitre || [],
            is_demo: !!raw.is_demo
        });
    }

    /**
     * Normalize network connection event
     */
    static normalizeNetwork(raw, eventType = UnifiedSecurityEvent.EVENT_TYPES.NETWORK_CONNECTION) {
        return new UnifiedSecurityEvent({
            sensor: "network_sensor",
            event_type: eventType,
            severity: raw.severity || UnifiedSecurityEvent.SEVERITIES.INFO,
            confidence: raw.confidence || 0.85,
            process: {
                pid: String(raw.pid || "0"),
                name: raw.processName || raw.image || ""
            },
            network: {
                protocol: (raw.protocol || "tcp").toUpperCase(),
                local_ip: raw.localAddr || raw.local_addr || "",
                local_port: String(raw.localPort || raw.local_port || ""),
                remote_ip: raw.remoteAddr || raw.remote_addr || "",
                remote_port: String(raw.remotePort || raw.remote_port || ""),
                state: raw.state || "ESTABLISHED",
                domain: raw.domain || raw.hostname || ""
            },
            evidence: raw.evidence || [],
            mitre: raw.mitre || [],
            is_demo: !!raw.is_demo
        });
    }

    /**
     * Normalize filesystem event
     */
    static normalizeFile(raw, action = "CREATED") {
        const actionMap = {
            "CREATED": UnifiedSecurityEvent.EVENT_TYPES.FILE_CREATED,
            "MODIFIED": UnifiedSecurityEvent.EVENT_TYPES.FILE_MODIFIED,
            "DELETED": UnifiedSecurityEvent.EVENT_TYPES.FILE_DELETED,
            "RENAMED": UnifiedSecurityEvent.EVENT_TYPES.FILE_RENAMED
        };
        const eventType = actionMap[action.toUpperCase()] || UnifiedSecurityEvent.EVENT_TYPES.FILE_MODIFIED;

        const fileObj = raw.file || raw;
        return new UnifiedSecurityEvent({
            sensor: "filesystem_sensor",
            event_type: eventType,
            severity: raw.severity || UnifiedSecurityEvent.SEVERITIES.INFO,
            confidence: raw.confidence || 0.9,
            file: {
                path: fileObj.filePath || fileObj.path || "",
                name: fileObj.fileName || fileObj.name || "",
                size: fileObj.size || fileObj.fileSize || 0,
                hash: fileObj.hash || fileObj.sha256 || "",
                extension: fileObj.extension || (fileObj.name ? require("path").extname(fileObj.name) : ""),
                action: action.toUpperCase()
            },
            evidence: raw.evidence || [],
            mitre: raw.mitre || [],
            is_demo: !!raw.is_demo
        });
    }

    /**
     * Normalize persistence event
     */
    static normalizePersistence(raw, eventType = UnifiedSecurityEvent.EVENT_TYPES.PERSISTENCE_CREATED) {
        return new UnifiedSecurityEvent({
            sensor: "persistence_sensor",
            event_type: eventType,
            severity: raw.severity || UnifiedSecurityEvent.SEVERITIES.MEDIUM,
            confidence: raw.confidence || 0.9,
            persistence: {
                type: raw.type || raw.category || "startup",
                location: raw.location || raw.keyPath || "",
                key: raw.valueName || raw.name || "",
                target: raw.data || raw.command || raw.path || ""
            },
            evidence: raw.evidence || [{ location: raw.location || raw.keyPath, target: raw.data || raw.command }],
            mitre: raw.mitre || ["T1547"],
            is_demo: !!raw.is_demo
        });
    }

    /**
     * Normalize URL detection event
     */
    static normalizeURL(raw) {
        return new UnifiedSecurityEvent({
            sensor: "browser_sensor",
            event_type: UnifiedSecurityEvent.EVENT_TYPES.URL_DETECTED,
            severity: (raw.riskLevel || "info").toLowerCase(),
            confidence: (raw.confidence ? raw.confidence / 100 : 0.85),
            url: {
                raw_url: raw.url || "",
                domain: raw.domain || "",
                protocol: raw.protocol || "https",
                risk_score: raw.score || 0
            },
            evidence: (raw.warnings || []).map(w => ({ warning: w })),
            mitre: raw.mitre || ["T1566.002"],
            is_demo: !!raw.is_demo
        });
    }

    /**
     * Normalize Screen event
     */
    static normalizeScreen(raw) {
        return new UnifiedSecurityEvent({
            sensor: "screen_sensor",
            event_type: UnifiedSecurityEvent.EVENT_TYPES.SCREEN_EVENT,
            severity: raw.warnings && raw.warnings.length > 0 ? UnifiedSecurityEvent.SEVERITIES.MEDIUM : UnifiedSecurityEvent.SEVERITIES.INFO,
            confidence: 0.8,
            url: {
                raw_url: raw.visibleUrl || ""
            },
            evidence: (raw.warnings || []).map(w => ({ warning: w })),
            mitre: raw.mitre || ["T1185"],
            is_demo: !!raw.is_demo
        });
    }
}

module.exports = EventNormalizer;
