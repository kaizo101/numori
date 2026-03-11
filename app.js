"use strict";

// 0. THEME
function applyTheme(theme) {
    const validThemes = ['dark', 'console'];
    document.documentElement.setAttribute('data-theme', validThemes.includes(theme) ? theme : '');
    localStorage.setItem('numori-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Inputs übernehmen font-family nicht per CSS-Vererbung in Chromium
    const font = theme === 'dark' ? "'Poppins', system-ui, sans-serif"
               : theme === 'console' ? "'Share Tech Mono', monospace"
               : "";
    const seedInput = document.getElementById('seed-input');
    if (seedInput) seedInput.style.fontFamily = font;
    // Welcome-Icon je nach Theme tauschen
    const welcomeIcon = document.getElementById('welcome-icon');
    if (welcomeIcon) {
        welcomeIcon.src = theme === 'console'
            ? 'assets/icons/numori_console.png'
            : 'assets/icons/png/numori-1024.png';
    }
    initConsoleStatus();
    initMusicPlayer();
}

// ── SCHRIFTGRÖSSE ─────────────────────────────────────────────────
const FONT_SCALE_KEY = 'numori-font-scale';

function applyFontScale(scale) {
    localStorage.setItem(FONT_SCALE_KEY, String(scale));
    document.querySelectorAll('.font-scale-btn').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.scale) === scale);
    });
    // Skalierte Variablen neu berechnen falls Board vorhanden
    if (currentPuzzle) resizeBoard();
}

function getFontScale() {
    return parseFloat(localStorage.getItem(FONT_SCALE_KEY) ?? '1.0');
}

function initFontScale() {
    const scale = getFontScale();
    document.querySelectorAll('.font-scale-btn').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.scale) === scale);
        btn.addEventListener('click', () => applyFontScale(parseFloat(btn.dataset.scale)));
    });
}

function initTheme() {
    const saved = localStorage.getItem('numori-theme') || 'default';
    applyTheme(saved);
}

// Custom Select Logik
function syncCustomSelect(targetId, value) {
    const cs = document.querySelector(`.custom-select[data-target="${targetId}"]`);
    if (!cs) return;
    const opt = cs.querySelector(`.custom-select-option[data-value="${value}"]`);
    if (!opt) return;
    cs.querySelector('.custom-select-label').textContent = opt.textContent;
    cs.querySelectorAll('.custom-select-option').forEach(o => delete o.dataset.selected);
    opt.dataset.selected = '';
}

function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(cs => {
        const btn = cs.querySelector('.custom-select-btn');
        const dropdown = cs.querySelector('.custom-select-dropdown');
        const label = cs.querySelector('.custom-select-label');
        const targetId = cs.dataset.target;
        const nativeSelect = document.getElementById(targetId);

        // Öffnen/Schließen
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = cs.classList.contains('open');
            // Alle anderen schließen
            document.querySelectorAll('.custom-select.open').forEach(o => o.classList.remove('open'));
            if (!isOpen) cs.classList.add('open');
        });

        // Option wählen
        cs.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.dataset.value;
                const text = opt.textContent;
                label.textContent = text;
                nativeSelect.value = val;
                nativeSelect.dispatchEvent(new Event('change'));
                // Selected-Markierung
                cs.querySelectorAll('.custom-select-option').forEach(o => delete o.dataset.selected);
                opt.dataset.selected = '';
                cs.classList.remove('open');
                // Bei Größenänderung erlaubte Schwierigkeiten aktualisieren
                if (targetId === 'size') updateDifficultyOptions(parseInt(val, 10));
            });
        });
    });

    // Außerhalb klicken schließt alle
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(cs => cs.classList.remove('open'));
    });

    // Escape schließt
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.custom-select.open').forEach(cs => cs.classList.remove('open'));
        }
    });
}

// 1. OPERATOR-SYMBOLE
const OPSYMBOL = { '+': '+', '-': '−', '*': '×', '/': ':' };
function formatLabel(op, target) {
    if (op && op !== '=') return `${target}${OPSYMBOL[op] ?? op}`;
    return target;
}

// 1b. GRÖSSE-SCHWIERIGKEIT-KOPPLUNG
const DIFF_BY_SIZE = {
    3: ['easy'],
    4: ['easy', 'medium'],
    5: ['easy', 'medium', 'hard'],
    6: ['medium', 'hard'],
    7: ['hard'],
};

// ── DEBUG ─────────────────────────────────────────────────────────
function initDebug() {
    const debugSection = document.getElementById('debug-section');
    const btnDebugClear = document.getElementById('btn-debug-clear');
    if (!debugSection) return;

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            const settingsOverlay = document.getElementById('settings-overlay');
            debugSection.style.display = debugSection.style.display === 'none' ? '' : 'none';
            if (debugSection.style.display !== 'none') {
                settingsOverlay?.classList.add('visible');
            }
        }
    });

    document.getElementById('btn-debug-state')?.addEventListener('click', () => {
        console.log('[Numori Debug State]', {
            puzzle: currentPuzzle,
            userBoard,
            notesBoard: notesBoard?.map(row => row.map(s => [...s])),
            hintBoard,
            moveCount,
            elapsedSeconds,
        });
        setStatus('State in Konsole geloggt.');
    });

    btnDebugClear?.addEventListener('click', () => {
        localStorage.clear();
        setStatus('LocalStorage geleert.');
        debugSection.style.display = 'none';
    });

    document.getElementById('btn-debug-update-available')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 verfügbar.', 'download', '99.0.0');
        setStatus('Debug: Update-verfügbar-Banner ausgelöst.');
    });

    document.getElementById('btn-debug-update-downloaded')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 bereit.', 'install', '99.0.0');
        setStatus('Debug: Update-heruntergeladen-Banner ausgelöst.');
    });

    document.getElementById('btn-debug-update-progress')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 verfügbar.', 'download', '99.0.0');
        setStatus('Debug: Download-Fortschritt wird simuliert.');
        requestAnimationFrame(() => {
            document.querySelector('#update-banner .update-banner-btn:not(.update-banner-btn--ghost)')?.click();
            let pct = 0;
            const bar   = document.querySelector('.update-progress-bar');
            const speed = document.querySelector('.update-progress-speed');
            const charPx = 9;
            const BARS   = bar ? Math.max(10, Math.floor((bar.closest('.update-progress-wrap')?.offsetWidth || 260) / charPx) - 6) : 20;
            const sim = setInterval(() => {
                pct = Math.min(100, pct + Math.floor(Math.random() * 8) + 2);
                const kbps = Math.floor(Math.random() * 400 + 800);
                if (bar) {
                    const filled = Math.round((pct / 100) * BARS);
                    const cursor = pct < 100 ? '▌' : '';
                    const empty  = BARS - filled - (cursor ? 1 : 0);
                    bar.textContent = `[${'█'.repeat(filled)}${cursor}${'░'.repeat(Math.max(0, empty))}] ${String(pct).padStart(3)}%`;
                }
                if (speed) speed.textContent = pct < 100 ? `${kbps} kb/s` : 'abgeschlossen.';
                if (pct >= 100) {
                    clearInterval(sim);
                    setTimeout(() => showUpdateBanner('Version 99.0.0 bereit.', 'install', '99.0.0'), 600);
                }
            }, 150);
        });
    });
}

// WICHTIG: Logik-Funktionen dürfen nie theme-abhängig sein.
// Themes werden ausschließlich über CSS gesteuert.
// Nativer <select> und Custom-Select müssen immer synchron
// gehalten werden, unabhängig vom aktiven Theme.
function updateDifficultyOptions(n) {
    const allowed = DIFF_BY_SIZE[n] ?? ['easy', 'medium', 'hard'];
    const diffEl  = document.getElementById('difficulty');
    const cs      = document.querySelector('.custom-select[data-target="difficulty"]');
    if (!diffEl) return;

    // Native options ein-/ausblenden (klassisches Theme)
    Array.from(diffEl.options).forEach(opt => {
        opt.disabled = !allowed.includes(opt.value);
        opt.hidden   = !allowed.includes(opt.value);
    });

    // Custom-Select-Optionen ein-/ausblenden (Dark/Console-Theme)
    if (cs) {
        cs.querySelectorAll('.custom-select-option').forEach(opt => {
            const show = allowed.includes(opt.dataset.value);
            opt.style.display = show ? '' : 'none';
        });
    }

    // Falls aktuelle Schwierigkeit nicht erlaubt → auf schwerste erlaubte springen
    if (!allowed.includes(diffEl.value)) {
        const best = allowed[allowed.length - 1];
        diffEl.value = best;
        if (cs) syncCustomSelect('difficulty', best);
    }
}

// 2. GLOBALER ZUSTAND
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

// Tipp-Zustand
let hintBoard; // hintBoard[r][c] = true wenn Zelle per Tipp gesetzt
let moveCount = 0; // Züge-Zähler

// UNDO/REDO v0.6.0 NEU
let history = []; // Undo-Stack: [{r, c, prevValue, prevNotes: Set}]
let redoStack = []; // Redo-Stack

const MAX_HISTORY = 50; // Begrenzung für Performance

// TYPEWRITER-STATUS (nur Console-Theme)
let _typewriterTimeout = null;
let _seedTypewriterTimeout = null;
window._isDirty = false;
window._dailyMode = false;
window._dailyDateKey = null;

function setStatus(text) {
    const el = document.getElementById('status');
    if (!el) return;
    if (document.documentElement.getAttribute('data-theme') !== 'console') {
        el.textContent = text;
        return;
    }
    // Laufende Animation abbrechen
    if (_typewriterTimeout) {
        clearTimeout(_typewriterTimeout);
        _typewriterTimeout = null;
    }
    el.textContent = '';
    let i = 0;
    const lowerText = text.toLowerCase();
    function type() {
        if (i < lowerText.length) {
            el.textContent = lowerText.slice(0, i + 1);
            i++;
            _typewriterTimeout = setTimeout(type, 28);
        } else {
            _typewriterTimeout = null;
        }
    }
    type();
}

function setSeedTypewriter(text) {
    const el = document.getElementById('seed-input');
    if (!el) return;
    if (document.documentElement.getAttribute('data-theme') !== 'console') {
        el.value = text;
        return;
    }
    if (_seedTypewriterTimeout) {
        clearTimeout(_seedTypewriterTimeout);
        _seedTypewriterTimeout = null;
    }
    el.value = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            el.value = text.slice(0, i + 1);
            i++;
            _seedTypewriterTimeout = setTimeout(type, 28);
        } else {
            _seedTypewriterTimeout = null;
        }
    }
    type();
}

function saveGameState() {
    if (!currentPuzzle) return;
    try {
        const state = {
            puzzle: currentPuzzle,
            userBoard,
            notesBoard: notesBoard.map(row => row.map(s => [...s])),
            hintBoard,
            elapsedSeconds,
            moveCount,
            validationActive,
            timerVisible,
            savedAt: Date.now(),
        };
        localStorage.setItem('numori-savedGame', JSON.stringify(state));
        window._isDirty = false;
    } catch(e) { console.error('Speichern fehlgeschlagen:', e); }
}

function loadGameState() {
    try {
        const raw = localStorage.getItem('numori-savedGame');
        if (!raw) return null;
        const s = JSON.parse(raw);
        // notesBoard Sets wiederherstellen
        s.notesBoard = s.notesBoard.map(row => row.map(arr => new Set(arr)));
        return s;
    } catch(e) { return null; }
}

function clearSavedGame() {
    localStorage.removeItem('numori-savedGame');
}

// ── STATISTIKEN ───────────────────────────────────────────────────

function loadStats() {
    try {
        const raw = localStorage.getItem('numori-stats');
        return raw ? JSON.parse(raw) : { totalSolved: 0, bySize: {} };
    } catch(e) { return { totalSolved: 0, bySize: {} }; }
}

function saveStats(stats) {
    try { localStorage.setItem('numori-stats', JSON.stringify(stats)); }
    catch(e) { console.error('Stats speichern fehlgeschlagen:', e); }
}

function recordSolve(n, diff, seconds, moves) {
    const stats = loadStats();
    stats.totalSolved = (stats.totalSolved || 0) + 1;

    if (!stats.bySize[n]) stats.bySize[n] = {};
    if (!stats.bySize[n][diff]) stats.bySize[n][diff] = { count: 0, bestTime: null, totalTime: 0, bestMoves: null };

    const entry = stats.bySize[n][diff];
    const isFirstSolve = entry.count === 0;
    entry.count++;
    entry.totalTime += seconds;
    const isNewBestTime = !isFirstSolve && (entry.bestTime === null || seconds < entry.bestTime);
    if (entry.bestTime === null || seconds < entry.bestTime) entry.bestTime = seconds;
    if (entry.bestMoves === null || moves < entry.bestMoves) entry.bestMoves = moves;

    saveStats(stats);
    return isNewBestTime;
}

