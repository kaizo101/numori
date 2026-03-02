"use strict";

// 0. THEME
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    localStorage.setItem('numori-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Inputs übernehmen font-family nicht per CSS-Vererbung in Chromium
    const font = theme === 'dark' ? "'Poppins', system-ui, sans-serif" : "";
    const seedInput = document.getElementById('seed-input');
    if (seedInput) seedInput.style.fontFamily = font;
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
const OPSYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };
function formatLabel(op, target) {
    if (op && op !== '=') return `${target}${OPSYMBOL[op] ?? op}`;
    return target;
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

// 3. TIMER-FUNKTIONEN
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
function showWinBanner(timeStr, size, diff, seed) {
    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    const el = (id) => document.getElementById(id);
    if (el('win-stat-size'))  el('win-stat-size').textContent  = `${size}×${size}`;
    if (el('win-stat-diff'))  el('win-stat-diff').textContent  = diffLabels[diff] ?? diff;
    if (el('win-stat-time'))  el('win-stat-time').textContent  = timeStr;
    if (el('win-stat-seed'))  el('win-stat-seed').textContent  = seed;
    banner.classList.add('visible');
}

function hideWinBanner() {
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    banner.classList.remove('visible');
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
    return Math.floor(Math.min(w, h, 680));
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
    el.style.width = `${px}px`;
    el.style.height = `${px}px`;
}

// 7. ZELLE AUSWÄHLEN
function selectCell(r, c) {
    getCell(selected.r, selected.c)?.classList.remove('selected');
    selected = { r, c };
    getCell(r, c)?.classList.add('selected');
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
    const allCorrect = userBoard.every((row, r) => row.every((v, c) => v === currentPuzzle.solution[r][c]));
    if (allCorrect && !timerStopped) {
        stopTimer();
        const timeStr = formatTime(elapsedSeconds);
        const diff = document.getElementById('difficulty').value;
        const n = currentPuzzle.solution.length;
        document.getElementById('status').textContent = `${n}x${n} gelöst!`;
        showWinBanner(timeStr, n, diff, currentPuzzle.seed);
        if (timerVisible) saveToLeaderboard(elapsedSeconds, n, diff, currentPuzzle.seed);
    }
    updateProgress();
}

// 11. MODI UMSCHALTEN
function setNotesMode(active) {
    notesMode = active;
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
    }
    const btn = document.getElementById('btn-validate');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    validateAll();
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
    updateMoveCount(-1);
    for (const s of batch) applyCell(s.r, s.c, s.prevValue, s.prevNotes, s.prevHint);
    validateAll();
    updateUndoRedoButtons();
}

function redo() {
    if (redoStack.length === 0 || !currentPuzzle) return;
    const batch = redoStack.pop();
    history.push(batch);
    updateMoveCount(1);
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
    if (/[1-9]/.test(e.key)) {
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
    userBoard[r][c]  = currentPuzzle.solution[r][c];
    notesBoard[r][c].clear();
    hintBoard[r][c]  = true;
    competitiveBlocked = true;
    if (!timerVisible) updateTimerBtn();

    const cell    = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (valSpan) valSpan.textContent = String(currentPuzzle.solution[r][c]);
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
        if (seedInput) seedInput.value = fullSeedStr;
        const seedInt = seedToInt(rawSeed, n, diff);

        if (generationWorker) {
            generationWorker.terminate();
            generationWorker = null;
        }
        btnNew.disabled = true;
        btnNew.textContent = 'Generiere...';
        statusEl.textContent = `Generiere ${n}x${n}-Rätsel ${diffLabels[diff]} (${fullSeedStr})`;

        generationWorker = new Worker('worker.js');
        generationWorker.onmessage = function(e) {
            generationWorker = null;
            if (e.data.success) {
                currentPuzzle = { solution: e.data.solution, cages: e.data.cages, seed: fullSeedStr };
                setNotesMode(false);
                requestAnimationFrame(() => renderBoard(currentPuzzle));
                startTimer();
                statusEl.textContent = `${n}x${n} ${diffLabels[diff]} ID: ${fullSeedStr}`;
            } else {
                statusEl.textContent = 'Fehler beim Generieren – bitte erneut klicken.';
            }
            btnNew.disabled = false;
            btnNew.textContent = 'Neues Rätsel';
        };
        generationWorker.onerror = function(err) {
            generationWorker = null;
            statusEl.textContent = 'Fehler beim Generieren – bitte erneut klicken.';
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
        statusEl.textContent = 'Lösung angezeigt. Zeit gestoppt.';
    }

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
    initCustomSelects();

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
                    statusEl.textContent = 'PDF gespeichert.';
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
            statusEl.textContent = 'Rätsel zurückgesetzt.';
            selectCell(0, 0);
            history = [];
            redoStack = [];
            moveCount = 0;
            const moveEl = document.getElementById('move-count');
            if (moveEl) moveEl.textContent = '0';
            updateUndoRedoButtons();
        });

        window.addEventListener('resize', resizeBoard);
});

// Stub für später (Leaderboard)
function saveToLeaderboard(seconds, size, difficulty, seed) {
    // TODO: localStorage-Einträge verwalten
    console.log('Leaderboard-Eintrag:', formatTime(seconds), `${size}x${size}`, difficulty, seed);
}
