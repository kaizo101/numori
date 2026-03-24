// ── FLIPPER THEME ────────────────────────────────────────────────

const flipperSounds = (() => {
    let _ctx = null;

    function ac() {
        if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (_ctx.state === 'suspended') _ctx.resume();
        return _ctx;
    }
    function active() {
        return document.documentElement.getAttribute('data-theme') === 'flipper';
    }

    // Kurzes "Boing" beim Eintragen einer Zahl
    function bumper() {
        if (!active()) return;
        const a = ac(), osc = a.createOscillator(), g = a.createGain();
        osc.connect(g); g.connect(a.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, a.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, a.currentTime + 0.07);
        g.gain.setValueAtTime(0.35, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.09);
        osc.start(); osc.stop(a.currentTime + 0.09);
    }

    // Metallischer Clink beim Coinslot
    function coin() {
        if (!active()) return;
        const a = ac();
        [1200, 1390].forEach(freq => {
            const osc = a.createOscillator(), g = a.createGain();
            osc.connect(g); g.connect(a.destination);
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.12, a.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.18);
            osc.start(); osc.stop(a.currentTime + 0.18);
        });
        const buf = a.createBuffer(1, Math.floor(a.sampleRate * 0.03), a.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const src = a.createBufferSource(), g = a.createGain();
        src.buffer = buf; g.gain.value = 0.25;
        src.connect(g); g.connect(a.destination); src.start();
    }

    // Aufsteigende Multiball-Fanfare bei Lösung
    function win() {
        if (!active()) return;
        const a = ac();
        [523, 659, 784, 1047].forEach((freq, i) => {
            const t = a.currentTime + i * 0.13;
            const osc = a.createOscillator(), g = a.createGain();
            osc.connect(g); g.connect(a.destination);
            osc.type = 'square';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.12, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.start(t); osc.stop(t + 0.21);
        });
    }

    // Absteigende Sirene bei Tilt
    function tilt() {
        if (!active()) return;
        const a = ac(), osc = a.createOscillator(), g = a.createGain();
        osc.connect(g); g.connect(a.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, a.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, a.currentTime + 0.5);
        g.gain.setValueAtTime(0.3, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.55);
        osc.start(); osc.stop(a.currentTime + 0.55);
    }

    // Kurzer Tick wenn neuer Tally-Posten erscheint
    function tallyTick(isNegative) {
        if (!active()) return;
        const a = ac(), osc = a.createOscillator(), g = a.createGain();
        osc.connect(g); g.connect(a.destination);
        osc.type = 'square';
        osc.frequency.value = isNegative ? 180 : 440;
        g.gain.setValueAtTime(0.08, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.06);
        osc.start(); osc.stop(a.currentTime + 0.06);
    }

    // Akkord wenn TOTAL erscheint
    function tallyTotal() {
        if (!active()) return;
        const a = ac();
        [440, 554, 659].forEach((freq, i) => {
            const t = a.currentTime + i * 0.04;
            const osc = a.createOscillator(), g = a.createGain();
            osc.connect(g); g.connect(a.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.1, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.start(t); osc.stop(t + 0.36);
        });
    }

    return { bumper, coin, win, tilt, tallyTick, tallyTotal };
})();

// FLIPPER DMD PANEL
const flipperDMD = (() => {
    let canvas = null, ctx = null, gridOvc = null, animFrame = null;
    let state = 'attract';
    let stateData = {};
    let stateElapsed = 0, lastFrameTime = 0;
    let attractPhase = 0, attractPhaseEl = 0;
    let hsRain = null;
    let _coinClicks = 0, _coinTimer = null;
    let _rickAudio = null;
    let _globalRank = undefined;      // undefined = kein Consent/nicht verfügbar, number = Rang
    let _globalRankLoading = false;

    function playRickRollChiptune() {
        if (_rickAudio) { try { _rickAudio.close(); } catch(e){} _rickAudio = null; }
        if (!window.AudioContext && !window.webkitAudioContext) return;
        const AC = new (window.AudioContext || window.webkitAudioContext)();
        _rickAudio = AC;

        const Q = 60 / 113;           // quarter note @ 113 BPM
        const E = Q / 2;              // eighth note
        const H = Q * 2;              // half note
        const D = Q * 1.5;            // dotted quarter

        const Gs4=415.30, A4=440.00, B4=493.88;
        const Cs5=554.37, D5=587.33, E5=659.25, Fs5=739.99;

        // Verified notes (noobnotes.net):
        // "Never gonna give you up":  A B ^D B ^F# ^F# ^E
        // "Never gonna let you down": A B ^D B ^E ^E ^D ^C# B
        // Line 3 approximated from song
        const melody = [
            // "Never gonna give you up"
            [A4,E],[B4,E],[D5,E],[B4,D],[Fs5,E],[Fs5,E],[E5,H],[null,Q],
            // "Never gonna let you down"
            [A4,E],[B4,E],[D5,E],[B4,D],[E5,Q],[D5,E],[Cs5,E],[B4,H],[null,Q],
            // "Never gonna run around and desert you"
            [Fs5,E],[Fs5,E],[D5,Q],[B4,E],[A4,Q],[Gs4,E],[A4,E],[B4,Q],[null,Q],
            // "Never gonna make you cry"
            [A4,E],[B4,E],[D5,E],[B4,D],[Fs5,E],[Fs5,E],[E5,H],[null,Q],
            // "Never gonna say goodbye"
            [A4,E],[B4,E],[D5,E],[B4,D],[E5,Q],[D5,E],[Cs5,E],[B4,H],[null,Q],
            // "Never gonna tell a lie and hurt you"
            [Fs5,E],[Fs5,E],[D5,Q],[B4,E],[A4,Q],[Gs4,E],[A4,E],[B4,H],
        ];

        let t = AC.currentTime + 0.05;
        for (const [freq, dur] of melody) {
            if (freq) {
                const osc = AC.createOscillator();
                const gain = AC.createGain();
                osc.connect(gain); gain.connect(AC.destination);
                osc.type = 'square';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.07, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.82);
                osc.start(t); osc.stop(t + dur);
            }
            t += dur;
        }
    }

    function stopRickRollChiptune() {
        if (_rickAudio) { try { _rickAudio.close(); } catch(e){} _rickAudio = null; }
    }

    // Rick Astley pixel art — 18×34, four dance frames
    const RICK_FRAMES = [
      // Frame 0: neutral standing, arms slightly out, mic on right side, legs apart
      [ [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],  // row  0 – pompadour top
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  1
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],  // row  2
        [0,0,0,1,1,0,1,1,1,0,1,1,0,0,0,0,0,0],  // row  3 – hair + eyes
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  4 – face
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  5 – face lower
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],  // row  6 – chin
        [0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0,0],  // row  7 – shoulders/arms
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],  // row  8 – upper torso
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],  // row  9 – chest
        [0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0,0],  // row 10 – arms out
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 11 – waist
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 12 – waist
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],  // row 13 – hips wide
        [0,0,1,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 14 – upper legs
        [0,0,1,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 15
        [0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 16
        [0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 17
        [0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 18
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 19 – knee split
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 20
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 21
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 22
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 23 – lower legs
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 24
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 25
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 26
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 27
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 28
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 29
        [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0],  // row 30 – feet
        [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0],  // row 31
        [0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0],  // row 32
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],  // row 33
      ],
      // Frame 1: slight bob down, right arm forward with mic, legs shifted left
      [ [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],  // row  0
        [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0],  // row  1
        [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],  // row  2
        [0,0,0,0,1,1,0,1,1,1,0,1,1,0,0,0,0,0],  // row  3
        [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0],  // row  4
        [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0],  // row  5
        [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],  // row  6
        [0,0,1,0,1,1,1,1,1,1,1,0,0,1,1,1,0,0],  // row  7 – mic arm extends right
        [0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0],  // row  8
        [0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,0,0],  // row  9
        [0,0,1,0,1,1,1,1,1,1,1,0,0,0,0,1,0,0],  // row 10 – mic
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 11
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 12
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],  // row 13
        [0,1,1,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 14
        [0,1,1,1,0,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 15
        [0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 16
        [0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 17
        [0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 18
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 19
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 20
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 21
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 22
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 23
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 24
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 25
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 26
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 27
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 28
        [0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 29
        [0,1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0],  // row 30
        [0,1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0],  // row 31
        [0,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0],  // row 32
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],  // row 33
      ],
      // Frame 2: classic arm raise / point gesture, left knee bent
      [ [0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0],  // row  0 – pompadour + raised hand
        [0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0],  // row  1
        [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0],  // row  2
        [0,0,0,1,1,0,1,1,1,0,1,0,0,0,0,1,1,0],  // row  3
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,0,0],  // row  4
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,0,0],  // row  5
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,0,0,0],  // row  6
        [0,0,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  7 – left arm raises up-right
        [0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],  // row  8
        [0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],  // row  9
        [0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0,0],  // row 10
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 11
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 12
        [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],  // row 13
        [0,0,1,1,1,0,0,1,1,0,0,1,0,0,0,0,0,0],  // row 14
        [0,0,1,1,0,0,0,1,1,0,0,1,0,0,0,0,0,0],  // row 15
        [0,0,1,1,0,0,0,1,1,0,0,0,1,0,0,0,0,0],  // row 16 – right leg bends outward
        [0,0,1,1,0,0,0,1,1,0,0,0,1,0,0,0,0,0],  // row 17
        [0,0,1,1,0,0,0,1,1,0,0,0,0,1,0,0,0,0],  // row 18
        [0,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0],  // row 19 – bent knee
        [0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0],  // row 20
        [0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],  // row 21
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 22
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 23
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 24
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 25
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 26
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 27
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 28
        [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],  // row 29
        [0,1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0],  // row 30
        [0,1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0],  // row 31
        [0,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0],  // row 32
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],  // row 33
      ],
      // Frame 3: lean/recovery pose, opposite arm out, legs re-centered
      [ [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],  // row  0
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  1
        [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  2
        [0,0,0,1,1,0,1,1,1,0,1,0,0,0,0,0,0,0],  // row  3
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  4
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row  5
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],  // row  6
        [1,1,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0,0],  // row  7 – left arm extends far left
        [1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],  // row  8
        [0,1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],  // row  9
        [0,0,0,0,1,1,1,1,1,1,1,0,1,0,0,0,0,0],  // row 10
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 11
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],  // row 12
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],  // row 13
        [0,0,0,1,1,1,0,1,1,0,1,1,1,0,0,0,0,0],  // row 14 – legs together-ish
        [0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 15
        [0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 16
        [0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 17
        [0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0],  // row 18
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 19
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 20
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 21
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 22
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 23
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 24
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 25
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 26
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 27
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 28
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],  // row 29
        [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0],  // row 30
        [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0],  // row 31
        [0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0],  // row 32
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],  // row 33
      ],
    ];

    let tallyItems = [], tallyBuilt = false, winActivated = false;
    let _lastTallyIdx = -1;
    let initialsValue = '', initialsKeyHandler = null;

    const DOT  = 3;                          // dot pitch in px
    const HI   = '#ffaa00';                  // bright amber (phosphor "on")
    const MED  = '#cc7a00';
    const LO   = '#8a4800';
    const OFF  = '#2e1200';
    const FONT = "'Bitcount Grid Single', monospace";
    const MONO = "'Share Tech Mono', monospace";

    function buildGrid(w, h) {
        const oc = document.createElement('canvas');
        oc.width = w; oc.height = h;
        const g = oc.getContext('2d');
        // Mask: dark gaps between dots (draw black grid first)
        g.fillStyle = '#000000';
        g.fillRect(0, 0, w, h);
        // Punch out dot-shaped holes (transparent circles = let canvas beneath show)
        g.globalCompositeOperation = 'destination-out';
        for (let y = DOT/2; y < h; y += DOT)
            for (let x = DOT/2; x < w; x += DOT) {
                g.beginPath(); g.arc(x, y, DOT * 0.42, 0, Math.PI * 2); g.fill();
            }
        g.globalCompositeOperation = 'source-over';
        // Dim OFF-state: faint amber circles visible in the gaps that were punched
        // Re-draw smaller ambient dots on top
        g.fillStyle = 'rgba(120,40,0,0.22)';
        for (let y = DOT/2; y < h; y += DOT)
            for (let x = DOT/2; x < w; x += DOT) {
                g.beginPath(); g.arc(x, y, DOT * 0.42, 0, Math.PI * 2); g.fill();
            }
        return oc;
    }

    function start() {
        canvas = document.getElementById('flipper-dmd');
        if (!canvas) return;

        // Easter egg: 10x Coinslot klicken
        const coinslot = document.querySelector('.coinslot');
        if (coinslot && !coinslot._rickHandler) {
            coinslot._rickHandler = () => {
                flipperSounds.coin();
                _coinClicks++;
                clearTimeout(_coinTimer);
                _coinTimer = setTimeout(() => { _coinClicks = 0; }, 3000);
                if (_coinClicks >= 10) { _coinClicks = 0; setState('rickroll'); }
            };
            coinslot.addEventListener('click', coinslot._rickHandler);
        }
        // Klick auf DMD: Blur-Overlay entfernen (Win-Screen)
        if (!canvas._clickHandler) {
            canvas._clickHandler = () => {
                if ((state === 'win' || state === 'tilt' || state === 'highscore') && winActivated) {
                    hideWinBanner();
                }
            };
            canvas.addEventListener('click', canvas._clickHandler);
            canvas.style.cursor = 'pointer';
        }

        const init = () => {
            const r = canvas.getBoundingClientRect();
            const w = Math.round(r.width), h = Math.round(r.height);
            if (!w || !h) { requestAnimationFrame(init); return; }
            canvas.width = w; canvas.height = h;
            ctx = canvas.getContext('2d');
            gridOvc = buildGrid(w, h);
            if (window.ResizeObserver) new ResizeObserver(() => {
                const rr = canvas.getBoundingClientRect();
                canvas.width = Math.round(rr.width); canvas.height = Math.round(rr.height);
                ctx = canvas.getContext('2d');
                gridOvc = buildGrid(canvas.width, canvas.height);
            }).observe(canvas);
            lastFrameTime = performance.now();
            loop(lastFrameTime);
        };
        requestAnimationFrame(init);
    }

    function stop() {
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
        removeKey();
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setState(newState, newData) {
        state = newState;
        stateData = newData || {};
        stateElapsed = 0;
        tallyBuilt = false; winActivated = false; _lastTallyIdx = -1;
        if (newState === 'attract' || newState === 'playing') { _globalRank = undefined; _globalRankLoading = false; }
        if (newState === 'attract') { attractPhase = 0; attractPhaseEl = 0; }
        if (newState !== 'highscore') hsRain = null;
        if (newState === 'rickroll') playRickRollChiptune();
        else stopRickRollChiptune();
        removeKey();
        if (newState === 'initials') {
            initialsValue = localStorage.getItem('numori-player-name') || '';
            setupKey();
            // Auf Mobile: Tastatur öffnen via verstecktes Input
            if (canvas.width < 600) {
                _flipperWinPhase = 'initials';
                let inp = document.getElementById('dmd-mobile-input');
                if (!inp) {
                    inp = document.createElement('input');
                    inp.id = 'dmd-mobile-input';
                    inp.setAttribute('autocomplete', 'off');
                    inp.setAttribute('autocorrect', 'off');
                    inp.setAttribute('autocapitalize', 'none');
                    inp.setAttribute('spellcheck', 'false');
                    inp.style.cssText = 'position:fixed;top:50%;left:50%;opacity:0;width:1px;height:1px;border:none;outline:none;z-index:99998;';
                    document.body.appendChild(inp);
                    inp.addEventListener('paste', (e) => e.preventDefault());
                    inp.addEventListener('input', () => {
                        const newVal = inp.value;
                        const prevLen = initialsValue.length;
                        if (newVal.length <= prevLen || newVal.length === prevLen + 1) {
                            initialsValue = newVal.slice(0, 16);
                        }
                        inp.value = initialsValue;
                    });
                    inp.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const n = initialsValue.trim() || t('lb-anon');
                            stateData.onConfirm?.(n);
                        } else if (e.key === 'Escape') {
                            stateData.onCancel?.();
                        } else if (e.key === 'Backspace') {
                            initialsValue = initialsValue.slice(0, -1);
                            inp.value = initialsValue;
                            e.preventDefault();
                        }
                    });
                }
                initialsValue = '';
                inp.value = '';
                setTimeout(() => inp.focus(), 80);
            }
        }
        if (newState === 'highscore' && canvas.width < 600) {
            _flipperWinPhase = 'highscore';
        }
    }

    function removeKey() {
        if (initialsKeyHandler) { document.removeEventListener('keydown', initialsKeyHandler, true); initialsKeyHandler = null; }
        document.getElementById('dmd-mobile-input')?.remove();
    }

    function setupKey() {
        initialsKeyHandler = (e) => {
            const a = document.activeElement;
            if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return;
            if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); const n = initialsValue.trim() || t('lb-anon'); stateData.onConfirm?.(n); }
            else if (e.key === 'Escape') { e.stopPropagation(); stateData.onCancel?.(); }
            else if (e.key === 'Backspace') { initialsValue = initialsValue.slice(0,-1); e.preventDefault(); e.stopPropagation(); }
            else if (e.key.length === 1) { if (initialsValue.length < 16) initialsValue += e.key; e.stopPropagation(); }
        };
        document.addEventListener('keydown', initialsKeyHandler, true);
    }

    const CX    = () => canvas.width / 2;
    const Y_TOP = () => canvas.height * 0.16;
    const Y_MID = () => canvas.height * 0.55;
    const Y_BOT = () => canvas.height * 0.82;
    const fs    = px => Math.max(6, Math.round(canvas.height * px / 110));

    function txt(s, x, y, size, color, font, align) {
        ctx.font = `bold ${size}px ${font||FONT}`;
        ctx.letterSpacing = font ? '2px' : '5px';
        ctx.textAlign = align||'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        // Layered phosphor glow: outer diffuse + inner bright halo
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 0.9;
        ctx.fillText(s, x, y);
        ctx.shadowBlur = size * 0.4;
        ctx.fillText(s, x, y);
        ctx.shadowBlur = 0;
        ctx.letterSpacing = '0px';
    }

    function drawAttract(dt) {
        attractPhaseEl += dt;
        if (attractPhase === 0) {
            txt('N U M O R I', CX(), (Y_TOP() + Y_MID()) / 2, fs(44), HI);
            {
                const n  = parseInt(document.getElementById('size')?.value??'4');
                const df = document.getElementById('difficulty')?.value??'medium';
                const dl = {easy:'EASY',medium:'MEDIUM',hard:'HARD',expert:'EXPERT'};
                const line = `INSERT COIN  ·  ${n}×${n}  ${dl[df]||''}  ·  PRESS START`;
                ctx.save();
                ctx.font = `${fs(18)}px ${MONO}`; ctx.textBaseline = 'middle';
                ctx.shadowBlur = 4;
                const tw = ctx.measureText(line).width;
                if (tw <= canvas.width) {
                    // Desktop: blinken
                    if (Math.floor(attractPhaseEl/600)%2===0) {
                        ctx.fillStyle = MED; ctx.shadowColor = MED;
                        ctx.textAlign = 'center';
                        ctx.fillText(line, CX(), Y_BOT());
                    }
                } else {
                    // Mobile: durchlauf ohne blinken
                    ctx.fillStyle = MED; ctx.shadowColor = MED;
                    const offset = ((attractPhaseEl/1000) * 60) % (tw + canvas.width);
                    ctx.fillText(line, canvas.width - offset, Y_BOT());
                }
                ctx.restore();
            }
            if (attractPhaseEl >= 5000) { attractPhase=1; attractPhaseEl=0; }
        } else if (attractPhase === 1) {
            const lb = loadLeaderboard();
            const entries = [];
            const diffLabel = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', expert: 'EXPERT' };
            const ordinals = ['','1ST','2ND','3RD','4TH','5TH'];
            for (const sz of [3,4,5,6,7,8]) for (const df of ['easy','medium','hard','expert']) {
                const top = lb[sz]?.[df]?.[0];
                if (top) {
                    const m = Math.floor(top.time/60), s = String(top.time%60).padStart(2,'0');
                    entries.push({ cat: `${sz}×${sz}  ${diffLabel[df]}`, name: top.name.toUpperCase(), time: `${m}:${s}` });
                }
            }

            const blink = Math.floor(attractPhaseEl/500)%2===0;
            txt('★  HIGH SCORES  ★', CX(), Y_TOP(), fs(18), blink ? HI : MED);

            if (entries.length === 0) {
                txt('NO ENTRIES YET', CX(), Y_MID(), fs(22), LO, MONO);
            } else {
                const ENTRY_MS = 2200;
                const idx = Math.floor(attractPhaseEl / ENTRY_MS) % entries.length;
                const phaseT = (attractPhaseEl % ENTRY_MS) / ENTRY_MS;
                const alpha = phaseT < 0.1 ? phaseT / 0.1 : phaseT > 0.85 ? (1 - phaseT) / 0.15 : 1;
                const e = entries[idx];
                const CAT_Y  = canvas.height * 0.40;
                const NAME_Y = canvas.height * 0.64;
                const TIME_Y = canvas.height * 0.86;
                ctx.save(); ctx.globalAlpha = alpha;
                txt(e.cat, CX(), CAT_Y, fs(12), LO, MONO);
                ctx.font = `bold ${fs(22)}px ${MONO}`; ctx.textBaseline = 'middle';
                ctx.shadowBlur = 6;
                ctx.textAlign = 'center'; ctx.fillStyle = HI; ctx.shadowColor = HI; ctx.fillText(e.name, CX(), NAME_Y);
                txt(e.time, CX(), TIME_Y, fs(14), MED, MONO);
                ctx.restore();
            }
            if (attractPhaseEl >= 10000) { attractPhase=0; attractPhaseEl=0; }
        }
    }

    function drawRickRoll(dt) {
        const COLS = 18, ROWS = 34;

        if (stateElapsed < 2500) {
            // ── Phase 1: blinking "YOU GOT RICK ROLL'D" flash-in ──────────────
            const flashDur = 400;
            const alpha = Math.min(1, stateElapsed / flashDur);
            const blink = Math.floor(stateElapsed / 500) % 2 === 0;
            ctx.save();
            ctx.globalAlpha = alpha;
            if (blink) {
                txt('YOU GOT', CX(), canvas.height * 0.38, fs(28), HI);
                txt("RICK ROLL'D", CX(), canvas.height * 0.62, fs(32), '#ffdd00');
            } else {
                txt('YOU GOT', CX(), canvas.height * 0.38, fs(28), MED);
                txt("RICK ROLL'D", CX(), canvas.height * 0.62, fs(28), MED);
            }
            ctx.restore();
        } else {
            // ── Phase 2: full dancing pixel-art figure ────────────────────────

            // Subtle lattice/window background (dim diagonal crosshatch)
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = LO;
            ctx.lineWidth = 0.8;
            const spacing = 12;
            const dw = canvas.width, dh = canvas.height;
            for (let i = -dh; i < dw + dh; i += spacing) {
                ctx.beginPath(); ctx.moveTo(i, 0);        ctx.lineTo(i + dh, dh);  ctx.stroke();
                ctx.beginPath(); ctx.moveTo(i + dh, 0);   ctx.lineTo(i, dh);       ctx.stroke();
            }
            ctx.restore();

            // Dancing figure
            const figX = Math.round(CX() - (COLS * DOT) / 2);
            const figY = Math.round((canvas.height - ROWS * DOT) / 2);
            const frame = RICK_FRAMES[Math.floor((stateElapsed - 2500) / 300) % 4];

            ctx.save();
            ctx.fillStyle = HI;
            ctx.shadowColor = HI;
            ctx.shadowBlur = 4;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (frame[r][c]) {
                        ctx.fillRect(figX + c * DOT, figY + r * DOT, DOT - 0.5, DOT - 0.5);
                    }
                }
            }
            ctx.restore();

            // Scrolling ticker at bottom
            const scrollTxt = '♪  NEVER GONNA GIVE YOU UP  ·  NEVER GONNA LET YOU DOWN  ♪';
            ctx.save();
            ctx.font = `${fs(13)}px ${MONO}`; ctx.textBaseline = 'middle';
            ctx.fillStyle = MED; ctx.shadowColor = MED; ctx.shadowBlur = 4;
            const tw = ctx.measureText(scrollTxt).width;
            const elapsed2 = stateElapsed - 2500;
            const offset = ((elapsed2 / 1000) * 55) % (tw + canvas.width);
            ctx.fillText(scrollTxt, canvas.width - offset, Y_BOT());
            ctx.restore();
        }

        if (stateElapsed >= 16000) setState('attract');
    }

    function drawPlaying() {
        const d = stateData;
        const dl = {easy:'EASY',medium:'MEDIUM',hard:'HARD',expert:'EXPERT'};

        const PL_TOP = canvas.height * 0.28;
        const PL_MID = canvas.height * 0.65;
        txt(`${d.size||'?'}×${d.size||'?'}  ${dl[d.diff]||''}  ID: ${(d.seed||'').toUpperCase()}`, CX(), PL_TOP, fs(18), MED, MONO);
        if (canvas.width < 600) {
            txt(`${moveCount} MOVES`, CX(), PL_MID, fs(40), HI);
        } else {
            const timerTxt = typeof formatTime === 'function' ? formatTime(elapsedSeconds) : '00:00';
            txt(`${timerTxt}  ·  ${moveCount} MOVES`, CX(), PL_MID, fs(40), HI);
        }
    }

    function buildTally(d, denied) {
        const n   = d.size||4;
        const sb  = (n-2)*100;
        const db  = {easy:50,medium:150,hard:300,expert:500}[d.diff]||100;
        const tp  = (d.time||'0:00').split(':');
        const ts  = (parseInt(tp[0])||0)*60+(parseInt(tp[1])||0);
        const tb  = Math.max(0,500-Math.floor(ts/2));
        const hp  = denied?-200:0;
        const tot = sb+db+tb+hp;
        const fan = d.isNewBest?'★  HIGH SCORE  ★':'★  EXTRA BALL  ★';
        return denied
            ? [{l:'PUZZLE BONUS',v:sb},{l:'DIFF BONUS',v:db},{l:'TIME BONUS',v:tb},{l:'HINT PENALTY',v:hp},{l:'TOTAL',v:tot,isTotal:true}]
            : [{l:'PUZZLE BONUS',v:sb},{l:'DIFF BONUS',v:db},{l:'TIME BONUS',v:tb},{l:fan,v:null,fan:true},{l:'TOTAL',v:tot,isTotal:true}];
    }

    function drawWin(dt, denied) {
        if (!tallyBuilt) { tallyItems = buildTally(stateData, denied); tallyBuilt = true; }
        const FLASH_MS=600, ITEM_MS=600, COUNT_MS=400;
        const titleTxt = denied ? 'T  I  L  T' : 'PUZZLE COMPLETE';
        const titleCol = denied ? '#cc3300' : HI;

        // Auf Mobile: Titel statisch halten, Tally läuft im Canvas darunter
        if (canvas.width < 600) {
            const CY = canvas.height * 0.5;
            ctx.save();
            // Rahmen am DMD-Rand
            const border = 4;
            ctx.strokeStyle = titleCol; ctx.lineWidth = 1.5;
            ctx.shadowColor = titleCol; ctx.shadowBlur = 8;
            ctx.strokeRect(border, border, canvas.width - border*2, canvas.height - border*2);
            // Inhalt zentriert und skaliert in den Rahmen
            const innerW = canvas.width  - border*2 - 16;
            const innerH = canvas.height - border*2 - 10;
            ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
            ctx.fillStyle = titleCol; ctx.shadowColor = titleCol; ctx.shadowBlur = 6;
            if (denied) {
                // TILT – einzeilig, Schrift so groß wie möglich
                let fsMob = fs(40);
                ctx.font = `bold ${fsMob}px ${MONO}`;
                while (ctx.measureText('T  I  L  T').width > innerW && fsMob > 10) { fsMob--; ctx.font = `bold ${fsMob}px ${MONO}`; }
                ctx.fillText('T  I  L  T', CX(), CY);
            } else {
                // PUZZLE / COMPLETE – zweizeilig, Schrift so groß wie möglich
                let fsMob = fs(40);
                ctx.font = `bold ${fsMob}px ${MONO}`;
                while ((ctx.measureText('COMPLETE').width > innerW || fsMob * 2.2 > innerH) && fsMob > 10) { fsMob--; ctx.font = `bold ${fsMob}px ${MONO}`; }
                const gap = fsMob * 1.1;
                ctx.fillText('PUZZLE',   CX(), CY - gap / 2);
                ctx.fillText('COMPLETE', CX(), CY + gap / 2);
            }
            ctx.restore();
            if (!winActivated) {
                winActivated = true;
                const d = stateData;
                if (!denied && d.rank != null) {
                    setTimeout(() => setState('highscore', {
                        rank: d.rank, size: d.size, diff: d.diff, seed: d.seed,
                        seconds: d.seconds, onNewGame: d.onNewGame, onExit: d.onExit
                    }), 600);
                }
            }
            return;
        }

        if (stateElapsed < FLASH_MS) {
            _lastTallyIdx = -1;
            const a = Math.min(1, stateElapsed/FLASH_MS*2.5);
            ctx.globalAlpha = a; txt(titleTxt, CX(), canvas.height*0.5, fs(44), titleCol); ctx.globalAlpha = 1;
            return;
        }

        const tEl = stateElapsed - FLASH_MS;
        const idx = Math.min(Math.floor(tEl/ITEM_MS), tallyItems.length-1);
        const prog = Math.min((tEl - idx*ITEM_MS)/COUNT_MS, 1);
        const item = tallyItems[idx];

        if (idx !== _lastTallyIdx) {
            _lastTallyIdx = idx;
            if (item.isTotal) flipperSounds.tallyTotal();
            else if (!item.fan) flipperSounds.tallyTick(item.v < 0);
        }

        if (item.fan) {
            txt(item.l, CX(), canvas.height * 0.5, fs(24), '#ffcc44');
        } else if (item.isTotal) {
            const val = Math.round(item.v * prog);
            txt('TOTAL', CX(), Y_TOP(), fs(20), MED, MONO);
            txt(`${val} PTS`, CX(), Y_MID(), fs(40), HI);
        } else {
            const val = Math.round(Math.abs(item.v)*prog);
            const sign = item.v < 0 ? '-' : '+';
            txt(item.l, CX(), Y_TOP(), fs(18), MED, MONO);
            txt(`${sign}${val} PTS`, CX(), Y_MID(), fs(38), item.v < 0 ? '#cc3300' : HI);
        }

        if (idx >= tallyItems.length-1 && prog >= 1 && !winActivated) {
            winActivated = true;
            const d = stateData;
            if (!denied && (d.rank != null || d.isDailyMode)) {
                // New leaderboard entry / Daily → HS fanfare, then initials
                setTimeout(() => setState('highscore', {
                    rank: d.rank, size: d.size, diff: d.diff, seed: d.seed,
                    seconds: d.seconds, isDailyMode: d.isDailyMode,
                    onNewGame: d.onNewGame, onExit: d.onExit
                }), 600);
            } else {
                removeKey();
                initialsKeyHandler = (e) => {
                    if (e.key==='Enter'||e.code==='Space') { e.preventDefault(); hideWinBanner(); stateData.onNewGame?.(); }
                    else if (e.key==='Escape') { hideWinBanner(); stateData.onExit?.(); }
                };
                document.addEventListener('keydown', initialsKeyHandler);
            }
        }

        if (winActivated && stateData.rank == null) {
            const pEl = tEl - tallyItems.length*ITEM_MS;
            if (Math.floor(pEl/600)%2===0)
                txt(denied?'PRESS START TO CONTINUE':'INSERT COIN  ·  PRESS START', CX(), Y_BOT(), fs(20), HI);
        }
    }

    function drawHighScore(dt) {
        const d = stateData;
        const rankColors = ['#ffdd00','#ffaa00','#cc7a00'];
        const rankCol = rankColors[(d.rank||4)-1] || MED;
        const blink = Math.floor(stateElapsed/350)%2===0;

        // Lichtregen — nur während Fanfare-Phasen
        if (stateElapsed < 2800) {
            if (!hsRain) {
                hsRain = Array.from({length: 28}, () => ({
                    x: Math.random() * (canvas.width || 400),
                    y: Math.random() * (canvas.height || 110),
                    vy: 45 + Math.random() * 75,
                    hi: Math.random() > 0.6
                }));
            }
            for (const p of hsRain) {
                p.y += p.vy * dt / 1000;
                if (p.y > (canvas.height || 110) + 4) { p.y = -4; p.x = Math.random() * (canvas.width || 400); }
                ctx.save();
                ctx.fillStyle = p.hi ? MED : LO;
                ctx.shadowColor = p.hi ? MED : LO;
                ctx.shadowBlur = p.hi ? 6 : 2;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.hi ? 2 : 1.2, 0, Math.PI*2); ctx.fill();
                ctx.restore();
            }
        }

        const hsTitle = d.rank != null ? '★  NEW HIGH SCORE  ★' : '★  DAILY  COMPLETE  ★';
        if (stateElapsed < 500) {
            // Flash in
            const a = Math.min(1, stateElapsed/250);
            ctx.globalAlpha = a;
            txt(hsTitle, CX(), Y_MID(), fs(27), '#ffdd00');
            ctx.globalAlpha = 1;
        } else if (stateElapsed < 2800) {
            txt(hsTitle, CX(), Y_MID(), fs(27), blink ? '#ffdd00' : '#cc9900');
            // Scroll dots as decorative row
            const dotY = canvas.height * 0.65;
            const offset = (stateElapsed/8) % (DOT*2);
            ctx.fillStyle = blink ? HI : MED;
            for (let x = -DOT*2 + offset; x < canvas.width + DOT*2; x += DOT*2) {
                ctx.beginPath(); ctx.arc(x, dotY, 1.5, 0, Math.PI*2); ctx.fill();
            }
        } else {
            txt(hsTitle, CX(), Y_TOP(), fs(20), '#cc9900');
            if (blink) txt('ENTER  YOUR  INITIALS', CX(), Y_MID(), fs(22), HI, MONO);
        }

        if (stateElapsed > 3200 && !winActivated) {
            winActivated = true;
            setState('initials', {
                rank: d.rank,
                isDailyMode: d.isDailyMode,
                onConfirm: (name) => {
                    if (name) localStorage.setItem('numori-player-name', name);
                    insertLeaderboardEntry(name, d.seconds, moveCount, d.size, d.diff, d.seed, d.isDailyMode);
                    hideWinBanner();
                    setState('playing', { size: d.size, diff: d.diff, seed: d.seed });
                },
                onCancel: () => { hideWinBanner(); setState('playing', { size: d.size, diff: d.diff, seed: d.seed }); }
            });
        }
    }

    function drawInitials() {
        const d = stateData;
        const rankColors = ['','#ffdd00','#aaaaaa','#cc7700'];
        const rankCol = rankColors[d.rank] || MED;
        const cursor = Math.floor(stateElapsed/500)%2===0?'_':' ';
        // Zeile 1: ENTER INITIALS
        txt('ENTER  INITIALS', CX(), Y_TOP(), fs(18), MED, MONO);
        // Ränge links vom Namen, gestapelt, rechts-bündig
        const rankX = CX() - canvas.width * 0.28;
        if (d.rank) {
            txt(`LOCAL #${d.rank}`, rankX, Y_MID() - fs(9), fs(13), HI, MONO, 'right');
        }
        if (_globalRank !== undefined) {
            const gText = _globalRank <= 20 ? `GLOBAL #${_globalRank}` : 'GLOBAL –';
            txt(gText, rankX, Y_MID() + fs(9), fs(13), HI, MONO, 'right');
        } else if (_globalRankLoading) {
            txt('GLOBAL …', rankX, Y_MID() + fs(9), fs(13), MED, MONO, 'right');
        }
        txt(initialsValue+cursor, CX(), Y_MID(), fs(32), '#ffcc44');
        // Zeile 3: Hinweis
        txt('ENTER: OK  ·  ESC: SKIP', CX(), Y_BOT(), fs(13), OFF, MONO);
    }

    function loop(now) {
        const dt = Math.min(now - lastFrameTime, 50);
        lastFrameTime = now;
        if (state !== 'attract') stateElapsed += dt;
        if (!canvas || !ctx || !canvas.width) { animFrame = requestAnimationFrame(loop); return; }
        ctx.fillStyle = '#060200';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
                switch(state) {
            case 'attract':   drawAttract(dt);   break;
            case 'playing':   drawPlaying();     break;
            case 'win':       drawWin(dt,false); break;
            case 'tilt':      drawWin(dt,true);  break;
            case 'highscore': drawHighScore(dt); break;
            case 'initials':  drawInitials();    break;
            case 'rickroll':  drawRickRoll(dt);  break;
        }
        if (gridOvc) ctx.drawImage(gridOvc, 0, 0);
        animFrame = requestAnimationFrame(loop);
    }

    function patchState(patch) {
        if ('globalRank' in patch) _globalRank = patch.globalRank;
        if ('globalRankLoading' in patch) _globalRankLoading = patch.globalRankLoading;
        Object.assign(stateData, patch);
    }
    return { start, stop, setState, patchState };
})();

