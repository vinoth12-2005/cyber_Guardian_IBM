# 🛡️ CyberGuardian AI & FlotBot Defender — Enterprise Cybersecurity Suite

> **A Complete Unified Security Platform with Real-Time Endpoint Detection & Response (EDR), Threat Intelligence, Role-Based Access Control (RBAC), Interactive Cyber Simulations, and Proctored Security Courses.**

---

## ⚡ Zero-Setup Quick Start (Run on Any Friend's System)

All API keys (Firebase, Google Gemini, VirusTotal, Google Safe Browsing, Hybrid Analysis) and database configurations are pre-bundled in the repository. No manual API setup or key generation is needed!

### 1. Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
Clone the repository and install dependencies:
```bash
git clone git@github.com:vinoth12-2005/cyber_Guardian_IBM.git
cd cyber_Guardian_IBM
npm install
```

### 3. Run Everything in One Command
```bash
npm run full:all
```
This single command automatically boots:
- 🚀 **Unified Backend API** on [http://localhost:5000](http://localhost:5000)
- 👤 **Employee Security Portal** on [http://localhost:5173](http://localhost:5173)
- 👑 **Enterprise Admin Console** on [http://localhost:5174](http://localhost:5174)

---

## 🌐 Quick URL & Port Directory

| Service | Port / URL | Command to Run Individually | Description |
| :--- | :--- | :--- | :--- |
| **All-in-One Suite** | `5000`, `5173`, `5174` | `npm run full:all` | Runs Backend, User Portal & Admin Console together |
| **Backend API Gateway** | [`http://localhost:5000`](http://localhost:5000) | `npm run server` | REST API, RBAC, DB ORM, Threat Intel |
| **Employee Portal** | [`http://localhost:5173`](http://localhost:5173) | `npm run dev` | User training, attack labs, certificates |
| **Admin Console** | [`http://localhost:5174`](http://localhost:5174) | `npm run admin` | Role governance, course studio, live EDR |
| **Backend + User Portal**| `5000` & `5173` | `npm run dev:all` | Employee experience with backend |
| **Backend + Admin Console**| `5000` & `5174` | `npm run admin:all` | Admin studio with backend |
| **Desktop App (Electron)** | Desktop Window | `npm run electron:dev` | Native desktop wrapper for employee app |
| **FlotBot EDR Sensor** | Desktop Daemon | `npm start` | Native OS process, socket, & file entropy engine |

---

## 🗄️ Database Architecture (Automatic Zero-Setup Fallback)

The platform supports both **PostgreSQL** and **SQLite**:
1. **Default / Zero-Setup**: If PostgreSQL is not installed or running, the server automatically and seamlessly falls back to the embedded **SQLite** engine (`FlotBot/data/cyberguardian_unified.db`). It automatically creates all 22 tables and seeds all 53 courses, 47 simulations, default threat rules, and IOCs.
2. **PostgreSQL Mode**: If you have PostgreSQL running locally or want to use Docker:
   ```bash
   # Optional: start PostgreSQL via Docker
   docker compose up -d
   ```
   PostgreSQL connection settings in `.env`:
   - Host: `localhost:5432`
   - Database: `cyberguardian`
   - Username: `postgres`
   - Password: `postgres`

---

## 🧪 Verification & Automated Tests

Verify the entire system (all 22 relational tables, RBAC privileges, courses, simulations, certificates, and EDR feeds):

```bash
# Run the 31-point comprehensive backend test suite
npm run server:test

# Run the 50-point RBAC privilege verification matrix
node server/test-rbac-verification.js
```

---

## 🔑 Pre-Configured APIs & Feeds Included
- **Google Firebase**: Authentication, User Sessions, Profile Sync
- **Google Gemini AI Studio**: FlotBot threat incident explanations and AI chatbot
- **VirusTotal API v3**: File hash reputation and malware detection
- **Google Safe Browsing API v4**: Phishing, malware, and harmful URL scanner
- **Hybrid Analysis API v2**: Automated sandbox analysis and threat scoring

---

## 📦 Production Builds

```bash
# Build Employee Web Portal
npm run build

# Build Admin Console
npx vite build admin
```
