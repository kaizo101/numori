"use strict";

// Modules loaded via script tags (in order):
//   locales/de.js, locales/en.js → window.TRANSLATIONS
//   constants.js  → FONT_SCALE_KEY, OPSYMBOL, DIFF_CODE, CODE_DIFF, DIFF_BY_SIZE, DAILY_SCHEDULE
//   ui.js         → t(), getLang(), applyLanguage(), applyTheme(), setStatus(), setSeedTypewriter(),
//                    syncCustomSelect(), updateDifficultyOptions(), initDebug(), showUpdateBanner(), …
//   music.js      → musicPlayer, initMusicPlayer(), initSettingsMusicPlayer()
//   themes/flipper.js → buildFlipperTicker(), flipperDMD, startFlipperWin(), stopFlipperWin()
//   themes/console.js → startMatrixRain(), stopMatrixRain(), showConsoleError(), initConsoleStatus()
//   leaderboard.js    → recordSolve(), insertLeaderboardEntry(), initStatsModal(), initLeaderboardEntryModal(), …
//   puzzle.js         → saveGameState(), loadGameState(), restoreGameState(), renderBoard(), …
//   modules/tutorial.js → tutorialModule
//   modules/numpad.js   → numpadModule

// ── GLOBALER ZUSTAND ──────────────────────────────────────────────
let currentPuzzle = null;
let selected = { r: 0, c: 0 };
let notesMode = false;
let validationActive = false;
let generationWorker = null;
let userBoard;
let notesBoard;

// Timer-Zustand
let timerInterval = null; // setInterval-Handle
let elapsedSeconds = 0; // immer mitlaufen, auch wenn unsichtbar
let timerVisible = false; // Toggle-Status
let timerStopped = false; // true: Rätsel gelöst oder Lösung gezeigt
let competitiveBlocked = false; // true: Tipp/Validierung genutzt, Wettkampf-Modus gesperrt
let solvedByCheat = false; // true: Lösung anzeigen wurde genutzt
let debugSolveUsed = false; // true: Debug-Clean-Solve wurde genutzt
let validationWasUsed = false; // true: Sofort-Validierung war aktiv

// Tipp-Zustand
let hintBoard; // hintBoard[r][c] = true wenn Zelle per Tipp gesetzt
let moveCount = 0; // Züge-Zähler

// UNDO/REDO
let history = []; // Undo-Stack: [{r, c, prevValue, prevNotes: Set}]
let redoStack = []; // Redo-Stack

// MAX_HISTORY defined in constants.js

window._isDirty = false;
window._dailyMode = false;
window._dailyDateKey = null;

