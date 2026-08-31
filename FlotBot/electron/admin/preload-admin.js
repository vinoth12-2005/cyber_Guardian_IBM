const { contextBridge, ipcRenderer } = require("electron");

/**
 * preload-admin.js
 * Isolated IPC bridge for the Admin Console BrowserWindow.
 * Exposes ONLY admin-specific channels — user channels are NOT available here.
 */
contextBridge.exposeInMainWorld("flotbotAdmin", {

    // ── AI Privacy Mode ──────────────────────────────────────────────────────
    setAiMode:       (privacyMode)  => ipcRenderer.invoke("set-ai-mode", { privacyMode }),
    getSettings:     ()             => ipcRenderer.invoke("get-settings"),

    // ── Baseline / Learning Mode ─────────────────────────────────────────────
    getBaselineRecords:  ()         => ipcRenderer.invoke("get-baseline-records"),
    approveBaseline:     (id)       => ipcRenderer.invoke("approve-baseline", { id }),
    rejectBaseline:      (id)       => ipcRenderer.invoke("reject-baseline", { id }),
    resetLearningMode:   ()         => ipcRenderer.invoke("reset-learning-mode"),

    // ── Alert History ────────────────────────────────────────────────────────
    getAlertHistory:     ()         => ipcRenderer.invoke("get-alert-history"),

    // ── Whitelist / Blocklist Controls ───────────────────────────────────────
    getWhitelist:        ()         => ipcRenderer.invoke("get-whitelist"),
    addWhitelist:        (record)   => ipcRenderer.invoke("add-whitelist", record),
    removeWhitelist:     (id)       => ipcRenderer.invoke("remove-whitelist", id),
    blockIpGlobal:       (ip, note) => ipcRenderer.invoke("block-ip-global", { ip, note }),
    getBlockedIps:       ()         => ipcRenderer.invoke("get-blocked-ips"),
    removeBlockedIp:     (id)       => ipcRenderer.invoke("remove-blocked-ip", id),

    // ── Endpoint Network Isolation ───────────────────────────────────────────
    isolateEndpoint:     (enable)   => ipcRenderer.invoke("isolate-endpoint", { enable }),

    // ── Threat Replay & Incident Forensics ──────────────────────────────────
    buildTimeline:       (params)       => ipcRenderer.invoke("build-timeline", params),
    initReplay:          (params)       => ipcRenderer.invoke("init-replay", params),
    replaySeek:          (stepIndex)    => ipcRenderer.invoke("replay-seek", stepIndex),
    replaySeekPercent:   (percent)      => ipcRenderer.invoke("replay-seek-percent", percent),
    replayNext:          (count)        => ipcRenderer.invoke("replay-next", count),
    replayPrevious:      (count)        => ipcRenderer.invoke("replay-previous", count),
    replayGetWindow:     (params)       => ipcRenderer.invoke("replay-get-window", params),
    replaySetSpeed:      (speed)        => ipcRenderer.invoke("replay-set-speed", speed),
    analyzeFileThreat:   (filePath, opts)=> ipcRenderer.invoke("analyze-file-threat", { filePath, contextOptions: opts }),
    pickAndScanFile:     ()             => ipcRenderer.invoke("pick-and-scan-file"),

    // ── Stats (for header display) ───────────────────────────────────────────
    getStats:            ()         => ipcRenderer.invoke("get-stats"),
    getAlerts:           ()         => ipcRenderer.invoke("get-alerts"),

});
