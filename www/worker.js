'use strict';

// ══ 0. SEEDED PRNG (Mulberry32) ══════════════════════════════════

function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

let rng = Math.random;


// ══ 1. HILFSFUNKTIONEN ══════════════════════════════════════════

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickOp(allowed, weights) {
    const total = allowed.reduce((s, o) => s + (weights[o] ?? 1), 0);
    let r = rng() * total;
    for (const op of allowed) {
        r -= weights[op] ?? 1;
        if (r <= 0) return op;
    }
    return allowed[allowed.length - 1];
}


// ══ 2. LATIN-SQUARE ══════════════════════════════════════════════

function generateSolution(n) {
    const grid = Array.from({ length: n }, () => Array(n).fill(0));
    const rows = Array.from({ length: n }, () => new Set());
    const cols = Array.from({ length: n }, () => new Set());

    function fill(pos) {
        if (pos === n * n) return true;
        const r = Math.floor(pos / n);
        const c = pos % n;
        for (const v of shuffle(Array.from({ length: n }, (_, i) => i + 1))) {
            if (!rows[r].has(v) && !cols[c].has(v)) {
                grid[r][c] = v;
                rows[r].add(v);
                cols[c].add(v);
                if (fill(pos + 1)) return true;
                grid[r][c] = 0;
                rows[r].delete(v);
                cols[c].delete(v);
            }
        }
        return false;
    }
    fill(0);
    return grid;
}


// ══ 3. SCHWIERIGKEITSKONFIGURATION ══════════════════════════════
//
// Schwierigkeit wird über zwei Hebel gesteuert:
//   mergeFraction – Anteil der Zellen in Mehrzeller-Käfigen (0 = alle Singles,
//                   1 = alle Zellen gemergt). Mehr Merges → weniger fixe Werte
//                   → mehr Backtracking → höherer Score → schwerer.
//   maxSize       – Maximale Käfiggröße. Begrenzt wie groß einzelne Käfige
//                   werden können.
//   opWeights     – Operationsgewichte. Mehr * und / → mehr gültige
//                   Kombinationen pro Käfig → schwerer für Menschen und Solver.
//
// Der Score wird nach der Generierung einmalig gemessen (solveAndScore) und
// gibt an, wie viel Backtracking der Solver benötigte.

function getDiffConfig(diff, n) {
    const map = {
        easy: {
            mergeFraction: 0.80,
            maxSize:       2,
            ops:           ['+', '-', '*'],
            opWeights:     { '+': 5, '-': 3, '*': 1 },
        },
        medium: {
            mergeFraction: 0.93,
            maxSize:       n <= 4 ? 3 : 4,
            ops:           ['+', '-', '*', '/'],
            opWeights:     { '+': 3, '-': 3, '*': 2, '/': 1 },
        },
        hard: {
            mergeFraction: 0.97,
            maxSize:       n <= 4 ? 4 : 5,
            ops:           ['+', '-', '*', '/'],
            opWeights:     { '+': 2, '-': 2, '*': 2, '/': 2 },
        },
        expert: {
            mergeFraction: 0.98,
            maxSize:       6,
            ops:           ['+', '-', '*', '/'],
            opWeights:     { '+': 5, '-': 2, '*': 1, '/': 1 },
        },
    };
    return map[diff] ?? map.medium;
}


// ══ 4. OPERATION ZUWEISEN ════════════════════════════════════════

function assignOp(cells, solution, cfg) {
    const vals = cells.map(p => solution[p.r][p.c]);
    if (cells.length === 1) return { op: '=', target: vals[0] };

    let allowed = [...cfg.ops];
    if (cells.length > 2) allowed = allowed.filter(o => o === '+' || o === '*');

    allowed = allowed.filter(o => {
        if (o !== '/') return true;
        if (cells.length !== 2) return false;
        const a = Math.max(vals[0], vals[1]);
        const b = Math.min(vals[0], vals[1]);
        return b > 0 && a % b === 0;
    });

    if (allowed.length === 0) allowed = ['+'];

    const op = pickOp(allowed, cfg.opWeights);
    let target;
    switch (op) {
        case '+': target = vals.reduce((s, v) => s + v, 0); break;
        case '*': target = vals.reduce((s, v) => s * v, 1); break;
        case '-': target = Math.max(vals[0], vals[1]) - Math.min(vals[0], vals[1]); break;
        case '/': target = Math.max(vals[0], vals[1]) / Math.min(vals[0], vals[1]); break;
        default:  target = vals[0];
    }
    return { op, target };
}


