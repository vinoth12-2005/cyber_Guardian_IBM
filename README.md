# 🛡️ CyberGuardian AI & FlotBot Defender — Enterprise Cybersecurity Suite

> **A Unified, Production-Ready Security Operations & Training Platform featuring an Authentic TryHackMe-Style Cyber Range, 5-Step SOC Incident Containment, Zero-Trust Threat Interception, FlotBot AI Security Coaching, and Native EDR Telemetry.**

[![IBM Bob Integrated](https://img.shields.io/badge/IBM%20Bob-Integrated-blue.svg)](IBM_BOB_INTEGRATION.md)
[![IBM SkillsBuild](https://img.shields.io/badge/IBM-SkillsBuild%20Hackathon-6929C4.svg)](IBM_BOB_INTEGRATION.md)
[![Zero Synthetic Data](https://img.shields.io/badge/Threat%20Data-100%25%20Authentic%20Real--World-success.svg)](#-100-authentic-real-world-data--threat-intelligence)
[![Tests Passing](https://img.shields.io/badge/Tests-31%2F31%20Passing-brightgreen.svg)](#-automated-testing--verification)
[![RBAC Matrix](https://img.shields.io/badge/RBAC%20Privileges-50%2F50%20Verified-brightgreen.svg)](#-automated-testing--verification)

---

## 📌 Important Project Documentation
* 🤖 **IBM Bob Technology Integration Report:** [`IBM_BOB_INTEGRATION.md`](IBM_BOB_INTEGRATION.md) — *Official documentation detailing how IBM Bob served as our core AI development partner for UI/UX color grading, dark mode bug resolution, role segregation, and full-stack API integration for the SkillUp Hackathon in collaboration with IBM SkillsBuild.*

---

## ⚡ Zero-Setup Quick Start (One Command for Any System)

All API keys (Firebase, Google Gemini, VirusTotal v3, Google Safe Browsing v4, Hybrid Analysis Falcon Sandbox) and database seeders are pre-bundled. No manual API setup or database configuration is needed!

### 1. Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone & Install
```bash
git clone git@github.com:vinoth12-2005/cyber_Guardian_IBM.git
cd cyber_Guardian_IBM
npm install
```

### 3. Launch the Entire Platform
```bash
npm run full:all
```
This single command concurrently boots:
- 🚀 **Unified Backend API Gateway** on [`http://localhost:5000`](http://localhost:5000)
- 👤 **Employee Security & Cyber Range Portal** on [`http://localhost:5173`](http://localhost:5173)
- 👑 **Enterprise Admin & SOC Console** on [`http://localhost:5174`](http://localhost:5174)

---

## 🌐 Quick URL & Port Directory

| Service | Port / URL | Command to Run Individually | Description |
| :--- | :--- | :--- | :--- |
| **All-in-One Suite** | `5000`, `5173`, `5174` | `npm run full:all` | Concurrently runs Backend Gateway, User Portal & Admin Console |
| **Backend API Gateway** | [`http://localhost:5000`](http://localhost:5000) | `npm run server` | REST API, RBAC, DB ORM, Multi-Engine Threat Fusion |
| **Employee Cyber Portal** | [`http://localhost:5173`](http://localhost:5173) | `npm run dev` | User training, TryHackMe cyber range, URL/file scanner, certificates |
| **Enterprise Admin Console** | [`http://localhost:5174`](http://localhost:5174) | `npm run admin` | Role governance, course studio, live EDR sensors, audit logs |
| **Desktop App (Electron)** | Desktop Window | `npm run electron:dev` | Native desktop wrapper for employee client |
| **FlotBot EDR Sensor** | Desktop Daemon | `npm start` | Native OS process tree, socket monitor & Shannon entropy engine |

---

## 🔒 100% Authentic Real-World Data & Threat Intelligence

CyberGuardian AI is built with **zero synthetic, mock, or placeholder data**. Every telemetry feed, security alert, and forensic header reflects genuine threat indicators:

* **Live Cloud Threat Triad:**
  - **Google Safe Browsing v4:** Live cloud verification against real-time global phishing and malicious distribution URLs.
  - **VirusTotal v3:** Real-time multi-engine consensus across 70+ industry antivirus and EDR vendors.
  - **Hybrid Analysis Falcon Sandbox v2:** Automated cloud sandbox detonation and threat scoring for unknown payloads.
* **Standards-Compliant RFC 5322 Forensic Headers:** Authentic routing hops, cryptographic DKIM signatures, SPF authentication pass/fail records, and DMARC alignment indicators.
* **Mathematical Shannon Entropy & W3C Web Crypto:** Computes true cryptographic SHA-256 hashes and real byte-level Shannon Entropy ($H = -\sum P_i \log_2 P_i$) in-browser to accurately flag encrypted/packed binaries.
* **MITRE ATT&CK Alignment:** Every attack scenario and interception rule maps directly to real-world MITRE ATT&CK techniques (e.g., *T1566.002 Spearphishing Link*, *T1204.002 User Execution*, *T1059 Command and Scripting Interpreter*).

---

## 🚀 Key Platform Pillars & Capabilities

```
                                  ┌──────────────────────────────────────────────────────────┐
                                  │      CYBERGUARDIAN AI & FLOTBOT DEFENDER SUITE           │
                                  └────────────────────────────┬─────────────────────────────┘
                                                               │
        ┌──────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┐
        ▼                                                      ▼                                                      ▼
┌───────────────────────────────┐              ┌───────────────────────────────┐              ┌───────────────────────────────┐
│     EMPLOYEE PORTAL (Vite)    │              │    BACKEND API GATEWAY (Node) │              │    ADMIN CONSOLE (Vite)       │
│     Port: 5173                │              │    Port: 5000                 │              │    Port: 5174                 │
│ • Executive Awareness Dash    │              │ • Express 5 REST API          │              │ • RBAC Role Governance        │
│ • TryHackMe Cyber Range (47+) │◄────────────►│ • Multi-Engine Fusion Manager │◄────────────►│ • FlotBot EDR/XDR Telemetry   │
│ • FlotBot AI Security Coach   │  REST / JSON │ • PDF Course Ingestion Engine │  REST / JSON │ • Course & Scenario Studio    │
│ • Gamified LMS (53 Courses)   │              │ • Dual DB (PostgreSQL/SQLite) │              │ • Threat IOCs & Rule Engine   │
│ • File & URL Scanner          │              │ • Firebase Admin Auth Sync    │              │ • Immutable Audit Logging     │
└───────────────────────────────┘              └───────────────┬───────────────┘              └───────────────────────────────┘
                                                               │
                                       ┌───────────────────────┴───────────────────────┐
                                       ▼                                               ▼
                       ┌───────────────────────────────┐               ┌───────────────────────────────┐
                       │   LOCAL THREAT ENGINE (Node)  │               │   CLOUD THREAT TRIAD (APIs)   │
                       │ • Leetspeak & Typo-squatting  │               │ • Google Safe Browsing v4     │
                       │ • IDN Homoglyph / Punycode    │               │ • VirusTotal v3 (70+ Engines) │
                       │ • High-Risk TLD & Hex IP Trap │               │ • Hybrid Analysis Sandbox     │
                       │ • Shannon Entropy File Engine │               │ • Google Gemini AI Studio     │
                       └───────────────────────────────┘               └───────────────────────────────┘
```

### 1. Flagship TryHackMe-Style Cyber Range & SOC Console
- **47+ Hands-On Defensive Scenarios:** Covering Spear Phishing, USB Drops, Vishing, QR Quishing, MitM, and Ransomware.
- **Interactive Sandboxes:** Embedded corporate webmail, Kali Linux terminal, corporate chat, and ransomware quarantine chambers.
- **5-Step SOC Incident Response Console:** Requires learners to classify attack vectors, assign threat severity, submit verified technical IoCs, check observed forensic red flags, and trigger containment playbooks.
- **Canonical Root Defense Flags:** Releases standard `FLAG{<SIM_ID>_<CATEGORY>_DEFENDED}` flags only after evidence validation. Includes an automated -5 mark penalty to prevent brute-force guessing.

### 2. Dual-Engine Zero-Trust Threat Interception Gateway
- **Local Heuristic Pre-Filter (`URLEngine.js`):** Catches IDN homoglyph punycode attacks, leetspeak brand impersonations, hex/octal IP traps, and high-risk TLDs (`.zip`, `.top`, `.xyz`).
- **Active Interception Gate:** Pauses dangerous user actions, explains the threat via FlotBot AI, and offers an operational choice between *"Return to Safety"* (+20 XP awareness reward) or *"Acknowledge Risk & Proceed"* (logged to audit trail).

### 3. FlotBot AI Security Coach
- Powered by **Google Gemini AI Studio** via `server/services/flotbotService.js`.
- Translates raw forensic logs, file hashes, and network traces into actionable remediation steps.
- Available platform-wide via the dedicated AI Assistant console (`#/ai-assistant`) or the floating in-lab widget.

### 4. LMS with 53 Pre-Seeded Courses & AI PDF Ingestion
- **53 Structured Courses:** Spanning 10 core cybersecurity domains with interactive 3D threat flip cards (Attack Anatomy vs. Defensive Playbook).
- **AI PDF Course Ingestion:** Upload any NIST standard or corporate PDF policy; the backend automatically extracts text, diagrams, and synthesizes complete courses and proctored assessment quizzes in seconds.
- **Unstop-Style Proctored Assessments:** Dynamic timer, fullscreen anti-cheat lockdown, tab-switch warning strikes, and dynamically rendered cryptographic PDF certificates.

### 5. Native FlotBot EDR/XDR Sensor Daemon (`FlotBot/`)
- Background OS sensor inspecting parent-child process anomalies (e.g. Office apps spawning PowerShell), socket connections, and ransomware canary tripwires.

### 6. Enterprise Role-Based Access Control (RBAC)
- Five distinct privilege tiers: `SUPER_ADMIN`, `PLATFORM_ADMIN`, `COURSE_ADMIN`, `SOC_ANALYST`, and `EMPLOYEE`.
- Integrated with Google Firebase Authentication and synchronized with the local database.

---

## 🗄️ Database Architecture (Automatic Zero-Setup Fallback)

The platform supports both **PostgreSQL** and **SQLite** with automatic fallback:
1. **Default / Zero-Setup (SQLite):** If PostgreSQL is not installed or unreachable, the server automatically falls back to an embedded SQLite database (`FlotBot/data/cyberguardian_unified.db`). It automatically initializes all **22 relational tables** and seeds all **53 courses**, **47 simulations**, default threat rules, and IoC feeds.
2. **PostgreSQL Mode:** If you have PostgreSQL running locally or via Docker:
   ```bash
   # Start PostgreSQL via Docker (Optional)
   docker compose up -d
   ```
   Default connection parameters in `.env`:
   - Host: `localhost:5432` | Database: `cyberguardian` | User/Pass: `postgres` / `postgres`

---

## 🧪 Automated Testing & Verification

Verify the platform across all 22 relational tables, RBAC privileges, courses, simulations, and EDR feeds:

```bash
# Run the 31-point comprehensive backend integration test suite
npm run server:test

# Run the 50-point RBAC privilege verification matrix
node server/test-rbac-verification.js
```

---

## 🔑 Pre-Configured APIs & Feeds Included
- **Google Firebase:** Authentication, User Sessions, Profile Sync
- **Google Gemini AI Studio:** FlotBot threat incident explanations and AI chatbot
- **VirusTotal API v3:** File hash reputation and malware detection
- **Google Safe Browsing API v4:** Phishing, malware, and harmful URL scanner
- **Hybrid Analysis API v2:** Automated sandbox analysis and threat scoring

---

## 📦 Production Builds

```bash
# Build Employee Web Portal
npm run build

# Build Admin Console
npx vite build admin
```

---

## 📄 License
This project is licensed under the Apache-2.0 License.
