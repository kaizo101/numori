// ── SYNTHWAVE THEME – Grid + Glitch + Win + Music ──────────────────

// ── 1. HINTERGRUND: Perspektiv-Grid mit Retro-Sonne ────────────────
const synthwaveGrid = (() => {
    let canvas = null;
    let ctx    = null;

    function active() {
        return document.documentElement.getAttribute('data-theme') === 'synthwave';
    }

    function draw() {
        if (!active() || !ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // ── Sky ────────────────────────────────────────────────────
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
        skyGrad.addColorStop(0,   '#0d0021');
        skyGrad.addColorStop(0.5, '#1a003a');
        skyGrad.addColorStop(1,   '#2d0060');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.52);

        // ── Sonne ──────────────────────────────────────────────────
        const sunCX = w * 0.5;
        const sunCY = h * 0.52;
        const sunR  = Math.min(w, h) * 0.175;

        // Glow
        const glow = ctx.createRadialGradient(sunCX, sunCY, sunR * 0.4, sunCX, sunCY, sunR * 2.5);
        glow.addColorStop(0,   'rgba(255, 101,   0, 0.35)');
        glow.addColorStop(0.4, 'rgba(255,  45, 120, 0.18)');
        glow.addColorStop(1,   'rgba(179,   0, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, h * 0.1, w, h * 0.6);

        // Sonnen-Gradient (Halbkreis, obere Hälfte)
        const sunGrad = ctx.createLinearGradient(0, sunCY - sunR, 0, sunCY);
        sunGrad.addColorStop(0,   '#ffcc00');
        sunGrad.addColorStop(0.4, '#ff9a00');
        sunGrad.addColorStop(0.7, '#ff6500');
        sunGrad.addColorStop(1,   '#ff2d78');

        // Sonne zeichnen (Halbkreis oben)
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunCX, sunCY, sunR, Math.PI, 0);
        ctx.clip();
        ctx.fillStyle = sunGrad;
        ctx.fillRect(sunCX - sunR, sunCY - sunR, sunR * 2, sunR);
        ctx.restore();

        // Horizontale Streifen (ausgestanzt)
        const stripeCount = 8;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunCX, sunCY, sunR, Math.PI, 0);
        ctx.closePath();
        ctx.clip();
        for (let i = 0; i < stripeCount; i++) {
            const t = i / stripeCount;
            const y = sunCY - sunR * (1 - t) * 0.95;
            const thick = (sunR / stripeCount) * (0.25 + t * 0.4);
            ctx.fillStyle = 'rgba(13, 0, 33, 0.95)';
            ctx.fillRect(sunCX - sunR, y, sunR * 2, thick);
        }
        ctx.restore();

        // ── Boden ──────────────────────────────────────────────────
        const groundGrad = ctx.createLinearGradient(0, h * 0.52, 0, h);
        groundGrad.addColorStop(0,   '#1a003a');
        groundGrad.addColorStop(0.3, '#0d0021');
        groundGrad.addColorStop(1,   '#080012');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, h * 0.52, w, h * 0.48);

        // ── Perspektiv-Grid ────────────────────────────────────────
        const vx = w * 0.5; // Fluchtpunkt x
        const vy = h * 0.52; // Fluchtpunkt y (Horizont)

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, vy, w, h - vy);
        ctx.clip();

        // Vertikale Linien (konvergieren zum Fluchtpunkt)
        const vLineCount = 18;
        ctx.shadowBlur = 0;
        for (let i = 0; i <= vLineCount; i++) {
            const t = i / vLineCount;
            const bx = t * w; // Position unten

            const alpha = (1 - Math.abs(t - 0.5) * 1.5) * 0.9;
            if (alpha <= 0) continue;

            ctx.strokeStyle = `rgba(0, 245, 255, ${Math.max(0, alpha) * 0.75})`;
            ctx.lineWidth = 0.8;
            ctx.shadowColor = 'rgba(0, 245, 255, 0.7)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(vx, vy);
            ctx.lineTo(bx, h);
            ctx.stroke();
        }

        ctx.restore();
    }

    function resize() {
        if (!canvas) return;
        canvas.width  = canvas.offsetWidth  || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
        draw();
    }

    function start() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.style.cssText = [
            'position:fixed', 'inset:0', 'width:100%', 'height:100%',
            'z-index:0', 'pointer-events:none', 'will-change:transform',
        ].join(';');
        document.body.insertBefore(canvas, document.body.firstChild);
        canvas.width  = canvas.offsetWidth  || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
        ctx = canvas.getContext('2d');
        window.addEventListener('resize', resize);
        draw();
    }

    function stop() {
        if (canvas) { canvas.remove(); canvas = null; ctx = null; }
        window.removeEventListener('resize', resize);
    }

    function onThemeChange(theme) {
        if (theme === 'synthwave') start();
        else stop();
    }

    return { start, stop, onThemeChange };
})();

