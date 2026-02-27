'use strict';

// ══ 1. OPERATOR-SYMBOLE ══════════════════════════════════════════

const OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function formatLabel(op, target) {
    if (op === '=') return String(target);
    return `${target}${OP_SYMBOL[op] ?? op}`;
}


// ══ 2. GLOBALER ZUSTAND ══════════════════════════════════════════

let currentPuzzle    = null;
let selected         = { r: 0, c: 0 };
let notesMode        = false;
let validationActive = false;
let generationWorker = null;

let userBoard  = [];
let notesBoard = [];

// ── Timer-Zustand ─────────────────────────────────────────────
let timerInterval    = null;   // setInterval-Handle
let elapsedSeconds   = 0;      // immer mitlaufen, auch wenn unsichtbar
let timerVisible     = false;  // Toggle-Status
let timerStopped     = false;  // true = Rätsel gelöst oder Lösung gezeigt
let solvedByCheat    = false;  // true = „Lösung anzeigen" wurde genutzt


// ══ 3. TIMER-FUNKTIONEN ══════════════════════════════════════════

function formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    stopTimer();                      // vorherigen sauber beenden
    elapsedSeconds = 0;
    timerStopped   = false;
    solvedByCheat  = false;
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
    timerStopped  = true;
    if (cheat) solvedByCheat = true;
}

function updateTimerDisplay() {
    const el = document.getElementById('timer-display');
    if (!el) return;
    el.textContent = formatTime(elapsedSeconds);
}

function setTimerVisible(active) {
    timerVisible = active;
    const btn = document.getElementById('btn-timer');
    const el  = document.getElementById('timer-display');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    if (el)  el.classList.toggle('hidden', !active);
}

// Stub für später – wird beim Leaderboard ausgebaut
function saveToLeaderboard(seconds, size, difficulty, seed) {
    // TODO: localStorage-Einträge verwalten
    console.log(`Leaderboard-Eintrag: ${formatTime(seconds)} | ${size}×${size} | ${difficulty} | ${seed}`);
}

// ══ 3b. GEWINN-BANNER ════════════════════════════════════════════

function showWinBanner(timeStr, size, diff, seed) {
    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
    const banner  = document.getElementById('win-banner');
    const details = document.getElementById('win-details');
    if (!banner || !details) return;

    details.textContent =
    `${size}×${size} · ${diffLabels[diff] ?? diff} · ID: ${seed} · Zeit: ${timeStr}`;

    banner.classList.add('visible');
}

function hideWinBanner() {
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    banner.classList.remove('visible');
}


// ══ 4. SEED-HILFSFUNKTIONEN ══════════════════════════════════════

function randomSeed() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

function seedToInt(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++)
        h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0;
    return h;
}


// ══ 5. BOARD-GRÖSSE ══════════════════════════════════════════════

function getBoardPx() {
    const cont = document.getElementById('board-container');
    let w = cont.clientWidth  - 28;
    let h = cont.clientHeight - 28;

    if (h <= 0) {
        const headerH  = document.querySelector('header')?.offsetHeight  ?? 58;
        const toolbarH = document.querySelector('.toolbar')?.offsetHeight ?? 52;
        const statusH  = document.querySelector('.status')?.offsetHeight  ?? 26;
        const footerH  = document.querySelector('.footer')?.offsetHeight  ?? 26;
        h = window.innerHeight - headerH - toolbarH - statusH - footerH - 28;
    }
    if (w <= 0) w = window.innerWidth - 56;
    return Math.floor(Math.min(w, h, 680));
}


// ══ 6. BOARD RENDERN ═════════════════════════════════════════════

function getCell(r, c) {
    return document.querySelector(`#board .cell[data-r="${r}"][data-c="${c}"]`);
}

function renderBoard(puzzle) {
    const n  = puzzle.solution.length;
    const el = document.getElementById('board');
    el.innerHTML = '';

    const px = getBoardPx();
    el.style.width               = px + 'px';
    el.style.height              = px + 'px';
    el.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    el.style.gridTemplateRows    = `repeat(${n}, 1fr)`;

    const cageId = Array.from({ length: n }, () => Array(n).fill(-1));
    puzzle.cages.forEach((cage, idx) => {
        cage.cells.forEach(p => { cageId[p.r][p.c] = idx; });
    });

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell     = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;

            const id = cageId[r][c];
            if (r === 0     || cageId[r-1]?.[c] !== id) cell.classList.add('bt');
            if (r === n - 1 || cageId[r+1]?.[c] !== id) cell.classList.add('bb');
            if (c === 0     || cageId[r]?.[c-1] !== id) cell.classList.add('bl');
            if (c === n - 1 || cageId[r]?.[c+1] !== id) cell.classList.add('br');

            const cage  = puzzle.cages[id];
            const first = cage.cells.reduce((m, p) =>
            !m || p.r < m.r || (p.r === m.r && p.c < m.c) ? p : m
            );
            if (first.r === r && first.c === c) {
                const lbl       = document.createElement('span');
                lbl.className   = 'cage-label';
                lbl.textContent = formatLabel(cage.op, cage.target);
                cell.appendChild(lbl);
            }

            const notesGrid     = document.createElement('div');
            notesGrid.className = 'cell-notes';
            for (let v = 1; v <= 9; v++) {
                const note       = document.createElement('span');
                note.className   = 'note';
                note.dataset.v   = v;
                note.textContent = v <= n ? String(v) : '';
                notesGrid.appendChild(note);
            }
            cell.appendChild(notesGrid);

            const valSpan     = document.createElement('span');
            valSpan.className = 'cell-value';
            cell.appendChild(valSpan);

            cell.addEventListener('click', () => selectCell(r, c));
            el.appendChild(cell);
        }
    }

    userBoard  = Array.from({ length: n }, () => Array(n).fill(0));
    notesBoard = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => new Set())
    );
    selectCell(0, 0);
}

