// ── LEADERBOARD & STATS ─────────────────────────────────────────

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function loadStats() {
    try {
        const raw = localStorage.getItem('numori-stats');
        return raw ? JSON.parse(raw) : { totalSolved: 0, bySize: {} };
    } catch(e) { return { totalSolved: 0, bySize: {} }; }
}

function saveStats(stats) {
    try { localStorage.setItem('numori-stats', JSON.stringify(stats)); }
    catch(e) { console.error('Stats speichern fehlgeschlagen:', e); }
}

function recordSolve(n, diff, seconds, moves) {
    const stats = loadStats();
    stats.totalSolved = (stats.totalSolved || 0) + 1;

    if (!stats.bySize[n]) stats.bySize[n] = {};
    if (!stats.bySize[n][diff]) stats.bySize[n][diff] = { count: 0, bestTime: null, totalTime: 0, bestMoves: null };

    const entry = stats.bySize[n][diff];
    const isFirstSolve = entry.count === 0;
    entry.count++;
    entry.totalTime += seconds;
    const isNewBestTime = !isFirstSolve && (entry.bestTime === null || seconds < entry.bestTime);
    if (entry.bestTime === null || seconds < entry.bestTime) entry.bestTime = seconds;
    if (entry.bestMoves === null || moves < entry.bestMoves) entry.bestMoves = moves;

    saveStats(stats);
    return isNewBestTime;
}

let statsActiveTab = 'stats';
let _newLeaderboardEntry = null; // { size, difficulty, idx } — für Highlight nach Eintrag
let lbActiveFilter = null; // 'size-diff' z.B. '4-medium'
let globalActiveSize = 5;
let globalActiveDiff = 'medium';
let globalActivePeriod = 'alltime'; // 'daily' | 'weekly' | 'monthly' | 'alltime'
let globalActiveSubTab = 'rankings'; // 'rankings' | 'daily'

function renderStatsContent() {
    const stats = loadStats();
    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };
    const sizes = [3, 4, 5, 6, 7, 8, 9];

    const lc = (s) => isConsole ? s.toLowerCase() : s;
    let html = `<div class="stats-total">
        <span class="stats-total-label">${lc(t('stats-total-label'))}</span>
        <span class="stats-total-value">${stats.totalSolved}</span>
    </div>`;

    const hasSomeData = Object.keys(stats.bySize).length > 0;
    if (!hasSomeData) {
        html += `<p class="stats-empty">${lc(t('stats-empty'))}</p>`;
    } else {
        html += `<div class="stats-table-wrap"><table class="stats-table">
            <thead><tr>
                <th>${lc(t('stats-col-size'))}</th>
                <th>${lc(t('stats-col-diff'))}</th>
                <th>${lc(t('stats-col-solved'))}</th>
                <th>${lc(t('stats-col-best'))}</th>
                <th>${lc(t('stats-col-avg'))}</th>
                <th>${lc(t('stats-col-moves'))}</th>
            </tr></thead><tbody>`;

        for (const n of sizes) {
            const sizeData = stats.bySize[n];
            if (!sizeData) continue;
            const diffs = Object.keys(sizeData);
            diffs.forEach((diff, i) => {
                const e = sizeData[diff];
                const avgTime = e.count > 0 ? Math.round(e.totalTime / e.count) : null;
                html += `<tr>
                    ${i === 0 ? `<td rowspan="${diffs.length}" class="stats-size-cell">${n}×${n}</td>` : ''}
                    <td>${isConsole ? (diffLabels[diff] ?? diff).toLowerCase() : (diffLabels[diff] ?? diff)}</td>
                    <td>${e.count}</td>
                    <td>${e.bestTime !== null ? formatTime(e.bestTime) : '–'}</td>
                    <td>${avgTime !== null ? formatTime(avgTime) : '–'}</td>
                    <td>${e.bestMoves !== null ? e.bestMoves : '–'}</td>
                </tr>`;
            });
        }
        html += `</tbody></table></div>`;
    }

    const container = document.getElementById('stats-content');
    if (container) container.innerHTML = html;
}

