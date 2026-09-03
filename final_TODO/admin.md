# 🛡️ CyberGuardian Enterprise AI & FlotBot Defender — Unified Admin Console

> **Official Enterprise Reference Manual: Architecture, Features, Unified Sidebar, Real Database Telemetry, and Operating Commands for Enterprise Workforce Deployment (e.g. IBM)**

---

## 1. Executive Summary

The **CyberGuardian Enterprise Unified Admin Console** is a standalone, high-performance administrative application engineered for Chief Information Security Officers (CISOs), Security Operations Center (SOC) Leads, Platform Administrators, and Enterprise Security Champions.

### Core Architecture Highlights:
* **Standalone Execution**: Runs independently on port `5174` via `npm run admin` or concurrently with the backend via `npm run admin:all`. It **does not require the employee portal to be running**.
* **ONE Single Unified Admin Panel**: Consolidates **both** Enterprise Platform Administration (employees, courses, attack simulations, certifications) and **FlotBot EDR/XDR Security Administration** into **one unified sidebar**.
* **100% Real Database Data**: All metrics, employee profiles, course enrollment rates, and security alerts are queried in real time from **PostgreSQL** via the Express API gateway (`/api`). **Zero synthetic or hardcoded data**.
* **10-Tier Role-Based Access Control (RBAC)**: Supports dynamic role switching and server-side permission enforcement (`SUPER_ADMIN`, `PLATFORM_ADMIN`, `FLOTBOT_SECURITY_ADMIN`, `SECURITY_ANALYST`, `COURSE_ADMIN`, `USER_ADMIN`, `ANALYST`, `EMPLOYEE`).

```
                    ┌────────────────────────────────────────┐
                    │      Unified Express Backend API       │
                    │         (Port 5000 / PostgreSQL)       │
                    └───────────────────┬────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌─────────────────────────┐                               ┌─────────────────────────┐
│ Employee Security Portal│                               │   Admin Console App     │
│   (Port 5173 / React)   │                               │   (Port 5174 / React)   │
│   • Enterprise Training │                               │   • Single Unified Bar  │
│   • Attack Simulations  │                               │   • Enterprise Admin    │
│   • FlotBot EDR Agent   │                               │   • FlotBot EDR / SOC   │
└─────────────────────────┘                               └─────────────────────────┘
```

---

## 2. Unified Sidebar Navigation Structure

The Admin Panel organizes all administrative functions under 4 clear sections:

```
ADMIN CONSOLE
│
├── [ADMIN]
│   └── 📊 Dashboard (Executive Operations Center)
│
├── [PLATFORM MANAGEMENT]
│   ├── 👥 Users & Employees (Enterprise Workforce Directory & Posture)
│   ├── 📚 Courses (53 Enterprise Security Curriculum & Modules)
│   ├── 🎮 Simulations (Attack & Defense Threat Labs)
│   ├── 🏆 Certifications (Credential Verification & Revocation)
│   ├── ❓ Assessments / Quizzes (Examination Question Bank)
│   └── 📈 Learning Analytics (Workforce Engagement & Completion)
│
├── [FLOTBOT SECURITY (EDR/XDR)]
│   ├── 🛡️ Security Dashboard (SOC Overview & Threat Trends)
│   ├── ⚠️ Alerts (Real-Time Sensor Alerts & 7-Stage History)
│   ├── 🔥 Threat Detections (High/Critical Vector Triage)
│   ├── 📡 Live Telemetry (Process Trees & Network Sockets)
│   ├── 🗄️ IOC Management (Hashes, IPs, Domains, Processes)
│   ├── 🎛️ Threat Rules (Heuristic Rules & Toggle Engine)
│   ├── 🤖 AI Security Analysis (Ollama Qwen2.5 Copilot)
│   ├── 👤 Employee Security Behaviour (Dynamic Posture Scores)
│   ├── 📜 Alert Handling History (Chronological Event Audit)
│   ├── 📄 Security Reports (Threat Intelligence Summaries)
│   └── ⚙️ FlotBot Configuration (Sensor Sensitivity Policies)
│
└── [SYSTEM & GOVERNANCE]
    ├── 📢 Announcements (Enterprise Security Bulletins)
    ├── 🧑‍💼 Admin & Roles (RBAC Hierarchy Matrix)
    ├── 📜 Audit Logs (Immutable Administrator Actions)
    └── ⚙️ Settings (Backend & Database Telemetry)
```

