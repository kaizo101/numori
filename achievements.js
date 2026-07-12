// ═══════════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════

const ACHIEVEMENTS = {
    // ── Core ──────────────────────────────────────────────────────
    first:       { name: () => t('ach-first-name'),            icon: '🎯', desc: () => t('ach-first-desc') },
    puzzles10:   { name: () => t('ach-puzzles10-name'),        icon: '🔢', desc: () => t('ach-puzzles10-desc') },
    puzzles50:   { name: () => t('ach-puzzles50-name'),        icon: '🏅', desc: () => t('ach-puzzles50-desc') },
    puzzles100:  { name: () => t('ach-puzzles100-name'),       icon: '⭐', desc: () => t('ach-puzzles100-desc') },
    all_sizes:   { name: () => t('ach-all_sizes-name'),        icon: '📐', desc: () => t('ach-all_sizes-desc') },
    all_combos:  { name: () => t('ach-all_combos-name'),       icon: '🗺️', desc: () => t('ach-all_combos-desc') },
    expert9:     { name: () => t('ach-expert9-name'),          icon: '💜', desc: () => t('ach-expert9-desc') },
    perfect:     { name: () => t('ach-perfect-name'),          icon: '✅', desc: () => t('ach-perfect-desc') },
    no_undo:     { name: () => t('ach-no_undo-name'),          icon: '🎲', desc: () => t('ach-no_undo-desc') },
    daily_first: { name: () => t('ach-daily_first-name'),      icon: '📅', desc: () => t('ach-daily_first-desc') },
    streak7:     { name: () => t('ach-streak7-name'),          icon: '🔥', desc: () => t('ach-streak7-desc') },
    streak30:    { name: () => t('ach-streak30-name'),         icon: '👑', desc: () => t('ach-streak30-desc') },
    // ── Leaderboard ───────────────────────────────────────────────
    local_podium: { name: () => t('ach-local_podium-name'),   icon: '🏆', desc: () => t('ach-local_podium-desc') },
    global_entry: { name: () => t('ach-global_entry-name'),   icon: '🌍', desc: () => t('ach-global_entry-desc') },
    // ── Console ───────────────────────────────────────────────────
    console_first:    { name: () => t('ach-console_first-name'),    icon: '💚', desc: () => t('ach-console_first-desc'),    theme: 'console' },
    console9x9:       { name: () => t('ach-console9x9-name'),       icon: '🖥️', desc: () => t('ach-console9x9-desc'),       theme: 'console' },
    console_denied:   { name: () => t('ach-console_denied-name'),   icon: '🚫', desc: () => t('ach-console_denied-desc'),   theme: 'console' },
    console_nyan:     { name: () => t('ach-console_nyan-name'),     icon: '🌈', desc: () => t('ach-console_nyan-desc'),     theme: 'console' },
    // console_playlist entfernt (buggy)
    // ── Flipper ───────────────────────────────────────────────────
    flipper_first:    { name: () => t('ach-flipper_first-name'),    icon: '🪙', desc: () => t('ach-flipper_first-desc'),    theme: 'flipper' },
    flipper_jackpot:  { name: () => t('ach-flipper_jackpot-name'),  icon: '🎰', desc: () => t('ach-flipper_jackpot-desc'),  theme: 'flipper' },
    flipper_rickroll: { name: () => t('ach-flipper_rickroll-name'), icon: '🕺', desc: () => t('ach-flipper_rickroll-desc'), theme: 'flipper' },
    // ── Space (hidden until v2.0) ──────────────────────────────────
    space_first:       { name: () => t('ach-space_first-name'),       icon: '🚀', desc: () => t('ach-space_first-desc'),       theme: 'space', hidden: true },
    space_dark_matter: { name: () => t('ach-space_dark_matter-name'), icon: '🌌', desc: () => t('ach-space_dark_matter-desc'), theme: 'space', hidden: true },
    space_full_listen: { name: () => t('ach-space_full_listen-name'), icon: '🎶', desc: () => t('ach-space_full_listen-desc'), theme: 'space', hidden: true },
    // ── Synthwave (hidden until v2.1) ─────────────────────────────
    synth_first: { name: () => t('ach-synth_first-name'), icon: '🎵', desc: () => t('ach-synth_first-desc'), theme: 'synthwave', hidden: true },
    synth_zone:  { name: () => t('ach-synth_zone-name'),  icon: '⚡', desc: () => t('ach-synth_zone-desc'),  theme: 'synthwave', hidden: true },
    // synth_playlist entfernt (buggy)
};

// ── Storage ───────────────────────────────────────────────────────

function _loadAchievements() {
    try { return JSON.parse(localStorage.getItem('numori-achievements') || '{}'); }
    catch(e) { return {}; }
}

function _saveAchievements(data) {
    try { localStorage.setItem('numori-achievements', JSON.stringify(data)); }
    catch(e) {}
}

function _loadAchievementStats() {
    try { return JSON.parse(localStorage.getItem('numori-achievement-stats') || '{}'); }
    catch(e) { return {}; }
}

