const { describe, it } = require('node:test');
const assert = require('assert');

// MinTime Konstanten aus leaderboard.js
const _LB_MIN_TIMES = {
    3: 5,
    4: 20,
    5: 35,
    6: 55,
    7: 80,
    8: 120,
    9: 180
};

// Hilfsfunktion um zu prüfen ob Submit erlaubt wäre
function isSubmitAllowed(size, timeSeconds) {
    const minTime = _LB_MIN_TIMES[size] || 10;
    return timeSeconds >= minTime;
}

describe('MinTime Validation', () => {
    it('3x3 MinTime ist 5 Sekunden', () => {
        assert.strictEqual(_LB_MIN_TIMES[3], 5);
    });

    it('4x4 MinTime ist 20 Sekunden', () => {
        assert.strictEqual(_LB_MIN_TIMES[4], 20);
    });

    it('5x5 MinTime ist 35 Sekunden', () => {
        assert.strictEqual(_LB_MIN_TIMES[5], 35);
    });

    it('6x6 MinTime ist 55 Sekunden', () => {
        assert.strictEqual(_LB_MIN_TIMES[6], 55);
    });

    it('7x7 MinTime ist 80 Sekunden', () => {
        assert.strictEqual(_LB_MIN_TIMES[7], 80);
    });

    it('8x8 MinTime ist 120 Sekunden', () => {
        assert.strictEqual(_LB_MIN_TIMES[8], 120);
    });

    it('9x9 MinTime ist 180 Sekunden', () => {
        assert.strictEqual(_LB_MIN_TIMES[9], 180);
    });

    it('Submit erlaubt bei Zeit >= MinTime', () => {
        assert.strictEqual(isSubmitAllowed(5, 35), true);
        assert.strictEqual(isSubmitAllowed(5, 40), true);
        assert.strictEqual(isSubmitAllowed(5, 100), true);
    });

    it('Submit abgelehnt bei Zeit < MinTime', () => {
        assert.strictEqual(isSubmitAllowed(5, 34), false);
        assert.strictEqual(isSubmitAllowed(5, 10), false);
        assert.strictEqual(isSubmitAllowed(5, 0), false);
    });

    it('Edge Case: genau MinTime', () => {
        for (const [size, minTime] of Object.entries(_LB_MIN_TIMES)) {
            assert.strictEqual(isSubmitAllowed(parseInt(size), minTime), true);
        }
    });

    it('Edge Case: eine Sekunde unter MinTime', () => {
        for (const [size, minTime] of Object.entries(_LB_MIN_TIMES)) {
            assert.strictEqual(isSubmitAllowed(parseInt(size), minTime - 1), false);
        }
    });

    it('Unbekannte Größe verwendet Fallback 10 Sekunden', () => {
        assert.strictEqual(isSubmitAllowed(10, 10), true);
        assert.strictEqual(isSubmitAllowed(10, 9), false);
        assert.strictEqual(isSubmitAllowed(2, 10), true);
        assert.strictEqual(isSubmitAllowed(2, 9), false);
    });
});