// ══ 5. NACHBARN ══════════════════════════════════════════════════

function getNeighbors(r, c, n) {
    return [[-1,0],[1,0],[0,-1],[0,1]]
        .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
        .filter(p => p.r >= 0 && p.r < n && p.c >= 0 && p.c < n);
}


// ══ 6. ALLE ADJAZENTEN ZELLPAARE ════════════════════════════════

function getAllAdjacentPairs(n) {
    const pairs = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (c + 1 < n) pairs.push([{ r, c }, { r, c: c + 1 }]);
            if (r + 1 < n) pairs.push([{ r, c }, { r: r + 1, c }]);
        }
    }
    return pairs;
}


// ══ 7. KÄFIG-KANDIDATEN VORBERECHNEN ════════════════════════════

function getCageValidValues(cage, n) {
    const values = Array.from({ length: n }, (_, i) => i + 1);
    const valid  = new Set();
    const k      = cage.cells.length;

    if (cage.op === '=') {
        if (cage.target >= 1 && cage.target <= n) valid.add(cage.target);
        return valid;
    }
    if (cage.op === '-') {
        for (const a of values)
            for (const b of values)
                if (a !== b && Math.abs(a - b) === cage.target) { valid.add(a); valid.add(b); }
        return valid;
    }
    if (cage.op === '/') {
        for (const a of values)
            for (const b of values)
                if (a !== b) {
                    const mx = Math.max(a, b), mn = Math.min(a, b);
                    if (mn > 0 && mx / mn === cage.target) { valid.add(a); valid.add(b); }
                }
        return valid;
    }

    function genFull(pos, chosen, acc) {
        if (pos === k) {
            if (acc === cage.target) chosen.forEach(v => valid.add(v));
            return;
        }
        for (const v of values) {
            // Wiederholungen erlaubt: Zellen in verschiedenen Zeilen+Spalten
            // dürfen denselben Wert haben (row/col-Eindeutigkeit prüft AC3/BT)
            const next = cage.op === '+' ? acc + v : acc * v;
            if (cage.op === '+' && next > cage.target) break;
            if (cage.op === '*' && cage.target % next !== 0) continue;
            chosen.push(v);
            genFull(pos + 1, chosen, next);
            chosen.pop();
        }
    }
    genFull(0, [], cage.op === '+' ? 0 : 1);
    return valid;
}


// ══ 8. SOLVER: AC-3 PREPROCESSING + MRV BACKTRACKING ════════════