function resizeBoard() {
    if (!currentPuzzle) return;
    const el = document.getElementById('board');
    const px = getBoardPx();
    el.style.width  = px + 'px';
    el.style.height = px + 'px';
}


// ══ 7. ZELLE AUSWÄHLEN ═══════════════════════════════════════════

function selectCell(r, c) {
    getCell(selected.r, selected.c)?.classList.remove('selected');
    selected = { r, c };
    getCell(r, c)?.classList.add('selected');
}


// ══ 8. ZAHL EINGEBEN ═════════════════════════════════════════════

function setNumber(r, c, v) {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;
    if (v < 0 || v > n) return;

    userBoard[r][c] = v;
    const cell    = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (!valSpan) return;

    if (v === 0) {
        valSpan.textContent = '';
    } else {
        valSpan.textContent = String(v);
        notesBoard[r][c].clear();
        updateNotesDisplay(r, c);

        for (let i = 0; i < n; i++) {
            if (i !== c && notesBoard[r][i].has(v)) { notesBoard[r][i].delete(v); updateNotesDisplay(r, i); }
            if (i !== r && notesBoard[i][c].has(v)) { notesBoard[i][c].delete(v); updateNotesDisplay(i, c); }
        }
    }

    cell?.classList.remove('invalid', 'correct');
    validateAll();
}


// ══ 9. NOTIZ TOGGELN ═════════════════════════════════════════════

function toggleNote(r, c, v) {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;
    if (v < 1 || v > n || userBoard[r][c] !== 0) return;
    const notes = notesBoard[r][c];
    notes.has(v) ? notes.delete(v) : notes.add(v);
    updateNotesDisplay(r, c);
}

function updateNotesDisplay(r, c) {
    const cell = getCell(r, c);
    if (!cell) return;
    const notes = notesBoard[r][c];
    cell.querySelectorAll('.note').forEach(el => {
        el.classList.toggle('active', notes.has(parseInt(el.dataset.v, 10)));
    });
}


// ══ 10. VALIDIERUNG ══════════════════════════════════════════════

function validateAll() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;

    for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
            getCell(r, c)?.classList.remove('invalid', 'correct');

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

    // Gewinn-Prüfung läuft IMMER – unabhängig von validationActive
    const allCorrect = userBoard.every((row, r) =>
    row.every((v, c) => v === currentPuzzle.solution[r][c])
    );

    if (allCorrect && !timerStopped) {
        stopTimer();
        const timeStr = formatTime(elapsedSeconds);
        const diff    = document.getElementById('difficulty').value;
        document.getElementById('status').textContent =
        `${n}×${n} · ${document.getElementById('difficulty').options[document.getElementById('difficulty').selectedIndex].text} · ID: ${currentPuzzle.seed}`;
        showWinBanner(timeStr, n, diff, currentPuzzle.seed);
        if (timerVisible) saveToLeaderboard(elapsedSeconds, n, diff, currentPuzzle.seed);
    }
}


// ══ 11. MODI UMSCHALTEN ══════════════════════════════════════════

function setNotesMode(active) {
    notesMode = active;
    const btn = document.getElementById('btn-notes');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
}

function setValidationMode(active) {
    // Im Timer-Modus keine Validierung erlaubt
    if (timerVisible && active) return;
    validationActive = active;
    const btn = document.getElementById('btn-validate');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    validateAll();
}

function setTimerVisible(active) {
    timerVisible = active;
    const btn = document.getElementById('btn-timer');
    const el  = document.getElementById('timer-display');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    if (el)  el.classList.toggle('hidden', !active);

    // Timer-Modus aktiv → Validierung deaktivieren und sperren
    const btnValidate = document.getElementById('btn-validate');
    if (active) {
        setValidationMode(false);
        if (btnValidate) btnValidate.disabled = true;
    } else {
        if (btnValidate) btnValidate.disabled = false;
    }
}


// ══ 12. TASTATURSTEUERUNG ════════════════════════════════════════

