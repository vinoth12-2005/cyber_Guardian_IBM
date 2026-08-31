# FLOATBOT AI — MASTER FILE THREAT ANALYSIS ENGINE AUDIT

**Date:** 2026-08-29  
**Auditor:** FloatBot Principal Cybersecurity & Systems Engineering  
**Version:** 1.0.0-audit  

---

## 1. Current Architecture Overview

FloatBot is an AI-assisted Cross-Platform Endpoint Detection and Response (EDR/XDR) architecture designed with the following tiers:
- **Presentation Tier:** Electron desktop interface (Main Dashboard, Floating Chatbot Assistant Widget, and Admin Console).
- **Core Orchestration:** `core/Runtime.js`, `core/events/EventBus.js`, `core/events/UnifiedSecurityEvent.js`, `core/Scheduler.js`, `core/system/SensorSupervisor.js`.
- **Sensors & Collectors:** Modular collectors under `modules/` (system, network, registry, file, malware, browser, screen) and platform abstraction sensors in `platform/` (Windows, macOS, Linux).
- **Detection & Correlation:** `core/threats/ThreatEngine.js`, `core/detection/` (YaraEngine, HashEngine, RansomwareEngine, BehaviorEngine, ProcessTreeEngine, ScreenSecurityEngine, URLEngine), `core/correlation/CorrelationEngine.js`, `core/correlation/ThreatGraph.js`, `core/correlation/AttackStoryGenerator.js`, `core/risk/RiskEngine.js`.
- **AI Analyst & Routing:** `core/ai/AIEngine.js` (Multi-mode: Local Ollama `llama3.1`, Cloud Google Gemini `2.0-flash`, Auto Hybrid, Offline Fallback) with `core/ai/PromptShield.js` for injection defense.
- **Reporting & Timeline:** `core/reporting/ThreatTimeline.js`, `core/reporting/ThreatReplay.js`, `core/reporting/ReportGenerator.js`.
- **Storage:** SQLite with WAL mode (`database/Database.js`, `database/schema.js`, repositories).

---

## 2. Existing File-Analysis Capabilities

- **`modules/file/collector.js` & `watcher.js`:** Snapshot-based periodic file polling across home directory subdirectories (`Downloads`, `Desktop`, `Documents`, `Temp`). Diffs mtime and size between polling cycles to emit `FILE_CREATED`, `FILE_MODIFIED`, `FILE_DELETED`.
- **`modules/file/analyzer.js`:** Basic wrapper around `ThreatEngine` with rudimentary `ExecutableDropRule`, `SuspiciousExtensionRule`, and `MassModificationRule`.
- **`modules/malware/RealMalwareInspector.js`:** Computes MD5, SHA-1, SHA-256; calculates whole-buffer Shannon entropy; performs basic PE header offset checks (`MZ` and `PE\0\0`); searches strings for basic signatures (UPX, AMSI, reverse shells, webhooks); checks local IOC and queries VirusTotal v3.
- **`modules/scanner/DeepFileSystemScanner.js`:** Crawls top target folders up to 100 files per dir, performs extension checks, script content checks, and whole-file entropy calculations.

---

## 3. Existing Sensors Audit

- **Filesystem Sensors (`platform/linux/LinuxFilesystemSensor.js`, `WindowsFilesystemSensor.js`, `MacOSFilesystemSensor.js`):** Snapshot-based directory traversal with 2-level depth.
- **Process Sensors:** Linux (`/proc` directory traversal), Windows (`wmic process get` / PowerShell), macOS (`ps aux` / `pgrep`).
- **Network Sensors:** Linux (`ss -tuna` / `/proc/net/tcp`), Windows (`netstat -ano`), macOS (`lsof -i -n -P`).
- **Persistence Sensors:** Linux (systemd units, cron, `.config/autostart`), Windows (Registry Run keys, Services, Scheduled Tasks), macOS (LaunchAgents, LaunchDaemons).

---

## 4. Existing AI Architecture

- **`AIEngine.js`:** Dual-provider setup supporting Gemini Provider (chat & explanation) and Ollama Provider (local offline analysis). Includes `PromptShield.js` sanitizing input and wrapping untrusted data in XML tags.
- **AI Modes:** `AUTO` (smart hybrid routing based on risk/privacy), `OFFLINE` (100% local Ollama), `ONLINE` (cloud Gemini), `FALLBACK` (deterministic scoring when AI unreachable).
- **Hallucination Protection:** Grounding prompts to structured evidence objects; prompt instructions forbidding inventing IOCs, hashes, or techniques.

---

## 5. Existing Threat Intelligence & VirusTotal Integration

- **`core/threatintel/ThreatIntelEngine.js`:** Local-first query architecture. Checks in-memory and SQLite cache first, then `LocalIOCProvider` (offline), then `VirusTotalProvider` if API key configured.
- **`core/threatintel/VirusTotalProvider.js`:** REST v3 hash lookup (`/api/v3/files/{hash}`), handles 429 rate limits, extracts detection engine stats.
- **Security:** API key is loaded from `.env` in the Electron main process and never exposed to renderer windows.

---

## 6. Existing YARA Integration

- **`core/detection/YaraEngine.js`:** In-process JavaScript YARA rule parser and matching engine supporting text strings (`nocase`, `wide`, `ascii`), hex patterns (`{ 4D 5A 90 00 }`), regular expressions, meta blocks, and conditions (`any of them`, `all of them`, `N of them`, boolean expressions).
- **Rule directory:** `rules/yara/` containing standard rules (`webshell.yar`, `ransomware.yar`, `c2_beacon.yar`, `malware_tools.yar`, `cryptominer.yar`).