function renderStatsModal() {
    const stats = loadStats();
    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
    const sizes = [3, 4, 5, 6, 7];

    let html = `<div class="stats-total">
        <span class="stats-total-label">${isConsole ? 'gesamt gelöst' : 'Gesamt gelöst'}</span>
        <span class="stats-total-value">${stats.totalSolved}</span>
    </div>`;

    const hasSomeData = Object.keys(stats.bySize).length > 0;
    if (!hasSomeData) {
        html += `<p class="stats-empty">${isConsole ? 'noch keine rätsel gelöst.' : 'Noch keine Rätsel gelöst.'}</p>`;
    } else {
        html += `<div class="stats-table-wrap"><table class="stats-table">
            <thead><tr>
                <th>${isConsole ? 'größe' : 'Größe'}</th>
                <th>${isConsole ? 'schwierigkeit' : 'Schwierigkeit'}</th>
                <th>${isConsole ? 'gelöst' : 'Gelöst'}</th>
                <th>${isConsole ? 'bestzeit' : 'Bestzeit'}</th>
                <th>${isConsole ? 'ø zeit' : 'Ø Zeit'}</th>
                <th>${isConsole ? 'beste züge' : 'Beste Züge'}</th>
            </tr></thead><tbody>`;

        for (const n of sizes) {
            const sizeData = stats.bySize[n];
            if (!sizeData) continue;
            const diffs = Object.keys(sizeData);
            diffs.forEach((diff, i) => {
                const e = sizeData[diff];
                const avgTime = e.count > 0 ? Math.round(e.totalTime / e.count) : null;
                html += `<tr>
                    ${i === 0 ? `<td rowspan="${diffs.length}" class="stats-size-cell">${n}×${n}</td>` : ''}
                    <td>${isConsole ? (diffLabels[diff] ?? diff).toLowerCase() : (diffLabels[diff] ?? diff)}</td>
                    <td>${e.count}</td>
                    <td>${e.bestTime !== null ? formatTime(e.bestTime) : '–'}</td>
                    <td>${avgTime !== null ? formatTime(avgTime) : '–'}</td>
                    <td>${e.bestMoves !== null ? e.bestMoves : '–'}</td>
                </tr>`;
            });
        }
        html += `</tbody></table></div>`;
    }

    const container = document.getElementById('stats-content');
    if (container) container.innerHTML = html;
}

function initStatsModal() {
    const btnStats     = document.getElementById('btn-stats');
    const statsOverlay = document.getElementById('stats-overlay');
    const statsClose   = document.getElementById('stats-close');
    const statsReset   = document.getElementById('stats-reset');

    if (btnStats) btnStats.addEventListener('click', () => {
        renderStatsModal();
        statsOverlay.classList.add('visible');
    });
    if (statsClose) statsClose.addEventListener('click', () => {
        statsOverlay.classList.remove('visible');
    });
    if (statsOverlay) statsOverlay.addEventListener('click', (e) => {
        if (e.target === statsOverlay) statsOverlay.classList.remove('visible');
    });
    if (statsReset) statsReset.addEventListener('click', () => {
        if (!confirm('Alle Statistiken zurücksetzen?')) return;
        saveStats({ totalSolved: 0, bySize: {} });
        renderStatsModal();
    });
}

// ── TÄGLICHES RÄTSEL ──────────────────────────────────────────
const DAILY_SCHEDULE = [
    // So  Mo      Di        Mi      Do        Fr      Sa
    { n: 6, diff: 'hard'   },  // 0 = Sonntag
    { n: 4, diff: 'easy'   },  // 1 = Montag
    { n: 4, diff: 'medium' },  // 2 = Dienstag
    { n: 5, diff: 'easy'   },  // 3 = Mittwoch
    { n: 5, diff: 'medium' },  // 4 = Donnerstag
    { n: 5, diff: 'hard'   },  // 5 = Freitag
    { n: 6, diff: 'medium' },  // 6 = Samstag
];

function getDailyDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDailySeed(dateKey) {
    // Deterministischer Hash aus Datum → 6-stelliger Seed
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let h = 5381;
    for (let i = 0; i < dateKey.length; i++) {
        h = Math.imul(h, 33) ^ dateKey.charCodeAt(i);
    }
    h = h >>> 0;
    let seed = '';
    for (let i = 0; i < 6; i++) {
        seed += chars[h % chars.length];
        h = Math.imul(h, 1664525) + 1013904223 >>> 0;
    }
    return seed;
}

function getDailyConfig() {
    const dateKey = getDailyDateKey();
    const dow = new Date().getDay(); // 0=So, 1=Mo, ...
    const { n, diff } = DAILY_SCHEDULE[dow];
    const rawSeed = getDailySeed(dateKey);
    return { n, diff, rawSeed, dateKey, fullSeed: buildFullSeed(n, diff, rawSeed) };
}

function getDailySolvedKey(dateKey) {
    return `numori-daily-solved-${dateKey}`;
}

function markDailySolved(dateKey, timeStr) {
    localStorage.setItem(getDailySolvedKey(dateKey), timeStr);
}

function getDailySolvedTime(dateKey) {
    return localStorage.getItem(getDailySolvedKey(dateKey));
}

let _dailyPuzzleCache = null; // { fullSeed, puzzle }

function prewarmDailyPuzzle() {
    const { n, diff, rawSeed, fullSeed } = getDailyConfig();
    const seedInt = seedToInt(rawSeed, n, diff);
    const worker = new Worker('worker.js');
    worker.onmessage = (e) => {
        if (e.data.success) {
            _dailyPuzzleCache = {
                fullSeed,
                solution: e.data.solution,
                cages: e.data.cages,
            };
        }
        worker.terminate();
    };
    worker.onerror = () => worker.terminate();
    worker.postMessage({ n, diff, seed: seedInt });
}

function initDailyButton() {
    const btn = document.getElementById('btn-daily');
    if (!btn) return;

    const { dateKey, fullSeed, n, diff } = getDailyConfig();
    const solvedTime = getDailySolvedTime(dateKey);
    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

    if (solvedTime) {
        btn.title = `Tägliches Rätsel – heute bereits gelöst (${solvedTime})`;
        btn.dataset.solved = 'true';
    }

    btn.addEventListener('click', () => {
        window._dailyMode = true;
        window._dailyDateKey = dateKey;
        if (window._newPuzzle) {
            window._newPuzzle(fullSeed);
        } else {
            // Fallback: Seed ins Input setzen und btn-new klicken
            const seedInput = document.getElementById('seed-input');
            if (seedInput) seedInput.value = fullSeed;
            document.getElementById('btn-new')?.click();
        }
        if (solvedTime) setStatus(`tägliches rätsel – heute bereits gelöst (${solvedTime})`);
    });
}

// ──────────────────────────────────────────────────────────────

function restoreGameState(s) {
    currentPuzzle  = s.puzzle;
    userBoard      = s.userBoard;
    notesBoard     = s.notesBoard;
    hintBoard      = s.hintBoard;
    elapsedSeconds = s.elapsedSeconds || 0;
    moveCount      = s.moveCount || 0;
    validationActive = s.validationActive || false;

    requestAnimationFrame(() => {
        renderBoard(currentPuzzle);
        // userBoard/notesBoard/hintBoard nach renderBoard wiederherstellen
        const n = currentPuzzle.solution.length;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                userBoard[r][c]  = s.userBoard[r][c];
                notesBoard[r][c] = s.notesBoard[r][c];
                hintBoard[r][c]  = s.hintBoard[r][c];
                const cell = getCell(r, c);
                const valSpan = cell?.querySelector('.cell-value');
                if (valSpan) valSpan.textContent = s.userBoard[r][c] ? String(s.userBoard[r][c]) : '';
                if (s.hintBoard[r][c]) cell?.classList.add('hint');
                updateNotesDisplay(r, c);
            }
        }
        if (s.validationActive) validateAll();
        // Timer wiederherstellen (pausiert)
        timerStopped = false;
        updateTimerDisplay();
        if (s.timerVisible) setTimerVisible(true);
        const moveEl = document.getElementById('move-count');
        if (moveEl) moveEl.textContent = moveCount;
        updateUndoRedoButtons();
        updateProgress();
        setStatus('spielstand wiederhergestellt.');
        window._isDirty = true;
        // Dropdowns auf wiederhergestellte Größe synchronisieren
        const sizeEl = document.getElementById('size');
        if (sizeEl) {
            sizeEl.value = String(n);
            syncCustomSelect('size', String(n));
            updateDifficultyOptions(n);
        }
    });
}

// Expose saveState for Electron main process
window._saveStateForElectron = saveGameState;

function initConsoleStatus() {
    const el = document.getElementById('status');
    if (!el) return;
    if (document.documentElement.getAttribute('data-theme') === 'console') {
        el.textContent = '';
    }
}


// ── MUSIK-PLAYER ───────────────────────────────────────────────────

const MUSIC_TRACKS = [
// TRACKS:console
    { file: 'antipodeanwriter-8-bit-legends-ancient-shrine-200457.mp3',                          title: '8 Bit Legends Ancient Shrine',       author: 'Antipodeanwriter' },
    { file: 'brutaldesign-electrical-bee-412311.mp3',                                             title: 'Electrical Bee',                     author: 'Brutaldesign' },
    { file: 'deselect-infebis-8-bit-lo-fi-mix-225330.mp3',                                        title: 'Infebis 8 Bit Lo Fi Mix',            author: 'Deselect' },
    { file: 'dstechnician-psykick-112469.mp3',                                                    title: 'Psykick',                            author: 'Dstechnician' },
    { file: 'dstechnician-thinking-overture-115159.mp3',                                          title: 'Thinking Overture',                  author: 'Dstechnician' },
    { file: 'lesiakower-8-bit-takeover-367276.mp3',                                               title: '8 Bit Takeover',                     author: 'Lesiakower' },
    { file: 'lesiakower-battle-time-178551.mp3',                                                  title: 'Battle Time',                        author: 'Lesiakower' },
    { file: 'lesiakower-bitwise-482792.mp3',                                                      title: 'Bitwise',                            author: 'Lesiakower' },
    { file: 'melodyayresgriffiths-over-the-mountain-chiptune-8-bit-rpg-japan-80s-c64-sid-138354.mp3', title: 'Over The Mountain',              author: 'Melodyayresgriffiths' },
    { file: 'moodmode-8-bit-air-fight-158813.mp3',                                                title: '8 Bit Air Fight',                    author: 'Moodmode' },
    { file: 'moodmode-level-iii-294428.mp3',                                                      title: 'Level III',                          author: 'Moodmode' },
    { file: 'music_for_video-old-computer-game-background-music-for-video-9463.mp3',              title: 'Old Computer Game Background Music', author: 'Music_for_video' },
    { file: 'pixelmaniax-pixeloverdrive-380641.mp3',                                              title: 'Pixeloverdrive',                     author: 'Pixelmaniax' },
    { file: 'pixelmaniax-the-hooded-echo-377417.mp3',                                             title: 'The Hooded Echo',                    author: 'Pixelmaniax' },
    { file: 'suitedfrogds-8-bit-chiptune-2-400593.mp3',                                           title: '8 Bit Chiptune 2',                   author: 'Suitedfrogds' },
    { file: 'syouki_takahashi-samurai-188212.mp3',                                                title: 'Samurai',                            author: 'Syouki_takahashi' },
    { file: 'yukinegames-it-has-just-begun-retroland-456223.mp3',                                 title: 'It Has Just Begun Retroland',        author: 'Yukinegames' },
// END-TRACKS:console
];

