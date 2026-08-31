# FlotBot — AI Rebuild Plan
### Remove All Existing AI → Rebuild From Scratch with Gemini + Ollama

---

## Overview

The current AI implementation is tightly coupled to **IBM Granite / watsonx.ai** (paid, complex SDK) with Gemini and Ollama as afterthoughts. This plan removes all existing AI code completely and rebuilds a clean, dual-provider AI system from scratch where:

- **Gemini 2.0 Flash** handles all human-facing tasks (chat, alert explanation)
- **Ollama (mistral / llama3.2)** handles all technical analysis tasks (threat detection, process analysis, network monitoring)
- **MockProvider** is always the silent fallback — the app never breaks

---

## New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NEW AI ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User Chat / Alert Explain                                 │
│          │                                                  │
│          ▼                                                  │
│   GeminiProvider (gemini-2.0-flash)  ◄── FREE, Cloud       │
│          │  fallback if no API key                          │
│          ▼                                                  │
│   MockProvider  ◄── Always works, no internet needed        │
│                                                             │
│   Threat Analysis / Process / Network AI                    │
│          │                                                  │
│          ▼                                                  │
│   OllamaProvider (mistral / llama3.2) ◄── FREE, Local      │
│          │  fallback if Ollama not running                  │
│          ▼                                                  │
│   MockProvider  ◄── Rule-based detection still works       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Provider Responsibility Matrix

| Task | Provider | Model | Why |
|---|---|---|---|
| **Chat** (conversational Q&A) | Gemini | `gemini-2.0-flash` | Best natural language, free API |
| **Alert Explanation** (human-readable) | Gemini | `gemini-2.0-flash` | Excellent structured prose |
| **Threat Detection AI** (classify behavior) | Ollama | `mistral` | Fast classifier, fully offline |
| **Process Analysis** (anomaly scoring) | Ollama | `llama3.2` | Strong structured data reasoning |
| **Network Monitoring AI** (connection scoring) | Ollama | `mistral` | Pattern reasoning, no cloud needed |
| **Fallback (all tasks)** | Mock | — | Keyword-based, always available |

---

## Files to DELETE (14 files)

| File | Reason |
|---|---|
| `providers/AIProvider.js` | Base class for old provider system |
| `providers/IBMGraniteProvider.js` | IBM watsonx — paid, removing |
| `providers/GeminiProvider.js` | Old implementation — rebuilding fresh |
| `providers/OllamaProvider.js` | Old implementation — rebuilding fresh |
| `providers/MockProvider.js` | Old implementation — rebuilding fresh |
| `core/ai/AIEngine.js` | Old engine — rebuilding fresh |
| `core/ai/SkillManager.js` | Over-engineered, not needed |
| `core/routing/AIRouter.js` | Over-engineered, not needed |
| `core/memory/MemoryManager.js` | Replacing with simple session map |
| `core/memory/ConversationMemory.js` | Replacing with simple array |
| `core/memory/ContextManager.js` | Replacing with direct injection |
| `core/analyzers/ThreatExplainer.js` | Rebuilding as part of new engine |
| `core/prompts/PromptBuilder.js` | Rebuilding prompts inside engine |
| `database/repositories/AIRepository.js` | Removing AI conversation DB table |

---

## Files to MODIFY

| File | What Changes |
|---|---|
| `electron/main.js` | Remove 9 AI imports, AI init block, skill registrations, context updates, 2 IPC handlers |
| `electron/preload.js` | Remove `sendChat` and `explainAlert` bridge methods |
| `electron/renderer/index.html` | Remove chat page section, AI provider dropdown, AI explain button in modal |
| `electron/renderer/renderer.js` | Remove `sendChatMessage()`, `requestAiExplanation()`, session ID, 3 event listeners |
| `electron/renderer/floating.html` | Remove AI chat panel, input, quick commands |
| `electron/renderer/floating.js` | Remove all chat/explain logic |
| `database/schema.js` | Remove `ai_conversations` table, `idx_ai_session` index, `aiProvider` setting |
| `.env.example` | Remove all IBM/Gemini/Ollama AI env vars |
| `tests/ai.test.js` | Delete — tests old AI code |

