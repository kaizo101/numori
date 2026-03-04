"use strict";

// 0. THEME
function applyTheme(theme) {
    const validThemes = ['dark', 'console'];
    document.documentElement.setAttribute('data-theme', validThemes.includes(theme) ? theme : '');
    localStorage.setItem('numori-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Inputs übernehmen font-family nicht per CSS-Vererbung in Chromium
    const font = theme === 'dark' ? "'Poppins', system-ui, sans-serif"
               : theme === 'console' ? "'Share Tech Mono', monospace"
               : "";
    const seedInput = document.getElementById('seed-input');
    if (seedInput) seedInput.style.fontFamily = font;
    // Welcome-Icon je nach Theme tauschen
    const welcomeIcon = document.getElementById('welcome-icon');
    if (welcomeIcon) {
        welcomeIcon.src = theme === 'console'
            ? 'assets/icons/numori_console.png'
            : 'assets/icons/png/numori-1024.png';
    }
    initConsoleStatus();
}

function initTheme() {
    const saved = localStorage.getItem('numori-theme') || 'default';
    applyTheme(saved);
}

// Custom Select Logik
function syncCustomSelect(targetId, value) {
    const cs = document.querySelector(`.custom-select[data-target="${targetId}"]`);
    if (!cs) return;
    const opt = cs.querySelector(`.custom-select-option[data-value="${value}"]`);
    if (!opt) return;
    cs.querySelector('.custom-select-label').textContent = opt.textContent;
    cs.querySelectorAll('.custom-select-option').forEach(o => delete o.dataset.selected);
    opt.dataset.selected = '';
}

function initCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(cs => {
        const btn = cs.querySelector('.custom-select-btn');
        const dropdown = cs.querySelector('.custom-select-dropdown');
        const label = cs.querySelector('.custom-select-label');
        const targetId = cs.dataset.target;
        const nativeSelect = document.getElementById(targetId);

        // Öffnen/Schließen
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = cs.classList.contains('open');
            // Alle anderen schließen
            document.querySelectorAll('.custom-select.open').forEach(o => o.classList.remove('open'));
            if (!isOpen) cs.classList.add('open');
        });

        // Option wählen
        cs.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.dataset.value;
                const text = opt.textContent;
                label.textContent = text;
                nativeSelect.value = val;
                nativeSelect.dispatchEvent(new Event('change'));
                // Selected-Markierung
                cs.querySelectorAll('.custom-select-option').forEach(o => delete o.dataset.selected);
                opt.dataset.selected = '';
                cs.classList.remove('open');
            });
        });
    });

    // Außerhalb klicken schließt alle
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(cs => cs.classList.remove('open'));
    });

    // Escape schließt
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.custom-select.open').forEach(cs => cs.classList.remove('open'));
        }
    });
}

// 1. OPERATOR-SYMBOLE
const OPSYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };
function formatLabel(op, target) {
    if (op && op !== '=') return `${target}${OPSYMBOL[op] ?? op}`;
    return target;
}

// 2. GLOBALER ZUSTAND
let currentPuzzle = null;
let selected = { r: 0, c: 0 };
let notesMode = false;
let validationActive = false;
let generationWorker = null;
let userBoard;
let notesBoard;

// Timer-Zustand
let timerInterval = null; // setInterval-Handle
let elapsedSeconds = 0; // immer mitlaufen, auch wenn unsichtbar
let timerVisible = false; // Toggle-Status
let timerStopped = false; // true: Rätsel gelöst oder Lösung gezeigt
let competitiveBlocked = false; // true: Tipp/Validierung genutzt, Wettkampf-Modus gesperrt
let solvedByCheat = false; // true: Lösung anzeigen wurde genutzt

// Tipp-Zustand
let hintBoard; // hintBoard[r][c] = true wenn Zelle per Tipp gesetzt
let moveCount = 0; // Züge-Zähler

// UNDO/REDO v0.6.0 NEU
let history = []; // Undo-Stack: [{r, c, prevValue, prevNotes: Set}]
let redoStack = []; // Redo-Stack

const MAX_HISTORY = 50; // Begrenzung für Performance

// TYPEWRITER-STATUS (nur Console-Theme)
let _typewriterTimeout = null;
let _seedTypewriterTimeout = null;
window._isDirty = false;
window._dailyMode = false;
window._dailyDateKey = null;

function setStatus(text) {
    const el = document.getElementById('status');
    if (!el) return;
    if (document.documentElement.getAttribute('data-theme') !== 'console') {
        el.textContent = text;
        return;
    }
    // Laufende Animation abbrechen
    if (_typewriterTimeout) {
        clearTimeout(_typewriterTimeout);
        _typewriterTimeout = null;
    }
    el.textContent = '';
    let i = 0;
    const lowerText = text.toLowerCase();
    function type() {
        if (i < lowerText.length) {
            el.textContent = lowerText.slice(0, i + 1);
            i++;
            _typewriterTimeout = setTimeout(type, 28);
        } else {
            _typewriterTimeout = null;
        }
    }
    type();
}

function setSeedTypewriter(text) {
    const el = document.getElementById('seed-input');
    if (!el) return;
    if (document.documentElement.getAttribute('data-theme') !== 'console') {
        el.value = text;
        return;
    }
    if (_seedTypewriterTimeout) {
        clearTimeout(_seedTypewriterTimeout);
        _seedTypewriterTimeout = null;
    }
    el.value = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            el.value = text.slice(0, i + 1);
            i++;
            _seedTypewriterTimeout = setTimeout(type, 28);
        } else {
            _seedTypewriterTimeout = null;
        }
    }
    type();
}

function saveGameState() {
    if (!currentPuzzle) return;
    try {
        const state = {
            puzzle: currentPuzzle,
            userBoard,
            notesBoard: notesBoard.map(row => row.map(s => [...s])),
            hintBoard,
            elapsedSeconds,
            moveCount,
            validationActive,
            timerVisible,
            savedAt: Date.now(),
        };
        localStorage.setItem('numori-savedGame', JSON.stringify(state));
        window._isDirty = false;
window._dailyMode = false;
window._dailyDateKey = null;
    } catch(e) { console.error('Speichern fehlgeschlagen:', e); }
}

function loadGameState() {
    try {
        const raw = localStorage.getItem('numori-savedGame');
        if (!raw) return null;
        const s = JSON.parse(raw);
        // notesBoard Sets wiederherstellen
        s.notesBoard = s.notesBoard.map(row => row.map(arr => new Set(arr)));
        return s;
    } catch(e) { return null; }
}

function clearSavedGame() {
    localStorage.removeItem('numori-savedGame');
}

// ── TÄGLICHES RÄTSEL ──────────────────────────────────────────
const DAILY_SCHEDULE = [
    // So  Mo      Di        Mi      Do        Fr      Sa
    { n: 6, diff: 'hard'   },  // 0 = Sonntag
    { n: 4, diff: 'easy'   },  // 1 = Montag
    { n: 4, diff: 'medium' },  // 2 = Dienstag
    { n: 5, diff: 'easy'   },  // 3 = Mittwoch
    { n: 5, diff: 'medium' },  // 4 = Donnerstag
    { n: 5, diff: 'hard'   },  // 5 = Freitag
    { n: 6, diff: 'medium' },  // 6 = Samstag
];

function getDailyDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDailySeed(dateKey) {
    // Deterministischer Hash aus Datum → 6-stelliger Seed
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let h = 5381;
    for (let i = 0; i < dateKey.length; i++) {
        h = Math.imul(h, 33) ^ dateKey.charCodeAt(i);
    }
    h = h >>> 0;
    let seed = '';
    for (let i = 0; i < 6; i++) {
        seed += chars[h % chars.length];
        h = Math.imul(h, 1664525) + 1013904223 >>> 0;
    }
    return seed;
}

function getDailyConfig() {
    const dateKey = getDailyDateKey();
    const dow = new Date().getDay(); // 0=So, 1=Mo, ...
    const { n, diff } = DAILY_SCHEDULE[dow];
    const rawSeed = getDailySeed(dateKey);
    return { n, diff, rawSeed, dateKey, fullSeed: buildFullSeed(n, diff, rawSeed) };
}

function getDailySolvedKey(dateKey) {
    return `numori-daily-solved-${dateKey}`;
}

function markDailySolved(dateKey, timeStr) {
    localStorage.setItem(getDailySolvedKey(dateKey), timeStr);
}

function getDailySolvedTime(dateKey) {
    return localStorage.getItem(getDailySolvedKey(dateKey));
}

function initDailyButton() {
    const btn = document.getElementById('btn-daily');
    if (!btn) return;

    const { dateKey, fullSeed, n, diff } = getDailyConfig();
    const solvedTime = getDailySolvedTime(dateKey);
    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

    if (solvedTime) {
        btn.title = `Tägliches Rätsel – heute bereits gelöst (${solvedTime})`;
        btn.dataset.solved = 'true';
    }

    btn.addEventListener('click', () => {
        window._dailyMode = true;
        window._dailyDateKey = dateKey;
        if (window._newPuzzle) {
            window._newPuzzle(fullSeed);
        } else {
            // Fallback: Seed ins Input setzen und btn-new klicken
            const seedInput = document.getElementById('seed-input');
            if (seedInput) seedInput.value = fullSeed;
            document.getElementById('btn-new')?.click();
        }
        if (solvedTime) setStatus(`tägliches rätsel – heute bereits gelöst (${solvedTime})`);
    });
}

// ──────────────────────────────────────────────────────────────

function restoreGameState(s) {
    currentPuzzle  = s.puzzle;
    userBoard      = s.userBoard;
    notesBoard     = s.notesBoard;
    hintBoard      = s.hintBoard;
    elapsedSeconds = s.elapsedSeconds || 0;
    moveCount      = s.moveCount || 0;
    validationActive = s.validationActive || false;

    requestAnimationFrame(() => {
        renderBoard(currentPuzzle);
        // userBoard/notesBoard/hintBoard nach renderBoard wiederherstellen
        const n = currentPuzzle.solution.length;
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                userBoard[r][c]  = s.userBoard[r][c];
                notesBoard[r][c] = s.notesBoard[r][c];
                hintBoard[r][c]  = s.hintBoard[r][c];
                const cell = getCell(r, c);
                const valSpan = cell?.querySelector('.cell-value');
                if (valSpan) valSpan.textContent = s.userBoard[r][c] ? String(s.userBoard[r][c]) : '';
                if (s.hintBoard[r][c]) cell?.classList.add('hint');
                updateNotesDisplay(r, c);
            }
        }
        if (s.validationActive) validateAll();
        // Timer wiederherstellen (pausiert)
        timerStopped = false;
        updateTimerDisplay();
        if (s.timerVisible) setTimerVisible(true);
        const moveEl = document.getElementById('move-count');
        if (moveEl) moveEl.textContent = moveCount;
        updateUndoRedoButtons();
        updateProgress();
        setStatus('spielstand wiederhergestellt.');
        window._isDirty = true;
    });
}

// Expose saveState for Electron main process
window._saveStateForElectron = saveGameState;

function initConsoleStatus() {
    const el = document.getElementById('status');
    if (!el) return;
    if (document.documentElement.getAttribute('data-theme') === 'console') {
        el.textContent = '';
    }
}


function formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    stopTimer(); // vorherigen sauber beenden
    elapsedSeconds = 0;
    timerStopped = false;
    solvedByCheat = false;
    competitiveBlocked = false;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer(cheat = false) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerStopped = true;
    if (cheat) solvedByCheat = true;
}

function updateTimerDisplay() {
    if (!timerVisible) return;
    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = formatTime(elapsedSeconds);
}

// 3b. GEWINN-BANNER
function showWinBanner(timeStr, size, diff, seed, denied=false) {
    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    const el = (id) => document.getElementById(id);
    if (el('win-stat-size'))  el('win-stat-size').textContent  = `${size}×${size}`;
    if (el('win-stat-diff'))  el('win-stat-diff').textContent  = diffLabels[diff] ?? diff;
    if (el('win-stat-time'))  el('win-stat-time').textContent  = timeStr;
    if (el('win-stat-moves')) el('win-stat-moves').textContent = moveCount;
    if (el('win-stat-seed'))  el('win-stat-seed').textContent  = seed;
    banner.classList.add('visible');
    _matrixWinData = { size: size+'x'+size, diff, time: timeStr, seed, moves: moveCount, denied };
    startMatrixRain();
    const btnSolve = document.getElementById('btn-solve');
    if (btnSolve) btnSolve.disabled = true;
}

function hideWinBanner() {
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    banner.classList.remove('visible');
    stopMatrixRain();
    const btnSolve = document.getElementById('btn-solve');
    if (btnSolve) btnSolve.disabled = false;
}


// MATRIX WIN SCREEN (Console-Theme only)
let _matrixAnimFrame = null;
let _matrixKeyHandler = null;
let _matrixWinData = null;

