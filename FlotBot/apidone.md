# FLOTBOT SECURITY ENGINE REFACTOR REPORT

---

## 1. Before
Prior to this refactor, FlotBot relied on custom, local heuristic engines (`YaraEngine`, `RansomwareEngine`, `URLEngine`, `PEAnalyzer`, `MLThreatClassifier`) as primary authorities that independently declared files or URLs as `MALICIOUS`, `SAFE`, `PHISHING`, or `RANSOMWARE`. VirusTotal existed only as an optional secondary threat lookup without standardized evidence normalization or integration with Google Safe Browsing / Hybrid Analysis.

---

## 2. Removed/Disabled
No telemetry code was deleted. Custom detection algorithms were disabled as sole authoritative detectors and repurposed to generate local evidence/telemetry signals.

| Component | File | Action | Reason |
| :--- | :--- | :--- | :--- |
| `FileAnalyzer` Standalone Verdict | `core/fileengine/FileAnalyzer.js` | **Refactored** | Prevented local risk score and ML predictions from declaring `MALICIOUS` without external API or reputation database match. |
| `URLEngine` Direct Classification | `core/detection/URLEngine.js` | **Refactored** | Converted `riskLevel` output into heuristic telemetry (`NO_AUTHORITATIVE_VERDICT`); deferred authoritative verdict to external APIs. |
| Hardcoded Local Verdicts | `core/detection/RansomwareEngine.js` | **Preserved as Telemetry** | Retained canary & entropy calculations as telemetry evidence inputs into `DetectionManager`. |

---

## 3. Preserved
All endpoint monitoring and telemetry collectors were strictly preserved to supply evidence for correlation:
- **File Metadata & Hashes:** SHA-256 / MD5 calculation, file size, path score, digital signature verification.
- **Process Lineage:** Process trees, PID/PPID mapping, LOLBin execution parameters.
- **Network Sockets:** `ss -tunp` / `netstat -ano` connections, remote IP addresses, DNS cache tables.
- **Persistence Telemetry:** Windows Registry Run keys, Linux XDG autostart, systemd service descriptors, cron jobs, `.bashrc` additions.
- **Browser & Screen:** Screenshot capture, window titles, OCR redaction (`ScreenAnalyzer.js`), Punycode/homograph detection.
- **System Information:** Cross-platform OS adapters for Windows, Linux, and macOS (`platform/*Adapter.js`).

---

## 4. New Security Architecture

```
                                  ┌────────────────────────────────┐
                                  │   User Input / Event Trigger   │
                                  └───────────────┬────────────────┘
                                                  │
                                  ┌───────────────▼────────────────┐
                                  │       DetectionManager         │
                                  └───────┬───────────────┬────────┘
                                          │               │
                 ┌────────────────────────┴──────┐   ┌────┴──────────────────────────┐
                 ▼                               ▼   ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐               ┌───────────────────┐
       │   VirusTotal      │           │Safe Browsing (URL)│               │  Hybrid Analysis  │
       │   Provider        │           │    Provider       │               │    Provider       │
       └─────────┬─────────┘           └─────────┬─────────┘               └─────────┬─────────┘
                 │                               │                                   │
                 └───────────────────────┬───────┴───────────────────────────────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │ SecurityResult    │
                               │ Normalizer        │
                               └─────────┬─────────┘
                                         │
                                         ▼
                               ┌───────────────────┐     ┌───────────────────┐
                               │  Evidence Fusion  │◄────┤  Local Telemetry  │
                               └─────────┬─────────┘     └───────────────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │   FlotBot AI      │
                               │ (Gemini / Ollama) │
                               └─────────┬─────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │ Security Alert    │
                               └───────────────────┘
```

---

## 5. API Integration Points

| Provider | File | Purpose | Environment Variable | Ready for Key? |
| :--- | :--- | :--- | :--- | :--- |
| **VirusTotal** | `core/security/VirusTotalProvider.js` | SHA-256 hash lookup, URL reputation, IP & domain intel | `VIRUSTOTAL_API_KEY` | Yes |
| **Google Safe Browsing** | `core/security/SafeBrowsingProvider.js` | Malicious & phishing URL threat list queries | `GOOGLE_SAFE_BROWSING_API_KEY` | Yes |
| **Hybrid Analysis** | `core/security/HybridAnalysisProvider.js` | Deeper sandbox analysis for unknown/suspicious hashes | `HYBRID_ANALYSIS_API_KEY` | Yes |
| **Gemini AI** | `providers/GeminiProvider.js` | AI reasoning, user recommendations, multimodal vision | `GEMINI_API_KEY` | Yes |

---

## 6. API Keys To Add

```bash
VIRUSTOTAL_API_KEY=
GOOGLE_SAFE_BROWSING_API_KEY=
HYBRID_ANALYSIS_API_KEY=
GEMINI_API_KEY=
```

---

## 7. Detection Flow

### File Flow
`File` $\rightarrow$ `SHA-256 Calculation` $\rightarrow$ `VirusTotal Check` $\rightarrow$ `Known Result?` 
* **If YES:** Return Normalized Result.
* **If NO / Suspicious:** Escalate to `Hybrid Analysis Sandbox` $\rightarrow$ `Evidence Fusion` $\rightarrow$ `FlotBot AI` $\rightarrow$ `Alert`.