// ── 2. VHS-GLITCH bei Fehler ────────────────────────────────────────
const synthwaveGlitch = (() => {
    let active = false;

    function trigger() {
        if (active) return;
        active = true;

        const overlay = document.createElement('canvas');
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'width:100%', 'height:100%',
            'z-index:99998', 'pointer-events:none',
        ].join(';');
        document.body.appendChild(overlay);
        overlay.width  = overlay.offsetWidth  || window.innerWidth;
        overlay.height = overlay.offsetHeight || window.innerHeight;
        const c = overlay.getContext('2d');

        const w = overlay.width;
        const h = overlay.height;
        let frame = 0;
        const totalFrames = 20;

        // Statische Scanlines (einmal zeichnen)
        for (let y = 0; y < h; y += 8) {
            c.fillStyle = 'rgba(0, 0, 0, 0.08)';
            c.fillRect(0, y, w, 1);
        }

        function drawFrame() {
            // Nur Glitch-Effekte zeichnen, Scanlines bleiben statisch
            if (frame < totalFrames) {
                // 3-5 Glitch-Streifen mit RGB-Shift
                const stripCount = 3 + Math.floor(Math.random() * 3);
                for (let i = 0; i < stripCount; i++) {
                    const sy     = Math.random() * h;
                    const sh     = Math.random() * h * 0.08 + 4;
                    const shift  = (Math.random() - 0.5) * 40;
                    const alpha  = Math.random() * 0.55 + 0.15;

                    // Roter Kanal verschoben
                    c.fillStyle = `rgba(255, 0, 80, ${alpha * 0.5})`;
                    c.fillRect(shift, sy, w, sh);

                    // Cyan-Kanal gegenverschiebung
                    c.fillStyle = `rgba(0, 245, 255, ${alpha * 0.35})`;
                    c.fillRect(-shift * 0.6, sy + sh * 0.3, w, sh * 0.6);
                }

                // Horizontaler Riss
                if (Math.random() > 0.4) {
                    const ry    = Math.random() * h;
                    const rH    = Math.random() * 3 + 1;
                    const rShift = (Math.random() - 0.5) * 25;
                    c.fillStyle = 'rgba(255, 45, 120, 0.7)';
                    c.fillRect(rShift, ry, w, rH);
                }

                frame++;
                requestAnimationFrame(drawFrame);
            } else {
                // Fade out
                overlay.style.transition = 'opacity 0.25s ease';
                overlay.style.opacity = '0';
                setTimeout(() => { overlay.remove(); active = false; }, 300);
            }
        }

        requestAnimationFrame(drawFrame);
    }

    return { trigger };
})();