function _saveAchievementStats(data) {
    try { localStorage.setItem('numori-achievement-stats', JSON.stringify(data)); }
    catch(e) {}
}

function isAchievementUnlocked(id) {
    return !!_loadAchievements()[id];
}

// ── Unlock + Toast ────────────────────────────────────────────────

function _unlockAchievement(id) {
    if (!ACHIEVEMENTS[id] || isAchievementUnlocked(id)) return;
    const data = _loadAchievements();
    data[id] = { unlockedAt: new Date().toISOString() };
    _saveAchievements(data);
    _showAchievementToast(ACHIEVEMENTS[id]);
}

let _toastQueue = [];
let _toastActive = false;

function _showAchievementToast(def) {
    _toastQueue.push(def);
    if (!_toastActive) _processToastQueue();
}

function _processToastQueue() {
    if (_toastQueue.length === 0) { _toastActive = false; return; }
    _toastActive = true;
    const def = _toastQueue.shift();

    const old = document.getElementById('achievement-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'achievement-toast';
    toast.innerHTML = `
        <span class="achievement-toast-icon">${def.icon}</span>
        <div class="achievement-toast-text">
            <div class="achievement-toast-label">${t('ach-toast-label')}</div>
            <div class="achievement-toast-name">${def.name()}</div>
        </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => { toast.remove(); _processToastQueue(); }, 400);
    }, 3000);
}

// ── Check: Solve ──────────────────────────────────────────────────

function checkAchievementsOnSolve({ size, diff, theme, cleanSolve, noUndo, noHints }) {
    const stats = _loadAchievementStats();

    // Counters
    stats.totalSolved  = (stats.totalSolved  || 0) + 1;
    stats.bySize       = stats.bySize       || {};
    stats.bySizeDiff   = stats.bySizeDiff   || {};
    stats.byTheme      = stats.byTheme      || {};

    stats.bySize[size] = (stats.bySize[size] || 0) + 1;
    stats.bySizeDiff[`${size}_${diff}`] = true;
    if (theme) stats.byTheme[theme] = (stats.byTheme[theme] || 0) + 1;

    // Theme-spezifische Zähler
    if (theme === 'flipper' && cleanSolve && noHints) {
        stats.flipperPerfectCount = (stats.flipperPerfectCount || 0) + 1;
    }
    if (theme === 'synthwave') {
        stats.synthConsecNoUndo = noUndo ? (stats.synthConsecNoUndo || 0) + 1 : 0;
    }

    _saveAchievementStats(stats);

    // Core
    _unlockAchievement('first');
    if (stats.totalSolved >= 10)  _unlockAchievement('puzzles10');
    if (stats.totalSolved >= 50)  _unlockAchievement('puzzles50');
    if (stats.totalSolved >= 100) _unlockAchievement('puzzles100');

    if ([3,4,5,6,7,8,9].every(s => stats.bySize[s]))
        _unlockAchievement('all_sizes');

    if ([3,4,5,6,7,8,9].every(s => (DIFF_BY_SIZE[s] ?? ['easy','medium','hard']).every(d => stats.bySizeDiff[`${s}_${d}`])))
        _unlockAchievement('all_combos');

    if (size === 9 && diff === 'expert')   _unlockAchievement('expert9');
    if (cleanSolve && noHints)             _unlockAchievement('perfect');
    if (noUndo)                            _unlockAchievement('no_undo');

    // Theme
    if (theme === 'console') {
        _unlockAchievement('console_first');
        if (size === 9) _unlockAchievement('console9x9');
    }
    if (theme === 'flipper') {
        _unlockAchievement('flipper_first');
        if ((stats.flipperPerfectCount || 0) >= 5) _unlockAchievement('flipper_jackpot');
    }
    if (theme === 'space') {
        _unlockAchievement('space_first');
        if (cleanSolve && noHints) _unlockAchievement('space_dark_matter');
    }
    if (theme === 'synthwave') {
        _unlockAchievement('synth_first');
        if ((stats.synthConsecNoUndo || 0) >= 5) _unlockAchievement('synth_zone');
    }
}

// ── Check: Daily ──────────────────────────────────────────────────

function checkAchievementsOnDailySolve() {
    _unlockAchievement('daily_first');

    const stats = _loadAchievementStats();
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (stats.lastDailyDate === today) {
        // Bereits heute gezählt
    } else if (stats.lastDailyDate === yesterday) {
        stats.currentStreak = (stats.currentStreak || 1) + 1;
    } else {
        stats.currentStreak = 1;
    }
    stats.lastDailyDate = today;
    stats.maxStreak = Math.max(stats.maxStreak || 0, stats.currentStreak || 1);
    _saveAchievementStats(stats);

    if ((stats.currentStreak || 0) >= 7)  _unlockAchievement('streak7');
    if ((stats.currentStreak || 0) >= 30) _unlockAchievement('streak30');
}

// ── Retroaktive Vergabe ───────────────────────────────────────────

function applyRetroactiveAchievements() {
    const RETRO_VERSION = 'v1.2';
    try {
        if (localStorage.getItem('numori-achievements-retro') === RETRO_VERSION) return;
    } catch(e) { return; }

    // numori-stats auslesen (vom Leaderboard-Modul befüllt)
    let gameStats = { totalSolved: 0, bySize: {} };
    try {
        const raw = localStorage.getItem('numori-stats');
        if (raw) gameStats = JSON.parse(raw);
    } catch(e) {}

    const total    = gameStats.totalSolved || 0;
    const bySize   = gameStats.bySize || {};
    // Achievements ohne Toast vergeben (silent = direkt in Storage schreiben)
    const _silent = (id) => {
        if (!ACHIEVEMENTS[id] || isAchievementUnlocked(id)) return;
        const data = _loadAchievements();
        data[id] = { unlockedAt: new Date().toISOString(), retroactive: true };
        _saveAchievements(data);
    };

    if (total >= 1)   _silent('first');
    if (total >= 10)  _silent('puzzles10');
    if (total >= 50)  _silent('puzzles50');
    if (total >= 100) _silent('puzzles100');

    if ([3,4,5,6,7,8,9].every(s => bySize[s] && Object.values(bySize[s]).some(d => d.count > 0)))
        _silent('all_sizes');

    if ([3,4,5,6,7,8,9].every(s => (DIFF_BY_SIZE[s] ?? ['easy','medium','hard']).every(d => bySize[s]?.[d]?.count > 0)))
        _silent('all_combos');

    if (bySize[9]?.expert?.count > 0)
        _silent('expert9');

    // local_podium: prüfe ob es mindestens einen #1-Eintrag im lokalen Leaderboard gibt
    try {
        const lb = JSON.parse(localStorage.getItem('numori-leaderboard') || '{}');
        const hasTopRank = Object.values(lb).some(sizes =>
            Object.values(sizes).some(entries => entries.length > 0 && entries[0]?.time != null)
        );
        if (hasTopRank) _silent('local_podium');
    } catch(e) {}

    try { localStorage.setItem('numori-achievements-retro', RETRO_VERSION); } catch(e) {}
}

// ── Check: Leaderboard ────────────────────────────────────────────

function checkAchievementsOnLeaderboard({ isLocalFirst = false, isGlobalEntry = false } = {}) {
    if (isLocalFirst)  _unlockAchievement('local_podium');
    if (isGlobalEntry) _unlockAchievement('global_entry');
}

// ── Render: Achievement-Detail-Modal ─────────────────────────────

function _showAchievementDetail(id) {
    const def      = ACHIEVEMENTS[id];
    const unlocked = _loadAchievements();
    const isOn     = !!unlocked[id];
    const date     = isOn ? new Date(unlocked[id].unlockedAt).toLocaleDateString('de-DE') : null;

    const old = document.getElementById('achievement-detail-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'achievement-detail-overlay';
    overlay.innerHTML = `
        <div class="achievement-detail-modal">
            <div class="achievement-detail-icon">${isOn ? def.icon : '🔒'}</div>
            <div class="achievement-detail-name">${isOn ? def.name() : '???'}</div>
            <div class="achievement-detail-desc">${isOn ? def.desc() : '???'}</div>
            ${date ? `<div class="achievement-detail-date">Freigeschaltet am ${date}</div>` : ''}
        </div>
    `;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
}

// ── Render: Achievements-Tab ──────────────────────────────────────

function renderAchievementsTab(container) {
    const unlocked = _loadAchievements();
    const total    = Object.keys(ACHIEVEMENTS).length;
    const done     = Object.keys(unlocked).length;

    const themeGroups = {
        '': { label: 'Core & Leaderboard', ids: [] },
        console:   { label: 'Console',   ids: [] },
        flipper:   { label: 'Flipper',   ids: [] },
        space:     { label: 'Space',     ids: [] },
        synthwave: { label: 'Synthwave', ids: [] },
    };
    for (const [id, def] of Object.entries(ACHIEVEMENTS)) {
        if (def.hidden && !unlocked[id]) continue; // hidden bis freigeschaltet
        const key = def.theme || '';
        themeGroups[key].ids.push(id);
    }

    const visibleTotal = Object.values(ACHIEVEMENTS).filter(d => !d.hidden).length
        + Object.keys(unlocked).filter(id => ACHIEVEMENTS[id]?.hidden).length;
    let html = `<div class="achievement-summary">${done} / ${visibleTotal} freigeschaltet</div>`;

    for (const [, group] of Object.entries(themeGroups)) {
        if (group.ids.length === 0) continue;
        html += `<div class="achievement-group-label">${group.label}</div>`;
        html += `<div class="achievement-grid">`;
        for (const id of group.ids) {
            const def  = ACHIEVEMENTS[id];
            const isOn = !!unlocked[id];
            html += `
                <div class="achievement-item ${isOn ? 'unlocked' : 'locked'}" data-achievement-id="${id}">
                    <span class="achievement-item-icon">${isOn ? def.icon : '🔒'}</span>
                    <span class="achievement-item-name">${isOn ? def.name() : '???'}</span>
                </div>`;
        }
        html += `</div>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('.achievement-item').forEach(el => {
        el.addEventListener('click', () => _showAchievementDetail(el.dataset.achievementId));
    });
}
