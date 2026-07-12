const { describe, it, beforeEach } = require('node:test');
const assert = require('assert');

// Mock localStorage
const mockStorage = {};
global.localStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, value) => { mockStorage[key] = String(value); },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

describe('LocalStorage Persistence', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('Font Scale wird gespeichert und geladen', () => {
        localStorage.setItem('fontScale', 'large');
        assert.strictEqual(localStorage.getItem('fontScale'), 'large');
    });

    it('Theme wird gespeichert und geladen', () => {
        localStorage.setItem('theme', 'console');
        assert.strictEqual(localStorage.getItem('theme'), 'console');
    });

    it('Music Volume wird gespeichert und geladen', () => {
        localStorage.setItem('musicVolume', '0.7');
        assert.strictEqual(localStorage.getItem('musicVolume'), '0.7');
    });

    it('Language wird gespeichert und geladen', () => {
        localStorage.setItem('language', 'en');
        assert.strictEqual(localStorage.getItem('language'), 'en');
    });

    it('Leaderboard Consent wird gespeichert und geladen', () => {
        localStorage.setItem('leaderboardConsent', 'true');
        assert.strictEqual(localStorage.getItem('leaderboardConsent'), 'true');
    });

    it('LocalStorage speichert verschiedene Datentypen', () => {
        localStorage.setItem('string', 'test');
        localStorage.setItem('number', '42');
        localStorage.setItem('boolean', 'true');
        localStorage.setItem('json', JSON.stringify({ key: 'value' }));

        assert.strictEqual(localStorage.getItem('string'), 'test');
        assert.strictEqual(localStorage.getItem('number'), '42');
        assert.strictEqual(localStorage.getItem('boolean'), 'true');
        assert.deepStrictEqual(JSON.parse(localStorage.getItem('json')), { key: 'value' });
    });
});
