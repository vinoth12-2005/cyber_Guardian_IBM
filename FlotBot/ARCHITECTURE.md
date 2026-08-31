# FloatBot AI — Architectural Specification

## 1. Architectural Philosophy

FloatBot AI is designed around a strict, layered security pipeline:

```
REAL HOST TELEMETRY
       │
PLATFORM ABSTRACTION LAYER (PAL)
       │
UNIFIED SECURITY EVENTS (Normalized)
       │
ASYNCHRONOUS EVENT BUS
       │
DETECTION ENGINES (YARA, Hash, Process Tree, URL, Behavior, Ransomware, Canaries)
       │
INCIDENT CORRELATION ENGINE
       │
THREAT GRAPH & ATTACK STORY GENERATOR
       │
DETERMINISTIC RISK & CONFIDENCE SCORING
       │
ADAPTIVE HYBRID AI ROUTER
  ├── Offline Engine: Ollama (Local LLM)
  └── Online Engine: Google Gemini 2.0 Flash / Pro
       │
SECURITY COPILOT & SAFE ACTION EXECUTOR (Allowlist Only)
       │
CRYPTOGRAPHIC TAMPER-EVIDENT AUDIT LOG (SHA-256 Chaining)
```

---

## 2. Subsystem Descriptions

### 2.1 Platform Abstraction Layer (PAL)
The PAL standardizes low-level OS telemetry interfaces across Windows, macOS, and Linux:
- `FilesystemSensor`: Monitored directories, recursive scanning, SHA-256 caching.
- `ProcessSensor`: Process hierarchy, command lines, memory metrics, CPU utilization.
- `NetworkSensor`: Active sockets (TCP/UDP), local/remote addresses, process PID mapping, DNS cache.
- `PersistenceSensor`: Windows Registry Run keys, systemd services, crontabs, macOS LaunchAgents.
- `ScreenSensor`: Desktop screenshot capture, optical heuristic analysis, credential redaction.
- `BrowserSensor`: Visited URL tracking, protocol analysis, homograph detection.

### 2.2 Unified Security Event Schema
All telemetry is normalized into the `UnifiedSecurityEvent` schema:
```json
{
  "event_id": "UUIDv4",
  "timestamp": "2026-08-29T13:45:00.000Z",
  "host_id": "hostname",
  "os": "linux",
  "sensor": "process_sensor",
  "event_type": "process_started",
  "severity": "high",
  "confidence": 0.95,
  "process": { "pid": "4821", "ppid": "1000", "name": "powershell", "cmd_line": "powershell -enc ..." },
  "file": {},
  "network": {},
  "url": {},
  "user": { "username": "admin", "privilege_level": "user" },
  "persistence": {},
  "evidence": [],
  "mitre": ["T1059.001"],
  "is_demo": false
}
```

### 2.3 Pure Cross-Platform YARA Engine
The `YaraEngine` compiles standard YARA rule files (`.yar`) without requiring fragile native C bindings:
- Evaluates string modifiers: `nocase`, `wide`, `ascii`.
- Compiles regex patterns: `$re = /pattern/i`.
- Evaluates hex byte sequences: `$h = { 4D 5A 90 00 }`.
- Evaluates complex conditional logic: `any of them`, `all of them`, `N of them`, and boolean expressions.

### 2.4 Incident Correlation & Threat Graph
Instead of producing isolated, disconnected alerts, the `CorrelationEngine` groups related multi-stage events within a sliding time window (60s default) using common PIDs, file hashes, IPs, and domains into a unified `Incident`.

The `ThreatGraph` builds a directed entity relationship graph:
- **Nodes**: `USER`, `PROCESS`, `FILE`, `HASH`, `URL`, `DOMAIN`, `IP`, `PERSISTENCE`, `INCIDENT`
- **Edges**: `SPAWNED`, `DOWNLOADED`, `CREATED_FILE`, `CONNECTED_TO`, `RESOLVED_DOMAIN`, `INSTALLED_PERSISTENCE`, `MATCHED_YARA`

The `AttackStoryGenerator` builds an evidence-grounded chronological narrative explaining the exact sequence of events from initial web contact to persistence installation.

### 2.5 Deterministic Risk Engine
Risk calculation is strictly decoupled from the AI:
- `RiskEngine.calculate(signals)` assigns deterministic scores (0–100) and confidence (0.0–1.0) using a weighted matrix.
- Risk Tiers:
  - `SAFE`: 0–19
  - `LOW`: 20–39
  - `MEDIUM`: 40–59
  - `HIGH`: 60–79
  - `CRITICAL`: 80–100

### 2.6 Adaptive Hybrid AI Router
- Low / Safe telemetry is handled deterministically without AI calls.
- Medium / High risks are routed to the local Ollama instance for private local analysis.
- Complex multimodal / visual requests or cloud intelligence queries are routed to Google Gemini (if allowed by privacy settings).
- `PromptShield` wraps all external untrusted strings in `<untrusted_external_data>` tags to prevent prompt injection.

### 2.7 Security Response & Safe Action Executor
All remediation actions are strictly allowlisted:
1. `collect_evidence`
2. `calculate_hash`
3. `quarantine_file` (AES-256 encrypted vault)
4. `restore_file`
5. `terminate_process` (PID 0, 1, and core OS daemons protected)
6. `block_indicator`
7. `create_incident`
8. `export_report`

Arbitrary shell execution is strictly prohibited.

### 2.8 Tamper-Evident Audit Logging
The `AuditLogger` uses SHA-256 cryptographic hash chaining:
$$\text{Signature}_n = \text{SHA256}(\text{Signature}_{n-1} + \text{Timestamp} + \text{ActionType} + \text{Details})$$
Any manual database modification or row deletion breaks the verification chain immediately.
