// ── PUZZLE LOGIC ────────────────────────────────────────────────

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

// loadStats, stats, leaderboard functions → leaderboard.js



// ── TÄGLICHES RÄTSEL ──────────────────────────────────────────
// DAILY_SCHEDULE defined in constants.js

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
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };

    if (solvedTime) {
        btn.title = t('daily-solved-title').replace('{time}', solvedTime);
        btn.dataset.solved = 'true';
    }

    window._renderWelcomeDaily = function() {
        const el = document.getElementById('welcome-daily');
        if (!el) return;
        const dl = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };
        const infoLine = `${t('title-daily')} · ${n}×${n} · ${dl[diff] ?? diff}`;
        const statusLine = solvedTime
            ? `<span class="welcome-daily-solved">✓ ${t('daily-solved-short').replace('{time}', solvedTime)}</span>`
            : `<span class="welcome-daily-unsolved">${t('welcome-daily-unsolved')}</span>`;
        el.innerHTML = `<span class="welcome-daily-info">${infoLine}</span>${statusLine}`;
        el.style.display = '';
    };
    window._renderWelcomeDaily();

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
        if (solvedTime) setStatus(t('daily-solved-title').replace('{time}', solvedTime));
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
        // renderBoard setzt moveCount = 0, daher hier wiederherstellen
        moveCount = s.moveCount || 0;
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
        // Timer vom gespeicherten Stand weiterführen
        if (timerInterval) clearInterval(timerInterval);
        timerStopped = false;
        timerInterval = setInterval(() => { elapsedSeconds++; updateTimerDisplay(); }, 1000);
        updateTimerDisplay();
        if (s.timerVisible) setTimerVisible(true);
        const moveEl = document.getElementById('move-count');
        if (moveEl) moveEl.textContent = moveCount;
        const mobileMoveEl = document.getElementById('mobile-move-display');
        if (mobileMoveEl) mobileMoveEl.textContent = moveCount;
        updateUndoRedoButtons();
        updateProgress();
        setStatus('spielstand wiederhergestellt.');
        window._isDirty = moveCount > 0;
        // Dropdowns auf wiederhergestellte Größe & Schwierigkeit synchronisieren
        const _p = parseFullSeed(currentPuzzle.seed || '');
        const restoredDiff = _p?.diff ?? null;
        const sizeEl = document.getElementById('size');
        if (sizeEl) {
            sizeEl.value = String(n);
            syncCustomSelect('size', String(n));
            updateDifficultyOptions(n);
        }
        if (restoredDiff) {
            const diffEl = document.getElementById('difficulty');
            if (diffEl) { diffEl.value = restoredDiff; syncCustomSelect('difficulty', restoredDiff); }
            const mobileSizeEl = document.getElementById('mobile-size');
            if (mobileSizeEl) mobileSizeEl.value = String(n);
            const mobileDiffEl = document.getElementById('mobile-difficulty');
            if (mobileDiffEl) mobileDiffEl.value = restoredDiff;
        }
        // Seed-ID wiederherstellen
        if (currentPuzzle.seed) setSeedTypewriter(currentPuzzle.seed);
    });
    // Flipper DMD nach Board-Render auf playing setzen
    setTimeout(() => {
        if (currentPuzzle && typeof flipperDMD !== 'undefined') {
            const _p = parseFullSeed(currentPuzzle.seed || '');
            flipperDMD.setState('playing', {
                size: _p ? _p.n : currentPuzzle.solution.length,
                diff: _p ? _p.diff : 'medium',
                seed: currentPuzzle.seed
            });
        }
    }, 200);
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

// MUSIC_TRACKS, musicPlayer, initMusicPlayer, initSettingsMusicPlayer → music.js


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
    debugSolveUsed = false;
    validationWasUsed = false;
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

function resetTimerState() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    elapsedSeconds = 0;
    timerStopped = false;
    competitiveBlocked = false;
    solvedByCheat = false;
    debugSolveUsed = false;
    validationWasUsed = false;
    updateTimerDisplay();
    updateTimerBtn();
}

function updateTimerDisplay() {
    if (!timerVisible) return;
    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = formatTime(elapsedSeconds);
}