document.addEventListener('keydown', e => {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;

    if (document.activeElement?.id === 'seed-input') return;

    switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); selectCell((selected.r - 1 + n) % n, selected.c); return;
        case 'ArrowDown':  e.preventDefault(); selectCell((selected.r + 1) % n, selected.c);     return;
        case 'ArrowLeft':  e.preventDefault(); selectCell(selected.r, (selected.c - 1 + n) % n); return;
        case 'ArrowRight': e.preventDefault(); selectCell(selected.r, (selected.c + 1) % n);     return;
        case 'n': case 'N': setNotesMode(!notesMode); return;
        case 'v': case 'V': setValidationMode(!validationActive); return;
        case 'Backspace': case 'Delete':
            e.preventDefault();
            setNumber(selected.r, selected.c, 0);
            notesBoard[selected.r][selected.c].clear();
            updateNotesDisplay(selected.r, selected.c);
            return;
        default:
            if (/^[1-9]$/.test(e.key)) {
                const v = parseInt(e.key, 10);
                if (v <= n) {
                    e.preventDefault();
                    notesMode
                    ? toggleNote(selected.r, selected.c, v)
                    : setNumber(selected.r, selected.c, v);
                }
            }
    }
});


// ══ 13. INITIALISIERUNG ══════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
    const sizeEl       = document.getElementById('size');
    const diffEl       = document.getElementById('difficulty');
    const btnNew       = document.getElementById('btn-new');
    const btnSolve     = document.getElementById('btn-solve');
    const btnNotes     = document.getElementById('btn-notes');
    const btnValidate  = document.getElementById('btn-validate');
    const btnTimer     = document.getElementById('btn-timer');
    const btnReset     = document.getElementById('btn-reset');
    const statusEl     = document.getElementById('status');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel  = document.getElementById('modal-cancel');
    const seedInput    = document.getElementById('seed-input');

    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

    function newPuzzle(forceSeed) {
        const n    = parseInt(sizeEl.value, 10);
        const diff = diffEl.value;

        const seedStr = forceSeed != null
        ? String(forceSeed).trim().toUpperCase()
        : randomSeed();

        if (seedInput) seedInput.value = seedStr;

        const seedInt = seedToInt(seedStr);

        if (generationWorker) {
            generationWorker.terminate();
            generationWorker = null;
        }

        btnNew.disabled      = true;
        btnNew.textContent   = 'Generiere …';
        statusEl.textContent = `Generiere ${n}×${n}-Rätsel (${diffLabels[diff]}) … [${seedStr}]`;

        generationWorker = new Worker('worker.js');

        generationWorker.onmessage = function(e) {
            generationWorker = null;
            if (e.data.success) {
                currentPuzzle = { solution: e.data.solution, cages: e.data.cages, seed: seedStr };
                setNotesMode(false);
                requestAnimationFrame(() => {
                    renderBoard(currentPuzzle);
                    startTimer();
                    statusEl.textContent = `${n}×${n} · ${diffLabels[diff]} · ID: ${seedStr}`;
                });
            } else {
                statusEl.textContent = 'Fehler beim Generieren – bitte erneut klicken.';
            }
            btnNew.disabled    = false;
            btnNew.textContent = 'Neues Rätsel';
        };

        generationWorker.onerror = function(err) {
            generationWorker = null;
            statusEl.textContent = 'Fehler beim Generieren – bitte erneut klicken.';
            console.error(err);
            btnNew.disabled    = false;
            btnNew.textContent = 'Neues Rätsel';
        };

        generationWorker.postMessage({ n, diff, seed: seedInt });
    }

    function solveAll() {
        if (!currentPuzzle) return;
        const n = currentPuzzle.solution.length;
        stopTimer(true);
        for (let r = 0; r < n; r++)
            for (let c = 0; c < n; c++)
                setNumber(r, c, currentPuzzle.solution[r][c]);
        statusEl.textContent = 'Lösung angezeigt – Zeit gestoppt.';
    }

    btnNew.addEventListener('click', () => newPuzzle(null));
    btnSolve.addEventListener('click', solveAll);
    btnNotes.addEventListener('click', () => setNotesMode(!notesMode));
    btnValidate.addEventListener('click', () => setValidationMode(!validationActive));
    btnTimer.addEventListener('click', () => setTimerVisible(!timerVisible));

    document.getElementById('win-close').addEventListener('click', hideWinBanner);
    document.getElementById('win-new').addEventListener('click', () => {
        hideWinBanner();
        newPuzzle(null);
    });

    seedInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const raw = seedInput.value.trim();
            if (raw.length > 0) newPuzzle(raw);
        }
    });

    btnReset.addEventListener('click', () => {
        if (!currentPuzzle) return;
        modalOverlay.classList.add('visible');
    });

    modalCancel.addEventListener('click', () => {
        modalOverlay.classList.remove('visible');
    });

    modalOverlay.addEventListener('click', e => {
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
                    const cell    = getCell(r, c);
                    const valSpan = cell?.querySelector('.cell-value');
                    if (valSpan) valSpan.textContent = '';
                    cell?.classList.remove('invalid', 'correct');
                    updateNotesDisplay(r, c);
                }
            }
            startTimer();
            statusEl.textContent = 'Rätsel zurückgesetzt.';
            selectCell(0, 0);
        });

        window.addEventListener('resize', resizeBoard);
});
