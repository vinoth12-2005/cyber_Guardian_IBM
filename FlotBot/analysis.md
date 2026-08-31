# FlotBot — Project Analysis

## What Is It?

**FlotBot** is a **Windows Endpoint Security Monitoring & Threat Detection** desktop application. It monitors processes, network connections, registry changes, and the file system in real-time, correlates findings against threat rules, maps them to MITRE ATT&CK techniques, and provides an **AI-powered Security Copilot** for conversational threat investigation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | **Electron ^31** (frameless, glassmorphic UI) |
| Backend Runtime | **Node.js 18+** |
| Local Storage | **SQLite3** (WAL mode) |
| Primary AI | **IBM Granite** via `@ibm-cloud/watsonx-ai` |
| Fallback AI | **Google Gemini 1.5 Flash** (REST) |
| Offline AI | **Ollama** (local inference) |
| HTTP | **Axios**, **Express 5** |
| Testing | **Jest 29** |

---

## Architecture Overview

```
Electron Main Process
    ├── IPC Handlers
    │     ├── Collectors ──► ThreatEngine ──► AlertManager ──► Renderer (UI)
    │     │     ├── System (WMIC/tasklist)                         │
    │     │     ├── Network (netstat/DNS)                          ▼
    │     │     ├── Registry (PowerShell)               Main Dashboard
    │     │     ├── File System (snapshot)              Floating Alert Widget
    │     │     └── Malware (IOC/Hash)
    │     ├── AIEngine
    │     │     ├── IBMGraniteProvider  ◄── PRIMARY
    │     │     ├── GeminiProvider      ◄── FALLBACK
    │     │     ├── OllamaProvider      ◄── LOCAL/OFFLINE
    │     │     └── MockProvider        ◄── GRACEFUL DEGRADATION
    │     └── Database (SQLite3)
```

---

## Module Breakdown

### `electron/`
The Electron shell. `main.js` bootstraps everything: DB init, IPC handler registration, scheduled scans (default every 5 seconds), tray icon, and two windows (main dashboard + floating alert widget). `preload.js` exposes the `flotbot.*` API bridge to the renderer safely via `contextBridge`.

### `core/`
The intelligence engine:

| File | Role |
|---|---|
| `Runtime.js` | Bootstrap coordinator |
| `AIEngine.js` | AI orchestrator (provider selection, memory, routing) |
| `ThreatEngine.js` | Aggregates and runs detection rules |
| `AlertManager.js` | Buffers, persists, and notifies on alerts |
| `PromptBuilder.js` | Injects MITRE context into AI prompts |
| `MemoryManager.js` | Per-session conversation ring buffer (max 20 turns) |

### `modules/`
Five detection domains, each with a `collector.js`, `skill.js`, `analyzer.js`, `watcher.js`, and `rules/`:

| Module | What It Detects |
|---|---|
| `system/` | PowerShell abuse, Office→Shell spawning, suspicious paths, high CPU |
| `network/` | Reverse shells (ports 4444/5555/6666), C2 beaconing, DNS anomalies, port scanning |
| `registry/` | Run key persistence, malicious service installs |
| `file/` | Double-extension masquerade (.pdf.exe), RTLO tricks, mass modifications (ransomware) |
| `malware/` | SHA-256 IOC matching, behavioral scoring, IP/domain correlation |

### `providers/`
Clean AI provider abstraction. `IBMGraniteProvider.js` is primary, with automatic fallback to `GeminiProvider.js`, `OllamaProvider.js`, and `MockProvider.js` for offline scenarios.

### `database/`
SQLite wrapper with 6 tables: `alerts`, `process_logs`, `network_logs`, `registry_logs`, `file_logs`, `ai_conversations`. Repositories: `AlertRepository.js`, `ProcessRepository.js`, `NetworkRepository.js`, `AIRepository.js`.

---

## Data Flow — Threat Detection

```
Scheduler (every 5s)
    │
    ▼
Collector (WMIC / netstat / PowerShell / filesystem query)
    │
    ▼
ThreatEngine.analyze() — runs all registered rules
    │
    ▼
AlertManager — persist to SQLite + notify renderer via IPC
    │
    ▼
Renderer — update dashboard + floating widget
```

---

## Data Flow — AI Copilot

```
User types message in chat
    │
    ▼
AIEngine.chat(sessionId, message)
    │
    ├── MemoryManager — load conversation history (ring buffer, 20 turns)
    ├── ContextManager — inject current processes, connections, alerts
    ├── PromptBuilder — build system prompt with MITRE ATT&CK context
    │
    ▼
IBMGraniteProvider → POST /text/generation → IBM watsonx.ai
    │
    ▼
Response returned to Renderer + stored in MemoryManager
```

---

## Detection Rules

### System Module (`modules/system/rules/`)
- **PowerShellRule** — Detects PowerShell execution with encoded/bypass flags
- **CmdRule** — Detects suspicious cmd.exe spawning
- **WmicRule** — Detects WMIC abuse for lateral movement
- **Rundll32Rule** — Detects DLL execution via rundll32
- **MshtaRule** — Detects HTA script execution
- **Regsvr32Rule** — Detects COM scriptlet/scrobj execution
- **SuspiciousPathRule** — Flags executables running from `%TEMP%`, `Downloads`
- **ParentChildRule** — Detects Office apps spawning shell processes
- **HighCpuRule** — Flags anomalous CPU consumption