---

## 3. Detailed Feature Breakdown

### 3.1. Executive Operations Dashboard (`Dashboard`)
* **Live Database Metrics**:
  * **Total & Active Employees**: Real-time count of registered corporate users from PostgreSQL `users` table.
  * **Course Curriculum**: 53 published enterprise courses, total workforce enrollments, and overall completion rate.
  * **Simulation Labs**: Total scenario attempts, average passing scores, and certified employee count.
  * **Active Threat Posture**: Real-time active threats vs. resolved threats from `alerts` table.
* **Live FlotBot EDR Alert Feed**: Chronological list of incoming sensor triggers with color-coded severity badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
* **Severity Distribution Bars**: Percentage breakdown of all recorded threats across the fleet.

---

### 3.2. Employee Administration (`Users`)
* **Directory Search & Filter**: Search by employee name, corporate email, department, or organization with instant role and status filters (`ACTIVE`, `SUSPENDED`, `INACTIVE`).
* **Dual-Activity Employee Inspector Modal**:
  1. **Identity & RBAC Controls**: View Firebase UID, registration date, last active timestamp, and dynamically modify workforce roles.
  2. **Security Training Activity**: Live stats on enrolled courses, completed modules, attack simulation runs, and earned certifications.
  3. **FlotBot EDR Security Activity**: Associated host security alerts, AI explanations requested, defensive actions taken, and the calculated **Security Posture Score (0–100)**.

---

### 3.3. Enterprise Curriculum Management (`Courses`)
* **Catalog Browser**: Filter and search through all 53 cybersecurity courses (Phishing Defense, Network Hardening, Cloud Security, Cryptography, Incident Response).
* **Course Authoring**: Create, edit, and delete courses, modules, interactive lessons, and credential issuance rules.

---

### 3.4. Attack & Defense Simulations (`Simulations`)
* **Enterprise Lab Scenarios**: Review scenarios (Urgent Executive Phishing, IT Helpdesk Vishing, Malicious QR Codes, MFA Push Fatigue, Ransomware Outbreak).
* **Live Tactical Performance**: Real-time statistics on total workforce attempts, average score, and safe defense pass rate.

---

### 3.5. Certification Registry (`Certifications`)
* **Cryptographic Verification**: Search any Credential ID (`CG-CERT-...`) to view the recipient employee, course, exam score, and SHA-256 verification hash.
* **Authorized Revocation**: Revoke compromised or expired credentials with required audit rationale logging.

---

### 3.6. FlotBot EDR / SOC Security Operations
* **Security Dashboard**: High-level SOC view with threat counts, active IOC counts, and MITRE category distributions.
* **Alert Triage & Investigation Modal**:
  * View technical description, remediation guidance, and raw evidence telemetry (PIDs, parent processes, command line arguments, destination IP/ports).
  * **7-Stage Lifecycle Event Tracking**:
    $$\text{Detected} \longrightarrow \text{Displayed} \longrightarrow \text{Viewed} \longrightarrow \text{AI Explained} \longrightarrow \text{Acknowledged} \longrightarrow \text{Investigated} \longrightarrow \text{Resolved}$$
  * **Ollama AI Integration**: Click **Explain with AI** to generate deep root cause analysis, MITRE ATT&CK technique mappings, and threat debriefs.
  * **Action Controls**: Acknowledge alerts and close incidents with documented resolution notes.
* **IOC Management**: Add, search, filter, and delete Indicators of Compromise across 4 indicator types (IP Addresses, Domains, SHA256 Hashes, Process Names).
* **Threat Rule Engine**: Enable or disable heuristic detection rules (`R-EXEC-01`, `R-NET-01`, etc.) with instant state reflection.
* **AI Security Copilot**: Interactive security analyst prompt console connected to the local Ollama engine for threat hunting assistance.
* **Employee Security Behaviour**: Fleet-wide table calculating real individual employee security posture scores based on user vigilance and alert response speed.

---

### 3.7. Immutable Admin Audit Trail (`Audit Logs`)
* **Automatic Logging**: Every privileged operation (role changes, status modifications, course deletions, certificate revocations, rule toggles) writes an immutable record to the `admin_audit_logs` table.
* **Log Explorer**: Search by administrator, action code (`USER_ROLE_CHANGED`, `CERTIFICATE_REVOKED`), or target resource.

---

## 4. How to Run the Admin Console

