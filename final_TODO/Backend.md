# 🛡️ CyberGuardian AI & FlotBot Defender — Unified Backend Documentation

> **Complete Architecture, Database Schema, Table Specifications, and API Reference**

---

## 1. Executive Summary & Architecture Overview

The CyberGuardian AI platform utilizes a **single unified backend** that brings together both the **Interactive Cybersecurity Learning Platform** and the **FlotBot EDR/XDR Endpoint Security Engine**.

### Core Architecture Principles:
* **Unified Single Backend**: One Express backend service (`server/server.js`) on port `5000` serves all API needs (Learning, Simulations, Certifications, FlotBot EDR, Admin, Analytics).
* **Single Authentication Flow**: Preserves Firebase Google OAuth & Email authentication on the frontend and cryptographically verifies Firebase ID Tokens on the backend.
* **Unified Relational Database**: Supports **PostgreSQL** in production with an automatic zero-config **SQLite WAL** fallback (`FlotBot/data/cyberguardian_unified.db`).
* **Role-Based Access Control (RBAC)**: 10 granular administrative and employee roles with strict server-side middleware enforcement.
* **Non-Invasive Privacy Policy**: User security behavior analytics are strictly computed from application-specific security events and alert interactions.

```
                            Firebase Google Auth
                                     │
                                 ID Token
                                     ▼
                            Express Backend API
                                (Port 5000)
                                     │
                        ┌────────────┴────────────┐
                        ▼                         ▼
                Token Verification        RBAC Authorization
                (Firebase Admin SDK)      (10 Role Tiers)
                        └────────────┬────────────┘
                                     ▼
                         Unified Relational DB
                      (PostgreSQL / SQLite WAL)
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ▼                                                     ▼
   Learning Platform                                    FlotBot Security
   • 53 Courses & Modules                               • Endpoint Threat Alerts
   • Simulations & Scenarios                            • Alert Lifecycle History
   • Assessments & Quizzes                              • IOC Management
   • Cryptographic Certificates                         • Threat Rules & Ollama AI
   • User Activity Timeline                             • User Security Behaviour
          │                                                     │
          └──────────────────────────┬──────────────────────────┘
                                     ▼
                           Unified Admin Panel
                        • User Roles & Audit Logs
                        • Platform & Security Analytics
```

---

## 2. Database Names & Configuration

