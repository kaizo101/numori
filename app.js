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


// ══ 3. BOARD-GRÖSSE ══════════════════════════════════════════════

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


// ══ 4. BOARD RENDERN ═════════════════════════════════════════════

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


// ══ 5. ZELLE AUSWÄHLEN ═══════════════════════════════════════════

function selectCell(r, c) {
    getCell(selected.r, selected.c)?.classList.remove('selected');
    selected = { r, c };
    getCell(r, c)?.classList.add('selected');
}


// ══ 6. ZAHL EINGEBEN ═════════════════════════════════════════════

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


// ══ 7. NOTIZ TOGGELN ═════════════════════════════════════════════

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


// ══ 8. VALIDIERUNG ═══════════════════════════════════════════════

function validateAll() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;

    for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
            getCell(r, c)?.classList.remove('invalid', 'correct');

    if (!validationActive) return;

    let allCorrect = true;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell = getCell(r, c);
            if (!cell) continue;
            const v = userBoard[r][c];
            if (v === 0) {
                allCorrect = false;
            } else if (v === currentPuzzle.solution[r][c]) {
                cell.classList.add('correct');
            } else {
                cell.classList.add('invalid');
                allCorrect = false;
            }
        }
    }
    if (allCorrect) {
        document.getElementById('status').textContent = 'Perfekt gelöst. Herzlichen Glückwunsch.';
    }
}


// ══ 9. MODI UMSCHALTEN ═══════════════════════════════════════════

function setNotesMode(active) {
    notesMode = active;
    const btn = document.getElementById('btn-notes');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
}

function setValidationMode(active) {
    validationActive = active;
    const btn = document.getElementById('btn-validate');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    validateAll();
}


// ══ 10. TASTATURSTEUERUNG ════════════════════════════════════════

document.addEventListener('keydown', e => {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;

    switch (e.key) {
        case 'ArrowUp':    e.preventDefault(); selectCell((selected.r - 1 + n) % n, selected.c); return;
        case 'ArrowDown':  e.preventDefault(); selectCell((selected.r + 1) % n, selected.c);     return;
        case 'ArrowLeft':  e.preventDefault(); selectCell(selected.r, (selected.c - 1 + n) % n); return;
        case 'ArrowRight': e.preventDefault(); selectCell(selected.r, (selected.c + 1) % n);     return;
        case 'n': case 'N': setNotesMode(!notesMode); return;
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


// ══ 11. INITIALISIERUNG ══════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
    const sizeEl       = document.getElementById('size');
    const diffEl       = document.getElementById('difficulty');
    const btnNew       = document.getElementById('btn-new');
    const btnSolve     = document.getElementById('btn-solve');
    const btnNotes     = document.getElementById('btn-notes');
    const btnValidate  = document.getElementById('btn-validate');
    const btnReset     = document.getElementById('btn-reset');
    const statusEl     = document.getElementById('status');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel  = document.getElementById('modal-cancel');

    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

    function newPuzzle() {
        const n    = parseInt(sizeEl.value, 10);
        const diff = diffEl.value;

        // Laufenden Worker abbrechen
        if (generationWorker) {
            generationWorker.terminate();
            generationWorker = null;
        }

        btnNew.disabled      = true;
        btnNew.textContent   = 'Generiere …';
        statusEl.textContent = `Generiere ${n}×${n}-Rätsel (${diffLabels[diff]}) …`;

        generationWorker = new Worker('worker.js');

        generationWorker.onmessage = function(e) {
            generationWorker = null;
            if (e.data.success) {
                currentPuzzle = { solution: e.data.solution, cages: e.data.cages };
                setNotesMode(false);
                renderBoard(currentPuzzle);
                statusEl.textContent = `${n}×${n} · ${diffLabels[diff]} · Rätsel bereit`;
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

        generationWorker.postMessage({ n, diff });
    }

    function solveAll() {
        if (!currentPuzzle) return;
        const n = currentPuzzle.solution.length;
        for (let r = 0; r < n; r++)
            for (let c = 0; c < n; c++)
                setNumber(r, c, currentPuzzle.solution[r][c]);
        statusEl.textContent = 'Lösung wird angezeigt.';
    }

    btnNew.addEventListener('click', newPuzzle);
    btnSolve.addEventListener('click', solveAll);
    btnNotes.addEventListener('click', () => setNotesMode(!notesMode));
    btnValidate.addEventListener('click', () => setValidationMode(!validationActive));

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
            statusEl.textContent = 'Rätsel zurückgesetzt.';
            selectCell(0, 0);
        });

        window.addEventListener('resize', resizeBoard);
        newPuzzle();
});
