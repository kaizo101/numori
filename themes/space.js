// ── SPACE THEME – Starfield + Aurora Toolbar ──────────────────────

const spaceStars = (() => {
    let canvas = null;
    let ctx    = null;
    let animId = null;
    let stars   = [];
    let flares  = [];
    let meteors = [];
    let frameCount = 0;
    let nextMeteorFrame = 0;

    function active() {
        return document.documentElement.getAttribute('data-theme') === 'space';
    }

    function mkStars(w, h) {
        stars = [];
        const count = Math.floor((w * h) / 5500);
        for (let i = 0; i < count; i++) {
            const bright = Math.random();
            stars.push({
                x:          Math.random() * w,
                y:          Math.random() * h,
                r:          bright > 0.97 ? 2.0 : bright > 0.85 ? 1.1 : bright > 0.5 ? 0.6 : 0.25,
                alpha:      Math.random() * 0.55 + 0.15,
                twinkleSpd: Math.random() * 0.009 + 0.002,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                hue:        Math.random() > 0.9
                                ? (Math.random() > 0.5 ? '#ffe8c8' : '#c8d8ff')
                                : '#e8f0ff',
            });
        }

        flares = [];
        for (let i = 0; i < 4; i++) {
            flares.push({
                x:     Math.random() * w,
                y:     Math.random() * h,
                r:     Math.random() * 1.5 + 1.5,
                alpha: Math.random() * 0.4 + 0.3,
                pulse: Math.random() * 0.004 + 0.001,
                dir:   Math.random() > 0.5 ? 1 : -1,
            });
        }
    }

    function spawnMeteor(w, h) {
        const edge  = Math.random(); // 0–0.6 oben, 0.6–1 links
        const angle = (Math.random() * 30 + 15) * Math.PI / 180; // 15–45°
        const speed = Math.random() * 0.6 + 0.4;                  // 0.4–1 px/frame
        const tailLen = Math.random() * 80 + 100;                  // 100–180 px
        let x, y;
        if (edge < 0.6) {
            // Von irgendwo oben — gesamte Breite
            x = Math.random() * w;
            y = -20;
        } else {
            // Von der linken Seite — gesamte Höhe
            x = -20;
            y = Math.random() * h;
        }
        meteors.push({
            x, y,
            vx:     Math.cos(angle) * speed,
            vy:     Math.sin(angle) * speed,
            tailLen,
            alpha:  0,
            fadeIn: true,
        });
    }

    function drawMeteors(w, h) {
        frameCount++;
        if (frameCount >= nextMeteorFrame) {
            spawnMeteor(w, h);
            // Nächste Sternschnuppe in 4–12 Sekunden (bei 60fps)
            nextMeteorFrame = frameCount + Math.floor((Math.random() * 8 + 4) * 60);
        }

        meteors = meteors.filter(m => m.alpha > 0 || m.fadeIn);

        for (const m of meteors) {
            // Ein-/Ausblenden
            if (m.fadeIn) {
                m.alpha = Math.min(1, m.alpha + 0.06);
                if (m.alpha >= 1) m.fadeIn = false;
            } else {
                m.alpha = Math.max(0, m.alpha - 0.005);
            }

            m.x += m.vx;
            m.y += m.vy;

            // Gradient: Kopf weiß-hell, Schweif transparent
            const tx = m.x - Math.cos(Math.atan2(m.vy, m.vx)) * m.tailLen;
            const ty = m.y - Math.sin(Math.atan2(m.vy, m.vx)) * m.tailLen;
            const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
            grad.addColorStop(0,    'rgba(255,255,255,0)');
            grad.addColorStop(0.7,  `rgba(200,220,255,${m.alpha * 0.4})`);
            grad.addColorStop(1,    `rgba(255,255,255,${m.alpha})`);

            ctx.globalAlpha = 1;
            ctx.strokeStyle = grad;
            ctx.lineWidth   = 3;
            ctx.lineCap     = 'round';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();

            // Leuchtpunkt am Kopf
            ctx.globalAlpha = m.alpha * 0.95;
            ctx.fillStyle   = '#ffffff';
            ctx.beginPath();
            ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Aus dem Bild → sofort entfernen
            if (m.x > w + 50 || m.y > h + 50) m.alpha = 0;
        }
    }

    let lastFrame = 0;
    function draw(ts = 0) {
        if (!active()) { stop(); return; }
        animId = requestAnimationFrame(draw);
        if (ts - lastFrame < 32) return; // ~30fps cap
        lastFrame = ts;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        for (const s of stars) {
            s.alpha += s.twinkleSpd * s.twinkleDir;
            if (s.alpha > 0.75 || s.alpha < 0.06) s.twinkleDir *= -1;
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle   = s.hue;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const f of flares) {
            f.alpha += f.pulse * f.dir;
            if (f.alpha > 0.85 || f.alpha < 0.20) f.dir *= -1;
            ctx.globalAlpha = f.alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(200,230,255,0.30)';
            ctx.lineWidth   = 0.5;
            const len = f.r * 7;
            ctx.beginPath();
            ctx.moveTo(f.x - len, f.y); ctx.lineTo(f.x + len, f.y);
            ctx.moveTo(f.x, f.y - len); ctx.lineTo(f.x, f.y + len);
            ctx.stroke();
        }

        drawMeteors(w, h);

        ctx.globalAlpha = 1;
    }

    function resize() {
        if (!canvas) return;
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        mkStars(canvas.width, canvas.height);
    }

    function start() {
        if (animId) return;
        meteors = [];
        frameCount = 0;
        nextMeteorFrame = Math.floor((Math.random() * 5 + 3) * 60); // erste nach 3–8s
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'space-canvas';
            canvas.style.cssText =
                'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;display:block;';
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');
        }
        resize();
        draw();
        window.addEventListener('resize', resize);
    }

    function stop() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        if (canvas) { canvas.remove(); canvas = null; ctx = null; }
        window.removeEventListener('resize', resize);
    }

    function onThemeChange(newTheme) {
        if (newTheme === 'space') start();
        else stop();
    }

    return { start, stop, onThemeChange };
})();


