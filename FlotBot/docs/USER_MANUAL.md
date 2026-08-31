# FlotBot Endpoint Security Protection Console – User Manual

Welcome to **FlotBot**, a premium Windows endpoint monitoring and detection software designed to safeguard your local machine.

---

## 🛠️ Installation & First-Time Setup

1. **System Requirements**: 
   - Windows 10 / 11.
   - Node.js environment (v18.0.0 or higher recommended for running from source).
2. **Environment Variables**:
   - Rename `.env.example` in the installation folder to `.env`.
   - Open `.env` and configure your `GEMINI_API_KEY` (Generate one at [Google AI Studio](https://aistudio.google.com/)). This allows the AI Security Analyst Copilot to explain threat alerts and suggest containment strategies.
3. **Execution**:
   - Open a terminal in the project directory and run:
     ```bash
     npm install
     npm start
     ```
   - *Note:* For registry, process path query, and connection port correlation, running the prompt shell with Administrator rights is recommended.

---

## 🖥️ Console Features

### 1. System Overview Dashboard
- **Threat Level Indicator**: Displays a color-coded gauge from 0% (Secure) to 100% (Critical Incident) calculated dynamically from active alert logs.
- **Scanning State**: Displays monitoring heartbeat status.
- **Recent Threats**: Lists up to 5 unacknowledged threats for quick review. Click "Inspect" on any row to open the details modal.

### 2. Security Alerts Console
- Filter alerts based on **Severity** (Critical, High, Medium, Low) or **Source module**.
- Review alerts, verify evidence, and click **Acknowledge** or **Acknowledge All** to archive resolved threat warnings.

### 3. Monitoring Tabs
- **Processes**: A live grid tracking PID, executable image name, command-line arguments, parent process PID, and memory footprints.
- **Network**: Displays active established sockets, local port, remote IP address endpoints, and routing PIDs.
- **Registry**: Displays monitored startup Run keys and active Windows service locations configured for persistence.

### 4. AI Security Copilot
- Talk to the built-in Gemini Security Copilot about threat signatures, suspicious network endpoints, or general security hygiene.
- It automatically pulls context on active system warnings, giving you precise, customized remediation advice.

---

## 🦠 Detection Capabilities

FlotBot monitors endpoint activity against common attack patterns:
- **System**: Spawning shells from office files (Word, Excel), running utilities from `%TEMP%` or `%APPDATA%`, high resource miners.
- **Network**: Shell connections on common hacker ports (4444, 1337), beaconing patterns to C2 servers, port scanner behavior.
- **Registry**: Startup mutations to Run/RunOnce registry nodes, creation of suspicious services directly launching cmd/powershell.
- **File System**: Mass creation of executables in Downloads, double-extension social engineering tricks (`.pdf.exe`), bulk modification of user document extensions (ransomware indicator).