function startMatrixRain() {
    if (document.documentElement.getAttribute('data-theme') !== 'console') return;
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'display:block !important; position:fixed; top:0; left:0; z-index:99999; pointer-events:none;';
    const ctx = canvas.getContext('2d');
    const FS = 14;
    const cols = Math.floor(canvas.width / FS);
    const rows = Math.floor(canvas.height / FS);
    // Phases
    const RAIN=0, FLASH=1, FLY=2, TYPEWRITE=3, IDLE=4;
    let phase=RAIN, ticks=0;
    const RAIN_TICKS=400, FLASH_TICKS=90, FLY_TICKS=110;
    const drops = Array.from({length:cols}, ()=>Math.floor(Math.random()*-rows));
    // Win data
    const d = _matrixWinData||{};
    const diffLabel = {easy:'easy',medium:'medium',hard:'hard'}[d.diff]||'';
    const denied = d.denied || false;
    const ACCENT = denied ? '#ff2020' : '#00ff41';
    const TITLE_TEXT = denied ? 'ACCESS DENIED' : 'ACCESS GRANTED';
    const statLines = denied ? [
        '',
        'ERROR CODE 21: cheater or developer detected',
        '',
        '> type "loser" to continue',
    ] : [
        '',
        'size:  '+(d.size||'')+' / '+(diffLabel||''),
        'time:  '+(d.time||'--:--'),
        'moves: '+(d.moves!==undefined?d.moves:'-'),
        'id:    '+(d.seed||'').toLowerCase(),
        '',
        '> type "start" for new puzzle',
        '> type "exit"  to close',
    ];
    // Layout
    const TITLE_FS     = FS*2.4;
    const TITLE_FINAL_Y= canvas.height*0.28;
    const TITLE_START_Y= canvas.height*0.50;
    const STATS_START_Y= TITLE_FINAL_Y + TITLE_FS*1.6;
    const STAT_LINE_H  = FS*1.85;
    const INPUT_Y = STATS_START_Y + statLines.length*STAT_LINE_H + FS*1.8;
    const INPUT_X = canvas.width/2 - 180;
    let flashAlpha=0, flashScale=1, titleY=TITLE_START_Y;
    let typeLineIdx=0, typeCharIdx=0, typeTick=0;
    const TYPE_SPEED=5;
    let inputActive=false, inputValue='', inputBlink=true, inputBlinkTick=0;
    function activateInput() {
        if (inputActive) return; inputActive=true;
        if (_matrixKeyHandler) document.removeEventListener('keydown',_matrixKeyHandler);
        _matrixKeyHandler=(e)=>{
            if (!inputActive) return;
            if (e.key==='Enter'){
                const cmd=inputValue.trim().toLowerCase();
                if (cmd==='start'||cmd==='loser'){stopMatrixRain();hideWinBanner();document.getElementById('btn-new')?.click();}
                else if(cmd==='exit'){stopMatrixRain();hideWinBanner();}
                else inputValue='';
            } else if(e.key==='Backspace'){inputValue=inputValue.slice(0,-1);e.preventDefault();}
            else if(e.key.length===1&&inputValue.length<24) inputValue+=e.key;
        };
        document.addEventListener('keydown',_matrixKeyHandler);
    }
    function drawTitle(y,alpha,scale){
        ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
        ctx.font='bold '+(TITLE_FS*scale)+'px Share Tech Mono,monospace';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        const tw=ctx.measureText(TITLE_TEXT).width;
        const padX=36*scale, padY=20*scale;
        const bx=canvas.width/2-tw/2-padX, bw=tw+padX*2;
        const bh=TITLE_FS*scale+padY*2, by=y-bh/2;
        ctx.strokeStyle=ACCENT; ctx.lineWidth=3*scale;
        ctx.shadowColor=ACCENT; ctx.shadowBlur=12*alpha;
        ctx.strokeRect(bx,by,bw,bh);
        ctx.shadowBlur=0;
        ctx.fillStyle=ACCENT; ctx.shadowColor=ACCENT; ctx.shadowBlur=28*alpha;
        ctx.fillText(TITLE_TEXT,canvas.width/2,y);
        ctx.shadowBlur=0; ctx.restore();
    }

    function drawStats(revLines,lastChars){
        ctx.font=FS+'px Share Tech Mono,monospace';
        ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.fillStyle=ACCENT;
        const statsX = canvas.width/2 - 90;
        for(let i=0;i<statLines.length;i++){
            if(i>revLines) break;
            const line=i<revLines?statLines[i]:statLines[i].slice(0,lastChars);
            const isCentered = i===0 || statLines[i].startsWith('>') || statLines[i].startsWith('ERROR');
            if(isCentered){ ctx.textAlign='center'; ctx.fillText(line,canvas.width/2,STATS_START_Y+i*STAT_LINE_H); ctx.textAlign='left'; }
            else { ctx.fillText(line,statsX,STATS_START_Y+i*STAT_LINE_H); }
        }
    }
    function drawInput(){
        inputBlinkTick++; if(inputBlinkTick%40===0) inputBlink=!inputBlink;
        ctx.font=FS+'px Share Tech Mono,monospace';
        ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.fillStyle=denied?'#aa1010':'#00aa2a';
        ctx.fillText('> '+inputValue+(inputBlink?'_':' '),INPUT_X,INPUT_Y);
    }
    function draw(){
        ticks++;
        if(phase===RAIN){
            ctx.fillStyle="rgba(0,0,0,0.14)"; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.font=FS+"px Share Tech Mono,monospace"; ctx.textAlign="left"; ctx.textBaseline="alphabetic";
            for(let c=0;c<cols;c++){
                const pool="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#%&!?/|^~+-*=<>.:;{}[]()";const y=drops[c],ch=pool[Math.floor(Math.random()*pool.length)];
                if(y>=0&&y<rows){const t=denied?Math.min(1,ticks/RAIN_TICKS):0;const r=Math.round(t*255),g=Math.round((1-t)*255);const dropColor=y<2?"#ffffff":"rgb("+r+","+g+",0)";ctx.fillStyle=dropColor;ctx.fillText(ch,c*FS,y*FS+FS);}
                if(Math.random()<0.55)drops[c]++;if(drops[c]>rows+12)drops[c]=Math.floor(Math.random()*-70);
            }
            if(ticks>RAIN_TICKS){phase=FLASH;ticks=0;}
        }else if(phase===FLASH){
            ctx.fillStyle="rgba(0,0,0,0.18)";ctx.fillRect(0,0,canvas.width,canvas.height);
            const pr=ticks/FLASH_TICKS;
            if(pr<0.35){flashAlpha=pr/0.35;flashScale=1+(1-flashAlpha)*0.25;}else{flashAlpha=1;flashScale=1;}
            drawTitle(TITLE_START_Y,flashAlpha,flashScale);
            if(ticks>=FLASH_TICKS){phase=FLY;ticks=0;titleY=TITLE_START_Y;}
        }else if(phase===FLY){
            ctx.fillStyle="rgba(0,0,0,0.12)";ctx.fillRect(0,0,canvas.width,canvas.height);
            const ease=1-Math.pow(1-(ticks/FLY_TICKS),3);
            titleY=TITLE_START_Y+(TITLE_FINAL_Y-TITLE_START_Y)*ease;
            drawTitle(titleY,1,1);
            if(ticks>=FLY_TICKS){phase=TYPEWRITE;ticks=0;typeLineIdx=0;typeCharIdx=0;typeTick=0;}
        }else if(phase===TYPEWRITE){
            ctx.fillStyle="rgba(0,0,0,0.88)";ctx.fillRect(0,0,canvas.width,canvas.height);
            drawTitle(TITLE_FINAL_Y,1,1);
            typeTick++;
            if(typeTick%TYPE_SPEED===0){
                const cur=statLines[typeLineIdx]||"";
                if(typeCharIdx<cur.length){typeCharIdx++;}
                else if(typeLineIdx<statLines.length-1){typeLineIdx++;typeCharIdx=0;}
                else{phase=IDLE;activateInput();}
            }
            drawStats(typeLineIdx,typeCharIdx);
            if(Math.floor(ticks/22)%2===0){
                ctx.fillStyle=ACCENT;ctx.textBaseline="alphabetic";
                const tw=ctx.measureText((statLines[typeLineIdx]||"").slice(0,typeCharIdx)).width;
                const sX2=canvas.width/2-90;const isCent=typeLineIdx===0||statLines[typeLineIdx].startsWith(">") || statLines[typeLineIdx].startsWith("ERROR");const cX=isCent?canvas.width/2+tw/2+3:sX2+tw+3;ctx.fillRect(cX,STATS_START_Y+typeLineIdx*STAT_LINE_H-FS*0.9,2,FS);
            }
        }else{
            ctx.fillStyle="rgba(0,0,0,0.88)";ctx.fillRect(0,0,canvas.width,canvas.height);
            drawTitle(TITLE_FINAL_Y,1,1);
            drawStats(statLines.length,0);
            drawInput();
        }
        _matrixAnimFrame=requestAnimationFrame(draw);
    }
    draw();
}