// ── 3. WIN-SCREEN: Laser-Show ───────────────────────────────────────
const synthwaveWin = (() => {
    let overlay  = null;
    let canvas   = null;
    let ctx      = null;
    let animId   = null;
    let frame    = 0;
    let beams    = [];
    let particles = [];
    let cardShown = false;

    function spawnBeams(w, h) {
        beams = [];
        const colors = [
            'rgba(255,45,120,',
            'rgba(0,245,255,',
            'rgba(179,0,255,',
            'rgba(255,154,0,',
            'rgba(255,255,255,',
        ];
        const count = 24;
        for (let i = 0; i < count; i++) {
            const angle  = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.3;
            const color  = colors[i % colors.length];
            const speed  = Math.random() * 0.006 + 0.003;
            beams.push({ angle, color, speed, phase: Math.random() * Math.PI * 2, len: 0 });
        }
    }

    function spawnParticles(w, h) {
        particles = [];
        const cx = w * 0.5;
        const cy = h * 0.65;
        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 0.5;
            particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - Math.random() * 2,
                r: Math.random() * 3 + 1,
                alpha: 1,
                color: ['#ff2d78','#00f5ff','#b300ff','#ff9a00','#fff'][Math.floor(Math.random() * 5)],
            });
        }
    }

    function draw() {
        if (!ctx) return;
        animId = requestAnimationFrame(draw);
        const w = canvas.width;
        const h = canvas.height;
        frame++;

        // Fade-in dark bg
        const bgAlpha = Math.min(frame / 40, 0.92);
        ctx.fillStyle = `rgba(13, 0, 33, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);

        const cx = w * 0.5;
        const cy = h * 0.65;

        // Horizont-Glow
        const hGlow = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.75);
        hGlow.addColorStop(0, 'rgba(255,45,120,0.25)');
        hGlow.addColorStop(0.5, 'rgba(179,0,255,0.12)');
        hGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = hGlow;
        ctx.fillRect(0, h * 0.55, w, h * 0.45);

        if (frame > 15) {
            const t = (frame - 15) / 30;

            // Laser-Strahlen
            for (const b of beams) {
                b.len = Math.min(1, b.len + b.speed);
                b.phase += 0.025;
                const pulse   = 0.5 + 0.5 * Math.sin(b.phase);
                const alpha   = Math.min(t, 1) * (0.6 + pulse * 0.35);
                const maxDist = Math.max(w, h) * 1.4;
                const ex = cx + Math.cos(b.angle) * maxDist * b.len;
                const ey = cy + Math.sin(b.angle) * maxDist * b.len;

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(ex, ey);

                const grad = ctx.createLinearGradient(cx, cy, ex, ey);
                grad.addColorStop(0,   b.color + alpha + ')');
                grad.addColorStop(0.3, b.color + (alpha * 0.6) + ')');
                grad.addColorStop(1,   b.color + '0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth   = 1.5 + pulse;
                ctx.shadowColor = b.color + '0.8)';
                ctx.shadowBlur  = 10;
                ctx.stroke();
            }

            // Partikel
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08;
                p.alpha -= 0.016;
                if (p.alpha <= 0) continue;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
                ctx.shadowColor = p.color;
                ctx.shadowBlur  = 6;
                ctx.fill();
            }

            // Zentral-Glow
            const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
            cg.addColorStop(0,   `rgba(255,200,230,${Math.min(t, 1) * 0.9})`);
            cg.addColorStop(0.3, `rgba(255,45,120,${Math.min(t, 1) * 0.5})`);
            cg.addColorStop(1,   'transparent');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(cx, cy, 80, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;

        if (!cardShown && frame > 55) {
            cardShown = true;
            cancelAnimationFrame(animId);
            animId = null;
            _showCard();
        }
    }

    function _showCard() {
        const w = canvas ? canvas.width : window.innerWidth;
        const h = canvas ? canvas.height : window.innerHeight;
        const d = _winData || {};

        const card = document.createElement('div');
        card.style.cssText = [
            'position:absolute', 'left:50%', 'top:50%',
            'transform:translate(-50%,-50%) scale(0.85)',
            'background:rgba(16,0,38,0.97)',
            'border:2px solid rgba(255,45,120,0.8)',
            'border-radius:18px',
            'padding:2rem 2.5rem',
            'text-align:center',
            'min-width:280px', 'max-width:90vw',
            'box-shadow:0 0 40px rgba(255,45,120,0.5),0 0 80px rgba(179,0,255,0.25)',
            'opacity:0',
            'transition:opacity 0.5s ease, transform 0.5s ease',
            'z-index:10',
        ].join(';');

        const timeDisp = d.timeStr || '–';
        const sizeDisp = d.size   ? `${d.size}×${d.size}` : '';
        const diffDisp = d.diff   ? t(`diff-${d.diff}`) : '';
        const movesDisp = d.moves != null ? d.moves : '–';

        const isNewBest = d.isNewBest;
        const lbRank    = d.leaderboardRank;

        let rankLine = '';
        if (lbRank === 1)       rankLine = `<div style="color:#ff9a00;font-size:1.1rem;margin:.4rem 0;text-shadow:0 0 10px rgba(255,154,0,.7)">🏆 #1 ${t('sw-win-global')}</div>`;
        else if (lbRank)        rankLine = `<div style="color:#00f5ff;font-size:.95rem;margin:.3rem 0">#${lbRank} ${t('sw-win-global')}</div>`;
        if (isNewBest)          rankLine += `<div style="color:#ff2d78;font-size:.9rem;margin:.2rem 0;text-shadow:0 0 8px rgba(255,45,120,.7)">✦ ${t('sw-win-new-best')} ✦</div>`;

        card.innerHTML = `
            <div style="font-family:'Bitcount Grid Single',monospace;font-size:2rem;letter-spacing:6px;color:#fff;
                text-shadow:0 0 10px #ff2d78,0 0 30px rgba(0,245,255,.5);margin-bottom:.6rem">${t('sw-win-solved')}</div>
            <div style="font-size:2.8rem;font-family:'Bitcount Grid Single',monospace;color:#00f5ff;
                text-shadow:0 0 12px rgba(0,245,255,.8),0 0 30px rgba(0,245,255,.4);margin:.4rem 0">
                ${timeDisp}</div>
            ${rankLine}
            <div style="color:rgba(200,160,255,.75);font-size:.85rem;margin:.5rem 0">
                ${sizeDisp}${sizeDisp && diffDisp ? ' · ' : ''}${diffDisp} · ${movesDisp} ${t('sw-win-moves')}</div>
            <div style="margin-top:1.5rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
                <button onclick="synthwaveWin.stop();newPuzzle?.()"
                    style="background:rgba(255,45,120,.25);border:1px solid rgba(255,45,120,.7);
                    color:#ffd0e8;border-radius:20px;padding:.6rem 1.4rem;cursor:pointer;
                    font-family:inherit;font-size:.9rem;
                    box-shadow:0 0 10px rgba(255,45,120,.35);transition:all .15s">
                    ${t('win-new')}</button>
                <button onclick="synthwaveWin.stop()"
                    style="background:rgba(0,245,255,.08);border:1px solid rgba(0,245,255,.35);
                    color:#00f5ff;border-radius:20px;padding:.6rem 1.4rem;cursor:pointer;
                    font-family:inherit;font-size:.9rem;transition:all .15s">
                    ${t('win-close')}</button>
            </div>
        `;
        overlay.appendChild(card);
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translate(-50%,-50%) scale(1)';
        });

        if (typeof _onCardShownCb === 'function') { _onCardShownCb(); _onCardShownCb = null; }
    }

    let _winData      = null;
    let _onCardShownCb = null;

    function show(data, onCardShown) {
        stop();
        _winData = data;
        _onCardShownCb = onCardShown;
        frame     = 0;
        cardShown = false;

        overlay = document.createElement('div');
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:9000',
            'overflow:hidden',
        ].join(';');
        document.body.appendChild(overlay);

        canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
        overlay.appendChild(canvas);
        canvas.width  = canvas.offsetWidth  || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
        ctx = canvas.getContext('2d');

        spawnBeams(canvas.width, canvas.height);
        spawnParticles(canvas.width, canvas.height);

        animId = requestAnimationFrame(draw);
    }

    function stop() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        if (overlay) { overlay.remove(); overlay = null; }
        canvas = null; ctx = null;
        frame = 0; cardShown = false;
        beams = []; particles = [];
    }

    return { show, stop };
})();

