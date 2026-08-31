const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleFlotBot: (enable) => ipcRenderer.send('toggle-flotbot', enable),
  getFlotBotStatus: () => ipcRenderer.invoke('get-flotbot-status'),
  onFlotBotStatusChanged: (callback) =>
    ipcRenderer.on('flotbot-status-changed', (event, status) => callback(status)),
  triggerAlert: (alertData) => ipcRenderer.send('trigger-flotbot-alert', alertData),
  onNewAlert: (callback) =>
    ipcRenderer.on('flotbot-new-alert', (event, alert) => callback(alert)),
  flotbotChat: (sessionId, message, context) =>
    ipcRenderer.invoke('flotbot-chat', { sessionId, message, context }),
});