### Option 1: Run Backend & Admin Console Concurrently (Recommended)
```bash
npm run admin:all
```

### Option 2: Run Admin Console Standalone
```bash
npm run admin
```
* **Admin URL**: [`http://localhost:5174`](http://localhost:5174)

---

## 5. Summary of Admin Console NPM Scripts

| Script Command | Purpose | Port |
| :--- | :--- | :--- |
| `npm run admin` | Launch the Enterprise Admin Console standalone | `http://localhost:5174` |
| `npm run admin:all` | Concurrently start Backend API + Admin Console | Ports `5000` & `5174` |
| `npm run server` | Launch the Unified Express Backend API | `http://localhost:5000` |
| `npm run server:test` | Execute the 31-point backend automated test suite | Test Port `5098` |
| `npm run dev` | Launch the Employee Security Awareness Portal | `http://localhost:5173` |

---

## 6. Latest Production Updates & Enhancements

### 6.1. Full Enterprise Curriculum & Simulation Suite Database Population
* **53 Courses Loaded**: Database initialization (`server/db/init.js`) now dynamically parses and seeds all 53 canonical enterprise training courses from `src/data/coursesData.ts` including complete module hierarchies, reading lessons, and final certification exam quizzes.
* **47 Simulation Scenarios Loaded**: All 47 threat scenarios (`SE-001` through `SE-052`) across Phishing, Vishing, Quishing, Smishing, MFA Fatigue, Ransomware, USB Drop, and Deepfake Pretexting are verified and seeded in PostgreSQL/SQLite.

### 6.2. Interactive Admin Authoring & Customization Modals
* **Course Customizer (`CourseFormModal`)**:
  * **Tab 1 - Meta**: Edit Title, Slug, Category, Difficulty, Estimated Duration, Provider, Description, and Learning Objectives.
  * **Tab 2 - Modules & Lessons**: Add and modify training modules with customizable titles, descriptions, reading bodies, and duration tags.
  * **Tab 3 - Quiz Assessment**: Author multiple-choice certification questions with custom options, correct answer indices, and answer explanations.
  * **Backend Route**: `POST /api/admin/courses` and `PUT /api/admin/courses/:id`.
* **Simulation Customizer (`SimulationFormModal`)**:
  * **Scenario Attributes**: Configure ID, Title, Category, Difficulty, Duration (mins), XP reward, UI Icon, and Impersonated Brand.
  * **Vector Simulation**: Target environments (`email`, `phone`, `qr`, `sms`, `mfa`, `usb`, `web`, `terminal`).
  * **Hint Configuration**: Configure multi-level tiered hints with customizable score penalty values.
  * **Backend Route**: `POST /api/admin/simulations`, `PUT /api/admin/simulations/:id`, and `DELETE /api/admin/simulations/:id`.

### 6.3. Instant User Database Synchronization
* **Automatic Registration Sync**: Whenever a user registers or logs in via Google/Email authentication in the Employee Security Portal (`src/context/AuthContext.tsx`), the application automatically dispatches `api.auth.sync()` to insert or update the user record into the PostgreSQL/SQLite `users` table.
* **Real-Time Admin Visibility**: New employees immediately appear in the Admin Console under **Users & Employees** (`http://localhost:5174`) with their live profile, role, security score, and enrollment tracking.

### 6.5. Pure PostgreSQL Database Operation & Dashboard Telemetry
* **PostgreSQL-Exclusive Architecture**: Completely transitioned database engine from SQLite to active PostgreSQL (`localhost:5432/cyberguardian`) with zero SQLite dependencies or fallback overhead.
* **Unified Dashboard Curriculum & Simulation Cards**: Enhanced `AdminDashboardView.tsx` to directly fetch and showcase the **53 Enterprise Security Courses** and **47 Attack & Defense Labs** in interactive card grids with direct navigation into detailed management views.
* **Continuous 10-Second Live Polling**: Dashboard metrics, newly registered workforce users, and live threat telemetry automatically refresh on a 10-second heartbeat without manual page reloads.
* **Zero-Failure Logo Resolution**: Migrated brand logo assets (`logo-icon.png`, `logo-full.png`, `shield.svg`) across all layout and auth components (`GlowShield.tsx`, `AuthLayout.tsx`, `Sidebar.tsx`) to imported Vite bundles with inline SVG fallbacks, completely resolving broken logo images across all environments.

---
*Created for CyberGuardian Enterprise AI & FlotBot Defender.*

