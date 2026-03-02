const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    exportPDF: () => ipcRenderer.invoke('export-pdf')
});
