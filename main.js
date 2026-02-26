const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        title: 'Numori',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