### Network Module (`modules/network/rules/`)
- **ReverseShellRule** — Detects outbound connections on ports 4444, 5555, 6666
- **BeaconRule** — Detects periodic outbound C2 beaconing patterns
- **SuspiciousOutboundRule** — Flags unusual outbound connections
- **PortScanRule** — Detects rapid multi-port connection attempts
- **DnsRule** — Detects DNS anomalies (tunneling, DGA patterns)

### Registry Module (`modules/registry/rules/`)
- **RunKeyRule** — Monitors HKLM/HKCU Run keys (32-bit and 64-bit)
- **ServiceRule** — Detects new/modified service registrations
- **PersistenceRule** — Broad persistence mechanism detection

### File Module (`modules/file/rules/`)
- **ExecutableDropRule** — Detects new executables written to disk
- **SuspiciousExtensionRule** — Flags double-extension files (e.g., `invoice.pdf.exe`) and RTLO tricks
- **MassModificationRule** — Detects bulk file changes (ransomware pattern)

---

## Database Schema

SQLite3 tables auto-created on first run (WAL journaling mode):

| Table | Contents |
|---|---|
| `alerts` | Alert records: severity, evidence, MITRE mapping, timestamp |
| `process_logs` | Process snapshots: PID, cmdline, parent PID, memory |
| `network_logs` | Connections: protocol, src/dst address/port, PID, state |
| `registry_logs` | Registry changes: key, action, old/new value |
| `file_logs` | File activity: path, action, SHA-256 hash, extension |
| `ai_conversations` | Chat history: session ID, role, content, timestamp |

Database location: `%APPDATA%/FlotBot/flotbot.db`

---

## AI Provider Configuration

### IBM Granite (Primary)
```
WATSONX_AI_APIKEY=your-ibm-cloud-api-key
WATSONX_AI_PROJECT_ID=your-project-id-guid
WATSONX_AI_SERVICE_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-3-3-8b-instruct
```
Supported models: `granite-3-3-8b-instruct`, `granite-3-1-8b-instruct`, `granite-3-1-2b-instruct`, `granite-guardian-3-1-8b`

### Google Gemini (Fallback)
```
GEMINI_API_KEY=your-gemini-api-key
```
Model: `gemini-1.5-flash`

### Ollama (Local/Offline)
No API key required. Requires local Ollama daemon running.

### Monitoring Settings
```
SCAN_INTERVAL=5000     # milliseconds between collection cycles
DEBUG=true             # verbose logging
AI_PROVIDER=watsonx    # override provider: ollama | watsonx | gemini
```

---

## Test Coverage

| Test File | What Is Covered |
|---|---|
| `alert.test.js` | Alert model creation, AlertManager buffering, filter logic |
| `ai.test.js` | Prompt formatting, memory ring limits, offline mock behavior |
| `network.test.js` | Reverse shell detection, C2 beaconing cycles, browser exclusions |
| `database.test.js` | SQLite connection, schema creation, repository inserts/updates |
| `threat.test.js` | ThreatEngine rule registration & analysis |
| `event.test.js` | EventBus pub/sub, subscriber callbacks |
| `watcher.test.js` | Diff-based file/process/registry change detection |
| `process.test.js` | Process property gathering (tasklist parsing) |

Run with: `npm test`

---

## Key Strengths

1. **Offline-first resilience** — full mock fallback when no AI APIs are available
2. **MITRE ATT&CK integration** — every alert maps to tactics and techniques
3. **Modular rule engine** — each rule is a stateless, independently testable class
4. **Provider abstraction** — swap AI backends without changing business logic
5. **Event-driven architecture** — pub/sub EventBus for loose coupling
6. **Comprehensive test suite** — 8 Jest test suites covering all critical paths
7. **Graceful degradation** — app remains functional with no internet/API access

---

## Open Questions / Gaps

1. **IOC feed maintenance** — How is `data/ioc.json` kept current in production? Manual or automated threat feed?
2. **Administrator privileges** — How does the app behave when run without admin rights? Are collector failures handled gracefully?
3. **Skill registry** — What skills are registered in `SkillManager` by default? Is there dynamic skill loading?
4. **Ollama integration** — Is the Ollama provider fully tested or experimental?
5. **Performance at scale** — Database query performance under high alert volume; memory usage with long-running conversation sessions.
6. **Multi-user environments** — Does FlotBot track per-user or system-wide activity? How are HKLM vs HKCU registry conflicts handled?
7. **Floating widget interaction** — Does the floating alert widget support direct process containment actions, or is it display-only?

---

## Entry Points

| Command | File | Purpose |
|---|---|---|
| `npm start` | `electron/main.js` | Launch full desktop application |
| `node app/app.js` | `app/app.js` | CLI smoke test (process collection only) |
| `npm test` | `tests/*.test.js` | Run full Jest test suite |
