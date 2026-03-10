const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    exportPDF: () => ipcRenderer.invoke('export-pdf'),

    // Update-API
    onUpdateAvailable:  (cb) => ipcRenderer.on('update-available',  (_e, version) => cb(version)),
    onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_e, version) => cb(version)),
    onUpdateProgress:   (cb) => ipcRenderer.on('update-progress',   (_e, percent) => cb(percent)),
    installUpdateNow:   ()   => ipcRenderer.send('update-install-now'),
    startUpdateDownload:()   => ipcRenderer.send('update-start-download'),
});