const musicPlayer = {
    audio:      null,
    trackIndex: 0,
    playing:    false,
    enabled:    false,
    seekingVol: false,

    init() {
        this.audio = new Audio();
        const savedVol = parseFloat(localStorage.getItem('numori-music-vol'));
        this.audio.volume = (!isNaN(savedVol) && savedVol >= 0 && savedVol <= 1) ? savedVol : 0.55;
        this.trackIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);

        this.audio.addEventListener('ended', () => this.next());

        document.getElementById('music-prev')?.addEventListener('click', () => this.prev());
        document.getElementById('music-play')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('music-next')?.addEventListener('click', () => this.next());
        // stop-button entfernt (play/pause genügt)

        // Lautstärkeregler – Listener auf volWrap (größere Klickfläche)
        const volWrap  = document.querySelector('.music-vol-wrap');
        const volTrack = document.getElementById('music-vol-track');
        if (volWrap && volTrack) {
            this._updateVolUI();
            volWrap.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.seekingVol = true;
                this._setVol(e, volTrack);
            });
            document.addEventListener('mousemove', (e) => { if (this.seekingVol) this._setVol(e, volTrack); });
            document.addEventListener('mouseup',   ()  => { this.seekingVol = false; });
        }

        // Playlist-Button
        const playlistBtn = document.getElementById('music-playlist-btn');
        const playlistEl  = document.getElementById('music-playlist');
        if (playlistBtn && playlistEl) {
            this._buildPlaylist(playlistEl);
            let _skipClose = false;
            playlistBtn.addEventListener('click', () => {
                const open = playlistEl.style.display !== 'none';
                if (!open) {
                    // Position unter dem Button berechnen (fixed braucht Viewport-Koordinaten)
                    const rect = playlistBtn.getBoundingClientRect();
                    playlistEl.style.top  = `${rect.bottom + 6}px`;
                    playlistEl.style.left = 'auto';
                    playlistEl.style.right = `${window.innerWidth - rect.right}px`;
                    playlistEl.style.display = 'flex';
                    playlistEl.style.flexDirection = 'column';
                    playlistBtn.classList.add('active');
                    // Aktiven Track sichtbar scrollen
                    const activeItem = playlistEl.querySelector('.music-playlist-item.active');
                    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
                } else {
                    playlistEl.style.display = 'none';
                    playlistBtn.classList.remove('active');
                }
                _skipClose = true;
            });
            playlistEl.addEventListener('click', () => { _skipClose = true; });
            document.addEventListener('click', () => {
                if (_skipClose) { _skipClose = false; return; }
                playlistEl.style.display = 'none';
                playlistBtn.classList.remove('active');
            });
        }

        // Kein Autostart beim Laden
        this.enabled = true;
        this._loadTrack(false);
        this._updateUI();
    },

    _loadTrack(autoPlay = true) {
        const t = MUSIC_TRACKS[this.trackIndex];
        if (!t) return;
        this.playing = false;
        this.audio.src = `music/console/${t.file}`;
        this.audio.load();
        this._updateUI();
        this._updatePlayIcon();
        if (autoPlay && this.enabled) {
            this.audio.play().then(() => { this.playing = true; this._updatePlayIcon(); }).catch((err) => { console.warn('Autoplay blocked:', err); });
        }
    },

    play() {
        if (!this.enabled) return;
        if (!this.audio.src || this.audio.src === window.location.href) { this._loadTrack(); return; }
        this.audio.play().then(() => { this.playing = true; this._updatePlayIcon(); }).catch(() => {});
    },

    togglePlay() {
        if (!this.enabled) return;
        if (this.playing) {
            this.audio.pause();
            this.playing = false;
            this._updatePlayIcon();
        } else {
            this.audio.play().then(() => {
                this.playing = true;
                this._updatePlayIcon();
            }).catch(() => {});
        }
    },

    stop() {
        if (!this.audio) return;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
        this._updatePlayIcon();
    },

    next() {
        this.trackIndex = (this.trackIndex + 1) % MUSIC_TRACKS.length;
        this._loadTrack();
    },

    prev() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            this.trackIndex = (this.trackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
            this._loadTrack();
        }
    },

    _setVol(e, trackEl) {
        const rect = trackEl.getBoundingClientRect();
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.audio.volume = pct;
        localStorage.setItem('numori-music-vol', pct.toFixed(2));
        this._updateVolUI();
    },

    _updateVolUI() {
        const vol   = this.audio ? this.audio.volume : 0.55;
        const pct   = vol * 100;
        const fill  = document.getElementById('music-vol-fill');
        const thumb = document.getElementById('music-vol-thumb');
        if (fill)  fill.style.width  = `${pct}%`;
        if (thumb) thumb.style.left  = `${pct}%`;
    },

    _updatePlayIcon() {
        const icon = document.getElementById('music-play-icon');
        if (!icon) return;
        icon.innerHTML = this.playing
            ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
            : '<polygon points="5 3 19 12 5 21 5 3"/>';
    },

    _buildPlaylist(container) {
        container.innerHTML = '';

        const inner = document.createElement('div');
        inner.className = 'music-playlist-inner';

        // Titelleiste
        const titlebar = document.createElement('div');
        titlebar.className = 'music-playlist-titlebar';
        titlebar.innerHTML =
            `<span class="music-playlist-titlebar-text">▌playlist</span>` +
            `<span class="music-playlist-titlebar-count">${MUSIC_TRACKS.length} tracks</span>`;
        inner.appendChild(titlebar);

        // Scrollbarer Body
        const body = document.createElement('div');
        body.className = 'music-playlist-body';

        MUSIC_TRACKS.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = 'music-playlist-item' + (i === this.trackIndex ? ' active' : '');
            item.dataset.index = i;

            const numSpan = document.createElement('span');
            numSpan.className = 'music-playlist-num';
            numSpan.textContent = String(i + 1).padStart(2, '0');

            const playSpan = document.createElement('span');
            playSpan.className = 'music-playlist-play';
            playSpan.textContent = '▶';

            const textSpan = document.createElement('span');
            textSpan.className = 'music-playlist-item-text';
            textSpan.innerHTML =
                `<span class="music-playlist-author">${t.author.toLowerCase()}</span>` +
                `<span class="music-playlist-sep"> · </span>` +
                `<span class="music-playlist-title">${t.title.toLowerCase()}</span>`;

            item.appendChild(numSpan);
            item.appendChild(playSpan);
            item.appendChild(textSpan);

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.trackIndex = i;
                this.enabled = true;
                this._loadTrack();
                const pl = document.getElementById('music-playlist');
                const pb = document.getElementById('music-playlist-btn');
                if (pl) { pl.style.display = 'none'; pl.style.flexDirection = ''; }
                if (pb) pb.classList.remove('active');
            });

            body.appendChild(item);
        });
        inner.appendChild(body);

        container.appendChild(inner);
    },

    _updatePlaylistHighlight() {
        const items = document.querySelectorAll('.music-playlist-item');
        items.forEach((item, i) => {
            item.classList.toggle('active', i === this.trackIndex);
        });
        const active = document.querySelector('.music-playlist-item.active');
        if (active) {
            const body = active.closest('.music-playlist-body');
            if (body) {
                // Innerhalb des scrollbaren Body scrollen
                const itemTop    = active.offsetTop;
                const itemBottom = itemTop + active.offsetHeight;
                if (itemTop < body.scrollTop) body.scrollTop = itemTop;
                else if (itemBottom > body.scrollTop + body.clientHeight)
                    body.scrollTop = itemBottom - body.clientHeight;
            }
        }
    },

    _updateUI() {
        const t = MUSIC_TRACKS[this.trackIndex];
        if (!t) return;
        const author = t.author.toLowerCase();
        const title  = t.title.toLowerCase();

        // Primäre Spans
        const authorEl = document.getElementById('music-author');
        const titleEl  = document.getElementById('music-title');
        if (authorEl) authorEl.textContent = author;
        if (titleEl)  titleEl.textContent  = title;

        // Duplikat-Spans für nahtloses Marquee-Loop
        const authorDup = document.querySelector('.music-author-dup');
        const titleDup  = document.querySelector('.music-title-dup');
        if (authorDup) authorDup.textContent = author;
        if (titleDup)  titleDup.textContent  = title;

        // Marquee-Animation neu kalibrieren
        const inner = document.getElementById('music-marquee-inner');
        if (inner) {
            // 1. Animation stoppen
            inner.style.animationName = 'none';
            inner.style.transform = 'translateX(0)';
            void inner.offsetWidth; // forced reflow
            // 2. Exakte Breite der ersten Hälfte messen (author + sep + title + gap)
            //    getBoundingClientRect ist subpixel-genau, scrollWidth rundet
            const gap    = inner.querySelector('.music-marquee-gap');
            const firstW = gap
                ? gap.getBoundingClientRect().right - inner.getBoundingClientRect().left
                : inner.scrollWidth / 2;
            const speed    = 32; // px/s
            const duration = Math.max(10, firstW / speed);
            inner.style.setProperty('--marquee-shift', `-${firstW}px`);
            inner.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
            // 3. Animation neu starten
            inner.style.transform = '';
            inner.style.animationName = '';
        }

        this._updatePlaylistHighlight();
        this._updateVolUI();
    },
};

function initMusicPlayer() {
    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
    const playerEl  = document.getElementById('music-player');
    if (!playerEl) return;

    if (isConsole) {
        playerEl.style.display = 'flex';
        // Play-Icon-Zustand synchronisieren
        musicPlayer._updatePlayIcon();
        // Marquee-Animation nach display:flex neu kalibrieren (war ggf. eingefroren)
        requestAnimationFrame(() => {
            const inner = document.getElementById('music-marquee-inner');
            if (inner) {
                inner.style.animationName = 'none';
                inner.style.transform = 'translateX(0)';
                void inner.offsetWidth;
                const gap    = inner.querySelector('.music-marquee-gap');
                const firstW = gap
                    ? gap.getBoundingClientRect().right - inner.getBoundingClientRect().left
                    : inner.scrollWidth / 2;
                const speed    = 32;
                const duration = Math.max(10, firstW / speed);
                inner.style.setProperty('--marquee-shift', `-${firstW}px`);
                inner.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
                inner.style.transform = '';
                inner.style.animationName = '';
            }
        });
    } else {
        // Musik pausieren wenn zu einem anderen Theme gewechselt wird
        if (musicPlayer.audio && musicPlayer.playing) {
            musicPlayer.audio.pause();
            musicPlayer.playing = false;
            musicPlayer._updatePlayIcon();
        }
        playerEl.style.display = 'none';
    }

    // Playlist schließen bei Theme-Wechsel
    const pl = document.getElementById('music-playlist');
    if (pl) { pl.style.display = 'none'; pl.style.flexDirection = ''; }
}
function formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    stopTimer(); // vorherigen sauber beenden
    elapsedSeconds = 0;
    timerStopped = false;
    solvedByCheat = false;
    competitiveBlocked = false;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer(cheat = false) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerStopped = true;
    if (cheat) solvedByCheat = true;
}

function updateTimerDisplay() {
    if (!timerVisible) return;
    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = formatTime(elapsedSeconds);
}

// 3b. GEWINN-BANNER
function showWinBanner(timeStr, size, diff, seed, denied=false, isNewBest=false) {
    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    const el = (id) => document.getElementById(id);
    if (el('win-stat-size'))  el('win-stat-size').textContent  = `${size}×${size}`;
    if (el('win-stat-diff'))  el('win-stat-diff').textContent  = diffLabels[diff] ?? diff;
    if (el('win-stat-time'))  el('win-stat-time').textContent  = timeStr;
    if (el('win-stat-moves')) el('win-stat-moves').textContent = moveCount;
    if (el('win-stat-seed'))  el('win-stat-seed').textContent  = seed;
    const winBest = el('win-best');
    if (winBest) {
        winBest.textContent = isNewBest ? '★ Neue Bestzeit!' : '';
        winBest.style.display = isNewBest ? '' : 'none';
    }
    banner.classList.add('visible');
    _matrixWinData = { size: size+'x'+size, diff, time: timeStr, seed, moves: moveCount, denied, isNewBest };
    startMatrixRain();
    const btnSolve = document.getElementById('btn-solve');
    if (btnSolve) btnSolve.disabled = true;
    numpadModule.hide();
}

function hideWinBanner() {
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    banner.classList.remove('visible');
    stopMatrixRain();
    // btn-solve bleibt gesperrt bis newPuzzle() aufgerufen wird
    if (currentPuzzle && numpadModule.isEnabled()) {
        numpadModule.show(currentPuzzle.solution.length);
    }
}


// MATRIX WIN SCREEN (Console-Theme only)
let _matrixAnimFrame = null;
let _matrixKeyHandler = null;
let _matrixWinData = null;