### Supported Database Engines:
1. **PostgreSQL (Production Multi-User)**
   * **Database Name**: `cyberguardian` (or custom configured via `DATABASE_URL` / `PGDATABASE`)
   * **Host**: Configurable via `PGHOST` (default: `localhost`)
   * **Port**: Configurable via `PGPORT` (default: `5432`)
   * **Driver**: [`pg`](file:///home/zoro/Documents/final_OG/IBM%20project-OG/package.json#L36) connection pool

2. **SQLite (Embedded / Zero-Config Fallback)**
   * **Database File**: `FlotBot/data/cyberguardian_unified.db`
   * **Mode**: WAL (Write-Ahead Logging) enabled for maximum concurrent read/write throughput
   * **Integrity**: `PRAGMA foreign_keys = ON;` enabled

### Environment Variables (`.env` / `server/config/config.js`):
```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Connection (Optional: if omitted, SQLite is automatically used)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyberguardian
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=cyberguardian
PGSSL=false

# SQLite Path Override (Optional)
SQLITE_PATH=./FlotBot/data/cyberguardian_unified.db

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=cyberguardian-ai-8098f
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_SERVICE_ACCOUNT_PATH=

# FlotBot AI / Ollama Configuration
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:0.5b
```

---

## 3. Database Schema & Tables Reference

The database contains **22 tables** and **28 optimized indexes**.

```mermaid
erDiagram
    users ||--o{ course_enrollments : "enrolls"
    users ||--o{ course_progress : "tracks"
    users ||--o{ simulation_attempts : "attempts"
    users ||--o{ certifications : "earns"
    users ||--o{ user_activity : "generates"
    users ||--o{ alerts : "assigned/acts"
    users ||--o{ alert_events : "interacts"
    users ||--o{ admin_audit_logs : "executes"
    
    courses ||--|{ course_modules : "contains"
    courses ||--o{ lessons : "contains"
    courses ||--o{ course_quizzes : "contains"
    courses ||--o{ course_enrollments : "has"
    courses ||--o{ course_progress : "has"
    courses ||--o{ certifications : "issues"
    
    simulations ||--o{ simulation_attempts : "records"
    alerts ||--o{ alert_events : "tracks_lifecycle"
```

---

### Table 1: `users`
Stores all platform user accounts, mapped to Firebase Authentication.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Unique application user identifier (e.g. `usr_...`) |
| `firebase_uid` | `VARCHAR(128)` | `UNIQUE, NOT NULL` | Firebase Auth UID (Google / Email login) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Display name |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | User email address |
| `profile_picture` | `TEXT` | `NULL` | Avatar URL or base64 image data |
| `role` | `VARCHAR(64)` | `NOT NULL, DEFAULT 'EMPLOYEE'` | Assigned authorization role |
| `status` | `VARCHAR(32)` | `NOT NULL, DEFAULT 'ACTIVE'` | Account status: `ACTIVE`, `SUSPENDED`, `INACTIVE` |
| `bio` | `TEXT` | `NULL` | User biography description |
| `organization` | `VARCHAR(255)` | `NULL` | User affiliation / academy name |
| `level` | `INTEGER` | `DEFAULT 1` | User leveling rank |
| `xp` | `INTEGER` | `DEFAULT 0` | Total experience points earned |
| `streak` | `INTEGER` | `DEFAULT 0` | Consecutive active learning days |
| `last_login` | `VARCHAR(64)` | `NULL` | ISO timestamp of last authenticated session |
| `created_at` | `VARCHAR(64)` | `NOT NULL` | ISO creation timestamp |
| `updated_at` | `VARCHAR(64)` | `NOT NULL` | ISO update timestamp |

---

### Table 2: `roles`
Defines available system roles and their permission scopes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Role ID (`role_super_admin`, etc.) |
| `name` | `VARCHAR(128)` | `UNIQUE, NOT NULL` | Role name (`SUPER_ADMIN`, `EMPLOYEE`, etc.) |
| `description` | `TEXT` | `NULL` | Role purpose and authority description |
| `permissions` | `TEXT` | `NOT NULL` | JSON array of assigned permission wildcard strings |

---

### Table 3: `courses`
Stores the complete course catalog (53 seeded courses).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Unique slug (e.g. `phish-fund`, `soc-analyst-101`) |
| `title` | `VARCHAR(255)` | `NOT NULL` | Course title |
| `cat` | `VARCHAR(128)` | `NOT NULL` | Category (`Phishing`, `Network`, `Cloud`, etc.) |
| `icon` | `VARCHAR(64)` | `DEFAULT 'shield'` | Icon identifier |
| `color1` | `VARCHAR(32)` | `DEFAULT '#7C3AED'` | UI gradient primary color |
| `color2` | `VARCHAR(32)` | `DEFAULT '#38BDF8'` | UI gradient secondary color |
| `level` | `VARCHAR(64)` | `DEFAULT 'Beginner'` | Difficulty level |
| `desc_text` | `TEXT` | `NULL` | Comprehensive course summary |
| `duration` | `VARCHAR(64)` | `NULL` | Estimated completion duration |
| `provider` | `VARCHAR(255)` | `NULL` | Certification issuing body |
| `objectives` | `TEXT` | `NULL` | JSON array of learning objectives |
| `skills_gained` | `TEXT` | `NULL` | JSON array of cybersecurity skills gained |
| `prerequisites` | `TEXT` | `NULL` | JSON array of prerequisite topics |
| `banner_image` | `TEXT` | `NULL` | Course header banner media URL |
| `intro_video` | `TEXT` | `NULL` | Optional introduction video URL |
| `credential_eligible` | `INTEGER` | `DEFAULT 1` | 1 if course grants certificate upon completion |
| `credential_name` | `VARCHAR(255)` | `NULL` | Certificate title issued |
| `created_at` | `VARCHAR(64)` | `NOT NULL` | Creation timestamp |
| `updated_at` | `VARCHAR(64)` | `NOT NULL` | Update timestamp |

---

### Table 4: `course_modules`
Divides courses into sequential curriculum modules.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Module identifier (e.g. `phish-fund-mod-1`) |
| `course_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `courses.id` |
| `module_order` | `INTEGER` | `DEFAULT 0` | Sequential sort order index |
| `title` | `VARCHAR(255)` | `NOT NULL` | Module title |
| `desc_text` | `TEXT` | `NULL` | Module overview |
| `duration` | `VARCHAR(64)` | `NULL` | Module time estimate |
| `objectives` | `TEXT` | `NULL` | JSON array of module specific goals |

---

### Table 5: `lessons`
Individual interactive lessons within a module.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Lesson identifier |
| `module_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `course_modules.id` |
| `course_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `courses.id` |
| `lesson_order` | `INTEGER` | `DEFAULT 0` | Sequential lesson order index |
| `title` | `VARCHAR(255)` | `NOT NULL` | Lesson title |
| `lesson_type` | `VARCHAR(64)` | `DEFAULT 'reading'` | Type: `reading`, `video`, `lab`, `quiz` |
| `dur` | `VARCHAR(64)` | `DEFAULT '5 min'` | Reading duration |
| `body` | `TEXT` | `NULL` | Full lesson markdown/text content |
| `image` | `TEXT` | `NULL` | Diagram or illustration URL |
| `example` | `TEXT` | `NULL` | Technical breakdown example |
| `real_time_example`| `TEXT` | `NULL` | Real-world breach case study |
| `points` | `TEXT` | `NULL` | JSON array of key takeaways |
| `activities` | `TEXT` | `NULL` | JSON array of practical exercises |
| `knowledge_check` | `TEXT` | `NULL` | JSON array of in-lesson micro-checks |

---

### Table 6: `course_quizzes`
Final assessment question bank for courses.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Quiz question identifier |
| `course_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `courses.id` |
| `question` | `TEXT` | `NOT NULL` | Question text |
| `options` | `TEXT` | `NOT NULL` | JSON array of multiple choice options |
| `answer` | `INTEGER` | `NOT NULL` | 0-based index of correct option |
| `explanation` | `TEXT` | `NULL` | Educational rationale for correct answer |
| `question_order` | `INTEGER` | `DEFAULT 0` | Question sort order index |

---

### Table 7: `course_enrollments`
Tracks user course enrollment status.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Enrollment ID (`enr_<userId>_<courseId>`) |
| `user_id` | `VARCHAR(64)` | `NOT NULL` | Foreign key referencing `users.id` |
| `course_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `courses.id` |
| `status` | `VARCHAR(32)` | `DEFAULT 'enrolled'`| Status: `enrolled`, `in_progress`, `completed` |
| `enrolled_at` | `VARCHAR(64)` | `NOT NULL` | Enrollment timestamp |
| `completed_at` | `VARCHAR(64)` | `NULL` | Course completion timestamp |

---

### Table 8: `course_progress`
Granular user lesson progression and assessment scores.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Progress ID (`prog_<userId>_<courseId>`) |
| `user_id` | `VARCHAR(64)` | `NOT NULL` | Foreign key referencing `users.id` |
| `course_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `courses.id` |
| `completed_lessons`| `TEXT` | `NULL` | JSON array of completed lesson IDs |
| `completed_activities`| `TEXT` | `NULL` | JSON array of completed activities |
| `quizzes_passed` | `TEXT` | `NULL` | JSON map of passed quiz sections |
| `quiz_score` | `REAL` | `NULL` | Highest quiz percentage score achieved |
| `final_assessment_score`| `REAL` | `NULL` | Final exam score percentage |
| `certified` | `INTEGER` | `DEFAULT 0` | 1 if certified |
| `certified_at` | `VARCHAR(64)` | `NULL` | Certification award timestamp |
| `cred_id` | `VARCHAR(128)` | `NULL` | Issued certificate credential ID |
| `time_spent_minutes`| `INTEGER` | `DEFAULT 0` | Total learning time recorded |
| `updated_at` | `VARCHAR(64)` | `NOT NULL` | Last progress update timestamp |

---

### Table 9: `simulations`
Attack and defense simulation scenarios.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | `PRIMARY KEY` | Scenario ID (`SE-001`, `SE-002`, etc.) |
| `numeric_id` | `INTEGER` | `NULL` | Numeric scenario index |
| `title` | `VARCHAR(255)` | `NOT NULL` | Scenario title |
| `category` | `VARCHAR(128)` | `NOT NULL` | Attack vector (`Phishing`, `Vishing`, `Quishing`, etc.) |
| `difficulty` | `VARCHAR(64)` | `NOT NULL` | Difficulty: `Beginner`, `Intermediate`, `Advanced` |
| `duration` | `INTEGER` | `DEFAULT 10` | Estimated completion minutes |
| `environment` | `VARCHAR(64)` | `NOT NULL` | Environment: `email`, `phone`, `qr`, `mfa`, `ransomware` |
| `xp` | `INTEGER` | `DEFAULT 100` | XP reward for passing |
| `icon` | `VARCHAR(64)` | `NULL` | Icon name |
| `goal` | `TEXT` | `NULL` | Simulation objective |
| `summary` | `TEXT` | `NULL` | Technical brief |
| `brand` | `VARCHAR(128)` | `NULL` | Impersonated brand name |
| `learning_objectives`| `TEXT` | `NULL` | JSON array of learning objectives |
| `hints` | `TEXT` | `NULL` | JSON array of tiered hints and penalty scores |
| `learning_cards` | `TEXT` | `NULL` | JSON array of educational debrief cards |
| `debrief` | `TEXT` | `NULL` | JSON debrief summary template |
| `created_at` | `VARCHAR(64)` | `NOT NULL` | Creation timestamp |

---

### Table 10: `simulation_attempts`
Records interactive user simulation runs and tactical choices.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Attempt ID (`att_<userId>_<simId>_<ts>`) |
| `user_id` | `VARCHAR(64)` | `NOT NULL` | Foreign key referencing `users.id` |
| `simulation_id` | `VARCHAR(64)` | `NOT NULL` | Foreign key referencing `simulations.id` |
| `start_time` | `VARCHAR(64)` | `NOT NULL` | Scenario start timestamp |
| `completion_time`| `VARCHAR(64)` | `NULL` | Scenario finish timestamp |
| `status` | `VARCHAR(32)` | `DEFAULT 'completed'`| Status: `in_progress`, `completed`, `failed` |
| `score` | `REAL` | `DEFAULT 0` | Final score percentage (0-100) |
| `stars` | `INTEGER` | `DEFAULT 0` | Star rating awarded (0-3) |
| `risk_score` | `REAL` | `DEFAULT 0` | Risk exposure metric (0-100) |
| `risk_level` | `VARCHAR(32)` | `NULL` | Risk evaluation (`LOW`, `MEDIUM`, `CRITICAL`) |
| `outcome` | `VARCHAR(32)` | `NULL` | Outcome: `safe`, `partial`, `compromised` |
| `hints_used` | `INTEGER` | `DEFAULT 0` | Number of hints consumed |
| `investigative_actions`| `INTEGER`| `DEFAULT 0` | Number of defensive analysis steps taken |
| `defensive_actions`| `INTEGER` | `DEFAULT 0` | Number of threat mitigations applied |
| `branch_taken` | `VARCHAR(128)` | `NULL` | Decision tree branch selected |
| `events_json` | `TEXT` | `NULL` | JSON array of sequential interactive choices |
| `attacker_events_json`| `TEXT` | `NULL` | JSON array of adversary actions |
| `exposed_data_json`| `TEXT` | `NULL` | JSON array of compromised telemetry |
| `debrief_json` | `TEXT` | `NULL` | JSON structured debrief feedback |
| `created_at` | `VARCHAR(64)` | `NOT NULL` | Creation timestamp |

---

### Table 11: `certifications`
Cryptographically verifiable cybersecurity credentials.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Certificate primary key (`cert_...`) |
| `cred_id` | `VARCHAR(128)` | `UNIQUE, NOT NULL` | Public Credential ID (e.g. `CG-CERT-PHISHFUND-39810`) |
| `user_id` | `VARCHAR(64)` | `NOT NULL` | Foreign key referencing `users.id` |
| `course_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `courses.id` |
| `title` | `VARCHAR(255)` | `NOT NULL` | Certificate title |
| `recipient_name` | `VARCHAR(255)` | `NOT NULL` | Full recipient name on certificate |
| `score` | `REAL` | `DEFAULT 0` | Passing examination score percentage |
| `issue_date` | `VARCHAR(64)` | `NOT NULL` | Issuance timestamp |
| `status` | `VARCHAR(32)` | `DEFAULT 'active'`| Status: `active`, `revoked`, `expired` |
| `skills` | `TEXT` | `NULL` | JSON array of certified skills |
| `verification_hash`| `VARCHAR(128)`| `NULL` | SHA-256 cryptographic anti-tamper hash |
| `revoked_at` | `VARCHAR(64)` | `NULL` | Revocation timestamp if revoked |
| `revoked_by` | `VARCHAR(64)` | `NULL` | Admin ID who revoked credential |
| `revocation_reason`| `TEXT` | `NULL` | Audit reason for revocation |
| `created_at` | `VARCHAR(64)` | `NOT NULL` | Creation timestamp |

---

### Table 12: `user_activity`
Structured, privacy-compliant timeline of user platform interactions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Activity ID (`act_...`) |
| `user_id` | `VARCHAR(64)` | `NOT NULL` | Foreign key referencing `users.id` |
| `activity_type` | `VARCHAR(64)` | `NOT NULL` | Type: `LOGIN`, `COURSE_OPENED`, `LESSON_COMPLETED`, `QUIZ_COMPLETED`, `SIMULATION_COMPLETED`, `CERTIFICATE_EARNED`, etc. |
| `label` | `VARCHAR(255)` | `NOT NULL` | Human-readable event headline |
| `detail` | `TEXT` | `NULL` | Supplementary event context |
| `category` | `VARCHAR(64)` | `NOT NULL` | Category: `Learning`, `Simulation`, `Security`, `Settings` |
| `icon_type` | `VARCHAR(32)` | `DEFAULT 'success'`| UI badge type: `success`, `warning`, `danger`, `info` |
| `metadata_json` | `TEXT` | `NULL` | JSON structured metadata |
| `timestamp` | `VARCHAR(64)` | `NOT NULL` | ISO event timestamp |

---

### Table 13: `alerts`
FlotBot EDR/XDR security alerts and system telemetry detections.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Alert ID (`alert-sec-101`, `alt_...`) |
| `user_id` | `VARCHAR(64)` | `NULL` | Associated user ID (or NULL for system wide) |
| `timestamp` | `VARCHAR(64)` | `NOT NULL` | Detection timestamp |
| `title` | `VARCHAR(255)` | `NOT NULL` | Threat detection headline |
| `severity` | `VARCHAR(32)` | `NOT NULL` | Severity: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `category` | `VARCHAR(64)` | `NOT NULL` | MITRE / Vector category (`Execution`, `Network`, `Persistence`, etc.) |
| `source` | `VARCHAR(128)` | `NOT NULL` | Detection sensor (`System Watcher`, `Network Sensor`, etc.) |
| `description` | `TEXT` | `NULL` | Technical attack summary |
| `recommendation` | `TEXT` | `NULL` | Actionable remediation guidance |
| `evidence` | `TEXT` | `NULL` | JSON telemetry payload (PID, command line, IP, port, file hash) |
| `mitre` | `TEXT` | `NULL` | JSON array of MITRE ATT&CK technique IDs |
| `status` | `VARCHAR(32)` | `DEFAULT 'NEW'` | Status: `NEW`, `ACKNOWLEDGED`, `RESOLVED` |
| `acknowledged` | `INTEGER` | `DEFAULT 0` | 1 if acknowledged |
| `acknowledged_at`| `VARCHAR(64)` | `NULL` | Acknowledgment timestamp |
| `acknowledged_by`| `VARCHAR(64)` | `NULL` | User/Admin ID who acknowledged |
| `resolved_at` | `VARCHAR(64)` | `NULL` | Resolution timestamp |
| `resolved_by` | `VARCHAR(64)` | `NULL` | User/Admin ID who resolved |
| `resolution_notes`| `TEXT` | `NULL` | Resolution audit notes |
| `ai_analysis` | `TEXT` | `NULL` | JSON Ollama AI explanation and risk assessment |

---

### Table 14: `alert_events`
Complete chronological alert handling lifecycle history.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Event ID (`evt_...`) |
| `alert_id` | `VARCHAR(128)` | `NOT NULL` | Foreign key referencing `alerts.id` |
| `user_id` | `VARCHAR(64)` | `NULL` | Interacting user ID |
| `event_type` | `VARCHAR(64)` | `NOT NULL` | Stage: `detected`, `displayed`, `viewed`, `ai_explanation_requested`, `acknowledged`, `investigated`, `resolved` |
| `timestamp` | `VARCHAR(64)` | `NOT NULL` | ISO event timestamp |
| `metadata_json` | `TEXT` | `NULL` | JSON payload of the event context |

---

### Table 15: `iocs`
FlotBot Threat Intelligence Indicators of Compromise.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | IOC ID (`ioc_...`) |
| `type` | `VARCHAR(32)` | `NOT NULL` | Type: `hash`, `ip`, `domain`, `process` |
| `value` | `TEXT` | `NOT NULL` | Indicator string value |
| `threat_name` | `VARCHAR(255)` | `NULL` | Associated malware / campaign name |
| `severity` | `VARCHAR(32)` | `DEFAULT 'HIGH'` | Severity rating |
| `status` | `VARCHAR(32)` | `DEFAULT 'active'`| State: `active`, `deprecated`, `whitelisted` |
| `added_by` | `VARCHAR(64)` | `DEFAULT 'admin'`| Username or admin who created entry |
| `note` | `TEXT` | `NULL` | Threat intel notes |
| `created_at` | `VARCHAR(64)` | `NOT NULL` | Creation timestamp |
| `updated_at` | `VARCHAR(64)` | `NOT NULL` | Last update timestamp |

---

### Table 16: `threat_rules`
EDR detection rules and heuristic engines.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Internal ID |
| `rule_id` | `VARCHAR(128)` | `UNIQUE, NOT NULL` | Rule identifier (`R-EXEC-01`, `R-NET-01`, etc.) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Rule display name |
| `category` | `VARCHAR(64)` | `NOT NULL` | Detection category |
| `severity` | `VARCHAR(32)` | `NOT NULL` | Trigger severity |
| `description` | `TEXT` | `NULL` | Threat pattern description |
| `enabled` | `INTEGER` | `DEFAULT 1` | 1 if active, 0 if disabled |
| `config_json` | `TEXT` | `NULL` | JSON detection parameters & threshold filters |
| `created_at` | `VARCHAR(64)` | `NOT NULL` | Creation timestamp |
| `updated_at` | `VARCHAR(64)` | `NOT NULL` | Update timestamp |
| `updated_by` | `VARCHAR(64)` | `NULL` | Admin who last changed configuration |

---

### Table 17: `admin_audit_logs`
Unified immutable audit trail for administrative operations.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(128)` | `PRIMARY KEY` | Log entry ID (`audit_...`) |
| `admin_id` | `VARCHAR(64)` | `NULL` | Administrator user ID |
| `admin_name` | `VARCHAR(255)` | `NULL` | Administrator display name |
| `admin_email` | `VARCHAR(255)` | `NULL` | Administrator email address |
| `action` | `VARCHAR(128)` | `NOT NULL` | Action code: `USER_ROLE_CHANGED`, `COURSE_PUBLISHED`, `CERTIFICATE_REVOKED`, `RULE_TOGGLED`, etc. |
| `resource` | `VARCHAR(128)` | `NOT NULL` | Target resource table (`users`, `courses`, `certifications`, `threat_rules`) |
| `resource_id` | `VARCHAR(128)` | `NULL` | Primary key of affected record |
| `metadata_json` | `TEXT` | `NULL` | JSON diff or parameters of the change |
| `ip_address` | `VARCHAR(64)` | `NULL` | Client IP address |
| `timestamp` | `VARCHAR(64)` | `NOT NULL` | Action timestamp |

---

### Tables 18–22: Supplementary Security Tables

18. **`security_audit_logs`**: Logs automated EDR mitigation actions (process kills, interface isolates).
19. **`settings`**: Key-value system configuration store.
20. **`whitelist`**: Approved hashes, domains, and processes exempted from alert triggering.
21. **`baseline_records`**: System baseline behavioral profiling records.
22. **`blocked_ips`**: Firewall dynamic IP blocklist entries.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Role Name | Scope & Authority |
| :--- | :--- |
| **`SUPER_ADMIN`** | Unrestricted access across all platform, course, simulation, EDR security, user roles, and audit operations (`*`). |
| **`PLATFORM_ADMIN`** | Full management of users, courses, simulations, certificates, and system analytics (`users:*`, `courses:*`, `simulations:*`, `analytics:*`, `audit:*`). |
| **`USER_ADMIN`** | User lifecycle management, profile moderation, and account status controls (`users:*`). |
| **`COURSE_ADMIN`** | Course authoring, module structuring, lesson publishing, and quiz management (`courses:*`). |
| **`SIMULATION_ADMIN`** | Attack scenario creation, scoring rubric configuration, and environment setup (`simulations:*`). |
| **`CERTIFICATION_ADMIN`**| Credential issuance auditing, public verification controls, and authorized certificate revocation (`certifications:*`). |
| **`FLOTBOT_SECURITY_ADMIN`**| Complete EDR management: threat rules, IOC repository, security alerts, and system sensor configs (`flotbot:*`, `security:*`, `rules:*`, `iocs:*`). |
| **`SECURITY_ANALYST`** | Alert inspection, AI explanation requests, IOC search/add, and alert acknowledgment (`flotbot:read`, `flotbot:ack`, `iocs:read`, `iocs:add`). |
| **`ANALYST`** | Read-only reporting access across platform analytics and security metrics (`analytics:*`, `reports:*`). |
| **`EMPLOYEE`** | Course learning, simulation labs, quiz taking, certificate earning, personal security behaviour metrics (`courses:read`, `courses:progress`, `simulations:play`, `profile:manage`). |

---

## 5. Key Backend Workflows

### 5.1. Authentication & Session Synchronization
1. Frontend signs in with Firebase (`signInWithPopup(GoogleAuthProvider)` or email/password).
2. Client sends Firebase ID Token via `Authorization: Bearer <token>` to `POST /api/auth/sync`.
3. Backend verifies the token signature using Firebase Admin SDK.
4. Backend finds or creates the user in the `users` table via `firebase_uid`.
5. Backend returns the user profile, role, and active permissions.

### 5.2. Quiz Assessment & Automatic Certificate Issuance
1. User completes lessons in `course_progress` via `POST /api/courses/:id/progress`.
2. User submits final assessment answers to `POST /api/courses/:id/quiz`.
3. Backend grades responses against `course_quizzes.answer`.
4. If score $\ge 70\%$:
   * A unique Credential ID is generated (`CG-CERT-<COURSE>-<NUM>`).
   * A SHA-256 anti-tamper hash is calculated: `SHA256(cred_id|email|courseId|score|issueDate)`.
   * A record is inserted into `certifications`.
   * Course enrollment status is set to `completed`.
   * 200 XP is awarded to the user account.
   * Event is recorded in `user_activity`.

### 5.3. FlotBot Threat Alert Lifecycle
1. EDR sensor detects malicious behavior $\rightarrow$ Alert is inserted into `alerts` (`status: NEW`).
2. An initial `detected` event is logged in `alert_events`.
3. When the user opens the alert, a `viewed` event is logged.
4. If the user clicks **Explain with AI**, backend queries local Ollama (`POST /api/flotbot/ai/explain`) and records an `ai_explanation_requested` event.
5. User clicks **Acknowledge Alert** (`POST /api/flotbot/alerts/:id/acknowledge`) $\rightarrow$ status becomes `ACKNOWLEDGED`.
6. Security Admin resolves the threat (`POST /api/flotbot/alerts/:id/resolve`) $\rightarrow$ status becomes `RESOLVED` with resolution notes.

### 5.4. User Security Behaviour Scoring
The backend calculates an objective Security Posture Score (0–100) using real database records:
* **Base Score**: 80
* **Unacknowledged Alerts**: $-10$ per unacknowledged alert (up to $-30$)
* **Unresolved Critical Alerts**: $-20$
* **Proactive AI Inquiries**: $+2$ per AI explanation requested (up to $+10$)
* **Security Actions Performed**: $+2$ per mitigation/investigation action (up to $+10$)
* **Response Time**: Calculated as average delta between alert detection and acknowledgment.

---

## 6. How to Run and Test the Backend

### Start the Unified Backend Server
```bash
# Start backend server on port 5000
npm run server
```

### Run the 31-Point Automated Test Suite
```bash
# Runs full end-to-end API test verification
npm run server:test
```

### Run Backend + Frontend Concurrently
```bash
# Starts Express backend (port 5000) and Vite frontend (port 5173) together
npm run dev:all
```

---

## 7. Frontend Integration Client (`src/lib/api.ts`)

The frontend imports the clean typed API helper from [`src/lib/api.ts`](file:///home/zoro/Documents/final_OG/IBM%20project-OG/src/lib/api.ts):

```typescript
import { api } from '@/lib/api';

// Sync current Firebase user
const userSession = await api.auth.sync();

// Load course catalog
const courses = await api.courses.list({ cat: 'Phishing' });

// Enroll and record progress
await api.courses.enroll('phish-fund');
await api.courses.updateProgress('phish-fund', { lessonKey: 'phish-fund-mod-1-les-1' });

// FlotBot Security alerts & AI analysis
const alerts = await api.flotbot.getAlerts();
const explanation = await api.flotbot.explainAlert('alert-sec-101');
```

---

## 8. Latest Backend Updates & Admin Extensibility

### 8.1. Full 53 Course & 47 Simulation Scenario Database Synchronization
* **Automated Seeding via Node VM (`server/db/init.js`)**: Evaluates canonical frontend catalog structures in `src/data/coursesData.ts` and `src/data/simulation/se-scenarios.ts` safely into memory and idempotently registers all courses, modules, reading lessons, certification exam quizzes, and simulation scenarios into the PostgreSQL/SQLite schema.
* **Guaranteed Minimum Thresholds**: Automatically checks if `courses >= 50` and `simulations >= 40`. Any missing records are automatically restored on server startup.

### 8.2. Admin Course & Simulation Mutation Endpoints
* `POST /api/admin/courses` — Create new course with nested modules, lessons, and quizzes.
* `PUT /api/admin/courses/:id` — Update/customize existing course metadata, modules, and quizzes.
* `DELETE /api/admin/courses/:id` — Cascade delete course, modules, lessons, and progress.
* `POST /api/admin/simulations` — Publish new interactive simulation scenario.
* `PUT /api/admin/simulations/:id` — Update/customize scenario goal, narrative, hints, and XP.
* `DELETE /api/admin/simulations/:id` — Delete simulation scenario and associated attempts.

### 8.4. PostgreSQL Exclusive Architecture & Live Operations Center Telemetry
* **Direct PostgreSQL Driver (`server/db/index.js`)**: All database queries execute directly via the `pg.Pool` connection pool (`localhost:5432/cyberguardian`). Legacy SQLite databases have been removed.
* **Unified Executive Operations Center (`AdminDashboardView.tsx`)**: The Admin Dashboard now queries and displays interactive previews of the **53 Enterprise Courses** and **47 Attack & Defense Labs** alongside live registered workforce users and active FlotBot EDR threat alerts.
* **10-Second Telemetry Heartbeat**: Automatic background polling keeps all metrics, registered workforce accounts, and threat detections synchronized in real time.

---
*Documentation generated for CyberGuardian AI Unified Backend.*



