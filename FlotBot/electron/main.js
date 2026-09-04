const { app, BrowserWindow, ipcMain, Menu, Tray, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// FlotBot Core Imports
const Database = require("../database/Database");
const { initSchema } = require("../database/schema");
const AlertRepository = require("../database/repositories/AlertRepository");
const ProcessRepository = require("../database/repositories/ProcessRepository");
const NetworkRepository = require("../database/repositories/NetworkRepository");
const WhitelistRepository = require("../database/repositories/WhitelistRepository");
const BaselineRepository = require("../database/repositories/BaselineRepository");
const BaselineRecorder = require("../modules/malware/BaselineRecorder");
const Runtime = require("../core/Runtime");
const AlertManager = require("../core/alerts/AlertManager");
const AIEngine = require("../core/ai/AIEngine");
const GeminiProvider = require("../providers/GeminiProvider");
const OllamaProvider = require("../providers/OllamaProvider");
const MockProvider = require("../providers/MockProvider");
const SystemTelemetry = require("../core/system/telemetry");

// FlotBot Monitoring Imports
const SystemCollector = require("../modules/system/collector");
const SystemWatcher = require("../modules/system/watcher");
const SystemSkill = require("../modules/system/skill");
const PowerShellRule = require("../modules/system/rules/PowerShellRule");
const CmdRule = require("../modules/system/rules/CmdRule");
const WmicRule = require("../modules/system/rules/WmicRule");
const Rundll32Rule = require("../modules/system/rules/Rundll32Rule");
const MshtaRule = require("../modules/system/rules/MshtaRule");
const Regsvr32Rule = require("../modules/system/rules/Regsvr32Rule");
const SuspiciousPathRule = require("../modules/system/rules/SuspiciousPathRule");
const ParentChildRule = require("../modules/system/rules/ParentChildRule");
const HighCpuRule = require("../modules/system/rules/HighCpuRule");

const NetworkCollector = require("../modules/network/collector");
const NetworkWatcher = require("../modules/network/watcher");
const NetworkSkill = require("../modules/network/skill");
const ReverseShellRule = require("../modules/network/rules/ReverseShellRule");
const BeaconRule = require("../modules/network/rules/BeaconRule");
const SuspiciousOutboundRule = require("../modules/network/rules/SuspiciousOutboundRule");
const PortScanRule = require("../modules/network/rules/PortScanRule");
const DnsRule = require("../modules/network/rules/DnsRule");

const RegistryCollector = require("../modules/registry/collector");
const RegistryWatcher = require("../modules/registry/watcher");
const RegistrySkill = require("../modules/registry/skill");
const RunKeyRule = require("../modules/registry/rules/RunKeyRule");
const ServiceRule = require("../modules/registry/rules/ServiceRule");
const PersistenceRule = require("../modules/registry/rules/PersistenceRule");

const FileCollector = require("../modules/file/collector");
const FileWatcher = require("../modules/file/watcher");
const FileSkill = require("../modules/file/skill");
const ExecutableDropRule = require("../modules/file/rules/ExecutableDropRule");
const SuspiciousExtensionRule = require("../modules/file/rules/SuspiciousExtensionRule");
const MassModificationRule = require("../modules/file/rules/MassModificationRule");

const MalwareAnalyzer = require("../modules/malware/analyzer");

const EventBus = require("../core/events/EventBus");

// Global states
let mainWindow;
let floatingWindow;
let adminWindow;   // Admin Console — second BrowserWindow
let tray;
let isQuitting = false;
let floatingAnchorX = "right";
let floatingAnchorY = "bottom";

let db;
let alertRepo;
let processRepo;
let networkRepo;
let whitelistRepo;

let runtime;
let eventBus;
let alertManager;
let aiEngine;

// AI debounce — only run analyzeThreats when alert state changes
let _lastAlertCount = -1;
let _lastAlertId = null;

// Skills
let systemSkill;
let networkSkill;
let registrySkill;
let fileSkill;
let malwareAnalyzer;
let baselineRepo;
let baselineRecorder;

/**
 * Initialize backend database and managers.
 */
async function initBackend() {

    // 1. Initialize SQLite Database
    const dbPath = path.join(app.getPath("userData"), "flotbot.db");
    db = new Database(dbPath);
    await db.connect();
    await initSchema(db);

    // 2. Initialize Repositories
    alertRepo = new AlertRepository(db);
    processRepo = new ProcessRepository(db);
    networkRepo = new NetworkRepository(db);
    whitelistRepo = new WhitelistRepository(db);
    baselineRepo = new BaselineRepository(db);
    await whitelistRepo.init();

    // 2b. Initialize Learning Mode Baseline Recorder
    const learningHours = parseInt(process.env.LEARNING_MODE_HOURS || "24", 10);
    baselineRecorder = new BaselineRecorder(db, baselineRepo, learningHours);
    await baselineRecorder.init();

    // 3. Initialize Core AI Engine (dual-provider: Gemini for chat, Ollama for analysis)
    eventBus = new EventBus();
    alertManager = new AlertManager(alertRepo, {
        notificationsEnabled: true,
        soundEnabled: true
    });

    // Read AI privacy mode from settings DB (overrides env var if set by admin)
    const privacySetting = await db.get(`SELECT value FROM settings WHERE key = 'aiPrivacyMode'`);
    const privacyModeActive =
        (privacySetting && privacySetting.value === "true") ||
        (process.env.AI_PRIVACY_MODE === "true");

    // Analysis provider: Ollama (local) — high performance local AI
    const ollamaProvider = new OllamaProvider({
        host:  process.env.OLLAMA_HOST  || "http://127.0.0.1:11434",
        model: process.env.OLLAMA_MODEL || "qwen2.5:0.5b"
    });

    // Cloud Chat Provider: Google Gemini
    const geminiProvider = new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash"
    });

    // Read stored AI mode (defaults to "auto" hybrid mode)
    const modeSetting = await db.get(`SELECT value FROM settings WHERE key = 'aiMode'`);
    let initialMode = modeSetting?.value || (privacyModeActive ? "offline" : "auto");

    console.log(`[AI] Initializing Dual-Engine AI (Mode: ${initialMode.toUpperCase()})`);
    aiEngine = new AIEngine({
        chatProvider: geminiProvider,
        analysisProvider: ollamaProvider,
        mode: initialMode
    });
    await aiEngine.initialize();

    // 3b. Start secure 127.0.0.1 Localhost REST API server for Browser Extension
    const LocalhostApiServer = require("../modules/browser/LocalhostApiServer");
    const localhostApi = new LocalhostApiServer(41738, aiEngine);
    localhostApi.start();

    // 4. Set up Monitoring modules
    // System
    const sysCollector = new SystemCollector();
    const sysWatcher = new SystemWatcher(sysCollector, eventBus);
    const sysThreatEngine = new (require("../core/threats/ThreatEngine"))();
    sysThreatEngine.registerRule(new PowerShellRule());
    sysThreatEngine.registerRule(new CmdRule());
    sysThreatEngine.registerRule(new WmicRule());
    sysThreatEngine.registerRule(new Rundll32Rule());
    sysThreatEngine.registerRule(new MshtaRule());
    sysThreatEngine.registerRule(new Regsvr32Rule());
    sysThreatEngine.registerRule(new SuspiciousPathRule());
    sysThreatEngine.registerRule(new ParentChildRule());
    sysThreatEngine.registerRule(new HighCpuRule());
    systemSkill = new SystemSkill(sysCollector, sysThreatEngine, alertManager);

    // Network
    const netCollector = new NetworkCollector();
    const netWatcher = new NetworkWatcher(netCollector, eventBus);
    const netThreatEngine = new (require("../core/threats/ThreatEngine"))();
    netThreatEngine.registerRule(new ReverseShellRule());
    netThreatEngine.registerRule(new BeaconRule());
    netThreatEngine.registerRule(new SuspiciousOutboundRule());
    netThreatEngine.registerRule(new PortScanRule());
    netThreatEngine.registerRule(new DnsRule());
    networkSkill = new NetworkSkill(netCollector, netThreatEngine, alertManager);

    // Registry
    const regCollector = new RegistryCollector();
    const regWatcher = new RegistryWatcher(regCollector, eventBus);
    const regThreatEngine = new (require("../core/threats/ThreatEngine"))();
    regThreatEngine.registerRule(new RunKeyRule());
    regThreatEngine.registerRule(new ServiceRule());
    regThreatEngine.registerRule(new PersistenceRule());
    registrySkill = new RegistrySkill(regWatcher, regThreatEngine, alertManager);

    // File
    const fileCollector = new FileCollector();
    const fileWatcher = new FileWatcher(fileCollector, eventBus);
    const fileThreatEngine = new (require("../core/threats/ThreatEngine"))();
    fileThreatEngine.registerRule(new ExecutableDropRule());
    fileThreatEngine.registerRule(new SuspiciousExtensionRule());
    fileThreatEngine.registerRule(new MassModificationRule());
    fileSkill = new FileSkill(fileWatcher, fileThreatEngine, alertManager);

    // Malware Analyzer (Behavior correlation)
    malwareAnalyzer = new MalwareAnalyzer(null, baselineRecorder, baselineRepo);

    // (Skills registered for internal use — AI analysis added below in runtime loop)

    // Let the AlertManager broadcast alerts to UI in real-time
    alertManager.onAlert((alert) => {
        if (mainWindow) {
            mainWindow.webContents.send("realtime-alert", alert);
        }
        if (floatingWindow) {
            floatingWindow.webContents.send("realtime-alert", alert);
        }
    });

    // 5. Initialize Runtime Scheduler
    runtime = new Runtime();
    await runtime.start(async () => {
        try {
            // Run each scanning step asynchronously
            const sysResult = await sysWatcher.scan(); // triggers EventTypes.PROCESS_CREATED/TERMINATED
            const processes = Array.from(sysWatcher.previous.values());

            const netResult = await netWatcher.scan(); // triggers established connections
            const connections = netResult ? netResult.connections : [];
            const dnsCache = netResult ? netResult.dnsCache : [];

            const regResult = await regWatcher.scan();
            const registryChanges = regResult ? regResult.changes : [];
            const runKeys = regResult ? regResult.runKeys : [];
            const services = regResult ? regResult.services : [];

            const fileResult = await fileWatcher.scan();
            const fileEvents = fileResult ? fileResult.events : [];
            // Execute threat modules (rule engines)
            const sysDetections = await sysThreatEngine.analyze(processes);
            const netDetections = await netThreatEngine.analyze({ connections, dnsCache });
            const regDetections = await regThreatEngine.analyze({ runKeys, services, changes: registryChanges });
            const fileDetections = await fileThreatEngine.analyze({ events: fileEvents });

            // Add new detections to AlertManager
            const AlertClass = require("../core/alerts/Alert");
            const SeverityClass = require("../core/alerts/Severity");
            const CategoryClass = require("../core/alerts/AlertCategory");

            for (const d of [...sysDetections, ...netDetections, ...regDetections, ...fileDetections]) {
                const evidencePid = d.pid || d.evidence?.pid || null;
                const evidencePath = d.evidence?.filePath || null;

                // Check if process, file path, rule, or IP has been marked as safe (whitelisted)
                if (
                    (d.process && whitelistRepo.isWhitelisted(d.process)) ||
                    (evidencePath && whitelistRepo.isWhitelisted(evidencePath)) ||
                    (d.evidence?.remoteAddress && whitelistRepo.isWhitelisted(d.evidence.remoteAddress)) ||
                    whitelistRepo.isWhitelisted(d.rule)
                ) {
                    continue;
                }

                // Check if an alert for this rule and entity already exists (prevents flooding every 5s)
                const isDuplicate = alertManager.getAll().some(a =>
                    a.title === d.rule &&
                    (
                        (evidencePid && a.evidence?.pid === evidencePid) ||
                        (evidencePath && a.evidence?.filePath === evidencePath) ||
                        a.description === d.reason
                    )
                );

                if (isDuplicate) continue;

                const sev = SeverityClass[d.severity] || SeverityClass.HIGH;

                let cat = CategoryClass.SYSTEM;          // default safe fallback (NOT NULL safe)
                if (sysDetections.includes(d)) cat = CategoryClass.EXECUTION;
                if (netDetections.includes(d)) cat = CategoryClass.NETWORK;
                if (regDetections.includes(d)) cat = CategoryClass.PERSISTENCE;
                if (fileDetections.includes(d)) cat = CategoryClass.FILESYSTEM;

                const alertObj = new AlertClass({
                    title: d.rule,
                    severity: sev,
                    category: cat,
                    source: "Rule Engine",
                    description: d.reason,
                    recommendation: d.recommendation || "Investigate immediately.",
                    evidence: d.evidence || { pid: d.pid || "N/A" },
                    mitre: d.mitre || []
                });

                await alertManager.add(alertObj);
            }

            const activeAlerts = alertManager.getAll();

            // Run cross-module malware correlation analysis
            const correlationContext = {
                processes,
                connections,
                registryChanges,
                fileEvents,
                alerts: activeAlerts
            };

            const malwareResult = await malwareAnalyzer.analyze(correlationContext);

            // If correlation findings exist, turn them into Alerts
            for (const threat of malwareResult.threats) {
                const AlertClass = require("../core/alerts/Alert");
                const SeverityClass = require("../core/alerts/Severity");
                const CategoryClass = require("../core/alerts/AlertCategory");

                await alertManager.add(new AlertClass({
                    title: threat.pattern,
                    severity: SeverityClass[threat.severity] || SeverityClass.HIGH,
                    category: CategoryClass.MALWARE,
                    source: "Malware Analyzer",
                    description: threat.reason,
                    recommendation: "Investigate this behavioral pattern immediately.",
                    evidence: threat.evidence,
                    mitre: threat.mitre
                }));
            }

            // AI threat analysis (Ollama) — augments rule-based detection, non-blocking
            // DEBOUNCE: Only fire if alert count or latest alert ID changed since last cycle.
            const activeAlerts2 = alertManager.getAll();
            const latestId = activeAlerts2.length > 0 ? activeAlerts2[activeAlerts2.length - 1].id : null;
            if (activeAlerts2.length > 0 && aiEngine &&
                (activeAlerts2.length !== _lastAlertCount || latestId !== _lastAlertId)) {
                _lastAlertCount = activeAlerts2.length;
                _lastAlertId = latestId;
                aiEngine.analyzeThreats(activeAlerts2, { processes, connections }).catch(() => { });
            }

            // Persist logs periodically in background
            if (processes.length > 0) {
                // Batch log recent processes to DB to avoid writing thousands of idle processes continuously
                // Only write a subset or those that have changes
                const newCreatedEvents = sysWatcher.eventBus ? [] : []; // watcher handles creation events
            }

        } catch (err) {
            console.error("[Backend Scheduler] Loop Error:", err.message);
        }
    });

}

