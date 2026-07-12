"use strict";

// ── I18N ──────────────────────────────────────────────────────────
// Translations are loaded from locales/de.js and locales/en.js
const TRANSLATIONS = window.TRANSLATIONS;

function getLang() {
    return localStorage.getItem('numori-lang') || 'de';
}

function t(key) {
    const lang = getLang();
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de[key] ?? key;
}

function applyLanguage(lang) {
    localStorage.setItem('numori-lang', lang);
    document.documentElement.lang = lang;
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de[key];
        if (text !== undefined) el.textContent = text;
    });
    // HTML content
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.dataset.i18nHtml;
        const text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de[key];
        if (text !== undefined) el.innerHTML = text;
    });
    // title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.dataset.i18nTitle;
        const text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de[key];
        if (text !== undefined) el.title = text;
    });
    // placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        const text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de[key];
        if (text !== undefined) el.placeholder = text;
    });
    // Language toggle button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Resync custom selects so the label shows the translated text
    const sizeEl = document.getElementById('size');
    const diffEl = document.getElementById('difficulty');
    if (sizeEl) syncCustomSelect('size', sizeEl.value);
    if (diffEl) syncCustomSelect('difficulty', diffEl.value);
    // Also update native select option texts
    document.querySelectorAll('select option[data-i18n]').forEach(opt => {
        const key = opt.dataset.i18n;
        const text = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.de[key];
        if (text !== undefined) opt.textContent = text;
    });
    if (typeof window._renderWelcomeDaily === 'function') window._renderWelcomeDaily();
}

function initLanguage() {
    applyLanguage(getLang());
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });

    // 5× DE-Flagge → Debug-Menü öffnen (Mobile)
    let _flagClicks = 0, _flagTimer = null;
    document.querySelector('.lang-btn[data-lang="de"]')?.addEventListener('click', () => {
        _flagClicks++;
        clearTimeout(_flagTimer);
        _flagTimer = setTimeout(() => { _flagClicks = 0; }, 2500);
        if (_flagClicks >= 5) {
            _flagClicks = 0;
            const debugSection = document.getElementById('debug-section');
            const settingsOverlay = document.getElementById('settings-overlay');
            if (debugSection) {
                debugSection.style.display = '';
                settingsOverlay?.classList.add('visible');
            }
        }
    });
}

// ── THEME ─────────────────────────────────────────────────────────
function _loadUnlockedThemes() {
    try { return JSON.parse(localStorage.getItem('numori-unlocked-themes') || '[]'); }
    catch(e) { return []; }
}