function startMatrixRain() {
    if (document.documentElement.getAttribute('data-theme') !== 'console') return;
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'display:block !important; position:fixed; top:0; left:0; z-index:99999; pointer-events:none;';
    const ctx = canvas.getContext('2d');
    const FS = 14;
    const cols = Math.floor(canvas.width / FS);
    const rows = Math.floor(canvas.height / FS);
    // Phases
    const RAIN=0, FLASH=1, FLY=2, TYPEWRITE=3, IDLE=4;
    let phase=RAIN;
    // Zeit-basiertes Timing (statt tick-basiert) – läuft auf allen Geräten gleich schnell
    const MS_PER_TICK = 1000/60; // Ziel: 60fps-Äquivalent
    let elapsed = 0, lastTime = performance.now();
    function ticks() { return elapsed / MS_PER_TICK; }
    const isMobile = window.innerWidth <= 600;
    const RAIN_TICKS  = isMobile ? 180 : 400;
    const FLASH_TICKS = isMobile ?  50 :  90;
    const FLY_TICKS   = isMobile ?  60 : 110;
    const TYPE_SPEED  = isMobile ?   2 :   5; // Ticks pro Zeichen (zeit-basiert → gleich auf allen fps)
    const drops = Array.from({length:cols}, ()=>Math.floor(Math.random()*-rows));
    // Win data
    const d = _matrixWinData||{};
    const diffLabel = {easy:'easy',medium:'medium',hard:'hard'}[d.diff]||'';
    const denied = d.denied || false;
    const ACCENT = denied ? '#ff2020' : '#00ff41';
    const TITLE_TEXT = denied ? 'ACCESS DENIED' : 'ACCESS GRANTED';
    const statLines = denied ? [
        '',
        'ERROR CODE 21: cheater or developer detected',
        '',
        '> type "loser" to continue',
    ] : [
        '',
        'size:  '+(d.size||'')+' / '+(diffLabel||''),
        'time:  '+(d.time||'--:--')+(d.isNewBest ? '  ★ neue bestzeit!' : ''),
        'moves: '+(d.moves!==undefined?d.moves:'-'),
        'id:    '+(d.seed||'').toLowerCase(),
        '',
        '> type "start" for new puzzle',
        '> type "exit"  to close',
    ];
    // Layout
    const TITLE_FS     = FS*2.4;
    const TITLE_FINAL_Y= canvas.height*0.28;
    const TITLE_START_Y= canvas.height*0.50;
    const STATS_START_Y= TITLE_FINAL_Y + TITLE_FS*1.6;
    const STAT_LINE_H  = FS*1.85;
    const INPUT_Y = STATS_START_Y + statLines.length*STAT_LINE_H + FS*1.8;
    const INPUT_X = canvas.width/2 - 180;
    let flashAlpha=0, flashScale=1, titleY=TITLE_START_Y;
    let typeLineIdx=0, typeCharIdx=0, typeElapsed=0;
    const TYPE_MS = TYPE_SPEED * MS_PER_TICK;
    let inputActive=false, inputValue='', inputBlink=true, inputBlinkTick=0;

    // Mobile: Touch-Buttons statt Texteingabe
    let mobileButtons = null;
    function createMobileButtons() {
        if (mobileButtons) return;
        mobileButtons = document.createElement('div');
        mobileButtons.style.cssText = 'position:fixed;bottom:80px;left:0;right:0;z-index:100000;display:flex;justify-content:center;gap:16px;padding:0 24px;';
        const btnStyle = 'padding:14px 28px;border:1px solid '+ACCENT+';background:#000;color:'+ACCENT+';font-family:Share Tech Mono,monospace;font-size:0.95em;border-radius:4px;cursor:pointer;letter-spacing:1px;';
        if (!denied) {
            const btnNew = document.createElement('button');
            btnNew.textContent = '> neues rätsel';
            btnNew.style.cssText = btnStyle;
            btnNew.addEventListener('click', () => { stopMatrixRain(); hideWinBanner(); document.getElementById('btn-new')?.click(); removeMobileButtons(); });
            mobileButtons.appendChild(btnNew);
        }
        const btnExit = document.createElement('button');
        btnExit.textContent = denied ? '> schließen' : '> beenden';
        btnExit.style.cssText = btnStyle;
        btnExit.addEventListener('click', () => { stopMatrixRain(); hideWinBanner(); removeMobileButtons(); });
        mobileButtons.appendChild(btnExit);
        document.body.appendChild(mobileButtons);
    }
    function removeMobileButtons() {
        if (mobileButtons) { mobileButtons.remove(); mobileButtons = null; }
    }

    function activateInput() {
        if (inputActive) return; inputActive=true;
        if (isMobile) { createMobileButtons(); return; }
        if (_matrixKeyHandler) document.removeEventListener('keydown',_matrixKeyHandler);
        _matrixKeyHandler=(e)=>{
            if (!inputActive) return;
            if (e.key==='Enter'){
                const cmd=inputValue.trim().toLowerCase();
                if (cmd==='start'||cmd==='loser'){stopMatrixRain();hideWinBanner();document.getElementById('btn-new')?.click();}
                else if(cmd==='exit'){stopMatrixRain();hideWinBanner();}
                else inputValue='';
            } else if(e.key==='Backspace'){inputValue=inputValue.slice(0,-1);e.preventDefault();}
            else if(e.key.length===1&&inputValue.length<24) inputValue+=e.key;
        };
        document.addEventListener('keydown',_matrixKeyHandler);
    }
    function drawTitle(y,alpha,scale){
        ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
        ctx.font='bold '+(TITLE_FS*scale)+'px Share Tech Mono,monospace';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        const tw=ctx.measureText(TITLE_TEXT).width;
        const padX=36*scale, padY=20*scale;
        const bx=canvas.width/2-tw/2-padX, bw=tw+padX*2;
        const bh=TITLE_FS*scale+padY*2, by=y-bh/2;
        ctx.strokeStyle=ACCENT; ctx.lineWidth=3*scale;
        ctx.shadowColor=ACCENT; ctx.shadowBlur=12*alpha;
        ctx.strokeRect(bx,by,bw,bh);
        ctx.shadowBlur=0;
        ctx.fillStyle=ACCENT; ctx.shadowColor=ACCENT; ctx.shadowBlur=28*alpha;
        ctx.fillText(TITLE_TEXT,canvas.width/2,y);
        ctx.shadowBlur=0; ctx.restore();
    }

    function drawStats(revLines,lastChars){
        ctx.font=FS+'px Share Tech Mono,monospace';
        ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.fillStyle=ACCENT;
        const statsX = canvas.width/2 - 90;
        for(let i=0;i<statLines.length;i++){
            if(i>revLines) break;
            const line=i<revLines?statLines[i]:statLines[i].slice(0,lastChars);
            const isCentered = i===0 || statLines[i].startsWith('>') || statLines[i].startsWith('ERROR');
            if(isCentered){ ctx.textAlign='center'; ctx.fillText(line,canvas.width/2,STATS_START_Y+i*STAT_LINE_H); ctx.textAlign='left'; }
            else { ctx.fillText(line,statsX,STATS_START_Y+i*STAT_LINE_H); }
        }
    }
    function drawInput(){
        inputBlinkTick++; if(inputBlinkTick%40===0) inputBlink=!inputBlink;
        ctx.font=FS+'px Share Tech Mono,monospace';
        ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.fillStyle=denied?'#aa1010':'#00aa2a';
        ctx.fillText('> '+inputValue+(inputBlink?'_':' '),INPUT_X,INPUT_Y);
    }
    function draw(now){
        const dt = Math.min(now - lastTime, 50);
        lastTime = now;
        elapsed += dt;
        const t = ticks();
        if(phase===RAIN){
            ctx.fillStyle="rgba(0,0,0,0.14)"; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.font=FS+"px Share Tech Mono,monospace"; ctx.textAlign="left"; ctx.textBaseline="alphabetic";
            for(let c=0;c<cols;c++){
                const pool="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#%&!?/|^~+-*=<>.:;{}[]()" ;const y=drops[c],ch=pool[Math.floor(Math.random()*pool.length)];
                if(y>=0&&y<rows){const tr=denied?Math.min(1,t/RAIN_TICKS):0;const r=Math.round(tr*255),g=Math.round((1-tr)*255);const dropColor=y<2?"#ffffff":"rgb("+r+","+g+",0)";ctx.fillStyle=dropColor;ctx.fillText(ch,c*FS,y*FS+FS);}
                if(Math.random()<0.55)drops[c]++;if(drops[c]>rows+12)drops[c]=Math.floor(Math.random()*-70);
            }
            if(t>RAIN_TICKS){phase=FLASH;elapsed=0;}
        }else if(phase===FLASH){
            ctx.fillStyle="rgba(0,0,0,0.18)";ctx.fillRect(0,0,canvas.width,canvas.height);
            const pr=t/FLASH_TICKS;
            if(pr<0.35){flashAlpha=pr/0.35;flashScale=1+(1-flashAlpha)*0.25;}else{flashAlpha=1;flashScale=1;}
            drawTitle(TITLE_START_Y,flashAlpha,flashScale);
            if(t>=FLASH_TICKS){phase=FLY;elapsed=0;titleY=TITLE_START_Y;}
        }else if(phase===FLY){
            ctx.fillStyle="rgba(0,0,0,0.12)";ctx.fillRect(0,0,canvas.width,canvas.height);
            const ease=1-Math.pow(1-(t/FLY_TICKS),3);
            titleY=TITLE_START_Y+(TITLE_FINAL_Y-TITLE_START_Y)*ease;
            drawTitle(titleY,1,1);
            if(t>=FLY_TICKS){phase=TYPEWRITE;elapsed=0;typeLineIdx=0;typeCharIdx=0;typeElapsed=0;}
        }else if(phase===TYPEWRITE){
            ctx.fillStyle="rgba(0,0,0,0.88)";ctx.fillRect(0,0,canvas.width,canvas.height);
            drawTitle(TITLE_FINAL_Y,1,1);
            typeElapsed += dt;
            while(typeElapsed >= TYPE_MS){
                typeElapsed -= TYPE_MS;
                const cur=statLines[typeLineIdx]||"";
                if(typeCharIdx<cur.length){typeCharIdx++;}
                else if(typeLineIdx<statLines.length-1){typeLineIdx++;typeCharIdx=0;}
                else{phase=IDLE;activateInput();break;}
            }
            drawStats(typeLineIdx,typeCharIdx);
            if(Math.floor(t/22)%2===0){
                ctx.fillStyle=ACCENT;ctx.textBaseline="alphabetic";
                const tw=ctx.measureText((statLines[typeLineIdx]||"").slice(0,typeCharIdx)).width;
                const sX2=canvas.width/2-90;const isCent=typeLineIdx===0||statLines[typeLineIdx].startsWith(">")||statLines[typeLineIdx].startsWith("ERROR");const cX=isCent?canvas.width/2+tw/2+3:sX2+tw+3;ctx.fillRect(cX,STATS_START_Y+typeLineIdx*STAT_LINE_H-FS*0.9,2,FS);
            }
        }else{
            ctx.fillStyle="rgba(0,0,0,0.88)";ctx.fillRect(0,0,canvas.width,canvas.height);
            drawTitle(TITLE_FINAL_Y,1,1);
            drawStats(statLines.length,0);
            if(!isMobile) drawInput();
        }
        _matrixAnimFrame=requestAnimationFrame(draw);
    }
    draw(performance.now());
}

function stopMatrixRain(){
    if(_matrixAnimFrame){cancelAnimationFrame(_matrixAnimFrame);_matrixAnimFrame=null;}
    if(_matrixKeyHandler){document.removeEventListener("keydown",_matrixKeyHandler);_matrixKeyHandler=null;}
    // Mobile Touch-Buttons entfernen falls vorhanden
    document.querySelectorAll('#matrix-mobile-btns').forEach(el => el.remove());
    const c=document.getElementById("matrix-canvas");
    if(c){c.style.display="none";c.getContext("2d").clearRect(0,0,c.width,c.height);}
}


// 4. SEED-HILFSFUNKTIONEN
// Präfix-Kodierung: Größe (3-7) + Schwierigkeit (E/M/H) + '-' + 6-Zeichen-Seed
// z.B. "4M-AB3X7K"
const DIFF_CODE = { easy: 'E', medium: 'M', hard: 'H' };
const CODE_DIFF = { E: 'easy', M: 'medium', H: 'hard' };

function buildFullSeed(n, diff, rawSeed) {
    return `${n}${DIFF_CODE[diff]}-${rawSeed}`;
}

function parseFullSeed(fullSeed) {
    // Format: "4M-AB3X7K" oder legacy ohne Präfix
    const match = fullSeed.match(/^([3-7])([EMH])-([A-Z2-9]{1,12})$/i);
    if (match) {
        return {
            n: parseInt(match[1], 10),
            diff: CODE_DIFF[match[2].toUpperCase()],
            raw: match[3].toUpperCase()
        };
    }
    // Legacy: kein Präfix → aktuelle Dropdowns verwenden
    return null;
}

function randomSeed() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

function seedToInt(str, n, diff) {
    const combined = `${str}|${n}|${diff}`;
    let h = 5381;
    for (let i = 0; i < combined.length; i++) {
        h = Math.imul(h, 33) ^ combined.charCodeAt(i);
    }
    return h >>> 0;
}

// 5. BOARD-GRÖSSE
function getBoardPx() {
    const cont = document.getElementById('board-container');
    let w = cont.clientWidth - 28;
    let h = cont.clientHeight - 28;
    if (w < 0) {
        const headerH = document.querySelector('header')?.offsetHeight ?? 58;
        const toolbarH = document.querySelector('.toolbar')?.offsetHeight ?? 52;
        const statusH = document.querySelector('.status')?.offsetHeight ?? 26;
        const footerH = document.querySelector('footer')?.offsetHeight ?? 26;
        h = window.innerHeight - headerH - toolbarH - statusH - footerH - 28;
    }
    if (w < 0) w = window.innerWidth - 56;
    // Max 78% des kleinsten Viewport-Maßes für Proportionen
    const maxDim = Math.min(window.innerWidth, window.innerHeight) * 0.78;
    return Math.floor(Math.min(w, h, maxDim));
}

// 6. BOARD RENDERN
function getCell(r, c) {
    return document.querySelector(`#board .cell[data-r="${r}"][data-c="${c}"]`);
}