function stopMatrixRain(){
    if(_matrixAnimFrame){cancelAnimationFrame(_matrixAnimFrame);_matrixAnimFrame=null;}
    if(_matrixKeyHandler){document.removeEventListener("keydown",_matrixKeyHandler);_matrixKeyHandler=null;}
    const c=document.getElementById("matrix-canvas");
    if(c){c.style.display="none";c.getContext("2d").clearRect(0,0,c.width,c.height);}
}


// 4. SEED-HILFSFUNKTIONEN
// Präfix-Kodierung: Größe (3-7) + Schwierigkeit (E/M/H) + '-' + 6-Zeichen-Seed
// z.B. "4M-AB3X7K"
const DIFF_CODE = { easy: 'E', medium: 'M', hard: 'H' };
const CODE_DIFF = { E: 'easy', M: 'medium', H: 'hard' };

function buildFullSeed(n, diff, rawSeed) {
    return `${n}${DIFF_CODE[diff]}-${rawSeed}`;
}

function parseFullSeed(fullSeed) {
    // Format: "4M-AB3X7K" oder legacy ohne Präfix
    const match = fullSeed.match(/^([3-7])([EMH])-([A-Z2-9]{1,12})$/i);
    if (match) {
        return {
            n: parseInt(match[1], 10),
            diff: CODE_DIFF[match[2].toUpperCase()],
            raw: match[3].toUpperCase()
        };
    }
    // Legacy: kein Präfix → aktuelle Dropdowns verwenden
    return null;
}

function randomSeed() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

function seedToInt(str, n, diff) {
    const combined = `${str}|${n}|${diff}`;
    let h = 5381;
    for (let i = 0; i < combined.length; i++) {
        h = Math.imul(h, 33) ^ combined.charCodeAt(i);
    }
    return h >>> 0;
}

// 5. BOARD-GRÖSSE
function getBoardPx() {
    const cont = document.getElementById('board-container');
    let w = cont.clientWidth - 28;
    let h = cont.clientHeight - 28;
    if (w < 0) {
        const headerH = document.querySelector('header')?.offsetHeight ?? 58;
        const toolbarH = document.querySelector('.toolbar')?.offsetHeight ?? 52;
        const statusH = document.querySelector('.status')?.offsetHeight ?? 26;
        const footerH = document.querySelector('footer')?.offsetHeight ?? 26;
        h = window.innerHeight - headerH - toolbarH - statusH - footerH - 28;
    }
    if (w < 0) w = window.innerWidth - 56;
    return Math.floor(Math.min(w, h, 680));
}

// 6. BOARD RENDERN
function getCell(r, c) {
    return document.querySelector(`#board .cell[data-r="${r}"][data-c="${c}"]`);
}

function renderBoard(puzzle) {
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.style.display = 'none';
    const n = puzzle.solution.length;
    const el = document.getElementById('board');
    el.innerHTML = '';
    const px = getBoardPx();
    el.style.width = `${px}px`;
    el.style.height = `${px}px`;
    el.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    el.style.gridTemplateRows = `repeat(${n}, 1fr)`;

    const cageId = Array.from({ length: n }, () => Array(n).fill(-1));
    puzzle.cages.forEach((cage, idx) => {
        cage.cells.forEach(p => { cageId[p.r][p.c] = idx; });
    });

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            const id = cageId[r][c];

            // Borders – innere Käfig-Grenzen + äußere Ränder
            if (r === 0 || cageId[r-1][c] !== id) cell.classList.add('bt');
            if (r === n - 1 || cageId[r+1][c] !== id) cell.classList.add('bb');
            if (c === 0 || cageId[r][c-1] !== id) cell.classList.add('bl');
            if (c === n - 1 || cageId[r][c+1] !== id) cell.classList.add('br');

            // Cage-Label
            if (id >= 0) {
                const cage = puzzle.cages[id];
                const first = cage.cells.reduce((m, p) => (p.r < m.r || (p.r === m.r && p.c < m.c) ? p : m));
                if (first.r === r && first.c === c) {
                    const lbl = document.createElement('span');
                    lbl.className = 'cage-label';
                    lbl.textContent = formatLabel(cage.op, cage.target);
                    cell.appendChild(lbl);
                }
            }

            // Notes-Grid
            const notesGrid = document.createElement('div');
            notesGrid.className = 'cell-notes';
            for (let v = 1; v <= 9; v++) {
                const note = document.createElement('span');
                note.className = 'note';
                note.dataset.v = v;
                note.textContent = v > n ? '' : String(v);
                notesGrid.appendChild(note);
            }
            cell.appendChild(notesGrid);

            // Value-Span
            const valSpan = document.createElement('span');
            valSpan.className = 'cell-value';
            cell.appendChild(valSpan);

            cell.addEventListener('click', () => selectCell(r, c));
            el.appendChild(cell);
        }
    }

    window._isDirty = true;
    _errorCooldown = false;
    userBoard = Array.from({ length: n }, () => Array(n).fill(0));
    notesBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => new Set()));
    hintBoard = Array.from({ length: n }, () => Array(n).fill(false));
    history = [];
    redoStack = [];
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) { bar.style.width = '0%'; bar.classList.remove('complete'); }
    if (text) text.textContent = `0 / ${n * n} (0%)`;
    moveCount = 0;
    const moveEl = document.getElementById('move-count');
    if (moveEl) moveEl.textContent = '0';
    updateTimerBtn();
    selectCell(0, 0);

    // Ecken-Zellen für Dark-Theme border-radius markieren
    const boardEl = document.getElementById('board');
    if (boardEl) {
        const cells = boardEl.querySelectorAll('.cell');
        if (cells.length >= 1) cells[0].classList.add('corner-tl');
        if (cells.length >= n) cells[n - 1].classList.add('corner-tr');
        if (cells.length >= n * (n - 1) + 1) cells[n * (n - 1)].classList.add('corner-bl');
        if (cells.length >= n * n) cells[n * n - 1].classList.add('corner-br');
    }
}

function resizeBoard() {
    if (!currentPuzzle) return;
    const el = document.getElementById('board');
    const px = getBoardPx();
    el.style.width = `${px}px`;
    el.style.height = `${px}px`;
}

// 7. ZELLE AUSWÄHLEN
function selectCell(r, c) {
    const prevCell = getCell(selected.r, selected.c);
    prevCell?.classList.remove('selected');
    prevCell?.querySelector('.cell-cursor')?.remove();
    selected = { r, c };
    const newCell = getCell(r, c);
    newCell?.classList.add('selected');
    // Blinkenden Cursor für Console-Theme einfügen (nur wenn Zelle leer)
    if (newCell && document.documentElement.getAttribute('data-theme') === 'console') {
        if (!newCell.querySelector('.cell-value')?.textContent) {
            const cursor = document.createElement('div');
            cursor.className = 'cell-cursor';
            newCell.appendChild(cursor);
        }
    }
}