function applyTheme(theme) {
    const validThemes = ['dark', 'console', 'flipper'];
    const unlockedThemes = _loadUnlockedThemes();
    const allowedThemes  = [...validThemes, ...unlockedThemes];
    document.documentElement.setAttribute('data-theme', allowedThemes.includes(theme) ? theme : '');
    localStorage.setItem('numori-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Inputs übernehmen font-family nicht per CSS-Vererbung in Chromium
    const font = theme === 'dark'       ? "'Poppins', system-ui, sans-serif"
               : theme === 'console'    ? "'Share Tech Mono', monospace"
               : theme === 'flipper'    ? "'Bitcount Grid Single', monospace"
               : theme === 'space'      ? "'Poppins', system-ui, sans-serif"
               : theme === 'synthwave'  ? "'Orbitron', sans-serif"
               : "";
    const seedInput = document.getElementById('seed-input');
    if (seedInput) seedInput.style.fontFamily = font;
    const welcomeIcon = document.getElementById('welcome-icon');
    if (welcomeIcon) {
        welcomeIcon.src = theme === 'console'
            ? 'assets/icons/numori_console.png'
            : theme === 'flipper'
            ? 'assets/icons/numori_flipper.png'
            : theme === 'space'
            ? 'assets/icons/numori_space.png'
            : theme === 'synthwave'
            ? 'assets/icons/numori_synthwave.png'
            : 'assets/icons/png/numori-1024.png';
    }
    // Shadow-Theme-Button Lock-Status aktualisieren
    _updateShadowThemeButtons();
    initConsoleStatus();
    initMusicPlayer();
    // Custom-Selects mit aktuellem nativen Select-Wert synchronisieren
    const _sizeEl = document.getElementById('size');
    const _diffEl = document.getElementById('difficulty');
    if (_sizeEl) syncCustomSelect('size', _sizeEl.value);
    if (_diffEl) syncCustomSelect('difficulty', _diffEl.value);
    if (theme === 'flipper') {
        flipperDMD?.start();
    } else {
        flipperDMD?.stop();
    }
    spaceStars?.onThemeChange(theme);
    spaceToolbar?.onThemeChange(theme);
    spaceMusic?.onThemeChange(theme);
    synthwaveGrid?.onThemeChange(theme);
    const _muteBtn = document.getElementById('btn-space-mute');
    if (_muteBtn) _muteBtn.style.display = theme === 'space' ? 'flex' : 'none';
    // Ensure header-right stays in header (restore if previously moved)
    const _hr = document.querySelector('.header-right');
    const _hd = document.querySelector('header');
    if (_hr && _hd && _hr.parentElement !== _hd) _hd.appendChild(_hr);
    buildFlipperTicker();
    if (currentPuzzle) requestAnimationFrame(() => resizeBoard());
}

// ── SCHRIFTGRÖSSE ─────────────────────────────────────────────────
// FONT_SCALE_KEY defined in constants.js

function applyFontScale(scale) {
    localStorage.setItem(FONT_SCALE_KEY, String(scale));
    document.querySelectorAll('.font-scale-btn:not(.lb-consent-btn)').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.scale) === scale);
    });
    // Skalierte Variablen neu berechnen falls Board vorhanden
    if (currentPuzzle) resizeBoard();
}

function getFontScale() {
    const v = parseFloat(localStorage.getItem(FONT_SCALE_KEY) ?? '1.0');
    return v === 0.85 ? 1.0 : v; // 'Klein' wurde entfernt → auf Normal fallen
}

function initFontScale() {
    const scale = getFontScale();
    document.querySelectorAll('.font-scale-btn:not(.lb-consent-btn)').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.scale) === scale);
        btn.addEventListener('click', () => applyFontScale(parseFloat(btn.dataset.scale)));
    });
}

function initTheme() {
    const saved = localStorage.getItem('numori-theme');
    if (saved) {
        applyTheme(saved);
        return;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('default');
    }
}

// ── SHADOW THEMES ─────────────────────────────────────────────────
function _updateShadowThemeButtons() {
    const unlocked = _loadUnlockedThemes();
    document.querySelectorAll('.theme-btn[data-shadow]').forEach(btn => {
        const isUnlocked = unlocked.includes(btn.dataset.theme);
        btn.style.display = isUnlocked ? '' : 'none';
        btn.classList.toggle('theme-btn-locked', !isUnlocked);
    });
}

function unlockTheme(themeName) {
    const unlocked = _loadUnlockedThemes();
    if (!unlocked.includes(themeName)) {
        unlocked.push(themeName);
        localStorage.setItem('numori-unlocked-themes', JSON.stringify(unlocked));
    }
    _updateShadowThemeButtons();
}

// ── CUSTOM SELECT ─────────────────────────────────────────────────
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
                // Bei Größenänderung erlaubte Schwierigkeiten aktualisieren
                if (targetId === 'size') updateDifficultyOptions(parseInt(val, 10));
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

// ── OPERATOR-SYMBOLE ──────────────────────────────────────────────
// OPSYMBOL defined in constants.js
function formatLabel(op, target) {
    if (op && op !== '=') return `${target}${OPSYMBOL[op] ?? op}`;
    return target;
}

