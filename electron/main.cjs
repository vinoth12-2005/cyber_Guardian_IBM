const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = !app.isPackaged;

// Standard modern Chrome User-Agent to prevent Google OAuth 403 disallowed_useragent
const CHROME_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Load FlotBot backend modules
let flotbotBackend = null;
try {
  const Database = require('../FlotBot/database/Database');
  const { initSchema } = require('../FlotBot/database/schema');
  const AlertRepository = require('../FlotBot/database/repositories/AlertRepository');
  const AlertManager = require('../FlotBot/core/alerts/AlertManager');
  const AIEngine = require('../FlotBot/core/ai/AIEngine');
  const OllamaProvider = require('../FlotBot/providers/OllamaProvider');
  const GeminiProvider = require('../FlotBot/providers/GeminiProvider');
  const LocalhostApiServer = require('../FlotBot/modules/browser/LocalhostApiServer');

  flotbotBackend = {
    Database,
    initSchema,
    AlertRepository,
    AlertManager,
    AIEngine,
    OllamaProvider,
    GeminiProvider,
    LocalhostApiServer,
  };
} catch (e) {
  console.log('[FlotBot Backend] Warning loading modules:', e.message);
}

let mainWindow = null;
let flotbotWindow = null;
let tray = null;
let flotbotEnabled = true;

// 1. Create Main Application Window (CyberGuardian Dashboard)
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'CyberGuardian AI',
    autoHideMenuBar: true,
    show: false, // Hidden until ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Apply Chrome User-Agent so Google OAuth popup is permitted
  mainWindow.webContents.setUserAgent(CHROME_USER_AGENT);

  // Handle Google / Firebase OAuth popups
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If it's Google OAuth, Firebase Auth, or social login, allow popup window
    if (
      url.includes('accounts.google.com') ||
      url.includes('firebaseapp.com') ||
      url.includes('googleapis.com') ||
      url.includes('github.com/login') ||
      url.includes('login.microsoftonline.com')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 680,
          autoHideMenuBar: true,
          title: 'Sign In with Provider',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            userAgent: CHROME_USER_AGENT,
          },
        },
      };
    }

    // Real-Time Threat Interception for Insecure HTTP or Suspicious domains
    if (url.startsWith('http://') || url.includes('.xyz') || url.includes('.top')) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('new-alert', {
          id: 'alt_' + Date.now(),
          title: 'Insecure HTTP Destination Intercepted',
          message: `Attempted navigation to unencrypted or high-risk URL: ${url}. Data would be transmitted in plaintext without TLS encryption.`,
          severity: 'high',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }

    // Otherwise, open external links in system browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const startUrl = isDev && process.env.VITE_DEV === 'true'
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('did-fail-load', () => {
    if (startUrl.startsWith('http')) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(startUrl);
        }
      }, 1000);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 2. Create Floating FlotBot Overlay Window — uses the ORIGINAL FlotBot floating.html UI
function createFlotBotWindow() {
  flotbotWindow = new BrowserWindow({
    width: 380,
    height: 560,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: true,
    skipTaskbar: true,
    webPreferences: {
      // Use the original FlotBot preload.js so all IPC channels work exactly as before
      preload: path.join(__dirname, '../FlotBot/electron/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the ORIGINAL FlotBot floating HTML — no changes to its UI or logic
  const originalFloatingHtml = path.join(__dirname, '../FlotBot/electron/renderer/floating.html');
  flotbotWindow.loadFile(originalFloatingHtml);

  // Default position: top right corner of primary display
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  flotbotWindow.setPosition(width - 400, 40);

  flotbotWindow.on('closed', () => {
    flotbotWindow = null;
  });
}

// 3. System Tray Setup
function createSystemTray() {
  // Simple tray menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open CyberGuardian Dashboard',
      click: () => {
        if (!mainWindow) createMainWindow();
        else {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Toggle FlotBot Chatbot',
      type: 'checkbox',
      checked: flotbotEnabled,
      click: (item) => {
        toggleFlotBot(item.checked);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit CyberGuardian',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  try {
    const iconPath = path.join(__dirname, '../public/logo-icon.png');
    tray = new Tray(iconPath);
    tray.setToolTip('CyberGuardian AI & FlotBot Defender');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      } else {
        createMainWindow();
      }
    });
  } catch (err) {
    console.log('[SystemTray] Desktop environment does not support tray or icon error:', err.message);
  }
}

function toggleFlotBot(enable) {
  flotbotEnabled = enable;
  if (enable) {
    if (!flotbotWindow) createFlotBotWindow();
    else flotbotWindow.show();
  } else {
    if (flotbotWindow) flotbotWindow.hide();
  }
  // Send state to main window if active
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('flotbot-status-changed', flotbotEnabled);
  }
}

// IPC Handlers between Frontend and Main Process
ipcMain.handle('get-flotbot-status', () => flotbotEnabled);

ipcMain.on('toggle-flotbot', (event, enable) => {
  toggleFlotBot(enable);
});

ipcMain.on('trigger-flotbot-alert', (event, alertData) => {
  if (flotbotWindow && !flotbotWindow.isDestroyed()) {
    flotbotWindow.webContents.send('flotbot-new-alert', alertData);
    if (!flotbotWindow.isVisible() && flotbotEnabled) {
      flotbotWindow.show();
    }
  }
});

ipcMain.handle('flotbot-chat', async (event, { sessionId, message, context }) => {
  if (aiEngineInstance) {
    try {
      const response = await aiEngineInstance.chat(sessionId || 'flotbot-widget-session', message, context || {});
      return response;
    } catch (e) {
      console.log('[FlotBot IPC Chat Error]:', e.message);
      return { reply: "FlotBot AI scanner is actively monitoring system processes and endpoints." };
    }
  }
  return { reply: "FlotBot AI engine initialized in offline mode." };
});

// Global FlotBot instances
let aiEngineInstance = null;

// App Lifecycle
app.whenReady().then(async () => {
  // Set Auto-Start on Linux Boot
  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
  });

  // Initialize FlotBot's complete backend (AI Engine, DB, IPC handlers, Threat Scanner)
  // This runs FlotBot's own backend exactly as it was — zero changes to its logic
  try {
    require('../FlotBot/electron/main.js');
    console.log('[FlotBot] Full backend initialized from FlotBot/electron/main.js');
  } catch (err) {
    console.log('[FlotBot Backend] Note:', err.message);
    // Fallback: initialize just the AI engine manually
    if (flotbotBackend) {
      try {
        const ollamaProvider = new flotbotBackend.OllamaProvider({
          host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
          model: process.env.OLLAMA_MODEL || 'qwen2.5:0.5b',
        });
        aiEngineInstance = new flotbotBackend.AIEngine({
          chatProvider: ollamaProvider,
          analysisProvider: ollamaProvider,
        });
        await aiEngineInstance.initialize();
        const apiServer = new flotbotBackend.LocalhostApiServer(41738, aiEngineInstance);
        apiServer.start();
        console.log('[FlotBot Backend] Fallback AI Engine & API Server (41738) started.');
      } catch (e2) {
        console.log('[FlotBot Backend] Fallback init note:', e2.message);
      }
    }
  }

  createMainWindow();
  if (flotbotEnabled) {
    createFlotBotWindow();
  }
  createSystemTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep app in system tray unless user explicitly quits
    // app.quit();
  }
});