// FLIPPER WIN SCREEN


function buildFlipperTicker() {
    const el = document.getElementById('flipper-ticker');
    if (!el) return;

    // Attract-Mode: kein Rätsel geladen
    if (!currentPuzzle) {
        const n    = parseInt(document.getElementById('size')?.value ?? '4', 10);
        const diff = document.getElementById('difficulty')?.value ?? 'medium';
        const diffLabelsAttract = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
        const config  = `${n}×${n}  ${diffLabelsAttract[diff] ?? diff.toUpperCase()}`;
        const segment = `★ INSERT COIN ★   ${config}   ·   PRESS START   ·   NUMORI`;
        el.textContent = `${segment}   ·   ${segment}   ·   ${segment}`;
        return;
    }

    // Rätsel aktiv: High Scores
    const lb = loadLeaderboard();
    const sizeLabels = { 3: '3×3', 4: '4×4', 5: '5×5', 6: '6×6', 7: '7×7', 8: '8×8' };
    const diffLabels = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', expert: 'EXPERT' };
    const parts = [];
    for (const size of [4, 5, 6, 7, 8, 3]) {
        for (const diff of ['easy', 'medium', 'hard', 'expert']) {
            const entries = lb[size]?.[diff];
            if (!entries || entries.length === 0) continue;
            const top = entries[0];
            const mins = Math.floor(top.time / 60);
            const secs = String(top.time % 60).padStart(2, '0');
            const timeStr = mins > 0 ? `${mins}:${secs}` : `0:${secs}`;
            parts.push(`${sizeLabels[size] ?? size} ${diffLabels[diff] ?? diff}: ${top.name.toUpperCase()}  ${timeStr}`);
        }
    }
    const joined = parts.length > 0 ? parts.join('   ·   ') : 'NOCH KEINE EINTRÄGE';
    el.textContent = `★ HIGH SCORES ★   ${joined}   ·   ★ HIGH SCORES ★   ${joined}`;
    // DMD update (desktop only)
    if (document.documentElement.getAttribute('data-theme') === 'flipper' && window.innerWidth > 600) {
        if (currentPuzzle) {
            const _p = parseFullSeed(currentPuzzle.seed);
            flipperDMD.setState('playing', { size: _p ? _p.n : currentPuzzle.solution.length, diff: _p ? _p.diff : 'medium', seed: currentPuzzle.seed });
        } else {
            flipperDMD.setState('attract');
        }
    }
}