// 8. ZAHL EINGEBEN + SAVE STATE v0.6.0
function setNumber(r, c, v) {
    if (!currentPuzzle) return;
    if (hintBoard?.[r][c]) return; // Tipp-Zellen sind gesperrt

    const n = currentPuzzle.solution.length;
    if (v < 0 || v > n) return;

    // Batch-State: Hauptzelle + alle Notiz-Zellen in Zeile/Spalte die v enthalten
    const changes = [{
        r, c,
        prevValue: userBoard[r][c],
        prevNotes: new Set(notesBoard[r][c]),
        prevHint:  hintBoard[r][c],
        nextValue: v,
        nextNotes: new Set(),
        nextHint:  false,
    }];
    if (v !== 0) {
        for (let i = 0; i < n; i++) {
            if (i !== c && notesBoard[r][i].has(v)) {
                changes.push({ r, c: i, prevValue: userBoard[r][i], prevNotes: new Set(notesBoard[r][i]), prevHint: hintBoard[r][i], nextValue: userBoard[r][i], nextNotes: new Set([...notesBoard[r][i]].filter(x => x !== v)), nextHint: hintBoard[r][i] });
            }
            if (i !== r && notesBoard[i][c].has(v)) {
                changes.push({ r: i, c, prevValue: userBoard[i][c], prevNotes: new Set(notesBoard[i][c]), prevHint: hintBoard[i][c], nextValue: userBoard[i][c], nextNotes: new Set([...notesBoard[i][c]].filter(x => x !== v)), nextHint: hintBoard[i][c] });
            }
        }
    }
    saveStateBatch(changes);
    if (v !== 0) updateMoveCount(1);
    userBoard[r][c] = v;

    const cell = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (!valSpan) return;

    if (v === 0) {
        valSpan.textContent = '';
    } else {
        valSpan.textContent = String(v);
    }

    notesBoard[r][c].clear();
    updateNotesDisplay(r, c);

    // Notes in Zeile/Spalte updaten
    for (let i = 0; i < n; i++) {
        if (i !== c && notesBoard[r][i].has(v)) {
            notesBoard[r][i].delete(v);
            updateNotesDisplay(r, i);
        }
        if (i !== r && notesBoard[i][c].has(v)) {
            notesBoard[i][c].delete(v);
            updateNotesDisplay(i, c);
        }
    }

    cell?.classList.remove('invalid', 'correct');
    validateAll();
    commitState(r, c); // ← Zustand nach Änderung speichern

    // Alle Zellen voll aber falsch → Error-Flash
    if (v !== 0 && !timerStopped) {
        const allFilled = userBoard.every(row => row.every(val => val !== 0));
        if (allFilled) {
            const allCorrect = userBoard.every((row, r2) => row.every((val, c2) => val === currentPuzzle.solution[r2][c2]));
            if (!allCorrect) showErrorFlash();
        }
    }

    // Console-Cursor aktualisieren
    if (document.documentElement.getAttribute('data-theme') === 'console') {
        cell?.querySelector('.cell-cursor')?.remove();
        if (v === 0 && cell?.classList.contains('selected')) {
            const cursor = document.createElement('div');
            cursor.className = 'cell-cursor';
            cell.appendChild(cursor);
        }
    }
}


// 9. NOTIZ TOGGELN / SAVE STATE v0.6.0
function toggleNote(r, c, v) {
    if (!currentPuzzle) return;
    if (hintBoard?.[r][c]) return; // Tipp-Zellen sind gesperrt
    const n = currentPuzzle.solution.length;
    if (v < 1 || v > n) return;
    if (userBoard[r][c] !== 0) return;

    // Neues Notes-Set vorausberechnen
    const newNotes = new Set(notesBoard[r][c]);
    if (newNotes.has(v)) { newNotes.delete(v); } else { newNotes.add(v); }
    saveState(r, c, userBoard[r][c], newNotes);
    const notes = notesBoard[r][c];
    if (notes.has(v)) {
        notes.delete(v);
    } else {
        notes.add(v);
    }
    updateNotesDisplay(r, c);
    commitState(r, c); // ← Zustand nach Änderung speichern
}

function updateNotesDisplay(r, c) {
    const cell = getCell(r, c);
    if (!cell) return;
    const notes = notesBoard[r][c];
    cell.querySelectorAll('.note').forEach(el => {
        const v = parseInt(el.dataset.v, 10);
        el.classList.toggle('active', notes.has(v));
    });
}

function updateMoveCount(delta = 1) {
    moveCount = Math.max(0, moveCount + delta);
    const el = document.getElementById('move-count');
    if (el) el.textContent = moveCount;
    if (!timerVisible) updateTimerBtn();
}

// 10. VALIDIERUNG
function updateProgress() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;
    const total = n * n;
    const filled = userBoard.reduce((sum, row) =>
        sum + row.filter(v => v !== 0).length, 0);
    const pct = Math.round((filled / total) * 100);

    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) {
        bar.style.width = `${pct}%`;
        bar.classList.toggle('complete', filled === total);
    }
    if (text) text.textContent = `${filled} / ${total} (${pct}%)`;

}

// ── ERROR FLASH (alle Themes) ────────────────────────────────
let _errorCooldown = false;

