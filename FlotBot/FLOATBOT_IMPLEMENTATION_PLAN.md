# FLOATBOT AI — MASTER PRODUCTION IMPLEMENTATION PLAN
**Cross-Platform AI-Assisted EDR/XDR Architecture & Migration Plan**

---

## 1. Executive Summary

FloatBot AI is undergoing a major production engineering upgrade to become a real, enterprise-grade, lightweight, cross-platform Endpoint Detection and Response (EDR/XDR) platform supporting **Windows**, **macOS**, and **Linux**.

This document outlines the complete **Phase 0 Codebase Audit**, identifies current architectural strengths, limitations, simulation gaps, and defines the target modular architecture across all 60 engineering phases.

---

## 2. Phase 0: Comprehensive Codebase Audit Findings

### 2.1 Component Inventory

| Subsystem | Existing Implementation | Current State | Target Architecture Enhancement |
| :--- | :--- | :--- | :--- |
| **Frontend / UI** | Electron (Dashboard `renderer/index.html`, Floating Widget `floating.html`, Admin Console `admin.html`) | Real Electron UI with custom titlebar & CSS animations | Standardize normalized event feeds, accurate OS sensor health matrix, unified state |
| **Backend Core** | Node.js CommonJS (`core/Runtime.js`, `core/Scheduler.js`, `core/ModuleLoader.js`) | Functional basic scheduler loop | Migrate to unified Event Bus, Normalizer, Pipeline, and Sensor Self-Healing Manager |
| **Database** | SQLite3 (`database/Database.js`, `database/schema.js`, repositories) | Real SQLite tables (alerts, process_logs, network_logs, registry_logs, file_logs, settings, whitelist, baseline_records, alert_history, blocked_ips) | Expand schema with unified `events`, `incidents`, `threat_graph`, `yara_matches`, `threat_intel_cache`, `audit_logs` |
| **Platform Sensors** | `platform/SystemAdapter.js`, `LinuxAdapter.js`, `WindowsAdapter.js`, `MacOSAdapter.js` | Basic OS command abstractions (ps, ss, netstat, tasklist, WMI) | Formalize `FilesystemSensor`, `ProcessSensor`, `NetworkSensor`, `PersistenceSensor`, `ScreenSensor`, `BrowserSensor`, `PermissionProvider` |
| **Process Monitoring** | `modules/system/collector.js`, `SystemWatcher.js`, rules (`PowerShellRule`, `CmdRule`, `WmicRule`, etc.) | Snapshot diffing, process tree parent tracking | Add true process lineage tree builder, behavioral sequence tracking, and cross-platform native hooks |
| **Network Monitoring** | `modules/network/collector.js`, `NetworkWatcher.js`, rules (`ReverseShellRule`, `BeaconRule`, `DnsRule`, etc.) | `ss -tunp`, `netstat -ano`, `/etc/hosts` DNS | Add socket-to-process PID correlation, C2 beacon interval jitter detection, domain reputation cache |
| **Filesystem Monitoring** | `modules/file/collector.js`, `FileWatcher.js`, rules (`ExecutableDropRule`, `SuspiciousExtensionRule`, `MassModificationRule`) | Periodic directory recursion on Downloads/Desktop/Temp | Event-driven watcher + inotify/ReadDirectoryChangesW fallback, SHA-256 cache, ransomware canary |
| **Malware & Hashing** | `RealMalwareInspector.js`, `HashVerifier.js`, `ioc.js`, `data/ioc.json` | MD5/SHA1/SHA256, Shannon Entropy, PE headers, string heuristics, VirusTotal API | Integrate native/pure YARA engine, rule validation, IOC caching with TTL, rate-limit protection |
| **Persistence Monitoring** | `modules/registry/collector.js` | Windows Run keys & services, Linux XDG autostart, systemd, crontab, bashrc, macOS LaunchAgents/Daemons | Standardize as OS Persistence Sensor, normalize persistence event schema |
| **Screen / OCR Sensor** | `ScreenAnalyzer.js` (Electron `desktopCapturer` + CLI fallbacks) | Functional screenshot capture, regex secret redaction, visual heuristics | Formalize ScreenSecurityEngine with modes: OFF, MANUAL, PERIODIC, EVENT_TRIGGERED; local OCR |
| **AI Subsystem** | `core/ai/AIEngine.js`, `PromptShield.js`, `GeminiProvider.js`, `OllamaProvider.js`, `MockProvider.js` | Dual AI (Gemini 2.0 Flash / Pro + Ollama) with streaming tokens, PromptShield injection sanitizer, prompt caching | Adaptive Hybrid AI Router, deterministic Risk/Correlation grounding before AI, model health monitor |
| **Security Response** | `SafeActionExecutor.js`, `QuarantineManager.js` | AES-256 file quarantine vault, process termination | Allowlisted actions only, strict privilege checks, rollback safeguards, audit trail |