---

## 7. Existing Database Architecture

- **SQLite 3 (`database/Database.js`):** WAL mode enabled (`PRAGMA journal_mode = WAL`), synchronized NORMAL, foreign keys ON.
- **Schema (`database/schema.js`):** Tables for `alerts`, `unified_events`, `incidents`, `yara_matches`, `threat_intel_cache`, `audit_logs`, `canary_records`, `process_logs`, `network_logs`, `registry_logs`, `file_logs`, `settings`, `whitelist`, `baseline_records`, `alert_history`, `blocked_ips`.

---

## 8–10. Cross-Platform Support Status

- **Linux (Current Host):** Fully functional sensors for `/proc`, `ss`, `/etc/systemd`, `.config/autostart`, `/tmp`. Tested and verified via `scripts/doctor.js`.
- **Windows:** Implemented via PowerShell / WMI adapters, Registry scanning, Service inspection, NTFS paths.
- **macOS:** Implemented via `lsof`, `ps`, LaunchAgents/Daemons inspection, macOS permissions manager.

---

## 11–16. Identified Weaknesses, Broken Logic, and Missing Components

### Weak & Incomplete Components:
1. **No True Binary Format Parsers:**
   - PE analysis was limited to finding offset `0x3C` without validating PE32/PE32+ Optional Headers, COFF Headers, Section table headers, import address tables, export tables, or digital signature data directory.
   - Mach-O binary parsing was completely missing (no load commands `LC_SEGMENT_64`, `LC_CODE_SIGNATURE`, CPU architectures).
   - ELF binary parsing was completely missing (no ELF headers, 32/64-bit class, program headers, dynamic symbols, DT_NEEDED libraries).
2. **Missing Machine Learning Classification Model:**
   - No structured 20-dimensional feature vector extraction (size, entropy, sections, signature, imports, VT ratio, YARA count, context, behavior).
   - No benchmarked ML decision-tree / ensemble model for calculating calibrated `malicious_probability` (0.0 to 1.0) with confidence intervals.
3. **Missing Multi-Tier File Reputation Engine:**
   - No unified `ReputationEngine` with explicit states: `KNOWN_BENIGN`, `KNOWN_MALICIOUS`, `SUSPICIOUS`, `UNKNOWN`, `NO_REPUTATION`.
   - `UNKNOWN` was not clearly separated from `MALICIOUS` across all tools.
4. **File Scanner Disconnection & UI Limitations:**
   - The file scanner in the UI was invoking basic single-file checks rather than the full multi-stage file threat pipeline.
   - No drag-and-drop / context file threat analysis with real-time progress, section breakdown, string analysis, and attack chain correlation.
5. **Replay Engine Performance on Big Data:**
   - `ThreatTimeline.js` performed unindexed `SELECT *` across multiple large tables with no batching, streaming, or chunking.
   - `ThreatReplay.js` had no binary search indexing, no state snapshot checkpointing, no variable playback speed (1x, 2x, 5x, 10x, 50x, instant), and no streaming interface for big datasets (10,000 to 100,000+ events).

---

## 17. Master Remediation & Upgrade Strategy

1. **Implement `core/fileengine/`:**
   - `FileAnalyzer.js` (Unified base engine)
   - `WindowsFileAnalyzer.js`, `MacOSFileAnalyzer.js`, `LinuxFileAnalyzer.js` (Platform-specific metadata, paths, signature verifiers)
   - `FileIdentifier.js` (Magic byte inspection, MIME, archive format, double-extension & masquerade detector)
   - `StaticExecutableAnalyzer.js` (Comprehensive PE, Mach-O, ELF binary parsers)
   - `EntropyCalculator.js` (Shannon entropy per file and per section)
   - `StringExtractor.js` (Safe ASCII/UTF-16LE extractor with contextual regex classifiers)
   - `ImportAnalyzer.js` (Categorized import analysis: Normal, Unusual, Suspicious across 8 threat vectors)
   - `SignatureAnalyzer.js` (Digital signature, Authenticode, Mach-O codesign, ELF integrity)
   - `ReputationEngine.js` (Known benign, known malicious, suspicious, unknown)
   - `PathContextAnalyzer.js` (Normalized path context risk scoring)
   - `FileSizeAnalyzer.js` (Size anomaly scoring)
   - `MLFeatureExtractor.js` & `MLThreatClassifier.js` (20-feature normalized vector + Decision Tree / Random Forest classifier)
   - `FileThreatEngine.js` (Master orchestrator combining all 59 phases)
2. **Upgrade Replay & Timeline for Big Data:**
   - Optimize database indexes on timestamp columns.
   - Implement `ThreatReplay.js` with $O(\log N)$ binary search, streaming chunks, state snapshots, and playback speed multipliers (1x, 2x, 5x, 10x, 50x, instant).
3. **Connect UI & IPC:**
   - Provide rich File Threat Analysis UI in Main Dashboard, Floating Widget, and Admin Console.
   - Add Replay console with timeline scrubbing and playback speed controls.
4. **Security & Quality Hardening:**
   - Path traversal defense, zip bomb prevention, max file size guards, timeout protections.
   - Verify all unit tests and add comprehensive test suites for new modules.