function renderBoard(puzzle) {
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.style.display = 'none';
    const n = puzzle.solution.length;
    const el = document.getElementById('board');
    el.innerHTML = '';
    const px = getBoardPx();
    el.style.width = `${px}px`;
    el.style.height = `${px}px`;
    el.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    el.style.gridTemplateRows = `repeat(${n}, 1fr)`;

    const cageId = Array.from({ length: n }, () => Array(n).fill(-1));
    puzzle.cages.forEach((cage, idx) => {
        cage.cells.forEach(p => { cageId[p.r][p.c] = idx; });
    });

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            const id = cageId[r][c];

            // Borders – innere Käfig-Grenzen + äußere Ränder
            if (r === 0 || cageId[r-1][c] !== id) cell.classList.add('bt');
            if (r === n - 1 || cageId[r+1][c] !== id) cell.classList.add('bb');
            if (c === 0 || cageId[r][c-1] !== id) cell.classList.add('bl');
            if (c === n - 1 || cageId[r][c+1] !== id) cell.classList.add('br');

            // Cage-Label
            if (id >= 0) {
                const cage = puzzle.cages[id];
                const first = cage.cells.reduce((m, p) => (p.r < m.r || (p.r === m.r && p.c < m.c) ? p : m));
                if (first.r === r && first.c === c) {
                    const lbl = document.createElement('span');
                    lbl.className = 'cage-label';
                    lbl.textContent = formatLabel(cage.op, cage.target);
                    cell.appendChild(lbl);
                }
            }

            // Notes-Grid
            const notesGrid = document.createElement('div');
            notesGrid.className = 'cell-notes';
            for (let v = 1; v <= 9; v++) {
                const note = document.createElement('span');
                note.className = 'note';
                note.dataset.v = v;
                note.textContent = v > n ? '' : String(v);
                notesGrid.appendChild(note);
            }
            cell.appendChild(notesGrid);

            // Value-Span
            const valSpan = document.createElement('span');
            valSpan.className = 'cell-value';
            cell.appendChild(valSpan);

            cell.addEventListener('click', () => selectCell(r, c));
            el.appendChild(cell);
        }
    }

    window._isDirty = true;
    _errorCooldown = false;
    userBoard = Array.from({ length: n }, () => Array(n).fill(0));
    notesBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => new Set()));
    hintBoard = Array.from({ length: n }, () => Array(n).fill(false));
    history = [];
    redoStack = [];
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) { bar.style.width = '0%'; bar.classList.remove('complete'); }
    if (text) text.textContent = `0 / ${n * n} (0%)`;
    moveCount = 0;
    const moveEl = document.getElementById('move-count');
    if (moveEl) moveEl.textContent = '0';
    updateTimerBtn();
    selectCell(0, 0);
    requestAnimationFrame(() => { resizeBoard(); numpadModule.show(n); });

    // Ecken-Zellen für Dark-Theme border-radius markieren
    const boardEl = document.getElementById('board');
    if (boardEl) {
        const cells = boardEl.querySelectorAll('.cell');
        if (cells.length >= 1) cells[0].classList.add('corner-tl');
        if (cells.length >= n) cells[n - 1].classList.add('corner-tr');
        if (cells.length >= n * (n - 1) + 1) cells[n * (n - 1)].classList.add('corner-bl');
        if (cells.length >= n * n) cells[n * n - 1].classList.add('corner-br');
    }
}

function resizeBoard() {
    if (!currentPuzzle) return;
    const el = document.getElementById('board');
    const px = getBoardPx();
    el.style.width  = `${px}px`;
    el.style.height = `${px}px`;
    // Schriftgröße proportional zur Zellgröße
    const n        = currentPuzzle.solution.length;
    const cellPx   = px / n;
    const fontScale = getFontScale();
    document.documentElement.style.setProperty('--cell-value-size', `${Math.round(cellPx * 0.32 * fontScale)}px`);
    document.documentElement.style.setProperty('--cage-label-size', `${Math.round(cellPx * 0.12 * fontScale)}px`);
    document.documentElement.style.setProperty('--note-size', `${Math.round(cellPx * 0.10 * fontScale)}px`);
}

// 7. ZELLE AUSWÄHLEN
function selectCell(r, c) {
    const prevCell = getCell(selected.r, selected.c);
    prevCell?.classList.remove('selected');
    prevCell?.querySelector('.cell-cursor')?.remove();
    selected = { r, c };
    const newCell = getCell(r, c);
    newCell?.classList.add('selected');
    // Blinkenden Cursor für Console-Theme einfügen (nur wenn Zelle leer)
    if (newCell && document.documentElement.getAttribute('data-theme') === 'console') {
        const hasValue = !!newCell.querySelector('.cell-value')?.textContent;
        const hasNotes = newCell.querySelector('.note.active') !== null;
        if (!hasValue && !hasNotes) {
            const cursor = document.createElement('div');
            cursor.className = 'cell-cursor';
            newCell.appendChild(cursor);
        }
    }
}

// 8. ZAHL EINGEBEN + SAVE STATE v0.6.0
function setNumber(r, c, v) {
    if (!currentPuzzle) return;
    if (hintBoard?.[r][c]) return; // Tipp-Zellen sind gesperrt

    const n = currentPuzzle.solution.length;
    if (v < 0 || v > n) return;

    // Batch-State: Hauptzelle + alle Notiz-Zellen in Zeile/Spalte die v enthalten
    const changes = [{
        r, c,
        prevValue: userBoard[r][c],
        prevNotes: new Set(notesBoard[r][c]),
        prevHint:  hintBoard[r][c],
        nextValue: v,
        nextNotes: new Set(),
        nextHint:  false,
    }];
    if (v !== 0) {
        for (let i = 0; i < n; i++) {
            if (i !== c && notesBoard[r][i].has(v)) {
                changes.push({ r, c: i, prevValue: userBoard[r][i], prevNotes: new Set(notesBoard[r][i]), prevHint: hintBoard[r][i], nextValue: userBoard[r][i], nextNotes: new Set([...notesBoard[r][i]].filter(x => x !== v)), nextHint: hintBoard[r][i] });
            }
            if (i !== r && notesBoard[i][c].has(v)) {
                changes.push({ r: i, c, prevValue: userBoard[i][c], prevNotes: new Set(notesBoard[i][c]), prevHint: hintBoard[i][c], nextValue: userBoard[i][c], nextNotes: new Set([...notesBoard[i][c]].filter(x => x !== v)), nextHint: hintBoard[i][c] });
            }
        }
    }
    saveStateBatch(changes);
    if (v !== 0) updateMoveCount(1);
    userBoard[r][c] = v;

    const cell = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (!valSpan) return;

    if (v === 0) {
        valSpan.textContent = '';
    } else {
        valSpan.textContent = String(v);
    }

    notesBoard[r][c].clear();
    updateNotesDisplay(r, c);

    // Notes in Zeile/Spalte updaten
    for (let i = 0; i < n; i++) {
        if (i !== c && notesBoard[r][i].has(v)) {
            notesBoard[r][i].delete(v);
            updateNotesDisplay(r, i);
        }
        if (i !== r && notesBoard[i][c].has(v)) {
            notesBoard[i][c].delete(v);
            updateNotesDisplay(i, c);
        }
    }

    cell?.classList.remove('invalid', 'correct');
    validateAll();
    commitState(r, c); // ← Zustand nach Änderung speichern

    // Alle Zellen voll aber falsch → Error-Flash
    if (v !== 0 && !timerStopped) {
        const allFilled = userBoard.every(row => row.every(val => val !== 0));
        if (allFilled) {
            const allCorrect = userBoard.every((row, r2) => row.every((val, c2) => val === currentPuzzle.solution[r2][c2]));
            if (!allCorrect) showErrorFlash();
        }
    }

    // Console-Cursor aktualisieren
    if (document.documentElement.getAttribute('data-theme') === 'console') {
        cell?.querySelector('.cell-cursor')?.remove();
        const hasNotes = cell?.querySelector('.note.active') !== null;
        if (v === 0 && !hasNotes && cell?.classList.contains('selected')) {
            const cursor = document.createElement('div');
            cursor.className = 'cell-cursor';
            cell.appendChild(cursor);
        }
    }
}


// 9. NOTIZ TOGGELN / SAVE STATE v0.6.0
function toggleNote(r, c, v) {
    if (!currentPuzzle) return;
    if (hintBoard?.[r][c]) return; // Tipp-Zellen sind gesperrt
    const n = currentPuzzle.solution.length;
    if (v < 1 || v > n) return;
    if (userBoard[r][c] !== 0) return;

    // Neues Notes-Set vorausberechnen
    const newNotes = new Set(notesBoard[r][c]);
    if (newNotes.has(v)) { newNotes.delete(v); } else { newNotes.add(v); }
    saveState(r, c, userBoard[r][c], newNotes);
    const notes = notesBoard[r][c];
    if (notes.has(v)) {
        notes.delete(v);
    } else {
        notes.add(v);
    }
    updateNotesDisplay(r, c);
    commitState(r, c); // ← Zustand nach Änderung speichern
    // Console-Cursor: ausblenden wenn Notizen vorhanden, einblenden wenn keine mehr
    if (document.documentElement.getAttribute('data-theme') === 'console') {
        const cell = getCell(r, c);
        if (cell?.classList.contains('selected')) {
            cell.querySelector('.cell-cursor')?.remove();
            const hasNotes = cell.querySelector('.note.active') !== null;
            if (!hasNotes) {
                const cursor = document.createElement('div');
                cursor.className = 'cell-cursor';
                cell.appendChild(cursor);
            }
        }
    }
}

function updateNotesDisplay(r, c) {
    const cell = getCell(r, c);
    if (!cell) return;
    const notes = notesBoard[r][c];
    cell.querySelectorAll('.note').forEach(el => {
        const v = parseInt(el.dataset.v, 10);
        el.classList.toggle('active', notes.has(v));
    });
}

function updateMoveCount(delta = 1) {
    moveCount = Math.max(0, moveCount + delta);
    const el = document.getElementById('move-count');
    if (el) el.textContent = moveCount;
    if (!timerVisible) updateTimerBtn();
}

// 10. VALIDIERUNG
function updateProgress() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;
    const total = n * n;
    const filled = userBoard.reduce((sum, row) =>
        sum + row.filter(v => v !== 0).length, 0);
    const pct = Math.round((filled / total) * 100);

    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) {
        bar.style.width = `${pct}%`;
        bar.classList.toggle('complete', filled === total);
    }
    if (text) text.textContent = `${filled} / ${total} (${pct}%)`;

}

// ── ERROR FLASH (alle Themes) ────────────────────────────────
let _errorCooldown = false;

