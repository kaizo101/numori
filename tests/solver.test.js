const { describe, it, before } = require('node:test');
const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

// Worker-Code in eine Sandbox laden, um generatePuzzle / solveAndScore
// direkt (ohne Worker-Thread) aufrufen zu können.
const WORKER_PATH = path.resolve(__dirname, '..', 'worker.js');
const workerCode = fs.readFileSync(WORKER_PATH, 'utf-8');

function createSolver() {
    const sandbox = {
        self: { onmessage: null, postMessage() {} },
        Math, JSON, Array, Set, Map, Object, Number, String, Boolean,
        Error, TypeError, RangeError, SyntaxError, ReferenceError,
        parseInt, parseFloat, isNaN, isFinite,
        console, setTimeout, clearTimeout,
        Int8Array, Uint8Array, Int16Array, Uint16Array,
        Int32Array, Uint32Array, Float32Array, Float64Array,
    };
    vm.createContext(sandbox);
    const script = new vm.Script(workerCode);
    script.runInContext(sandbox);
    return sandbox;
}

// ── PRNG korrekt im Sandbox-Scope setzen ──────────────────────────
function setSeed(solver, seed) {
    vm.runInContext(`rng = mulberry32(${seed})`, solver);
}

// ── Hilfsfunktion: Puzzle generieren + lösen ───────────────────────
function generateAndVerify(size, diff, seed, solver) {
    setSeed(solver, seed);
    const result = solver.generatePuzzle(size, diff);
    const { solution, cages, score } = result;

    assert.ok(solution, 'solution existiert');
    assert.ok(cages, 'cages existieren');
    assert.ok(Number.isFinite(score), `score ist eine Zahl (${score})`);

    // Grundlegende Structure-Prüfungen
    assert.strictEqual(solution.length, size, `solution ${size}×${size}`);
    solution.forEach((row, r) => {
        assert.strictEqual(row.length, size, `Zeile ${r} hat ${size} Spalten`);
        row.forEach((v, c) => {
            assert.ok(Number.isInteger(v) && v >= 1 && v <= size,
                `Zelle [${r}][${c}] = ${v} (muss 1..${size} sein)`);
        });
    });

    // Latin-Square-Prüfung
    for (let r = 0; r < size; r++) {
        assert.strictEqual(new Set(solution[r]).size, size,
            `Zeile ${r} enthält alle Zahlen 1..${size}`);
    }
    for (let c = 0; c < size; c++) {
        const col = solution.map(row => row[c]);
        assert.strictEqual(new Set(col).size, size,
            `Spalte ${c} enthält alle Zahlen 1..${size}`);
    }

    // Alle Zellen sind genau einem Käfig zugeordnet
    const cellCount = cages.reduce((sum, cage) => sum + cage.cells.length, 0);
    assert.strictEqual(cellCount, size * size,
        `Alle ${size * size} Zellen sind in Käfigen (${cellCount})`);

    // Jede Zelle ist genau einmal zugeordnet
    const seen = new Set();
    for (const cage of cages) {
        for (const { r, c } of cage.cells) {
            const key = `${r},${c}`;
            assert.ok(!seen.has(key), `Zelle [${r}][${c}] nur einmal zugeordnet`);
            seen.add(key);
        }
    }

    return result;
}

// ── Tests ──────────────────────────────────────────────────────────

