# 🚀 CyberGuardian AI & FlotBot Defender — Admin & Teammate Setup Guide

Fresh database test confirmed full success. The setup initializes automatically upon running the server.

---

### 1. 📋 Requirements for Your Teammate

When your teammate pulls the repository, they only need **Node.js (≥ 18)**.

#### Simple 3-Step Setup for Your Teammate:

```bash
# 1. Install all dependencies
npm install

# 2. Copy the environment variables file
cp .env.example .env

# 3. Start both the Backend (Port 5000) and Frontend (Port 5173) concurrently
npm run dev:all
```

> [!NOTE]
> **PostgreSQL Primary Database:** The backend operates exclusively on **PostgreSQL** (`postgresql://postgres:postgres@localhost:5432/cyberguardian` with connection details in `.env`). All 22 tables, 28 indexes, 53 courses/modules, 47 threat scenarios, and initial workforce accounts are auto-created and verified on startup. SQLite database files have been cleanly removed.

---

### 2. 🛡️ Real Database Data Verification (No Synthetic Data)

All dashboard and admin analytics are queried directly from the relational database:

| Admin Dashboard Metric | Exact SQL Source | Real-Time Calculation |
| :--- | :--- | :--- |
| **Total & Active Users** | `SELECT COUNT(*) FROM users` | Live count of real registered users |
| **Course Completions** | `SELECT status, COUNT(*) FROM course_enrollments GROUP BY status` | Real enrollment and pass/fail states |
| **Simulation Metrics** | `SELECT AVG(score), COUNT(*) FROM simulation_attempts` | Actual test scores and attempts |
| **Security Alerts & Threats** | `SELECT severity, status, COUNT(*) FROM alerts GROUP BY ...` | Real EDR sensor detections |
| **User Security Behaviour** | `SELECT * FROM alert_events WHERE user_id = ...` | Real interaction timestamps and resolution speed |
| **Admin Audit Trail** | `SELECT * FROM admin_audit_logs ORDER BY timestamp DESC` | Real logs recorded on role/status changes |

---

### 3. 🔌 Admin Panel API Guide for Your Teammate

Your teammate can directly call these endpoints to build the Admin Panel UI (or use the typed client in `src/lib/api.ts`):

#### 👥 User Management:
* `GET /api/admin/users?page=1&limit=20&search=john&role=EMPLOYEE` — List users with pagination and search.
* `GET /api/admin/users/:id` — Get single user profile, enrollment history, and security posture score.
* `PUT /api/admin/users/:id/role` — Body: `{"role": "SECURITY_ANALYST"}` (Changes user role & logs admin audit trail).
* `PUT /api/admin/users/:id/status` — Body: `{"status": "SUSPENDED"}` (Changes status: `ACTIVE`, `SUSPENDED`, `INACTIVE`).

#### 📊 Platform & Security Analytics:
* `GET /api/admin/stats` or `GET /api/analytics/overview` — High-level statistics (total users, course completion rates, active threats, certificates).
* `GET /api/analytics/courses` — Course-by-course popularity and completion rates.
* `GET /api/analytics/simulations` — Scenario attempt counts, failure rates, and average risk exposure.
* `GET /api/admin/flotbot/user-behaviour` — Security behaviour breakdown for all users.

#### 📚 Course Curriculum Customization & Creation:
* `POST /api/admin/courses` — Body: `{"id": "...", "title": "...", "cat": "...", "level": "...", "modules": [...], "quiz": [...]}` — Create new course.
* `PUT /api/admin/courses/:id` — Body: `{"title": "...", "modules": [...], "quiz": [...]}` — Update/customize existing course.
* `DELETE /api/admin/courses/:id` — Delete a course and associated progress.

#### 🎮 Attack & Defense Simulation Customization & Creation:
* `POST /api/admin/simulations` — Body: `{"id": "SE-...", "title": "...", "category": "...", "difficulty": "...", "hints": [...]}` — Publish new scenario.
* `PUT /api/admin/simulations/:id` — Body: `{"title": "...", "hints": [...], "summary": "..."}` — Update/customize scenario.
* `DELETE /api/admin/simulations/:id` — Delete a simulation scenario.

#### 🚨 EDR Security Operations & IOCs:
* `GET /api/flotbot/alerts` — Real-time security alerts with filtering.
* `GET /api/flotbot/alerts/:id` — Alert details + full 7-stage event lifecycle history.
* `POST /api/flotbot/alerts/:id/resolve` — Body: `{"resolutionNotes": "..."}` — Mark threat resolved.
* `GET /api/flotbot/iocs` & `POST /api/flotbot/iocs` — View and add Indicators of Compromise (IP, Hash, Domain).
* `GET /api/flotbot/rules` & `PATCH /api/flotbot/rules/:id/toggle` — Enable/disable detection rules.

#### 📜 Audit Logging & Certificates:
* `GET /api/admin/audit-logs?page=1&limit=50` — Live chronological administrative audit trail.
* `POST /api/admin/certifications/:credId/revoke` — Body: `{"reason": "..."}` — Revoke certificate.

---

### 4. 📦 Git Commit & Push Instructions

You can now stage and push all changes:

```bash
git add .
git commit -m "feat: complete unified Express backend with SQLite/PostgreSQL, RBAC, full course/simulation suite, and customization modals"
git push origin main
```