function showErrorFlash() {
    if (_errorCooldown) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'default';
    if (theme === 'console') { showConsoleError(); return; }

    _errorCooldown = true;

    const isDark = theme === 'dark';

    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        `background:${isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)'}`,
        'display:flex', 'flex-direction:column',
        'align-items:center', 'justify-content:center',
        'pointer-events:none', 'opacity:0',
        'transition:opacity 0.5s ease',
        'backdrop-filter:blur(2px)',
    ].join(';');

    const titleColor   = isDark ? '#ff8888' : '#aa0000';
    const titleShadow  = isDark ? '0 0 20px rgba(255,100,100,0.5)' : 'none';
    const subtitleColor= isDark ? '#cc6666' : '#cc3333';
    const borderColor  = isDark ? 'rgba(255,100,100,0.3)' : 'rgba(170,0,0,0.2)';

    const title    = isDark ? 'Nicht ganz richtig.' : 'Nicht korrekt.';
    const subtitle = isDark ? 'Noch nicht alle Zellen stimmen.' : 'Es sind noch Fehler vorhanden.';

    overlay.innerHTML = `
        <div style="
            border:1px solid ${borderColor};
            border-radius:12px;
            padding:2rem 3rem;
            text-align:center;
            background:${isDark ? 'rgba(40,20,20,0.9)' : 'rgba(255,245,245,0.95)'};
            box-shadow:${isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 4px 24px rgba(170,0,0,0.1)'};
        ">
            <div style="font-size:2rem;margin-bottom:0.5rem;">✗</div>
            <div style="font-family:inherit;font-size:1.3rem;font-weight:600;color:${titleColor};text-shadow:${titleShadow};margin-bottom:0.4rem;">${title}</div>
            <div style="font-size:0.85rem;color:${subtitleColor};opacity:0.85;">${subtitle}</div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    setTimeout(() => {
        overlay.style.transition = 'opacity 0.6s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            setTimeout(() => { _errorCooldown = false; }, 1500);
        }, 600);
    }, 1800);
}

function showConsoleError() {
    if (_errorCooldown) return;
    _errorCooldown = true;

    // Overlay-Element erstellen
    const overlay = document.createElement('div');
    overlay.id = 'console-error-overlay';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        'background:rgba(0,0,0,0.88)', 'display:flex',
        'flex-direction:column', 'align-items:center', 'justify-content:center',
        'pointer-events:none', 'opacity:0',
        'transition:opacity 0.5s ease'
    ].join(';');

    overlay.innerHTML = `
        <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(3rem,10vw,7rem);font-weight:bold;color:#ff2020;text-shadow:0 0 30px #ff2020,0 0 60px rgba(255,32,32,0.4);letter-spacing:8px;">ERROR</div>
        <div style="width:240px;height:1px;background:#ff2020;opacity:0.4;margin:1rem 0;"></div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.7rem,2vw,1rem);color:#cc0000;text-shadow:0 0 8px #ff2020;letter-spacing:2px;">not all cells correct</div>
    `;

    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });

    // Fade out nach 1.8s
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.6s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            setTimeout(() => { _errorCooldown = false; }, 1500);
        }, 600);
    }, 1800);
}

function validateAll() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;

    // Immer invalid/correct resetten
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            getCell(r, c)?.classList.remove('invalid', 'correct');
        }
    }

    // Visuelle Validierung nur wenn aktiv
    if (validationActive) {
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = getCell(r, c);
                if (!cell) continue;
                const v = userBoard[r][c];
                if (v !== 0) {
                    if (v === currentPuzzle.solution[r][c]) {
                        cell.classList.add('correct');
                    } else {
                        cell.classList.add('invalid');
                    }
                }
            }
        }
    }

    // Gewinn-Prüfung läuft IMMER, unabhängig von validationActive
    const allFilled = userBoard.every(row => row.every(v => v !== 0));
    const allCorrect = allFilled && userBoard.every((row, r) => row.every((v, c) => v === currentPuzzle.solution[r][c]));


    if (allCorrect && !timerStopped) {
        stopTimer();
        const timeStr = formatTime(elapsedSeconds);
        const diff = document.getElementById('difficulty').value;
        const n = currentPuzzle.solution.length;
        window._isDirty = false;
        if (window._dailyMode && window._dailyDateKey) {
            const dTimeStr = formatTime(elapsedSeconds);
            markDailySolved(window._dailyDateKey, dTimeStr);
            window._dailyMode = false;
            const dBtn = document.getElementById('btn-daily');
            if (dBtn) { dBtn.dataset.solved = 'true'; dBtn.title = `Tägliches Rätsel – heute bereits gelöst (${dTimeStr})`; }
        }
        setStatus(`${n}×${n} gelöst!`);
        const allHints = hintBoard && userBoard.every((row,r)=>row.every((v,c)=>v===0||hintBoard[r][c]));
        const isNewBest = recordSolve(n, diff, elapsedSeconds, moveCount);
        showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints, isNewBest);
        if (timerVisible) saveToLeaderboard(elapsedSeconds, n, diff, currentPuzzle.seed);
    }
    updateProgress();
}

// 11. MODI UMSCHALTEN
function setNotesMode(active) {
    notesMode = active;
    if (typeof numpadModule !== 'undefined') numpadModule.syncNotesBtn();
    const btn = document.getElementById('btn-notes');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
}

function setValidationMode(active) {
    // Im Timer-Modus keine Validierung erlaubt
    if (timerVisible && active) return;
    validationActive = active;
    if (active) {
        competitiveBlocked = true;
        updateTimerBtn();
        // Prüfen ob falsche Zahlen vorhanden sind
        if (currentPuzzle) {
            const n = currentPuzzle.solution.length;
            let wrongCount = 0;
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    if (userBoard[r][c] !== 0 && userBoard[r][c] !== currentPuzzle.solution[r][c]) wrongCount++;
                }
            }
            if (wrongCount > 0) {
                const msg = document.getElementById('clear-invalid-msg');
                if (msg) msg.textContent = wrongCount === 1
                    ? '1 falsche Zahl gefunden. Löschen?'
                    : `${wrongCount} falsche Zahlen gefunden. Löschen?`;
                document.getElementById('clear-invalid-overlay')?.classList.add('visible');
            }
        }
    }
    const btn = document.getElementById('btn-validate');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    validateAll();
}

function clearInvalidCells() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;
    const changes = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (userBoard[r][c] !== 0 && userBoard[r][c] !== currentPuzzle.solution[r][c]) {
                changes.push({
                    r, c,
                    prevValue: userBoard[r][c],
                    prevNotes: new Set(notesBoard[r][c]),
                    prevHint:  hintBoard[r][c],
                    nextValue: 0,
                    nextNotes: new Set(notesBoard[r][c]),
                    nextHint:  false,
                });
            }
        }
    }
    if (changes.length === 0) return;
    saveStateBatch(changes);
    for (const ch of changes) applyCell(ch.r, ch.c, 0, ch.nextNotes, false);
    validateAll();
    const statusEl = document.getElementById('status');
    if (statusEl) setStatus(`${changes.length} falsche ${changes.length === 1 ? 'Zahl' : 'Zahlen'} gelöscht.`);
}


function updateTimerBtn() {
    const btn = document.getElementById('btn-timer');
    if (!btn) return;
    const blocked = moveCount > 0 || competitiveBlocked;
    btn.disabled = !timerVisible && blocked;
    btn.title = blocked && !timerVisible
        ? 'Wettkampf-Modus nicht mehr aktivierbar (Züge oder Hilfe bereits genutzt)'
        : 'Wettkampf-Modus (Zeit wird für Leaderboard gespeichert)';
    btn.style.opacity = (!timerVisible && blocked) ? '0.35' : '';
    btn.style.cursor = (!timerVisible && blocked) ? 'not-allowed' : '';
}

function showCountdown(onComplete) {
    // Board während Countdown sperren
    const boardEl = document.getElementById('board');
    if (boardEl) boardEl.style.pointerEvents = 'none';

    const theme = document.documentElement.getAttribute('data-theme') || 'default';
    const isConsole = theme === 'console';
    const isDark = theme === 'dark';

    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        'display:flex', 'align-items:center', 'justify-content:center',
        'pointer-events:none',
        `background:${isConsole ? 'rgba(0,0,0,0.7)' : isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)'}`,
        'backdrop-filter:blur(2px)',
    ].join(';');

    const numEl = document.createElement('div');
    const baseStyle = [
        'font-weight:bold',
        `font-family:${isConsole ? "'Share Tech Mono', monospace" : 'inherit'}`,
        'font-size:clamp(5rem,20vw,12rem)',
        'line-height:1',
        'transition:transform 0.1s ease, opacity 0.15s ease',
    ].join(';');
    numEl.style.cssText = baseStyle;
    overlay.appendChild(numEl);
    document.body.appendChild(overlay);

    const colors = {
        console: ['#00ff41', '#00cc35', '#009922'],
        dark:    ['#e2e8f0', '#94a3b8', '#64748b'],
        default: ['#1a1a1a', '#555', '#999'],
    };
    const themeColors = colors[isConsole ? 'console' : isDark ? 'dark' : 'default'];

    let count = 3;

    function tick() {
        if (count === 0) {
            overlay.style.transition = 'opacity 0.2s ease';
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); if (boardEl) boardEl.style.pointerEvents = ''; onComplete(); }, 200);
            return;
        }

        numEl.style.opacity = '0';
        numEl.style.transform = 'scale(1.4)';
        numEl.textContent = isConsole ? count + '_' : count;
        numEl.style.color = themeColors[3 - count] || themeColors[2];
        if (isConsole) numEl.style.textShadow = `0 0 30px ${themeColors[0]}`;

        requestAnimationFrame(() => {
            numEl.style.opacity = '1';
            numEl.style.transform = 'scale(1)';
        });

        count--;
        setTimeout(tick, 800);
    }

    tick();
}

function setTimerVisible(active) {
    // Wettkampf-Modus nur aktivierbar wenn noch kein Zug gemacht und keine Hilfe genutzt
    if (active && (moveCount > 0 || competitiveBlocked)) return;
    timerVisible = active;
    const btn = document.getElementById('btn-timer');
    if (btn) btn.dataset.active = active ? 'true' : 'false';

    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = active ? formatTime(elapsedSeconds) : '';
    if (active) updateTimerDisplay();
    updateTimerBtn();

    // Timer-Modus aktiv: Validierung deaktivieren und sperren
    const btnValidate = document.getElementById('btn-validate');
    const btnHint = document.getElementById('btn-hint');
    if (active) {
        setValidationMode(false);
        if (btnValidate) btnValidate.disabled = true;
        if (btnHint) btnHint.disabled = true;
    } else {
        if (btnValidate) btnValidate.disabled = false;
        if (btnHint) btnHint.disabled = false;
    }
}

// 12. UNDO/REDO FUNKTIONEN v0.6.0
// Jeder History-Eintrag ist ein Batch von Zell-Änderungen (Array),
// damit setNumber + Notiz-Löschungen in Zeile/Spalte als eine Undo-Einheit behandelt werden.
function saveStateBatch(changes) {
    // changes: [{r, c, prevValue, prevNotes, prevHint, nextValue, nextNotes, nextHint}]
    redoStack = [];
    history.push(changes);
    if (history.length > MAX_HISTORY) history.shift();
    updateUndoRedoButtons();
}

// Einzelne Zelle speichern (Notiz-Toggle)
function saveState(r, c, newValue, newNotes) {
    saveStateBatch([{
        r, c,
        prevValue: userBoard[r][c],
        prevNotes: new Set(notesBoard[r][c]),
        prevHint:  hintBoard[r][c],
        nextValue: newValue,
        nextNotes: new Set(newNotes),
        nextHint:  false,
    }]);
}

function commitState(r, c) {}

function applyCell(r, c, value, notes, isHint) {
    userBoard[r][c]  = value;
    notesBoard[r][c] = new Set(notes);
    hintBoard[r][c]  = isHint;
    const cell    = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (valSpan) valSpan.textContent = value === 0 ? '' : String(value);
    cell?.classList.toggle('hint', isHint);
    updateNotesDisplay(r, c);
    cell?.classList.remove('invalid', 'correct');
}

function undo() {
    if (history.length === 0 || !currentPuzzle) return;
    const batch = history.pop();
    redoStack.push(batch);
    for (const s of batch) applyCell(s.r, s.c, s.prevValue, s.prevNotes, s.prevHint);
    validateAll();
    updateUndoRedoButtons();
}

function redo() {
    if (redoStack.length === 0 || !currentPuzzle) return;
    const batch = redoStack.pop();
    history.push(batch);
    for (const s of batch) applyCell(s.r, s.c, s.nextValue, s.nextNotes, s.nextHint);
    validateAll();
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = history.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}


// 13. TASTATUR-STEUERUNG (Ctrl+Z/Y hinzugefügt)
document.addEventListener('keydown', (e) => {
    if (!currentPuzzle) return;
    if (document.activeElement?.id === 'seed-input') return;
    if (typeof tutorialModule !== 'undefined' && tutorialModule.isActive()) return;

    const n = currentPuzzle.solution.length;

    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'z':
                e.preventDefault();
                undo();
                return;
            case 'y':
                e.preventDefault();
                redo();
                return;
        }
    }

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            selectCell((selected.r - 1 + n) % n, selected.c);
            return;
        case 'ArrowDown':
            e.preventDefault();
            selectCell((selected.r + 1) % n, selected.c);
            return;
        case 'ArrowLeft':
            e.preventDefault();
            selectCell(selected.r, (selected.c - 1 + n) % n);
            return;
        case 'ArrowRight':
            e.preventDefault();
            selectCell(selected.r, (selected.c + 1) % n);
            return;
        case 'n':
        case 'N':
            setNotesMode(!notesMode);
            return;
        case 'v':
        case 'V':
            setValidationMode(!validationActive);
            return;
        case 'Backspace':
        case 'Delete':
            e.preventDefault();
            setNumber(selected.r, selected.c, 0);
            return;
    }

    // 1-9
    if (/^[1-9]$/.test(e.key)) {
        const v = parseInt(e.key, 10);
        if (v > n) return;
        e.preventDefault();
        if (notesMode) {
            toggleNote(selected.r, selected.c, v);
        } else {
            setNumber(selected.r, selected.c, v);
        }
    }
});

// 14. TIPP-FUNKTION
function giveHint() {
    if (!currentPuzzle) return;
    if (timerVisible) return;

    const n = currentPuzzle.solution.length;
    let r = selected.r;
    let c = selected.c;

    if (userBoard[r][c] === currentPuzzle.solution[r][c]) {
        const candidates = [];
        for (let rr = 0; rr < n; rr++) {
            for (let cc = 0; cc < n; cc++) {
                if (userBoard[rr][cc] !== currentPuzzle.solution[rr][cc]) {
                    candidates.push({ r: rr, c: cc });
                }
            }
        }
        if (candidates.length === 0) return;
        ({ r, c } = candidates[Math.floor(Math.random() * candidates.length)]);
    }

    saveState(r, c, currentPuzzle.solution[r][c], new Set());
    updateMoveCount(1);
    const hintVal = currentPuzzle.solution[r][c];
    userBoard[r][c]  = hintVal;
    notesBoard[r][c].clear();
    hintBoard[r][c]  = true;
    competitiveBlocked = true;
    if (!timerVisible) updateTimerBtn();

    // Kollidierende Notizen in Zeile und Spalte löschen
    const hintN = currentPuzzle.solution.length;
    for (let i = 0; i < hintN; i++) {
        if (i !== c && notesBoard[r][i].has(hintVal)) {
            notesBoard[r][i].delete(hintVal);
            updateNotesDisplay(r, i);
        }
        if (i !== r && notesBoard[i][c].has(hintVal)) {
            notesBoard[i][c].delete(hintVal);
            updateNotesDisplay(i, c);
        }
    }

    const cell    = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (valSpan) valSpan.textContent = String(hintVal);
    cell?.classList.add('hint');
    updateNotesDisplay(r, c);
    selectCell(r, c);
    validateAll();
    commitState(r, c);
}


