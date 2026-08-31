# 🛡️ FloatBot AI — Enterprise Endpoint Detection & Response (EDR/XDR)

**FloatBot AI** is a lightweight, cross-platform, AI-assisted Endpoint Detection and Response (EDR/XDR) platform supporting **Linux**, **macOS**, and **Windows**.

FloatBot combines high-performance native OS telemetry sensors, pure cross-platform YARA pattern compilation, local and cloud Threat Intelligence feeds, deterministic multi-stage kill-chain correlation, ransomware canaries, and an Adaptive Hybrid AI Router (Gemini + Ollama) for grounded security operations.

---

## 🚀 Key Subsystems & Capabilities

* **Platform Abstraction Layer (PAL)**: Standardized native telemetry providers across Windows (WMI/PowerShell/CIM), Linux (`/proc`, `ss`, inotify, systemd), and macOS (`launchd`, `ps`, `netstat`, `screencapture`).
* **Universal Normalized Event Bus**: High-throughput async event highway routing standardized `UnifiedSecurityEvent` streams to all detection engines.
* **Pure Cross-Platform YARA Engine**: In-engine YARA parser and scanner in `rules/yara/` supporting text strings, regex, hex patterns, metadata, and MITRE mapping.
* **Threat Intelligence Subsystem**: Local IOC signature database (SHA-256, IPs, domains, process names) with optional VirusTotal v3 cloud reputation and rate-limiting guard.
* **Process Lineage & Anomaly Engine**: Complete ancestor process tree builder detecting suspicious parent-child chains (e.g. Office apps spawning shells) and process masquerading in temp paths.
* **Multidimensional URL & Phishing Engine**: Detects typosquatting, IDN homograph punycode, raw IP hosts, high-risk TLDs, and credential harvest paths.
* **Screen Security & Visual Threat Engine**: Privacy-first local credential redaction, visual phishing analysis, and scam alert popup detection (Modes: OFF, MANUAL, PERIODIC, EVENT_TRIGGERED).
* **Behavior Engine & Baselines**: Multi-event attack lifecycle correlator (`Download → Drop → Execute → Network C2`) with per-process baseline anomaly scoring.
* **Ransomware Engine & Decoy Canary System**: Multi-signal ransomware detector (burst file modifications, extension morphing, high Shannon entropy, ransom note drops, shadow copy deletion) with safe user-space canary tripwires.
* **Incident Correlation & Threat Graph**: Aggregates multi-sensor events into unified `Incident` records with directed Threat Graphs (`USER`, `PROCESS`, `FILE`, `HASH`, `IP`, `DOMAIN`, `PERSISTENCE`) and chronological Attack Stories.
* **Deterministic Risk Engine**: Strict mathematical scoring (0–100) + separate confidence score (0.0–1.0) with zero hallucination.
* **Adaptive Hybrid AI Router**:
  - `Offline Mode`: 100% private, local inference via Ollama (`llama3.1`, `qwen2.5`).
  - `Online Mode`: Google Gemini 2.0 Flash / Pro with Multimodal Vision and Prompt Caching.
  - `Auto Mode`: Smart routing keeping sensitive telemetry local while offloading complex reasoning to cloud.
* **Prompt Injection Defense & Data Minimization**: Strict boundary tagging `<untrusted_external_data>` and automated redaction of passwords, tokens, and API keys.
* **Security Copilot & Controlled Response Engine**: Allowlisted actions only (`collect_evidence`, `calculate_hash`, `quarantine_file`, `restore_file`, `terminate_process`, `block_indicator`, `create_incident`, `export_report`). Zero arbitrary shell execution.
* **Tamper-Evident Audit Logging**: Cryptographically linked SHA-256 hash chaining ensuring log modification or deletion is instantly detected.
* **Safe Demo Mode**: Isolated synthetic attack simulations with explicit `[DEMO MODE]` tags.
* **FloatBot Doctor CLI**: Built-in environment and sensor diagnostics (`floatbot doctor`).

---

## 🛠️ Quick Start & CLI Usage

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Operating System**: Linux, macOS, or Windows

### 1. Installation
```bash
git clone https://github.com/your-org/flotbot.git
cd FlotBot
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your keys in `.env` (optional):
```ini
GEMINI_API_KEY=your_gemini_api_key_here
VIRUSTOTAL_API_KEY=your_virustotal_key_here
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
AI_PRIVACY_MODE=false
```

### 3. Run System Diagnostics (Doctor)
Verify OS permissions, database integrity, YARA rules, local AI, and sensor health:
```bash
node scripts/doctor.js
# Or via CLI:
./bin/floatbot doctor
```

### 4. Run Automated Test Matrix
Execute the 27 Jest test suites:
```bash
npm test
```

### 5. Launch the FloatBot Console
```bash
npm start
# Or via CLI:
./bin/floatbot start
```

---

## 📁 Repository Architecture

```
├── app/                     # CLI App entry points
├── bin/                     # Standalone CLI tools (floatbot)
├── core/
│   ├── ai/                  # AIEngine, PromptShield, AIBenchmark
│   ├── alerts/              # AlertManager, Alert models, Severity
│   ├── audit/               # Cryptographic AuditLogger (SHA-256 hash chaining)
│   ├── correlation/         # CorrelationEngine, ThreatGraph, AttackStoryGenerator
│   ├── demo/                # DemoSimulator (Safe synthetic attack scenarios)
│   ├── detection/           # YaraEngine, HashEngine, URLEngine, ProcessTreeEngine,
│   │                        # BehaviorEngine, BaselineEngine, RansomwareEngine,
│   │                        # CanarySystem, ScreenSecurityEngine
│   ├── events/              # UnifiedSecurityEvent, EventNormalizer, EventBus
│   ├── platform/            # PlatformSensor base, CapabilityRegistry, PermissionManager
│   ├── reporting/           # ReportGenerator (HTML/JSON/CSV), ThreatReplay, ThreatTimeline
│   ├── risk/                # RiskEngine (Deterministic risk & confidence scoring)
│   ├── security/            # SafeActionExecutor (Allowlist only), QuarantineManager
│   └── system/              # SensorSupervisor (Fault isolation & self-healing)
├── data/                    # Local IOC signature databases
├── database/                # SQLite3 DB, Schema, Repositories
├── electron/                # Main dashboard, Floating widget, Admin console
├── modules/                 # System, Network, File, Registry, Browser collectors
├── platform/
│   ├── linux/               # Linux native sensors (/proc, ss, inotify, systemd)
│   ├── macos/               # macOS native sensors (launchd, ps, netstat)
│   └── windows/             # Windows native sensors (WMI, CIM, netstat, Registry)
├── providers/               # GeminiProvider, OllamaProvider, MockProvider
├── rules/yara/              # Standard compiled YARA rule files (.yar)
├── scripts/                 # Bootstrap, diagnostics doctor, setup scripts
└── tests/                   # 27 comprehensive Jest test suites (70 tests)
```

---

## 🔒 Security & Privacy Guarantees

* **Zero Fake Telemetry**: FloatBot only displays verified telemetry collected from real OS APIs. If a capability requires elevated permissions, it is explicitly shown as `DEGRADED` or `PERMISSION REQUIRED`.
* **Zero Arbitrary Execution**: The AI Security Copilot cannot run arbitrary shell commands; all remediation executes through the allowlisted `SafeActionExecutor`.
* **Privacy First**: With `AI_PRIVACY_MODE=true`, 100% of telemetry and AI inference remains strictly offline on your device using Ollama.

---

## 📄 License
Apache-2.0 License.
