# FloatBot AI — Multi-Provider Threat Detection & Awareness Architecture Reference
**Document Version:** 2.0  
**Updated:** September 2026  
**Status:** Implemented & Verified  

---

## 1. Executive Summary

FloatBot AI is an active **AI-driven Cybersecurity Awareness & Threat Interception Platform**. The system operates on a **Human-in-the-Loop defense architecture**:

1. **Active Threat Detection Engines** (combining **Local Heuristics**, **VirusTotal v3**, **Google Safe Browsing v4**, and **Hybrid Analysis Falcon Sandbox**) continuously intercept and pause risky user activities (such as visiting phishing URLs, opening suspicious file downloads, or executing anomalous scripts).
2. **FlotBot AI** acts as the dedicated **Cybersecurity Coach & Explainer**, receiving structured telemetry from the detection engines and translating complex attack signals into plain-English security awareness coaching.
3. An **Interactive Security Interception Gate** requires the user to review the threat explanation and choose between returning to safety (recommended) or providing an explicit acknowledgment / manual approval to proceed.
4. All detections, AI explanations, and user decisions are recorded in real time to the **Audit Logging System** and surfaced in the **Admin Panel's User Inspection Dashboard** to track individual security posture scores.

---

## 2. Architecture & Data Flow

```
                                  [ USER ACTION ]
                (Clicks Link, Uploads File, or Runs Script)
                                         │
                                         ▼
                 ┌──────────────────────────────────────────────┐
                 │          1. LOCAL HEURISTIC PRE-FILTER       │
                 │  • URLEngine (Punycode, Typosquatting, TLD)  │
                 │  • FileThreatEngine (Entropy, Double Ext)    │
                 │  • YaraEngine & ProcessTreeEngine            │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │       2. CLOUD THREAT INTELLIGENCE TRIAD     │
                 │  • Google Safe Browsing (Phishing Threat DB) │
                 │  • VirusTotal v3 (70+ Antivirus AV Engines)  │
                 │  • Hybrid Analysis (Dynamic Cloud Sandbox)   │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │         3. MULTI-PROVIDER FUSION LAYER        │
                 │        (DetectionManager._fuseResults)       │
                 │   • Consensus Score (e.g., 14/72 Engines)    │
                 │   • Confidence Rating & MITRE ATT&CK Mapping │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                   ╔══════════════════════════════════════╗
                   ║  4. FLOTBOT AI SECURITY TRANSLATOR   ║
                   ║   (AIEngine / Cyber Awareness Coach) ║
                   ╚══════════════════════════════════════╝
                                        │
                                        ▼
                   ╔══════════════════════════════════════╗
                   ║     5. INTERACTIVE SECURITY GATE     ║
                   ║     (Action Paused · User Review)    ║
                   ╚══════════════════════════════════════╝
                                  /            \
                  [🛡️ Safe Exit]                [⚠️ Acknowledge Risk]
                        │                                │
                        ▼                                ▼
                 Alert Resolved                    Override Logged
                 (+20 Awareness XP)                (Activity Resumed)
                        │                                │
                        └───────────────┬────────────────┘
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │         6. AUDIT LOG & ADMIN INSPECTION      │
                 │   (FlotBotUserBehaviourView & AuditLogs)     │
                 └──────────────────────────────────────────────┘
```

---

## 3. Threat Detection Engines in Detail

### 3.1 Local Heuristic Sensor Layer (`server/services/URLEngine.js`)
* **Leetspeak & Typosquatting Normalization:** Converts character substitutions (`paypa1` $\to$ `paypal`, `micros0ft` $\to$ `microsoft`, `g00gle` $\to$ `google`) to catch brand impersonation.
* **IDN Homograph & Punycode Detection:** Catches internationalized domain name attacks (`xn--...`).
* **High-Risk TLD Reputation:** Filters abusive domain registrations (`.zip`, `.top`, `.xyz`, `.click`, `.kim`, `.tk`, `.icu`, `.cam`, `.rest`).
* **Raw IP & Obfuscated Hostnames:** Blocks direct IPv4/IPv6 links and octal/hex encoded hostnames (`0x7f000001`).
* **Credential Harvester Path Patterns:** Identifies `/login`, `/signin`, `/verify`, `/account-update` endpoints on unverified hosts.

### 3.2 Cloud Threat Intelligence Triad (`server/services/security/`)
* **Google Safe Browsing v4 (`SafeBrowsingProvider.js`):** Queries Google's live dataset of active phishing, social engineering, and unwanted software URLs.
* **VirusTotal v3 (`VirusTotalProvider.js`):** Queries 70+ industry antivirus vendors (Kaspersky, Microsoft Defender, CrowdStrike, Sophos, Bitdefender) for real-time URL reputation and SHA-256 file hashes.
* **Hybrid Analysis Falcon Sandbox (`HybridAnalysisProvider.js`):** Escalates suspicious or unknown zero-day file hashes for dynamic behavioral cloud detonation.

### 3.3 Multi-Provider Evidence Fusion (`DetectionManager.js`)
Rather than relying on a single engine, `DetectionManager` fuses local and cloud evidence into a unified verdict:
* **`MALICIOUS`**: Flagged by Google Safe Browsing OR $\ge 2$ VirusTotal engines OR confirmed sandbox malware verdict.
* **`SUSPICIOUS`**: High local heuristic risk (score $\ge 60$) OR $1$ vendor match.
* **`CLEAN / NO_KNOWN_THREAT`**: Zero matches across all active intelligence providers.