function showErrorFlash() {
    if (_errorCooldown) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'default';
    if (theme === 'console') { showConsoleError(); return; }

    _errorCooldown = true;

    const isDark = theme === 'dark';

    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        `background:${isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)'}`,
        'display:flex', 'flex-direction:column',
        'align-items:center', 'justify-content:center',
        'pointer-events:none', 'opacity:0',
        'transition:opacity 0.5s ease',
        'backdrop-filter:blur(2px)',
    ].join(';');

    const titleColor   = isDark ? '#ff8888' : '#aa0000';
    const titleShadow  = isDark ? '0 0 20px rgba(255,100,100,0.5)' : 'none';
    const subtitleColor= isDark ? '#cc6666' : '#cc3333';
    const borderColor  = isDark ? 'rgba(255,100,100,0.3)' : 'rgba(170,0,0,0.2)';

    const title    = isDark ? 'Nicht ganz richtig.' : 'Nicht korrekt.';
    const subtitle = isDark ? 'Noch nicht alle Zellen stimmen.' : 'Es sind noch Fehler vorhanden.';

    overlay.innerHTML = `
        <div style="
            border:1px solid ${borderColor};
            border-radius:12px;
            padding:2rem 3rem;
            text-align:center;
            background:${isDark ? 'rgba(40,20,20,0.9)' : 'rgba(255,245,245,0.95)'};
            box-shadow:${isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 4px 24px rgba(170,0,0,0.1)'};
        ">
            <div style="font-size:2rem;margin-bottom:0.5rem;">✗</div>
            <div style="font-family:inherit;font-size:1.3rem;font-weight:600;color:${titleColor};text-shadow:${titleShadow};margin-bottom:0.4rem;">${title}</div>
            <div style="font-size:0.85rem;color:${subtitleColor};opacity:0.85;">${subtitle}</div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    setTimeout(() => {
        overlay.style.transition = 'opacity 0.6s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            setTimeout(() => { _errorCooldown = false; }, 1500);
        }, 600);
    }, 1800);
}

function showConsoleError() {
    if (_errorCooldown) return;
    _errorCooldown = true;

    // Overlay-Element erstellen
    const overlay = document.createElement('div');
    overlay.id = 'console-error-overlay';
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        'background:rgba(0,0,0,0.88)', 'display:flex',
        'flex-direction:column', 'align-items:center', 'justify-content:center',
        'pointer-events:none', 'opacity:0',
        'transition:opacity 0.5s ease'
    ].join(';');

    overlay.innerHTML = `
        <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(3rem,10vw,7rem);font-weight:bold;color:#ff2020;text-shadow:0 0 30px #ff2020,0 0 60px rgba(255,32,32,0.4);letter-spacing:8px;">ERROR</div>
        <div style="width:240px;height:1px;background:#ff2020;opacity:0.4;margin:1rem 0;"></div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.7rem,2vw,1rem);color:#cc0000;text-shadow:0 0 8px #ff2020;letter-spacing:2px;">not all cells correct</div>
    `;

    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });

    // Fade out nach 1.8s
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.6s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            setTimeout(() => { _errorCooldown = false; }, 1500);
        }, 600);
    }, 1800);
}

function validateAll() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;

    // Immer invalid/correct resetten
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            getCell(r, c)?.classList.remove('invalid', 'correct');
        }
    }

    // Visuelle Validierung nur wenn aktiv
    if (validationActive) {
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = getCell(r, c);
                if (!cell) continue;
                const v = userBoard[r][c];
                if (v !== 0) {
                    if (v === currentPuzzle.solution[r][c]) {
                        cell.classList.add('correct');
                    } else {
                        cell.classList.add('invalid');
                    }
                }
            }
        }
    }

    // Gewinn-Prüfung läuft IMMER, unabhängig von validationActive
    const allFilled = userBoard.every(row => row.every(v => v !== 0));
    const allCorrect = allFilled && userBoard.every((row, r) => row.every((v, c) => v === currentPuzzle.solution[r][c]));


    if (allCorrect && !timerStopped) {
        stopTimer();
        const timeStr = formatTime(elapsedSeconds);
        const diff = document.getElementById('difficulty').value;
        const n = currentPuzzle.solution.length;
        window._isDirty = false;
        if (window._dailyMode && window._dailyDateKey) {
            const dTimeStr = formatTime(elapsedSeconds);
            markDailySolved(window._dailyDateKey, dTimeStr);
            window._dailyMode = false;
            const dBtn = document.getElementById('btn-daily');
            if (dBtn) { dBtn.dataset.solved = 'true'; dBtn.title = `Tägliches Rätsel – heute bereits gelöst (${dTimeStr})`; }
        }
        setStatus(`${n}×${n} gelöst!`);
        const allHints = hintBoard && userBoard.every((row,r)=>row.every((v,c)=>v===0||hintBoard[r][c]));
        showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints);
        if (timerVisible) saveToLeaderboard(elapsedSeconds, n, diff, currentPuzzle.seed);
    }
    updateProgress();
}

// 11. MODI UMSCHALTEN
function setNotesMode(active) {
    notesMode = active;
    const btn = document.getElementById('btn-notes');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
}

function setValidationMode(active) {
    // Im Timer-Modus keine Validierung erlaubt
    if (timerVisible && active) return;
    validationActive = active;
    if (active) {
        competitiveBlocked = true;
        updateTimerBtn();
        // Prüfen ob falsche Zahlen vorhanden sind
        if (currentPuzzle) {
            const n = currentPuzzle.solution.length;
            let wrongCount = 0;
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    if (userBoard[r][c] !== 0 && userBoard[r][c] !== currentPuzzle.solution[r][c]) wrongCount++;
                }
            }
            if (wrongCount > 0) {
                const msg = document.getElementById('clear-invalid-msg');
                if (msg) msg.textContent = wrongCount === 1
                    ? '1 falsche Zahl gefunden. Löschen?'
                    : `${wrongCount} falsche Zahlen gefunden. Löschen?`;
                document.getElementById('clear-invalid-overlay')?.classList.add('visible');
            }
        }
    }
    const btn = document.getElementById('btn-validate');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    validateAll();
}

function clearInvalidCells() {
    if (!currentPuzzle) return;
    const n = currentPuzzle.solution.length;
    const changes = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (userBoard[r][c] !== 0 && userBoard[r][c] !== currentPuzzle.solution[r][c]) {
                changes.push({
                    r, c,
                    prevValue: userBoard[r][c],
                    prevNotes: new Set(notesBoard[r][c]),
                    prevHint:  hintBoard[r][c],
                    nextValue: 0,
                    nextNotes: new Set(notesBoard[r][c]),
                    nextHint:  false,
                });
            }
        }
    }
    if (changes.length === 0) return;
    saveStateBatch(changes);
    for (const ch of changes) applyCell(ch.r, ch.c, 0, ch.nextNotes, false);
    validateAll();
    const statusEl = document.getElementById('status');
    if (statusEl) setStatus(`${changes.length} falsche ${changes.length === 1 ? 'Zahl' : 'Zahlen'} gelöscht.`);
}


function updateTimerBtn() {
    const btn = document.getElementById('btn-timer');
    if (!btn) return;
    const blocked = moveCount > 0 || competitiveBlocked;
    btn.disabled = !timerVisible && blocked;
    btn.title = blocked && !timerVisible
        ? 'Wettkampf-Modus nicht mehr aktivierbar (Züge oder Hilfe bereits genutzt)'
        : 'Wettkampf-Modus (Zeit wird für Leaderboard gespeichert)';
    btn.style.opacity = (!timerVisible && blocked) ? '0.35' : '';
    btn.style.cursor = (!timerVisible && blocked) ? 'not-allowed' : '';
}

function showCountdown(onComplete) {
    // Board während Countdown sperren
    const boardEl = document.getElementById('board');
    if (boardEl) boardEl.style.pointerEvents = 'none';

    const theme = document.documentElement.getAttribute('data-theme') || 'default';
    const isConsole = theme === 'console';
    const isDark = theme === 'dark';

    const overlay = document.createElement('div');
    overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        'display:flex', 'align-items:center', 'justify-content:center',
        'pointer-events:none',
        `background:${isConsole ? 'rgba(0,0,0,0.7)' : isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)'}`,
        'backdrop-filter:blur(2px)',
    ].join(';');

    const numEl = document.createElement('div');
    const baseStyle = [
        'font-weight:bold',
        `font-family:${isConsole ? "'Share Tech Mono', monospace" : 'inherit'}`,
        'font-size:clamp(5rem,20vw,12rem)',
        'line-height:1',
        'transition:transform 0.1s ease, opacity 0.15s ease',
    ].join(';');
    numEl.style.cssText = baseStyle;
    overlay.appendChild(numEl);
    document.body.appendChild(overlay);

    const colors = {
        console: ['#00ff41', '#00cc35', '#009922'],
        dark:    ['#e2e8f0', '#94a3b8', '#64748b'],
        default: ['#1a1a1a', '#555', '#999'],
    };
    const themeColors = colors[isConsole ? 'console' : isDark ? 'dark' : 'default'];

    let count = 3;

    function tick() {
        if (count === 0) {
            overlay.style.transition = 'opacity 0.2s ease';
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); if (boardEl) boardEl.style.pointerEvents = ''; onComplete(); }, 200);
            return;
        }

        numEl.style.opacity = '0';
        numEl.style.transform = 'scale(1.4)';
        numEl.textContent = isConsole ? count + '_' : count;
        numEl.style.color = themeColors[3 - count] || themeColors[2];
        if (isConsole) numEl.style.textShadow = `0 0 30px ${themeColors[0]}`;

        requestAnimationFrame(() => {
            numEl.style.opacity = '1';
            numEl.style.transform = 'scale(1)';
        });

        count--;
        setTimeout(tick, 800);
    }

    tick();
}