---

## IPC Channels Being Removed

| Channel | Direction | Purpose |
|---|---|---|
| `send-chat` | renderer → main | Send message to AI chat |
| `explain-alert-ai` | renderer → main | Request alert explanation from AI |

---

## IPC Channels Being Added (New)

| Channel | Direction | Purpose |
|---|---|---|
| `ai-chat` | renderer → main | New chat channel |
| `ai-explain` | renderer → main | New explain channel |
| `ai-analyze-threat` | renderer → main | AI threat analysis (Ollama) |

---

## NPM Packages to Remove

| Package | Reason |
|---|---|
| `@ibm-cloud/watsonx-ai` | IBM SDK — no longer needed |

> **Note:** `axios` stays — it will be used by the new Gemini and Ollama providers.

---

## New Folder Structure After Rebuild

```
providers/
├── GeminiProvider.js     ← NEW (gemini-2.0-flash, REST only)
├── OllamaProvider.js     ← NEW (mistral + llama3.2 support)
└── MockProvider.js       ← NEW (clean keyword fallback)

core/ai/
└── AIEngine.js           ← NEW (dual-provider, simple design)
```

---

## Sub-Tasks

---

### Sub-Task 1 — Strip All Existing AI Code

**Status:** `[ ] pending`

**Intent:**
Remove every trace of the old AI system so the project compiles and runs cleanly with zero AI. The app's threat detection (rule-based) must still work perfectly after this step.

**Expected Outcomes:**
- 14 files deleted
- `electron/main.js` has no AI imports, no AI init, no AI IPC handlers
- `electron/preload.js` has no `sendChat` or `explainAlert`
- `electron/renderer/index.html` has no chat page, no AI explain button
- `electron/renderer/renderer.js` has no `sendChatMessage`, no `requestAiExplanation`
- `database/schema.js` has no `ai_conversations` table
- `@ibm-cloud/watsonx-ai` removed from `package.json`
- `npm start` launches the app with no errors

**Todo List:**
1. Delete all 14 files listed in the "Files to DELETE" table above
2. Remove AI imports from `electron/main.js` (lines 15, 19–26)
3. Remove AI global state declarations from `electron/main.js` (lines 81, 86–87)
4. Remove AI initialization block from `electron/main.js` (lines 113–146)
5. Remove skill registrations from `electron/main.js` (lines 196–200)
6. Remove context update calls from `electron/main.js` (lines 264–268)
7. Remove `send-chat` and `explain-alert-ai` IPC handlers from `electron/main.js`
8. Remove `sendChat` and `explainAlert` from `electron/preload.js`
9. Remove chat page `<section id="chat-page">` from `electron/renderer/index.html`
10. Remove "AI Security Copilot" nav item from `electron/renderer/index.html`
11. Remove AI provider `<select>` from settings in `electron/renderer/index.html`
12. Remove AI explainer box and button from alert modal in `electron/renderer/index.html`
13. Remove `sendChatMessage()` function from `electron/renderer/renderer.js`
14. Remove `requestAiExplanation()` function from `electron/renderer/renderer.js`
15. Remove `sessionChatId` and 3 AI event listeners from `electron/renderer/renderer.js`
16. Remove `aiProvider` from `saveSettings()` in `electron/renderer/renderer.js`
17. Remove AI chat panel from `electron/renderer/floating.html`
18. Remove AI chat logic from `electron/renderer/floating.js`
19. Remove `ai_conversations` table and `idx_ai_session` index from `database/schema.js`
20. Remove `aiProvider` default setting from `database/schema.js`
21. Remove `@ibm-cloud/watsonx-ai` from `package.json` dependencies
22. Delete `tests/ai.test.js`
23. Run `npm install` to sync package-lock
24. Run `npm start` and verify app launches with no errors