// ── GRÖSSE-SCHWIERIGKEIT-KOPPLUNG ─────────────────────────────────
// WICHTIG: Logik-Funktionen dürfen nie theme-abhängig sein.
// Themes werden ausschließlich über CSS gesteuert.
// Nativer <select> und Custom-Select müssen immer synchron
// gehalten werden, unabhängig vom aktiven Theme.
function updateDifficultyOptions(n) {
    const allowed = DIFF_BY_SIZE[n] ?? ['easy', 'medium', 'hard'];
    const diffEl  = document.getElementById('difficulty');
    const cs      = document.querySelector('.custom-select[data-target="difficulty"]');
    if (!diffEl) return;

    // Native options ein-/ausblenden (klassisches Theme)
    Array.from(diffEl.options).forEach(opt => {
        opt.disabled = !allowed.includes(opt.value);
        opt.hidden   = !allowed.includes(opt.value);
    });

    // Custom-Select-Optionen ein-/ausblenden (Dark/Console-Theme)
    if (cs) {
        cs.querySelectorAll('.custom-select-option').forEach(opt => {
            const show = allowed.includes(opt.dataset.value);
            opt.style.display = show ? '' : 'none';
        });
    }

    // Falls aktuelle Schwierigkeit nicht erlaubt → auf schwerste erlaubte springen
    if (!allowed.includes(diffEl.value)) {
        const best = allowed[allowed.length - 1];
        diffEl.value = best;
        if (cs) syncCustomSelect('difficulty', best);
    }
}

// ── STATUS / TYPEWRITER ───────────────────────────────────────────
let _typewriterTimeout = null;
let _seedTypewriterTimeout = null;