function setTimerVisible(active) {
    // Wettkampf-Modus nur aktivierbar wenn noch kein Zug gemacht und keine Hilfe genutzt
    if (active && (moveCount > 0 || competitiveBlocked)) return;
    timerVisible = active;
    const btn = document.getElementById('btn-timer');
    if (btn) btn.dataset.active = active ? 'true' : 'false';

    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = active ? formatTime(elapsedSeconds) : '';
    if (active) updateTimerDisplay();
    updateTimerBtn();

    // Timer-Modus aktiv: Validierung deaktivieren und sperren
    const btnValidate = document.getElementById('btn-validate');
    const btnHint = document.getElementById('btn-hint');
    if (active) {
        setValidationMode(false);
        if (btnValidate) btnValidate.disabled = true;
        if (btnHint) btnHint.disabled = true;
    } else {
        if (btnValidate) btnValidate.disabled = false;
        if (btnHint) btnHint.disabled = false;
    }
}

// 12. UNDO/REDO FUNKTIONEN v0.6.0
// Jeder History-Eintrag ist ein Batch von Zell-Änderungen (Array),
// damit setNumber + Notiz-Löschungen in Zeile/Spalte als eine Undo-Einheit behandelt werden.
function saveStateBatch(changes) {
    // changes: [{r, c, prevValue, prevNotes, prevHint, nextValue, nextNotes, nextHint}]
    redoStack = [];
    history.push(changes);
    if (history.length > MAX_HISTORY) history.shift();
    updateUndoRedoButtons();
}

// Einzelne Zelle speichern (Notiz-Toggle)
function saveState(r, c, newValue, newNotes) {
    saveStateBatch([{
        r, c,
        prevValue: userBoard[r][c],
        prevNotes: new Set(notesBoard[r][c]),
        prevHint:  hintBoard[r][c],
        nextValue: newValue,
        nextNotes: new Set(newNotes),
        nextHint:  false,
    }]);
}

function commitState(r, c) {}

function applyCell(r, c, value, notes, isHint) {
    userBoard[r][c]  = value;
    notesBoard[r][c] = new Set(notes);
    hintBoard[r][c]  = isHint;
    const cell    = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (valSpan) valSpan.textContent = value === 0 ? '' : String(value);
    cell?.classList.toggle('hint', isHint);
    updateNotesDisplay(r, c);
    cell?.classList.remove('invalid', 'correct');
}

function undo() {
    if (history.length === 0 || !currentPuzzle) return;
    const batch = history.pop();
    redoStack.push(batch);
    updateMoveCount(1);
    for (const s of batch) applyCell(s.r, s.c, s.prevValue, s.prevNotes, s.prevHint);
    validateAll();
    updateUndoRedoButtons();
}

function redo() {
    if (redoStack.length === 0 || !currentPuzzle) return;
    const batch = redoStack.pop();
    history.push(batch);
    for (const s of batch) applyCell(s.r, s.c, s.nextValue, s.nextNotes, s.nextHint);
    validateAll();
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = history.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}


// 13. TASTATUR-STEUERUNG (Ctrl+Z/Y hinzugefügt)
document.addEventListener('keydown', (e) => {
    if (!currentPuzzle) return;
    if (document.activeElement?.id === 'seed-input') return;

    const n = currentPuzzle.solution.length;

    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'z':
                e.preventDefault();
                undo();
                return;
            case 'y':
                e.preventDefault();
                redo();
                return;
        }
    }

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            selectCell((selected.r - 1 + n) % n, selected.c);
            return;
        case 'ArrowDown':
            e.preventDefault();
            selectCell((selected.r + 1) % n, selected.c);
            return;
        case 'ArrowLeft':
            e.preventDefault();
            selectCell(selected.r, (selected.c - 1 + n) % n);
            return;
        case 'ArrowRight':
            e.preventDefault();
            selectCell(selected.r, (selected.c + 1) % n);
            return;
        case 'n':
        case 'N':
            setNotesMode(!notesMode);
            return;
        case 'v':
        case 'V':
            setValidationMode(!validationActive);
            return;
        case 'Backspace':
        case 'Delete':
            e.preventDefault();
            setNumber(selected.r, selected.c, 0);
            return;
    }

    // 1-9
    if (/[1-9]/.test(e.key)) {
        const v = parseInt(e.key, 10);
        if (v > n) return;
        e.preventDefault();
        if (notesMode) {
            toggleNote(selected.r, selected.c, v);
        } else {
            setNumber(selected.r, selected.c, v);
        }
    }
});

// 14. TIPP-FUNKTION
function giveHint() {
    if (!currentPuzzle) return;
    if (timerVisible) return;

    const n = currentPuzzle.solution.length;
    let r = selected.r;
    let c = selected.c;

    if (userBoard[r][c] === currentPuzzle.solution[r][c]) {
        const candidates = [];
        for (let rr = 0; rr < n; rr++) {
            for (let cc = 0; cc < n; cc++) {
                if (userBoard[rr][cc] !== currentPuzzle.solution[rr][cc]) {
                    candidates.push({ r: rr, c: cc });
                }
            }
        }
        if (candidates.length === 0) return;
        ({ r, c } = candidates[Math.floor(Math.random() * candidates.length)]);
    }

    saveState(r, c, currentPuzzle.solution[r][c], new Set());
    updateMoveCount(1);
    userBoard[r][c]  = currentPuzzle.solution[r][c];
    notesBoard[r][c].clear();
    hintBoard[r][c]  = true;
    competitiveBlocked = true;
    if (!timerVisible) updateTimerBtn();

    const cell    = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (valSpan) valSpan.textContent = String(currentPuzzle.solution[r][c]);
    cell?.classList.add('hint');
    updateNotesDisplay(r, c);
    selectCell(r, c);
    validateAll();
    commitState(r, c);
}