function renderLeaderboard() {
    const lb = loadLeaderboard();
    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
    const lc = (s) => isConsole ? s.toLowerCase() : s;
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };
    const medals = ['1', '2', '3'];
    const rankClasses = ['lb-row-gold', 'lb-row-silver', 'lb-row-bronze'];
    const container = document.getElementById('stats-content');
    if (!container) return;

    // Verfügbare Kombinationen sammeln
    const options = [];
    for (const n of [3, 4, 5, 6, 7, 8, 9]) {
        for (const diff of ['easy', 'medium', 'hard', 'expert']) {
            if (lb[n]?.[diff]?.length > 0) {
                options.push({ key: `${n}-${diff}`, n, diff });
            }
        }
    }

    if (options.length === 0) {
        container.innerHTML = `<p class="lb-info">${lc(t('lb-info'))}</p><p class="stats-empty">${lc(t('lb-empty'))}</p>`;
        return;
    }

    // Aktiven Filter bestimmen: neuer Eintrag hat Vorrang, sonst letzter Wert, sonst erste Option
    if (_newLeaderboardEntry) {
        lbActiveFilter = `${_newLeaderboardEntry.size}-${_newLeaderboardEntry.difficulty}`;
    }
    if (!options.find(o => o.key === lbActiveFilter)) {
        lbActiveFilter = options[0].key;
    }
    const active = options.find(o => o.key === lbActiveFilter);
    const entries = lb[active.n][active.diff];

    // Dropdown
    const optionsHtml = options.map(o => {
        const label = lc(`${o.n}×${o.n} · ${diffLabels[o.diff] ?? o.diff}`);
        return `<option value="${o.key}"${o.key === lbActiveFilter ? ' selected' : ''}>${label}</option>`;
    }).join('');

    // Tabellenzeilen
    let rowsHtml = '';
    entries.forEach((e, i) => {
        const medal = i < 3 ? medals[i] : `${i + 1}.`;
        const isNew = _newLeaderboardEntry
            && _newLeaderboardEntry.size === active.n
            && _newLeaderboardEntry.difficulty === active.diff
            && _newLeaderboardEntry.idx === i;
        const rowClass = ['lb-row', rankClasses[i] ?? '', isNew ? 'lb-row-new' : ''].filter(Boolean).join(' ');
        rowsHtml += `<tr class="${rowClass}">
            <td class="lb-rank">${medal}</td>
            <td class="lb-name">${escapeHtml(e.name)}</td>
            <td class="lb-time">${formatTime(e.time)}</td>
            <td class="lb-moves">${e.moves} ${lc(t('lb-moves'))}</td>
            <td class="lb-date">${e.date}</td>
        </tr>`;
    });

    container.innerHTML = `
        <p class="lb-info">${lc(t('lb-info'))}</p>
        <select id="lb-filter" class="lb-filter-select">${optionsHtml}</select>
        <table class="lb-table"><tbody>${rowsHtml}</tbody></table>`;

    container.querySelector('#lb-filter').addEventListener('change', (e) => {
        lbActiveFilter = e.target.value;
        _newLeaderboardEntry = null;
        renderLeaderboard();
    });
}