### URL Flow
`URL` $\rightarrow$ `DetectionManager` $\rightarrow$ Concurrent (`VirusTotal` + `Google Safe Browsing`) $\rightarrow$ `Evidence Fusion` $\rightarrow$ `FlotBot AI Explanation` $\rightarrow$ `Alert`.

---

## 8. Cross-Platform Status

* **Windows:** Fully operational (WMI, PowerShell CIM, Win32 registry collectors, `netstat -ano`).
* **Linux:** Fully operational (`/proc` filesystem parsing, `ss -tunp`, systemd unit inspections, XDG autostart).
* **macOS:** Fully operational (`sw_vers`, `launchctl`, LaunchAgents/Daemons plists, `netstat -anf inet`).

---

## 9. Offline Behavior

When external APIs are unavailable or unconfigured, FlotBot **does NOT claim the file or URL is 100% safe**. 

It returns:
- Classification: `unavailable` or `unknown`
- Status: `"SECURITY SERVICE UNAVAILABLE: External API verification was not available."`
- Local telemetry continues collecting evidence, and AI (Ollama/Gemini) explains available telemetry while noting that external API verification was offline.

---

## 10. Remaining Custom Detection

| Component | File | Current Status | Purpose |
| :--- | :--- | :--- | :--- |
| `YaraEngine` | `core/detection/YaraEngine.js` | Telemetry Heuristic | Provides regex/string match evidence to `FileAnalyzer`. |
| `RansomwareEngine` | `core/detection/RansomwareEngine.js` | Telemetry Heuristic | Monitors decoy canary tripwires and process entropy. |
| `URLEngine` | `core/detection/URLEngine.js` | Telemetry Heuristic | Generates Punycode & homograph warnings for `DetectionManager`. |

---

## 11. Security Risks

- **False-Negative Risk (Offline Mode):** If a new malware file is scanned while offline without local IOC database records, it will be classified as `unknown` rather than `malicious`.
- **API Rate Limits:** Free-tier VirusTotal (4 requests/min) or Hybrid Analysis keys may hit rate limits under heavy scanning; handled via graceful fallback to `unavailable` status.

---

## 12. Files Changed

| File Path | Changes Made | Rationale |
| :--- | :--- | :--- |
| `core/security/ThreatIntelProvider.js` | Created abstract provider contract | Standardized base interface for external security services. |
| `core/security/SecurityResult.js` | Created normalized result structure | Ensured all providers return standard classification & evidence fields. |
| `core/security/VirusTotalProvider.js` | Refactored & updated | Implemented SHA-256 and URL checks returning `SecurityResult`. |
| `core/security/SafeBrowsingProvider.js` | Created Google Safe Browsing integration | Added malicious URL detection integration location. |
| `core/security/HybridAnalysisProvider.js` | Created Hybrid Analysis integration | Added sandbox escalation location for unknown hashes. |
| `core/security/DetectionManager.js` | Created central security orchestrator | Correlates provider results with local telemetry evidence. |
| `core/security/index.js` | Created module export | Clean package export for core security layer. |
| `core/fileengine/FileAnalyzer.js` | Refactored verdict logic | Removed ability of local heuristics to declare `MALICIOUS` independently. |
| `core/detection/URLEngine.js` | Refactored verdict output | Deferred authoritative verdicts to `DetectionManager`. |
| `.env.example` | Updated configuration placeholders | Added placeholders for VirusTotal, Safe Browsing, Hybrid Analysis, and Gemini keys. |
| `tests/security_providers.test.js` | Created test suite | Added unit tests covering missing keys and error handling. |

---

## 13. Files NOT Changed

- `platform/windows/WindowsAdapter.js`, `platform/linux/LinuxAdapter.js`, `platform/macos/MacOSAdapter.js`: Preserved native OS inspection logic.
- `modules/network/collector.js`, `modules/registry/collector.js`: Preserved socket and persistence telemetry.
- `core/ai/AIEngine.js`, `core/ai/PromptShield.js`: Preserved AI reasoning and prompt injection defenses.

---

## 14. API KEY SETUP

To activate external security intelligence, add your API keys in the `.env` file at the root of the project:

```ini
# Target File: /home/zoro/Documents/FlotBot/.env

VIRUSTOTAL_API_KEY=PASTE_YOUR_KEY_HERE
GOOGLE_SAFE_BROWSING_API_KEY=PASTE_YOUR_KEY_HERE
HYBRID_ANALYSIS_API_KEY=PASTE_YOUR_KEY_HERE
GEMINI_API_KEY=PASTE_YOUR_KEY_HERE
```

---

## 15. Final Verification Checklist

- [x] Custom detection no longer acts as the primary authoritative detector
- [x] VirusTotal integration location exists (`core/security/VirusTotalProvider.js`)
- [x] Safe Browsing integration location exists (`core/security/SafeBrowsingProvider.js`)
- [x] Hybrid Analysis integration location exists (`core/security/HybridAnalysisProvider.js`)
- [x] API keys are environment-based
- [x] Secrets are not logged or exposed
- [x] Existing telemetry preserved
- [x] AI is not the sole detection authority
- [x] Offline behavior returns safe `unknown` / `unavailable` status
- [x] Cross-Platform architecture preserved for Windows, Linux, and macOS
- [x] Test suite created (`tests/security_providers.test.js`)
