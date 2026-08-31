# FloatBot AI — Verification & Testing Guide

## 1. Test Architecture

FloatBot AI includes an automated test matrix powered by Jest covering 27 test suites and 70 comprehensive unit, integration, and platform mock tests.

```bash
npm test
```

---

## 2. Test Suite Breakdown

| Test File | Target Subsystem | Scope |
| :--- | :--- | :--- |
| `tests/unified_events.test.js` | `UnifiedSecurityEvent`, `EventNormalizer`, `EventBus` | Event schema validity, normalization, async pub/sub, error isolation |
| `tests/capability_registry.test.js` | `CapabilityRegistry`, `PermissionManager` | OS capability detection, permission diagnostics, remediations |
| `tests/yara_engine.test.js` | `YaraEngine`, `rules/yara/*.yar` | Pure YARA parsing, text/hex/regex scanning, conditions, reverse shell & ransomware rules |
| `tests/threat_intel.test.js` | `LocalIOCProvider`, `ThreatIntelCache`, `ThreatIntelEngine` | Hash lookups, indicator TTL caching, rate-limit cooldowns |
| `tests/process_tree.test.js` | `ProcessTreeEngine` | Process hierarchy, lineage generation, parent-child anomaly detection, masquerading |
| `tests/url_engine.test.js` | `URLEngine` | Lookalike domains, leetspeak normalization, IP hosts, punycode, phishing indicators |
| `tests/behavior_engine.test.js` | `BehaviorEngine`, `BaselineEngine` | Multi-event attack lifecycles (`Drop → Execute → C2`), persistence correlation |
| `tests/ransomware_engine.test.js` | `RansomwareEngine` | Shannon entropy calculations, modification bursts, extension mutations, shadow copies |
| `tests/canary_system.test.js` | `CanarySystem` | Decoy canary file deployment, file system watching, tripwire triggering |
| `tests/correlation_engine.test.js` | `CorrelationEngine`, `ThreatGraph`, `AttackStoryGenerator` | Multi-sensor incident synthesis, entity graph generation, chronological story |
| `tests/risk_engine.test.js` | `RiskEngine` | Deterministic mathematical risk scoring (0–100) and confidence (0.0–1.0) |
| `tests/sensor_supervisor.test.js` | `SensorSupervisor` | Fault isolation, sensor retry backoff, health reporting |
| `tests/audit_logger.test.js` | `AuditLogger` | Cryptographic SHA-256 hash chaining, tamper detection |
| `tests/demo_simulator.test.js` | `DemoSimulator` | Synthetic attack scenarios, explicit `is_demo` flags |
| `tests/safe_action_executor.test.js` | `SafeActionExecutor` | Action allowlisting, rejection of arbitrary shell commands, PID 1 protection |
| `tests/ai_engine.test.js` | `AIEngine` | Dual-mode routing, instant greetings, slash commands, model switching |
| `tests/ai_benchmark.test.js` | `AIBenchmark` | Model latency, grounding, prompt injection defense resilience |
| `tests/database.test.js` | `Database`, `schema.js` | SQLite WAL mode, schema initialization, table indexes |
| `tests/alert.test.js` | `AlertManager`, `Alert` | Alert lifecycles, deduplication, acknowledgement |
| `tests/screen_analyzer.test.js` | `ScreenAnalyzer` | Redaction of passwords/keys, visual heuristics |
| `tests/thread_analyzer.test.js` | `ThreadAnalyzer` | High thread count detection, CPU anomaly scoring |
| `tests/network.test.js` | `NetworkCollector`, Rules | C2 beaconing, reverse shell rules, socket parsing |
| `tests/process.test.js` | `SystemCollector`, Rules | PowerShell suspicious arguments, LOLBin rules |
| `tests/malware_inspector.test.js` | `RealMalwareInspector` | Shannon entropy, PE headers, IOC hashes |
| `tests/threat.test.js` | `ThreatEngine` | Rule execution against snapshot arrays |
| `tests/watcher.test.js` | `SystemWatcher` | Process creation / termination delta diffing |
| `tests/event.test.js` | `Event`, `EventBus` | Legacy event compatibility |

---

## 3. Running Specific Tests
To run an individual test suite:
```bash
npx jest tests/yara_engine.test.js
npx jest tests/correlation_engine.test.js
npx jest tests/risk_engine.test.js
```