// 3b. GEWINN-BANNER
function showWinBanner(timeStr, size, diff, seed, denied=false, isNewBest=false, leaderboardRank=null, onCardShown=null, isDailyMode=false) {
    const _theme = document.documentElement.getAttribute('data-theme');
    if (_theme === 'space') {
        spaceWin?.show({ timeStr, size, diff, seed, denied, isNewBest, leaderboardRank, moves: moveCount }, onCardShown);
        const btnSolve = document.getElementById('btn-solve');
        if (btnSolve) btnSolve.disabled = true;
        numpadModule.hide();
        return;
    }
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };
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
        winBest.textContent = isNewBest ? t('win-new-best') : '';
        winBest.style.display = isNewBest ? '' : 'none';
    }
    const _isFlipperTheme = _theme === 'flipper';
    banner.classList.add('visible');
    _matrixWinData = { size: size+'x'+size, diff, time: timeStr, seed, moves: moveCount, denied, isNewBest };
    startMatrixRain();
    if (_isFlipperTheme) {
        if (denied) flipperSounds.tilt(); else flipperSounds.win();
        flipperDMD.setState(denied ? 'tilt' : 'win', {
            size, diff, time: timeStr, seed,
            moves: moveCount, denied, isNewBest,
            rank: leaderboardRank,
            seconds: elapsedSeconds,
            isDailyMode: isDailyMode,
            onNewGame: () => { document.getElementById('btn-new')?.click(); },
            onExit: () => {}
        });
        startFlipperWin();
        if (leaderboardRank !== null && !denied) {
            const consent = localStorage.getItem('numori-lb-consent');
            if (consent === 'granted' && typeof window.supabaseFetchLeaderboard === 'function') {
                flipperDMD.patchState({ globalRankLoading: true });
                window.supabaseFetchLeaderboard(size, diff, 'alltime', 100).then(rows => {
                    const betterCount = rows.filter(r =>
                        r.time_seconds < elapsedSeconds ||
                        (r.time_seconds === elapsedSeconds && r.move_count < moveCount)
                    ).length;
                    flipperDMD.patchState({ globalRank: betterCount + 1, globalRankLoading: false });
                }).catch(() => {
                    flipperDMD.patchState({ globalRankLoading: false });
                });
            }
        }
    }
    const btnSolve = document.getElementById('btn-solve');
    if (btnSolve) btnSolve.disabled = true;
    numpadModule.hide();
}

function hideWinBanner() {
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    banner.classList.remove('visible');
    stopMatrixRain();
    stopFlipperWin();
    spaceWin?.stop();
    if (document.documentElement.getAttribute('data-theme') === 'flipper' && window.innerWidth > 600) {
        if (currentPuzzle) {
            const _p = parseFullSeed(currentPuzzle.seed);
            flipperDMD.setState('playing', { size: _p ? _p.n : currentPuzzle.solution.length, diff: _p ? _p.diff : 'medium', seed: currentPuzzle.seed });
        } else {
            flipperDMD.setState('attract');
        }
    }
    // btn-solve bleibt gesperrt bis newPuzzle() aufgerufen wird
    if (currentPuzzle && numpadModule.isEnabled()) {
        numpadModule.show(currentPuzzle.solution.length);
    }
}


// MATRIX WIN SCREEN (Console-Theme only)
// _matrixAnimFrame, startMatrixRain, stopMatrixRain → themes/console.js



// FLIPPER SOUNDS
// flipperSounds, flipperDMD, startFlipperWin, stopFlipperWin → themes/flipper.js




// 4. SEED-HILFSFUNKTIONEN
// Präfix-Kodierung: Größe (3-7) + Schwierigkeit (E/M/H) + '-' + 6-Zeichen-Seed
// z.B. "4M-AB3X7K"
// DIFF_CODE, CODE_DIFF defined in constants.js

function buildFullSeed(n, diff, rawSeed) {
    return `${n}${DIFF_CODE[diff]}-${rawSeed}`;
}