function setStatus(text) {
    // Mobil: Status in der Seed-Leiste anzeigen
    const mSeed = document.getElementById('mobile-seed-text');
    if (mSeed) {
        mSeed.textContent = text;
        mSeed._statusOverride = true;
        clearTimeout(mSeed._statusTimer);
        mSeed._statusTimer = setTimeout(() => {
            mSeed._statusOverride = false;
            const seedInput = document.getElementById('seed-input');
            if (seedInput) mSeed.textContent = seedInput.value.trim() || '';
        }, 2500);
    }

    const el = document.getElementById('status');
    if (!el) return;
    if (document.documentElement.getAttribute('data-theme') !== 'console') {
        el.textContent = text;
        return;
    }
    // Laufende Animation sofort abschließen statt neu zu starten (verhindert Flackern)
    if (_typewriterTimeout) {
        clearTimeout(_typewriterTimeout);
        _typewriterTimeout = null;
        el.textContent = text;
        return;
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

// ── DEBUG ─────────────────────────────────────────────────────────
function initDebug() {
    const debugSection = document.getElementById('debug-section');
    const btnDebugClear = document.getElementById('btn-debug-clear');
    if (!debugSection) return;

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            const settingsOverlay = document.getElementById('settings-overlay');
            debugSection.style.display = debugSection.style.display === 'none' ? '' : 'none';
            if (debugSection.style.display !== 'none') {
                settingsOverlay?.classList.add('visible');
            }
        }
    });

    document.getElementById('btn-debug-state')?.addEventListener('click', () => {
        console.log('[Numori Debug State]', {
            puzzle: currentPuzzle,
            userBoard,
            notesBoard: notesBoard?.map(row => row.map(s => [...s])),
            hintBoard,
            moveCount,
            elapsedSeconds,
        });
        setStatus('State in Konsole geloggt.');
    });

    document.getElementById('btn-debug-copy-state')?.addEventListener('click', () => {
        const state = JSON.stringify({
            puzzle: currentPuzzle,
            userBoard,
            notesBoard: notesBoard?.map(row => row.map(s => [...s])),
            hintBoard,
            moveCount,
            elapsedSeconds,
            validationActive,
            timerVisible,
            timerStopped,
        }, null, 2);
        navigator.clipboard.writeText(state).then(() => {
            setStatus('State in Zwischenablage kopiert.');
        }).catch(() => {
            setStatus('Clipboard-Zugriff fehlgeschlagen.');
        });
    });

    btnDebugClear?.addEventListener('click', () => {
        Object.keys(localStorage).filter(k => k.startsWith('numori-')).forEach(k => localStorage.removeItem(k));
        setStatus('LocalStorage geleert.');
        debugSection.style.display = 'none';
    });

    document.getElementById('btn-debug-clean-solve')?.addEventListener('click', () => {
        if (!currentPuzzle) { setStatus('Kein aktives Rätsel.'); return; }
        debugSolveUsed = true;
        const n = currentPuzzle.solution.length;
        const diff = document.getElementById('difficulty')?.value || 'medium';
        // Timer stoppen ohne timerStopped zu setzen
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        timerStopped       = false;
        competitiveBlocked = false;
        validationWasUsed  = false;
        const _cleanTimes = {
            easy:   { 3: 22,  4: 40,  5: 65,  6: 100, 7: 150, 8: 210, 9: 290 },
            medium: { 3: 35,  4: 60,  5: 95,  6: 145, 7: 210, 8: 300, 9: 400 },
            hard:   { 3: 50,  4: 90,  5: 145, 6: 220, 7: 330, 8: 470, 9: 630 },
            expert: { 3: 70,  4: 120, 5: 200, 6: 300, 7: 460, 8: 660, 9: 900 },
        };
        elapsedSeconds     = _cleanTimes[diff]?.[n] ?? n * n * 3;
        moveCount          = Math.round(n * n * ({ easy: 1.2, medium: 1.5, hard: 1.8, expert: 2.2 }[diff] ?? 1.5));
        hintBoard          = hintBoard?.map(row => row.map(() => false));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                userBoard[r][c] = currentPuzzle.solution[r][c];
                const cell = getCell(r, c);
                const valSpan = cell?.querySelector('.cell-value');
                if (valSpan) valSpan.textContent = currentPuzzle.solution[r][c];
                cell?.classList.remove('invalid', 'hint');
                cell?.classList.add('correct');
            }
        }
        validateAll();
        setStatus('Debug: Clean-Solve simuliert.');
    });

    document.getElementById('btn-debug-unlock-space')?.addEventListener('click', () => {
        unlockTheme('space');
        setStatus('Debug: Space-Theme freigeschaltet.');
    });
    document.getElementById('btn-debug-unlock-synthwave')?.addEventListener('click', () => {
        unlockTheme('synthwave');
        setStatus('Debug: Synthwave-Theme freigeschaltet.');
    });

    document.getElementById('btn-debug-update-available')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 verfügbar.', 'download', '99.0.0');
        setStatus('Debug: Update-verfügbar-Banner ausgelöst.');
    });

    document.getElementById('btn-debug-update-downloaded')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 bereit.', 'install', '99.0.0');
        setStatus('Debug: Update-heruntergeladen-Banner ausgelöst.');
    });

    initDevNotes();

    document.getElementById('btn-debug-update-progress')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 verfügbar.', 'download', '99.0.0');
        setStatus('Debug: Download-Fortschritt wird simuliert.');
        requestAnimationFrame(() => {
            document.querySelector('#update-banner .update-banner-btn:not(.update-banner-btn--ghost)')?.click();
            let pct = 0;
            const bar   = document.querySelector('.update-progress-bar');
            const speed = document.querySelector('.update-progress-speed');
            const charPx = 9;
            const BARS   = bar ? Math.max(10, Math.floor((bar.closest('.update-progress-wrap')?.offsetWidth || 260) / charPx) - 6) : 20;
            const sim = setInterval(() => {
                pct = Math.min(100, pct + Math.floor(Math.random() * 8) + 2);
                const kbps = Math.floor(Math.random() * 400 + 800);
                if (bar) {
                    const filled = Math.round((pct / 100) * BARS);
                    const cursor = pct < 100 ? '▌' : '';
                    const empty  = BARS - filled - (cursor ? 1 : 0);
                    bar.textContent = `[${'█'.repeat(filled)}${cursor}${'░'.repeat(Math.max(0, empty))}] ${String(pct).padStart(3)}%`;
                }
                if (speed) speed.textContent = pct < 100 ? `${kbps} kb/s` : 'abgeschlossen.';
                if (pct >= 100) {
                    clearInterval(sim);
                    setTimeout(() => showUpdateBanner('Version 99.0.0 bereit.', 'install', '99.0.0'), 600);
                }
            }, 150);
        });
    });
}