function ac3Preprocess(n, board, cands, rowSet, colSet) {
    let totalElim = 0;
    let anyChange = true;

    while (anyChange) {
        anyChange = false;

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (board[r][c] !== 0) continue;
                if (cands[r][c].size === 0) return -1;
                if (cands[r][c].size === 1) {
                    const v = [...cands[r][c]][0];
                    board[r][c] = v;
                    rowSet[r].add(v);
                    colSet[c].add(v);
                    for (let i = 0; i < n; i++) {
                        if (i !== c && board[r][i] === 0 && cands[r][i].has(v)) {
                            cands[r][i].delete(v); totalElim++;
                            if (cands[r][i].size === 0) return -1;
                        }
                        if (i !== r && board[i][c] === 0 && cands[i][c].has(v)) {
                            cands[i][c].delete(v); totalElim++;
                            if (cands[i][c].size === 0) return -1;
                        }
                    }
                    anyChange = true;
                }
            }
        }

        for (let r = 0; r < n; r++) {
            for (let v = 1; v <= n; v++) {
                if (rowSet[r].has(v)) continue;
                let cnt = 0, fc = -1;
                for (let c = 0; c < n; c++) {
                    if (board[r][c] === 0 && cands[r][c].has(v)) { cnt++; fc = c; }
                }
                if (cnt === 0) return -1;
                if (cnt === 1 && cands[r][fc].size > 1) {
                    for (const u of [...cands[r][fc]]) {
                        if (u !== v) { cands[r][fc].delete(u); totalElim++; }
                    }
                    anyChange = true;
                }
            }
        }

        for (let c = 0; c < n; c++) {
            for (let v = 1; v <= n; v++) {
                if (colSet[c].has(v)) continue;
                let cnt = 0, fr = -1;
                for (let r = 0; r < n; r++) {
                    if (board[r][c] === 0 && cands[r][c].has(v)) { cnt++; fr = r; }
                }
                if (cnt === 0) return -1;
                if (cnt === 1 && cands[fr][c].size > 1) {
                    for (const u of [...cands[fr][c]]) {
                        if (u !== v) { cands[fr][c].delete(u); totalElim++; }
                    }
                    anyChange = true;
                }
            }
        }
    }

    return totalElim;
}

function solveAndScore(n, cages, maxBT = Infinity) {
    const board  = Array.from({ length: n }, () => Array(n).fill(0));
    const rowSet = Array.from({ length: n }, () => new Set());
    const colSet = Array.from({ length: n }, () => new Set());

    for (const cage of cages) {
        if (cage.op !== '=') continue;
        const { r, c } = cage.cells[0];
        const v = cage.target;
        if (board[r][c] === 0 && v >= 1 && v <= n) {
            board[r][c] = v;
            rowSet[r].add(v);
            colSet[c].add(v);
        }
    }

    const cands = Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
            if (board[r][c] !== 0) return new Set([board[r][c]]);
            const s = new Set();
            for (let v = 1; v <= n; v++)
                if (!rowSet[r].has(v) && !colSet[c].has(v)) s.add(v);
            return s;
        })
    );

    for (const cage of cages) {
        const valid = getCageValidValues(cage, n);
        for (const p of cage.cells) {
            if (board[p.r][p.c] !== 0) continue;
            for (const v of [...cands[p.r][p.c]])
                if (!valid.has(v)) cands[p.r][p.c].delete(v);
        }
    }

    const acResult = ac3Preprocess(n, board, cands, rowSet, colSet);
    if (acResult === -1) return { unique: false, score: 0 };

    for (const cage of cages) {
        const valid = getCageValidValues(cage, n);
        for (const p of cage.cells) {
            if (board[p.r][p.c] !== 0) continue;
            for (const v of [...cands[p.r][p.c]])
                if (!valid.has(v)) cands[p.r][p.c].delete(v);
        }
    }

    const cageOf = Array.from({ length: n }, () => Array(n).fill(null));
    cages.forEach(cage => cage.cells.forEach(p => { cageOf[p.r][p.c] = cage; }));

    function allFilled(cage) {
        return cage.cells.every(p => board[p.r][p.c] !== 0);
    }

    function cageOk(cage, final) {
        const vals   = cage.cells.map(p => board[p.r][p.c]);
        const filled = vals.filter(v => v !== 0);
        if (filled.length === 0) return true;
        switch (cage.op) {
            case '=': return final ? vals[0] === cage.target : filled[0] === cage.target;
            case '+': {
                const s = filled.reduce((a, v) => a + v, 0);
                if (final) return s === cage.target;
                return s < cage.target || (s === cage.target && filled.length === cage.cells.length);
            }
            case '*': {
                const p = filled.reduce((a, v) => a * v, 1);
                if (final) return p === cage.target;
                return cage.target % p === 0;
            }
            case '-': {
                if (!final && filled.length < 2) return true;
                if (vals.some(v => v === 0)) return !final;
                return Math.abs(vals[0] - vals[1]) === cage.target;
            }
            case '/': {
                if (!final && filled.length < 2) return true;
                if (vals.some(v => v === 0)) return !final;
                const a = Math.max(vals[0], vals[1]), b = Math.min(vals[0], vals[1]);
                return b !== 0 && (a / b) === cage.target;
            }
            default: return true;
        }
    }

    function pickCell() {
        let minSize = n + 1, best = null;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (board[r][c] !== 0) continue;
                const s = cands[r][c].size;
                if (s === 0) return null;
                if (s < minSize) { minSize = s; best = { r, c }; if (s === 1) return best; }
            }
        }
        return best;
    }

    let solutionCount = 0;
    let attempts      = 0;
    let searchSteps   = 0;

    function bt() {
        if (solutionCount > 1) return;
        if (attempts >= maxBT) return;
        const cell = pickCell();
        if (cell === null) {
            if (board.every(row => row.every(v => v !== 0)) &&
                cages.every(cage => cageOk(cage, true))) solutionCount++;
            return;
        }
        const { r, c } = cell;
        for (const v of [...cands[r][c]]) {
            if (solutionCount > 1) return;
            attempts++;
            board[r][c] = v;
            rowSet[r].add(v);
            colSet[c].add(v);
            const removed = [];
            let valid = true;
            for (let i = 0; i < n; i++) {
                if (i !== c && board[r][i] === 0 && cands[r][i].has(v)) {
                    cands[r][i].delete(v); removed.push([r, i, v]); searchSteps++;
                    if (cands[r][i].size === 0) { valid = false; break; }
                }
                if (!valid) break;
                if (i !== r && board[i][c] === 0 && cands[i][c].has(v)) {
                    cands[i][c].delete(v); removed.push([i, c, v]); searchSteps++;
                    if (cands[i][c].size === 0) { valid = false; break; }
                }
            }
            if (valid) {
                const cage = cageOf[r][c];
                if (!cageOk(cage, allFilled(cage))) valid = false;
            }
            if (valid) bt();
            board[r][c] = 0;
            rowSet[r].delete(v);
            colSet[c].delete(v);
            for (const [pr, pc, pv] of removed) cands[pr][pc].add(pv);
        }
    }

    bt();
    return {
        unique: solutionCount === 1 && attempts < maxBT,
        score:  attempts * 10 + searchSteps,
    };
}