// ── SPACE WIN – Supernova Win Screen ──────────────────────────────

const spaceWin = (() => {
    let canvas = null, ctx = null, animId = null, frame = 0;
    let particles = [], rings = [], overlay = null;
    let winData = null, cardShown = false, exploded = false;

    const COLORS = [
        [136,  68, 255],
        [180, 120, 255],
        [200, 168, 255],
        [  0, 180, 255],
        [245, 200,  66],
        [255, 255, 255],
    ];

    function spawnExplosion(w, h) {
        const cx = w / 2, cy = h / 2;
        rings = [
            { r: 2, speed: 15, width: 16, alpha: 1.0, color: [255, 255, 255] },
            { r: 1, speed:  9, width:  9, alpha: 0.9, color: [200, 168, 255] },
            { r: 0, speed:  5, width:  6, alpha: 0.8, color: [136,  68, 255] },
            { r: 0, speed:  2, width:  3, alpha: 0.6, color: [  0, 180, 255] },
            { r: 0, speed:  1, width:  2, alpha: 0.4, color: [245, 200,  66] },
        ];
        for (let i = 0; i < 550; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 22 + 2;
            const c     = COLORS[Math.floor(Math.random() * COLORS.length)];
            particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size:  Math.random() * 4 + 0.5,
                alpha: Math.random() * 0.4 + 0.6,
                decay: Math.random() * 0.004 + 0.0012,
                color: c, ambient: false,
            });
        }
    }

    function spawnAmbient(w, h) {
        const angle = Math.random() * Math.PI * 2;
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        particles.push({
            x: w/2 + Math.cos(angle) * Math.random() * 30,
            y: h/2 + Math.sin(angle) * Math.random() * 30,
            vx: Math.cos(angle) * (Math.random() * 0.7 + 0.2),
            vy: Math.sin(angle) * (Math.random() * 0.7 + 0.2),
            size:  Math.random() * 1.8 + 0.3,
            alpha: Math.random() * 0.5 + 0.2,
            decay: Math.random() * 0.003 + 0.001,
            color: c, ambient: true,
        });
    }

    function draw() {
        if (!canvas) return;
        const w = canvas.width, h = canvas.height;
        const cx = w / 2, cy = h / 2;
        ctx.clearRect(0, 0, w, h);
        frame++;

        // Phase 1: weißer Punkt baut sich auf (Frames 0–70)
        if (!exploded) {
            const t = frame / 70;
            const dotR = 2 + t * 16;
            const glowR = 20 + t * 120;
            const glowA = 0.05 + t * 0.55;

            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
            glow.addColorStop(0,   `rgba(255,255,255,${glowA})`);
            glow.addColorStop(0.3, `rgba(180,100,255,${glowA * 0.5})`);
            glow.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 0.5 + t * 0.5;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            if (frame >= 70) {
                exploded = true;
                particles = [];
                rings = [];
                spawnExplosion(w, h);
            }
            animId = requestAnimationFrame(draw);
            return;
        }

        // Phase 2+: Explosion
        const ef = frame - 45; // explosion-frame

        // Nebula (erscheint nach Frame 40 der Explosion)
        const nebulaIn    = Math.min(1, Math.max(0, (ef - 40) / 120));
        const nebulaPulse = 0.85 + 0.15 * Math.sin(frame * 0.015);
        const nebulaA     = nebulaIn * 0.75 * nebulaPulse;
        if (nebulaA > 0) {
            const nr = Math.min(w, h) * 0.75;
            const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr);
            ng.addColorStop(0,   `rgba(160, 80, 255, ${nebulaA * 0.9})`);
            ng.addColorStop(0.3, `rgba(100, 20, 200, ${nebulaA * 0.6})`);
            ng.addColorStop(0.6, `rgba(  0,180, 255, ${nebulaA * 0.25})`);
            ng.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = ng;
            ctx.beginPath();
            ctx.arc(cx, cy, nr, 0, Math.PI * 2);
            ctx.fill();

            const ng2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr * 0.55);
            ng2.addColorStop(0,   `rgba(255,220,100,${nebulaA * 0.30})`);
            ng2.addColorStop(0.5, `rgba(200,100,255,${nebulaA * 0.15})`);
            ng2.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = ng2;
            ctx.beginPath();
            ctx.arc(cx, cy, nr * 0.55, 0, Math.PI * 2);
            ctx.fill();
        }

        // Weißer Flash direkt nach Explosion
        if (ef < 45) {
            const a  = Math.max(0, 1 - ef / 45);
            const fr = ef * 14 + 60;
            const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
            fg.addColorStop(0,   `rgba(255,255,255,${a})`);
            fg.addColorStop(0.4, `rgba(200,150,255,${a * 0.7})`);
            fg.addColorStop(1,   'rgba(136,68,255,0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.arc(cx, cy, fr, 0, Math.PI * 2);
            ctx.fill();
        }

        // Schockwellen-Ringe
        for (const ring of rings) {
            ring.r     += ring.speed;
            ring.speed *= 0.97;
            ring.alpha  = Math.max(0, ring.alpha - 0.003);
            if (ring.alpha <= 0) continue;
            const [r, g, b] = ring.color;
            ctx.globalAlpha = ring.alpha;
            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.lineWidth   = ring.width * ring.alpha;
            ctx.beginPath();
            ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Ambient-Partikel
        if (ef > 50 && ef % 2 === 0) spawnAmbient(w, h);
        particles = particles.filter(p => p.alpha > 0);
        for (const p of particles) {
            p.x    += p.vx;
            p.y    += p.vy;
            p.vx   *= p.ambient ? 0.999 : 0.990;
            p.vy   *= p.ambient ? 0.999 : 0.990;
            p.alpha = Math.max(0, p.alpha - p.decay);
            if (p.alpha <= 0) continue;
            const [r, g, b] = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Win-Karte erscheint nach Explosion
        if (ef >= 120 && !cardShown) {
            cardShown = true;
            _showCard();
        }

        animId = requestAnimationFrame(draw);
    }

    function _showCard() {
        if (!overlay || !winData) return;
        const { timeStr, size, diff, seed, isNewBest, leaderboardRank, moves } = winData;
        const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };

        const style = document.createElement('style');
        style.textContent = `
            @keyframes _swCardIn {
                from { opacity:0; transform:translate(-50%,-50%) scale(0.75); }
                to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
            }
            #space-win-card button:hover { filter: brightness(1.3); }
        `;
        document.head.appendChild(style);

        const card = document.createElement('div');
        card.id = 'space-win-card';
        card.style.cssText = [
            'position:absolute', 'left:50%', 'top:50%',
            'transform:translate(-50%,-50%)',
            'background:rgba(6,3,20,0.88)',
            'border:1px solid rgba(136,68,255,0.65)',
            'border-radius:24px', 'padding:28px 36px',
            'text-align:center',
            'box-shadow:0 0 80px rgba(136,68,255,0.45),0 0 30px rgba(0,180,255,0.20),inset 0 0 40px rgba(136,68,255,0.06)',
            'min-width:260px', 'max-width:88vw', 'width:340px',
            'color:#e0d0ff', 'font-family:inherit',
            'animation:_swCardIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
            'z-index:2',
        ].join(';');

        const statCell = (lbl, val) =>
            `<div style="flex:1;padding:10px 6px">
                <div style="font-size:0.68rem;color:rgba(180,150,255,0.55);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">${lbl}</div>
                <div style="font-size:1.05rem;font-weight:600;color:#c8b0ff">${val}</div>
            </div>`;
        const statSep = () => `<div style="width:1px;background:rgba(136,68,255,0.22)"></div>`;

        card.innerHTML = `
            <div style="font-size:2.2rem;margin-bottom:4px;line-height:1">✦</div>
            <div style="font-family:'Norse',sans-serif;font-size:2rem;color:#e0c8ff;
                text-shadow:0 0 14px rgba(136,68,255,0.95),0 0 40px rgba(136,68,255,0.4);
                margin-bottom:${isNewBest ? '4px' : '18px'};line-height:1.1">
                ${t('win-title')}
            </div>
            ${isNewBest ? `<div style="font-size:0.82rem;color:#ffd700;margin-bottom:18px;
                text-shadow:0 0 8px rgba(255,215,0,0.6)">${t('win-new-best')}</div>` : ''}
            <div style="display:flex;align-items:stretch;margin-bottom:14px;
                border:1px solid rgba(136,68,255,0.22);border-radius:10px;overflow:hidden">
                ${statCell(t('win-stat-size'), `${size}×${size}`)}
                ${statSep()}
                ${statCell(t('win-stat-diff'), diffLabels[diff] ?? diff)}
                ${statSep()}
                ${statCell(t('win-stat-time'), timeStr)}
                ${statSep()}
                ${statCell(t('win-stat-moves'), moves)}
            </div>
            <div style="font-size:0.72rem;color:rgba(180,150,255,0.40);margin-bottom:22px">
                ${t('win-stat-seed-label')} ${seed}
            </div>
            <div style="display:flex;gap:8px;justify-content:center">
                <button id="space-win-new" style="padding:10px 22px;
                    background:rgba(136,68,255,0.35);border:1px solid rgba(136,68,255,0.65);
                    border-radius:10px;color:#e0c8ff;cursor:pointer;font-size:0.9rem;
                    transition:filter 0.15s;font-family:inherit">
                    ${t('win-new')}
                </button>
                <button id="space-win-close" style="padding:10px 22px;
                    background:rgba(136,68,255,0.10);border:1px solid rgba(136,68,255,0.28);
                    border-radius:10px;color:rgba(180,150,255,0.70);cursor:pointer;font-size:0.9rem;
                    transition:filter 0.15s;font-family:inherit">
                    ${t('win-close')}
                </button>
            </div>
        `;

        overlay.appendChild(card);
        _onCardShown?.();
        _onCardShown = null;

        card.querySelector('#space-win-new').addEventListener('click', () => {
            stop();
            document.getElementById('btn-new')?.click();
        });
        card.querySelector('#space-win-close').addEventListener('click', () => {
            stop();
        });
    }

    let _onCardShown = null;

    function show(data, onCardShown) {
        stop();
        winData = data;
        _onCardShown = onCardShown ?? null;
        cardShown = false;
        exploded  = false;
        frame     = 0;
        particles = [];
        rings     = [];

        overlay = document.createElement('div');
        overlay.id = 'space-win-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#00050f;overflow:hidden;';

        canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        overlay.appendChild(canvas);
        document.body.appendChild(overlay);

        ctx = canvas.getContext('2d');
        draw();
    }

    function stop() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        document.getElementById('space-win-overlay')?.remove();
        canvas = null; ctx = null; overlay = null;
        winData = null; cardShown = false; exploded = false;
        _onCardShown = null;
    }

    return { show, stop };
})();


// ── SPACE MUSIC – Ambient Loop ────────────────────────────────────

const spaceMusic = (() => {
    let audio = null;
    let muted = false;
    const TRACK       = 'music/space/natureseye-galaxy-traveller-meditation-264649.mp3';
    const STORAGE_KEY = 'numori-space-muted';

    const SVG_ON  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
    const SVG_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

    function _updateBtn() {
        const btn = document.getElementById('btn-space-mute');
        if (!btn) return;
        btn.innerHTML      = muted ? SVG_OFF : SVG_ON;
        btn.title          = muted ? 'Musik an' : 'Musik aus';
        btn.dataset.active = muted ? 'false' : 'true';
    }

    function _tryPlay() {
        if (!audio || muted) return;
        audio.play().catch(() => {
            const resume = () => { if (!muted) audio.play().catch(() => {}); };
            document.addEventListener('click',   resume, { once: true });
            document.addEventListener('keydown', resume, { once: true });
        });
    }

    function start() {
        muted = localStorage.getItem(STORAGE_KEY) === 'true';
        if (!audio) {
            audio = new Audio(TRACK);
            audio.loop   = true;
            audio.volume = 0.40;
        }
        _updateBtn();
        _tryPlay();
    }

    function stop() {
        if (audio) { audio.pause(); audio.currentTime = 0; }
        _updateBtn();
    }

    function toggleMute() {
        muted = !muted;
        localStorage.setItem(STORAGE_KEY, String(muted));
        if (audio) {
            if (muted) { audio.pause(); }
            else       { _tryPlay(); }
        }
        _updateBtn();
    }

    function onThemeChange(newTheme) {
        if (newTheme === 'space') start();
        else stop();
    }

    return { start, stop, toggleMute, onThemeChange };
})();


// ── SPACE TOOLBAR – Aurora Shimmer ────────────────────────────────

const spaceToolbar = (() => {
    let canvas = null;
    let ctx    = null;
    let animId = null;
    let t      = 0;

    // Auroa-Wellen: horizontal gleitende Farbschleier
    const waves = [
        { freq: 0.012, amp: 0.55, speed: 0.008, color: [136, 68, 255],  baseAlpha: 0.18 },
        { freq: 0.018, amp: 0.40, speed: 0.005, color: [0,  180, 255],  baseAlpha: 0.12 },
        { freq: 0.009, amp: 0.65, speed: 0.011, color: [180, 40, 255],  baseAlpha: 0.14 },
        { freq: 0.025, amp: 0.30, speed: 0.007, color: [60,  20, 160],  baseAlpha: 0.10 },
    ];

    let lastToolbarFrame = 0;
    function draw(ts = 0) {
        if (document.documentElement.getAttribute('data-theme') !== 'space') { stop(); return; }
        animId = requestAnimationFrame(draw);
        if (ts - lastToolbarFrame < 50) return; // ~20fps cap
        lastToolbarFrame = ts;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        t += 1;

        for (const wave of waves) {
            const grad = ctx.createLinearGradient(0, 0, w, 0);
            const steps = 20;
            for (let i = 0; i <= steps; i++) {
                const x = i / steps;
                const y = Math.sin(x * Math.PI * 2 * wave.freq * w + t * wave.speed) * wave.amp;
                const alpha = wave.baseAlpha * (0.5 + 0.5 * y + 0.5);
                const [r, g, b] = wave.color;
                grad.addColorStop(x, `rgba(${r},${g},${b},${Math.max(0, Math.min(alpha, 0.35))})`);
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }

        // Dezente Sternchen in der Toolbar
        ctx.fillStyle = 'rgba(220, 200, 255, 0.6)';
        const seed = Math.floor(t / 120);
        for (let i = 0; i < 6; i++) {
            const px = ((seed * 137 + i * 73) % 1000) / 1000 * w;
            const py = ((seed * 61  + i * 43) % 100)  / 100  * h;
            const flicker = Math.sin(t * 0.08 + i * 1.3) * 0.5 + 0.5;
            ctx.globalAlpha = flicker * 0.5;
            ctx.beginPath();
            ctx.arc(px, py, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    function resize() {
        if (!canvas) return;
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function start() {
        if (animId) return;
        canvas = document.getElementById('space-toolbar-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        draw();
        window.addEventListener('resize', resize);
    }

    function stop() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        canvas = null; ctx = null;
        window.removeEventListener('resize', resize);
    }

    function onThemeChange(newTheme) {
        if (newTheme === 'space') start();
        else stop();
    }

    return { start, stop, onThemeChange };
})();