async function renderGlobalLeaderboard() {
    const container = document.getElementById('stats-content');
    if (!container) return;

    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
    const lc = (s) => isConsole ? s.toLowerCase() : s;
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };
    const medals = ['1', '2', '3'];
    const rankClasses = ['lb-row-gold', 'lb-row-silver', 'lb-row-bronze'];

    const sizes = [3, 4, 5, 6, 7, 8, 9];
    const diffs = ['easy', 'medium', 'hard', 'expert'];

    const periods = [
        { key: 'daily',   label: t('lb-period-daily') },
        { key: 'weekly',  label: t('lb-period-weekly') },
        { key: 'monthly', label: t('lb-period-monthly') },
        { key: 'alltime', label: t('lb-period-alltime') },
    ];

    const sizeOptionsHtml = sizes.map(n =>
        `<option value="${n}"${n === globalActiveSize ? ' selected' : ''}>${n}×${n}</option>`
    ).join('');

    const diffOptionsHtml = diffs.map(d =>
        `<option value="${d}"${d === globalActiveDiff ? ' selected' : ''}>${lc(diffLabels[d] ?? d)}</option>`
    ).join('');

    const periodsHtml = periods.map(p =>
        `<button class="lb-period-btn${p.key === globalActivePeriod ? ' active' : ''}" data-period="${p.key}">${lc(p.label)}</button>`
    ).join('');

    const subTabsHtml = [
        { key: 'rankings', label: lc(t('stats-global-rankings')) },
        { key: 'daily',    label: lc(t('stats-global-daily')) },
    ].map(s =>
        `<button class="lb-period-btn${s.key === globalActiveSubTab ? ' active' : ''}" data-subtab="${s.key}">${s.label}</button>`
    ).join('');

    container.innerHTML = `
        <div class="lb-subtabs">${subTabsHtml}</div>
        <div id="lb-global-rankings" class="lb-subpanel${globalActiveSubTab === 'rankings' ? '' : ' hidden'}">
            <div class="lb-global-controls">
                <div class="lb-filter-row">
                    <select id="lb-global-size" class="lb-filter-select">${sizeOptionsHtml}</select>
                    <select id="lb-global-diff" class="lb-filter-select">${diffOptionsHtml}</select>
                </div>
                <div class="lb-period-tabs">${periodsHtml}</div>
            </div>
            <div id="lb-global-content" class="lb-global-content"></div>
        </div>
        <div id="lb-global-daily" class="lb-subpanel${globalActiveSubTab === 'daily' ? '' : ' hidden'}">
            <div id="lb-daily-content" class="lb-global-content"></div>
        </div>`;

    container.querySelectorAll('.lb-period-btn[data-subtab]').forEach(btn => {
        btn.addEventListener('click', () => {
            globalActiveSubTab = btn.dataset.subtab;
            container.querySelectorAll('.lb-period-btn[data-subtab]').forEach(b =>
                b.classList.toggle('active', b.dataset.subtab === globalActiveSubTab)
            );
            container.querySelectorAll('.lb-subpanel').forEach(p => p.classList.add('hidden'));
            container.querySelector(`#lb-global-${globalActiveSubTab}`)?.classList.remove('hidden');
            if (globalActiveSubTab === 'daily') fetchAndRenderDaily();
        });
    });

    container.querySelector('#lb-global-size').addEventListener('change', (e) => {
        globalActiveSize = Number(e.target.value);
        fetchAndRender();
    });
    container.querySelector('#lb-global-diff').addEventListener('change', (e) => {
        globalActiveDiff = e.target.value;
        fetchAndRender();
    });
    container.querySelectorAll('.lb-period-btn[data-period]').forEach(btn => {
        btn.addEventListener('click', () => {
            globalActivePeriod = btn.dataset.period;
            container.querySelectorAll('.lb-period-btn[data-period]').forEach(b =>
                b.classList.toggle('active', b.dataset.period === globalActivePeriod)
            );
            fetchAndRender();
        });
    });

    if (globalActiveSubTab === 'daily') {
        fetchAndRenderDaily();
    } else {
        fetchAndRender();
    }

    async function fetchAndRender() {
        const content = document.getElementById('lb-global-content');
        if (!content) return;
        content.innerHTML = `<div class="lb-loading"><div class="update-progress-dots"><span></span><span></span><span></span></div></div>`;

        if (typeof window.supabaseFetchLeaderboard !== 'function') {
            content.innerHTML = `<p class="stats-empty">${lc(t('lb-offline'))}</p>`;
            return;
        }

        const rows = await window.supabaseFetchLeaderboard(globalActiveSize, globalActiveDiff, globalActivePeriod, 20);

        if (!rows.length) {
            content.innerHTML = `<p class="stats-empty">${lc(t('lb-global-empty'))}</p>`;
            return;
        }

        const rowsHtml = rows.map((e, i) => {
            const medal = i < 3 ? medals[i] : `${i + 1}.`;
            const rowClass = ['lb-row', rankClasses[i] ?? ''].filter(Boolean).join(' ');
            const date = new Date(e.created_at).toLocaleDateString(
                getLang() === 'de' ? 'de-DE' : 'en-GB',
                { day: '2-digit', month: '2-digit', year: '2-digit' }
            );
            return `<tr class="${rowClass}">
                <td class="lb-rank">${medal}</td>
                <td class="lb-name">${escapeHtml(e.username)}</td>
                <td class="lb-time">${formatTime(e.time_seconds)}</td>
                <td class="lb-moves">${e.move_count} ${lc(t('lb-moves'))}</td>
                <td class="lb-date">${date}</td>
            </tr>`;
        }).join('');

        content.innerHTML = `<table class="lb-table"><tbody>${rowsHtml}</tbody></table>`;
    }

    async function fetchAndRenderDaily() {
        const content = document.getElementById('lb-daily-content');
        if (!content) return;

        const todayIso = new Date().toISOString().slice(0, 10);
        const todayDisplay = new Date().toLocaleDateString(
            getLang() === 'de' ? 'de-DE' : 'en-GB',
            { day: '2-digit', month: '2-digit', year: 'numeric' }
        );

        content.innerHTML = `<div class="lb-loading"><div class="update-progress-dots"><span></span><span></span><span></span></div></div>`;

        if (typeof window.supabaseFetchDailyLeaderboard !== 'function') {
            content.innerHTML = `<p class="stats-empty">${lc(t('lb-offline'))}</p>`;
            return;
        }

        const rows = await window.supabaseFetchDailyLeaderboard(todayIso, 20);

        if (!rows.length) {
            content.innerHTML = `<p class="lb-daily-date">${todayDisplay}</p><p class="stats-empty">${lc(t('lb-daily-empty'))}</p>`;
            return;
        }

        const rowsHtml = rows.map((e, i) => {
            const medal = i < 3 ? medals[i] : `${i + 1}.`;
            const rowClass = ['lb-row', rankClasses[i] ?? ''].filter(Boolean).join(' ');
            return `<tr class="${rowClass}">
                <td class="lb-rank">${medal}</td>
                <td class="lb-name">${escapeHtml(e.username)}</td>
                <td class="lb-time">${formatTime(e.time_seconds)}</td>
                <td class="lb-moves">${e.move_count} ${lc(t('lb-moves'))}</td>
            </tr>`;
        }).join('');

        content.innerHTML = `<p class="lb-daily-date">${todayDisplay}</p><table class="lb-table"><tbody>${rowsHtml}</tbody></table>`;
    }
}

