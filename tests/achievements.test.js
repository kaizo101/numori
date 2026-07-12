const { describe, it, before, beforeEach } = require('node:test');
const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const ACHIEVEMENTS_PATH = path.resolve(__dirname, '..', 'achievements.js');
const achievementsCode = fs.readFileSync(ACHIEVEMENTS_PATH, 'utf-8');

function createAchievementContext() {
    const store = {};

    const sandbox = {
        localStorage: {
            getItem: (k) => store[k] ?? null,
            setItem: (k, v) => { store[k] = String(v); },
            removeItem: (k) => { delete store[k]; },
            clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        },
        document: {
            createElement: () => ({
                style: {},
                classList: { add: () => {}, remove: () => {}, contains: () => false },
                addEventListener: () => {},
                remove: () => {},
                appendChild: () => {},
                removeChild: () => {},
                querySelector: () => null,
                querySelectorAll: () => [],
                getAttribute: () => null,
                setAttribute: () => {},
                dataset: {},
                textContent: '',
                innerHTML: '',
                id: '',
                focus: () => {},
            }),
            body: {
                appendChild: () => {},
                insertBefore: () => {},
                removeChild: () => {},
                querySelector: () => null,
                querySelectorAll: () => [],
            },
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            documentElement: {
                getAttribute: () => null,
                setAttribute: () => {},
                classList: { add: () => {}, remove: () => {}, contains: () => false },
            },
        },
        requestAnimationFrame: (cb) => setTimeout(cb, 0),
        cancelAnimationFrame: (id) => clearTimeout(id),
        window: {},
        setTimeout, clearTimeout, setInterval, clearInterval,
        Math, JSON, Array, Set, Map, Object, Number, String, Boolean, Date,
        Error, TypeError, RangeError,
        parseInt, parseFloat, isNaN, isFinite,
        console,
        // i18n-Mock
        t: (key) => key,
        // DIFF_BY_SIZE für all_sizes / all_combos
        DIFF_BY_SIZE: {
            3: ['easy', 'medium', 'hard'],
            4: ['easy', 'medium', 'hard'],
            5: ['easy', 'medium', 'hard'],
            6: ['easy', 'medium', 'hard'],
            7: ['easy', 'medium', 'hard', 'expert'],
            8: ['easy', 'medium', 'hard', 'expert'],
            9: ['easy', 'medium', 'hard', 'expert'],
        },
    };
    sandbox.window = sandbox;

    vm.createContext(sandbox);
    new vm.Script(achievementsCode).runInContext(sandbox);
    return sandbox;
}