/**
 * Setup Window and Electron Application UI.
 */
function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        title: "CyberGuardian AI — Security Operations Console",
        frame: true, // Native window frame with Close, Minimize, Maximize controls
        autoHideMenuBar: true,
        show: false,  // Standard Electron best practice: hide initially
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.setMenuBarVisibility(false);

    const rootDist = path.resolve(__dirname, "../../dist/index.html");
    const localDist = path.resolve(__dirname, "../dist/index.html");
    const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";

    if (process.env.VITE_DEV === "true") {
        mainWindow.loadURL(devUrl);
    } else if (fs.existsSync(rootDist)) {
        mainWindow.loadFile(rootDist);
    } else if (fs.existsSync(localDist)) {
        mainWindow.loadFile(localDist);
    } else {
        mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
    }

    // Automatically retry connecting if Vite server is still initializing
    mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
        if (process.env.VITE_DEV === "true") {
            setTimeout(() => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.loadURL(devUrl);
                }
            }, 1000);
        }
    });

    // Show window once it is fully loaded and ready
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Clean exit when main window is closed by user
    mainWindow.on("close", (e) => {
        isQuitting = true;
        app.quit();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

}

// React CyberGuardian AI compatibility handlers
ipcMain.handle("get-flotbot-status", () => {
    return !!(floatingWindow && !floatingWindow.isDestroyed() && floatingWindow.isVisible());
});

ipcMain.on("toggle-flotbot", (event, enable) => {
    if (enable) {
        if (!floatingWindow || floatingWindow.isDestroyed()) createFloatingWindow();
        else floatingWindow.show();
    } else {
        if (floatingWindow && !floatingWindow.isDestroyed()) floatingWindow.hide();
    }
});

ipcMain.on("trigger-flotbot-alert", (event, alertData) => {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
        floatingWindow.webContents.send("realtime-alert", alertData);
    }
});