---

### 2.2 Critical Gaps & Technical Debt Identified

1. **Lack of a Unified Event Normalizer**: Different collectors generate slightly different object shapes instead of a standard `UnifiedSecurityEvent` schema.
2. **Missing YARA Rule Engine**: `modules/malware/rules` directory was empty; YARA engine was referenced in documentation but lacked full rule parser, validation, and scanner.
3. **Absence of a Formal Incident Correlation Engine & Threat Graph**: Multi-stage attacks generated separate alerts rather than aggregating into a single correlated Incident with an Attack Story.
4. **Hardcoded Sample Key in `.env.example`**: `.env.example` contained a sample API key which violates Phase 54.
5. **No System Capability Detection & Permissions Matrix**: Missing runtime capability negotiation (`capabilities.json` / `CapabilityRegistry`) to indicate `FULL`, `DEGRADED`, or `PERMISSION REQUIRED` per OS.
6. **No Self-Healing Sensor Supervisor**: If a sensor throws an unhandled exception or times out, it could degrade the scheduler cycle rather than auto-recovering.
7. **Need for Safe Demo Mode**: Need an isolated synthetic attack simulator that does not run malware or pollute production databases.
8. **Missing CLI Diagnostics / Doctor Command**: Need `floatbot doctor` / CLI diagnostics for installation, permissions, and dependencies.

---

## 3. Target Unified Architecture

```
                               FLOATBOT AI CORE
                                      │
                      PLATFORM ABSTRACTION LAYER (PAL)
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
     WINDOWS PAL                  MACOS PAL                   LINUX PAL
  (CIM/WMI/ETW/Netstat)     (Launchd/ps/netstat/Apple)    (procfs/ss/inotify/systemd)
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      ▼
                          NORMALIZED SECURITY EVENTS
                                      ▼
                               EVENT BUS (Async)
                                      ▼
                      ┌───────────────┼───────────────┐
                      ▼               ▼               ▼
                 FILE SENSOR    PROCESS SENSOR   NETWORK SENSOR
                 PERSISTENCE     SCREEN SENSOR   BROWSER SENSOR
                      └───────────────┬───────────────┘
                                      ▼
                              DETECTION ENGINES
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
             YARA ENGINE        HASH / IOC ENGINE     URL ANALYZER
             BEHAVIOR ENGINE    RANSOMWARE/CANARY   BASELINE ANOMALY
                 └────────────────────┬────────────────────┘
                                      ▼
                             CORRELATION ENGINE
                                      ▼
                          FLOATBOT THREAT GRAPH &
                               ATTACK STORY
                                      ▼
                             DETERMINISTIC RISK
                                      ▼
                              HYBRID AI ROUTER
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                 LOCAL AI (Ollama)          ONLINE AI (Gemini)
                 (Privacy-First)            (Complex Multi-modal)
                        └─────────────┬─────────────┘
                                      ▼
                            SECURITY COPILOT &
                          CONTROLLED RESPONSE ENGINE
                                      ▼
                           TAMPER-EVIDENT AUDIT LOG
```

---

## 4. Implementation Phase Breakdown

### Phase 1–5: Platform Abstraction & Capability Detection
- Implement abstract base classes: `FilesystemSensor`, `ProcessSensor`, `NetworkSensor`, `PersistenceSensor`, `ScreenSensor`, `BrowserSensor`, `SystemInfoProvider`, `PermissionProvider`, `ResponseProvider`.
- Implement native providers for Windows, macOS, and Linux.
- Create `CapabilityRegistry` to detect OS version, permissions (admin/root, screen recording, full disk access), and output runtime capability state.

### Phase 6–7: Unified Event Schema & Async Event Bus
- Implement `UnifiedSecurityEvent` schema with UUID, ISO8601 timestamp, host ID, OS, sensor, event type, severity, confidence, process, file, network, URL, user, evidence.
- Implement robust asynchronous `EventBus` with normalizer, filter, subscriber queue, and debounce.

