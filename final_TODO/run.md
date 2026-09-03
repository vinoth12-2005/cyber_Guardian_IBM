# 🚀 CyberGuardian Enterprise AI & FlotBot Defender — Complete Execution & Database Guide

> **Official Operating Guide: How to run each component independently, access PostgreSQL/SQLite databases, inspect live telemetry, and troubleshoot for Enterprise Workforce Deployments (e.g. IBM).**

---

## 1. 🌐 Quick Port & URL Reference

| Component | Type | Command | URL / Address |
| :--- | :--- | :--- | :--- |
| **Backend API Gateway** | Web Server / REST API | `npm run server` | [`http://localhost:5000`](http://localhost:5000) (`/api`) |
| **Enterprise Admin Panel** | Web Application | `npm run admin` | [`http://localhost:5174`](http://localhost:5174) |
| **Backend + Admin (Together)** | Full Admin Suite | `npm run admin:all` | Ports `5000` & `5174` |
| **Employee Security Portal** | Web Application | `npm run dev` | [`http://localhost:5173`](http://localhost:5173) |
| **Employee App (Desktop)** | Desktop App (Electron) | `npm run electron:dev` | Desktop Window |
| **FlotBot EDR Sensor Suite** | Desktop Daemon / Agent | `npm start` | Background Host Agent |
| **PostgreSQL Database** | Relational Database | System Service | `localhost:5432` (`cyberguardian`) |

---

## 2. 📋 Prerequisites & Initial Setup

Before running any component for the first time on any system:

```bash
# 1. Install all dependencies
npm install

# 2. Copy the environment configuration template
cp .env.example .env

# 3. (Optional) Verify backend and database with automated tests
npm run server:test
```

---

## 3. 🎯 How to Run Each Component Separately

### 3.1. Running the Unified Backend API
The backend handles PostgreSQL database connections, Firebase Google Auth synchronization, RBAC authorization, and API routes.

```bash
# Start the Backend Server on Port 5000
npm run server
```
* **Health Check**: Open your browser or run:
  ```bash
  curl http://localhost:5000/health
  # Expected Response: {"status":"ok","database":"CONNECTED"}
  ```

---

### 3.2. Running the Enterprise Admin Console
The Admin Panel is a **standalone web application** that manages employees, training modules, attack simulations, certifications, and live FlotBot EDR threat alerts.

#### Option A: Run Backend & Admin Panel Together in One Command (Recommended)
```bash
npm run admin:all
```

#### Option B: Run Admin Panel Separately (If Backend is already running)
```bash
# In a new terminal:
npm run admin
```
* **Admin Console URL**: Open [`http://localhost:5174`](http://localhost:5174) in any browser (Chrome, Firefox, Edge, Safari).

---

### 3.3. Running the Employee Security Portal

#### Option A: Run as a Web Application (In Browser)
```bash
# In a new terminal:
npm run dev
```
* **Employee Web App URL**: Open [`http://localhost:5173`](http://localhost:5173) in your browser.

#### Option B: Run as a Desktop Application (Electron)
```bash
npm run electron:dev
```

---

### 3.4. Running FlotBot EDR Sensor Suite (Desktop Daemon)
FlotBot captures low-level OS process trees, active network sockets, Shannon file entropy, and persistence mechanisms.

```bash
npm start
```

---

## 4. 🗄️ How to Access and View the Database

The application connects exclusively to **PostgreSQL** (`localhost:5432/cyberguardian`). All 22 tables, 28 indexes, 53 courses, 47 simulation scenarios, and initial workforce accounts are stored in PostgreSQL.

---

### 4.1. Accessing PostgreSQL Database

#### Method A: Using the `psql` Command Line
```bash
# Connect to PostgreSQL using your configured database name
psql -U postgres -d cyberguardian -h localhost -p 5432
```

#### Common PostgreSQL Commands:
```sql
-- 1. List all 22 database tables
\dt

-- 2. View all registered employees and their roles
SELECT id, name, email, role, status, xp, level FROM users;

-- 3. View live security alerts from FlotBot sensors
SELECT id, severity, title, status, source, timestamp FROM alerts ORDER BY timestamp DESC;

-- 4. View enterprise course catalog and enrollment progress
SELECT id, title, cat, level FROM courses LIMIT 10;
SELECT * FROM course_enrollments;

-- 5. View attack simulation attempts and defense scores
SELECT * FROM simulation_attempts ORDER BY created_at DESC;

-- 6. View issued certificates and SHA-256 anti-tamper hashes
SELECT cred_id, recipient_name, course_title, score, verification_hash FROM certifications;

-- 7. View immutable administrative audit trail
SELECT timestamp, admin_email, action, resource FROM admin_audit_logs ORDER BY timestamp DESC;

-- 8. Exit psql
\q
```

#### Method B: Using Graphical Database Clients
You can connect using any GUI tool like **DBeaver**, **pgAdmin 4**, or the **VS Code Database Client**:
* **Host**: `localhost`
* **Port**: `5432`
* **Database**: `cyberguardian`
* **Username**: `postgres` (or your Postgres user)
* **Password**: `postgres` (or your Postgres password)

---

### 4.2. Accessing the SQLite Database (Fallback)

If you are using the embedded SQLite engine:

```bash
sqlite3 FlotBot/data/cyberguardian_unified.db
```

```sql
-- List all tables
.tables

-- View employees
SELECT id, name, email, role FROM users;

-- View alerts
SELECT id, severity, title, status FROM alerts;

-- Exit sqlite3
.exit
```

---

## 5. 🧪 Running Verification Tests

To verify that all 22 database tables, RBAC roles, course progress APIs, simulation scores, and FlotBot alert lifecycles are operating correctly:

```bash
npm run server:test
```
* **Expected Output**: `🏁 Test Summary: 31 Passed, 0 Failed`.

---

## 6. 🚀 Verification of Course & Simulation Authoring in Admin Console

1. **Start the Unified Backend and Admin Console**:
   ```bash
   npm run admin:all
   ```
2. **Access the Admin Console**: Open [`http://localhost:5174`](http://localhost:5174).
3. **Verify Course Management**:
   * Navigate to **Courses** in the sidebar. All 53 enterprise courses will be loaded.
   * Click **+ Add Course** to launch the 3-step authoring modal (Metadata, Modules & Lessons, Certification Exam Quiz).
   * Click **Customize** on any course to modify its curriculum or examination questions in real time.
4. **Verify Simulation Labs**:
   * Navigate to **Simulations** in the sidebar. All 47 threat scenarios (`SE-001` through `SE-052`) will be loaded.
   * Click **+ Add Simulation** to create a custom scenario with interactive environment selection and tiered hint penalties.
   * Click **Customize** on any scenario to adjust the threat narrative, XP rewards, or objectives.
5. **Verify Real-Time User Creation**:
   * In a new tab, open [`http://localhost:5173`](http://localhost:5173) and register a new user.
   * Check the Admin Console under **Users & Employees** ([`http://localhost:5174`](http://localhost:5174)) — the user is instantly synced to the database and appears live with their real-time profile and security score.

---
*Created for CyberGuardian Enterprise AI & FlotBot Defender.*