ipcMain.handle("flotbot-chat", async (event, { sessionId, message, context }) => {
    if (aiEngine) {
        try {
            return await aiEngine.chat(sessionId || "flotbot-react-session", message, context || {});
        } catch (e) {
            return { reply: "FlotBot AI scanner is actively monitoring system processes and endpoints." };
        }
    }
    return { reply: "FlotBot AI engine initialized." };
});

/**
 * Setup Custom System Tray menu.
 */
/**
 * Create the Admin Console BrowserWindow.
 * Only one instance allowed — focuses existing if already open.
 * Uses an isolated preload-admin.js bridge exposing only admin IPC channels.
 */
function createAdminWindow() {
    if (adminWindow && !adminWindow.isDestroyed()) {
        adminWindow.focus();
        return;
    }

    adminWindow = new BrowserWindow({
        width: 900,
        height: 650,
        minWidth: 700,
        minHeight: 500,
        title: "FlotBot — Admin Console",
        resizable: true,
        frame: true,
        backgroundColor: "#0d1117",
        webPreferences: {
            preload: path.join(__dirname, "admin", "preload-admin.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    adminWindow.loadFile(path.join(__dirname, "admin", "admin.html"));
    adminWindow.setMenuBarVisibility(false);

    adminWindow.on("closed", () => {
        adminWindow = null;
    });
}

function createTray() {

    const iconPath = path.join(__dirname, "assets/icon.png");

    // Check if icon exists, fallback to standard shield icon if not
    let iconExist = fs.existsSync(iconPath);
    tray = new Tray(iconExist ? iconPath : path.join(__dirname, "assets/fallback_icon.png"));

    const contextMenu = Menu.buildFromTemplate([
        { label: "Show FlotBot Dashboard", click: () => mainWindow.show() },
        { label: "Show/Restore Chat Widget", click: () => { if (floatingWindow) { floatingWindow.show(); } } },
        { label: "Open Admin Console", click: () => createAdminWindow() },
        { type: "separator" },
        {
            label: "Settings", click: () => {
                mainWindow.show();
                mainWindow.webContents.send("navigate", "settings");
            }
        },
        { type: "separator" },
        {
            label: "Quit", click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip("FlotBot Security Monitoring");
    tray.setContextMenu(contextMenu);

    tray.on("double-click", () => {
        mainWindow.show();
    });

}

// Electron Lifecycle handlers
app.whenReady().then(async () => {

    // Write placeholder icons if they don't exist
    const assetsDir = path.join(__dirname, "assets");
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    const placeholderPng = Buffer.alloc(100); // blank buffer, standard OS handles missing icons elegantly
    if (!fs.existsSync(path.join(assetsDir, "icon.png"))) {
        fs.writeFileSync(path.join(assetsDir, "icon.png"), placeholderPng);
    }
    if (!fs.existsSync(path.join(assetsDir, "fallback_icon.png"))) {
        fs.writeFileSync(path.join(assetsDir, "fallback_icon.png"), placeholderPng);
    }

    // Initialize Database and Scanner loop
    await initBackend();

    createWindow();
    createFloatingWindow();
    createTray();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
            createFloatingWindow();
        }
    });

});

// Do NOT quit when all regular windows close.
// The floating chatbot window must keep running even when the dashboard is closed.
// Only quit when the user explicitly selects Quit from the tray menu.
app.on("window-all-closed", () => {
    // Intentionally empty — app lifecycle is controlled by the tray Quit action.
});

// Setup IPC handlers linking UI renderer to SQLite repositories & AI engine
ipcMain.handle("get-alerts", async () => {
    return await alertRepo.getAll();
});

ipcMain.handle("get-unack-alerts", async () => {
    return await alertRepo.getUnacknowledged();
});

ipcMain.handle("ack-alert", async (event, id) => {
    await alertManager.acknowledge(id);
    return true;
});

ipcMain.handle("ack-all-alerts", async () => {
    await alertManager.acknowledgeAll();
    return true;
});


// ── AI Mode Toggle (Online / Offline / Auto) ────────────────────────────────
ipcMain.handle("set-ai-mode", async (event, { mode, privacyMode }) => {
    try {
        let targetMode = mode;
        if (!targetMode && privacyMode !== undefined) {
            targetMode = (privacyMode === true || privacyMode === "true") ? "offline" : "online";
        }
        targetMode = targetMode || "auto";

        // Persist choice to settings DB so it survives restarts
        await db.run(
            `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
            ["aiMode", targetMode, new Date().toISOString()]
        );
        await db.run(
            `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
            ["aiPrivacyMode", targetMode === "offline" ? "true" : "false", new Date().toISOString()]
        );

        aiEngine.setMode(targetMode);

        console.log(`[AI] AI Mode set to "${targetMode.toUpperCase()}"`);
        return { success: true, mode: targetMode, status: aiEngine.getStatus() };
    } catch (err) {
        console.error("[AI] set-ai-mode error:", err.message);
        return { success: false, error: err.message };
    }
});

ipcMain.handle("get-ai-mode", async () => {
    return {
        mode: aiEngine.getMode(),
        status: aiEngine.getStatus()
    };
});

ipcMain.handle("list-ai-models", async () => {
    return await aiEngine.listAvailableModels();
});

ipcMain.handle("set-ai-model", async (event, { providerType, modelName }) => {
    await aiEngine.setModel(providerType, modelName);
    return aiEngine.getStatus();
});

// ── Learning Mode / Baseline IPC Handlers ───────────────────────────────────
ipcMain.handle("get-baseline-records", async () => {
    return await baselineRepo.getAll();
});

ipcMain.handle("approve-baseline", async (event, { id }) => {
    await baselineRepo.approve(id);
    return { success: true };
});

ipcMain.handle("reject-baseline", async (event, { id }) => {
    await baselineRepo.reject(id);
    return { success: true };
});

ipcMain.handle("reset-learning-mode", async () => {
    await baselineRecorder.reset();
    return { success: true };
});

// ─── AI IPC channels (with streaming token push) ───────────────────────────

/**
 * ai-chat
 * Accepts an optional streamTarget: 'floating' | 'main' to know which window
 * should receive ai-token events.
 */
ipcMain.handle("ai-chat", async (event, { sessionId, message, context, streamTarget }) => {
    // Gather live laptop hardware, OS, and security posture telemetry
    const telemetry = await SystemTelemetry.getTelemetry({
        systemCollector: systemSkill?.collector,
        networkCollector: networkSkill?.collector,
        alertRepo
    });

    // ── URL Security Inspection Integration ──────────────────────────────────────
    let urlSecurityReport = null;
    const urlRegex = /(https?:\/\/[^\s<>'"]+|www\.[^\s<>'"]+)/gi;
    const extractedUrls = message ? (message.match(urlRegex) || []) : [];
    const uniqueUrls = [...new Set(extractedUrls)];

    if (uniqueUrls.length > 0) {
        console.log(`[Chat] URL detected: ${uniqueUrls.join(", ")}`);
        console.log("[Chat] Routing URL to security inspection via URLAnalyzer/DetectionManager");
        try {
            const reports = await Promise.all(uniqueUrls.map(u => URLAnalyzer.analyze(u)));
            urlSecurityReport = reports.length === 1 ? reports[0] : reports;
            console.log("[DetectionManager] Authoritative URL evidence received and attached to AI context");
        } catch (err) {
            console.error("[Chat] Error executing URL security inspection:", err.message);
        }
    }

    const fullContext = { ...(context || {}), telemetry, urlSecurityReport };

    // Determine which window to push streaming tokens to
    const targetWin =
        streamTarget === "main" ? mainWindow :
        streamTarget === "floating" ? floatingWindow :
        // Auto-detect from sender
        BrowserWindow.fromWebContents(event.sender) || floatingWindow;

    const onToken = targetWin && !targetWin.isDestroyed()
        ? (token) => {
              try { targetWin.webContents.send("ai-token", token); } catch {}
          }
        : null;

    return await aiEngine.chat(sessionId, message, fullContext, { onToken });
});

ipcMain.handle("ai-explain", async (event, alert) => {
    const targetWin = BrowserWindow.fromWebContents(event.sender) || floatingWindow;
    const onToken   = targetWin && !targetWin.isDestroyed()
        ? (token) => { try { targetWin.webContents.send("ai-token", token); } catch {} }
        : null;
    return await aiEngine.explainAlert(alert, { onToken });
});

ipcMain.handle("explain-alert", async (event, alert) => {
    const targetWin = BrowserWindow.fromWebContents(event.sender) || floatingWindow;
    const onToken   = targetWin && !targetWin.isDestroyed()
        ? (token) => { try { targetWin.webContents.send("ai-token", token); } catch {} }
        : null;
    return await aiEngine.explainAlert(alert, { onToken });
});

ipcMain.handle("ai-analyze-threat", async (event, { detections, context }) => {
    return await aiEngine.analyzeThreats(detections || [], context || {});
});

/** Returns current AI provider status + recent latency for status bar */
ipcMain.handle("ai-status", async () => {
    return aiEngine.getStatus();
});

ipcMain.handle("get-recent-processes", async () => {
    // Return processes from memory collector for live dashboard view
    const processes = await systemSkill.collector.collect();
    return processes;
});

ipcMain.handle("get-network-connections", async () => {
    const { connections } = await networkSkill.collector.collect();
    return connections;
});

ipcMain.handle("get-open-windows", async () => {
    // Cross-platform: tasklist on Windows, ps on Linux
    try {
        const { exec } = require("child_process");

        if (process.platform === "win32") {
            // Windows: use tasklist /v /fo csv
            const output = await new Promise((resolve, reject) => {
                const { execFile } = require("child_process");
                execFile("tasklist", ["/v", "/fo", "csv", "/nh"], { timeout: 8000 }, (err, stdout) => {
                    if (err) reject(err); else resolve(stdout);
                });
            });
            const windows = [];
            for (const line of output.split(/\r?\n/).filter(Boolean)) {
                const cols = line.match(/"([^"]*)"/g);
                if (!cols || cols.length < 9) continue;
                const strip = s => s.replace(/^"|"$/g, "");
                const windowTitle = strip(cols[8]);
                if (!windowTitle || windowTitle === "N/A") continue;
                windows.push({ pid: parseInt(strip(cols[1]), 10), name: strip(cols[0]), windowTitle, memory: strip(cols[4]) });
            }
            return windows;
        } else {
            // Linux: use ps to list processes with memory
            const output = await new Promise((resolve) => {
                exec("ps -eo pid,rss,comm --no-headers 2>/dev/null", { timeout: 8000 }, (err, stdout) => {
                    resolve(stdout || "");
                });
            });
            const windows = [];
            for (const line of output.trim().split("\n").filter(Boolean)) {
                const parts = line.trim().split(/\s+/);
                if (parts.length < 3) continue;
                const pid    = parseInt(parts[0], 10);
                const rssKb  = parseInt(parts[1], 10);
                const name   = parts.slice(2).join(" ");
                if (!name || name === "ps") continue;
                windows.push({
                    pid,
                    name,
                    windowTitle: name,
                    memory: rssKb > 1024 ? `${(rssKb / 1024).toFixed(1)} MB` : `${rssKb} KB`
                });
            }
            return windows;
        }
    } catch (err) {
        console.warn("[IPC] get-open-windows failed:", err.message);
        return [];
    }
});

ipcMain.handle("get-registry-state", async () => {
    const regData = await registrySkill.watcher.collector.collect();
    return regData;
});

ipcMain.handle("get-stats", async () => {
    const alertCount = await alertRepo.count();
    const activeAlerts = alertManager.getAll();
    const highAlertsCount = activeAlerts.filter(a => a.severity === "CRITICAL" || a.severity === "HIGH").length;

    // Estimate threat score
    const score = activeAlerts.length === 0 ? 0 : Math.min(30 + activeAlerts.length * 10 + highAlertsCount * 15, 100);

    return {
        alertsCount: alertCount,
        activeAlertsCount: activeAlerts.length,
        threatScore: score,
        status: score > 70 ? "CRITICAL" : score > 30 ? "WARNING" : "SECURE"
    };
});

ipcMain.handle("get-settings", async () => {
    const rows = await db.all("SELECT * FROM settings");
    const settings = {};
    for (const r of rows) {
        settings[r.key] = r.value;
    }
    return settings;
});

ipcMain.handle("update-settings", async (event, newSettings) => {
    for (const [key, value] of Object.entries(newSettings)) {
        await db.run(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
            [key, String(value), new Date().toISOString()]
        );
    }
    return true;
});

// Whitelist / Safe Items API
ipcMain.handle("mark-as-safe", async (event, { type, value, alertId }) => {
    await whitelistRepo.add(type || "process", value, "User approved safe");
    if (alertId) {
        await alertManager.acknowledge(alertId);
    }
    // Also acknowledge any active alerts matching this value
    const valLower = String(value).toLowerCase();
    for (const a of alertManager.getAll()) {
        if (
            (a.evidence?.filePath && a.evidence.filePath.toLowerCase().includes(valLower)) ||
            (a.title && a.title.toLowerCase().includes(valLower)) ||
            (a.description && a.description.toLowerCase().includes(valLower))
        ) {
            await alertManager.acknowledge(a.id);
        }
    }
    return { success: true, message: `"${value}" marked as safe. FlotBot has learned this is trusted.` };
});

ipcMain.handle("get-whitelist", async () => {
    return await whitelistRepo.getAll();
});

ipcMain.handle("remove-whitelist", async (event, id) => {
    return await whitelistRepo.remove(id);
});

ipcMain.handle("add-whitelist", async (event, { type, value, reason }) => {
    await whitelistRepo.add({ type, value, reason: reason || "" });
    return { success: true };
});

// ── Alert History IPC ────────────────────────────────────────────────────────
ipcMain.handle("get-alert-history", async () => {
    return await db.all(`SELECT * FROM alert_history ORDER BY timestamp DESC LIMIT 500`);
});

ipcMain.handle("log-alert-action", async (event, record) => {
    try {
        await db.run(
            `INSERT INTO alert_history
             (alert_id, timestamp, rule_triggered, pid, exe_path, remote_ip, severity, action_taken, response_time_ms, chat_transcript)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                record.alertId || "",
                new Date().toISOString(),
                record.ruleTriggered || "",
                record.pid || "",
                record.exePath || "",
                record.remoteIp || "",
                record.severity || "",
                record.actionTaken || "",
                record.responseTimeMs || null,
                record.chatTranscript ? JSON.stringify(record.chatTranscript) : null
            ]
        );
        return { success: true };
    } catch (err) {
        console.error("[IPC] log-alert-action error:", err.message);
        return { success: false, error: err.message };
    }
});

// ── Blocked IPs IPC ──────────────────────────────────────────────────────────
ipcMain.handle("get-blocked-ips", async () => {
    return await db.all(`SELECT * FROM blocked_ips ORDER BY added_at DESC`);
});

ipcMain.handle("block-ip-global", async (event, { ip, note }) => {
    try {
        await db.run(
            `INSERT OR IGNORE INTO blocked_ips (ip, added_at, added_by, note) VALUES (?, ?, ?, ?)`,
            [ip, new Date().toISOString(), "admin", note || ""]
        );
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle("remove-blocked-ip", async (event, id) => {
    await db.run(`DELETE FROM blocked_ips WHERE id = ?`, [id]);
    return { success: true };
});

// ── Endpoint Isolation IPC ───────────────────────────────────────────────────
ipcMain.handle("isolate-endpoint", async (event, { enable }) => {
    const val = enable ? "true" : "false";
    await db.run(
        `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
        ["networkIsolated", val, new Date().toISOString()]
    );
    console.log(`[Admin] Endpoint network isolation: ${enable ? "ENABLED" : "DISABLED"}`);
    return { success: true };
});

// ── Security Inspection & Action Handlers ─────────────────────────────────────
const URLAnalyzer = require("../modules/browser/URLAnalyzer");
const ScreenAnalyzer = require("../modules/screen/ScreenAnalyzer");
const SafeActionExecutor = require("../core/security/SafeActionExecutor");
const SafeQuarantineManager = require("../core/security/QuarantineManager");
const ThreadAnalyzer = require("../modules/malware/ThreadAnalyzer");
const RealMalwareInspector = require("../modules/malware/RealMalwareInspector");
const FileThreatEngine = require("../core/fileengine/FileThreatEngine");
const ThreatTimeline = require("../core/reporting/ThreatTimeline");
const ThreatReplay = require("../core/reporting/ThreatReplay");

const safeExecutor = new SafeActionExecutor(db);
const safeQuarantine = new SafeQuarantineManager();
const screenAnalyzer = new ScreenAnalyzer(aiEngine);
const threadAnalyzer = new ThreadAnalyzer(aiEngine);
const realMalwareInspector = new RealMalwareInspector(aiEngine, malwareAnalyzer?.ioc);
const fileThreatEngine = new FileThreatEngine({
    aiEngine,
    threatIntelEngine: new (require("../core/threatintel/ThreatIntelEngine"))({
        vtApiKey: process.env.VIRUSTOTAL_API_KEY
    })
});
const threatTimeline = new ThreatTimeline(db);
let activeReplay = null;

ipcMain.handle("analyze-url", async (event, url) => {
    return await URLAnalyzer.analyze(url);
});

ipcMain.handle("capture-screen", async () => {
    return await screenAnalyzer.captureScreenshot();
});

ipcMain.handle("analyze-screen", async (event, params) => {
    return await screenAnalyzer.analyzeScreen(params || {});
});

ipcMain.handle("audit-threads", async (event, targetPid) => {
    return await threadAnalyzer.auditThreads(targetPid || null);
});

ipcMain.handle("inspect-malware-file", async (event, filePath) => {
    return await realMalwareInspector.inspectFile(filePath);
});

ipcMain.handle("analyze-file-threat", async (event, params) => {
    const filePath = typeof params === "string" ? params : params?.filePath;
    const contextOptions = params?.contextOptions || {};
    return await fileThreatEngine.analyzeFile(filePath, contextOptions);
});

ipcMain.handle("fast-scan-file", async (event, filePath) => {
    return await fileThreatEngine.fastPathScan(filePath);
});

ipcMain.handle("pick-and-scan-file", async () => {
    const res = await dialog.showOpenDialog(mainWindow || null, {
        title: "Select File to Inspect for Malware & Threats",
        properties: ["openFile"]
    });
    if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
        return { canceled: true };
    }
    const chosenPath = res.filePaths[0];
    const report = await fileThreatEngine.analyzeFile(chosenPath);
    return { canceled: false, filePath: chosenPath, report };
});

// ── Ultra-Fast Big Data Timeline & Replay Handlers ────────────────────────────
ipcMain.handle("build-timeline", async (event, params) => {
    const s = params?.startTime ? new Date(params.startTime) : new Date(Date.now() - 86400_000 * 7);
    const e = params?.endTime ? new Date(params.endTime) : new Date();
    return await threatTimeline.build(s, e, params?.options || {});
});

ipcMain.handle("init-replay", async (event, params) => {
    const incidentOrEvents = params?.incidentOrEvents || [];
    activeReplay = new ThreatReplay(incidentOrEvents, params?.options || {});
    return {
        totalSteps: activeReplay.getTotalSteps(),
        currentStep: activeReplay.getCurrentStep()
    };
});

ipcMain.handle("replay-seek", async (event, stepIndex) => {
    if (!activeReplay) return null;
    return activeReplay.seek(stepIndex);
});

ipcMain.handle("replay-seek-time", async (event, targetTime) => {
    if (!activeReplay) return null;
    return activeReplay.seekTimestamp(targetTime);
});

ipcMain.handle("replay-seek-percent", async (event, percent) => {
    if (!activeReplay) return null;
    return activeReplay.seekPercent(percent);
});

ipcMain.handle("replay-next", async (event, count) => {
    if (!activeReplay) return null;
    return activeReplay.next(count || 1);
});

ipcMain.handle("replay-previous", async (event, count) => {
    if (!activeReplay) return null;
    return activeReplay.previous(count || 1);
});

ipcMain.handle("replay-get-window", async (event, params) => {
    if (!activeReplay) return { total: 0, items: [] };
    return activeReplay.getEventsWindow(params?.offset || 0, params?.limit || 100);
});

ipcMain.handle("replay-set-speed", async (event, speed) => {
    if (!activeReplay) return { success: false };
    activeReplay.setSpeed(speed);
    return { success: true, speed };
});

ipcMain.handle("execute-action", async (event, params) => {
    return await safeExecutor.executeAction(params || {});
});

ipcMain.handle("list-quarantine", async () => {
    return safeQuarantine.listQuarantined();
});

ipcMain.handle("restore-quarantine", async (event, id) => {
    return await safeQuarantine.restoreFile(id);
});

ipcMain.handle("delete-quarantine", async (event, id) => {
    return await safeQuarantine.deletePermanently(id);
});

const DeepFileSystemScanner = require("../modules/scanner/DeepFileSystemScanner");
const deepScanner = new DeepFileSystemScanner(aiEngine);

ipcMain.handle("deep-scan-system", async () => {
    return await deepScanner.performDeepScan();
});

// Control custom window operations over IPC (min, max, close)
// ── Admin Console IPC ────────────────────────────────────────────────────────
ipcMain.on("open-admin-console", () => createAdminWindow());

ipcMain.on("win-minimize", () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on("win-maximize", () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on("win-close", () => {
    if (mainWindow) {
        isQuitting = true;
        app.quit();
    }
});

/**
 * Setup Custom Floating Chatbot Window.
 */
function createFloatingWindow() {
    const { screen } = require("electron");
    const primaryDisplay = screen.getPrimaryDisplay();
    const { x: dispX, y: dispY, width: dispW, height: dispH } = primaryDisplay.workArea;

    const bubbleSize = 88;
    // Default anchored to bottom-right corner with 24px margin
    const targetX = Math.round(dispX + dispW - bubbleSize - 24);
    const targetY = Math.round(dispY + dispH - bubbleSize - 24);

    floatingWindow = new BrowserWindow({
        width: bubbleSize,
        height: bubbleSize,
        minWidth: bubbleSize,
        maxWidth: bubbleSize,
        minHeight: bubbleSize,
        maxHeight: bubbleSize,
        x: targetX,
        y: targetY,
        center: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        hasShadow: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    floatingWindow.loadFile(path.join(__dirname, "renderer/floating.html"));

    // Ensure window is placed at bottom-right on show (Linux window manager safety)
    floatingWindow.once("ready-to-show", () => {
        floatingWindow.setPosition(targetX, targetY);
        floatingWindow.show();
    });

    floatingWindow.on("close", (e) => {
        if (!isQuitting) {
            e.preventDefault();
        }
    });

    floatingWindow.on("closed", () => {
        floatingWindow = null;
        if (!isQuitting) {
            setTimeout(() => createFloatingWindow(), 500);
        }
    });
}

// Floating window specific IPC handlers
// Expand / collapse with strict bounds clamping to prevent window expansion or distortion on laptop screens.
ipcMain.on("resize-floating-window", (event, state) => {
    if (!floatingWindow || floatingWindow.isDestroyed()) return;
    const [curX, curY] = floatingWindow.getPosition();
    const [curW, curH] = floatingWindow.getSize();
    const { screen } = require("electron");

    // Get the display containing the widget center
    const display = screen.getDisplayNearestPoint({
        x: curX + Math.round(curW / 2),
        y: curY + Math.round(curH / 2)
    });
    const { x: dispX, y: dispY, width: dispW, height: dispH } = display.workArea;

    const displayCenterX = dispX + dispW / 2;
    const displayCenterY = dispY + dispH / 2;
    const isLeft = (curX + curW / 2) < displayCenterX;
    const isTop  = (curY + curH / 2) < displayCenterY;

    if (state === "hide") {
        floatingWindow.hide();
    } else if (state === "fullscreen") {
        const width = Math.min(850, dispW - 20);
        const height = Math.min(680, dispH - 30);
        const newX = Math.round(dispX + (dispW - width) / 2);
        const newY = Math.round(dispY + (dispH - height) / 2);
        floatingWindow.setMinimumSize(400, 400);
        floatingWindow.setMaximumSize(1920, 1080);
        floatingWindow.setBounds({ x: newX, y: newY, width, height });
    } else if (state === "docked") {
        const width = Math.min(380, dispW - 20);
        const height = dispH;
        const newX = dispX + dispW - width;
        const newY = dispY;
        floatingWindow.setMinimumSize(320, 400);
        floatingWindow.setMaximumSize(600, 1440);
        floatingWindow.setBounds({ x: newX, y: newY, width, height });
    } else if (state === "expanded") {
        const width = 400;
        // Adapt height to laptop screen workArea (leave 30px buffer)
        const height = Math.min(580, Math.max(500, dispH - 40));

        let newX = isLeft ? curX : (curX + curW - width);
        let newY = isTop  ? curY : (curY + curH - height);

        newX = Math.max(dispX, Math.min(newX, dispX + dispW - width));
        newY = Math.max(dispY, Math.min(newY, dispY + dispH - height));

        floatingWindow.setMinimumSize(360, 400);
        floatingWindow.setMaximumSize(600, 1000);
        floatingWindow.setBounds({ x: Math.round(newX), y: Math.round(newY), width, height });
        floatingWindow.show();
    } else {
        // Collapsed to 88x88 Bubble
        const bubbleSize = 88;
        let newX = isLeft ? curX : (curX + curW - bubbleSize);
        let newY = isTop  ? curY : (curY + curH - bubbleSize);

        newX = Math.max(dispX, Math.min(newX, dispX + dispW - bubbleSize));
        newY = Math.max(dispY, Math.min(newY, dispY + dispH - bubbleSize));

        floatingWindow.setMinimumSize(bubbleSize, bubbleSize);
        floatingWindow.setMaximumSize(bubbleSize, bubbleSize);
        floatingWindow.setBounds({ x: Math.round(newX), y: Math.round(newY), width: bubbleSize, height: bubbleSize });
        floatingWindow.show();
    }
});

// Dragging handler for the floating window:
// Active 60fps tracking using global cursor point + bounds clamping
let _floatingDragInterval = null;
let _dragOffset = { x: 0, y: 0 };

ipcMain.on("drag-start-floating", (event, { offsetX, offsetY }) => {
    if (!floatingWindow || floatingWindow.isDestroyed()) return;
    if (_floatingDragInterval) clearInterval(_floatingDragInterval);

    const [winX, winY] = floatingWindow.getPosition();
    const { screen } = require("electron");
    const cursor = screen.getCursorScreenPoint();

    _dragOffset = {
        x: typeof offsetX === "number" ? offsetX : (cursor.x - winX),
        y: typeof offsetY === "number" ? offsetY : (cursor.y - winY)
    };

    _floatingDragInterval = setInterval(() => {
        if (!floatingWindow || floatingWindow.isDestroyed()) {
            if (_floatingDragInterval) clearInterval(_floatingDragInterval);
            _floatingDragInterval = null;
            return;
        }
        const pt = screen.getCursorScreenPoint();
        const [curW, curH] = floatingWindow.getSize();
        const display = screen.getDisplayNearestPoint(pt);
        const { x: dispX, y: dispY, width: dispW, height: dispH } = display.workArea;

        const newX = Math.max(dispX, Math.min(pt.x - _dragOffset.x, dispX + dispW - curW));
        const newY = Math.max(dispY, Math.min(pt.y - _dragOffset.y, dispY + dispH - curH));

        floatingWindow.setPosition(Math.round(newX), Math.round(newY));
    }, 16);
});

ipcMain.on("drag-end-floating", () => {
    if (_floatingDragInterval) {
        clearInterval(_floatingDragInterval);
        _floatingDragInterval = null;
    }
});

// Fallback delta-based drag handler
ipcMain.on("drag-floating-window", (event, { dx, dy }) => {
    if (!floatingWindow || floatingWindow.isDestroyed()) return;
    const [curX, curY] = floatingWindow.getPosition();
    const [curW, curH] = floatingWindow.getSize();
    const { screen } = require("electron");

    const display = screen.getDisplayNearestPoint({
        x: curX + Math.round(curW / 2),
        y: curY + Math.round(curH / 2)
    });
    const { x: dispX, y: dispY, width: dispW, height: dispH } = display.workArea;

    const newX = Math.max(dispX, Math.min(curX + Math.round(dx), dispX + dispW - curW));
    const newY = Math.max(dispY, Math.min(curY + Math.round(dy), dispY + dispH - curH));

    floatingWindow.setPosition(Math.round(newX), Math.round(newY));
});

ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
        floatingWindow.setIgnoreMouseEvents(ignore, options);
    }
});

// Process mitigation blocker
ipcMain.handle("block-process", async (event, pid) => {
    try {
        const { exec } = require("child_process");
        return new Promise((resolve) => {
            exec(`taskkill /F /PID ${pid}`, (err) => {
                if (err) {
                    console.error(`[Block] Failed taskkill for pid ${pid}:`, err.message);
                    try {
                        process.kill(pid, "SIGKILL");
                        resolve({ success: true, message: `Terminated process (PID ${pid}) using SIGKILL.` });
                    } catch (nodeErr) {
                        resolve({ success: false, error: `Failed to terminate PID ${pid}: ${err.message}` });
                    }
                } else {
                    console.log(`[Block] Terminated process (PID ${pid}) via taskkill`);
                    resolve({ success: true, message: `Successfully terminated process (PID ${pid}).` });
                }
            });
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// IP mitigation blocker (Firewall rule)
ipcMain.handle("block-ip", async (event, ip) => {
    try {
        const { exec } = require("child_process");
        return new Promise((resolve) => {
            const ruleName = `FlotBot Block Outbound IP ${ip}`;
            exec(`netsh advfirewall firewall add rule name="${ruleName}" dir=out action=block remoteip=${ip}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(`[Block] Firewall rule failed for ${ip}:`, err.message);
                    resolve({
                        success: false,
                        error: `Failed to block IP ${ip}: ${err.message}. Make sure FlotBot is running with administrator privileges.`
                    });
                } else {
                    console.log(`[Block] Created outbound block firewall rule for ${ip}`);
                    resolve({ success: true, message: `Successfully blocked IP address ${ip} via Windows Defender Firewall.` });
                }
            });
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
});
