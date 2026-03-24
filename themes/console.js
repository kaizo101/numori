// ── CONSOLE THEME ───────────────────────────────────────────────

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
    let phase=RAIN;
    // Zeit-basiertes Timing (statt tick-basiert) – läuft auf allen Geräten gleich schnell
    const MS_PER_TICK = 1000/60; // Ziel: 60fps-Äquivalent
    let elapsed = 0, lastTime = performance.now();
    function ticks() { return elapsed / MS_PER_TICK; }
    const isMobile = window.innerWidth <= 600;
    const RAIN_TICKS  = isMobile ? 180 : 400;
    const FLASH_TICKS = isMobile ?  50 :  90;
    const FLY_TICKS   = isMobile ?  60 : 110;
    const TYPE_SPEED  = isMobile ?   2 :   5; // Ticks pro Zeichen (zeit-basiert → gleich auf allen fps)
    const drops = Array.from({length:cols}, ()=>Math.floor(Math.random()*-rows));
    // Win data
    const d = _matrixWinData||{};
    const lbData = window._consoleLbData || null;
    window._consoleLbData = null;
    const diffLabel = {easy:'easy',medium:'medium',hard:'hard',expert:'expert'}[d.diff]||'';
    const denied = d.denied || false;
    const ACCENT = denied ? '#ff2020' : '#00ff41';
    const TITLE_TEXT = denied ? 'ACCESS DENIED' : 'ACCESS GRANTED';
    let namePhase = !denied && lbData ? true : false;
    let nameSubmitted = false;
    let statLines;
    if (denied) {
        statLines = [
            '',
            'ERROR CODE 21: cheater or developer detected',
            '',
            '> type "loser" to continue',
        ];
    } else {
        statLines = [
            '',
            'size:  '+(d.size||'')+' / '+(diffLabel||''),
            'time:  '+(d.time||'--:--')+(d.isNewBest ? '  ★ neue bestzeit!' : ''),
            'moves: '+(d.moves!==undefined?d.moves:'-'),
            'id:    '+(d.seed||'').toLowerCase(),
            '',
        ];
        if (lbData) {
            statLines.push(
                'leaderboard',
                '──────────────────',
                'local:  rank '+lbData.rank,
                'global: loading\u2026',
                '',
                '> enter name:',
            );
            const consent = localStorage.getItem('numori-lb-consent');
            if (consent === 'granted' && typeof window.supabaseFetchLeaderboard === 'function') {
                window.supabaseFetchLeaderboard(lbData.size, lbData.difficulty, 'alltime', 100).then(rows => {
                    const betterCount = rows.filter(r =>
                        r.time_seconds < lbData.seconds || (r.time_seconds === lbData.seconds && r.move_count < lbData.moves)
                    ).length;
                    const globalRank = betterCount + 1;
                    const idx = statLines.findIndex(l => l.startsWith('global:'));
                    if (idx >= 0) statLines[idx] = 'global: ' + (globalRank <= 20 ? 'rank '+globalRank : '–');
                }).catch(() => {
                    const idx = statLines.findIndex(l => l.startsWith('global:'));
                    if (idx >= 0) statLines[idx] = 'global: –';
                });
            } else {
                const idx = statLines.findIndex(l => l.startsWith('global:'));
                if (idx >= 0) statLines[idx] = 'global: –';
            }
        } else {
            statLines.push(
                '> type "start" for new puzzle',
                '> type "exit"  to close',
            );
        }
    }
    // Layout
    const TITLE_FS     = FS*2.4;
    const TITLE_FINAL_Y= canvas.height*0.28;
    const TITLE_START_Y= canvas.height*0.50;
    const STATS_START_Y= TITLE_FINAL_Y + TITLE_FS*1.6;
    const STAT_LINE_H  = FS*1.85;
    let flashAlpha=0, flashScale=1, titleY=TITLE_START_Y;
    let typeLineIdx=0, typeCharIdx=0, typeElapsed=0;
    const TYPE_MS = TYPE_SPEED * MS_PER_TICK;
    let inputActive=false, inputValue='', inputBlink=true, inputBlinkTick=0;

    // Mobile: Touch-Buttons statt Texteingabe
    let mobileButtons = null;
    function createMobileButtons() {
        if (mobileButtons) return;
        mobileButtons = document.createElement('div');
        const btnStyle = 'padding:12px 20px;border:1px solid '+ACCENT+';background:#000;color:'+ACCENT+';font-family:Share Tech Mono,monospace;font-size:0.9em;border-radius:4px;cursor:pointer;letter-spacing:1px;';
        if (!denied && namePhase) {
            mobileButtons.style.cssText = 'position:fixed;bottom:80px;left:0;right:0;z-index:100000;display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:0 24px;';
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = localStorage.getItem('numori-player-name') || '';
            nameInput.placeholder = 'enter name';
            nameInput.style.cssText = 'padding:12px 16px;border:1px solid '+ACCENT+';background:#000;color:'+ACCENT+';font-family:Share Tech Mono,monospace;font-size:0.9em;letter-spacing:1px;outline:none;border-radius:4px;';
            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:10px;';
            const btnOk = document.createElement('button');
            btnOk.textContent = '> submit';
            btnOk.style.cssText = btnStyle + 'flex:1;';
            const btnSkip = document.createElement('button');
            btnSkip.textContent = '> skip';
            btnSkip.style.cssText = 'padding:12px 20px;border:1px solid #555;background:#000;color:#555;font-family:Share Tech Mono,monospace;font-size:0.9em;border-radius:4px;cursor:pointer;letter-spacing:1px;flex:1;';
            function submitName() {
                const name = nameInput.value.trim();
                if (name) localStorage.setItem('numori-player-name', name);
                insertLeaderboardEntry(name, lbData.seconds, lbData.moves, lbData.size, lbData.difficulty, lbData.seed, lbData.isDailyMode);
                nameSubmitted = true; namePhase = false;
                statLines.push('', '> saved!');
                removeMobileButtons();
                createMobileButtons();
            }
            btnOk.addEventListener('click', submitName);
            btnSkip.addEventListener('click', () => { namePhase = false; removeMobileButtons(); createMobileButtons(); });
            btnRow.appendChild(btnOk);
            btnRow.appendChild(btnSkip);
            mobileButtons.appendChild(nameInput);
            mobileButtons.appendChild(btnRow);
        } else {
            mobileButtons.style.cssText = 'position:fixed;bottom:80px;left:0;right:0;z-index:100000;display:flex;justify-content:center;gap:16px;padding:0 24px;';
            if (!denied) {
                const btnNew = document.createElement('button');
                btnNew.textContent = '> neues rätsel';
                btnNew.style.cssText = btnStyle;
                btnNew.addEventListener('click', () => { stopMatrixRain(); hideWinBanner(); document.getElementById('btn-new')?.click(); removeMobileButtons(); });
                mobileButtons.appendChild(btnNew);
            }
            const btnExit = document.createElement('button');
            btnExit.textContent = denied ? '> schließen' : '> beenden';
            btnExit.style.cssText = btnStyle;
            btnExit.addEventListener('click', () => { stopMatrixRain(); hideWinBanner(); removeMobileButtons(); });
            mobileButtons.appendChild(btnExit);
        }
        document.body.appendChild(mobileButtons);
    }
    function removeMobileButtons() {
        if (mobileButtons) { mobileButtons.remove(); mobileButtons = null; }
    }

    function activateInput() {
        if (inputActive) return; inputActive=true;
        if (isMobile) { createMobileButtons(); return; }
        if (_matrixKeyHandler) document.removeEventListener('keydown',_matrixKeyHandler);
        _matrixKeyHandler=(e)=>{
            if (!inputActive) return;
            if (e.key==='Enter'){
                if (namePhase && !nameSubmitted) {
                    const name = inputValue.trim();
                    if (name) localStorage.setItem('numori-player-name', name);
                    insertLeaderboardEntry(name, lbData.seconds, lbData.moves, lbData.size, lbData.difficulty, lbData.seed, lbData.isDailyMode);
                    nameSubmitted = true; namePhase = false;
                    statLines.push('', '> saved!', '', '> type "start" for new puzzle', '> type "exit"  to close');
                    inputValue = '';
                } else {
                    const cmd=inputValue.trim().toLowerCase();
                    if (cmd==='start'||cmd==='loser'){stopMatrixRain();hideWinBanner();document.getElementById('btn-new')?.click();}
                    else if(cmd==='exit'){stopMatrixRain();hideWinBanner();}
                    else inputValue='';
                }
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
        const dy = STATS_START_Y + statLines.length * STAT_LINE_H + FS * 0.5;
        const dx = canvas.width/2 - 90;
        const prompt = namePhase ? '> name: ' : '> ';
        ctx.fillText(prompt+inputValue+(inputBlink?'_':' '),dx,dy);
    }
    function draw(now){
        const dt = Math.min(now - lastTime, 50);
        lastTime = now;
        elapsed += dt;
        const t = ticks();
        if(phase===RAIN){
            ctx.fillStyle="rgba(0,0,0,0.14)"; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.font=FS+"px Share Tech Mono,monospace"; ctx.textAlign="left"; ctx.textBaseline="alphabetic";
            for(let c=0;c<cols;c++){
                const pool="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#%&!?/|^~+-*=<>.:;{}[]()" ;const y=drops[c],ch=pool[Math.floor(Math.random()*pool.length)];
                if(y>=0&&y<rows){const tr=denied?Math.min(1,t/RAIN_TICKS):0;const r=Math.round(tr*255),g=Math.round((1-tr)*255);const dropColor=y<2?"#ffffff":"rgb("+r+","+g+",0)";ctx.fillStyle=dropColor;ctx.fillText(ch,c*FS,y*FS+FS);}
                if(Math.random()<0.55)drops[c]++;if(drops[c]>rows+12)drops[c]=Math.floor(Math.random()*-70);
            }
            if(t>RAIN_TICKS){phase=FLASH;elapsed=0;}
        }else if(phase===FLASH){
            ctx.fillStyle="rgba(0,0,0,0.18)";ctx.fillRect(0,0,canvas.width,canvas.height);
            const pr=t/FLASH_TICKS;
            if(pr<0.35){flashAlpha=pr/0.35;flashScale=1+(1-flashAlpha)*0.25;}else{flashAlpha=1;flashScale=1;}
            drawTitle(TITLE_START_Y,flashAlpha,flashScale);
            if(t>=FLASH_TICKS){phase=FLY;elapsed=0;titleY=TITLE_START_Y;}
        }else if(phase===FLY){
            ctx.fillStyle="rgba(0,0,0,0.12)";ctx.fillRect(0,0,canvas.width,canvas.height);
            const ease=1-Math.pow(1-(t/FLY_TICKS),3);
            titleY=TITLE_START_Y+(TITLE_FINAL_Y-TITLE_START_Y)*ease;
            drawTitle(titleY,1,1);
            if(t>=FLY_TICKS){phase=TYPEWRITE;elapsed=0;typeLineIdx=0;typeCharIdx=0;typeElapsed=0;}
        }else if(phase===TYPEWRITE){
            ctx.fillStyle="rgba(0,0,0,0.88)";ctx.fillRect(0,0,canvas.width,canvas.height);
            drawTitle(TITLE_FINAL_Y,1,1);
            typeElapsed += dt;
            while(typeElapsed >= TYPE_MS){
                typeElapsed -= TYPE_MS;
                const cur=statLines[typeLineIdx]||"";
                if(typeCharIdx<cur.length){typeCharIdx++;}
                else if(typeLineIdx<statLines.length-1){typeLineIdx++;typeCharIdx=0;}
                else{phase=IDLE;activateInput();break;}
            }
            drawStats(typeLineIdx,typeCharIdx);
            if(Math.floor(t/22)%2===0){
                ctx.fillStyle=ACCENT;ctx.textBaseline="alphabetic";
                const tw=ctx.measureText((statLines[typeLineIdx]||"").slice(0,typeCharIdx)).width;
                const sX2=canvas.width/2-90;const isCent=typeLineIdx===0||statLines[typeLineIdx].startsWith(">")||statLines[typeLineIdx].startsWith("ERROR");const cX=isCent?canvas.width/2+tw/2+3:sX2+tw+3;ctx.fillRect(cX,STATS_START_Y+typeLineIdx*STAT_LINE_H-FS*0.9,2,FS);
            }
        }else{
            ctx.fillStyle="rgba(0,0,0,0.88)";ctx.fillRect(0,0,canvas.width,canvas.height);
            drawTitle(TITLE_FINAL_Y,1,1);
            drawStats(statLines.length,0);
            if(!isMobile) drawInput();
        }
        _matrixAnimFrame=requestAnimationFrame(draw);
    }
    draw(performance.now());
}

function stopMatrixRain(){
    if(_matrixAnimFrame){cancelAnimationFrame(_matrixAnimFrame);_matrixAnimFrame=null;}
    if(_matrixKeyHandler){document.removeEventListener("keydown",_matrixKeyHandler);_matrixKeyHandler=null;}
    // Mobile Touch-Buttons entfernen falls vorhanden
    document.querySelectorAll('#matrix-mobile-btns').forEach(el => el.remove());
    const c=document.getElementById("matrix-canvas");
    if(c){c.style.display="none";c.getContext("2d").clearRect(0,0,c.width,c.height);}
}

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

    const title    = isDark ? t('error-title-dark') : t('error-title-default');
    const subtitle = isDark ? t('error-sub-dark') : t('error-sub-default');

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