function parseFullSeed(fullSeed) {
    // Format: "4M-AB3X7K" oder legacy ohne Präfix
    const match = fullSeed.match(/^([3-9])([EMHX])-([A-Z2-9]{1,12})$/i);
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
    // Auf Mobile: kein künstliches Maximum, Board nutzt verfügbaren Platz
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
        return Math.floor(Math.min(w, h));
    }
    // Desktop: Max 78% des kleinsten Viewport-Maßes für Proportionen
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
    buildFlipperTicker();
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

    window._isDirty = false;
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
    const mobileMoveEl = document.getElementById('mobile-move-display');
    if (mobileMoveEl) mobileMoveEl.textContent = '0';
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
    const wasZero = moveCount === 0;
    moveCount = Math.max(0, moveCount + delta);
    if (wasZero && moveCount > 0) window._isDirty = true;
    const el = document.getElementById('move-count');
    if (el) el.textContent = moveCount;
    const mobileEl = document.getElementById('mobile-move-display');
    if (mobileEl) mobileEl.textContent = moveCount;
    updateTimerBtn();
    if (!window.electronAPI) setTimeout(saveGameState, 0);
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
// _errorCooldown, showConsoleError → themes/console.js

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
        const wasDailyMode = window._dailyMode === true;
        const wasDailyAlreadySolved = wasDailyMode && window._dailyDateKey && !!getDailySolvedTime(window._dailyDateKey);
        if (wasDailyMode && window._dailyDateKey) {
            const dTimeStr = formatTime(elapsedSeconds);
            if (!wasDailyAlreadySolved) markDailySolved(window._dailyDateKey, dTimeStr);
            window._dailyMode = false;
            const dBtn = document.getElementById('btn-daily');
            if (dBtn) { dBtn.dataset.solved = 'true'; dBtn.title = t('daily-solved-title').replace('{time}', getDailySolvedTime(window._dailyDateKey)); }
        }
        setStatus(t('status-solved').replace('{n}', n));
        const allHints = hintBoard && userBoard.every((row,r)=>row.every((v,c)=>v===0||hintBoard[r][c]));
        const isNewBest = recordSolve(n, diff, elapsedSeconds, moveCount);
        const leaderboardRank = (!competitiveBlocked && !wasDailyAlreadySolved) ? getLeaderboardRank(elapsedSeconds, n, diff) : null;
        const cleanSolve = !competitiveBlocked && !solvedByCheat && !debugSolveUsed && !wasDailyAlreadySolved;
        const _theme = document.documentElement.getAttribute('data-theme');
        const _isFlipperThemeSolve = _theme === 'flipper';
        const _isSpaceTheme = _theme === 'space';
        if (_isSpaceTheme) {
            // Space: Animation sofort, Leaderboard-/Daily-Popup erst wenn Win-Karte erscheint
            const _afterCard = leaderboardRank !== null ? () => {
                statsActiveTab = 'leaderboard';
                renderStatsModal();
                document.getElementById('stats-overlay')?.classList.add('visible');
                showLeaderboardEntryPopup(leaderboardRank, elapsedSeconds, n, diff, currentPuzzle.seed, wasDailyMode, cleanSolve);
            } : wasDailyMode && !competitiveBlocked ? () => {
                showDailyOnlyPopup(elapsedSeconds, null);
            } : null;
            showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints, isNewBest, leaderboardRank, _afterCard);
        } else if (leaderboardRank !== null && !_isFlipperThemeSolve) {
            if (_theme === 'console') {
                window._consoleLbData = { rank: leaderboardRank, seconds: elapsedSeconds, moves: moveCount, size: n, difficulty: diff, seed: currentPuzzle.seed, isDailyMode: wasDailyMode };
                showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints, isNewBest, leaderboardRank);
            } else {
                const statsOverlay = document.getElementById('stats-overlay');
                statsActiveTab = 'leaderboard';
                renderStatsModal();
                if (statsOverlay) statsOverlay.classList.add('visible');
                showLeaderboardEntryPopup(leaderboardRank, elapsedSeconds, n, diff, currentPuzzle.seed, wasDailyMode, cleanSolve);
                const _lbOverlay = document.getElementById('leaderboard-entry-overlay');
                if (_lbOverlay) _lbOverlay._onClose = () => {
                    showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints, isNewBest, leaderboardRank);
                };
            }
        } else if (wasDailyMode && !competitiveBlocked && !_isFlipperThemeSolve) {
            // Kein lokaler Rang aber Tagesrätsel → Namensabfrage nur für globales Daily-LB
            showDailyOnlyPopup(elapsedSeconds, () => {
                showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints, isNewBest, leaderboardRank);
            });
        } else {
            showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints, isNewBest, leaderboardRank, null, wasDailyMode);
        }
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
    validationActive = active;
    if (active) {
        competitiveBlocked = true;
        validationWasUsed = true;
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
                    ? t('clear-invalid-1')
                    : t('clear-invalid-n').replace('{n}', wrongCount);
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
    if (statusEl) setStatus(changes.length === 1 ? t('status-cleared-1') : t('status-cleared-n').replace('{n}', changes.length));
}


function updateTimerBtn() {
    const btn = document.getElementById('btn-timer');
    if (!btn) return;
    btn.disabled = false;
    btn.title = competitiveBlocked ? t('title-timer-blocked') : t('title-timer');
    btn.style.opacity = competitiveBlocked ? '0.45' : '';
    btn.style.cursor = '';
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
    timerVisible = active;
    const btn = document.getElementById('btn-timer');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    if (active && currentPuzzle && !timerStopped && timerInterval === null) startTimer();
    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = active ? formatTime(elapsedSeconds) : '';
    if (active) updateTimerDisplay();
    updateTimerBtn();
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
    if (document.getElementById('leaderboard-entry-overlay')?.classList.contains('visible')) return;
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
        case 't':
        case 'T':
            document.getElementById('btn-timer')?.click();
            return;
        case 'h':
        case 'H':
            giveHint();
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

    const n = currentPuzzle.solution.length;
    let r = selected.r;
    let c = selected.c;

    if (userBoard[r][c] !== 0) {
        // Zelle ist bereits ausgefüllt (korrekt oder falsch) — suche leere Zelle
        const candidates = [];
        for (let rr = 0; rr < n; rr++) {
            for (let cc = 0; cc < n; cc++) {
                if (userBoard[rr][cc] === 0) {
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

