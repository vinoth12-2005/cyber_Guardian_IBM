# FlotBot Comprehensive Security & Detection Architecture Audit

---

## Executive Summary & Audit Verdict

An exhaustive security architecture and code-level audit of the **FlotBot** repository was conducted. FlotBot is an AI-powered cross-platform endpoint security, threat analysis, and awareness assistant built using Node.js and Electron.

###  Primary Verdict: Manual Local Detection Engine Present
**FlotBot DOES contain a comprehensive, manually implemented local threat detection and heuristic engine.** 

FlotBot **does not** rely solely on cloud AI (Gemini) or external Threat Intelligence APIs (VirusTotal). Instead, it implements a **multi-layered hybrid security architecture** where fast, deterministic local detection logic scans endpoints offline, while external APIs and AI LLMs (Gemini / Ollama) serve as high-level reasoning, explanation, and visual verification layers.

---

## Section 1: Detailed Detection Engine Audit Matrix

FlotBot features custom-built, local scanning logic across every core endpoint detection domain:

| Security Capability | Implementation Status | Core Module / File Location | Technical Details & Mechanism |
| :--- | :--- | :--- | :--- |
| **YARA Signature Detection** | **Custom Built** | `core/detection/YaraEngine.js` | Pure JavaScript YARA parser evaluating string (`text`, `hex`, `regex`) and boolean condition matrices at runtime against raw file buffers. Includes custom rules (`rules/yara/ransomware.yar`). |
| **Hash Signature Matching** | **Custom Built** | `core/fileengine/HashEngine.js` | Calculates SHA-256 / MD5 hashes; checks against local offline SQLite database (`LocalIOCProvider.js`) containing known malicious hashes. |
| **PE / ELF / Mach-O Analysis** | **Custom Built** | `core/fileengine/StaticAnalyzer.js`, `PEAnalyzer.js`, `ELFAnalyzer.js`, `MachOAnalyzer.js` | Direct binary header parsing (`e_magic`, `MZ`, `ELF`, Mach-O magic). Inspects section headers, compile timestamps, export tables, and flags suspicious import APIs (`VirtualAllocEx`, `CreateRemoteThread`, `ptrace`, `task_for_pid`). |
| **Entropy & Ransomware Engine** | **Custom Built** | `core/detection/RansomwareEngine.js`, `EntropyCalculator.js` | Calculates Shannon Entropy ($H(X) \ge 7.2$) to detect encrypted payload structures. Tracks rapid file rename/modification rates and detects `vssadmin` or `bcdedit` command invocations. |
| **Decoy Tripwire (Canary)** | **Custom Built** | `core/detection/CanarySystem.js` | Deploys decoy files (`.docx`, `.xlsx`, `.sql`) in `~/.flotbot/canaries/` and monitors them via `fs.watch` for unauthorized encryption, modification, or deletion. |
| **Process Lineage & LOLBins** | **Custom Built** | `core/detection/ProcessTreeEngine.js` | Constructs parent-child process trees (`PID` $\rightarrow$ `PPID`). Detects living-off-the-land binaries (LOLBins) like `powershell.exe`, `cmd.exe`, `wmic.exe`, `certutil`, `bash`, `nc`, and `curl` executing suspicious child sub-processes. |
| **Behavioral Correlation** | **Custom Built** | `core/detection/BehaviorEngine.js` | Correlates event sequences across a sliding time window (60 seconds) to detect multi-stage attack chains (e.g., *File Drop $\rightarrow$ Execution $\rightarrow$ Persistence $\rightarrow$ Outbound Network Connection*). |
| **Machine Learning Heuristics** | **Custom Built** | `core/fileengine/MLFeatureExtractor.js`, `MLThreatClassifier.js` | Extracts a 20-dimensional numerical vector (entropy, sign status, import risk, YARA count, path context) and runs a weighted scoring model to produce ML risk predictions. |
| **Phishing & Homograph URLs** | **Custom Built** | `core/detection/URLEngine.js`, `modules/browser/URLAnalyzer.js` | Detects Punycode/homograph domain spoofing, leetspeak brand impersonations (`g00gle`, `m1crosoft`), suspicious TLDs (`.top`, `.zip`, `.xyz`), double extensions, and unencrypted HTTP credential forms. |
| **Persistence Monitoring** | **Custom Built** | `modules/registry/collector.js` | Monitors Windows Run/RunOnce Registry keys (`HKLM`/`HKCU`), Linux XDG Autostart (`~/.config/autostart`), systemd services, cron jobs, `.bashrc`/`.zshrc` injections, and macOS LaunchAgents/LaunchDaemons. |
| **Network C2 & Sockets** | **Custom Built** | `modules/network/collector.js`, `NetworkSensor.js` | Native platform socket collection via `ss -tunp` / `/proc/net/tcp` (Linux), `netstat -ano` (Windows), and `netstat -anf inet` (macOS). Identifies reverse shells and direct-to-IP C2 traffic. |
| **Risk Scoring & Aggregation** | **Custom Built** | `core/risk/RiskEngine.js`, `CorrelationEngine.js` | Multi-signal weighted risk engine aggregating threat indicators into 5 tiers (`SAFE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with confidence metrics ($0.0 - 1.0$). |

---

## Section 2: External Security & AI Integrations

FlotBot supports both cloud-based and fully offline operational modes via configuration in `.env`:

### 1. External Threat Intelligence Integration
* **VirusTotal API (`core/threatintel/VirusTotalProvider.js`):** 
  * Performs cloud reputation lookups for file hashes (SHA-256/MD5), domain names, and remote IP addresses.
  * Controlled by `VIRUSTOTAL_API_KEY`. If no key is set or network is unavailable, FlotBot gracefully falls back to `LocalIOCProvider.js` (zero-latency SQLite matching).

### 2. Dual AI Provider Architecture
* **Google Gemini API (`providers/GeminiProvider.js`):** Cloud-based LLM (Gemini 2.0 Flash / Pro) with multimodal vision capabilities used for desktop screenshot inspection, user interactive chat, and generating remediation advice. Controlled by `GEMINI_API_KEY`.
* **Ollama Local AI (`providers/OllamaProvider.js`):** Fully offline, local LLM integration (e.g., `qwen2.5:3b`, `llama3.1`, `deepseek-r1`) providing 100% private analysis with zero data leaving the host.
* **Privacy Mode Switch (`AI_PRIVACY_MODE`):** When set to `true`, FlotBot runs in 100% air-gapped/offline mode, routing all queries and security reasoning strictly to Ollama.
* **Prompt Shield Protection (`core/ai/PromptShield.js`):** Filters untrusted input (OCR text, scraped web pages, file data) to prevent prompt injection and jailbreak attacks from executing arbitrary LLM commands.

---

## Section 3: Architecture Diagram & Flow

The overall architecture of FlotBot is structured into clear, decoupled layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                          │
│   Electron Floating Bar  │  Admin Console (Web/React)  │  Browser Ext  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ IPC / WebSocket / REST
┌───────────────────────────────────▼────────────────────────────────────┐
│                    BACKEND ORCHESTRATION & EVENTS                      │
│   electron/main.js  │  AlertManager.js  │  CorrelationEngine.js        │
└────────┬──────────────────────────┬──────────────────────────┬─────────┘
         │                          │                          │
┌────────▼────────────────┐ ┌───────▼────────────────┐ ┌───────▼─────────┐
│ LOCAL DETECTION ENGINES │ │ AI REASONING LAYER     │ │ THREAT INTEL    │
│  - YaraEngine           │ │  - AIEngine Router     │ │  - LocalIOC     │
│  - RansomwareEngine     │ │  - GeminiProvider      │ │    (SQLite)    │
│  - ProcessTreeEngine    │ │    (Cloud Vision)      │ │  - VirusTotal   │
│  - URLEngine            │ │  - OllamaProvider      │ │    Provider     │
│  - Static / ML Analyzer │ │    (Offline Local)     │ │    (Cloud API)  │
└────────┬────────────────┘ └────────────────────────┘ └─────────────────┘
         │
┌────────▼───────────────────────────────────────────────────────────────┐
│                    CROSS-PLATFORM ADAPTER LAYER                        │
│   PlatformFactory  ──►  WindowsAdapter  │  LinuxAdapter  │  MacOSAdapter│
│   (WMI / PowerShell)   (/proc / ss / ps)    (sw_vers / launchctl)      │
└────────────────────────────────────────────────────────────────────────┘
```

### Layer Breakdown

1. **User Interface Layer:** Electron-based floating security bar, full admin management dashboard, and browser extension for real-time URL monitoring.
2. **Backend Orchestration & Events:** Central event bus handling alert distribution, sqlite3 alert persistence, IPC communications, and risk correlation across time windows.
3. **Local Detection Engines:** Deterministic security sensors running heuristics, signature parsing, binary analysis, file entropy calculation, and threat tree construction.
4. **AI Reasoning Layer:** Dual-mode AI system routing high-level explanation requests and visual desktop screenshots to Gemini (Cloud) or Ollama (Local), protected by `PromptShield.js`.
5. **Threat Intelligence Layer:** Hybrid lookup engine providing fast local hash matching with optional VirusTotal API enrichment.
6. **Cross-Platform Adapter Layer:** Unified `SystemAdapter` interface with OS-specific implementations providing native process, network, service, and security status collection for Windows, Linux, and macOS.

---

## Section 4: Recommendations & Final Architectural Verdict

### Selected Architectural Strategy: **Option C (Keep Local Telemetry/Heuristics + External Security Intelligence)**

#### Rationale:
1. **Offline & Air-Gapped Reliability:** Relying 100% on external APIs (Option A) would break endpoint security whenever the system loses internet connectivity or encounters API rate-limiting (e.g., VirusTotal free tier limit of 4 requests/min).
2. **Deterministic Speed:** Local heuristic engines (YARA, entropy checks, parent-child process tree analysis) execute in milliseconds, allowing immediate detection of active threats (like ransomware file encryption) before waiting for external API network round-trips.
3. **Privacy & Security Balance:** Keeping local sensors intact ensures host telemetry stays on the machine by default, while AI (Gemini/Ollama) and VirusTotal provide high-value context enrichment only when requested or configured.

### Actionable Next Steps for Production Hardening:
1. **Harden Native Binary Inspection:** Replace custom JS binary headers with native bindings (e.g., node-gyp wrappers for libyara or PE parsing) to improve performance on large files.
2. **Extend System Sensor Telemetry:** Standardize cross-platform eBPF (Linux) and ETW (Windows Event Tracing) hooks for deeper kernel-level process and network monitoring.
3. **Expand YARA & IOC Signature Database:** Expand the rules in `rules/yara/` to include more malware family signatures beyond ransomware.

---

### Summary of Completed Audit
- **Files Modified:** None prior; document saved to `check ai.md`.
- **Audit Result:** Confirmed FlotBot contains a custom local detection engine paired with hybrid cloud/local AI and threat intelligence services.