let _flipperAnimFrame = null;
let _flipperKeyHandler = null;
let _flipperWinPhase = 'tally'; // 'tally' | 'highscore' | 'initials'

function startFlipperWin() {
    if (document.documentElement.getAttribute('data-theme') !== 'flipper') return;
    if (window.innerWidth > 600) return; // DMD handles win on desktop
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const banner = document.getElementById('win-banner');
    _flipperWinPhase = 'tally';
    const bannerInner = banner?.querySelector('.win-banner-inner');
    if (bannerInner) bannerInner.style.visibility = 'hidden';
    const rect = banner ? banner.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    canvas.width  = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
    canvas.style.cssText = 'display:block !important; position:absolute; top:0; left:0; width:100%; height:100%; z-index:99999; pointer-events:none;';
    const ctx = canvas.getContext('2d');

    const d = _matrixWinData || {};
    const denied  = d.denied || false;
    const isMobile = window.innerWidth <= 600;

    // Colors
    const AMBER       = denied ? '#cc0000' : '#cc8800';
    const AMBER_BRIGHT= denied ? '#ff2200' : '#ffaa33';
    const AMBER_DIM   = denied ? '#4a0000' : '#6a3a00';
    const FONT_MAIN   = "'Bitcount Grid Single', monospace";
    const FONT_MONO   = "'Share Tech Mono', monospace";

    // Score calculation
    const sizeN    = parseInt((d.size||'4x4').split('x')[0]) || 4;
    const sizeBonus= (sizeN - 2) * 100;
    const diffBonus= { easy: 50, medium: 150, hard: 300, expert: 500 }[d.diff] || 100;
    const timeParts= (d.time || '0:00').split(':');
    const timeSec  = (parseInt(timeParts[0]) || 0) * 60 + (parseInt(timeParts[1]) || 0);
    const timeBonus= Math.max(0, 500 - Math.floor(timeSec / 2));
    const hintPenalty = denied ? -200 : 0;
    const total    = sizeBonus + diffBonus + timeBonus + hintPenalty;

    // Tally items
    const fanfareLabel = d.isNewBest ? '★  HIGH SCORE  ★' : '★  EXTRA BALL  ★';
    const tallyItems = denied
        ? [
            { label: 'PUZZLE BONUS',   value: sizeBonus },
            { label: 'DIFF BONUS',     value: diffBonus },
            { label: 'TIME BONUS',     value: timeBonus },
            { label: 'HINT PENALTY',   value: hintPenalty },
            { label: 'TOTAL',          value: total, isTotal: true },
          ]
        : [
            { label: 'PUZZLE BONUS',   value: sizeBonus },
            { label: 'DIFF BONUS',     value: diffBonus },
            { label: 'TIME BONUS',     value: timeBonus },
            { label: fanfareLabel,     value: null, isFanfare: true },
            { label: 'TOTAL',          value: total, isTotal: true },
          ];

    // Layout
    const CX           = canvas.width / 2;
    const TITLE_FS     = isMobile ? 28 : 36;
    const TITLE_Y      = isMobile ? canvas.height * 0.13 : canvas.height * 0.21;
    const TALLY_TOP    = isMobile ? canvas.height * 0.10 : TITLE_Y + 72;
    const LINE_H       = isMobile ? 34 : 42;
    const TALLY_W      = Math.min(340, canvas.width * 0.82);

    // Phases & timing
    const FLASH=0, TALLY=1, IDLE=2;
    let phase = FLASH;
    let elapsed = 0, lastTime = performance.now();
    const FLASH_MS        = 700;
    const TALLY_ITEM_MS   = 550;
    const COUNT_MS        = 380;
    let tallyIdx  = 0;

    // Dot-grid overlay (LED panel effect)
    function drawDotGrid() {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#000';
        for (let y = 0; y < canvas.height; y += 4) ctx.fillRect(0, y + 3, canvas.width, 1);
        for (let x = 0; x < canvas.width;  x += 4) ctx.fillRect(x + 3, 0, 1, canvas.height);
        ctx.restore();
    }

    function drawTitle(alpha) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.font = `bold ${TITLE_FS}px ${FONT_MAIN}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = AMBER_BRIGHT;
        ctx.shadowColor = AMBER_BRIGHT;
        ctx.shadowBlur = 22;
        if (!denied && isMobile) {
            // Zweizeilig: PUZZLE / COMPLETE
            const lineGap = TITLE_FS * 0.9;
            ctx.fillText('PUZZLE',   CX, TITLE_Y - lineGap / 2);
            ctx.fillText('COMPLETE', CX, TITLE_Y + lineGap / 2);
            const tw1 = ctx.measureText('PUZZLE').width;
            const tw2 = ctx.measureText('COMPLETE').width;
            const bw = Math.max(tw1, tw2);
            const pad = 10;
            ctx.strokeStyle = AMBER; ctx.lineWidth = 2;
            ctx.shadowColor = AMBER; ctx.shadowBlur = 10;
            ctx.strokeRect(CX - bw/2 - pad - 4, TITLE_Y - lineGap/2 - TITLE_FS*0.6 - pad, bw + (pad+4)*2, lineGap + TITLE_FS*1.2 + pad*2);
        } else {
            const text = denied ? 'T  I  L  T' : 'PUZZLE COMPLETE';
            ctx.fillText(text, CX, TITLE_Y);
            const tw = ctx.measureText(text).width;
            ctx.strokeStyle = AMBER; ctx.lineWidth = 2;
            ctx.shadowColor = AMBER; ctx.shadowBlur = 10;
            ctx.strokeRect(CX - tw/2 - 18, TITLE_Y - TITLE_FS*0.72, tw + 36, TITLE_FS*1.44);
        }
        ctx.restore();
    }

    function drawTallyItems(upToIdx, countProg) {
        for (let i = 0; i <= upToIdx && i < tallyItems.length; i++) {
            const item = tallyItems[i];
            const y    = TALLY_TOP + i * LINE_H;
            const prog = (i === upToIdx) ? countProg : 1;
            ctx.save();

            if (item.isFanfare) {
                ctx.font = `bold ${isMobile ? 15 : 18}px ${FONT_MAIN}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffcc44';
                ctx.shadowColor = '#ffcc44';
                ctx.shadowBlur = 18;
                ctx.fillText(item.label, CX, y);
            } else if (item.isTotal) {
                // separator line
                ctx.strokeStyle = AMBER_DIM;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(CX - TALLY_W/2, y - LINE_H/2 + 2);
                ctx.lineTo(CX + TALLY_W/2, y - LINE_H/2 + 2);
                ctx.stroke();
                ctx.font = `bold ${isMobile ? 16 : 20}px ${FONT_MAIN}`;
                ctx.fillStyle = AMBER_BRIGHT;
                ctx.shadowColor = AMBER_BRIGHT;
                ctx.shadowBlur = 14;
                const val = Math.round(item.value * prog);
                ctx.textAlign = 'left';  ctx.textBaseline = 'middle';
                ctx.fillText('TOTAL', CX - TALLY_W/2, y);
                ctx.textAlign = 'right';
                ctx.fillText(`${val} PTS`, CX + TALLY_W/2, y);
            } else {
                ctx.font = `${isMobile ? 13 : 16}px ${FONT_MAIN}`;
                ctx.fillStyle = AMBER;
                ctx.shadowColor = AMBER;
                ctx.shadowBlur = 6;
                const val  = Math.round(Math.abs(item.value) * prog);
                const sign = item.value < 0 ? '-' : '+';
                ctx.textAlign = 'left';  ctx.textBaseline = 'middle';
                ctx.fillText(item.label, CX - TALLY_W/2, y);
                ctx.textAlign = 'right';
                ctx.fillText(`${sign}${val} PTS`, CX + TALLY_W/2, y);
            }
            ctx.restore();
        }
    }

    function drawStats() {
        const diffLabel = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', expert: 'EXPERT' }[d.diff] || '';
        const statsY = TALLY_TOP + tallyItems.length * LINE_H + (isMobile ? 22 : 30);
        ctx.font = `${isMobile ? 14 : 13}px ${FONT_MONO}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isMobile ? AMBER : AMBER_DIM;
        ctx.shadowColor = isMobile ? AMBER : 'transparent';
        ctx.shadowBlur = isMobile ? 4 : 0;
        ctx.fillText(`${d.size||'?'}  ·  ${diffLabel}  ·  ${d.time||'--:--'}  ·  ID: ${(d.seed||'').toUpperCase()}`, CX, statsY);
    }

    function drawPrompt(elapsed) {
        const promptY = TALLY_TOP + tallyItems.length * LINE_H + (isMobile ? 64 : 84);
        const promptText = denied ? 'PRESS START TO CONTINUE' : 'INSERT COIN  ·  PRESS START';
        ctx.font = `bold ${isMobile ? 22 : 28}px ${FONT_MAIN}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = AMBER_BRIGHT;
        ctx.shadowColor = AMBER_BRIGHT;
        ctx.shadowBlur = 16;
        if (isMobile) {
            // Scrollender Text ohne Blinken
            const tw = ctx.measureText(promptText).width;
            const speed = 45; // px/s
            const offset = ((elapsed / 1000) * speed) % (tw + canvas.width);
            ctx.save();
            ctx.textAlign = 'left';
            ctx.fillText(promptText, canvas.width - offset, promptY);
            ctx.restore();
        } else {
            if (Math.floor(elapsed / 600) % 2 === 0)
                ctx.fillText(promptText, CX, promptY);
        }
    }

    // Mobile buttons
    let mobileButtons = null;
    function createMobileButtons() {
        if (mobileButtons) return;
        mobileButtons = document.createElement('div');
        mobileButtons.setAttribute('data-flipper-btns', '1');
        mobileButtons.style.cssText = 'position:fixed;bottom:calc(90px + env(safe-area-inset-bottom, 0px));left:0;right:0;z-index:100000;display:flex;justify-content:center;gap:20px;padding:0 24px;';
        const baseStyle = `font-family:${FONT_MAIN};font-size:1rem;letter-spacing:3px;cursor:pointer;border:none;outline:none;-webkit-tap-highlight-color:transparent;`;
        const btnInsertCol = denied ? '#882200' : '#b87820';
        const btnInsertGlow = denied ? '#aa2200' : '#cc8833';
        const btnNew = document.createElement('button');
        btnNew.textContent = '▶  INSERT COIN';
        btnNew.style.cssText = baseStyle + `
            padding:14px 28px;
            background:${btnInsertCol};
            color:${denied ? '#ffaa99' : '#ffe0a0'};
            box-shadow:0 0 12px ${btnInsertGlow};
            clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
        `;
        btnNew.addEventListener('click', () => { stopFlipperWin(); hideWinBanner(); document.getElementById('btn-new')?.click(); });
        mobileButtons.appendChild(btnNew);
        const btnExit = document.createElement('button');
        btnExit.textContent = 'EXIT';
        btnExit.style.cssText = baseStyle + `
            padding:14px 22px;
            background:transparent;
            color:${AMBER};
            border:1px solid ${AMBER};
            box-shadow:0 0 8px rgba(204,136,0,0.3);
            clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
        `;
        btnExit.addEventListener('click', () => { stopFlipperWin(); hideWinBanner(); });
        mobileButtons.appendChild(btnExit);
        document.body.appendChild(mobileButtons);
    }

    function activateInput() {
        if (isMobile) {
            // Nur Buttons zeigen wenn nicht im Highscore-Flow
            if (_flipperWinPhase === 'tally') createMobileButtons();
            return;
        }
        if (_flipperKeyHandler) document.removeEventListener('keydown', _flipperKeyHandler);
        _flipperKeyHandler = (e) => {
            if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                stopFlipperWin(); hideWinBanner(); document.getElementById('btn-new')?.click();
            } else if (e.key === 'Escape') {
                stopFlipperWin(); hideWinBanner();
            }
        };
        document.addEventListener('keydown', _flipperKeyHandler);
    }

    let inputActivated = false;
    function draw(now) {
        const dt = Math.min(now - lastTime, 50);
        lastTime = now;
        elapsed += dt;

        // Background
        ctx.shadowBlur = 0;
        ctx.fillStyle = denied ? '#080000' : '#040200';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawDotGrid();

        if (phase === FLASH) {
            const prog = Math.min(elapsed / FLASH_MS, 1);
            if (!isMobile) drawTitle(prog * 2.5);
            if (elapsed >= FLASH_MS) { phase = TALLY; elapsed = 0; tallyIdx = 0; }
        } else if (phase === TALLY) {
            if (!isMobile) drawTitle(1);
            tallyIdx = Math.min(Math.floor(elapsed / TALLY_ITEM_MS), tallyItems.length - 1);
            const itemElapsed = elapsed - tallyIdx * TALLY_ITEM_MS;
            const countProg   = Math.min(itemElapsed / COUNT_MS, 1);
            drawTallyItems(tallyIdx, countProg);
            if (tallyIdx >= tallyItems.length - 1 && countProg >= 1 && !inputActivated) {
                inputActivated = true;
                phase = IDLE;
                elapsed = 0;
                activateInput();
            }
        } else {
            if (!isMobile) drawTitle(1);
            if (isMobile && _flipperWinPhase === 'initials') {
                // Initials-Eingabe im Canvas darunter
                drawTallyItems(tallyItems.length - 1, 1);
                drawStats();
                const CX2 = canvas.width / 2;
                const inputY = canvas.height * 0.82;
                const cursor = Math.floor(elapsed / 500) % 2 === 0 ? '_' : ' ';
                ctx.save();
                ctx.font = `bold 28px ${FONT_MAIN}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffcc44'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 10;
                ctx.fillText(initialsValue + cursor, CX2, inputY);
                ctx.restore();
            } else if (isMobile && _flipperWinPhase === 'highscore') {
                // Warte auf Highscore-Fanfare im DMD — Canvas leer lassen
            } else {
                drawTallyItems(tallyItems.length - 1, 1);
                drawStats();
                drawPrompt(elapsed);
            }
        }

        _flipperAnimFrame = requestAnimationFrame(draw);
    }
    draw(performance.now());
}

function stopFlipperWin() {
    if (_flipperAnimFrame) { cancelAnimationFrame(_flipperAnimFrame); _flipperAnimFrame = null; }
    if (_flipperKeyHandler) { document.removeEventListener('keydown', _flipperKeyHandler); _flipperKeyHandler = null; }
    document.querySelectorAll('[data-flipper-btns]').forEach(el => el.remove());
    const c = document.getElementById('matrix-canvas');
    if (c) { c.style.display = 'none'; c.getContext('2d').clearRect(0, 0, c.width, c.height); }
    const bannerInner = document.querySelector('#win-banner .win-banner-inner');
    if (bannerInner) bannerInner.style.visibility = '';
}