**Relevant Context:**
- `electron/main.js` lines 15, 19–26 (imports), 81/86–87 (globals), 113–146 (AI init), 196–200 (skills), 264–268 (context), 420–426 (IPC handlers)
- `electron/preload.js` lines 23–25
- `electron/renderer/index.html` lines 54–56 (nav), 240–256 (chat page), 268–274 (provider dropdown), 311–315 (AI explain box)
- `electron/renderer/renderer.js` lines 9 (sessionId), 98–104 (event listeners), 439–461 (requestAiExplanation), 466–515 (sendChatMessage), 522–523/528 (settings)
- `database/schema.js` lines 73–80 (table), 95 (index), 101 (setting)

---

### Sub-Task 2 — Build New Providers

**Status:** `[ ] pending`

**Intent:**
Create three clean, minimal provider files. No base class needed — just plain classes with a consistent `generate(prompt, options)` interface.

**Expected Outcomes:**
- `providers/GeminiProvider.js` — calls `gemini-2.0-flash` via REST, falls back to mock if no API key
- `providers/OllamaProvider.js` — calls local Ollama API, supports model selection via config, falls back to mock if not running
- `providers/MockProvider.js` — returns security-domain keyword-matched responses, never throws

**Provider Interface (all three must implement):**
```
generate(prompt, options)  → { text, model, provider }
initialize()               → void (logs status)
healthCheck()              → boolean
getProviderInfo()          → { provider, model, ready }
```

**Todo List:**
1. Create `providers/MockProvider.js` — keyword map: explain, recommend, mitre, process, network, threat, default
2. Create `providers/GeminiProvider.js` — model: `gemini-2.0-flash`, REST POST to `generativelanguage.googleapis.com/v1beta`, `_mockResponse()` fallback, reads `GEMINI_API_KEY` from env
3. Create `providers/OllamaProvider.js` — host: `http://localhost:11434`, model: configurable via `OLLAMA_MODEL` env (default: `mistral`), POST to `/api/generate`, `_mockResponse()` fallback
4. Verify all three have identical `generate(prompt, options)` return shape: `{ text, model, provider }`

**Relevant Context:**
- Old `GeminiProvider.js` REST pattern is a good reference (already uses axios)
- Old `OllamaProvider.js` Ollama API call pattern is a good reference
- Keep providers simple — no streaming needed for v1

---

### Sub-Task 3 — Build New AIEngine

**Status:** `[ ] pending`

**Intent:**
Build a clean, simple `AIEngine` with two provider slots. No SkillManager, no AIRouter, no ContextManager class — just direct, readable code.

**Expected Outcomes:**
- `core/ai/AIEngine.js` has `chatProvider` (Gemini) and `analysisProvider` (Ollama)
- `chat(sessionId, message, context)` — uses Gemini, maintains per-session history as a simple Map
- `explain(alert)` — uses Gemini with a structured prompt, caches results
- `analyzeThreats(detections, context)` — uses Ollama to score/classify rule-based detections
- `analyzeProcess(process)` — uses Ollama to flag anomalous process behavior
- `analyzeNetwork(connections)` — uses Ollama to flag suspicious network patterns

**AIEngine Design:**
```
AIEngine
  ├── chatProvider    → GeminiProvider (or MockProvider if no key)
  ├── analysisProvider → OllamaProvider (or MockProvider if not running)
  ├── sessions        → Map<sessionId, Array<{role, content}>>
  ├── explainCache    → Map<cacheKey, explanation>
  │
  ├── chat(sessionId, message, context)
  ├── explain(alert)
  ├── analyzeThreats(detections, context)
  ├── analyzeProcess(process)
  └── analyzeNetwork(connections)
```

**Session Memory Design (simple):**
```
sessions = {
  "session_abc123": [
    { role: "user",      content: "what is this alert?" },
    { role: "assistant", content: "This alert indicates..." }
  ]
}
```
Max 20 messages per session. Trim oldest when limit reached.

