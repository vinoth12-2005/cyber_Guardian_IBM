/**
 * schema.js
 * Creates all FlotBot database tables if they don't exist.
 * Call initSchema(db) after connecting.
 */

const TABLES = [

    // ── Alerts ──────────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS alerts (
        id              TEXT PRIMARY KEY,
        timestamp       TEXT NOT NULL,
        title           TEXT NOT NULL,
        severity        TEXT NOT NULL,
        category        TEXT NOT NULL,
        source          TEXT NOT NULL,
        description     TEXT,
        recommendation  TEXT,
        evidence        TEXT,
        mitre           TEXT,
        acknowledged    INTEGER DEFAULT 0,
        acknowledged_at TEXT
    )`,

    // ── Unified Security Events ──────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS unified_events (
        event_id        TEXT PRIMARY KEY,
        timestamp       TEXT NOT NULL,
        host_id         TEXT NOT NULL,
        os              TEXT NOT NULL,
        sensor          TEXT NOT NULL,
        event_type      TEXT NOT NULL,
        severity        TEXT NOT NULL,
        confidence      REAL NOT NULL,
        process_json    TEXT,
        file_json       TEXT,
        network_json    TEXT,
        url_json        TEXT,
        user_json       TEXT,
        persistence_json TEXT,
        evidence_json   TEXT,
        tags_json       TEXT,
        is_demo         INTEGER DEFAULT 0
    )`,

    // ── Correlated Incidents ─────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS incidents (
        incident_id     TEXT PRIMARY KEY,
        title           TEXT NOT NULL,
        severity        TEXT NOT NULL,
        risk_score      INTEGER NOT NULL,
        confidence      REAL NOT NULL,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL,
        status          TEXT NOT NULL,
        host_id         TEXT NOT NULL,
        event_count     INTEGER DEFAULT 0,
        threat_graph    TEXT,
        attack_story    TEXT
    )`,

    // ── YARA Matches ─────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS yara_matches (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp       TEXT NOT NULL,
        rule_name       TEXT NOT NULL,
        severity        TEXT NOT NULL,
        file_path       TEXT NOT NULL,
        matched_strings TEXT,
        mitre           TEXT
    )`,

    // ── Threat Intel Cache ───────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS threat_intel_cache (
        indicator       TEXT PRIMARY KEY,
        type            TEXT NOT NULL,
        provider        TEXT NOT NULL,
        verdict         TEXT NOT NULL,
        threat_level    TEXT,
        cached_at       TEXT NOT NULL,
        ttl_ms          INTEGER NOT NULL,
        raw_json        TEXT
    )`,

    // ── Tamper-Evident Audit Logs ────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id              TEXT PRIMARY KEY,
        timestamp       TEXT NOT NULL,
        action_type     TEXT NOT NULL,
        risk_category   TEXT NOT NULL,
        reason          TEXT,
        user_approved   INTEGER DEFAULT 0,
        initiated_by    TEXT,
        status          TEXT NOT NULL,
        details_json    TEXT,
        signature_hash  TEXT
    )`,

    // ── Canary Records ───────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS canary_records (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name       TEXT NOT NULL,
        file_path       TEXT NOT NULL,
        deployed_at     TEXT NOT NULL,
        status          TEXT NOT NULL,
        tripped_at      TEXT,
        trip_reason     TEXT
    )`,

    // ── Process Logs ─────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS process_logs (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp   TEXT NOT NULL,
        pid         TEXT NOT NULL,
        image       TEXT,
        cmd_line    TEXT,
        parent_pid  TEXT,
        exe_path    TEXT,
        memory_raw  TEXT,
        session     TEXT
    )`,

    // ── Network Logs ─────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS network_logs (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp     TEXT NOT NULL,
        pid           TEXT,
        protocol      TEXT,
        local_addr    TEXT,
        local_port    TEXT,
        remote_addr   TEXT,
        remote_port   TEXT,
        state         TEXT
    )`,

    // ── Registry Logs ────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS registry_logs (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp   TEXT NOT NULL,
        key_path    TEXT NOT NULL,
        value_name  TEXT,
        old_value   TEXT,
        new_value   TEXT,
        action      TEXT
    )`,

    // ── File Activity Logs ───────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS file_logs (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp   TEXT NOT NULL,
        file_path   TEXT NOT NULL,
        action      TEXT NOT NULL,
        file_size   INTEGER,
        file_hash   TEXT,
        extension   TEXT
    )`,

    // ── Application Settings ─────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS settings (
        key         TEXT PRIMARY KEY,
        value       TEXT NOT NULL,
        updated_at  TEXT
    )`,

    // ── Whitelist / Safe Items ───────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS whitelist (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        type        TEXT NOT NULL,
        value       TEXT NOT NULL UNIQUE,
        created_at  TEXT NOT NULL,
        reason      TEXT
    )`,

    // ── Baseline Records (Learning Mode) ─────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS baseline_records (
        id                 INTEGER PRIMARY KEY AUTOINCREMENT,
        type               TEXT NOT NULL,
        value              TEXT NOT NULL UNIQUE,
        first_seen         TEXT NOT NULL,
        last_seen          TEXT NOT NULL,
        observation_count  INTEGER DEFAULT 1,
        approved           INTEGER DEFAULT 0
    )`,

    // ── Alert History (Full Telemetry + Transcripts) ──────────────────────────
    `CREATE TABLE IF NOT EXISTS alert_history (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        alert_id         TEXT NOT NULL,
        timestamp        TEXT NOT NULL,
        rule_triggered   TEXT,
        pid              TEXT,
        exe_path         TEXT,
        remote_ip        TEXT,
        severity         TEXT,
        action_taken     TEXT,
        response_time_ms INTEGER,
        chat_transcript  TEXT
    )`,

    // ── Blocked IPs (Admin-controlled global blocklist) ───────────────────────
    `CREATE TABLE IF NOT EXISTS blocked_ips (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        ip         TEXT NOT NULL UNIQUE,
        added_at   TEXT NOT NULL,
        added_by   TEXT DEFAULT 'admin',
        note       TEXT
    )`,

    // ── Indexes for common queries ────────────────────────────────────────────
    `CREATE INDEX IF NOT EXISTS idx_alerts_timestamp      ON alerts(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_alerts_severity       ON alerts(severity)`,
    `CREATE INDEX IF NOT EXISTS idx_alerts_ack            ON alerts(acknowledged)`,
    `CREATE INDEX IF NOT EXISTS idx_unified_events_ts     ON unified_events(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_unified_events_type   ON unified_events(event_type)`,
    `CREATE INDEX IF NOT EXISTS idx_incidents_ts          ON incidents(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_incidents_severity    ON incidents(severity)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_ts         ON audit_logs(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_process_pid           ON process_logs(pid)`,
    `CREATE INDEX IF NOT EXISTS idx_process_logs_ts       ON process_logs(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_network_logs_ts       ON network_logs(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_network_remote        ON network_logs(remote_addr)`,
    `CREATE INDEX IF NOT EXISTS idx_registry_logs_ts      ON registry_logs(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_file_logs_ts          ON file_logs(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_file_logs_hash        ON file_logs(file_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_baseline_type         ON baseline_records(type)`,
    `CREATE INDEX IF NOT EXISTS idx_alert_history_alertid ON alert_history(alert_id)`,
    `CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip        ON blocked_ips(ip)`
];

const DEFAULT_SETTINGS = [
    { key: "scanInterval",         value: "5000" },
    { key: "aiProvider",           value: "gemini" },
    { key: "notificationsEnabled", value: "true" },
    { key: "soundEnabled",         value: "true" },
    { key: "retentionDays",        value: "30" },
    { key: "aiPrivacyMode",        value: "false" },
    { key: "learningModeStart",    value: "" },
    { key: "learningModeComplete", value: "false" },
    { key: "learningModeHours",    value: "24" },
    { key: "networkIsolated",      value: "false" },
    { key: "screenSecurityMode",   value: "MANUAL" }
];

async function initSchema(db) {
    console.log("[DB] Initializing schema...");
    for (const sql of TABLES) {
        await db.run(sql);
    }

    for (const { key, value } of DEFAULT_SETTINGS) {
        await db.run(
            `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
            [key, value, new Date().toISOString()]
        );
    }
    console.log("[DB] Schema ready.");
}

module.exports = { initSchema };
