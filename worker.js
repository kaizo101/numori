'use strict';

// ══ 1. HILFSFUNKTIONEN ══════════════════════════════════════════

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickOp(allowed, weights) {
    const total = allowed.reduce((s, o) => s + (weights[o] ?? 1), 0);
    let r = Math.random() * total;
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

function getDiffConfig(diff, n) {
    const map = {
        easy: {
            maxSize:        2,
            maxSingleRatio: 0.30,
            ops:            ['+'],
            opWeights:      { '+': 1 }
        },
        medium: {
            maxSize:        3,
            maxSingleRatio: 0.12,
            ops:            ['+', '-', '*'],
            opWeights:      { '+': 4, '-': 2, '*': 1 }
        },
        hard: {
            maxSize:        Math.min(4, n),
            maxSingleRatio: 0.00,
            ops:            ['+', '-', '*', '/'],
            opWeights:      { '+': 2, '-': 2, '*': 2, '/': 1 }
        },
    };
    return map[diff] ?? map.medium;
}


// ══ 4. OPERATION ZUWEISEN ════════════════════════════════════════

function assignOp(cells, solution, ops, opWeights) {
    const vals = cells.map(p => solution[p.r][p.c]);
    if (cells.length === 1) return { op: '=', target: vals[0] };

    let allowed = [...ops];
    if (cells.length > 2) allowed = allowed.filter(o => o === '+' || o === '*');

    allowed = allowed.filter(o => {
        if (o !== '/') return true;
        if (cells.length !== 2) return false;
        const a = Math.max(vals[0], vals[1]);
        const b = Math.min(vals[0], vals[1]);
        return b > 0 && a % b === 0;
    });

    if (allowed.length === 0) allowed = ['+'];

    const op = pickOp(allowed, opWeights);
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


// ══ 6. KÄFIG-GENERIERUNG ════════════════════════════════════════

function generateCages(solution, diff) {
    const n   = solution.length;
    const cfg = getDiffConfig(diff, n);

    const cageIdx = Array.from({ length: n }, () => Array(n).fill(-1));
    const cages   = [];

    const order = shuffle(
        Array.from({ length: n * n }, (_, i) => ({ r: Math.floor(i / n), c: i % n }))
    );

    for (const start of order) {
        if (cageIdx[start.r][start.c] !== -1) continue;
        const idx  = cages.length;
        const cage = { cells: [start] };
        cageIdx[start.r][start.c] = idx;
        cages.push(cage);
        const want = 1 + Math.floor(Math.random() * cfg.maxSize);

        while (cage.cells.length < want) {
            const frontier = [];
            for (const p of cage.cells)
                for (const nb of getNeighbors(p.r, p.c, n))
                    if (cageIdx[nb.r][nb.c] === -1 &&
                        !frontier.some(f => f.r === nb.r && f.c === nb.c))
                        frontier.push(nb);
                    if (frontier.length === 0) break;
                    const pick = frontier[Math.floor(Math.random() * frontier.length)];
            cageIdx[pick.r][pick.c] = idx;
            cage.cells.push(pick);
        }
    }

    let progress = true;
    while (progress) {
        progress = false;
        const active  = cages.filter(c => c.cells.length > 0);
        const singles = active.filter(c => c.cells.length === 1);
        if (active.length > 0 && singles.length / active.length <= cfg.maxSingleRatio) break;

        for (const single of shuffle(singles)) {
            if (single.cells.length !== 1) continue;
            const { r, c } = single.cells[0];
            const myIdx    = cageIdx[r][c];
            let merged     = false;
            for (const nb of shuffle(getNeighbors(r, c, n))) {
                const nbIdx  = cageIdx[nb.r][nb.c];
                if (nbIdx === myIdx) continue;
                const nbCage = cages[nbIdx];
                if (nbCage.cells.length > 0 && nbCage.cells.length <= cfg.maxSize) {
                    nbCage.cells.push({ r, c });
                    cageIdx[r][c] = nbIdx;
                    single.cells  = [];
                    merged = progress = true;
                    break;
                }
            }
            if (merged) break;
        }
    }

    return cages
    .filter(cage => cage.cells.length > 0)
    .map(cage => {
        const { op, target } = assignOp(cage.cells, solution, cfg.ops, cfg.opWeights);
        return { cells: cage.cells, op, target };
    });
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


// ══ 8. SOLVER: MRV + FORWARD CHECKING ═══════════════════════════
// Kein Timeout – Eindeutigkeit immer vollständig geprüft

function hasUniqueSolution(n, cages) {
    const board  = Array.from({ length: n }, () => Array(n).fill(0));
    const rowSet = Array.from({ length: n }, () => new Set());
    const colSet = Array.from({ length: n }, () => new Set());

    // =-Käfige sofort vorausfüllen
    for (const cage of cages) {
        if (cage.op !== '=') continue;
        const { r, c } = cage.cells[0];
        const v = cage.target;
        if (board[r][c] !== 0 || v < 1 || v > n) continue;
        board[r][c] = v;
        rowSet[r].add(v);
        colSet[c].add(v);
    }

    // Kandidaten mit Käfig-Constraints initialisieren
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
        const cageValid = getCageValidValues(cage, n);
        for (const p of cage.cells) {
            if (board[p.r][p.c] !== 0) continue;
            for (const v of [...cands[p.r][p.c]])
                if (!cageValid.has(v)) cands[p.r][p.c].delete(v);
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

    let count = 0;

    function bt() {
        if (count > 1) return;

        const cell = pickCell();
        if (cell === null) {
            if (board.every(row => row.every(v => v !== 0)) &&
                cages.every(cage => cageOk(cage, true))) count++;
            return;
        }

        const { r, c } = cell;
        for (const v of [...cands[r][c]]) {
            if (count > 1) return;

            board[r][c] = v;
            rowSet[r].add(v);
            colSet[c].add(v);

            const removed = [];
            let valid = true;

            for (let i = 0; i < n; i++) {
                if (i !== c && board[r][i] === 0 && cands[r][i].has(v)) {
                    cands[r][i].delete(v); removed.push([r, i, v]);
                    if (cands[r][i].size === 0) { valid = false; break; }
                }
                if (!valid) break;
                if (i !== r && board[i][c] === 0 && cands[i][c].has(v)) {
                    cands[i][c].delete(v); removed.push([i, c, v]);
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
    return count === 1;
}


// ══ 9. FALLBACK ══════════════════════════════════════════════════

function buildFallback(n, diff) {
    const solution = generateSolution(n);
    const cages    = [];
    const used     = Array.from({ length: n }, () => Array(n).fill(false));
    const cfg      = getDiffConfig(diff, n);

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (used[r][c]) continue;
            const nbs = getNeighbors(r, c, n).filter(p => !used[p.r][p.c]);
            if (nbs.length > 0) {
                const nb = nbs[0];
                used[r][c] = used[nb.r][nb.c] = true;
                const { op, target } = assignOp([{ r, c }, nb], solution, cfg.ops, cfg.opWeights);
                cages.push({ cells: [{ r, c }, nb], op, target });
            } else {
                used[r][c] = true;
                cages.push({ cells: [{ r, c }], op: '=', target: solution[r][c] });
            }
        }
    }
    return { solution, cages };
}


// ══ 10. PUZZLE GENERIEREN ════════════════════════════════════════

function generatePuzzle(n, diff) {
    const maxAttempts = n <= 4 ? 200 : n <= 5 ? 150 : n <= 6 ? 100 : 80;
    for (let i = 0; i < maxAttempts; i++) {
        const solution = generateSolution(n);
        const cages    = generateCages(solution, diff);
        if (hasUniqueSolution(n, cages)) return { solution, cages };
    }
    return buildFallback(n, diff);
}


// ══ 11. WORKER MESSAGE HANDLER ══════════════════════════════════

self.onmessage = function(e) {
    const { n, diff } = e.data;
    try {
        const result = generatePuzzle(n, diff);
        self.postMessage({ success: true, solution: result.solution, cages: result.cages });
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};