**Todo List:**
1. Create `core/ai/AIEngine.js` with constructor accepting `{ chatProvider, analysisProvider }`
2. Implement `initialize()` — calls `initialize()` on both providers
3. Implement `chat(sessionId, message, context)` — builds system prompt with live context (alerts, processes, connections), appends to session history, calls `chatProvider.generate()`, stores reply, returns `{ success, reply, history }`
4. Implement `explain(alert)` — builds structured explanation prompt, checks explainCache first, calls `chatProvider.generate()`, caches and returns explanation
5. Implement `analyzeThreats(detections, context)` — builds analysis prompt with detection list, calls `analysisProvider.generate()`, returns `{ aiScore, aiSummary, recommendations }`
6. Implement `analyzeProcess(process)` — builds process anomaly prompt, calls `analysisProvider.generate()`, returns risk assessment
7. Implement `analyzeNetwork(connections)` — builds connection analysis prompt, calls `analysisProvider.generate()`, returns suspicious connection flags

**Relevant Context:**
- Old `AIEngine.js` chat system prompt (lines 100–138) is a good reference for prompt structure
- Old `PromptBuilder.js` templates are good references for explain/threat/network prompts
- Keep all prompts inline in AIEngine — no separate PromptBuilder class needed

---

### Sub-Task 4 — Wire Chat UI

**Status:** `[ ] pending`

**Intent:**
Rebuild the chat page UI and connect it to the new `AIEngine.chat()` via two new IPC channels. The UI should be clean: user bubble, assistant bubble, typing indicator, auto-scroll.

**Expected Outcomes:**
- Chat page is visible in the sidebar and functional
- Sending a message calls `AIEngine.chat()` via IPC
- Alert "Explain" button calls `AIEngine.explain()` via IPC
- Settings page shows `Gemini` and `Offline (Mock)` as the only provider options
- No IBM or Ollama options shown to the user in settings (Ollama is internal/automatic)

**IPC Channels to Add:**

| Channel | Payload | Returns |
|---|---|---|
| `ai-chat` | `{ sessionId, message }` | `{ success, reply }` |
| `ai-explain` | `alert object` | `{ success, explanation }` |

**Todo List:**
1. Add chat page `<section id="chat-page">` back to `electron/renderer/index.html` with new clean markup
2. Add "AI Copilot" nav item back to sidebar in `electron/renderer/index.html`
3. Add AI explain box and button back to alert modal in `electron/renderer/index.html`
4. Update settings provider dropdown to only show: `Gemini (Cloud)` and `Offline Mode`
5. Add `sendChat` and `explainAlert` back to `electron/preload.js` pointing to new IPC channels (`ai-chat`, `ai-explain`)
6. Add `ipcMain.handle("ai-chat", ...)` to `electron/main.js` calling `aiEngine.chat()`
7. Add `ipcMain.handle("ai-explain", ...)` to `electron/main.js` calling `aiEngine.explain()`
8. Add `sendChatMessage()` function to `electron/renderer/renderer.js`
9. Add `requestAiExplanation()` function to `electron/renderer/renderer.js`
10. Add event listeners for chat send button and Enter key
11. Pass current context (alerts, processes, connections) into the `ai-chat` IPC call so AIEngine has live data
12. Test: type a message → response appears; click explain on alert → explanation appears

**Relevant Context:**
- Old `renderer.js` `sendChatMessage()` (lines 466–515) is a good reference for the UI bubble logic
- Old `renderer.js` `requestAiExplanation()` (lines 439–461) is a good reference for the explain flow
- Context to pass: grab current alerts/processes/connections from existing IPC calls already in renderer

---

### Sub-Task 5 — Wire AI Into Threat / Process / Network Analysis

**Status:** `[ ] pending`

**Intent:**
Inject Ollama-backed AI calls into the three main analysis pipelines. AI augments but does NOT replace the rule-based detection — rules still fire first, AI adds a scoring layer on top.