function renderStatsModal() {
    document.querySelectorAll('.stats-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === statsActiveTab);
    });
    // Reset-Button nur bei lokalen Tabs sichtbar
    const resetBtn = document.getElementById('stats-reset');
    if (resetBtn) resetBtn.style.display = statsActiveTab === 'global' ? 'none' : '';

    if (statsActiveTab === 'leaderboard') {
        renderLeaderboard();
    } else if (statsActiveTab === 'global') {
        renderGlobalLeaderboard();
    } else {
        renderStatsContent();
    }
}

function initStatsModal() {
    const btnStats     = document.getElementById('btn-stats');
    const statsOverlay = document.getElementById('stats-overlay');
    const statsClose   = document.getElementById('stats-close');
    const statsReset   = document.getElementById('stats-reset');

    if (btnStats) btnStats.addEventListener('click', () => {
        statsActiveTab = 'stats';
        renderStatsModal();
        statsOverlay.classList.add('visible');
    });
    if (statsClose) statsClose.addEventListener('click', () => {
        statsOverlay.classList.remove('visible');
    });
    if (statsOverlay) statsOverlay.addEventListener('click', (e) => {
        if (e.target === statsOverlay) statsOverlay.classList.remove('visible');
    });
    if (statsReset) statsReset.addEventListener('click', () => {
        if (statsActiveTab === 'leaderboard') {
            if (!confirm(t('lb-reset-confirm'))) return;
            saveLeaderboardData({});
        } else {
            if (!confirm(t('stats-reset-confirm'))) return;
            saveStats({ totalSolved: 0, bySize: {} });
        }
        renderStatsModal();
    });
    document.querySelectorAll('.stats-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            statsActiveTab = btn.dataset.tab;
            renderStatsModal();
        });
    });
}

