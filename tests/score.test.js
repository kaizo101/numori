const { describe, it } = require('node:test');
const assert = require('assert');

// Score-Formel aus supabase-client.js
function calculateGlobalScore(difficultyScore, timeSeconds) {
    return Math.round((difficultyScore + 500) / Math.max(1, timeSeconds) * 10);
}

// Daily Score-Formel aus supabase-client.js
function calculateDailyScore(timeSeconds) {
    return Math.round(500 / Math.max(1, timeSeconds) * 10);
}

describe('Leaderboard Score Calculation', () => {
    describe('Global Leaderboard Score', () => {
        it('Basis-Formel: (difficultyScore + 500) / timeSeconds * 10', () => {
            const score = calculateGlobalScore(100, 60);
            // (100 + 500) / 60 * 10 = 600 / 60 * 10 = 10 * 10 = 100
            assert.strictEqual(score, 100);
        });

        it('Höhere difficultyScore = höherer Score', () => {
            const score1 = calculateGlobalScore(100, 60);
            const score2 = calculateGlobalScore(200, 60);
            assert.ok(score2 > score1);
        });

        it('Kürzere Zeit = höherer Score', () => {
            const score1 = calculateGlobalScore(100, 120);
            const score2 = calculateGlobalScore(100, 60);
            assert.ok(score2 > score1);
        });

        it('Edge Case: Zeit = 0 wird zu 1 (verhindert Division durch 0)', () => {
            const score = calculateGlobalScore(100, 0);
            // (100 + 500) / 1 * 10 = 6000
            assert.strictEqual(score, 6000);
        });

        it('Edge Case: sehr kurze Zeit (1 Sekunde)', () => {
            const score = calculateGlobalScore(100, 1);
            // (100 + 500) / 1 * 10 = 6000
            assert.strictEqual(score, 6000);
        });

        it('Edge Case: sehr lange Zeit (1 Stunde)', () => {
            const score = calculateGlobalScore(100, 3600);
            // (100 + 500) / 3600 * 10 ≈ 1.67
            assert.strictEqual(score, 2);
        });

        it('Score wird gerundet', () => {
            const score = calculateGlobalScore(100, 70);
            // (100 + 500) / 70 * 10 = 600 / 70 * 10 ≈ 85.71
            assert.strictEqual(score, 86);
        });

        it('difficultyScore = 0 funktioniert', () => {
            const score = calculateGlobalScore(0, 60);
            // (0 + 500) / 60 * 10 ≈ 83.33
            assert.strictEqual(score, 83);
        });
    });

    describe('Daily Leaderboard Score', () => {
        it('Basis-Formel: 500 / timeSeconds * 10', () => {
            const score = calculateDailyScore(60);
            // 500 / 60 * 10 ≈ 83.33
            assert.strictEqual(score, 83);
        });

        it('Kürzere Zeit = höherer Score', () => {
            const score1 = calculateDailyScore(120);
            const score2 = calculateDailyScore(60);
            assert.ok(score2 > score1);
        });

        it('Edge Case: Zeit = 0 wird zu 1', () => {
            const score = calculateDailyScore(0);
            // 500 / 1 * 10 = 5000
            assert.strictEqual(score, 5000);
        });

        it('Edge Case: sehr kurze Zeit (1 Sekunde)', () => {
            const score = calculateDailyScore(1);
            // 500 / 1 * 10 = 5000
            assert.strictEqual(score, 5000);
        });

        it('Edge Case: sehr lange Zeit (1 Stunde)', () => {
            const score = calculateDailyScore(3600);
            // 500 / 3600 * 10 ≈ 1.39
            assert.strictEqual(score, 1);
        });

        it('Score wird gerundet', () => {
            const score = calculateDailyScore(70);
            // 500 / 70 * 10 ≈ 71.43
            assert.strictEqual(score, 71);
        });
    });

    describe('Score-Vergleich', () => {
        it('Global Score >= Daily Score für gleiche Zeit', () => {
            // Global hat immer +500 difficultyScore als Baseline
            const time = 60;
            const globalScore = calculateGlobalScore(0, time);
            const dailyScore = calculateDailyScore(time);
            assert.ok(globalScore >= dailyScore);
        });

        it('Beide Scores sind positiv', () => {
            const globalScore = calculateGlobalScore(100, 60);
            const dailyScore = calculateDailyScore(60);
            assert.ok(globalScore > 0);
            assert.ok(dailyScore > 0);
        });
    });
});