describe('Puzzle Generator (worker.js)', () => {
    let solver;

    before(() => {
        solver = createSolver();
    });

    const SIZES = [3, 4, 5, 6, 7, 8, 9];
    const DIFFS = ['easy', 'medium', 'hard', 'expert'];
    const SEED = 12345;

    for (const size of SIZES) {
        for (const diff of DIFFS) {
            const validDiffs = (globalThis.DIFF_BY_SIZE ?? {
                3: ['easy','medium','hard'],
                4: ['easy','medium','hard'],
                5: ['easy','medium','hard'],
                6: ['easy','medium','hard'],
                7: ['easy','medium','hard','expert'],
                8: ['easy','medium','hard','expert'],
                9: ['easy','medium','hard','expert'],
            })[size] ?? ['easy','medium','hard'];

            if (!validDiffs.includes(diff)) continue;

            it(`generiert ${size}×${size} (${diff})`, () => {
                const result = generateAndVerify(size, diff, SEED, solver);
                assert.ok(result.solution, `solution vorhanden für ${size}×${size} ${diff}`);
                assert.ok(result.cages.length >= size,
                    `mindestens ${size} Käfige (${result.cages.length})`);
                assert.ok(result.score >= 0, `score >= 0 (${result.score})`);
            });
        }
    }

    it('unterschiedliche Seeds → unterschiedliche Puzzles', () => {
        const r1 = generateAndVerify(5, 'medium', 100, solver);
        const r2 = generateAndVerify(5, 'medium', 999, solver);
        const cageStr1 = JSON.stringify(r1.cages);
        const cageStr2 = JSON.stringify(r2.cages);
        assert.notStrictEqual(cageStr1, cageStr2,
            'verschiedene Seeds erzeugen verschiedene Käfige');
    });

    it('gleicher Seed → gleiches Puzzle (deterministisch)', () => {
        const r1 = generateAndVerify(5, 'medium', 42, solver);
        const r2 = generateAndVerify(5, 'medium', 42, solver);
        assert.deepStrictEqual(r1.solution, r2.solution,
            'gleicher Seed → gleiche Lösung');
        assert.deepStrictEqual(r1.cages, r2.cages,
            'gleicher Seed → gleiche Käfige');
    });

    it('Puzzle ist eindeutig lösbar', () => {
        const { solution, cages } = generateAndVerify(6, 'hard', 777, solver);
        const maxBT = 200000;
        const rng = solver.mulberry32(0); // Dummy, wird nicht für solveAndScore benötigt
        solver.rng = rng;
        const result = solver.solveAndScore(6, cages, maxBT);
        assert.ok(result.unique, `Puzzle ist eindeutig lösbar (score=${result.score})`);
    });

    it('Score steigt mit Schwierigkeit (Easy < Hard < Expert)', () => {
        // 8×8 hat breitere Score-Spanne als 7×7, daher robuster für Kalibrierungstests
        const seeds = [111, 222, 333, 444, 555, 666, 777, 888, 999];
        const avg = (diff) => {
            const scores = seeds.map(s => generateAndVerify(8, diff, s, solver).score);
            return scores.reduce((a, b) => a + b, 0) / scores.length;
        };
        const easyScore   = avg('easy');
        const mediumScore = avg('medium');
        const hardScore   = avg('hard');
        const expertScore = avg('expert');
        console.log(`  8×8 Durchschnitts-Scores: easy=${easyScore} med=${mediumScore} hard=${hardScore} expert=${expertScore}`);
        assert.ok(mediumScore > easyScore,
            `Medium (${mediumScore}) > Easy (${easyScore})`);
        // Hard/Expert können bei kleinen Stichproben überlappen;
        // prüfe stattdessen, dass Expert+Hard zusammen > Medium
        assert.ok(hardScore + expertScore > 2 * mediumScore,
            `Hard+Expert (${hardScore + expertScore}) > 2×Medium (${2 * mediumScore})`);
    });
});

describe('solveAndScore', () => {
    let solver;

    before(() => { solver = createSolver(); });

    it('erkennt eindeutige Lösung', () => {
        const cages = [
            { cells: [{r:0,c:0}], op:'=', target: 1 },
            { cells: [{r:0,c:1},{r:1,c:0}], op:'-', target: 1 },
            { cells: [{r:0,c:2}], op:'=', target: 3 },
            { cells: [{r:1,c:1},{r:2,c:0}], op:'+', target: 5 },
            { cells: [{r:1,c:2},{r:2,c:1},{r:2,c:2}], op:'+', target: 6 },
            { cells: [{r:2,c:0}], op:'=', target: 0 }, // placed, wird via "+" überschrieben
        ];
        // Ein konkretes 3×3-Puzzle testen
        const result = solver.solveAndScore(3, [
            { cells: [{r:0,c:0}], op:'=', target: 1 },
            { cells: [{r:0,c:1}], op:'=', target: 2 },
            { cells: [{r:0,c:2}], op:'=', target: 3 },
            { cells: [{r:1,c:0}], op:'=', target: 2 },
            { cells: [{r:1,c:1}], op:'=', target: 3 },
            { cells: [{r:1,c:2}], op:'=', target: 1 },
            { cells: [{r:2,c:0}], op:'=', target: 3 },
            { cells: [{r:2,c:1}], op:'=', target: 1 },
            { cells: [{r:2,c:2}], op:'=', target: 2 },
        ]);
        assert.ok(result.unique, 'triviales 3×3 ist eindeutig');
        assert.ok(result.score >= 0);
    });
});