// ══ 9. PUZZLE GENERIEREN (constraint-basierter Ansatz) ══════════
//
// Algorithmus: inkrementelles Merging mit Eindeutigkeitserhaltung
//
// 1. Alle Zellen starten als Singles (op='=') → trivial eindeutig
// 2. Adjazente Zellpaare werden zufällig permutiert
// 3. Für jedes Paar: tentatives Merge, Operation zuweisen, Eindeutigkeit prüfen
//    - Eindeutig → Merge beibehalten
//    - Nicht eindeutig → Merge rückgängig machen
// 4. Stopp wenn mergeFraction * n² Zellen in Mehrzeller-Käfigen
//
// Vorteile:
// - 100% Erfolgsrate (kein Retry-Loop, kein Fallback)
// - Solver-Score steigt monoton mit mergeFraction und opWeights
// - Funktioniert für alle Größen inkl. 8×8 und 9×9
// - Kalibrierung ergibt stabile, vorhersagbare Verteilungen

function generatePuzzle(n, diff) {
    const solution = generateSolution(n);
    const cfg      = getDiffConfig(diff, n);

    // Startzustand: jede Zelle ist ein eigener Singles-Käfig (op='=')
    // cageOf[r][c] → Index in cages[]
    const cageOf = Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => r * n + c)
    );
    const cages = Array.from({ length: n * n }, (_, i) => ({
        cells:  [{ r: Math.floor(i / n), c: i % n }],
        op:     '=',
        target: solution[Math.floor(i / n)][i % n],
    }));

    // Alle adjazenten Paare permutieren
    const pairs = shuffle(getAllAdjacentPairs(n));

    // BT-Limit pro Eindeutigkeitsprüfung — verhindert Hänger auf großen Grids
    // wenn späte Merges wenige Singles übrig lassen.
    // Timed-out Checks gelten als nicht-eindeutig (Merge wird abgelehnt).
    const maxBTperCheck = n >= 9 ? 80000 : n >= 8 ? 50000 : n >= 7 ? 50000 : Infinity;

    // Ziel-Anzahl Zellen in Mehrzeller-Käfigen
    // Für große Grids (n≥7) kompensieren wir die höhere BT-Timeout-Ablehnungsrate
    // durch einen leichten Aufschlag auf mergeFraction.
    const mergeBoost = n >= 9 ? 0.030 : n >= 8 ? 0.015 : n >= 7 ? 0.010 : 0;
    const effectiveMergeFraction = Math.min(0.995, cfg.mergeFraction + mergeBoost);
    const targetMerged = Math.round(n * n * effectiveMergeFraction);
    let mergedCount = 0;

    for (const [p1, p2] of pairs) {
        if (mergedCount >= targetMerged) break;

        const idx1 = cageOf[p1.r][p1.c];
        const idx2 = cageOf[p2.r][p2.c];
        if (idx1 === idx2) continue;

        const size1 = cages[idx1].cells.length;
        const size2 = cages[idx2].cells.length;
        if (size1 + size2 > cfg.maxSize) continue;

        // Tentatives Merge: idx2 → idx1
        const backup2 = [...cages[idx2].cells];
        for (const cell of cages[idx2].cells) {
            cageOf[cell.r][cell.c] = idx1;
            cages[idx1].cells.push(cell);
        }
        cages[idx2].cells = [];

        // Operation zuweisen
        const prevOp     = cages[idx1].op;
        const prevTarget = cages[idx1].target;
        const { op, target } = assignOp(cages[idx1].cells, solution, cfg);
        cages[idx1].op     = op;
        cages[idx1].target = target;

        // Eindeutigkeit prüfen (schnell: viele Zellen noch als Singles fixiert)
        const activeCages = cages.filter(c => c.cells.length > 0);
        const result = solveAndScore(n, activeCages, maxBTperCheck);

        if (result.unique) {
            // Merge beibehalten — mergedCount aktualisieren
            const prevMerged = (size1 > 1 ? size1 : 0) + (size2 > 1 ? size2 : 0);
            mergedCount += (size1 + size2) - prevMerged;
        } else {
            // Merge rückgängig
            cages[idx1].cells = cages[idx1].cells.slice(0, size1);
            cages[idx2].cells = backup2;
            for (const cell of backup2) cageOf[cell.r][cell.c] = idx2;
            cages[idx1].op     = prevOp;
            cages[idx1].target = prevTarget;
        }
    }


    const finalCages = cages.filter(c => c.cells.length > 0);

    // Score einmalig für das fertige Puzzle messen (mit großzügigem Limit)
    const maxBTfinal = n >= 9 ? 200000 : n >= 8 ? 100000 : n >= 7 ? 100000 : Infinity;
    const { score } = solveAndScore(n, finalCages, maxBTfinal);
    return { solution, cages: finalCages, score };
}


// ══ 10. WORKER MESSAGE HANDLER ══════════════════════════════════

self.onmessage = function(e) {
    const { n, diff, seed, action, count } = e.data;
    rng = mulberry32(seed);

    // Kalibrierungsmodus: N Rätsel generieren und Scores zurückgeben
    if (action === 'calibrate') {
        const scores = [];
        for (let i = 0; i < (count || 100); i++) {
            const result = generatePuzzle(n, diff);
            scores.push(result.score);
        }
        self.postMessage({ action: 'calibrate', n, diff, scores });
        return;
    }

    try {
        const result = generatePuzzle(n, diff);
        self.postMessage({
            success:  true,
            solution: result.solution,
            cages:    result.cages,
            seed,
            score:    result.score,
        });
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};
