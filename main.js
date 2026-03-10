const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const path = require('path');

// Updater-Konfiguration
autoUpdater.autoDownload = false;        // Nutzer muss erst zustimmen
autoUpdater.autoInstallOnAppQuit = true; // Nach Download bei nächstem Beenden installieren

function setupUpdater(win) {
    autoUpdater.on('update-available', (info) => {
        win.webContents.send('update-available', info.version);
    });

    autoUpdater.on('update-downloaded', (info) => {
        win.webContents.send('update-downloaded', info.version);
    });

    autoUpdater.on('download-progress', (progress) => {
        win.webContents.send('update-progress', Math.round(progress.percent));
    });

    autoUpdater.on('error', (err) => {
        console.error('Updater-Fehler:', err.message);
    });

    // Nach kurzem Delay prüfen damit das Fenster bereit ist
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000);
}

ipcMain.on('update-install-now', () => {
    autoUpdater.quitAndInstall(false, true);
});

ipcMain.on('update-start-download', () => {
    autoUpdater.downloadUpdate().catch(() => {});
});

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
    win.setAspectRatio(900 / 700); // Proportionales Resizen
    win.setMenuBarVisibility(false);

    let closeConfirmed = false;

    win.on('close', (e) => {
        if (closeConfirmed) return; // bereits bestätigt, normal schließen
        e.preventDefault();

        (async () => {
            let dirty = false;
            try {
                dirty = await win.webContents.executeJavaScript('window._isDirty === true');
            } catch (_) {}

            if (!dirty) {
                closeConfirmed = true;
                win.close();
                return;
            }

            const { response } = await dialog.showMessageBox(win, {
                type: 'question',
                title: 'Numori',
                message: 'Du hast ein laufendes Rätsel.',
                detail: 'Möchtest du den aktuellen Stand speichern, bevor du die App schließt?',
                buttons: ['Speichern & Schließen', 'Verwerfen', 'Abbrechen'],
                defaultId: 0,
                cancelId: 2,
            });

            if (response === 2) return; // Abbrechen – nichts tun

            if (response === 0) {
                // Speichern
                try {
                    await win.webContents.executeJavaScript('window._saveStateForElectron && window._saveStateForElectron()');
                    await new Promise(r => setTimeout(r, 150));
                } catch (_) {}
            }

            closeConfirmed = true;
            win.close();
        })();
    });
}

app.whenReady().then(() => {
    createWindow();
    const win = BrowserWindow.getAllWindows()[0];
    setupUpdater(win);
});
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