// ── DEV NOTES ────────────────────────────────────────────────────
function initDevNotes() {
    const overlay  = document.getElementById('dev-notes-overlay');
    const closeBtn = document.getElementById('dev-notes-close');
    const list     = document.getElementById('dev-notes-list');
    const input    = document.getElementById('dev-notes-input');
    const addBtn   = document.getElementById('btn-dev-notes-add');
    const status   = document.getElementById('dev-notes-status');
    const selCat   = document.getElementById('dev-notes-category');
    const selPlat  = document.getElementById('dev-notes-platform');
    const selTheme = document.getElementById('dev-notes-theme');
    if (!list || !input || !addBtn) return;

    const openBtn = document.getElementById('btn-dev-notes');
    if (openBtn) openBtn.addEventListener('click', () => {
        document.getElementById('settings-overlay')?.classList.remove('visible');
        overlay?.classList.add('visible');
    });
    if (closeBtn) closeBtn.addEventListener('click', () => {
        overlay?.classList.remove('visible');
    });
    if (overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('visible');
    });

    const supabaseAvailable = typeof window.supabaseFetchDevNotes === 'function';
    let allItems = [];

    const CAT_LABELS = { ui: 'UI', function: 'Funktion', performance: 'Performance', content: 'Inhalt', other: 'Sonst.' };
    const PLAT_LABELS = { all: 'Alle', apk: 'APK', desktop: 'Desktop', web: 'Web' };
    const THEME_LABELS = { all: 'Alle', synthwave: 'SW', space: 'Space', console: 'Con', flipper: 'Flip', dark: 'Dark' };
    const THEME_COLORS = {
        synthwave: '#ff2d78',
        space: '#8844ff',
        console: '#008f20',
        flipper: '#ff8c00',
        dark: '#64748b'
    };

    function catColor(cat) {
        return cat === 'ui'         ? 'hsl(200,60%,50%)'
             : cat === 'function'   ? 'hsl(140,50%,45%)'
             : cat === 'performance' ? 'hsl(30,80%,50%)'
             : cat === 'content'    ? 'hsl(270,60%,55%)'
             : 'hsl(0,0%,50%)';
    }

    function render(items) {
        list.innerHTML = '';
        if (!items || items.length === 0) return;

        for (const item of items) {
            const row = document.createElement('div');
            row.className = 'dev-note-row';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'dev-note-checkbox';
            cb.checked = !!item.done;
            cb.addEventListener('change', () => {
                if (supabaseAvailable) window.supabaseToggleDevNote(item.id, cb.checked);
                text.classList.toggle('done', cb.checked);
            });

            function badge(label, bg) {
                const b = document.createElement('span');
                b.className = 'dev-note-badge';
                b.textContent = label;
                b.style.background = bg;
                return b;
            }

            const badges = document.createElement('span');
            badges.className = 'dev-note-badges';
            if (item.category && item.category !== 'other') badges.appendChild(badge(CAT_LABELS[item.category] || item.category, 'hsl(0,0%,40%)'));
            if (item.platform && item.platform !== 'all') badges.appendChild(badge(PLAT_LABELS[item.platform] || item.platform, 'hsl(0,0%,40%)'));
            if (item.theme && item.theme !== 'all') badges.appendChild(badge(THEME_LABELS[item.theme] || item.theme, THEME_COLORS[item.theme] || 'hsl(330,60%,45%)'));

            const text = document.createElement('span');
            text.className = 'dev-note-text' + (item.done ? ' done' : '');
            text.textContent = item.text;

            const editBtn = document.createElement('button');
            editBtn.className = 'dev-note-edit';
            editBtn.textContent = '✎';
            editBtn.addEventListener('click', () => {
                const wasEditing = row.classList.contains('editing');
                if (wasEditing) {
                    const input = row.querySelector('.dev-note-edit-input');
                    const newText = input?.value.trim();
                    if (!newText) return;
                    if (supabaseAvailable) window.supabaseUpdateDevNote(item.id, { text: newText });
                    item.text = newText;
                    render(allItems);
                    return;
                }
                row.classList.add('editing');
                text.style.display = 'none';
                const input = document.createElement('input');
                input.className = 'dev-note-edit-input';
                input.type = 'text';
                input.value = item.text;
                text.parentNode.insertBefore(input, text);
                input.focus();
                input.select();
                editBtn.textContent = '✓';
                editBtn.classList.add('saving');
            });

            const del = document.createElement('button');
            del.className = 'dev-note-delete';
            del.textContent = '✕';
            del.addEventListener('click', async () => {
                row.remove();
                if (supabaseAvailable) await window.supabaseDeleteDevNote(item.id);
                allItems = allItems.filter(i => i.id !== item.id);
                render(allItems);
            });

            row.append(cb, badges, text, editBtn, del);
            list.appendChild(row);
        }
    }

    async function load() {
        if (!supabaseAvailable) {
            if (status) status.textContent = 'Supabase nicht verfügbar';
            return;
        }
        try {
            allItems = await window.supabaseFetchDevNotes();
            render(allItems);
        } catch (e) {
            console.error('Dev notes load failed:', e);
            if (status) status.textContent = 'Laden fehlgeschlagen';
        }
    }

    async function addItem() {
        const text = input.value.trim();
        if (!text) return;
        if (!supabaseAvailable) {
            if (status) status.textContent = 'Supabase nicht verfügbar';
            return;
        }

        const cat   = selCat?.value   || 'other';
        const plat  = selPlat?.value  || 'all';
        const theme = selTheme?.value || 'all';

        input.value = '';
        if (status) status.textContent = 'Speichern...';

        try {
            await window.supabaseInsertDevNote(text, cat, plat, theme);
            allItems = await window.supabaseFetchDevNotes();
            render(allItems);
            if (status) status.textContent = '';
        } catch (e) {
            console.error('Dev notes insert failed:', e);
            if (status) status.textContent = 'Speichern fehlgeschlagen';
        }
    }

    addBtn.addEventListener('click', addItem);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem(); });

    load();
}

