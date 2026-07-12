const { describe, it } = require('node:test');
const assert = require('assert');

// Daily Seed-Generierung aus puzzle.js
function getDailyDateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDailySeed(dateKey) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let hash = 5381;
    for (let i = 0; i < dateKey.length; i++) {
        hash = ((hash << 5) + hash) + dateKey.charCodeAt(i);
        hash = hash & hash;
    }
    hash = Math.abs(hash);
    let seed = '';
    for (let i = 0; i < 6; i++) {
        seed += chars[hash % chars.length];
        hash = Math.floor(hash / chars.length);
    }
    return seed;
}

// Daily Schedule aus constants.js
const DAILY_SCHEDULE = {
    0: { size: 4, diff: 'easy' },    // Sonntag
    1: { size: 4, diff: 'medium' },  // Montag
    2: { size: 5, diff: 'easy' },    // Dienstag
    3: { size: 5, diff: 'medium' },  // Mittwoch
    4: { size: 5, diff: 'hard' },    // Donnerstag
    5: { size: 6, diff: 'medium' },  // Freitag
    6: { size: 6, diff: 'hard' }     // Samstag
};

function getDailyConfig(date = new Date()) {
    const dayOfWeek = date.getDay();
    return DAILY_SCHEDULE[dayOfWeek];
}

describe('Daily Puzzle Determinism', () => {
    describe('Date Key Generation', () => {
        it('Format ist YYYY-MM-DD', () => {
            const date = new Date('2024-03-15T12:00:00Z');
            const key = getDailyDateKey(date);
            assert.strictEqual(key, '2024-03-15');
        });

        it('Monat wird mit führender Null formatiert', () => {
            const date = new Date('2024-01-05T12:00:00Z');
            const key = getDailyDateKey(date);
            assert.strictEqual(key, '2024-01-05');
        });

        it('Tag wird mit führender Null formatiert', () => {
            const date = new Date('2024-12-01T12:00:00Z');
            const key = getDailyDateKey(date);
            assert.strictEqual(key, '2024-12-01');
        });
    });

    describe('Daily Seed Generation', () => {
        it('Seed ist 6 Zeichen lang', () => {
            const seed = getDailySeed('2024-03-15');
            assert.strictEqual(seed.length, 6);
        });

        it('Seed enthält nur erlaubte Zeichen', () => {
            const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            const seed = getDailySeed('2024-03-15');
            for (const char of seed) {
                assert.ok(allowedChars.includes(char), `Zeichen ${char} ist nicht erlaubt`);
            }
        });

        it('Gleicher Date Key = gleicher Seed (deterministisch)', () => {
            const seed1 = getDailySeed('2024-03-15');
            const seed2 = getDailySeed('2024-03-15');
            assert.strictEqual(seed1, seed2);
        });

        it('Unterschiedliche Date Keys = unterschiedliche Seeds', () => {
            const seed1 = getDailySeed('2024-03-15');
            const seed2 = getDailySeed('2024-03-16');
            assert.notStrictEqual(seed1, seed2);
        });

        it('Seed ist konsistent über mehrere Aufrufe', () => {
            const seeds = [];
            for (let i = 0; i < 10; i++) {
                seeds.push(getDailySeed('2024-03-15'));
            }
            const allSame = seeds.every(s => s === seeds[0]);
            assert.ok(allSame, 'Alle Seeds sollten identisch sein');
        });
    });

    describe('Daily Schedule', () => {
        it('Sonntag: 4x4 Easy', () => {
            const date = new Date('2024-03-17T12:00:00Z'); // Sonntag
            const config = getDailyConfig(date);
            assert.strictEqual(config.size, 4);
            assert.strictEqual(config.diff, 'easy');
        });

        it('Montag: 4x4 Medium', () => {
            const date = new Date('2024-03-18T12:00:00Z'); // Montag
            const config = getDailyConfig(date);
            assert.strictEqual(config.size, 4);
            assert.strictEqual(config.diff, 'medium');
        });

        it('Dienstag: 5x5 Easy', () => {
            const date = new Date('2024-03-19T12:00:00Z'); // Dienstag
            const config = getDailyConfig(date);
            assert.strictEqual(config.size, 5);
            assert.strictEqual(config.diff, 'easy');
        });

        it('Mittwoch: 5x5 Medium', () => {
            const date = new Date('2024-03-20T12:00:00Z'); // Mittwoch
            const config = getDailyConfig(date);
            assert.strictEqual(config.size, 5);
            assert.strictEqual(config.diff, 'medium');
        });

        it('Donnerstag: 5x5 Hard', () => {
            const date = new Date('2024-03-21T12:00:00Z'); // Donnerstag
            const config = getDailyConfig(date);
            assert.strictEqual(config.size, 5);
            assert.strictEqual(config.diff, 'hard');
        });

        it('Freitag: 6x6 Medium', () => {
            const date = new Date('2024-03-22T12:00:00Z'); // Freitag
            const config = getDailyConfig(date);
            assert.strictEqual(config.size, 6);
            assert.strictEqual(config.diff, 'medium');
        });

        it('Samstag: 6x6 Hard', () => {
            const date = new Date('2024-03-23T12:00:00Z'); // Samstag
            const config = getDailyConfig(date);
            assert.strictEqual(config.size, 6);
            assert.strictEqual(config.diff, 'hard');
        });

        it('Wochenaufstieg: Schwierigkeit steigt über die Woche', () => {
            const configs = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date('2024-03-17T12:00:00Z');
                date.setDate(date.getDate() + day);
                configs.push(getDailyConfig(date));
            }
            
            // Prüfe dass Größe mindestens gleich bleibt oder steigt
            for (let i = 1; i < configs.length; i++) {
                assert.ok(
                    configs[i].size >= configs[i-1].size,
                    `Tag ${i} sollte >= Größe von Tag ${i-1} haben`
                );
            }
        });
    });

    describe('Integration: Date → Seed', () => {
        it('Kompletter Flow: Date → DateKey → Seed', () => {
            const date = new Date('2024-03-15T12:00:00Z');
            const dateKey = getDailyDateKey(date);
            const seed = getDailySeed(dateKey);
            
            assert.strictEqual(dateKey, '2024-03-15');
            assert.strictEqual(seed.length, 6);
        });

        it('Zwei aufeinanderfolgende Tage haben unterschiedliche Seeds', () => {
            const date1 = new Date('2024-03-15T12:00:00Z');
            const date2 = new Date('2024-03-16T12:00:00Z');
            
            const seed1 = getDailySeed(getDailyDateKey(date1));
            const seed2 = getDailySeed(getDailyDateKey(date2));
            
            assert.notStrictEqual(seed1, seed2);
        });
    });
});
