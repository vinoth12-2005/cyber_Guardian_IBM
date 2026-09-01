/**
 * Unified Database Schema for CyberGuardian AI & FlotBot Defender
 * Supports both PostgreSQL and SQLite relational tables.
 */

const TABLES = [
  // 1. Users
  `CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(64) PRIMARY KEY,
    firebase_uid    VARCHAR(128) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    role            VARCHAR(64) DEFAULT 'STUDENT' NOT NULL,
    status          VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
    bio             TEXT,
    organization    VARCHAR(255),
    level           INTEGER DEFAULT 1,
    xp              INTEGER DEFAULT 0,
    streak          INTEGER DEFAULT 0,
    last_login      VARCHAR(64),
    created_at      VARCHAR(64) NOT NULL,
    updated_at      VARCHAR(64) NOT NULL
  )`,

  // 2. Roles & Permissions
  `CREATE TABLE IF NOT EXISTS roles (
    id              VARCHAR(64) PRIMARY KEY,
    name            VARCHAR(128) UNIQUE NOT NULL,
    description     TEXT,
    permissions     TEXT NOT NULL
  )`,

  // 3. Courses
  `CREATE TABLE IF NOT EXISTS courses (
    id                  VARCHAR(128) PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    cat                 VARCHAR(128) NOT NULL,
    icon                VARCHAR(64) DEFAULT 'shield',
    color1              VARCHAR(32) DEFAULT '#7C3AED',
    color2              VARCHAR(32) DEFAULT '#38BDF8',
    level               VARCHAR(64) DEFAULT 'Beginner',
    desc_text           TEXT,
    duration            VARCHAR(64),
    provider            VARCHAR(255),
    objectives          TEXT,
    skills_gained       TEXT,
    prerequisites       TEXT,
    banner_image        TEXT,
    intro_video         TEXT,
    credential_eligible INTEGER DEFAULT 1,
    credential_name     VARCHAR(255),
    created_at          VARCHAR(64) NOT NULL,
    updated_at          VARCHAR(64) NOT NULL
  )`,

  // 4. Course Modules
  `CREATE TABLE IF NOT EXISTS course_modules (
    id              VARCHAR(128) PRIMARY KEY,
    course_id       VARCHAR(128) NOT NULL,
    module_order    INTEGER DEFAULT 0,
    title           VARCHAR(255) NOT NULL,
    desc_text       TEXT,
    duration        VARCHAR(64),
    objectives      TEXT
  )`,

  // 5. Lessons
  `CREATE TABLE IF NOT EXISTS lessons (
    id                 VARCHAR(128) PRIMARY KEY,
    module_id          VARCHAR(128) NOT NULL,
    course_id          VARCHAR(128) NOT NULL,
    lesson_order       INTEGER DEFAULT 0,
    title              VARCHAR(255) NOT NULL,
    lesson_type        VARCHAR(64) DEFAULT 'reading',
    dur                VARCHAR(64) DEFAULT '5 min',
    body               TEXT,
    image              TEXT,
    example            TEXT,
    real_time_example  TEXT,
    points             TEXT,
    activities         TEXT,
    knowledge_check    TEXT
  )`,

  // 6. Course Quizzes (Final Assessments)
  `CREATE TABLE IF NOT EXISTS course_quizzes (
    id              VARCHAR(128) PRIMARY KEY,
    course_id       VARCHAR(128) NOT NULL,
    question        TEXT NOT NULL,
    options         TEXT NOT NULL,
    answer          INTEGER NOT NULL,
    explanation     TEXT,
    question_order  INTEGER DEFAULT 0
  )`,

  // 7. Course Enrollments
  `CREATE TABLE IF NOT EXISTS course_enrollments (
    id              VARCHAR(128) PRIMARY KEY,
    user_id         VARCHAR(64) NOT NULL,
    course_id       VARCHAR(128) NOT NULL,
    status          VARCHAR(32) DEFAULT 'enrolled',
    enrolled_at     VARCHAR(64) NOT NULL,
    completed_at    VARCHAR(64),
    UNIQUE (user_id, course_id)
  )`,

  // 8. Course Progress
  `CREATE TABLE IF NOT EXISTS course_progress (
    id                      VARCHAR(128) PRIMARY KEY,
    user_id                 VARCHAR(64) NOT NULL,
    course_id               VARCHAR(128) NOT NULL,
    completed_lessons       TEXT,
    completed_activities    TEXT,
    quizzes_passed          TEXT,
    quiz_score              REAL,
    final_assessment_score  REAL,
    certified               INTEGER DEFAULT 0,
    certified_at            VARCHAR(64),
    cred_id                 VARCHAR(128),
    time_spent_minutes      INTEGER DEFAULT 0,
    updated_at              VARCHAR(64) NOT NULL,
    UNIQUE (user_id, course_id)
  )`,

  // 9. Simulations
  `CREATE TABLE IF NOT EXISTS simulations (
    id                  VARCHAR(64) PRIMARY KEY,
    numeric_id          INTEGER,
    title               VARCHAR(255) NOT NULL,
    category            VARCHAR(128) NOT NULL,
    difficulty          VARCHAR(64) NOT NULL,
    duration            INTEGER DEFAULT 10,
    environment         VARCHAR(64) NOT NULL,
    xp                  INTEGER DEFAULT 100,
    icon                VARCHAR(64),
    goal                TEXT,
    summary             TEXT,
    brand               VARCHAR(128),
    learning_objectives TEXT,
    hints               TEXT,
    learning_cards      TEXT,
    debrief             TEXT,
    created_at          VARCHAR(64) NOT NULL
  )`,

  // 10. Simulation Attempts
  `CREATE TABLE IF NOT EXISTS simulation_attempts (
    id                      VARCHAR(128) PRIMARY KEY,
    user_id                 VARCHAR(64) NOT NULL,
    simulation_id           VARCHAR(64) NOT NULL,
    start_time              VARCHAR(64) NOT NULL,
    completion_time         VARCHAR(64),
    status                  VARCHAR(32) DEFAULT 'completed',
    score                   REAL DEFAULT 0,
    stars                   INTEGER DEFAULT 0,
    risk_score              REAL DEFAULT 0,
    risk_level              VARCHAR(32),
    outcome                 VARCHAR(32),
    hints_used              INTEGER DEFAULT 0,
    investigative_actions   INTEGER DEFAULT 0,
    defensive_actions       INTEGER DEFAULT 0,
    branch_taken            VARCHAR(128),
    events_json             TEXT,
    attacker_events_json    TEXT,
    exposed_data_json       TEXT,
    debrief_json            TEXT,
    created_at              VARCHAR(64) NOT NULL
  )`,

  // 11. Certifications & Credentials
  `CREATE TABLE IF NOT EXISTS certifications (
    id                  VARCHAR(128) PRIMARY KEY,
    cred_id             VARCHAR(128) UNIQUE NOT NULL,
    user_id             VARCHAR(64) NOT NULL,
    course_id           VARCHAR(128) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    recipient_name      VARCHAR(255) NOT NULL,
    score               REAL DEFAULT 0,
    issue_date          VARCHAR(64) NOT NULL,
    status              VARCHAR(32) DEFAULT 'active',
    skills              TEXT,
    verification_hash   VARCHAR(128),
    revoked_at          VARCHAR(64),
    revoked_by          VARCHAR(64),
    revocation_reason   TEXT,
    created_at          VARCHAR(64) NOT NULL
  )`,

  // 12. User Activity Timeline
  `CREATE TABLE IF NOT EXISTS user_activity (
    id              VARCHAR(128) PRIMARY KEY,
    user_id         VARCHAR(64) NOT NULL,
    activity_type   VARCHAR(64) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    detail          TEXT,
    category        VARCHAR(64) NOT NULL,
    icon_type       VARCHAR(32) DEFAULT 'success',
    metadata_json   TEXT,
    timestamp       VARCHAR(64) NOT NULL
  )`,

  // 13. Security Alerts (Unified FlotBot & Platform Security)
  `CREATE TABLE IF NOT EXISTS alerts (
    id                  VARCHAR(128) PRIMARY KEY,
    user_id             VARCHAR(64),
    timestamp           VARCHAR(64) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    severity            VARCHAR(32) NOT NULL,
    category            VARCHAR(64) NOT NULL,
    source              VARCHAR(128) NOT NULL,
    description         TEXT,
    recommendation      TEXT,
    evidence            TEXT,
    mitre               TEXT,
    status              VARCHAR(32) DEFAULT 'NEW',
    acknowledged        INTEGER DEFAULT 0,
    acknowledged_at     VARCHAR(64),
    acknowledged_by     VARCHAR(64),
    resolved_at         VARCHAR(64),
    resolved_by         VARCHAR(64),
    resolution_notes    TEXT,
    ai_analysis         TEXT
  )`,

  // 14. Alert Handling Events / History Lifecycle
  `CREATE TABLE IF NOT EXISTS alert_events (
    id              VARCHAR(128) PRIMARY KEY,
    alert_id        VARCHAR(128) NOT NULL,
    user_id         VARCHAR(64),
    event_type      VARCHAR(64) NOT NULL,
    timestamp       VARCHAR(64) NOT NULL,
    metadata_json   TEXT
  )`,

  // 15. IOCs (Indicators of Compromise)
  `CREATE TABLE IF NOT EXISTS iocs (
    id              VARCHAR(128) PRIMARY KEY,
    type            VARCHAR(32) NOT NULL,
    value           TEXT NOT NULL,
    threat_name     VARCHAR(255),
    severity        VARCHAR(32) DEFAULT 'HIGH',
    status          VARCHAR(32) DEFAULT 'active',
    added_by        VARCHAR(64) DEFAULT 'admin',
    note            TEXT,
    created_at      VARCHAR(64) NOT NULL,
    updated_at      VARCHAR(64) NOT NULL
  )`,

  // 16. Threat Rules
  `CREATE TABLE IF NOT EXISTS threat_rules (
    id              VARCHAR(128) PRIMARY KEY,
    rule_id         VARCHAR(128) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    category        VARCHAR(64) NOT NULL,
    severity        VARCHAR(32) NOT NULL,
    description     TEXT,
    enabled         INTEGER DEFAULT 1,
    config_json     TEXT,
    created_at      VARCHAR(64) NOT NULL,
    updated_at      VARCHAR(64) NOT NULL,
    updated_by      VARCHAR(64)
  )`,

  // 17. Admin Audit Logs
  `CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id              VARCHAR(128) PRIMARY KEY,
    admin_id        VARCHAR(64),
    admin_name      VARCHAR(255),
    admin_email     VARCHAR(255),
    action          VARCHAR(128) NOT NULL,
    resource        VARCHAR(128) NOT NULL,
    resource_id     VARCHAR(128),
    metadata_json   TEXT,
    ip_address      VARCHAR(64),
    timestamp       VARCHAR(64) NOT NULL
  )`,

  // 18. Security Audit Logs
  `CREATE TABLE IF NOT EXISTS security_audit_logs (
    id              VARCHAR(128) PRIMARY KEY,
    action_type     VARCHAR(128) NOT NULL,
    risk_category   VARCHAR(64) NOT NULL,
    reason          TEXT,
    user_approved   INTEGER DEFAULT 0,
    initiated_by    VARCHAR(128),
    status          VARCHAR(64) NOT NULL,
    details_json    TEXT,
    signature_hash  VARCHAR(128),
    timestamp       VARCHAR(64) NOT NULL
  )`,

  // 19. Application Settings
  `CREATE TABLE IF NOT EXISTS settings (
    key             VARCHAR(128) PRIMARY KEY,
    value           TEXT NOT NULL,
    updated_at      VARCHAR(64)
  )`,

  // 20. Whitelist
  `CREATE TABLE IF NOT EXISTS whitelist (
    id              VARCHAR(128) PRIMARY KEY,
    type            VARCHAR(64) NOT NULL,
    value           TEXT NOT NULL,
    reason          TEXT,
    created_at      VARCHAR(64) NOT NULL
  )`,

  // 21. Baseline Records
  `CREATE TABLE IF NOT EXISTS baseline_records (
    id                  VARCHAR(128) PRIMARY KEY,
    type                VARCHAR(64) NOT NULL,
    value               TEXT NOT NULL,
    first_seen          VARCHAR(64) NOT NULL,
    last_seen           VARCHAR(64) NOT NULL,
    observation_count   INTEGER DEFAULT 1,
    approved            INTEGER DEFAULT 0
  )`,

  // 22. Blocked IPs
  `CREATE TABLE IF NOT EXISTS blocked_ips (
    id              VARCHAR(128) PRIMARY KEY,
    ip              VARCHAR(128) UNIQUE NOT NULL,
    added_at        VARCHAR(64) NOT NULL,
    added_by        VARCHAR(64) DEFAULT 'admin',
    note            TEXT
  )`
];

const INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_users_firebase_uid  ON users(firebase_uid)`,
  `CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role          ON users(role)`,
  `CREATE INDEX IF NOT EXISTS idx_courses_cat         ON courses(cat)`,
  `CREATE INDEX IF NOT EXISTS idx_modules_course_id   ON course_modules(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_lessons_module_id   ON lessons(module_id)`,
  `CREATE INDEX IF NOT EXISTS idx_lessons_course_id   ON lessons(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_quizzes_course_id   ON course_quizzes(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_enrollments_user    ON course_enrollments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON course_enrollments(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_progress_user       ON course_progress(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_progress_course     ON course_progress(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sim_attempts_user   ON simulation_attempts(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sim_attempts_sim    ON simulation_attempts(simulation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_cert_cred_id        ON certifications(cred_id)`,
  `CREATE INDEX IF NOT EXISTS idx_cert_user_id        ON certifications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_user_id    ON user_activity(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_ts         ON user_activity(timestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_user_id      ON alerts(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_severity     ON alerts(severity)`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_status       ON alerts(status)`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_ts           ON alerts(timestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_alert_events_alert  ON alert_events(alert_id)`,
  `CREATE INDEX IF NOT EXISTS idx_alert_events_user   ON alert_events(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_iocs_type           ON iocs(type)`,
  `CREATE INDEX IF NOT EXISTS idx_iocs_status         ON iocs(status)`,
  `CREATE INDEX IF NOT EXISTS idx_threat_rules_cat    ON threat_rules(category)`,
  `CREATE INDEX IF NOT EXISTS idx_admin_audit_admin   ON admin_audit_logs(admin_id)`,
  `CREATE INDEX IF NOT EXISTS idx_admin_audit_ts      ON admin_audit_logs(timestamp)`
];

module.exports = {
  TABLES,
  INDEXES,
};
