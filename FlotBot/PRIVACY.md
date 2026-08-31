# FloatBot AI — Privacy Policy & Data Minimization

## 1. Privacy Architecture

FloatBot is architected around the principle of **Local-First Privacy**. Endpoint security telemetry should not leave the host machine unless explicitly authorized by the administrator.

---

## 2. Privacy Guarantees

### 2.1 100% Offline AI Privacy Mode (`AI_PRIVACY_MODE=true`)
When `AI_PRIVACY_MODE=true` is enabled:
- **Zero Cloud Data**: All chat reasoning, threat analysis, and visual inspections are executed strictly on the local machine using Ollama (`llama3.1`, `qwen2.5`).
- **No External Network Calls**: Cloud Gemini endpoints are disabled.
- **Local Threat Intelligence**: Indicators are evaluated against local IOC signature databases without external API queries.

### 2.2 Automated Data Minimization & Secret Redaction
Before any screen text, command-line arguments, or telemetry snippets are passed to AI models:
- Passwords (`password: ...`) are replaced with `[REDACTED]`.
- API keys (`sk-...`, `AIzaSy...`) are replaced with `[REDACTED_API_KEY]`.
- Bearer tokens are replaced with `Bearer [REDACTED_TOKEN]`.
- Private tokens and secret hashes are scrubbed.

### 2.3 Visual Privacy Guarantees
- The `ScreenSecurityEngine` inspects desktop frames locally. Raw full-resolution desktop screenshots are never uploaded to cloud servers.
- Screen inspection modes can be configured to `OFF` or `MANUAL` at any time from the settings menu.

### 2.4 Local Storage Only
All alerts, incidents, process logs, audit trails, and configuration settings are stored locally in the endpoint's SQLite database (`~/.config/flotbot/flotbot.db`).