// ── INITIALISIERUNG ───────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    // Statusleiste auf Android ausblenden
    if (window.Capacitor?.isNativePlatform()) {
        window.Capacitor.Plugins.StatusBar?.hide();
    }

    // APK: body-Hintergrund auf accent setzen damit kein
    // beiger Streifen hinter der Android-Navigationsleiste sichtbar ist
    if (window.Capacitor?.isNativePlatform()) {
        document.body.style.background = 'var(--accent)';
    }
    const sizeEl = document.getElementById('size');
    const diffEl = document.getElementById('difficulty');
    const btnNew = document.getElementById('btn-new');
    const btnSolve = document.getElementById('btn-solve');
    const btnNotes = document.getElementById('btn-notes');
    const btnValidate = document.getElementById('btn-validate');
    const btnTimer = document.getElementById('btn-timer');
    const btnReset = document.getElementById('btn-reset');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const seedInput = document.getElementById('seed-input');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (redoBtn) redoBtn.addEventListener('click', redo);
    updateUndoRedoButtons(); // Initial

    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };

    function newPuzzle(forceSeed = null) {
        clearSavedGame();
        const _mSeed = document.getElementById('mobile-seed-text');
        if (_mSeed) _mSeed._permanentText = '';
        let n, diff, rawSeed;

        if (forceSeed !== null) {
            const full = String(forceSeed).trim().toUpperCase();
            const parsed = parseFullSeed(full);
            if (parsed) {
                // Präfix-ID: Größe + Schwierigkeit aus ID übernehmen
                n    = parsed.n;
                diff = parsed.diff;
                rawSeed = parsed.raw;
                sizeEl.value = String(n);
                diffEl.value = diff;
                sizeEl.dispatchEvent(new Event('change'));
                diffEl.dispatchEvent(new Event('change'));
                syncCustomSelect('size', String(n));
                updateDifficultyOptions(n);
                syncCustomSelect('difficulty', diff);
            } else {
                // Legacy oder reiner Seed ohne Präfix
                n    = parseInt(sizeEl.value, 10);
                diff = diffEl.value;
                rawSeed = full;
            }
        } else {
            n    = parseInt(sizeEl.value, 10);
            diff = diffEl.value;
            rawSeed = randomSeed();
        }

        const fullSeedStr = buildFullSeed(n, diff, rawSeed);
        if (seedInput) setSeedTypewriter(fullSeedStr);
        const seedInt = seedToInt(rawSeed, n, diff);

        if (generationWorker) {
            generationWorker.terminate();
            generationWorker = null;
        }

        // Cache-Treffer: Tagesrätsel bereits vorausberechnet?
        if (_dailyPuzzleCache && _dailyPuzzleCache.fullSeed === fullSeedStr) {
            const cached = _dailyPuzzleCache;
            _dailyPuzzleCache = null;
            currentPuzzle = { solution: cached.solution, cages: cached.cages, seed: fullSeedStr };
            setNotesMode(false);
            validationActive = false;
            const _vBtn = document.getElementById('btn-validate');
            if (_vBtn) _vBtn.dataset.active = 'false';
            requestAnimationFrame(() => renderBoard(currentPuzzle));
            startTimer();
            setStatus(t('status-loaded').replace(/\{n\}/g, n).replace('{diff}', diffLabels[diff]));
            if (window._dailyMode && window._dailyDateKey) {
                const _st = getDailySolvedTime(window._dailyDateKey);
                if (_st && _mSeed) _mSeed._permanentText = t('daily-solved-short').replace('{time}', _st);
            }
            if (document.documentElement.getAttribute('data-theme') === 'flipper')
                flipperDMD.setState('playing', { size: n, diff, seed: fullSeedStr });
            btnSolve.disabled = false;
            btnNew.disabled = false;
            btnNew.textContent = t('btn-new');
            return;
        }

        btnNew.disabled = true;
        btnNew.textContent = t('btn-generating');
        setStatus(t('status-generating').replace(/\{n\}/g, n).replace('{diff}', diffLabels[diff]));

        generationWorker = new Worker('worker.js');
        generationWorker.onmessage = function(e) {
            generationWorker = null;
            if (e.data.success) {
                currentPuzzle = { solution: e.data.solution, cages: e.data.cages, seed: fullSeedStr, score: e.data.score ?? 0 };
                setNotesMode(false);
                validationActive = false;
                const _vBtn = document.getElementById('btn-validate');
                if (_vBtn) _vBtn.dataset.active = 'false';
                // _dailyMode nur beibehalten wenn das generierte Rätsel auch der Tages-Seed ist
                if (window._dailyMode && fullSeedStr !== getDailyConfig().fullSeed) {
                    window._dailyMode = false;
                    window._dailyDateKey = null;
                }
                requestAnimationFrame(() => renderBoard(currentPuzzle));
                startTimer();
                setStatus(t('status-loaded').replace(/\{n\}/g, n).replace('{diff}', diffLabels[diff]));
                if (window._dailyMode && window._dailyDateKey) {
                    const _st = getDailySolvedTime(window._dailyDateKey);
                    if (_st && _mSeed) _mSeed._permanentText = t('daily-solved-short').replace('{time}', _st);
                }
                if (document.documentElement.getAttribute('data-theme') === 'flipper')
                    flipperDMD.setState('playing', { size: n, diff, seed: fullSeedStr });
                btnSolve.disabled = false;
            } else {
                setStatus(t('status-error'));
            }
            btnNew.disabled = false;
            btnNew.textContent = t('btn-new');
        };
        generationWorker.onerror = function(err) {
            generationWorker = null;
            setStatus(t('status-error'));
            console.error(err);
            btnNew.disabled = false;
            btnNew.textContent = t('btn-new');
        };
        generationWorker.postMessage({ n, diff, seed: seedInt });
    }

    function solveAll() {
        if (!currentPuzzle) return;
        const n = currentPuzzle.solution.length;
        stopTimer(true);
        history   = [];
        redoStack = [];
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                setNumber(r, c, currentPuzzle.solution[r][c]);
            }
        }
        updateUndoRedoButtons();
        moveCount = 0;
        const moveEl = document.getElementById('move-count');
        if (moveEl) moveEl.textContent = '-';
        const mobileMoveEl2 = document.getElementById('mobile-move-display');
        if (mobileMoveEl2) mobileMoveEl2.textContent = '0';
        setStatus(t('status-solve-shown'));
        // Button direkt sperren (validateAll läuft nicht durch weil timerStopped=true)
        btnSolve.disabled = true;
    }

    window._newPuzzle = newPuzzle;
    btnNew.addEventListener('click', () => newPuzzle(null));
    btnSolve.addEventListener('click', solveAll);
    btnNotes.addEventListener('click', () => setNotesMode(!notesMode));
    btnValidate.addEventListener('click', () => setValidationMode(!validationActive));
    btnTimer.addEventListener('click', () => setTimerVisible(!timerVisible));
    const btnHint = document.getElementById('btn-hint');
    if (btnHint) btnHint.addEventListener('click', giveHint);

    // Settings
    const btnSettings = document.getElementById('btn-settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    const btnTheme = document.getElementById('btn-theme');
    const themeOverlay = document.getElementById('theme-overlay');
    const themeClose = document.getElementById('theme-close');

    if (btnTheme) btnTheme.addEventListener('click', () => {
        themeOverlay.classList.add('visible');
    });
    if (themeClose) themeClose.addEventListener('click', () => {
        themeOverlay.classList.remove('visible');
    });
    if (themeOverlay) themeOverlay.addEventListener('click', (e) => {
        if (e.target === themeOverlay) themeOverlay.classList.remove('visible');
    });

    if (btnSettings) btnSettings.addEventListener('click', () => {
        settingsOverlay.classList.add('visible');
    });
    document.getElementById('settings-close')?.addEventListener('click', () => {
        settingsOverlay.classList.remove('visible');
    });
    if (settingsOverlay) settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) settingsOverlay.classList.remove('visible');
    });
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('theme-btn-locked')) return;
            applyTheme(btn.dataset.theme);
        });
    });

    initTheme();
    initLanguage();
    initFontScale();
    initLbConsentToggle();
    initCustomSelects();
    updateDifficultyOptions(parseInt(document.getElementById('size')?.value ?? '4', 10));
    // Change-Listener für klassisches Theme
    document.getElementById('size')?.addEventListener('change', (e) => {
        updateDifficultyOptions(parseInt(e.target.value, 10));
        buildFlipperTicker();
    });
    document.getElementById('difficulty')?.addEventListener('change', () => buildFlipperTicker());
    initDailyButton();
    initStatsModal();
    initLeaderboardEntryModal();
    initDebug();
    prewarmDailyPuzzle(); // Tagesrätsel im Hintergrund vorausberechnen
    tutorialModule.init();
    musicPlayer.init(); // Musik-Player initialisieren (DOM ist hier garantiert bereit)
    initSettingsMusicPlayer(); // Settings-Musiksteuerung verdrahten

    // Gespeicherten Spielstand automatisch laden (falls vorhanden)
    const saved = loadGameState();
    if (saved) {
        restoreGameState(saved);
    }

    const btnPdf = document.getElementById('btn-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', async () => {
            if (!currentPuzzle) return;
            if (window.electronAPI) {
                const n = currentPuzzle.solution.length;
                const diff = document.getElementById('difficulty').value;
                const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };
                const pdfMeta = document.getElementById('pdf-meta');
                if (pdfMeta) {
                    pdfMeta.textContent = `${n}×${n}  ·  ${diffLabels[diff]}  ·  ID: ${currentPuzzle.seed}`;
                }
                const result = await window.electronAPI.exportPDF();
                if (result?.success) {
                    setStatus(t('status-pdf'));
                }
            }
        });
    }
    document.getElementById('win-close').addEventListener('click', hideWinBanner);
    document.getElementById('win-new').addEventListener('click', () => {
        hideWinBanner();
        newPuzzle(null);
    });

    seedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const raw = seedInput.value.trim();
            if (raw.length > 0) newPuzzle(raw);
        }
    });

    const btnLoadSeed = document.getElementById('btn-load-seed');
    if (btnLoadSeed) {
        btnLoadSeed.addEventListener('click', () => {
            const raw = seedInput.value.trim();
            if (raw.length > 0) newPuzzle(raw);
        });
    }

    btnReset.addEventListener('click', () => {
        if (!currentPuzzle) return;
        modalOverlay.classList.add('visible');
    });

    modalCancel.addEventListener('click', () => modalOverlay.classList.remove('visible'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('visible');
    });

    // Falsche-Zahlen-Modal
    const clearInvalidOverlay = document.getElementById('clear-invalid-overlay');
    const clearInvalidConfirm = document.getElementById('clear-invalid-confirm');
    const clearInvalidCancel  = document.getElementById('clear-invalid-cancel');
    if (clearInvalidConfirm) clearInvalidConfirm.addEventListener('click', () => {
        clearInvalidOverlay.classList.remove('visible');
        clearInvalidCells();
    });
    if (clearInvalidCancel) clearInvalidCancel.addEventListener('click', () => {
        clearInvalidOverlay.classList.remove('visible');
    });
    if (clearInvalidOverlay) clearInvalidOverlay.addEventListener('click', (e) => {
        if (e.target === clearInvalidOverlay) clearInvalidOverlay.classList.remove('visible');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && clearInvalidOverlay?.classList.contains('visible')) {
            e.preventDefault();
            clearInvalidOverlay.classList.remove('visible');
            clearInvalidCells();
        }
    });

    modalConfirm.addEventListener('click', () => {
        modalOverlay.classList.remove('visible');
        if (!currentPuzzle) return;
        const n = currentPuzzle.solution.length;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                userBoard[r][c] = 0;
                notesBoard[r][c].clear();
                hintBoard[r][c] = false;
                const cell = getCell(r, c);
                const valSpan = cell?.querySelector('.cell-value');
                if (valSpan) valSpan.textContent = '';
                cell?.classList.remove('invalid', 'correct', 'hint');
                updateNotesDisplay(r, c);
            }
        }
        startTimer();
        setStatus(t('status-reset'));
        selectCell(0, 0);
        history = [];
        redoStack = [];
        moveCount = 0;
        const moveEl = document.getElementById('move-count');
        if (moveEl) moveEl.textContent = '0';
        const mobileMoveEl3 = document.getElementById('mobile-move-display');
        if (mobileMoveEl3) mobileMoveEl3.textContent = '0';
        updateUndoRedoButtons();
    });

    window.addEventListener('resize', () => {
        resizeBoard();
        numpadModule.reposition();
    });

    // Zahlenpad-Toggle
    const btnNumpad = document.getElementById('btn-numpad');
    if (btnNumpad) {
        btnNumpad.dataset.active = numpadModule.isEnabled() ? 'true' : 'false';
        btnNumpad.addEventListener('click', () => {
            const active = numpadModule.toggle();
            btnNumpad.dataset.active = active ? 'true' : 'false';
        });
    }

    // ── PLATTFORM-KLASSEN ─────────────────────────────────────────
    if (window.electronAPI) document.documentElement.classList.add('is-electron');
    if (window.Capacitor?.isNativePlatform()) document.documentElement.classList.add('is-native');

    // ── AUTO-UPDATER ──────────────────────────────────────────────
    if (window.electronAPI) {
        window.electronAPI.onUpdateAvailable((version) => {
            showUpdateBanner(`Version ${version} verfügbar.`, 'download', version);
        });
        window.electronAPI.onUpdateDownloaded((version) => {
            showUpdateBanner(`Version ${version} bereit.`, 'install', version);
        });
    }

    // ── AUTO-SAVE beim Schließen (Webversion) ─────────────────────
    // In Electron übernimmt main.js den Speicher-Dialog.
    // Im Browser / auf Mobilgeräten wird der Stand beim Backgrounding
    // gespeichert, damit er beim nächsten Öffnen wiederhergestellt wird.
    if (!window.electronAPI) {
        window.addEventListener('beforeunload', () => { saveGameState(); });
        // visibilitychange ist auf Android/iOS deutlich zuverlässiger als beforeunload
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && currentPuzzle && !timerStopped) saveGameState();
        });
        // Capacitor-natives App-Lifecycle-Event (Android/iOS)
        if (window.Capacitor?.isNativePlatform()) {
            window.Capacitor.Plugins.App?.addListener('appStateChange', (state) => {
                if (!state.isActive) saveGameState();
            });
        }
    }
});

// Electron: saveGameState für main.js zugänglich machen
window._saveStateForElectron = () => saveGameState?.();