### Phase 8–15: Detection Engines & YARA & Threat Intelligence
- **File Sensor & Hash Engine**: SHA-256 calculation with local caching and TTL.
- **YARA Engine**: Rule parser and scanner in `rules/yara/` supporting standard YARA rule formats, string matching, regex, and metadata.
- **Threat Intel Engine**: `ThreatIntelProvider` base with `VirusTotalProvider` and `LocalIOCProvider` (caching, rate-limiting, error handling).
- **URL & Network Engines**: Lookalike/phishing detection, IP-based URLs, socket-to-process PID correlation, C2 beacon detection.
- **Persistence Engine**: OS-specific persistence monitoring (Registry, systemd, LaunchAgents, crontab, autostart).

### Phase 16–21: Screen Security, Behavior, Baselines, Ransomware & Canaries
- **Screen Security Engine**: Multi-mode visual inspection (OFF, MANUAL, PERIODIC, EVENT_TRIGGERED), credential redaction.
- **Screen → URL → File → Process → Network Correlation Chain**.
- **Behavior Engine & Baselines**: Multi-event sequence detection, per-process baselines.
- **Ransomware Engine & Safe Canary System**: Mass file modification, entropy jump, extension mutation, safe canary watcher.

### Phase 22–26: Incident Correlation, Threat Graph, Attack Story & Deterministic Risk
- **Correlation Engine**: Multi-event aggregation into unified `Incident` records.
- **Threat Graph**: Graph builder linking entities (Process, File, Hash, IP, Domain, User, Incident).
- **Attack Story Generator**: Chronological narrative generation based strictly on real evidence.
- **Risk Engine**: Deterministic calculation (0–100) + separate confidence score (0.0–1.0).

### Phase 27–35: AI Subsystem & Prompt Injection & Security Copilot
- **AI Provider Abstraction**: `GeminiProvider`, `OllamaProvider`, `MockProvider`.
- **Adaptive Hybrid AI Router**: Local-first routing for sensitive telemetry, Gemini for multimodal/deep analysis, deterministic fallback when offline.
- **Prompt Injection Defense & Data Minimization**: Strict boundary tags, redacting passwords/keys/tokens.
- **Security Copilot & Controlled Response Engine**: Allowlisted response actions (`collect_evidence`, `quarantine_file`, `terminate_process`, `block_indicator`, `create_incident`, `export_report`).

### Phase 36–48: Diagnostics, Audit Log, Reporting & Safe Demo Mode
- **Sensor Self-Healing**: Fault isolation and automatic recovery.
- **Tamper-Evident Audit Log**: Structured audit logging of all actions and findings.
- **Report Generator**: JSON, CSV, and HTML reports with MITRE ATT&CK mappings and timelines.
- **Safe Demo Mode**: Synthetic simulation of phishing, download, process execution, and canary trip without real malware.
- **FloatBot Doctor CLI**: Diagnostics tool checking environment, permissions, dependencies, sensors, and database.

### Phase 49–60: Testing, Hardening, Auditing & Documentation
- Comprehensive Jest automated test suite covering all modules, platforms, error states, and offline modes.
- Hardening of secrets in `.env.example` and codebase.
- Full documentation suite (`README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `THREAT_DETECTION.md`, `API.md`, `TESTING.md`).

---

## 5. Test Matrix & Verification Strategy

| Test Suite | Coverage Focus | Success Criteria |
| :--- | :--- | :--- |
| **Unit Tests** | Hashes, YARA rule parser, URL analyzer, prompt shield, risk calculation | 100% deterministic outputs |
| **Integration Tests** | Collector → Normalizer → EventBus → Detection → Correlation → Incident | Events flow through pipeline without dropping |
| **Cross-Platform Sensor Tests** | Linux (`/proc`, `ss`, `ps`), macOS, Windows | Graceful fallback when permissions are missing |
| **AI Offline & Fallback Tests** | Online Gemini unavailable, Ollama unavailable, both unavailable | Deterministic rule-based detection continues uninterrupted |
| **Security & Response Tests** | Quarantine vault encryption, process termination, prompt injection defense | Zero arbitrary command execution, clean isolation |
| **Demo Mode Tests** | Synthetic attack scenarios | Clearly tagged as `DEMO MODE`, real DB unaffected |

---
