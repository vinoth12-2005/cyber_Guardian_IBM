# FloatBot AI — Threat Detection Engine Reference

## 1. Overview

FloatBot AI employs a multi-layered, defense-in-depth detection architecture spanning static heuristics, cryptographic hash reputation, compiled YARA signatures, process tree behavioral analysis, network telemetry correlation, and safe canary tripwires.

---

## 2. Detection Engines

### 2.1 Pure Cross-Platform YARA Engine (`core/detection/YaraEngine.js`)
- **Location of Rules**: `rules/yara/`
- **Default Compiled Rules**:
  - `ransomware.yar`: Detects generic ransom notes, shadow copy deletion commands, and encryption markers (MITRE T1486, T1490).
  - `reverse_shell.yar`: Detects interactive shell redirections (bash/sh `/dev/tcp`, netcat `-e`, Python socket scripts, PowerShell WebClient payloads) (MITRE T1059).
  - `webshell.yar`: Detects PHP, JSP, and ASPX webshell execution vectors (`passthru`, `shell_exec`, `eval`, `ProcessBuilder`) (MITRE T1505.003).
  - `credential_stealer.yar`: Detects info-stealer exfiltration webhooks (Discord, Telegram) targeting browser cookies and stored credentials (MITRE T1555).
  - `cryptominer.yar`: Detects stratum mining protocols, XMRig, and mining configuration artifacts (MITRE T1496).

### 2.2 Process Tree & Lineage Engine (`core/detection/ProcessTreeEngine.js`)
- Reconstructs complete hierarchical parent-child process ancestry chains.
- Detects suspicious execution anomalies:
  - Office applications (`winword.exe`, `excel.exe`, `powerpnt.exe`) or Acrobat (`acrord32.exe`) spawning command interpreters (`powershell.exe`, `cmd.exe`, `bash`, `wscript.exe`, `mshta.exe`).
  - Web browsers (`chrome.exe`, `firefox.exe`, `msedge.exe`) directly launching command shells.
  - Web servers (`nginx`, `httpd`, `tomcat`, `w3wp.exe`) spawning interactive processes.
  - Process masquerading (core system binary names executing from user temp or downloads folders).

### 2.3 Multidimensional URL & Phishing Engine (`core/detection/URLEngine.js`)
- Evaluates URLs across multiple risk dimensions:
  - **Protocol**: Unencrypted HTTP on authentication pages.
  - **Host Type**: Raw IPv4/IPv6 hosts, octal/hex obfuscated IP representations.
  - **IDN Homograph**: Punycode domains (`xn--...`).
  - **TLD Reputation**: High-risk TLDs (.top, .xyz, .zip, .click, .tk, etc.).
  - **Brand Lookalike / Leetspeak**: Normalizes leetspeak substitutions (`paypa1`, `micros0ft`, `g00gle`) to identify impersonation of major platforms.
  - **Credential Harvesters**: Path checks for login/banking endpoints on suspicious domains.

### 2.4 Ransomware & Canary Engine (`core/detection/RansomwareEngine.js` & `CanarySystem.js`)
- Multi-signal concurrent correlation:
  1. High-frequency modification burst (> 15 files in < 5 seconds).
  2. Extension mutations (.locked, .crypted, .crypto, .enc, .wnry, etc.).
  3. Shannon Entropy surge (> 7.4).
  4. Ransom note drops (`HOW_TO_RESTORE.txt`, `README_DECRYPT.html`).
  5. Backup / shadow copy tampering (`vssadmin delete shadows`, `wmic shadowcopy delete`).
  6. Decoy Canary tripwire tripping in `.flotbot/canaries/`.

### 2.5 Multi-Stage Behavior Engine (`core/detection/BehaviorEngine.js`)
- Correlates multi-event sequences across sensors:
  - **Attack Lifecycle**: Browser URL Visit → Executable Drop → Process Execution → Outbound C2 Socket.
  - **Persistence Chain**: Executable Launch → Script Execution → OS Persistence Installation.
  - **Living off the Land**: Trusted Application → Unexpected Child Process → Network Activity.

---

## 3. MITRE ATT&CK Matrix Alignment

| Technique ID | Technique Name | FloatBot Detection Engine |
| :--- | :--- | :--- |
| **T1566.002** | Phishing: Spearphishing Link | `URLEngine`, `ScreenSecurityEngine` |
| **T1105** | Ingress Tool Transfer (Download) | `BehaviorEngine`, `FilesystemSensor` |
| **T1204.002** | User Execution: Malicious File | `ProcessTreeEngine`, `BehaviorEngine` |
| **T1059** | Command and Scripting Interpreter | `ProcessTreeEngine`, `YaraEngine` |
| **T1036.005** | Masquerading: Match Legitimate Name | `ProcessTreeEngine` |
| **T1036.007** | Masquerading: Double File Extension | `FilesystemSensor`, `DeepFileSystemScanner` |
| **T1547** | Boot or Logon Autostart Execution | `PersistenceSensor`, `BehaviorEngine` |
| **T1071.001** | Application Layer Protocol: Web | `NetworkSensor`, `ThreatIntelEngine` |
| **T1486** | Data Encrypted for Impact (Ransomware) | `RansomwareEngine`, `CanarySystem` |
| **T1490** | Inhibit System Recovery (Shadow Copies) | `RansomwareEngine`, `ProcessTreeEngine` |
| **T1555** | Credentials from Password Stores | `YaraEngine` |
| **T1496** | Resource Hijacking (Cryptomining) | `YaraEngine`, `ThreadAnalyzer` |
