const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        title: 'Numori',
        icon: path.join(__dirname, 'assets/icons/png/numori-48.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

ipcMain.handle('export-pdf', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { success: false };

    const { filePath, canceled } = await dialog.showSaveDialog(win, {
        title: 'Rätsel als PDF speichern',
        defaultPath: 'numori-raetsel.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) return { success: false };

    await win.webContents.executeJavaScript(`
        // Theme sichern und entfernen
        window._pdfTheme = document.documentElement.getAttribute('data-theme') || '';
        document.documentElement.removeAttribute('data-theme');
        document.body.classList.add('pdf-export');
    `);

    // Warten bis Chromium ohne Dark Theme neu gerendert hat
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfData = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { top: 1, bottom: 1, left: 1, right: 1 }
    });

    await win.webContents.executeJavaScript(`
        document.body.classList.remove('pdf-export');
        if (window._pdfTheme) document.documentElement.setAttribute('data-theme', window._pdfTheme);
    `);

    fs.writeFileSync(filePath, pdfData);
    return { success: true };
});