---

## 4. FlotBot AI Security Coach & Explanation Pipeline

### 4.1 Telemetry Handoff
When an alert is intercepted, `DetectionManager` provides structured JSON evidence to `FlotBotService.analyzeUrl()` or `FlotBotService.analyzeFile()`:
```json
{
  "target": "http://paypa1-security-login.xyz/verify",
  "classification": "suspicious",
  "score": 100,
  "riskLevel": "HIGH",
  "provider_results": [
    { "provider": "GoogleSafeBrowsing", "status": "completed", "classification": "no_known_threat" },
    { "provider": "VirusTotal", "status": "completed", "classification": "suspicious" }
  ],
  "evidence": [
    "Local Sensor: Brand lookalike detected: Impersonation of 'paypal'",
    "Local Sensor: High-risk Top-Level Domain (.xyz)",
    "Local Sensor: Credential authentication path found"
  ]
}
```

### 4.2 AI Plain-English Awareness Generation
FlotBot's AI engine (`flotbotService.askAI()`) translates this technical data into clear coaching:
> *"🔴 **Threat Intercepted:** This URL mimics **PayPal** using character substitution (`paypa1`) on an abusive `.xyz` domain. Attackers use this to steal login credentials. Do not enter passwords or personal data."*

---

## 5. Interactive Interception Gate & User Decisions

When a threat is intercepted:
1. **Activity is Paused:** Navigation or file execution is immediately halted.
2. **Modal Pop-Up:** `ThreatInterceptionModal.tsx` appears with:
   * 🛑 **Activity Paused by Threat Engine**
   * 🌐 **Multi-Provider Intelligence Badges**
   * 💡 **FlotBot AI Security Coach Analysis**
   * 🛡️ **Action Choices:**
     * **[Return to Safety (Recommended)]**: Cancels navigation, resolves the alert in the database, and awards **+20 Awareness XP**.
     * **[Acknowledge Risk & Proceed]**: Requires checking a confirmation checkbox and entering an optional justification. Records a **Risk Override** in the audit log and unpauses activity.

---

## 6. Preserved Manual Scanning Capabilities

Users can continue to manually scan links and files:
1. **Manual URL Scanning:**
   * Enter any URL into the **URL Scanner** on the AI Assistant page or ask FlotBot directly in the chat window.
2. **File Drag-and-Drop & Malware Upload Scanner:**
   * Click or drag-and-drop any file into the **File Scanner**.
   * The browser calculates the **SHA-256 hash** and **Shannon Entropy** in real time using the Web Crypto API.
   * Sends the hash to `POST /api/flotbot/analyze-file` to query **VirusTotal** and **Hybrid Analysis Sandbox**.

---

## 7. Database & Admin Panel User Inspection

### 7.1 Database Tables
* **`alerts` table:** Stores `id`, `user_id`, `severity`, `title`, `source`, `evidence`, `mitre`, `ai_analysis`, `status`, `acknowledged`.
* **`alert_events` table:** Tracks full lifecycle events: `detected`, `interception_paused`, `ai_explained`, `user_avoided_threat`, `user_acknowledged_override`.
* **`user_activity` table:** Tracks security awareness events, XP gains, and overrides.

### 7.2 Admin Views
* **SOC Threat Feed (`admin/src/components/flotbot/FlotBotAlertsView.tsx`):** Real-time stream of all enterprise security alerts.
* **User Inspection Dashboard (`admin/src/components/flotbot/FlotBotUserBehaviourView.tsx`):** Displays each user's **Security Posture Score**, alert response time, and risk overrides.

---

## 8. Directory & File Inventory

| Component | Location | Role |
| :--- | :--- | :--- |
| **Local URLEngine** | `server/services/URLEngine.js` | Typosquatting, Punycode, TLD reputation, and path heuristics. |
| **Detection Manager** | `server/services/security/DetectionManager.js` | Multi-provider threat intelligence orchestrator. |
| **VirusTotal Provider** | `server/services/security/VirusTotalProvider.js` | Cloud AV hash and URL reputation query layer. |
| **Safe Browsing Provider** | `server/services/security/SafeBrowsingProvider.js` | Google Safe Browsing v4 threat list matcher. |
| **Hybrid Analysis Provider** | `server/services/security/HybridAnalysisProvider.js` | Falcon dynamic sandbox detonation query layer. |
| **FlotBot Service** | `server/services/flotbotService.js` | AI coaching generation, alert management, and user decision logging. |
| **Threat API Routes** | `server/routes/flotbot.js` | `/api/flotbot/analyze-url`, `/api/flotbot/analyze-file`, `/api/flotbot/alerts/:id/decision`. |
| **Interception Modal** | `src/components/modals/ThreatInterceptionModal.tsx` | Interactive Human-in-the-Loop Security Gate. |
| **AI Assistant & Sandbox** | `src/components/pages/AIAssistantPage.tsx` | Live threat simulator, URL scanner, and File upload scanner. |
| **Admin Inspection** | `admin/src/components/flotbot/FlotBotUserBehaviourView.tsx` | Objective employee security posture scores. |
