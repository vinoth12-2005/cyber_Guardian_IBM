const { contextBridge, ipcRenderer } = require("electron");

/**
 * FlotBot Preload Bridge  ─  Secure IPC API exposed to renderer
 * ─────────────────────────────────────────────────────────────
 * New in this version:
 *   • sendChat accepts streamTarget for streaming token routing
 *   • onAIToken  — subscribe to streaming tokens (word-by-word)
 *   • getAIStatus — returns provider info + recent latency stats
 */
contextBridge.exposeInMainWorld("flotbot", {

    // ── Alerts & Whitelist ────────────────────────────────────────────────────
    getAlerts:       ()           => ipcRenderer.invoke("get-alerts"),
    getUnackAlerts:  ()           => ipcRenderer.invoke("get-unack-alerts"),
    ackAlert:        (id)         => ipcRenderer.invoke("ack-alert", id),
    ackAllAlerts:    ()           => ipcRenderer.invoke("ack-all-alerts"),
    markAsSafe:      (data)       => ipcRenderer.invoke("mark-as-safe", data),
    getWhitelist:    ()           => ipcRenderer.invoke("get-whitelist"),
    removeWhitelist: (id)         => ipcRenderer.invoke("remove-whitelist", id),

    // ── System & Network ──────────────────────────────────────────────────────
    getRecentProcesses:   ()      => ipcRenderer.invoke("get-recent-processes"),
    getOpenWindows:       ()      => ipcRenderer.invoke("get-open-windows"),
    getNetworkConnections:()      => ipcRenderer.invoke("get-network-connections"),
    getRegistryState:     ()      => ipcRenderer.invoke("get-registry-state"),
    getStats:             ()      => ipcRenderer.invoke("get-stats"),
    getSettings:          ()      => ipcRenderer.invoke("get-settings"),
    updateSettings:       (s)     => ipcRenderer.invoke("update-settings", s),

    // ── AI API (with streaming support) ──────────────────────────────────────

    /**
     * Send a chat message.
     * The main process will push ai-token events to this window during generation.
     * Subscribe via window.flotbot.onAIToken(cb) before calling sendChat.
     *
     * @param {string} sessionId
     * @param {string} message
     * @param {object} context
     * @param {string} [streamTarget]  'floating' | 'main' (default: auto-detect from sender)
     */
    sendChat: (sessionId, message, context, streamTarget = "floating") =>
        ipcRenderer.invoke("ai-chat", { sessionId, message, context, streamTarget }),

    explainAlert:  (alert)                => ipcRenderer.invoke("ai-explain", alert),
    analyzeThreat: (detections, context)  => ipcRenderer.invoke("ai-analyze-threat", { detections, context }),
    getAIStatus:   ()                     => ipcRenderer.invoke("ai-status"),

    // ── Streaming token receiver ──────────────────────────────────────────────
    /**
     * Subscribe to streaming AI tokens.
     * The callback is called once per token chunk as the AI generates text.
     * Returns an unsubscribe function.
     *
     * Usage:
     *   const unsub = window.flotbot.onAIToken(token => appendToken(token));
     *   // later: unsub();
     */
    onAIToken: (callback) => {
        const listener = (event, token) => callback(token);
        ipcRenderer.on("ai-token", listener);
        return () => ipcRenderer.removeListener("ai-token", listener);
    },

    // ── Alert History Telemetry ───────────────────────────────────────────────
    logAlertAction: (record) => ipcRenderer.invoke("log-alert-action", record),

    // ── Real-time Events ──────────────────────────────────────────────────────
    onAlert:    (callback) => ipcRenderer.on("realtime-alert", (event, data) => callback(data)),
    onNavigate: (callback) => ipcRenderer.on("navigate",      (event, page) => callback(page)),

    // ── Custom Titlebar ───────────────────────────────────────────────────────
    minimize:            () => ipcRenderer.send("win-minimize"),
    maximize:            () => ipcRenderer.send("win-maximize"),
    close:               () => ipcRenderer.send("win-close"),

    // ── Floating Window Controls ──────────────────────────────────────────────
    resizeFloating:      (state)         => ipcRenderer.send("resize-floating-window", state),
    dragFloating:        (pos)           => ipcRenderer.send("drag-floating-window", pos),
    startDragFloating:   (offset)        => ipcRenderer.send("drag-start-floating", offset),
    stopDragFloating:    ()              => ipcRenderer.send("drag-end-floating"),
    blockProcess:        (pid)           => ipcRenderer.invoke("block-process", pid),
    blockIp:             (ip)            => ipcRenderer.invoke("block-ip", ip),
    setIgnoreMouseEvents:(ignore, opts)  => ipcRenderer.send("set-ignore-mouse-events", ignore, opts),

    // ── Security & Inspection API ─────────────────────────────────────────────
    analyzeUrl:         (url)           => ipcRenderer.invoke("analyze-url", url),
    captureScreen:      ()              => ipcRenderer.invoke("capture-screen"),
    analyzeScreen:      (params)        => ipcRenderer.invoke("analyze-screen", params),
    auditThreads:       (targetPid)     => ipcRenderer.invoke("audit-threads", targetPid),
    inspectMalwareFile: (filePath)      => ipcRenderer.invoke("inspect-malware-file", filePath),
    analyzeFileThreat:  (filePath, opts)=> ipcRenderer.invoke("analyze-file-threat", { filePath, contextOptions: opts }),
    fastScanFile:       (filePath)      => ipcRenderer.invoke("fast-scan-file", filePath),
    pickAndScanFile:    ()              => ipcRenderer.invoke("pick-and-scan-file"),
    executeAction:      (params)        => ipcRenderer.invoke("execute-action", params),
    listQuarantine:     ()              => ipcRenderer.invoke("list-quarantine"),
    restoreQuarantine:  (id)            => ipcRenderer.invoke("restore-quarantine", id),
    deleteQuarantine:   (id)            => ipcRenderer.invoke("delete-quarantine", id),
    deepScanSystem:     ()              => ipcRenderer.invoke("deep-scan-system"),

    // ── Ultra-Fast Timeline & Replay API ──────────────────────────────────────
    buildTimeline:      (params)        => ipcRenderer.invoke("build-timeline", params),
    initReplay:         (params)        => ipcRenderer.invoke("init-replay", params),
    replaySeek:         (stepIndex)     => ipcRenderer.invoke("replay-seek", stepIndex),
    replaySeekTime:     (targetTime)    => ipcRenderer.invoke("replay-seek-time", targetTime),
    replaySeekPercent:  (percent)       => ipcRenderer.invoke("replay-seek-percent", percent),
    replayNext:         (count)         => ipcRenderer.invoke("replay-next", count),
    replayPrevious:     (count)         => ipcRenderer.invoke("replay-previous", count),
    replayGetWindow:    (params)        => ipcRenderer.invoke("replay-get-window", params),
    replaySetSpeed:     (speed)         => ipcRenderer.invoke("replay-set-speed", speed),

    // ── AI Engine Controls ───────────────────────────────────────────────────
    setAIMode:    (opts)                  => ipcRenderer.invoke("set-ai-mode", opts),
    getAIMode:    ()                      => ipcRenderer.invoke("get-ai-mode"),
    listAIModels: ()                      => ipcRenderer.invoke("list-ai-models"),
    setAIModel:   (providerType, model)   => ipcRenderer.invoke("set-ai-model", { providerType, modelName: model }),

    // ── Admin Console ─────────────────────────────────────────────────────────
    openAdminConsole: () => ipcRenderer.send("open-admin-console"),
});

// Expose electronAPI for CyberGuardian AI React Dashboard
contextBridge.exposeInMainWorld("electronAPI", {
    toggleFlotBot:          (enable)    => ipcRenderer.send("toggle-flotbot", enable),
    getFlotBotStatus:       ()          => ipcRenderer.invoke("get-flotbot-status"),
    onFlotBotStatusChanged: (callback)  => ipcRenderer.on("flotbot-status-changed", (event, s) => callback(s)),
    triggerAlert:           (alertData) => ipcRenderer.send("trigger-flotbot-alert", alertData),
    onNewAlert:             (callback)  => ipcRenderer.on("realtime-alert", (event, a) => callback(a)),
    flotbotChat:            (sessionId, message, context) =>
        ipcRenderer.invoke("flotbot-chat", { sessionId, message, context }),
});