function loadLeaderboard() {
    try {
        const raw = localStorage.getItem('numori-leaderboard');
        return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
}

function saveLeaderboardData(lb) {
    try { localStorage.setItem('numori-leaderboard', JSON.stringify(lb)); }
    catch(e) { console.error('Leaderboard speichern fehlgeschlagen:', e); }
}

// ── LEADERBOARD-SCHUTZ ────────────────────────────────────────────

const _LB_MIN_TIMES = { 3: 5, 4: 20, 5: 35, 6: 55, 7: 80, 8: 120, 9: 180 };

const _NAME_BLOCKLIST = [
    // EN
    'fuck','shit','ass','bitch','cunt','dick','cock','pussy','nigger','nigga','faggot','fag','whore','slut','bastard','retard',
    // DE
    'scheiß','scheisse','scheiße','fick','arsch','wichser','hurensohn','hure','nutte','fotze','schwuchtel','spast','nazi','wixer',
];

function _sanitizeName(name) {
    const lower = name.toLowerCase();
    for (const word of _NAME_BLOCKLIST) {
        if (lower.includes(word)) return '';
    }
    return name;
}

function getLeaderboardRank(seconds, size, difficulty) {
    const lb = loadLeaderboard();
    const entries = lb[size]?.[difficulty] ?? [];
    const rank = entries.findIndex(e => seconds < e.time || (seconds === e.time && moveCount < e.moves));
    if (rank === -1) return entries.length < 5 ? entries.length + 1 : null;
    return rank + 1;
}

function insertLeaderboardEntry(name, seconds, moves, size, difficulty, seed, isDailyMode = false, cleanSolve = true) {
    const lb = loadLeaderboard();
    if (!lb[size]) lb[size] = {};
    if (!lb[size][difficulty]) lb[size][difficulty] = [];
    const entries = lb[size][difficulty];
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2,'0')}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getFullYear()).slice(-2)}`;
    const insertedName = _sanitizeName(name.trim()) || t('lb-anon');
    entries.push({ name: insertedName, time: seconds, moves, seed, date: dateStr });
    entries.sort((a, b) => a.time - b.time || a.moves - b.moves);
    if (entries.length > 5) entries.length = 5;
    const newIdx = entries.findIndex(e => e.time === seconds && e.name === insertedName && e.moves === moves && e.seed === seed);
    _newLeaderboardEntry = { size, difficulty, idx: newIdx };
    lb[size][difficulty] = entries;
    saveLeaderboardData(lb);
    buildFlipperTicker();
    const _minTime = _LB_MIN_TIMES[size] ?? 10;
    if (typeof window.supabaseSubmitLeaderboard === 'function' && seconds >= _minTime) {
        const consent = localStorage.getItem('numori-lb-consent');
        const supabasePayload = { username: insertedName, gridSize: size, difficulty, seed, timeSeconds: seconds, moveCount: moves, difficultyScore: currentPuzzle?.score ?? 0, cleanSolve };
        if (consent === 'granted') {
            window.supabaseSubmitLeaderboard(supabasePayload);
            if (isDailyMode && typeof window.supabaseSubmitDailyResult === 'function') {
                window.supabaseSubmitDailyResult({ username: insertedName, timeSeconds: seconds, moveCount: moves });
            }
        } else if (consent === null) {
            showConsentModal(supabasePayload, isDailyMode);
        }
    }
}

function initLbConsentToggle() {
    const btnOn  = document.getElementById('btn-lb-consent-on');
    const btnOff = document.getElementById('btn-lb-consent-off');
    if (!btnOn || !btnOff) return;

    function updateButtons() {
        const consent = localStorage.getItem('numori-lb-consent');
        btnOn.classList.toggle('active',  consent === 'granted');
        btnOff.classList.toggle('active', consent === 'denied');
    }

    btnOn.addEventListener('click', () => {
        localStorage.setItem('numori-lb-consent', 'granted');
        updateButtons();
    });
    btnOff.addEventListener('click', () => {
        localStorage.setItem('numori-lb-consent', 'denied');
        updateButtons();
    });

    updateButtons();
}

function showConsentModal(pendingEntry, isDailyMode = false) {
    const overlay = document.getElementById('consent-overlay');
    if (!overlay) return;
    overlay.classList.add('visible');
    document.getElementById('consent-accept').onclick = () => {
        localStorage.setItem('numori-lb-consent', 'granted');
        overlay.classList.remove('visible');
        window.supabaseSubmitLeaderboard(pendingEntry);
        if (isDailyMode && typeof window.supabaseSubmitDailyResult === 'function') {
            window.supabaseSubmitDailyResult({ username: pendingEntry.username, timeSeconds: pendingEntry.timeSeconds, moveCount: pendingEntry.moveCount });
        }
    };
    document.getElementById('consent-deny').onclick = () => {
        localStorage.setItem('numori-lb-consent', 'denied');
        overlay.classList.remove('visible');
    };
}

function launchConfetti(duration = 6000) {
    const existing = document.getElementById('lb-confetti-canvas');
    if (existing) existing.remove();

    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';

    const canvas = document.createElement('canvas');
    canvas.id = 'lb-confetti-canvas';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const ox = canvas.width  / 2;
    const oy = canvas.height / 2;

    const GRAVITY    = 0.09;
    const FADE_START = duration - 1500;

    let particles;

    if (isConsole) {
        // Matrix-Burst: grüne Zeichen wie im Matrix-Rain
        const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEF0123456789@#$%&';
        const GREENS = ['#00ff41', '#00cc33', '#39ff82', '#00ff99', '#00dd55'];
        particles = Array.from({ length: 80 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 7;
            return {
                x:     ox,
                y:     oy,
                vx:    Math.cos(angle) * speed,
                vy:    Math.sin(angle) * speed - 1.5,
                char:  MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
                color: GREENS[Math.floor(Math.random() * GREENS.length)],
                size:  10 + Math.floor(Math.random() * 10),
                alpha: 1,
                // Zeichen wechselt gelegentlich
                tick:  0,
                tickMax: 8 + Math.floor(Math.random() * 16),
            };
        });
    } else {
        const COLORS = ['#f59e0b','#6366f1','#ec4899','#10b981','#3b82f6','#f43f5e','#a855f7','#facc15','#ffffff'];
        const SHAPES = ['rect', 'circle', 'ribbon'];
        particles = Array.from({ length: 160 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 9;
            return {
                x:     ox,
                y:     oy,
                vx:    Math.cos(angle) * speed,
                vy:    Math.sin(angle) * speed - 1.5,
                w:     5 + Math.random() * 9,
                h:     3 + Math.random() * 6,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
                rot:   Math.random() * Math.PI * 2,
                rotV:  (Math.random() - 0.5) * 0.14,
                alpha: 1,
            };
        });
    }

    const start = performance.now();

    function draw(now) {
        const elapsed = now - start;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const fadeAlpha = elapsed > FADE_START
            ? Math.max(0, 1 - (elapsed - FADE_START) / 1500)
            : 1;

        for (const p of particles) {
            p.x  += p.vx;
            p.y  += p.vy;
            p.vy += GRAVITY;
            p.vx *= 0.985;
            p.alpha = fadeAlpha;

            ctx.save();
            ctx.globalAlpha = p.alpha;

            if (isConsole) {
                p.tick++;
                if (p.tick >= p.tickMax) {
                    const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトABCDEF0123456789@#$%&';
                    p.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
                    p.tick = 0;
                }
                ctx.font = `bold ${p.size}px 'Share Tech Mono', monospace`;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur  = 8;
                ctx.fillText(p.char, p.x, p.y);
            } else {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                p.rot += p.rotV;
                ctx.fillStyle = p.color;
                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === 'ribbon') {
                    ctx.fillRect(-p.w / 2, -p.h / 4, p.w, p.h / 2);
                } else {
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                }
            }
            ctx.restore();
        }

        if (elapsed < duration) {
            requestAnimationFrame(draw);
        } else {
            canvas.remove();
        }
    }

    requestAnimationFrame(draw);
}

function showLeaderboardEntryPopup(rank, seconds, size, difficulty, seed, isDailyMode = false, cleanSolve = true) {
    const overlay = document.getElementById('leaderboard-entry-overlay');
    if (!overlay) return;
    if (document.documentElement.getAttribute('data-theme') === 'flipper' && window.innerWidth > 600) {
        flipperDMD.setState('initials', {
            rank,
            onConfirm: (name) => {
                if (name) localStorage.setItem('numori-player-name', name);
                insertLeaderboardEntry(name, seconds, moveCount, size, difficulty, seed, isDailyMode, cleanSolve);
                statsActiveTab = 'leaderboard';
                renderStatsModal();
                flipperDMD.setState('playing', { size, diff: difficulty, seed });
            },
            onCancel: () => {
                flipperDMD.setState('playing', { size, diff: difficulty, seed });
            }
        });
        return;
    }
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard'), expert: t('diff-expert') };
    const titleEl   = document.getElementById('lb-entry-title');
    const infoEl    = document.getElementById('lb-entry-info');
    const nameInput = document.getElementById('lb-entry-name');
    const medalEl   = document.getElementById('lb-entry-medal');
    const modal     = overlay.querySelector('.lb-entry-modal');

    if (medalEl) {
        medalEl.style.animation = 'none';
        void medalEl.offsetWidth;
        medalEl.style.animation = '';
    }
    if (modal) modal.dataset.rank = rank <= 3 ? rank : 'other';
    if (titleEl) titleEl.textContent = t('lb-entry-title');
    if (infoEl)  infoEl.textContent  = `${size}×${size} · ${diffLabels[difficulty] ?? difficulty} · ${formatTime(seconds)}`;
    if (nameInput) {
        nameInput.value       = localStorage.getItem('numori-player-name') || '';
        nameInput.placeholder = t('lb-name-placeholder');
    }
    overlay._pending = { seconds, moves: moveCount, size, difficulty, seed, isDailyMode, localRank: rank, cleanSolve };
    overlay.classList.add('visible');
    const _theme = document.documentElement.getAttribute('data-theme');
    if (_theme !== 'space') launchConfetti();
    if (nameInput) setTimeout(() => nameInput.focus(), 100);

    // Ränge direkt beim Öffnen laden
    const ranksEl   = document.getElementById('lb-entry-ranks');
    const localVal  = document.getElementById('lb-result-local-val');
    const globalRow = document.getElementById('lb-result-global-row');
    const globalVal = document.getElementById('lb-result-global-val');
    if (ranksEl) ranksEl.style.display = '';
    if (localVal) localVal.textContent = t('lb-result-rank').replace('{rank}', rank);
    if (globalRow) globalRow.style.display = '';

    const consent = localStorage.getItem('numori-lb-consent');
    if (consent === 'granted' && size && difficulty) {
        if (globalVal) globalVal.textContent = t('lb-loading');
        const fetchPromise = isDailyMode && typeof window.supabaseFetchDailyLeaderboard === 'function'
            ? window.supabaseFetchDailyLeaderboard(new Date().toISOString().slice(0, 10), 100)
            : typeof window.supabaseFetchLeaderboard === 'function'
                ? window.supabaseFetchLeaderboard(size, difficulty, 'alltime', 100)
                : null;
        if (fetchPromise) {
            fetchPromise.then(rows => {
                const betterCount = rows.filter(r =>
                    r.time_seconds < seconds || (r.time_seconds === seconds && r.move_count < moveCount)
                ).length;
                const globalRank = betterCount + 1;
                if (globalVal) globalVal.textContent = globalRank <= 20 ? t('lb-result-rank').replace('{rank}', globalRank) : '–';
            }).catch(() => { if (globalVal) globalVal.textContent = '–'; });
        } else {
            if (globalRow) globalRow.style.display = 'none';
        }
    } else {
        if (globalRow) globalRow.style.display = 'none';
    }
}

function showDailyOnlyPopup(seconds, onClose) {
    const overlay   = document.getElementById('leaderboard-entry-overlay');
    if (!overlay) { onClose?.(); return; }
    const titleEl   = document.getElementById('lb-entry-title');
    const infoEl    = document.getElementById('lb-entry-info');
    const nameInput = document.getElementById('lb-entry-name');
    const medalEl   = document.getElementById('lb-entry-medal');
    const modal     = overlay.querySelector('.lb-entry-modal');

    if (medalEl) { medalEl.style.animation = 'none'; void medalEl.offsetWidth; medalEl.style.animation = ''; }
    if (modal)   modal.dataset.rank = 'daily';
    if (titleEl) titleEl.textContent = t('lb-daily-submit-title');
    if (infoEl)  infoEl.textContent  = formatTime(seconds);
    if (nameInput) {
        nameInput.value       = localStorage.getItem('numori-player-name') || '';
        nameInput.placeholder = t('lb-name-placeholder');
    }
    overlay._pending  = { seconds, moves: moveCount, dailyOnly: true };
    overlay._onClose  = onClose;
    overlay.classList.add('visible');
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
}

function initLeaderboardEntryModal() {
    const overlay    = document.getElementById('leaderboard-entry-overlay');
    if (!overlay) return;
    const nameInput  = document.getElementById('lb-entry-name');
    const confirmBtn = document.getElementById('lb-entry-confirm');
    const cancelBtn  = document.getElementById('lb-entry-cancel');

    function closeModal() {
        overlay.classList.remove('visible');
        const ranksEl = document.getElementById('lb-entry-ranks');
        if (ranksEl) ranksEl.style.display = 'none';
        const onClose = overlay._onClose;
        overlay._pending = null;
        overlay._onClose = null;
        onClose?.();
    }

    function submitEntry() {
        const name = (nameInput?.value || '').trim();
        if (name) localStorage.setItem('numori-player-name', name);
        const p = overlay._pending;
        if (!p) return;
        const insertedName = name || t('lb-anon');

        if (p.dailyOnly) {
            const consent = localStorage.getItem('numori-lb-consent');
            if (consent === 'granted') {
                window.supabaseSubmitDailyResult?.({ username: insertedName, timeSeconds: p.seconds, moveCount: p.moves });
            } else if (consent === null) {
                showConsentModal({ username: insertedName, timeSeconds: p.seconds, moveCount: p.moves });
            }
        } else {
            insertLeaderboardEntry(name, p.seconds, p.moves, p.size, p.difficulty, p.seed, p.isDailyMode, p.cleanSolve ?? true);
            statsActiveTab = 'leaderboard';
            renderStatsModal();
        }
        closeModal();
    }

    if (confirmBtn) confirmBtn.addEventListener('click', submitEntry);
    if (cancelBtn)  cancelBtn.addEventListener('click', closeModal);
    if (nameInput) nameInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') submitEntry();
        if (e.key === 'Escape') closeModal();
    });
}

function saveToLeaderboard(seconds, size, difficulty, seed) {
    const rank = getLeaderboardRank(seconds, size, difficulty);
    if (rank === null) return;
    showLeaderboardEntryPopup(rank, seconds, size, difficulty, seed, false, !competitiveBlocked && !solvedByCheat && !debugSolveUsed);
}
