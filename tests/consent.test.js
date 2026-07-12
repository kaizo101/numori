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

// Consent-Logik aus leaderboard.js
function getConsentState() {
    return localStorage.getItem('numori-lb-consent');
}

function setConsentState(state) {
    localStorage.setItem('numori-lb-consent', state);
}

function shouldSubmitToLeaderboard() {
    const consent = getConsentState();
    return consent === 'granted';
}

function shouldShowConsentModal() {
    const consent = getConsentState();
    return consent === null;
}

function shouldShowConsentWarning() {
    const consent = getConsentState();
    return consent === 'denied';
}

describe('Consent Toggle', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('Consent State Management', () => {
        it('Initialer Zustand ist null (nicht gesetzt)', () => {
            assert.strictEqual(getConsentState(), null);
        });

        it('Consent kann auf "granted" gesetzt werden', () => {
            setConsentState('granted');
            assert.strictEqual(getConsentState(), 'granted');
        });

        it('Consent kann auf "denied" gesetzt werden', () => {
            setConsentState('denied');
            assert.strictEqual(getConsentState(), 'denied');
        });

        it('Consent kann gewechselt werden', () => {
            setConsentState('granted');
            assert.strictEqual(getConsentState(), 'granted');
            
            setConsentState('denied');
            assert.strictEqual(getConsentState(), 'denied');
            
            setConsentState('granted');
            assert.strictEqual(getConsentState(), 'granted');
        });
    });

    describe('Submit-Logik', () => {
        it('Submit erlaubt wenn Consent = "granted"', () => {
            setConsentState('granted');
            assert.strictEqual(shouldSubmitToLeaderboard(), true);
        });

        it('Submit abgelehnt wenn Consent = "denied"', () => {
            setConsentState('denied');
            assert.strictEqual(shouldSubmitToLeaderboard(), false);
        });

        it('Submit abgelehnt wenn Consent = null', () => {
            assert.strictEqual(shouldSubmitToLeaderboard(), false);
        });
    });

    describe('Consent Modal Logik', () => {
        it('Modal wird gezeigt wenn Consent = null', () => {
            assert.strictEqual(shouldShowConsentModal(), true);
        });

        it('Modal wird NICHT gezeigt wenn Consent = "granted"', () => {
            setConsentState('granted');
            assert.strictEqual(shouldShowConsentModal(), false);
        });

        it('Modal wird NICHT gezeigt wenn Consent = "denied"', () => {
            setConsentState('denied');
            assert.strictEqual(shouldShowConsentModal(), false);
        });
    });

    describe('Consent Warning Logik', () => {
        it('Warning wird gezeigt wenn Consent = "denied"', () => {
            setConsentState('denied');
            assert.strictEqual(shouldShowConsentWarning(), true);
        });

        it('Warning wird NICHT gezeigt wenn Consent = "granted"', () => {
            setConsentState('granted');
            assert.strictEqual(shouldShowConsentWarning(), false);
        });

        it('Warning wird NICHT gezeigt wenn Consent = null', () => {
            assert.strictEqual(shouldShowConsentWarning(), false);
        });
    });

    describe('Kombinierte Logik', () => {
        it('Consent = null: Modal zeigen, kein Submit, keine Warning', () => {
            assert.strictEqual(shouldShowConsentModal(), true);
            assert.strictEqual(shouldSubmitToLeaderboard(), false);
            assert.strictEqual(shouldShowConsentWarning(), false);
        });

        it('Consent = "granted": kein Modal, Submit erlaubt, keine Warning', () => {
            setConsentState('granted');
            assert.strictEqual(shouldShowConsentModal(), false);
            assert.strictEqual(shouldSubmitToLeaderboard(), true);
            assert.strictEqual(shouldShowConsentWarning(), false);
        });

        it('Consent = "denied": kein Modal, kein Submit, Warning zeigen', () => {
            setConsentState('denied');
            assert.strictEqual(shouldShowConsentModal(), false);
            assert.strictEqual(shouldSubmitToLeaderboard(), false);
            assert.strictEqual(shouldShowConsentWarning(), true);
        });
    });
});