// 15. INITIALISIERUNG
window.addEventListener('DOMContentLoaded', () => {
    const sizeEl = document.getElementById('size');
    const diffEl = document.getElementById('difficulty');
    const btnNew = document.getElementById('btn-new');
    const btnSolve = document.getElementById('btn-solve');
    const btnNotes = document.getElementById('btn-notes');
    const btnValidate = document.getElementById('btn-validate');
    const btnTimer = document.getElementById('btn-timer');
    const btnReset = document.getElementById('btn-reset');
    const statusEl = document.getElementById('status');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const seedInput = document.getElementById('seed-input');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.addEventListener('click', undo);
    if (redoBtn) redoBtn.addEventListener('click', redo);
    updateUndoRedoButtons(); // Initial

    const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

    function newPuzzle(forceSeed = null) {
        let n, diff, rawSeed;

        if (forceSeed !== null) {
            const full = String(forceSeed).trim().toUpperCase();
            const parsed = parseFullSeed(full);
            if (parsed) {
                // Präfix-ID: Größe + Schwierigkeit aus ID übernehmen
                n    = parsed.n;
                diff = parsed.diff;
                rawSeed = parsed.raw;
                sizeEl.value = String(n);
                diffEl.value = diff;
                syncCustomSelect('size', String(n));
                syncCustomSelect('difficulty', diff);
            } else {
                // Legacy oder reiner Seed ohne Präfix
                n    = parseInt(sizeEl.value, 10);
                diff = diffEl.value;
                rawSeed = full;
            }
        } else {
            n    = parseInt(sizeEl.value, 10);
            diff = diffEl.value;
            rawSeed = randomSeed();
        }

        const fullSeedStr = buildFullSeed(n, diff, rawSeed);
        if (seedInput) setSeedTypewriter(fullSeedStr);
        const seedInt = seedToInt(rawSeed, n, diff);

        if (generationWorker) {
            generationWorker.terminate();
            generationWorker = null;
        }
        btnNew.disabled = true;
        btnNew.textContent = 'Generiere...';
        setStatus(`Generiere ${n}x${n}-Rätsel ${diffLabels[diff]}…`);

        generationWorker = new Worker('worker.js');
        generationWorker.onmessage = function(e) {
            generationWorker = null;
            if (e.data.success) {
                currentPuzzle = { solution: e.data.solution, cages: e.data.cages, seed: fullSeedStr };
                setNotesMode(false);
                validationActive = false;
                const _vBtn = document.getElementById('btn-validate');
                if (_vBtn) _vBtn.dataset.active = 'false';
                // _dailyMode nur beibehalten wenn das generierte Rätsel auch der Tages-Seed ist
                if (window._dailyMode && fullSeedStr !== getDailyConfig().fullSeed) {
                    window._dailyMode = false;
                    window._dailyDateKey = null;
                }
                requestAnimationFrame(() => renderBoard(currentPuzzle));
                if (timerVisible) {
                    showCountdown(() => startTimer());
                } else {
                    startTimer();
                }
                setStatus(`${n}×${n} ${diffLabels[diff]}`);
                btnSolve.disabled = false;
            } else {
                setStatus('Fehler beim Generieren – bitte erneut klicken.');
            }
            btnNew.disabled = false;
            btnNew.textContent = 'Neues Rätsel';
        };
        generationWorker.onerror = function(err) {
            generationWorker = null;
            setStatus('Fehler beim Generieren – bitte erneut klicken.');
            console.error(err);
            btnNew.disabled = false;
            btnNew.textContent = 'Neues Rätsel';
        };
        generationWorker.postMessage({ n, diff, seed: seedInt });
    }

    function solveAll() {
        if (!currentPuzzle) return;
        const n = currentPuzzle.solution.length;
        stopTimer(true);
        history   = [];
        redoStack = [];
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                setNumber(r, c, currentPuzzle.solution[r][c]);
            }
        }
        updateUndoRedoButtons();
        moveCount = 0;
        const moveEl = document.getElementById('move-count');
        if (moveEl) moveEl.textContent = '-';
        setStatus('Lösung angezeigt. Zeit gestoppt.');
    }

    window._newPuzzle = newPuzzle;
    btnNew.addEventListener('click', () => newPuzzle(null));
    btnSolve.addEventListener('click', solveAll);
    btnNotes.addEventListener('click', () => setNotesMode(!notesMode));
    btnValidate.addEventListener('click', () => setValidationMode(!validationActive));
    btnTimer.addEventListener('click', () => setTimerVisible(!timerVisible));
    const btnHint = document.getElementById('btn-hint');
    if (btnHint) btnHint.addEventListener('click', giveHint);

    // Settings
    const btnSettings = document.getElementById('btn-settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');

    if (btnSettings) btnSettings.addEventListener('click', () => {
        settingsOverlay.classList.add('visible');
    });
    if (settingsClose) settingsClose.addEventListener('click', () => {
        settingsOverlay.classList.remove('visible');
    });
    if (settingsOverlay) settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) settingsOverlay.classList.remove('visible');
    });
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });

    initTheme();
    initCustomSelects();
    initDailyButton();

    // Gespeicherten Spielstand automatisch laden (falls vorhanden)
    const saved = loadGameState();
    if (saved) {
        clearSavedGame();
        restoreGameState(saved);
    }

    const btnPdf = document.getElementById('btn-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', async () => {
            if (!currentPuzzle) return;
            if (window.electronAPI) {
                const n = currentPuzzle.solution.length;
                const diff = document.getElementById('difficulty').value;
                const diffLabels = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
                const pdfMeta = document.getElementById('pdf-meta');
                if (pdfMeta) {
                    pdfMeta.textContent = `${n}×${n}  ·  ${diffLabels[diff]}  ·  ID: ${currentPuzzle.seed}`;
                }
                const result = await window.electronAPI.exportPDF();
                if (result?.success) {
                    setStatus('PDF gespeichert.');
                }
            }
        });
    }
    document.getElementById('win-close').addEventListener('click', hideWinBanner);
    document.getElementById('win-new').addEventListener('click', () => {
        hideWinBanner();
        newPuzzle(null);
    });

    seedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const raw = seedInput.value.trim();
            if (raw.length > 0) newPuzzle(raw);
        }
    });

    const btnLoadSeed = document.getElementById('btn-load-seed');
    if (btnLoadSeed) {
        btnLoadSeed.addEventListener('click', () => {
            const raw = seedInput.value.trim();
            if (raw.length > 0) newPuzzle(raw);
        });
    }

    btnReset.addEventListener('click', () => {
        if (!currentPuzzle) return;
        modalOverlay.classList.add('visible');
    });

    modalCancel.addEventListener('click', () => modalOverlay.classList.remove('visible'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove('visible');
    });

    // Falsche-Zahlen-Modal
    const clearInvalidOverlay = document.getElementById('clear-invalid-overlay');
    const clearInvalidConfirm = document.getElementById('clear-invalid-confirm');
    const clearInvalidCancel  = document.getElementById('clear-invalid-cancel');
    if (clearInvalidConfirm) clearInvalidConfirm.addEventListener('click', () => {
        clearInvalidOverlay.classList.remove('visible');
        clearInvalidCells();
    });
    if (clearInvalidCancel) clearInvalidCancel.addEventListener('click', () => {
        clearInvalidOverlay.classList.remove('visible');
    });
    if (clearInvalidOverlay) clearInvalidOverlay.addEventListener('click', (e) => {
        if (e.target === clearInvalidOverlay) clearInvalidOverlay.classList.remove('visible');
    });
        modalConfirm.addEventListener('click', () => {
            modalOverlay.classList.remove('visible');
            if (!currentPuzzle) return;
            const n = currentPuzzle.solution.length;
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    userBoard[r][c] = 0;
                    notesBoard[r][c].clear();
                    hintBoard[r][c] = false;
                    const cell = getCell(r, c);
                    const valSpan = cell?.querySelector('.cell-value');
                    if (valSpan) valSpan.textContent = '';
                    cell?.classList.remove('invalid', 'correct', 'hint');
                    updateNotesDisplay(r, c);
                }
            }
            startTimer();
            setStatus('Rätsel zurückgesetzt.');
            selectCell(0, 0);
            history = [];
            redoStack = [];
            moveCount = 0;
            const moveEl = document.getElementById('move-count');
            if (moveEl) moveEl.textContent = '0';
            updateUndoRedoButtons();
        });

        window.addEventListener('resize', resizeBoard);
});

// Stub für später (Leaderboard)
function saveToLeaderboard(seconds, size, difficulty, seed) {
    // TODO: localStorage-Einträge verwalten
    console.log('Leaderboard-Eintrag:', formatTime(seconds), `${size}x${size}`, difficulty, seed);
}