// ── UPDATE-BANNER ─────────────────────────────────────────────────
function showUpdateBanner(message, mode, version) {
    let banner = document.getElementById('update-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'update-banner';
        banner.className = 'update-banner';
        // Einmalig beim Erstellen setzen – nie doppelt
        banner.addEventListener('click', (e) => {
            if (e.target === banner) banner.classList.remove('visible');
        });
        document.body.appendChild(banner);
    }

    banner.innerHTML = '';

    const inner = document.createElement('div');
    inner.className = 'update-banner-inner';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'update-banner-close';
    closeBtn.title = t('update-close');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => banner.classList.remove('visible'));
    inner.appendChild(closeBtn);

    const msg = document.createElement('span');
    msg.className = 'update-banner-msg';
    msg.textContent = message;
    inner.appendChild(msg);

    const buttons = document.createElement('div');
    buttons.className = 'update-banner-buttons';

    if (mode === 'download') {
        const btnYes = document.createElement('button');
        btnYes.className = 'update-banner-btn';
        btnYes.textContent = t('update-download');
        btnYes.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.startUpdateDownload();
            msg.textContent = t('update-progress').replace('{version}', version);
            buttons.innerHTML = '';

            const theme = document.documentElement.getAttribute('data-theme');

            if (theme === 'console') {
                const progressWrap = document.createElement('div');
                progressWrap.className = 'update-progress-wrap';

                const progressBar = document.createElement('span');
                progressBar.className = 'update-progress-bar';

                const progressSpeed = document.createElement('span');
                progressSpeed.className = 'update-progress-speed';

                progressWrap.appendChild(progressBar);
                progressWrap.appendChild(progressSpeed);
                inner.appendChild(progressWrap);

                // Breite einmal nach DOM-Einfügung messen
                const charPx = 9;
                const BARS   = Math.max(10, Math.floor((progressWrap.offsetWidth - 10) / charPx) - 6);

                function renderBar(percent, kbps) {
                    const filled = Math.round((percent / 100) * BARS);
                    const cursor = percent < 100 ? '▌' : '';
                    const empty  = BARS - filled - (cursor ? 1 : 0);
                    progressBar.textContent =
                        `[${`█`.repeat(filled)}${cursor}${`░`.repeat(Math.max(0, empty))}] ${String(percent).padStart(3)}%`;
                    progressSpeed.textContent = percent < 100
                        ? `${kbps} kb/s`
                        : 'abgeschlossen.';
                }

                renderBar(0, 0);

                if (window.electronAPI) {
                    window.electronAPI.onUpdateProgress((percent) => {
                        const kbps = Math.floor(Math.random() * 400 + 800);
                        renderBar(percent, kbps);
                    });
                }
            } else {
                // Bouncing-Dots für alle anderen Themes
                const dotsWrap = document.createElement('div');
                dotsWrap.className = 'update-progress-dots';
                const pctLabel = document.createElement('span');
                pctLabel.className = 'update-progress-pct';
                pctLabel.textContent = '0%';
                for (let i = 0; i < 3; i++) dotsWrap.appendChild(document.createElement('span'));
                inner.appendChild(dotsWrap);
                inner.appendChild(pctLabel);

                if (window.electronAPI) {
                    window.electronAPI.onUpdateProgress((percent) => {
                        pctLabel.textContent = percent >= 100 ? '✓' : `${percent}%`;
                    });
                }
            }
        });

        const btnNo = document.createElement('button');
        btnNo.className = 'update-banner-btn update-banner-btn--ghost';
        btnNo.textContent = t('update-later');
        btnNo.addEventListener('click', () => banner.classList.remove('visible'));

        buttons.appendChild(btnYes);
        buttons.appendChild(btnNo);
    }

    if (mode === 'apk') {
        const btnDownload = document.createElement('a');
        btnDownload.className = 'update-banner-btn';
        btnDownload.textContent = t('update-download');
        btnDownload.href = `https://github.com/kaizo101/numori/releases/latest`;
        btnDownload.target = '_blank';
        btnDownload.rel = 'noopener noreferrer';
        const btnLater = document.createElement('button');
        btnLater.className = 'update-banner-btn update-banner-btn--ghost';
        btnLater.textContent = t('update-later');
        btnLater.addEventListener('click', () => {
            localStorage.setItem('numori-update-dismissed', version);
            banner.classList.remove('visible');
        });
        buttons.appendChild(btnDownload);
        buttons.appendChild(btnLater);
    }

    if (mode === 'install') {
        const btn = document.createElement('button');
        btn.className = 'update-banner-btn';
        btn.textContent = t('update-restart');
        btn.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.installUpdateNow();
        });
        buttons.appendChild(btn);
    }

    inner.appendChild(buttons);
    banner.appendChild(inner);

    banner.classList.add('visible');
}