// 15. INITIALISIERUNG
window.addEventListener('DOMContentLoaded', () => {
    const sizeEl = document.getElementById('size');
    const diffEl = document.getElementById('difficulty');
    const btnNew = document.getElementById('btn-new');
    const btnSolve = document.getElementById('btn-solve');
    const btnNotes = document.getElementById('btn-notes');
    const btnValidate = document.getElementById('btn-validate');
    const btnTimer = document.getElementById('btn-timer');
    const btnReset = document.getElementById('btn-reset');
    const statusEl = document.getElementById('status');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const seedInput = document.getElementById('seed-input');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (redoBtn) redoBtn.addEventListener('click', redo);
    updateUndoRedoButtons(); // Initial

    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

    function newPuzzle(forceSeed = null) {
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
                syncCustomSelect('size', String(n));
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
            if (timerVisible) {
                showCountdown(() => startTimer());
            } else {
                startTimer();
            }
            setStatus(`${n}×${n} ${diffLabels[diff]}`);
            btnSolve.disabled = false;
            btnNew.disabled = false;
            btnNew.textContent = 'Neues Rätsel';
            return;
        }

        btnNew.disabled = true;
        btnNew.textContent = 'Generiere...';
        setStatus(`Generiere ${n}x${n}-Rätsel ${diffLabels[diff]}…`);

        generationWorker = new Worker('worker.js');
        generationWorker.onmessage = function(e) {
            generationWorker = null;
            if (e.data.success) {
                currentPuzzle = { solution: e.data.solution, cages: e.data.cages, seed: fullSeedStr };
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
                if (timerVisible) {
                    showCountdown(() => startTimer());
                } else {
                    startTimer();
                }
                setStatus(`${n}×${n} ${diffLabels[diff]}`);
                btnSolve.disabled = false;
            } else {
                setStatus('Fehler beim Generieren – bitte erneut klicken.');
            }
            btnNew.disabled = false;
            btnNew.textContent = 'Neues Rätsel';
        };
        generationWorker.onerror = function(err) {
            generationWorker = null;
            setStatus('Fehler beim Generieren – bitte erneut klicken.');
            console.error(err);
            btnNew.disabled = false;
            btnNew.textContent = 'Neues Rätsel';
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
        setStatus('Lösung angezeigt. Zeit gestoppt.');
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
    const settingsClose = document.getElementById('settings-close');
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
    if (settingsClose) settingsClose.addEventListener('click', () => {
        settingsOverlay.classList.remove('visible');
    });
    if (settingsOverlay) settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) settingsOverlay.classList.remove('visible');
    });
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });

    initTheme();
    initFontScale();
    initCustomSelects();
    updateDifficultyOptions(parseInt(document.getElementById('size')?.value ?? '4', 10));
    // Change-Listener für klassisches Theme
    document.getElementById('size')?.addEventListener('change', (e) => {
        updateDifficultyOptions(parseInt(e.target.value, 10));
    });
    initDailyButton();
    initStatsModal();
    initDebug();
    prewarmDailyPuzzle(); // Tagesrätsel im Hintergrund vorausberechnen
    tutorialModule.init();
    musicPlayer.init(); // Musik-Player initialisieren (DOM ist hier garantiert bereit)

    // Gespeicherten Spielstand automatisch laden (falls vorhanden)
    const saved = loadGameState();
    if (saved) {
        clearSavedGame();
        restoreGameState(saved);
    }

    const btnPdf = document.getElementById('btn-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', async () => {
            if (!currentPuzzle) return;
            if (window.electronAPI) {
                const n = currentPuzzle.solution.length;
                const diff = document.getElementById('difficulty').value;
                const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
                const pdfMeta = document.getElementById('pdf-meta');
                if (pdfMeta) {
                    pdfMeta.textContent = `${n}×${n}  ·  ${diffLabels[diff]}  ·  ID: ${currentPuzzle.seed}`;
                }
                const result = await window.electronAPI.exportPDF();
                if (result?.success) {
                    setStatus('PDF gespeichert.');
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
            setStatus('Rätsel zurückgesetzt.');
            selectCell(0, 0);
            history = [];
            redoStack = [];
            moveCount = 0;
            const moveEl = document.getElementById('move-count');
            if (moveEl) moveEl.textContent = '0';
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

        // ── AUTO-UPDATER ──────────────────────────────────────────────
        if (window.electronAPI) {
            window.electronAPI.onUpdateAvailable((version) => {
                showUpdateBanner(
                    `Version ${version} verfügbar.`,
                    'download',
                    version
                );
            });
            window.electronAPI.onUpdateDownloaded((version) => {
                showUpdateBanner(
                    `Version ${version} bereit.`,
                    'install',
                    version
                );
            });
        }
});

// Stub für später (Leaderboard)
function saveToLeaderboard(seconds, size, difficulty, seed) {
    // TODO: localStorage-Einträge verwalten
    console.log('Leaderboard-Eintrag:', formatTime(seconds), `${size}x${size}`, difficulty, seed);
}

// ── UPDATE-BANNER ─────────────────────────────────────────────────
function showUpdateBanner(message, mode, version) {
    let banner = document.getElementById('update-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'update-banner';
        banner.className = 'update-banner';
        // Einmalig beim Erstellen setzen – nie doppelt
        banner.addEventListener('click', (e) => {
            if (e.target === banner) banner.classList.remove('visible');
        });
        document.body.appendChild(banner);
    }

    banner.innerHTML = '';

    const inner = document.createElement('div');
    inner.className = 'update-banner-inner';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'update-banner-close';
    closeBtn.title = 'Schließen';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => banner.classList.remove('visible'));
    inner.appendChild(closeBtn);

    const msg = document.createElement('span');
    msg.className = 'update-banner-msg';
    msg.textContent = message;
    inner.appendChild(msg);

    const buttons = document.createElement('div');
    buttons.className = 'update-banner-buttons';

    if (mode === 'download') {
        const btnYes = document.createElement('button');
        btnYes.className = 'update-banner-btn';
        btnYes.textContent = 'Herunterladen';
        btnYes.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.startUpdateDownload();
            msg.textContent = `Version ${version} wird heruntergeladen…`;
            buttons.innerHTML = '';

            // Ladebalken nur im Console-Theme
            if (document.documentElement.getAttribute('data-theme') === 'console') {
                const progressWrap = document.createElement('div');
                progressWrap.className = 'update-progress-wrap';

                const progressBar = document.createElement('span');
                progressBar.className = 'update-progress-bar';

                const progressSpeed = document.createElement('span');
                progressSpeed.className = 'update-progress-speed';

                progressWrap.appendChild(progressBar);
                progressWrap.appendChild(progressSpeed);
                inner.appendChild(progressWrap);

                // Breite einmal nach DOM-Einfügung messen
                const charPx = 9;
                const BARS   = Math.max(10, Math.floor((progressWrap.offsetWidth - 10) / charPx) - 6);

                function renderBar(percent, kbps) {
                    const filled = Math.round((percent / 100) * BARS);
                    const cursor = percent < 100 ? '▌' : '';
                    const empty  = BARS - filled - (cursor ? 1 : 0);
                    progressBar.textContent =
                        `[${`█`.repeat(filled)}${cursor}${`░`.repeat(Math.max(0, empty))}] ${String(percent).padStart(3)}%`;
                    progressSpeed.textContent = percent < 100
                        ? `${kbps} kb/s`
                        : 'abgeschlossen.';
                }

                renderBar(0, 0);

                if (window.electronAPI) {
                    window.electronAPI.onUpdateProgress((percent) => {
                        const kbps = Math.floor(Math.random() * 400 + 800);
                        renderBar(percent, kbps);
                    });
                }
            }
        });

        const btnNo = document.createElement('button');
        btnNo.className = 'update-banner-btn update-banner-btn--ghost';
        btnNo.textContent = 'Später';
        btnNo.addEventListener('click', () => banner.classList.remove('visible'));

        buttons.appendChild(btnYes);
        buttons.appendChild(btnNo);
    }

    if (mode === 'install') {
        const btn = document.createElement('button');
        btn.className = 'update-banner-btn';
        btn.textContent = 'Jetzt neu starten';
        btn.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.installUpdateNow();
        });
        buttons.appendChild(btn);
    }

    inner.appendChild(buttons);
    banner.appendChild(inner);

    banner.classList.add('visible');
}
// ── TUTORIAL ──────────────────────────────────────────────────────
const tutorialModule = (() => {
    let slide = 0;
    let board = null;
    let sel   = null;
    let _active = false;

    const SOL = [[1,2,3],[2,3,1],[3,1,2]];
    const CID = [[0,1,1],[0,2,3],[4,2,3]]; // Cage-ID pro Zelle
    const LABELS = {'0,0':'3+','0,1':'5+','1,1':'4+','1,2':'3+','2,0':'3'};

    const SLIDES = [
        {
            title: 'Das Spielprinzip',
            body: `<p>Numori ist ein Logik-Rätsel auf einem <strong>n×n-Gitter</strong>. Fülle jede Zeile und jede Spalte mit den Zahlen <strong>1 bis n</strong> – jede Zahl genau einmal pro Zeile und Spalte.</p>
<div class="tut-latin-wrap">
  <div class="tut-latin">
    <div class="tut-latin-row"><span>1</span><span>2</span><span>3</span></div>
    <div class="tut-latin-row"><span>2</span><span>3</span><span>1</span></div>
    <div class="tut-latin-row"><span>3</span><span>1</span><span>2</span></div>
  </div>
  <p class="tut-hint">↑ Jede Zahl kommt in jeder Zeile und Spalte genau einmal vor.</p>
</div>`
        },
        {
            title: 'Käfige & Operationen',
            body: `<p>Das Gitter ist in farbige <strong>Käfige</strong> unterteilt. Jeder Käfig zeigt oben links eine Zahl mit einer Rechenoperation – die Zahlen im Käfig müssen zusammen das Ergebnis ergeben.</p>
<ul class="tut-ops">
  <li><strong>6+</strong><span>Summe ist 6 <em>(z.B. 1+2+3)</em></span></li>
  <li><strong>2−</strong><span>Differenz ist 2 <em>(z.B. 3−1)</em></span></li>
  <li><strong>12×</strong><span>Produkt ist 12 <em>(z.B. 3×4)</em></span></li>
  <li><strong>3:</strong><span>Quotient ist 3 <em>(z.B. 6:2)</em></span></li>
  <li><strong>4=</strong><span>Zelle enthält genau die 4</span></li>
</ul>`
        },
        {
            title: 'Nützliche Funktionen',
            body: `<div class="tut-features">
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
    <div><strong>Sofort-Validierung</strong><span>Markiert Fehler sofort beim Eingeben. Gut zum Üben – sperrt aber den Wettkampf-Modus.</span></div>
  </div>
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    <div><strong>Wettkampf-Modus</strong><span>Startet den Timer für die Bestenliste. Vor der ersten Eingabe aktivieren – Tipps und Validierung sperren ihn.</span></div>
  </div>
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
    <div><strong>Rätsel-ID</strong><span>Jedes Rätsel hat eine eindeutige ID. Eingeben um ein bekanntes Rätsel erneut zu laden oder mit anderen zu teilen.</span></div>
  </div>
</div>`
        }
    ];

    function hasCageNb(r, c, dr, dc) {
        const nr = r+dr, nc = c+dc;
        if (nr<0||nr>2||nc<0||nc>2) return false;
        return CID[r][c] === CID[nr][nc];
    }

    function gcell(r, c) {
        return document.querySelector(`#tut-board .tcell[data-r="${r}"][data-c="${c}"]`);
    }

    function buildBoard() {
        board = [[0,0,0],[0,0,0],[0,0,0]];
        sel   = null;
        const el = document.getElementById('tut-board');
        if (!el) return;
        el.innerHTML = '';
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cell = document.createElement('div');
                cell.className = 'tcell';
                cell.dataset.r = r; cell.dataset.c = c;
                if (!hasCageNb(r,c,-1, 0)) cell.classList.add('ct');
                if (!hasCageNb(r,c, 0, 1)) cell.classList.add('cr');
                if (!hasCageNb(r,c, 1, 0)) cell.classList.add('cb');
                if (!hasCageNb(r,c, 0,-1)) cell.classList.add('cl');
                const lbl = LABELS[`${r},${c}`];
                if (lbl) {
                    const s = document.createElement('span');
                    s.className = 'tcell-lbl'; s.textContent = lbl;
                    cell.appendChild(s);
                }
                const vs = document.createElement('span');
                vs.className = 'tcell-val';
                cell.appendChild(vs);
                cell.addEventListener('click', () => selCell(r, c));
                el.appendChild(cell);
            }
        }
    }

    function selCell(r, c) {
        document.querySelectorAll('#tut-board .tcell.tsel').forEach(el => el.classList.remove('tsel'));
        sel = {r, c};
        gcell(r, c)?.classList.add('tsel');
        syncNumpad();
    }

    function syncNumpad() {
        const v = sel ? board[sel.r][sel.c] : 0;
        document.querySelectorAll('#tut-numpad .tnpb').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.v) === v);
        });
    }

    function setVal(v) {
        if (!sel) return;
        const {r, c} = sel;
        board[r][c] = v;
        const vs = gcell(r,c)?.querySelector('.tcell-val');
        if (vs) vs.textContent = v ? String(v) : '';
        gcell(r,c)?.classList.remove('terror');
        syncNumpad();
        checkWin();
    }

    function checkWin() {
        if (!board.every(row => row.every(v => v !== 0))) return;
        const ok = board.every((row, r) => row.every((v, c) => v === SOL[r][c]));
        if (ok) { setTimeout(showSuccess, 400); return; }
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++)
                if (board[r][c] !== SOL[r][c]) gcell(r,c)?.classList.add('terror');
    }

    function showSuccess() {
        document.getElementById('tut-puzzle').style.display  = 'none';
        document.getElementById('tut-success').style.display = 'flex';
    }

    function renderSlide() {
        const s = SLIDES[slide];
        const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
        const t = document.getElementById('tut-stitle');
        const b = document.getElementById('tut-sbody');
        if (t) t.textContent = isConsole ? s.title.toLowerCase() : s.title;
        if (b) b.innerHTML  = s.body;
        document.querySelectorAll('.tut-dot').forEach((d, i) => d.classList.toggle('active', i === slide));
        const back = document.getElementById('tut-back');
        if (back) back.style.visibility = slide === 0 ? 'hidden' : 'visible';
        const next = document.getElementById('tut-next');
        if (next) next.textContent = slide === SLIDES.length - 1 ? 'Los geht\'s →' : 'Weiter →';
    }

    function show() {
        _active = true; slide = 0;
        const ov = document.getElementById('tut-overlay');
        if (!ov) return;
        document.getElementById('tut-slides').style.display  = 'flex';
        document.getElementById('tut-puzzle').style.display  = 'none';
        document.getElementById('tut-success').style.display = 'none';
        renderSlide();
        ov.classList.add('visible');
    }

    function hide() {
        _active = false;
        document.getElementById('tut-overlay')?.classList.remove('visible');
        localStorage.setItem('numori-tutorial-seen', 'true');
    }

    function isActive() { return _active; }

    function init() {
        // Erster Start → Abfrage anzeigen
        if (!localStorage.getItem('numori-tutorial-seen')) {
            document.getElementById('tut-welcome')?.classList.add('visible');
            document.getElementById('tut-w-yes')?.addEventListener('click', () => {
                document.getElementById('tut-welcome').classList.remove('visible');
                localStorage.setItem('numori-tutorial-seen', 'true');
            });
            document.getElementById('tut-w-no')?.addEventListener('click', () => {
                document.getElementById('tut-welcome').classList.remove('visible');
                show();
            });
        }

        // Tutorial-Button in den Einstellungen
        document.getElementById('btn-tutorial')?.addEventListener('click', () => {
            document.getElementById('settings-overlay')?.classList.remove('visible');
            show();
        });

        // Slide-Navigation
        document.getElementById('tut-back')?.addEventListener('click', () => {
            if (slide > 0) { slide--; renderSlide(); }
        });
        document.getElementById('tut-next')?.addEventListener('click', () => {
            if (slide < SLIDES.length - 1) { slide++; renderSlide(); }
            else {
                document.getElementById('tut-slides').style.display = 'none';
                document.getElementById('tut-puzzle').style.display = 'flex';
                buildBoard();
            }
        });

        document.querySelectorAll('.tut-skip').forEach(btn => btn.addEventListener('click', hide));
        document.getElementById('tut-finish')?.addEventListener('click', hide);

        // Mini-Numpad
        document.getElementById('tut-numpad')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tnpb');
            if (!btn || !sel) return;
            const v = parseInt(btn.dataset.v);
            if (!isNaN(v)) setVal(v > 0 && board[sel.r][sel.c] === v ? 0 : v);
        });

        // Tastatur – Capture-Phase damit der Haupt-Handler nicht feuert
        document.addEventListener('keydown', (e) => {
            if (!_active) return;
            if (document.getElementById('tut-puzzle')?.style.display === 'none') return;
            if (!sel) return;
            const v = parseInt(e.key);
            if (v >= 1 && v <= 3) { e.preventDefault(); e.stopImmediatePropagation(); setVal(v); return; }
            if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); e.stopImmediatePropagation(); setVal(0); return; }
            if (e.key === 'ArrowRight') { e.preventDefault(); e.stopImmediatePropagation(); selCell(sel.r, Math.min(2, sel.c+1)); return; }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); e.stopImmediatePropagation(); selCell(sel.r, Math.max(0, sel.c-1)); return; }
            if (e.key === 'ArrowDown')  { e.preventDefault(); e.stopImmediatePropagation(); selCell(Math.min(2, sel.r+1), sel.c); return; }
            if (e.key === 'ArrowUp')    { e.preventDefault(); e.stopImmediatePropagation(); selCell(Math.max(0, sel.r-1), sel.c); }
        }, true);
    }

    return { show, hide, init, isActive };
})();