**Expected Outcomes:**
- After rule-based detection runs, `AIEngine.analyzeThreats()` adds an `aiScore` and `aiSummary` to the result
- `SystemAnalyzer` optionally calls `AIEngine.analyzeProcess()` on flagged processes
- `NetworkAnalyzer` optionally calls `AIEngine.analyzeNetwork()` on flagged connections
- If Ollama is not running, analysis works exactly as before (mock returns neutral score)
- New IPC channel `ai-analyze-threat` available for manual trigger from UI

**Integration Points:**

| Analyzer | File | Where AI is injected |
|---|---|---|
| Threat results | `electron/main.js` (runtime loop) | After `threatEngine.analyze()`, pass detections to `aiEngine.analyzeThreats()` |
| Process analysis | `modules/system/analyzer.js` | After rule analysis, pass flagged processes to `aiEngine.analyzeProcess()` |
| Network analysis | `modules/network/analyzer.js` | After rule analysis, pass flagged connections to `aiEngine.analyzeNetwork()` |

**Todo List:**
1. Import `AIEngine` into `modules/system/analyzer.js` — make it optional (pass via constructor, default null)
2. In `SystemAnalyzer.analyze()` — after rules run, if `this.aiEngine` is set and detections exist, call `aiEngine.analyzeProcess()` on the top flagged processes
3. Import `AIEngine` into `modules/network/analyzer.js` — make it optional
4. In `NetworkAnalyzer.analyze()` — after rules run, if `this.aiEngine` is set and detections exist, call `aiEngine.analyzeNetwork()` on flagged connections
5. In `electron/main.js` runtime loop — after all threat engines run, call `aiEngine.analyzeThreats(allDetections, context)` and attach `aiScore` and `aiSummary` to the alert batch
6. Add `ipcMain.handle("ai-analyze-threat", ...)` for manual UI trigger
7. Pass `aiEngine` into `SystemAnalyzer` and `NetworkAnalyzer` constructors in `main.js`
8. Test: with Ollama running, check that alerts include `aiScore`; without Ollama, verify app still works

**Relevant Context:**
- `modules/system/analyzer.js` — simple class, constructor takes `threatEngine` and `alertManager`
- `modules/network/analyzer.js` — same pattern
- `electron/main.js` runtime loop starts around line 200 — where collectors are called on schedule

---

## Environment Configuration After Rebuild

```
# FlotBot - AI Configuration

# Gemini (Chat + Alert Explain) — get free key at https://aistudio.google.com/
GEMINI_API_KEY=your-gemini-api-key-here

# Ollama (Threat/Process/Network Analysis) — free, runs locally
# Install from https://ollama.com then run: ollama pull mistral
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral

# Monitoring
SCAN_INTERVAL=5000
DEBUG=true
```

---

## Final Package Dependencies (After Cleanup)

| Package | Kept? | Reason |
|---|---|---|
| `electron` | ✅ | Core desktop shell |
| `sqlite3` | ✅ | Local database |
| `axios` | ✅ | Used by GeminiProvider + OllamaProvider |
| `dotenv` | ✅ | Environment config |
| `express` | ✅ | Routing support |
| `ws` | ✅ | WebSocket support |
| `jest` | ✅ | Testing |
| `nodemon` | ✅ | Dev auto-reload |
| `@ibm-cloud/watsonx-ai` | ❌ | **REMOVED** — IBM SDK no longer needed |

---

## Risk & Rollback

| Risk | Mitigation |
|---|---|
| App breaks after stripping AI | Rule-based threat detection works independently — no AI dependency |
| Gemini API key not available | `GeminiProvider._mockResponse()` always returns a safe fallback |
| Ollama not installed | `OllamaProvider._mockResponse()` returns neutral analysis, rules still fire |
| Ollama too slow on user machine | All Ollama calls are async and non-blocking — UI never freezes |
| Chat UI regression | Sub-Task 4 rebuilds it cleanly from scratch |