describe('Achievement System', () => {
    let ctx;

    before(() => { ctx = createAchievementContext(); });
    beforeEach(() => { ctx.localStorage.clear(); });

    // ── Storage ─────────────────────────────────────────────────────

    it('isAchievementUnlocked – standardmäßig false', () => {
        assert.strictEqual(ctx.isAchievementUnlocked('first'), false);
    });

    it('isAchievementUnlocked – true nach unlock', () => {
        ctx._unlockAchievement('first');
        assert.strictEqual(ctx.isAchievementUnlocked('first'), true);
    });

    it('Achievement wird nicht doppelt vergeben', () => {
        ctx._unlockAchievement('first');
        const data = JSON.parse(ctx.localStorage.getItem('numori-achievements'));
        assert.strictEqual(Object.keys(data).length, 1);
        ctx._unlockAchievement('first');
        const data2 = JSON.parse(ctx.localStorage.getItem('numori-achievements'));
        assert.strictEqual(Object.keys(data2).length, 1);
    });

    // ── checkAchievementsOnSolve: Core ─────────────────────────────

    it('first – nach erstem Solve', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('first'));
    });

    it('puzzles10 – nach 10 Solves', () => {
        for (let i = 0; i < 10; i++)
            ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('puzzles10'));
    });

    it('puzzles50 – nach 50 Solves', () => {
        for (let i = 0; i < 50; i++)
            ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('puzzles50'));
    });

    it('puzzles100 – nach 100 Solves', () => {
        for (let i = 0; i < 100; i++)
            ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('puzzles100'));
    });

    it('perfect – nur bei cleanSolve + noHints', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('perfect'));
    });

    it('perfect – nicht bei fehlendem cleanSolve', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: false, noUndo: true, noHints: true });
        assert.ok(!ctx.isAchievementUnlocked('perfect'));
    });

    it('no_undo – bei noUndo=true', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('no_undo'));
    });

    it('no_undo – nicht bei noUndo=false', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: false, noHints: true });
        assert.ok(!ctx.isAchievementUnlocked('no_undo'));
    });

    it('expert9 – 9×9 Expert', () => {
        ctx.checkAchievementsOnSolve({ size: 9, diff: 'expert', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('expert9'));
    });

    it('expert9 – nicht bei 9×9 Medium', () => {
        ctx.checkAchievementsOnSolve({ size: 9, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(!ctx.isAchievementUnlocked('expert9'));
    });

    it('all_sizes – jede Größe mindestens einmal gelöst', () => {
        for (const size of [3, 4, 5, 6, 7, 8, 9])
            ctx.checkAchievementsOnSolve({ size, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('all_sizes'));
    });

    it('all_sizes – nicht bei fehlender Größe 9', () => {
        for (const size of [3, 4, 5, 6, 7, 8])
            ctx.checkAchievementsOnSolve({ size, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(!ctx.isAchievementUnlocked('all_sizes'));
    });

    // ── Theme-Achievements ──────────────────────────────────────────

    it('console_first – bei Solve im Console-Theme', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', theme: 'console', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('console_first'));
    });

    it('console_first – nicht bei Default-Theme', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(!ctx.isAchievementUnlocked('console_first'));
    });

    it('console9x9 – Console + 9×9', () => {
        ctx.checkAchievementsOnSolve({ size: 9, diff: 'medium', theme: 'console', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('console9x9'));
    });

    it('flipper_first – bei Solve im Flipper-Theme', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', theme: 'flipper', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('flipper_first'));
    });

    it('space_first – bei Solve im Space-Theme', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', theme: 'space', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('space_first'));
    });

    it('synth_first – bei Solve im Synthwave-Theme', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', theme: 'synthwave', cleanSolve: true, noUndo: true, noHints: true });
        assert.ok(ctx.isAchievementUnlocked('synth_first'));
    });

    // ── Daily + Streak ──────────────────────────────────────────────
    // Für Streak-Tests wird Date.now manipuliert, um aufeinanderfolgende
    // Tage zu simulieren.

    function simulateConsecutiveDays(count) {
        // Start-Datum fixieren und pro Aufruf einen Tag weiterzählen
        const startTs = new Date('2025-06-01T12:00:00Z').getTime();
        for (let i = 0; i < count; i++) {
            const fakeNow = startTs + i * 86400000;
            const OrigDate = ctx.Date;
            ctx.Date = class extends OrigDate {
                constructor(...args) {
                    if (args.length === 0) super(fakeNow);
                    else super(...args);
                }
                static now() { return fakeNow; }
            };
            ctx.checkAchievementsOnDailySolve();
            ctx.Date = OrigDate;
        }
    }

    it('daily_first – bei erstem Daily-Solve', () => {
        ctx.checkAchievementsOnDailySolve();
        assert.ok(ctx.isAchievementUnlocked('daily_first'));
    });

    it('streak7 – nach 7 täglichen Solves', () => {
        simulateConsecutiveDays(7);
        assert.ok(ctx.isAchievementUnlocked('streak7'));
    });

    it('streak30 – nach 30 täglichen Solves', () => {
        simulateConsecutiveDays(30);
        assert.ok(ctx.isAchievementUnlocked('streak30'));
    });

    // ── Leaderboard ─────────────────────────────────────────────────

    it('local_podium – bei local first', () => {
        ctx.checkAchievementsOnLeaderboard({ isLocalFirst: true });
        assert.ok(ctx.isAchievementUnlocked('local_podium'));
    });

    it('global_entry – bei global entry', () => {
        ctx.checkAchievementsOnLeaderboard({ isGlobalEntry: true });
        assert.ok(ctx.isAchievementUnlocked('global_entry'));
    });

    it('local_podium – nicht ohne Flag', () => {
        ctx.checkAchievementsOnLeaderboard({});
        assert.ok(!ctx.isAchievementUnlocked('local_podium'));
    });

    // ── Retroactive ─────────────────────────────────────────────────

    it('applyRetroactiveAchievements – vergibt first bei vorhandenen Stats', () => {
        ctx.localStorage.setItem('numori-stats', JSON.stringify({ totalSolved: 5, bySize: {} }));
        ctx.applyRetroactiveAchievements();
        assert.ok(ctx.isAchievementUnlocked('first'));
    });

    it('applyRetroactiveAchievements – nicht bei keinerlei Stats', () => {
        ctx.applyRetroactiveAchievements();
        assert.ok(!ctx.isAchievementUnlocked('first'));
    });

    it('applyRetroactiveAchievements – nur einmal', () => {
        ctx.localStorage.setItem('numori-stats', JSON.stringify({ totalSolved: 100, bySize: {} }));
        ctx.applyRetroactiveAchievements();
        ctx.localStorage.setItem('numori-achievements-retro', 'v1.2');
        ctx.applyRetroactiveAchievements();
        assert.ok(ctx.isAchievementUnlocked('first'));
    });

    // ── Stats-Tracking ──────────────────────────────────────────────

    it('totalSolved wird korrekt hochgezählt', () => {
        for (let i = 0; i < 7; i++)
            ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', cleanSolve: true, noUndo: true, noHints: true });
        const stats = JSON.parse(ctx.localStorage.getItem('numori-achievement-stats'));
        assert.strictEqual(stats.totalSolved, 7);
    });

    it('bySize wird korrekt getrackt', () => {
        ctx.checkAchievementsOnSolve({ size: 3, diff: 'easy', cleanSolve: true, noUndo: true, noHints: true });
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'hard', cleanSolve: true, noUndo: true, noHints: true });
        const stats = JSON.parse(ctx.localStorage.getItem('numori-achievement-stats'));
        assert.strictEqual(stats.bySize['3'], 1);
        assert.strictEqual(stats.bySize['5'], 1);
    });

    it('byTheme wird korrekt getrackt', () => {
        ctx.checkAchievementsOnSolve({ size: 5, diff: 'medium', theme: 'console', cleanSolve: true, noUndo: true, noHints: true });
        const stats = JSON.parse(ctx.localStorage.getItem('numori-achievement-stats'));
        assert.strictEqual(stats.byTheme.console, 1);
    });
});
