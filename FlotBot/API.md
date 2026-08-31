# FloatBot AI — API & Interface Reference

## 1. Core Interfaces

### 1.1 `EventBus` (`core/events/EventBus.js`)
Central asynchronous event bus for security telemetry.
- `subscribe(eventType: string, handler: Function): Function`
  - Subscribes to an event type (or `"*"` for all events). Returns an unsubscribe function.
- `publish(event: UnifiedSecurityEvent | object): void`
  - Publishes an event to all subscribers and records to ring buffer history.
- `getHistory(limit?: number, eventType?: string): Array<object>`
  - Retrieves recent event history.

### 1.2 `YaraEngine` (`core/detection/YaraEngine.js`)
Cross-platform YARA rule parser and scanner.
- `loadRules(): Promise<number>`
  - Compiles all `.yar` / `.yara` files in the configured rules directory.
- `scan(target: Buffer | string, filePath?: string): Array<object>`
  - Scans an in-memory buffer or string against all loaded rules.
- `scanFile(filePath: string): Promise<Array<object>>`
  - Scans a file on disk.

### 1.3 `CorrelationEngine` (`core/correlation/CorrelationEngine.js`)
Aggregates telemetry events into unified, contextual Incidents.
- `ingest(event: UnifiedSecurityEvent): { incident: object, isNew: boolean }`
  - Ingests an event, correlates with active incidents, re-calculates risk, builds ThreatGraph and AttackStory.
- `getIncidents(): Array<object>`
  - Returns all active incidents.

### 1.4 `RiskEngine` (`core/risk/RiskEngine.js`)
Deterministic risk and confidence scoring engine.
- `static calculate(signals: Array<object>): { riskScore: number, confidence: number, tier: string, breakdown: Array<object> }`
  - Calculates deterministic 0–100 risk score and 0.0–1.0 confidence.

### 1.5 `SafeActionExecutor` (`core/security/SafeActionExecutor.js`)
Allowlisted action remediation executor.
- `executeAction(options: { actionType: string, params: object, userApproved: boolean, reason: string, initiatedBy?: string }): Promise<object>`
  - Executes allowlisted actions (`collect_evidence`, `calculate_hash`, `quarantine_file`, `restore_file`, `terminate_process`, `block_indicator`, `create_incident`, `export_report`).

### 1.6 `AuditLogger` (`core/audit/AuditLogger.js`)
Tamper-evident cryptographic audit logger.
- `log(entry: object): Promise<object>`
  - Logs audited action with chained SHA-256 signature.
- `verifyIntegrity(): Promise<{ valid: boolean, totalChecked: number, brokenAt: string | null }>`
  - Verifies entire audit chain integrity.

### 1.7 `CapabilityRegistry` (`core/platform/CapabilityRegistry.js`)
Runtime OS capability and permission inspector.
- `detectCapabilities(forceRefresh?: boolean): Promise<object>`
  - Returns full posture and subsystem capability matrix.

---

## 2. Chrome Extension & Localhost REST API
FloatBot exposes a local REST bridge on port `41738` (`127.0.0.1` only) for the companion browser extension:
- `POST /api/url/check` — Submits visited URLs for real-time homograph and phishing analysis.
- `POST /api/telemetry/event` — Ingests browser security events directly into the `EventBus`.
- `GET /health` — Returns status (`200 OK`) and active AI mode.