// ── Zahlenpad-Overlay ─────────────────────────────────────────────
const numpadModule = (() => {
    let overlay, pad, grid, clearBtn;
    let currentScale = 1.0;


    function init() {
        overlay  = document.getElementById('numpad-overlay');
        pad      = document.getElementById('numpad');
        grid     = document.getElementById('numpad-grid');
        clearBtn = document.getElementById('numpad-clear');
        if (!overlay || !pad || !grid || !clearBtn) return;

        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof setNumber === 'function' && typeof selected !== 'undefined')
                setNumber(selected.r, selected.c, 0);
        });

        const notesBtn = document.getElementById('numpad-notes');
        if (notesBtn) {
            notesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof setNotesMode === 'function')
                    setNotesMode(!notesMode);
                syncNotesBtn();
            });
        }

        // Drag-Logik
        const titlebar = document.getElementById('numpad-titlebar');
        if (titlebar) {
            let dragX = 0, dragY = 0;
            function startDrag(clientX, clientY) {
                dragX = clientX - overlay.getBoundingClientRect().left;
                dragY = clientY - overlay.getBoundingClientRect().top;
            }
            function moveDrag(clientX, clientY) {
                let left = clientX - dragX;
                let top  = clientY - dragY;
                left = Math.max(0, Math.min(left, window.innerWidth  - overlay.offsetWidth));
                top  = Math.max(0, Math.min(top,  window.innerHeight - overlay.offsetHeight));
                overlay.style.left = left + 'px';
                overlay.style.top  = top  + 'px';
                overlay._leftPct = left / window.innerWidth;
                overlay._topPct  = top  / window.innerHeight;
                localStorage.setItem('numori-numpad-pos', JSON.stringify({
                    leftPct: overlay._leftPct, topPct: overlay._topPct
                }));
            }
            titlebar.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startDrag(e.clientX, e.clientY);
                function onMove(e) { moveDrag(e.clientX, e.clientY); }
                function onUp() {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup',   onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup',   onUp);
            });
            titlebar.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const t = e.touches[0];
                startDrag(t.clientX, t.clientY);
                function onMove(e) { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }
                function onEnd() {
                    titlebar.removeEventListener('touchmove', onMove);
                    titlebar.removeEventListener('touchend',  onEnd);
                }
                titlebar.addEventListener('touchmove', onMove, { passive: false });
                titlebar.addEventListener('touchend',  onEnd);
            }, { passive: false });
        }

        // Resize-Logik (uniform scale)
        const resizeHandle = document.getElementById('numpad-resize');
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const startX     = e.clientX;
                const startY     = e.clientY;
                const startScale = currentScale;
                const startDiag  = Math.sqrt(startX * startX + startY * startY);
                function onMove(e) {
                    const diag  = Math.sqrt(e.clientX * e.clientX + e.clientY * e.clientY);
                    const delta = (e.clientX - startX + e.clientY - startY) / 200;
                    currentScale = Math.max(0.6, Math.min(3.0, startScale + delta));
                    pad.style.transform       = `scale(${currentScale})`;
                    pad.style.transformOrigin = 'top left';
                    localStorage.setItem('numori-numpad-scale', currentScale);
                }
                function onUp() {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup',   onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup',   onUp);
            });
        }
    }

    function buildButtons(n) {
        grid.innerHTML = '';
        const cols = n <= 6 ? 3 : 4;
        grid.style.gridTemplateColumns = `repeat(${cols}, 38px)`;
        for (let v = 1; v <= n; v++) {
            const btn = document.createElement('button');
            btn.className = 'numpad-btn';
            btn.textContent = String(v);
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof selected === 'undefined') return;
                if (notesMode && typeof toggleNote === 'function') {
                    toggleNote(selected.r, selected.c, v);
                } else if (typeof setNumber === 'function') {
                    setNumber(selected.r, selected.c, v);
                }
            });
            grid.appendChild(btn);
        }
    }

    let enabled = localStorage.getItem('numori-numpad') === 'true';

    function syncNotesBtn() {
        const notesBtn = document.getElementById('numpad-notes');
        if (notesBtn) notesBtn.dataset.active = notesMode ? 'true' : 'false';
    }

    function _applyPosition() {
        // Setzt Position anhand gespeicherter Prozentwerte
        // Muss nach display:block aufgerufen werden damit offsetWidth bekannt ist
        const savedPos = JSON.parse(localStorage.getItem('numori-numpad-pos') || 'null');
        let leftPct = savedPos ? savedPos.leftPct : null;
        let topPct  = savedPos ? savedPos.topPct  : null;

        if (leftPct === null) {
            // Default: rechts neben dem Board
            const board = document.getElementById('board');
            const rect  = board ? board.getBoundingClientRect() : null;
            leftPct = rect ? (rect.right + 16) / window.innerWidth  : 0.7;
            topPct  = rect ? rect.top          / window.innerHeight : 0.2;
        }

        const left = Math.max(0, Math.min(leftPct * window.innerWidth,  window.innerWidth  - overlay.offsetWidth));
        const top  = Math.max(0, Math.min(topPct  * window.innerHeight, window.innerHeight - overlay.offsetHeight));
        overlay.style.left  = left + 'px';
        overlay.style.top   = top  + 'px';
        overlay._leftPct    = leftPct;
        overlay._topPct     = topPct;
    }

    function show(n) {
        if (!overlay || !enabled) return;
        buildButtons(n);
        syncNotesBtn();

        // Scale wiederherstellen
        const savedScale = parseFloat(localStorage.getItem('numori-numpad-scale') || '1');
        if (!isNaN(savedScale) && savedScale !== 1) {
            currentScale = savedScale;
            pad.style.transform       = `scale(${currentScale})`;
            pad.style.transformOrigin = 'top left';
        }

        overlay.style.display = 'block';
        _applyPosition();
    }

    function hide() {
        if (overlay) overlay.style.display = 'none';
    }

    function toggle() {
        enabled = !enabled;
        localStorage.setItem('numori-numpad', String(enabled));
        if (enabled && currentPuzzle) {
            show(currentPuzzle.solution.length);
        } else if (!enabled) {
            hide();
        }
        return enabled;
    }

    function isEnabled() { return enabled; }

    function reposition() {
        if (!overlay || overlay.style.display === 'none') return;
        if (overlay._leftPct === undefined) return;
        let left = overlay._leftPct * window.innerWidth;
        let top  = overlay._topPct  * window.innerHeight;
        left = Math.max(0, Math.min(left, window.innerWidth  - overlay.offsetWidth));
        top  = Math.max(0, Math.min(top,  window.innerHeight - overlay.offsetHeight));
        overlay.style.left = left + 'px';
        overlay.style.top  = top  + 'px';
    }

    return { init, show, hide, toggle, isEnabled, syncNotesBtn, reposition };
})();
// selectCell bleibt unverändert – Numpad wird über renderBoard ein/ausgeblendet

// Numpad initialisieren sobald DOM bereit
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => numpadModule.init());
} else {
    numpadModule.init();
}
