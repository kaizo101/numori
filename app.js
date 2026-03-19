"use strict";

// ── I18N ──────────────────────────────────────────────────────────
const TRANSLATIONS = {
    de: {
        'subtitle': 'Logik-Rätsel',
        'size-upper': 'GRÖẞE',
        'size-label': 'Größe',
        'difficulty-label': 'Schwierigkeit',
        'diff-easy': 'Leicht',
        'diff-medium': 'Mittel',
        'diff-hard': 'Schwer',
        'seed-label': 'Rätsel-ID',
        'btn-new': 'Neues Rätsel',
        'btn-solve': 'Lösung',
        'btn-reset': 'Reset',
        'progress-label': 'Fortschritt',
        'move-label': 'Züge',
        'title-notes': 'Notiz-Modus (N)',
        'title-validate': 'Sofort-Validierung ein/aus',
        'title-hint': 'Tipp anzeigen',
        'title-undo': 'Undo (Strg+Z)',
        'title-redo': 'Redo (Strg+Y)',
        'title-pdf': 'Als PDF speichern',
        'title-daily': 'Tägliches Rätsel',
        'title-timer': 'Timer – nur Läufe ohne Hilfe & Validierung kommen in die Bestenliste',
        'title-numpad': 'Zahlenpad ein/aus',
        'title-timer-blocked': 'Lauf nicht gewertet – Hilfe oder Validierung wurde genutzt',
        'welcome-title': 'Willkommen bei NUMORI',
        'welcome-text': 'Wähle Größe und Schwierigkeit,\ndann klicke Neues Rätsel.',
        'welcome-hint': 'Oder gib eine Rätsel-ID ein, um ein bekanntes Rätsel zu laden.',
        'more-solve': 'Lösung',
        'more-reset': 'Reset',
        'more-timer': 'Timer',
        'more-validate': 'Validierung',
        'nav-notes': 'Notizen',
        'nav-hint': 'Tipp',
        'nav-undo': 'Undo',
        'nav-redo': 'Redo',
        'nav-more': 'Mehr',
        'footer-shortcuts': 'Pfeiltasten: Navigation\u00a0\u00a0·\u00a0\u00a0N: Notizen\u00a0\u00a0·\u00a0\u00a0V: Validierung\u00a0\u00a0·\u00a0\u00a0T: Timer\u00a0\u00a0·\u00a0\u00a0H: Tipp\u00a0\u00a0·\u00a0\u00a0Entf: Löschen\u00a0\u00a0·\u00a0\u00a0Strg+Z/Y: Undo/Redo',
        'footer-timer-label': 'Timer starten',
        'flipper-menu-scores': 'BESTENLISTE',
        'flipper-menu-theme': 'DESIGN',
        'flipper-menu-settings': 'EINSTELLUNGEN',
        'modal-reset-text': 'Alle Eingaben des aktuellen Rätsels löschen?',
        'modal-confirm': 'Ja, löschen',
        'modal-cancel': 'Abbrechen',
        'win-title': 'Perfekt gelöst!',
        'win-stat-size': 'Größe',
        'win-stat-diff': 'Schwierigkeit',
        'win-stat-time': 'Zeit',
        'win-stat-moves': 'Züge',
        'win-stat-seed-label': 'Rätsel-ID',
        'win-new': 'Neues Rätsel',
        'win-close': 'Schließen',
        'win-new-best': '★ Neue Bestzeit!',
        'stats-title': 'Statistiken',
        'stats-reset-btn': 'Zurücksetzen',
        'stats-close': 'Schließen',
        'stats-total-label': 'Gesamt gelöst',
        'stats-empty': 'Noch keine Rätsel gelöst.',
        'stats-col-size': 'Größe',
        'stats-col-diff': 'Schwierigkeit',
        'stats-col-solved': 'Gelöst',
        'stats-col-best': 'Bestzeit',
        'stats-col-avg': 'Ø Zeit',
        'stats-col-moves': 'Beste Züge',
        'theme-title': 'Design',
        'theme-classic': 'Klassisch',
        'theme-console': 'Konsole',
        'theme-flipper': 'Flipper',
        'theme-close': 'Schließen',
        'settings-title': 'Einstellungen',
        'settings-fontsize': 'Schriftgröße',
        'settings-font-small': 'Klein',
        'settings-font-normal': 'Normal',
        'settings-font-large': 'Groß',
        'settings-help': 'Hilfe',
        'settings-tutorial': 'Tutorial starten',
        'settings-lang': 'Sprache',
        'settings-close': 'Schließen',
        'settings-about-title': 'Über Numori',
        'settings-about-privacy': 'Alle Spielstände werden ausschließlich lokal auf deinem Gerät gespeichert. Es werden keine personenbezogenen Daten übertragen oder gespeichert.',
        'settings-about-imprint': 'Impressum',
        'settings-about-contact': 'Bei Fragen, Problemen oder Anregungen erreichst du mich unter:',
        'tut-welcome-title': 'Willkommen bei Numori',
        'tut-welcome-text': 'Bist du mit dem Rätselprinzip vertraut?',
        'tut-w-yes': 'Ja, direkt loslegen',
        'tut-w-no': 'Nein, Tutorial starten',
        'tut-puzzle-title': 'Versuch\'s selbst!',
        'tut-puzzle-hint': '3×3-Rätsel – Zahlen 1 bis 3, jede einmal pro Zeile und Spalte.',
        'tut-skip': 'Überspringen',
        'tut-success-title': 'Super gemacht!',
        'tut-success-text': 'Du kennst jetzt alles was du für Numori brauchst. Viel Spaß!',
        'tut-finish': 'Los geht\'s',
        'tut-back': '← Zurück',
        'tut-next': 'Weiter →',
        'tut-next-last': 'Los geht\'s →',
        'seed-modal-title': 'Rätsel-ID eingeben',
        'seed-modal-confirm': 'Laden',
        'seed-modal-cancel': 'Abbrechen',
        'seed-modal-placeholder': 'z.B. 5M-JLLNTD',
        'numpad-title': 'Zahlenpad',
        'btn-generating': 'Generiere...',
        'status-loaded': '{n}×{n} {diff}',
        'status-solved': '{n}×{n} gelöst!',
        'status-solve-shown': 'Lösung angezeigt. Zeit gestoppt.',
        'status-error': 'Fehler beim Generieren – bitte erneut klicken.',
        'status-reset': 'Rätsel zurückgesetzt.',
        'status-pdf': 'PDF gespeichert.',
        'status-generating': 'Generiere {n}x{n}-Rätsel {diff}…',
        'status-cleared-1': '1 falsche Zahl gelöscht.',
        'status-cleared-n': '{n} falsche Zahlen gelöscht.',
        'clear-invalid-1': '1 falsche Zahl gefunden. Löschen?',
        'clear-invalid-n': '{n} falsche Zahlen gefunden. Löschen?',
        'daily-solved-title': 'Tägliches Rätsel – heute bereits gelöst ({time})',
        'error-title-dark': 'Nicht ganz richtig.',
        'error-sub-dark': 'Noch nicht alle Zellen stimmen.',
        'error-title-default': 'Nicht korrekt.',
        'error-sub-default': 'Es sind noch Fehler vorhanden.',
        'diff-easy-name': 'Leicht',
        'diff-easy-1': '2 bis 3 Zellen pro Käfig',
        'diff-easy-2': '+  −  ×  (kein ÷)',
        'diff-easy-3': 'Für Einsteiger',
        'diff-medium-name': 'Mittel',
        'diff-medium-1': '3 bis 4 Zellen pro Käfig',
        'diff-medium-2': '+  −  ×  ÷',
        'diff-medium-3': 'Für Geübte',
        'diff-hard-name': 'Schwer',
        'diff-hard-1': 'Bis zu 5 Zellen pro Käfig',
        'diff-hard-2': '+  −  ×  ÷',
        'diff-hard-3': 'Für Profis',
        'stats-reset-confirm': 'Alle Statistiken zurücksetzen?',
        'stats-tab-stats': 'Statistiken',
        'stats-tab-leaderboard': 'Bestenliste',
        'lb-info': 'Zeiten landen automatisch in der Bestenliste – solange keine Hilfe oder Sofort-Validierung genutzt wurde.',
        'lb-empty': 'Noch keine Einträge vorhanden.',
        'lb-moves': 'Züge',
        'lb-name-placeholder': 'Dein Name',
        'lb-confirm': 'Eintragen',
        'lb-cancel': 'Überspringen',
        'lb-entry-title': 'Platz {rank} erreicht!',
        'lb-anon': 'Anonym',
        'lb-reset-confirm': 'Bestenliste wirklich zurücksetzen?',
        'tut-slide1-title': 'Das Spielprinzip',
        'tut-slide1-body': `<p>Numori ist ein Logik-Rätsel auf einem <strong>n×n-Gitter</strong>. Fülle jede Zeile und jede Spalte mit den Zahlen <strong>1 bis n</strong> – jede Zahl genau einmal pro Zeile und Spalte.</p>
<div class="tut-latin-wrap">
  <div class="tut-latin">
    <div class="tut-latin-row"><span>1</span><span>2</span><span>3</span></div>
    <div class="tut-latin-row"><span>2</span><span>3</span><span>1</span></div>
    <div class="tut-latin-row"><span>3</span><span>1</span><span>2</span></div>
  </div>
  <p class="tut-hint">↑ Jede Zahl kommt in jeder Zeile und Spalte genau einmal vor.</p>
</div>`,
        'tut-slide2-title': 'Käfige & Operationen',
        'tut-slide2-body': `<p>Das Gitter ist in farbige <strong>Käfige</strong> unterteilt. Jeder Käfig zeigt oben links eine Zahl mit einer Rechenoperation – die Zahlen im Käfig müssen zusammen das Ergebnis ergeben.</p>
<ul class="tut-ops">
  <li><strong>6+</strong><span>Summe ist 6 <em>(z.B. 1+2+3)</em></span></li>
  <li><strong>2−</strong><span>Differenz ist 2 <em>(z.B. 3−1)</em></span></li>
  <li><strong>12×</strong><span>Produkt ist 12 <em>(z.B. 3×4)</em></span></li>
  <li><strong>3:</strong><span>Quotient ist 3 <em>(z.B. 6:2)</em></span></li>
  <li><strong>4=</strong><span>Zelle enthält genau die 4</span></li>
</ul>`,
        'tut-slide3-title': 'Nützliche Funktionen',
        'tut-slide3-body': `<div class="tut-features">
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
    <div><strong>Sofort-Validierung</strong><span>Markiert Fehler sofort beim Eingeben. Gut zum Üben – sperrt aber den Wettkampf-Modus.</span></div>
  </div>
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    <div><strong>Bestenliste</strong><span>Zeiten landen automatisch in der Bestenliste – solange keine Hilfe oder Sofort-Validierung genutzt wurde.</span></div>
  </div>
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
    <div><strong>Rätsel-ID</strong><span>Jedes Rätsel hat eine eindeutige ID. Eingeben um ein bekanntes Rätsel erneut zu laden oder mit anderen zu teilen.</span></div>
  </div>
</div>`,
    },
    en: {
        'subtitle': 'Logic Puzzle',
        'size-upper': 'SIZE',
        'size-label': 'Size',
        'difficulty-label': 'Difficulty',
        'diff-easy': 'Easy',
        'diff-medium': 'Medium',
        'diff-hard': 'Hard',
        'seed-label': 'Puzzle ID',
        'btn-new': 'New Puzzle',
        'btn-solve': 'Solve',
        'btn-reset': 'Reset',
        'progress-label': 'Progress',
        'move-label': 'Moves',
        'title-notes': 'Note Mode (N)',
        'title-validate': 'Instant Validation on/off',
        'title-hint': 'Show Hint',
        'title-undo': 'Undo (Ctrl+Z)',
        'title-redo': 'Redo (Ctrl+Y)',
        'title-pdf': 'Save as PDF',
        'title-daily': 'Daily Puzzle',
        'title-timer': 'Timer – only runs without hints & validation qualify for the leaderboard',
        'title-numpad': 'Numpad on/off',
        'title-timer-blocked': 'Run not counted – hints or validation were used',
        'welcome-title': 'Welcome to NUMORI',
        'welcome-text': 'Choose size and difficulty,\nthen click New Puzzle.',
        'welcome-hint': 'Or enter a Puzzle ID to load a known puzzle.',
        'more-solve': 'Solve',
        'more-reset': 'Reset',
        'more-timer': 'Timer',
        'more-validate': 'Validate',
        'nav-notes': 'Notes',
        'nav-hint': 'Hint',
        'nav-undo': 'Undo',
        'nav-redo': 'Redo',
        'nav-more': 'More',
        'footer-shortcuts': 'Arrow keys: Navigate\u00a0\u00a0·\u00a0\u00a0N: Notes\u00a0\u00a0·\u00a0\u00a0V: Validate\u00a0\u00a0·\u00a0\u00a0T: Timer\u00a0\u00a0·\u00a0\u00a0H: Hint\u00a0\u00a0·\u00a0\u00a0Del: Clear\u00a0\u00a0·\u00a0\u00a0Ctrl+Z/Y: Undo/Redo',
        'footer-timer-label': 'Start Timer',
        'flipper-menu-scores': 'SCORES',
        'flipper-menu-theme': 'THEME',
        'flipper-menu-settings': 'SETTINGS',
        'modal-reset-text': 'Delete all entries of the current puzzle?',
        'modal-confirm': 'Yes, delete',
        'modal-cancel': 'Cancel',
        'win-title': 'Perfectly solved!',
        'win-stat-size': 'Size',
        'win-stat-diff': 'Difficulty',
        'win-stat-time': 'Time',
        'win-stat-moves': 'Moves',
        'win-stat-seed-label': 'Puzzle ID',
        'win-new': 'New Puzzle',
        'win-close': 'Close',
        'win-new-best': '★ New Best Time!',
        'stats-title': 'Statistics',
        'stats-reset-btn': 'Reset',
        'stats-close': 'Close',
        'stats-total-label': 'Total Solved',
        'stats-empty': 'No puzzles solved yet.',
        'stats-col-size': 'Size',
        'stats-col-diff': 'Difficulty',
        'stats-col-solved': 'Solved',
        'stats-col-best': 'Best Time',
        'stats-col-avg': 'Avg Time',
        'stats-col-moves': 'Best Moves',
        'theme-title': 'Theme',
        'theme-classic': 'Classic',
        'theme-console': 'Console',
        'theme-flipper': 'Flipper',
        'theme-close': 'Close',
        'settings-title': 'Settings',
        'settings-fontsize': 'Font Size',
        'settings-font-small': 'Small',
        'settings-font-normal': 'Normal',
        'settings-font-large': 'Large',
        'settings-help': 'Help',
        'settings-tutorial': 'Start Tutorial',
        'settings-lang': 'Language',
        'settings-close': 'Close',
        'settings-about-title': 'About Numori',
        'settings-about-privacy': 'All progress is stored exclusively on your device. No personal data is transmitted or collected.',
        'settings-about-imprint': 'Legal Notice',
        'settings-about-contact': 'For questions, issues or suggestions, feel free to reach out:',
        'tut-welcome-title': 'Welcome to Numori',
        'tut-welcome-text': 'Are you familiar with the puzzle rules?',
        'tut-w-yes': 'Yes, let\'s go',
        'tut-w-no': 'No, show tutorial',
        'tut-puzzle-title': 'Try it yourself!',
        'tut-puzzle-hint': '3×3 puzzle – numbers 1 to 3, each once per row and column.',
        'tut-skip': 'Skip',
        'tut-success-title': 'Well done!',
        'tut-success-text': 'You now know everything you need for Numori. Have fun!',
        'tut-finish': 'Let\'s go',
        'tut-back': '← Back',
        'tut-next': 'Next →',
        'tut-next-last': 'Let\'s go →',
        'seed-modal-title': 'Enter Puzzle ID',
        'seed-modal-confirm': 'Load',
        'seed-modal-cancel': 'Cancel',
        'seed-modal-placeholder': 'e.g. 5M-JLLNTD',
        'numpad-title': 'Numpad',
        'btn-generating': 'Generating...',
        'status-loaded': '{n}×{n} {diff}',
        'status-solved': '{n}×{n} solved!',
        'status-solve-shown': 'Solution shown. Timer stopped.',
        'status-error': 'Error generating – please try again.',
        'status-reset': 'Puzzle reset.',
        'status-pdf': 'PDF saved.',
        'status-generating': 'Generating {n}x{n} puzzle {diff}…',
        'status-cleared-1': '1 wrong number deleted.',
        'status-cleared-n': '{n} wrong numbers deleted.',
        'clear-invalid-1': '1 wrong number found. Delete?',
        'clear-invalid-n': '{n} wrong numbers found. Delete?',
        'daily-solved-title': 'Daily Puzzle – already solved today ({time})',
        'error-title-dark': 'Not quite right.',
        'error-sub-dark': 'Not all cells are correct yet.',
        'error-title-default': 'Incorrect.',
        'error-sub-default': 'There are still errors.',
        'diff-easy-name': 'Easy',
        'diff-easy-1': '2 to 3 cells per cage',
        'diff-easy-2': '+  −  ×  (no ÷)',
        'diff-easy-3': 'For beginners',
        'diff-medium-name': 'Medium',
        'diff-medium-1': '3 to 4 cells per cage',
        'diff-medium-2': '+  −  ×  ÷',
        'diff-medium-3': 'For experienced players',
        'diff-hard-name': 'Hard',
        'diff-hard-1': 'Up to 5 cells per cage',
        'diff-hard-2': '+  −  ×  ÷',
        'diff-hard-3': 'For experts',
        'stats-reset-confirm': 'Reset all statistics?',
        'stats-tab-stats': 'Statistics',
        'stats-tab-leaderboard': 'Leaderboard',
        'lb-info': 'Times are automatically added to the leaderboard – as long as no hints or instant validation were used.',
        'lb-empty': 'No entries yet.',
        'lb-moves': 'moves',
        'lb-name-placeholder': 'Your name',
        'lb-confirm': 'Submit',
        'lb-cancel': 'Skip',
        'lb-entry-title': 'Rank {rank} achieved!',
        'lb-anon': 'Anonymous',
        'lb-reset-confirm': 'Really reset the leaderboard?',
        'tut-slide1-title': 'The Rules',
        'tut-slide1-body': `<p>Numori is a logic puzzle on an <strong>n×n grid</strong>. Fill every row and column with the numbers <strong>1 to n</strong> – each number exactly once per row and column.</p>
<div class="tut-latin-wrap">
  <div class="tut-latin">
    <div class="tut-latin-row"><span>1</span><span>2</span><span>3</span></div>
    <div class="tut-latin-row"><span>2</span><span>3</span><span>1</span></div>
    <div class="tut-latin-row"><span>3</span><span>1</span><span>2</span></div>
  </div>
  <p class="tut-hint">↑ Each number appears exactly once in every row and column.</p>
</div>`,
        'tut-slide2-title': 'Cages & Operations',
        'tut-slide2-body': `<p>The grid is divided into coloured <strong>cages</strong>. Each cage shows a number with an operation in the top-left – the numbers in the cage must produce that result.</p>
<ul class="tut-ops">
  <li><strong>6+</strong><span>Sum is 6 <em>(e.g. 1+2+3)</em></span></li>
  <li><strong>2−</strong><span>Difference is 2 <em>(e.g. 3−1)</em></span></li>
  <li><strong>12×</strong><span>Product is 12 <em>(e.g. 3×4)</em></span></li>
  <li><strong>3:</strong><span>Quotient is 3 <em>(e.g. 6:2)</em></span></li>
  <li><strong>4=</strong><span>Cell contains exactly 4</span></li>
</ul>`,
        'tut-slide3-title': 'Useful Features',
        'tut-slide3-body': `<div class="tut-features">
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
    <div><strong>Instant Validation</strong><span>Highlights mistakes as you enter numbers. Great for practice – but locks Competitive Mode.</span></div>
  </div>
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    <div><strong>Competitive Mode</strong><span>Starts the timer for the leaderboard. Activate before your first move – hints and validation lock it.</span></div>
  </div>
  <div class="tut-feat">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
    <div><strong>Puzzle ID</strong><span>Every puzzle has a unique ID. Enter it to reload a known puzzle or share it with others.</span></div>
  </div>
</div>`,
    }
};

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
}

function initLanguage() {
    applyLanguage(getLang());
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });
}

// 0. THEME
function applyTheme(theme) {
    const validThemes = ['dark', 'console', 'flipper'];
    document.documentElement.setAttribute('data-theme', validThemes.includes(theme) ? theme : '');
    localStorage.setItem('numori-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Inputs übernehmen font-family nicht per CSS-Vererbung in Chromium
    const font = theme === 'dark'    ? "'Poppins', system-ui, sans-serif"
               : theme === 'console' ? "'Share Tech Mono', monospace"
               : theme === 'flipper' ? "'Bitcount Grid Single', monospace"
               : "";
    const seedInput = document.getElementById('seed-input');
    if (seedInput) seedInput.style.fontFamily = font;
    // Welcome-Icon je nach Theme tauschen
    const welcomeIcon = document.getElementById('welcome-icon');
    if (welcomeIcon) {
        welcomeIcon.src = theme === 'console'
            ? 'assets/icons/numori_console.png'
            : theme === 'flipper'
            ? 'assets/icons/numori_flipper.png'
            : 'assets/icons/png/numori-1024.png';
    }
    initConsoleStatus();
    initMusicPlayer();
    if (theme === 'flipper') {
        flipperDMD.start();
    } else {
        flipperDMD.stop();
    }
    // Ensure header-right stays in header (restore if previously moved)
    const _hr = document.querySelector('.header-right');
    const _hd = document.querySelector('header');
    if (_hr && _hd && _hr.parentElement !== _hd) _hd.appendChild(_hr);
    buildFlipperTicker();
    if (currentPuzzle) requestAnimationFrame(() => resizeBoard());
}

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
    const diffLabels = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
    const parts = [];
    for (const size of [4, 5, 6, 7, 8, 3]) {
        for (const diff of ['easy', 'medium', 'hard']) {
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

// ── SCHRIFTGRÖSSE ─────────────────────────────────────────────────
const FONT_SCALE_KEY = 'numori-font-scale';

function applyFontScale(scale) {
    localStorage.setItem(FONT_SCALE_KEY, String(scale));
    document.querySelectorAll('.font-scale-btn').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.scale) === scale);
    });
    // Skalierte Variablen neu berechnen falls Board vorhanden
    if (currentPuzzle) resizeBoard();
}

function getFontScale() {
    return parseFloat(localStorage.getItem(FONT_SCALE_KEY) ?? '1.0');
}

function initFontScale() {
    const scale = getFontScale();
    document.querySelectorAll('.font-scale-btn').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.scale) === scale);
        btn.addEventListener('click', () => applyFontScale(parseFloat(btn.dataset.scale)));
    });
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

// 1. OPERATOR-SYMBOLE
const OPSYMBOL = { '+': '+', '-': '−', '*': '×', '/': ':' };
function formatLabel(op, target) {
    if (op && op !== '=') return `${target}${OPSYMBOL[op] ?? op}`;
    return target;
}

// 1b. GRÖSSE-SCHWIERIGKEIT-KOPPLUNG
const DIFF_BY_SIZE = {
    3: ['easy'],
    4: ['easy', 'medium'],
    5: ['easy', 'medium', 'hard'],
    6: ['medium', 'hard'],
    7: ['hard'],
};

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

    btnDebugClear?.addEventListener('click', () => {
        localStorage.clear();
        setStatus('LocalStorage geleert.');
        debugSection.style.display = 'none';
    });

    document.getElementById('btn-debug-update-available')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 verfügbar.', 'download', '99.0.0');
        setStatus('Debug: Update-verfügbar-Banner ausgelöst.');
    });

    document.getElementById('btn-debug-update-downloaded')?.addEventListener('click', () => {
        showUpdateBanner('Version 99.0.0 bereit.', 'install', '99.0.0');
        setStatus('Debug: Update-heruntergeladen-Banner ausgelöst.');
    });

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

// ── STATISTIKEN ───────────────────────────────────────────────────

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

function renderStatsContent() {
    const stats = loadStats();
    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard') };
    const sizes = [3, 4, 5, 6, 7];

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
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard') };
    const medals = ['1', '2', '3'];
    const rankClasses = ['lb-row-gold', 'lb-row-silver', 'lb-row-bronze'];
    const container = document.getElementById('stats-content');
    if (!container) return;

    // Verfügbare Kombinationen sammeln
    const options = [];
    for (const n of [3, 4, 5, 6, 7]) {
        for (const diff of ['easy', 'medium', 'hard']) {
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

function renderStatsModal() {
    document.querySelectorAll('.stats-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === statsActiveTab);
    });
    if (statsActiveTab === 'leaderboard') {
        renderLeaderboard();
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

let _dailyPuzzleCache = null; // { fullSeed, puzzle }

function prewarmDailyPuzzle() {
    const { n, diff, rawSeed, fullSeed } = getDailyConfig();
    const seedInt = seedToInt(rawSeed, n, diff);
    const worker = new Worker('worker.js');
    worker.onmessage = (e) => {
        if (e.data.success) {
            _dailyPuzzleCache = {
                fullSeed,
                solution: e.data.solution,
                cages: e.data.cages,
            };
        }
        worker.terminate();
    };
    worker.onerror = () => worker.terminate();
    worker.postMessage({ n, diff, seed: seedInt });
}

function initDailyButton() {
    const btn = document.getElementById('btn-daily');
    if (!btn) return;

    const { dateKey, fullSeed, n, diff } = getDailyConfig();
    const solvedTime = getDailySolvedTime(dateKey);
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard') };

    if (solvedTime) {
        btn.title = t('daily-solved-title').replace('{time}', solvedTime);
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
        if (solvedTime) setStatus(t('daily-solved-title').replace('{time}', solvedTime));
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
        // renderBoard setzt moveCount = 0, daher hier wiederherstellen
        moveCount = s.moveCount || 0;
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
        // Timer vom gespeicherten Stand weiterführen
        if (timerInterval) clearInterval(timerInterval);
        timerStopped = false;
        timerInterval = setInterval(() => { elapsedSeconds++; updateTimerDisplay(); }, 1000);
        updateTimerDisplay();
        if (s.timerVisible) setTimerVisible(true);
        const moveEl = document.getElementById('move-count');
        if (moveEl) moveEl.textContent = moveCount;
        const mobileMoveEl = document.getElementById('mobile-move-display');
        if (mobileMoveEl) mobileMoveEl.textContent = moveCount;
        updateUndoRedoButtons();
        updateProgress();
        setStatus('spielstand wiederhergestellt.');
        window._isDirty = moveCount > 0;
        // Dropdowns auf wiederhergestellte Größe synchronisieren
        const sizeEl = document.getElementById('size');
        if (sizeEl) {
            sizeEl.value = String(n);
            syncCustomSelect('size', String(n));
            updateDifficultyOptions(n);
        }
        // Seed-ID wiederherstellen
        if (currentPuzzle.seed) setSeedTypewriter(currentPuzzle.seed);
    });
    // Flipper DMD nach Board-Render auf playing setzen
    setTimeout(() => {
        if (currentPuzzle && typeof flipperDMD !== 'undefined') {
            const _p = parseFullSeed(currentPuzzle.seed || '');
            flipperDMD.setState('playing', {
                size: _p ? _p.n : currentPuzzle.solution.length,
                diff: _p ? _p.diff : 'medium',
                seed: currentPuzzle.seed
            });
        }
    }, 200);
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


// ── MUSIK-PLAYER ───────────────────────────────────────────────────

const MUSIC_TRACKS = [
// TRACKS:console
    { file: 'antipodeanwriter-8-bit-legends-ancient-shrine-200457.mp3',                          title: '8 Bit Legends Ancient Shrine',       author: 'Antipodeanwriter' },
    { file: 'brutaldesign-electrical-bee-412311.mp3',                                             title: 'Electrical Bee',                     author: 'Brutaldesign' },
    { file: 'deselect-infebis-8-bit-lo-fi-mix-225330.mp3',                                        title: 'Infebis 8 Bit Lo Fi Mix',            author: 'Deselect' },
    { file: 'dstechnician-psykick-112469.mp3',                                                    title: 'Psykick',                            author: 'Dstechnician' },
    { file: 'dstechnician-thinking-overture-115159.mp3',                                          title: 'Thinking Overture',                  author: 'Dstechnician' },
    { file: 'lesiakower-8-bit-takeover-367276.mp3',                                               title: '8 Bit Takeover',                     author: 'Lesiakower' },
    { file: 'lesiakower-battle-time-178551.mp3',                                                  title: 'Battle Time',                        author: 'Lesiakower' },
    { file: 'lesiakower-bitwise-482792.mp3',                                                      title: 'Bitwise',                            author: 'Lesiakower' },
    { file: 'melodyayresgriffiths-over-the-mountain-chiptune-8-bit-rpg-japan-80s-c64-sid-138354.mp3', title: 'Over The Mountain',              author: 'Melodyayresgriffiths' },
    { file: 'moodmode-8-bit-air-fight-158813.mp3',                                                title: '8 Bit Air Fight',                    author: 'Moodmode' },
    { file: 'moodmode-level-iii-294428.mp3',                                                      title: 'Level III',                          author: 'Moodmode' },
    { file: 'music_for_video-old-computer-game-background-music-for-video-9463.mp3',              title: 'Old Computer Game Background Music', author: 'Music_for_video' },
    { file: 'pixelmaniax-pixeloverdrive-380641.mp3',                                              title: 'Pixeloverdrive',                     author: 'Pixelmaniax' },
    { file: 'pixelmaniax-the-hooded-echo-377417.mp3',                                             title: 'The Hooded Echo',                    author: 'Pixelmaniax' },
    { file: 'suitedfrogds-8-bit-chiptune-2-400593.mp3',                                           title: '8 Bit Chiptune 2',                   author: 'Suitedfrogds' },
    { file: 'syouki_takahashi-samurai-188212.mp3',                                                title: 'Samurai',                            author: 'Syouki_takahashi' },
    { file: 'yukinegames-it-has-just-begun-retroland-456223.mp3',                                 title: 'It Has Just Begun Retroland',        author: 'Yukinegames' },
// END-TRACKS:console
];

const musicPlayer = {
    audio:      null,
    trackIndex: 0,
    playing:    false,
    enabled:    false,
    seekingVol: false,

    init() {
        this.audio = new Audio();
        const savedVol = parseFloat(localStorage.getItem('numori-music-vol'));
        this.audio.volume = (!isNaN(savedVol) && savedVol >= 0 && savedVol <= 1) ? savedVol : 0.55;
        this.trackIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);

        this.audio.addEventListener('ended', () => this.next());

        document.getElementById('music-prev')?.addEventListener('click', () => this.prev());
        document.getElementById('music-play')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('music-next')?.addEventListener('click', () => this.next());
        // stop-button entfernt (play/pause genügt)

        // Lautstärkeregler – Listener auf volWrap (größere Klickfläche)
        const volWrap  = document.querySelector('.music-vol-wrap');
        const volTrack = document.getElementById('music-vol-track');
        if (volWrap && volTrack) {
            this._updateVolUI();
            volWrap.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.seekingVol = true;
                this._setVol(e, volTrack);
            });
            document.addEventListener('mousemove', (e) => { if (this.seekingVol) this._setVol(e, volTrack); });
            document.addEventListener('mouseup',   ()  => { this.seekingVol = false; });
        }

        // Playlist-Button
        const playlistBtn = document.getElementById('music-playlist-btn');
        const playlistEl  = document.getElementById('music-playlist');
        if (playlistBtn && playlistEl) {
            this._buildPlaylist(playlistEl);
            let _skipClose = false;
            playlistBtn.addEventListener('click', () => {
                const open = playlistEl.style.display !== 'none';
                if (!open) {
                    // Position unter dem Button berechnen (fixed braucht Viewport-Koordinaten)
                    const rect = playlistBtn.getBoundingClientRect();
                    playlistEl.style.top  = `${rect.bottom + 6}px`;
                    playlistEl.style.left = 'auto';
                    playlistEl.style.right = `${window.innerWidth - rect.right}px`;
                    playlistEl.style.display = 'flex';
                    playlistEl.style.flexDirection = 'column';
                    playlistBtn.classList.add('active');
                    // Aktiven Track sichtbar scrollen
                    const activeItem = playlistEl.querySelector('.music-playlist-item.active');
                    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
                } else {
                    playlistEl.style.display = 'none';
                    playlistBtn.classList.remove('active');
                }
                _skipClose = true;
            });
            playlistEl.addEventListener('click', () => { _skipClose = true; });
            document.addEventListener('click', () => {
                if (_skipClose) { _skipClose = false; return; }
                playlistEl.style.display = 'none';
                playlistBtn.classList.remove('active');
            });
        }

        // Kein Autostart beim Laden
        this.enabled = true;
        this._loadTrack(false);
        this._updateUI();
    },

    _loadTrack(autoPlay = true) {
        const t = MUSIC_TRACKS[this.trackIndex];
        if (!t) return;
        this.playing = false;
        this.audio.src = `music/console/${t.file}`;
        this.audio.load();
        this._updateUI();
        this._updatePlayIcon();
        if (autoPlay && this.enabled) {
            this.audio.play().then(() => { this.playing = true; this._updatePlayIcon(); }).catch((err) => { console.warn('Autoplay blocked:', err); });
        }
    },

    play() {
        if (!this.enabled) return;
        if (!this.audio.src || this.audio.src === window.location.href) { this._loadTrack(); return; }
        this.audio.play().then(() => { this.playing = true; this._updatePlayIcon(); }).catch(() => {});
    },

    togglePlay() {
        if (!this.enabled) return;
        if (this.playing) {
            this.audio.pause();
            this.playing = false;
            this._updatePlayIcon();
        } else {
            this.audio.play().then(() => {
                this.playing = true;
                this._updatePlayIcon();
            }).catch(() => {});
        }
    },

    stop() {
        if (!this.audio) return;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playing = false;
        this._updatePlayIcon();
    },

    next() {
        this.trackIndex = (this.trackIndex + 1) % MUSIC_TRACKS.length;
        this._loadTrack();
    },

    prev() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            this.trackIndex = (this.trackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
            this._loadTrack();
        }
    },

    _setVol(e, trackEl) {
        const rect = trackEl.getBoundingClientRect();
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.audio.volume = pct;
        localStorage.setItem('numori-music-vol', pct.toFixed(2));
        this._updateVolUI();
    },

    _updateVolUI() {
        const vol   = this.audio ? this.audio.volume : 0.55;
        const pct   = vol * 100;
        const fill  = document.getElementById('music-vol-fill');
        const thumb = document.getElementById('music-vol-thumb');
        if (fill)  fill.style.width  = `${pct}%`;
        if (thumb) thumb.style.left  = `${pct}%`;
        // Mobile-Panel-Vol mitziehen
        const mFill  = document.getElementById('music-mobile-vol-fill');
        const mThumb = document.getElementById('music-mobile-vol-thumb');
        if (mFill)  mFill.style.width = `${pct}%`;
        if (mThumb) mThumb.style.left = `${pct}%`;
    },

    _updatePlayIcon() {
        const icon = document.getElementById('music-play-icon');
        if (!icon) return;
        const pauseSVG = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        const playSVG  = '<polygon points="5 3 19 12 5 21 5 3"/>';
        icon.innerHTML = this.playing ? pauseSVG : playSVG;
        // Mobile-Panel-Icon mitziehen
        const mIcon = document.getElementById('music-mobile-play-icon');
        if (mIcon) mIcon.innerHTML = this.playing ? pauseSVG : playSVG;
    },

    _buildPlaylist(container) {
        container.innerHTML = '';

        const inner = document.createElement('div');
        inner.className = 'music-playlist-inner';

        // Titelleiste
        const titlebar = document.createElement('div');
        titlebar.className = 'music-playlist-titlebar';
        titlebar.innerHTML =
            `<span class="music-playlist-titlebar-text">▌playlist</span>` +
            `<span class="music-playlist-titlebar-count">${MUSIC_TRACKS.length} tracks</span>`;
        inner.appendChild(titlebar);

        // Scrollbarer Body
        const body = document.createElement('div');
        body.className = 'music-playlist-body';

        MUSIC_TRACKS.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = 'music-playlist-item' + (i === this.trackIndex ? ' active' : '');
            item.dataset.index = i;

            const numSpan = document.createElement('span');
            numSpan.className = 'music-playlist-num';
            numSpan.textContent = String(i + 1).padStart(2, '0');

            const playSpan = document.createElement('span');
            playSpan.className = 'music-playlist-play';
            playSpan.textContent = '▶';

            const textSpan = document.createElement('span');
            textSpan.className = 'music-playlist-item-text';
            textSpan.innerHTML =
                `<span class="music-playlist-author">${t.author.toLowerCase()}</span>` +
                `<span class="music-playlist-sep"> · </span>` +
                `<span class="music-playlist-title">${t.title.toLowerCase()}</span>`;

            item.appendChild(numSpan);
            item.appendChild(playSpan);
            item.appendChild(textSpan);

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.trackIndex = i;
                this.enabled = true;
                this._loadTrack();
                const pl = document.getElementById('music-playlist');
                const pb = document.getElementById('music-playlist-btn');
                if (pl) { pl.style.display = 'none'; pl.style.flexDirection = ''; }
                if (pb) pb.classList.remove('active');
            });

            body.appendChild(item);
        });
        inner.appendChild(body);

        container.appendChild(inner);
    },

    _updatePlaylistHighlight() {
        const items = document.querySelectorAll('.music-playlist-item');
        items.forEach((item, i) => {
            item.classList.toggle('active', i === this.trackIndex);
        });
        const active = document.querySelector('.music-playlist-item.active');
        if (active) {
            const body = active.closest('.music-playlist-body');
            if (body) {
                // Innerhalb des scrollbaren Body scrollen
                const itemTop    = active.offsetTop;
                const itemBottom = itemTop + active.offsetHeight;
                if (itemTop < body.scrollTop) body.scrollTop = itemTop;
                else if (itemBottom > body.scrollTop + body.clientHeight)
                    body.scrollTop = itemBottom - body.clientHeight;
            }
        }
    },

    _updateUI() {
        const t = MUSIC_TRACKS[this.trackIndex];
        if (!t) return;
        const author = t.author.toLowerCase();
        const title  = t.title.toLowerCase();

        // Primäre Spans
        const authorEl = document.getElementById('music-author');
        const titleEl  = document.getElementById('music-title');
        if (authorEl) authorEl.textContent = author;
        if (titleEl)  titleEl.textContent  = title;

        // Duplikat-Spans für nahtloses Marquee-Loop
        const authorDup = document.querySelector('.music-author-dup');
        const titleDup  = document.querySelector('.music-title-dup');
        if (authorDup) authorDup.textContent = author;
        if (titleDup)  titleDup.textContent  = title;

        // Marquee-Animation neu kalibrieren
        const inner = document.getElementById('music-marquee-inner');
        if (inner) {
            // 1. Animation stoppen
            inner.style.animationName = 'none';
            inner.style.transform = 'translateX(0)';
            void inner.offsetWidth; // forced reflow
            // 2. Exakte Breite der ersten Hälfte messen (author + sep + title + gap)
            //    getBoundingClientRect ist subpixel-genau, scrollWidth rundet
            const gap    = inner.querySelector('.music-marquee-gap');
            const firstW = gap
                ? gap.getBoundingClientRect().right - inner.getBoundingClientRect().left
                : inner.scrollWidth / 2;
            const speed    = 32; // px/s
            const duration = Math.max(10, firstW / speed);
            inner.style.setProperty('--marquee-shift', `-${firstW}px`);
            inner.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
            // 3. Animation neu starten
            inner.style.transform = '';
            inner.style.animationName = '';
        }

        this._updatePlaylistHighlight();
        this._updateVolUI();

        // Mobile-Panel-Titelanzeige mitziehen
        const mAuthor = document.getElementById('music-mobile-author');
        const mTitle  = document.getElementById('music-mobile-title');
        if (mAuthor) mAuthor.textContent = author;
        if (mTitle)  mTitle.textContent  = title;
    },
};

function initMusicPlayer() {
    const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
    const isMobile  = window.innerWidth <= 600;
    const playerEl  = document.getElementById('music-player');
    if (!playerEl) return;

    // Mobile Musik-Button: nur auf Mobile + Console-Theme
    const mobileMusicBtn = document.getElementById('btn-music-mobile');
    if (mobileMusicBtn) {
        mobileMusicBtn.style.display = (isConsole && isMobile) ? 'flex' : 'none';
    }

    if (isConsole && !isMobile) {
        playerEl.style.display = 'flex';
        // Play-Icon-Zustand synchronisieren
        musicPlayer._updatePlayIcon();
        // Marquee-Animation nach display:flex neu kalibrieren (war ggf. eingefroren)
        requestAnimationFrame(() => {
            const inner = document.getElementById('music-marquee-inner');
            if (inner) {
                inner.style.animationName = 'none';
                inner.style.transform = 'translateX(0)';
                void inner.offsetWidth;
                const gap    = inner.querySelector('.music-marquee-gap');
                const firstW = gap
                    ? gap.getBoundingClientRect().right - inner.getBoundingClientRect().left
                    : inner.scrollWidth / 2;
                const speed    = 32;
                const duration = Math.max(10, firstW / speed);
                inner.style.setProperty('--marquee-shift', `-${firstW}px`);
                inner.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
                inner.style.transform = '';
                inner.style.animationName = '';
            }
        });
    } else {
        // Musik pausieren wenn zu einem anderen Theme gewechselt wird
        if (musicPlayer.audio && musicPlayer.playing) {
            musicPlayer.audio.pause();
            musicPlayer.playing = false;
            musicPlayer._updatePlayIcon();
        }
        playerEl.style.display = 'none';
    }

    // Playlist + mobiles Panel schließen bei Theme-Wechsel
    const pl = document.getElementById('music-playlist');
    if (pl) { pl.style.display = 'none'; pl.style.flexDirection = ''; }
    const mPanel = document.getElementById('music-mobile-panel');
    if (mPanel && !isConsole) mPanel.style.display = 'none';
}

// ── Mobile-Musikplayer Panel verdrahten ───────────────────────────
function initSettingsMusicPlayer() {
    // ── Mobile-Panel Buttons ──────────────────────────────────────
    const mBtn      = document.getElementById('btn-music-mobile');
    const mPanel    = document.getElementById('music-mobile-panel');
    const mPrev     = document.getElementById('music-mobile-prev');
    const mPlay     = document.getElementById('music-mobile-play');
    const mNext     = document.getElementById('music-mobile-next');
    const mVolTrack = document.getElementById('music-mobile-vol-track');

    if (mBtn && mPanel) {
        mBtn.addEventListener('click', () => {
            const open = mPanel.style.display === 'block';
            mPanel.style.display = open ? 'none' : 'block';
        });
    }
    if (mPrev) mPrev.addEventListener('click', () => document.getElementById('music-prev')?.click());
    if (mNext) mNext.addEventListener('click', () => document.getElementById('music-next')?.click());
    if (mPlay) mPlay.addEventListener('click', () => document.getElementById('music-play')?.click());

    if (mVolTrack) {
        const getMEventX = (e) => e.touches ? e.touches[0].clientX : e.clientX;
        mVolTrack.addEventListener('click',      (e) => { if (musicPlayer.audio) musicPlayer._setVol(e, mVolTrack); });
        mVolTrack.addEventListener('touchstart', (e) => { if (musicPlayer.audio) musicPlayer._setVol({ clientX: getMEventX(e) }, mVolTrack); }, { passive: true });
        mVolTrack.addEventListener('touchmove',  (e) => { if (musicPlayer.audio) musicPlayer._setVol({ clientX: getMEventX(e) }, mVolTrack); }, { passive: true });
        mVolTrack.addEventListener('mousedown',  (e) => {
            if (!musicPlayer.audio) return;
            const onMove = (ev) => musicPlayer._setVol(ev, mVolTrack);
            const onUp   = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup',   onUp);
        });
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

function resetTimerState() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    elapsedSeconds = 0;
    timerStopped = false;
    competitiveBlocked = false;
    solvedByCheat = false;
    updateTimerDisplay();
    updateTimerBtn();
}

function updateTimerDisplay() {
    if (!timerVisible) return;
    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = formatTime(elapsedSeconds);
}

// 3b. GEWINN-BANNER
function showWinBanner(timeStr, size, diff, seed, denied=false, isNewBest=false, leaderboardRank=null) {
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard') };
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    const el = (id) => document.getElementById(id);
    if (el('win-stat-size'))  el('win-stat-size').textContent  = `${size}×${size}`;
    if (el('win-stat-diff'))  el('win-stat-diff').textContent  = diffLabels[diff] ?? diff;
    if (el('win-stat-time'))  el('win-stat-time').textContent  = timeStr;
    if (el('win-stat-moves')) el('win-stat-moves').textContent = moveCount;
    if (el('win-stat-seed'))  el('win-stat-seed').textContent  = seed;
    const winBest = el('win-best');
    if (winBest) {
        winBest.textContent = isNewBest ? t('win-new-best') : '';
        winBest.style.display = isNewBest ? '' : 'none';
    }
    const _isFlipperTheme = document.documentElement.getAttribute('data-theme') === 'flipper';
    banner.classList.add('visible');
    _matrixWinData = { size: size+'x'+size, diff, time: timeStr, seed, moves: moveCount, denied, isNewBest };
    startMatrixRain();
    if (_isFlipperTheme) {
        if (denied) flipperSounds.tilt(); else flipperSounds.win();
        flipperDMD.setState(denied ? 'tilt' : 'win', {
            size, diff, time: timeStr, seed,
            moves: moveCount, denied, isNewBest,
            rank: leaderboardRank,
            seconds: elapsedSeconds,
            onNewGame: () => { document.getElementById('btn-new')?.click(); },
            onExit: () => {}
        });
        startFlipperWin();
    }
    const btnSolve = document.getElementById('btn-solve');
    if (btnSolve) btnSolve.disabled = true;
    numpadModule.hide();
}

function hideWinBanner() {
    const banner = document.getElementById('win-banner');
    if (!banner) return;
    banner.classList.remove('visible');
    stopMatrixRain();
    stopFlipperWin();
    if (document.documentElement.getAttribute('data-theme') === 'flipper' && window.innerWidth > 600) {
        if (currentPuzzle) {
            const _p = parseFullSeed(currentPuzzle.seed);
            flipperDMD.setState('playing', { size: _p ? _p.n : currentPuzzle.solution.length, diff: _p ? _p.diff : 'medium', seed: currentPuzzle.seed });
        } else {
            flipperDMD.setState('attract');
        }
    }
    // btn-solve bleibt gesperrt bis newPuzzle() aufgerufen wird
    if (currentPuzzle && numpadModule.isEnabled()) {
        numpadModule.show(currentPuzzle.solution.length);
    }
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
        'time:  '+(d.time||'--:--')+(d.isNewBest ? '  ★ neue bestzeit!' : ''),
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
    let typeLineIdx=0, typeCharIdx=0, typeElapsed=0;
    const TYPE_MS = TYPE_SPEED * MS_PER_TICK;
    let inputActive=false, inputValue='', inputBlink=true, inputBlinkTick=0;

    // Mobile: Touch-Buttons statt Texteingabe
    let mobileButtons = null;
    function createMobileButtons() {
        if (mobileButtons) return;
        mobileButtons = document.createElement('div');
        mobileButtons.style.cssText = 'position:fixed;bottom:80px;left:0;right:0;z-index:100000;display:flex;justify-content:center;gap:16px;padding:0 24px;';
        const btnStyle = 'padding:14px 28px;border:1px solid '+ACCENT+';background:#000;color:'+ACCENT+';font-family:Share Tech Mono,monospace;font-size:0.95em;border-radius:4px;cursor:pointer;letter-spacing:1px;';
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


// FLIPPER SOUNDS
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
        if (initialsKeyHandler) { document.removeEventListener('keydown', initialsKeyHandler); initialsKeyHandler = null; }
        document.getElementById('dmd-mobile-input')?.remove();
    }

    function setupKey() {
        initialsKeyHandler = (e) => {
            const a = document.activeElement;
            if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) return;
            if (e.key === 'Enter') { e.preventDefault(); const n = initialsValue.trim() || t('lb-anon'); stateData.onConfirm?.(n); }
            else if (e.key === 'Escape') stateData.onCancel?.();
            else if (e.key === 'Backspace') { initialsValue = initialsValue.slice(0,-1); e.preventDefault(); }
            else if (e.key.length === 1 && initialsValue.length < 16) initialsValue += e.key;
        };
        document.addEventListener('keydown', initialsKeyHandler);
    }

    const CX    = () => canvas.width / 2;
    const Y_TOP = () => canvas.height * 0.16;
    const Y_MID = () => canvas.height * 0.55;
    const Y_BOT = () => canvas.height * 0.82;

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
            txt('N U M O R I', CX(), (Y_TOP() + Y_MID()) / 2, 44, HI);
            {
                const n  = parseInt(document.getElementById('size')?.value??'4');
                const df = document.getElementById('difficulty')?.value??'medium';
                const dl = {easy:'EASY',medium:'MEDIUM',hard:'HARD'};
                const line = `INSERT COIN  ·  ${n}×${n}  ${dl[df]||''}  ·  PRESS START`;
                ctx.save();
                ctx.font = `18px ${MONO}`; ctx.textBaseline = 'middle';
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
            const diffLabel = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
            const ordinals = ['','1ST','2ND','3RD','4TH','5TH'];
            for (const sz of [3,4,5,6,7,8]) for (const df of ['easy','medium','hard']) {
                const top = lb[sz]?.[df]?.[0];
                if (top) {
                    const m = Math.floor(top.time/60), s = String(top.time%60).padStart(2,'0');
                    entries.push({ cat: `${sz}×${sz}  ${diffLabel[df]}`, name: top.name.toUpperCase(), time: `${m}:${s}` });
                }
            }

            const blink = Math.floor(attractPhaseEl/500)%2===0;
            txt('★  HIGH SCORES  ★', CX(), Y_TOP(), 18, blink ? HI : MED);

            if (entries.length === 0) {
                txt('NO ENTRIES YET', CX(), Y_MID(), 22, LO, MONO);
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
                txt(e.cat, CX(), CAT_Y, 12, LO, MONO);
                ctx.font = `bold 22px ${MONO}`; ctx.textBaseline = 'middle';
                ctx.shadowBlur = 6;
                ctx.textAlign = 'center'; ctx.fillStyle = HI; ctx.shadowColor = HI; ctx.fillText(e.name, CX(), NAME_Y);
                txt(e.time, CX(), TIME_Y, 14, MED, MONO);
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
                txt('YOU GOT', CX(), canvas.height * 0.38, 28, HI);
                txt("RICK ROLL'D", CX(), canvas.height * 0.62, 32, '#ffdd00');
            } else {
                txt('YOU GOT', CX(), canvas.height * 0.38, 28, MED);
                txt("RICK ROLL'D", CX(), canvas.height * 0.62, 28, MED);
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
            ctx.font = `13px ${MONO}`; ctx.textBaseline = 'middle';
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
        const dl = {easy:'EASY',medium:'MEDIUM',hard:'HARD'};

        const PL_TOP = canvas.height * 0.28;
        const PL_MID = canvas.height * 0.65;
        txt(`${d.size||'?'}×${d.size||'?'}  ${dl[d.diff]||''}  ID: ${(d.seed||'').toUpperCase()}`, CX(), PL_TOP, 18, MED, MONO);
        if (canvas.width < 600) {
            txt(`${moveCount} MOVES`, CX(), PL_MID, 40, HI);
        } else {
            const timerTxt = typeof formatTime === 'function' ? formatTime(elapsedSeconds) : '00:00';
            txt(`${timerTxt}  ·  ${moveCount} MOVES`, CX(), PL_MID, 40, HI);
        }
    }

    function buildTally(d, denied) {
        const n   = d.size||4;
        const sb  = (n-2)*100;
        const db  = {easy:50,medium:150,hard:300}[d.diff]||100;
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
                let fs = 40;
                ctx.font = `bold ${fs}px ${MONO}`;
                while (ctx.measureText('T  I  L  T').width > innerW && fs > 10) { fs--; ctx.font = `bold ${fs}px ${MONO}`; }
                ctx.fillText('T  I  L  T', CX(), CY);
            } else {
                // PUZZLE / COMPLETE – zweizeilig, Schrift so groß wie möglich
                let fs = 40;
                ctx.font = `bold ${fs}px ${MONO}`;
                while ((ctx.measureText('COMPLETE').width > innerW || fs * 2.2 > innerH) && fs > 10) { fs--; ctx.font = `bold ${fs}px ${MONO}`; }
                const gap = fs * 1.1;
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
            ctx.globalAlpha = a; txt(titleTxt, CX(), canvas.height*0.5, 44, titleCol); ctx.globalAlpha = 1;
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
            txt(item.l, CX(), canvas.height * 0.5, 24, '#ffcc44');
        } else if (item.isTotal) {
            const val = Math.round(item.v * prog);
            txt('TOTAL', CX(), Y_TOP(), 20, MED, MONO);
            txt(`${val} PTS`, CX(), Y_MID(), 40, HI);
        } else {
            const val = Math.round(Math.abs(item.v)*prog);
            const sign = item.v < 0 ? '-' : '+';
            txt(item.l, CX(), Y_TOP(), 18, MED, MONO);
            txt(`${sign}${val} PTS`, CX(), Y_MID(), 38, item.v < 0 ? '#cc3300' : HI);
        }

        if (idx >= tallyItems.length-1 && prog >= 1 && !winActivated) {
            winActivated = true;
            const d = stateData;
            if (!denied && d.rank != null) {
                // New leaderboard entry → HS fanfare, then initials
                setTimeout(() => setState('highscore', {
                    rank: d.rank, size: d.size, diff: d.diff, seed: d.seed,
                    seconds: d.seconds, onNewGame: d.onNewGame, onExit: d.onExit
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
                txt(denied?'PRESS START TO CONTINUE':'INSERT COIN  ·  PRESS START', CX(), Y_BOT(), 20, HI);
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

        if (stateElapsed < 500) {
            // Flash in
            const a = Math.min(1, stateElapsed/250);
            ctx.globalAlpha = a;
            txt('★  NEW HIGH SCORE  ★', CX(), Y_MID(), 27, '#ffdd00');
            ctx.globalAlpha = 1;
        } else if (stateElapsed < 2800) {
            txt('★  NEW HIGH SCORE  ★', CX(), Y_TOP(), 22, blink ? '#ffdd00' : '#cc9900');
            if (d.rank) {
                const ordinals = ['','1ST','2ND','3RD','4TH','5TH','6TH','7TH','8TH','9TH','10TH'];
                txt(ordinals[d.rank]||`#${d.rank}`, CX(), Y_MID(), 44, rankCol);
                txt('PLACE', CX(), canvas.height * 0.72, 17, MED, MONO);
            }
            // Scroll dots as decorative row
            const dotY = canvas.height * 0.65;
            const offset = (stateElapsed/8) % (DOT*2);
            ctx.fillStyle = blink ? HI : MED;
            for (let x = -DOT*2 + offset; x < canvas.width + DOT*2; x += DOT*2) {
                ctx.beginPath(); ctx.arc(x, dotY, 1.5, 0, Math.PI*2); ctx.fill();
            }
        } else {
            // Prompt for initials
            txt('★  NEW HIGH SCORE  ★', CX(), Y_TOP(), 20, '#cc9900');
            if (blink) txt('ENTER  YOUR  INITIALS', CX(), Y_MID(), 22, HI, MONO);
        }

        if (stateElapsed > 3200 && !winActivated) {
            winActivated = true;
            setState('initials', {
                rank: d.rank,
                onConfirm: (name) => {
                    if (name) localStorage.setItem('numori-player-name', name);
                    insertLeaderboardEntry(name, d.seconds, moveCount, d.size, d.diff, d.seed);
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
        txt('ENTER  INITIALS', CX(), Y_TOP(), 18, MED, MONO);
        // Zeile 2: #n links, NAME zentriert
        if (d.rank) {
            txt(`#${d.rank}`, 12, Y_MID(), 22, rankCol, null, 'left');
        }
        txt((initialsValue+cursor).toUpperCase(), CX(), Y_MID(), 32, '#ffcc44');
        // Zeile 3: Hinweis
        txt('ENTER: OK  ·  ESC: SKIP', CX(), Y_BOT(), 13, OFF, MONO);
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

    return { start, stop, setState };
})();

// FLIPPER WIN SCREEN
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
    const diffBonus= { easy: 50, medium: 150, hard: 300 }[d.diff] || 100;
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
        const diffLabel = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' }[d.diff] || '';
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
                ctx.fillText((initialsValue + cursor).toUpperCase(), CX2, inputY);
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
    // Auf Mobile: kein künstliches Maximum, Board nutzt verfügbaren Platz
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
        return Math.floor(Math.min(w, h));
    }
    // Desktop: Max 78% des kleinsten Viewport-Maßes für Proportionen
    const maxDim = Math.min(window.innerWidth, window.innerHeight) * 0.78;
    return Math.floor(Math.min(w, h, maxDim));
}

// 6. BOARD RENDERN
function getCell(r, c) {
    return document.querySelector(`#board .cell[data-r="${r}"][data-c="${c}"]`);
}

function renderBoard(puzzle) {
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.style.display = 'none';
    buildFlipperTicker();
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

    window._isDirty = false;
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
    const mobileMoveEl = document.getElementById('mobile-move-display');
    if (mobileMoveEl) mobileMoveEl.textContent = '0';
    updateTimerBtn();
    selectCell(0, 0);
    requestAnimationFrame(() => { resizeBoard(); numpadModule.show(n); });

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
    el.style.width  = `${px}px`;
    el.style.height = `${px}px`;
    // Schriftgröße proportional zur Zellgröße
    const n        = currentPuzzle.solution.length;
    const cellPx   = px / n;
    const fontScale = getFontScale();
    document.documentElement.style.setProperty('--cell-value-size', `${Math.round(cellPx * 0.32 * fontScale)}px`);
    document.documentElement.style.setProperty('--cage-label-size', `${Math.round(cellPx * 0.12 * fontScale)}px`);
    document.documentElement.style.setProperty('--note-size', `${Math.round(cellPx * 0.10 * fontScale)}px`);
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
        const hasValue = !!newCell.querySelector('.cell-value')?.textContent;
        const hasNotes = newCell.querySelector('.note.active') !== null;
        if (!hasValue && !hasNotes) {
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
        const hasNotes = cell?.querySelector('.note.active') !== null;
        if (v === 0 && !hasNotes && cell?.classList.contains('selected')) {
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
    // Console-Cursor: ausblenden wenn Notizen vorhanden, einblenden wenn keine mehr
    if (document.documentElement.getAttribute('data-theme') === 'console') {
        const cell = getCell(r, c);
        if (cell?.classList.contains('selected')) {
            cell.querySelector('.cell-cursor')?.remove();
            const hasNotes = cell.querySelector('.note.active') !== null;
            if (!hasNotes) {
                const cursor = document.createElement('div');
                cursor.className = 'cell-cursor';
                cell.appendChild(cursor);
            }
        }
    }
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
    const wasZero = moveCount === 0;
    moveCount = Math.max(0, moveCount + delta);
    if (wasZero && moveCount > 0) window._isDirty = true;
    const el = document.getElementById('move-count');
    if (el) el.textContent = moveCount;
    const mobileEl = document.getElementById('mobile-move-display');
    if (mobileEl) mobileEl.textContent = moveCount;
    updateTimerBtn();
    if (!window.electronAPI) setTimeout(saveGameState, 0);
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
            if (dBtn) { dBtn.dataset.solved = 'true'; dBtn.title = t('daily-solved-title').replace('{time}', dTimeStr); }
        }
        setStatus(t('status-solved').replace('{n}', n));
        const allHints = hintBoard && userBoard.every((row,r)=>row.every((v,c)=>v===0||hintBoard[r][c]));
        const isNewBest = recordSolve(n, diff, elapsedSeconds, moveCount);
        const leaderboardRank = (!competitiveBlocked) ? getLeaderboardRank(elapsedSeconds, n, diff) : null;
        const _isFlipperThemeSolve = document.documentElement.getAttribute('data-theme') === 'flipper';
        if (leaderboardRank !== null && !_isFlipperThemeSolve) {
            const statsOverlay = document.getElementById('stats-overlay');
            statsActiveTab = 'leaderboard';
            renderStatsModal();
            if (statsOverlay) statsOverlay.classList.add('visible');
            showLeaderboardEntryPopup(leaderboardRank, elapsedSeconds, n, diff, currentPuzzle.seed);
        } else {
            showWinBanner(timeStr, n, diff, currentPuzzle.seed, allHints, isNewBest, leaderboardRank);
        }
    }
    updateProgress();
}

// 11. MODI UMSCHALTEN
function setNotesMode(active) {
    notesMode = active;
    if (typeof numpadModule !== 'undefined') numpadModule.syncNotesBtn();
    const btn = document.getElementById('btn-notes');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
}

function setValidationMode(active) {
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
                    ? t('clear-invalid-1')
                    : t('clear-invalid-n').replace('{n}', wrongCount);
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
    if (statusEl) setStatus(changes.length === 1 ? t('status-cleared-1') : t('status-cleared-n').replace('{n}', changes.length));
}


function updateTimerBtn() {
    const btn = document.getElementById('btn-timer');
    if (!btn) return;
    btn.disabled = false;
    btn.title = competitiveBlocked ? t('title-timer-blocked') : t('title-timer');
    btn.style.opacity = competitiveBlocked ? '0.45' : '';
    btn.style.cursor = '';
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
    timerVisible = active;
    const btn = document.getElementById('btn-timer');
    if (btn) btn.dataset.active = active ? 'true' : 'false';
    if (active && currentPuzzle && !timerStopped && timerInterval === null) startTimer();
    const headerTimer = document.getElementById('timer-display-header');
    if (headerTimer) headerTimer.textContent = active ? formatTime(elapsedSeconds) : '';
    if (active) updateTimerDisplay();
    updateTimerBtn();
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
    if (document.getElementById('leaderboard-entry-overlay')?.classList.contains('visible')) return;
    if (typeof tutorialModule !== 'undefined' && tutorialModule.isActive()) return;

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
        case 't':
        case 'T':
            document.getElementById('btn-timer')?.click();
            return;
        case 'h':
        case 'H':
            giveHint();
            return;
        case 'Backspace':
        case 'Delete':
            e.preventDefault();
            setNumber(selected.r, selected.c, 0);
            return;
    }

    // 1-9
    if (/^[1-9]$/.test(e.key)) {
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
    const hintVal = currentPuzzle.solution[r][c];
    userBoard[r][c]  = hintVal;
    notesBoard[r][c].clear();
    hintBoard[r][c]  = true;
    competitiveBlocked = true;
    if (!timerVisible) updateTimerBtn();

    // Kollidierende Notizen in Zeile und Spalte löschen
    const hintN = currentPuzzle.solution.length;
    for (let i = 0; i < hintN; i++) {
        if (i !== c && notesBoard[r][i].has(hintVal)) {
            notesBoard[r][i].delete(hintVal);
            updateNotesDisplay(r, i);
        }
        if (i !== r && notesBoard[i][c].has(hintVal)) {
            notesBoard[i][c].delete(hintVal);
            updateNotesDisplay(i, c);
        }
    }

    const cell    = getCell(r, c);
    const valSpan = cell?.querySelector('.cell-value');
    if (valSpan) valSpan.textContent = String(hintVal);
    cell?.classList.add('hint');
    updateNotesDisplay(r, c);
    selectCell(r, c);
    validateAll();
    commitState(r, c);
}


// 15. INITIALISIERUNG
window.addEventListener('DOMContentLoaded', () => {
    // Statusleiste auf Android ausblenden
    if (window.Capacitor?.isNativePlatform()) {
        window.Capacitor.Plugins.StatusBar?.hide();
    }

    // Mobile: body-Hintergrund auf accent setzen damit kein
    // beiger Streifen hinter der Android-Navigationsleiste sichtbar ist
    if (window.matchMedia('(max-width: 600px)').matches) {
        document.body.style.background = 'var(--accent)';
    }
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

    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard') };

    function newPuzzle(forceSeed = null) {
        clearSavedGame();
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
                sizeEl.dispatchEvent(new Event('change'));
                diffEl.dispatchEvent(new Event('change'));
                syncCustomSelect('size', String(n));
                updateDifficultyOptions(n);
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

        // Cache-Treffer: Tagesrätsel bereits vorausberechnet?
        if (_dailyPuzzleCache && _dailyPuzzleCache.fullSeed === fullSeedStr) {
            const cached = _dailyPuzzleCache;
            _dailyPuzzleCache = null;
            currentPuzzle = { solution: cached.solution, cages: cached.cages, seed: fullSeedStr };
            setNotesMode(false);
            validationActive = false;
            const _vBtn = document.getElementById('btn-validate');
            if (_vBtn) _vBtn.dataset.active = 'false';
            requestAnimationFrame(() => renderBoard(currentPuzzle));
            startTimer();
            setStatus(t('status-loaded').replace('{n}', n).replace('{diff}', diffLabels[diff]));
            if (document.documentElement.getAttribute('data-theme') === 'flipper')
                flipperDMD.setState('playing', { size: n, diff, seed: fullSeedStr });
            btnSolve.disabled = false;
            btnNew.disabled = false;
            btnNew.textContent = t('btn-new');
            return;
        }

        btnNew.disabled = true;
        btnNew.textContent = t('btn-generating');
        setStatus(t('status-generating').replace('{n}', n).replace('{diff}', diffLabels[diff]));

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
                startTimer();
                setStatus(t('status-loaded').replace('{n}', n).replace('{diff}', diffLabels[diff]));
                if (document.documentElement.getAttribute('data-theme') === 'flipper')
                    flipperDMD.setState('playing', { size: n, diff, seed: fullSeedStr });
                btnSolve.disabled = false;
            } else {
                setStatus(t('status-error'));
            }
            btnNew.disabled = false;
            btnNew.textContent = t('btn-new');
        };
        generationWorker.onerror = function(err) {
            generationWorker = null;
            setStatus(t('status-error'));
            console.error(err);
            btnNew.disabled = false;
            btnNew.textContent = t('btn-new');
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
        const mobileMoveEl2 = document.getElementById('mobile-move-display');
        if (mobileMoveEl2) mobileMoveEl2.textContent = '0';
        setStatus(t('status-solve-shown'));
        // Button direkt sperren (validateAll läuft nicht durch weil timerStopped=true)
        btnSolve.disabled = true;
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
    const btnTheme = document.getElementById('btn-theme');
    const themeOverlay = document.getElementById('theme-overlay');
    const themeClose = document.getElementById('theme-close');

    if (btnTheme) btnTheme.addEventListener('click', () => {
        themeOverlay.classList.add('visible');
    });
    if (themeClose) themeClose.addEventListener('click', () => {
        themeOverlay.classList.remove('visible');
    });
    if (themeOverlay) themeOverlay.addEventListener('click', (e) => {
        if (e.target === themeOverlay) themeOverlay.classList.remove('visible');
    });

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
    initLanguage();
    initFontScale();
    initCustomSelects();
    updateDifficultyOptions(parseInt(document.getElementById('size')?.value ?? '4', 10));
    // Change-Listener für klassisches Theme
    document.getElementById('size')?.addEventListener('change', (e) => {
        updateDifficultyOptions(parseInt(e.target.value, 10));
        buildFlipperTicker();
    });
    document.getElementById('difficulty')?.addEventListener('change', () => buildFlipperTicker());
    initDailyButton();
    initStatsModal();
    initLeaderboardEntryModal();
    initDebug();
    prewarmDailyPuzzle(); // Tagesrätsel im Hintergrund vorausberechnen
    tutorialModule.init();
    musicPlayer.init(); // Musik-Player initialisieren (DOM ist hier garantiert bereit)
    initSettingsMusicPlayer(); // Settings-Musiksteuerung verdrahten

    // Gespeicherten Spielstand automatisch laden (falls vorhanden)
    const saved = loadGameState();
    if (saved) {
        restoreGameState(saved);
    }

    const btnPdf = document.getElementById('btn-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', async () => {
            if (!currentPuzzle) return;
            if (window.electronAPI) {
                const n = currentPuzzle.solution.length;
                const diff = document.getElementById('difficulty').value;
                const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard') };
                const pdfMeta = document.getElementById('pdf-meta');
                if (pdfMeta) {
                    pdfMeta.textContent = `${n}×${n}  ·  ${diffLabels[diff]}  ·  ID: ${currentPuzzle.seed}`;
                }
                const result = await window.electronAPI.exportPDF();
                if (result?.success) {
                    setStatus(t('status-pdf'));
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && clearInvalidOverlay?.classList.contains('visible')) {
            e.preventDefault();
            clearInvalidOverlay.classList.remove('visible');
            clearInvalidCells();
        }
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
            setStatus(t('status-reset'));
            selectCell(0, 0);
            history = [];
            redoStack = [];
            moveCount = 0;
            const moveEl = document.getElementById('move-count');
            if (moveEl) moveEl.textContent = '0';
            const mobileMoveEl3 = document.getElementById('mobile-move-display');
            if (mobileMoveEl3) mobileMoveEl3.textContent = '0';
            updateUndoRedoButtons();
        });

        window.addEventListener('resize', () => {
            resizeBoard();
            numpadModule.reposition();
        });

        // Zahlenpad-Toggle
        const btnNumpad = document.getElementById('btn-numpad');
        if (btnNumpad) {
            btnNumpad.dataset.active = numpadModule.isEnabled() ? 'true' : 'false';
            btnNumpad.addEventListener('click', () => {
                const active = numpadModule.toggle();
                btnNumpad.dataset.active = active ? 'true' : 'false';
            });
        }

        // ── AUTO-UPDATER ──────────────────────────────────────────────
        if (window.electronAPI) {
            window.electronAPI.onUpdateAvailable((version) => {
                showUpdateBanner(
                    `Version ${version} verfügbar.`,
                    'download',
                    version
                );
            });
            window.electronAPI.onUpdateDownloaded((version) => {
                showUpdateBanner(
                    `Version ${version} bereit.`,
                    'install',
                    version
                );
            });
        }

        // ── AUTO-SAVE beim Schließen (Webversion) ─────────────────────
        // In Electron übernimmt main.js den Speicher-Dialog.
        // Im Browser / auf Mobilgeräten wird der Stand beim Backgrounding
        // gespeichert, damit er beim nächsten Öffnen wiederhergestellt wird.
        if (!window.electronAPI) {
            window.addEventListener('beforeunload', () => { saveGameState(); });
            // visibilitychange ist auf Android/iOS deutlich zuverlässiger als beforeunload
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && currentPuzzle && !timerStopped) saveGameState();
            });
            // Capacitor-natives App-Lifecycle-Event (Android/iOS)
            if (window.Capacitor?.isNativePlatform()) {
                window.Capacitor.Plugins.App?.addListener('appStateChange', (state) => {
                    if (!state.isActive) saveGameState();
                });
            }
        }
});

// ── Leaderboard ──────────────────────────────────────────────────────

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

function getLeaderboardRank(seconds, size, difficulty) {
    const lb = loadLeaderboard();
    const entries = lb[size]?.[difficulty] ?? [];
    const rank = entries.findIndex(e => seconds < e.time || (seconds === e.time && moveCount < e.moves));
    if (rank === -1) return entries.length < 5 ? entries.length + 1 : null;
    return rank + 1;
}

function insertLeaderboardEntry(name, seconds, moves, size, difficulty, seed) {
    const lb = loadLeaderboard();
    if (!lb[size]) lb[size] = {};
    if (!lb[size][difficulty]) lb[size][difficulty] = [];
    const entries = lb[size][difficulty];
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2,'0')}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getFullYear()).slice(-2)}`;
    const insertedName = name.trim() || t('lb-anon');
    entries.push({ name: insertedName, time: seconds, moves, seed, date: dateStr });
    entries.sort((a, b) => a.time - b.time || a.moves - b.moves);
    if (entries.length > 5) entries.length = 5;
    const newIdx = entries.findIndex(e => e.time === seconds && e.name === insertedName && e.moves === moves && e.seed === seed);
    _newLeaderboardEntry = { size, difficulty, idx: newIdx };
    lb[size][difficulty] = entries;
    saveLeaderboardData(lb);
    buildFlipperTicker();
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

function showLeaderboardEntryPopup(rank, seconds, size, difficulty, seed) {
    const overlay = document.getElementById('leaderboard-entry-overlay');
    if (!overlay) return;
    if (document.documentElement.getAttribute('data-theme') === 'flipper' && window.innerWidth > 600) {
        flipperDMD.setState('initials', {
            rank,
            onConfirm: (name) => {
                if (name) localStorage.setItem('numori-player-name', name);
                insertLeaderboardEntry(name, seconds, moveCount, size, difficulty, seed);
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
    const diffLabels = { easy: t('diff-easy'), medium: t('diff-medium'), hard: t('diff-hard') };
    const titleEl   = document.getElementById('lb-entry-title');
    const infoEl    = document.getElementById('lb-entry-info');
    const nameInput = document.getElementById('lb-entry-name');
    const medalEl   = document.getElementById('lb-entry-medal');
    const modal     = overlay.querySelector('.lb-entry-modal');

    if (medalEl) {
        medalEl.textContent = String(rank);
        medalEl.style.animation = 'none';
        void medalEl.offsetWidth;
        medalEl.style.animation = '';
    }
    if (modal) modal.dataset.rank = rank <= 3 ? rank : 'other';
    if (titleEl) titleEl.textContent = t('lb-entry-title').replace('{rank}', rank);
    if (infoEl)  infoEl.textContent  = `${size}×${size} · ${diffLabels[difficulty] ?? difficulty} · ${formatTime(seconds)}`;
    if (nameInput) {
        nameInput.value       = localStorage.getItem('numori-player-name') || '';
        nameInput.placeholder = t('lb-name-placeholder');
    }
    overlay._pending = { seconds, moves: moveCount, size, difficulty, seed };
    overlay.classList.add('visible');
    launchConfetti();
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
}

function initLeaderboardEntryModal() {
    const overlay    = document.getElementById('leaderboard-entry-overlay');
    if (!overlay) return;
    const nameInput  = document.getElementById('lb-entry-name');
    const confirmBtn = document.getElementById('lb-entry-confirm');
    const cancelBtn  = document.getElementById('lb-entry-cancel');

    function submitEntry() {
        const name = (nameInput?.value || '').trim();
        if (name) localStorage.setItem('numori-player-name', name);
        const p = overlay._pending;
        if (p) {
            insertLeaderboardEntry(name, p.seconds, p.moves, p.size, p.difficulty, p.seed);
            statsActiveTab = 'leaderboard';
            renderStatsModal();
        }
        overlay.classList.remove('visible');
        overlay._pending = null;
    }

    if (confirmBtn) confirmBtn.addEventListener('click', submitEntry);
    if (cancelBtn)  cancelBtn.addEventListener('click', () => {
        overlay.classList.remove('visible');
        overlay._pending = null;
    });
    if (nameInput) nameInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') submitEntry();
        if (e.key === 'Escape') { overlay.classList.remove('visible'); overlay._pending = null; }
    });
}

function saveToLeaderboard(seconds, size, difficulty, seed) {
    const rank = getLeaderboardRank(seconds, size, difficulty);
    if (rank === null) return;
    showLeaderboardEntryPopup(rank, seconds, size, difficulty, seed);
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
    closeBtn.title = 'Schließen';
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
        btnYes.textContent = 'Herunterladen';
        btnYes.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.startUpdateDownload();
            msg.textContent = `Version ${version} wird heruntergeladen…`;
            buttons.innerHTML = '';

            // Ladebalken nur im Console-Theme
            if (document.documentElement.getAttribute('data-theme') === 'console') {
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
            }
        });

        const btnNo = document.createElement('button');
        btnNo.className = 'update-banner-btn update-banner-btn--ghost';
        btnNo.textContent = 'Später';
        btnNo.addEventListener('click', () => banner.classList.remove('visible'));

        buttons.appendChild(btnYes);
        buttons.appendChild(btnNo);
    }

    if (mode === 'install') {
        const btn = document.createElement('button');
        btn.className = 'update-banner-btn';
        btn.textContent = 'Jetzt neu starten';
        btn.addEventListener('click', () => {
            if (window.electronAPI) window.electronAPI.installUpdateNow();
        });
        buttons.appendChild(btn);
    }

    inner.appendChild(buttons);
    banner.appendChild(inner);

    banner.classList.add('visible');
}
// ── TUTORIAL ──────────────────────────────────────────────────────
const tutorialModule = (() => {
    let slide = 0;
    let board = null;
    let sel   = null;
    let _active = false;

    const SOL = [[1,2,3],[2,3,1],[3,1,2]];
    const CID = [[0,1,1],[0,2,3],[4,2,3]]; // Cage-ID pro Zelle
    const LABELS = {'0,0':'3+','0,1':'5+','1,1':'4+','1,2':'3+','2,0':'3'};

    function getSlides() {
        return [
            { title: t('tut-slide1-title'), body: t('tut-slide1-body') },
            { title: t('tut-slide2-title'), body: t('tut-slide2-body') },
            { title: t('tut-slide3-title'), body: t('tut-slide3-body') },
        ];
    }

    function hasCageNb(r, c, dr, dc) {
        const nr = r+dr, nc = c+dc;
        if (nr<0||nr>2||nc<0||nc>2) return false;
        return CID[r][c] === CID[nr][nc];
    }

    function gcell(r, c) {
        return document.querySelector(`#tut-board .tcell[data-r="${r}"][data-c="${c}"]`);
    }

    function buildBoard() {
        board = [[0,0,0],[0,0,0],[0,0,0]];
        sel   = null;
        const el = document.getElementById('tut-board');
        if (!el) return;
        el.innerHTML = '';
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cell = document.createElement('div');
                cell.className = 'tcell';
                cell.dataset.r = r; cell.dataset.c = c;
                if (!hasCageNb(r,c,-1, 0)) cell.classList.add('ct');
                if (!hasCageNb(r,c, 0, 1)) cell.classList.add('cr');
                if (!hasCageNb(r,c, 1, 0)) cell.classList.add('cb');
                if (!hasCageNb(r,c, 0,-1)) cell.classList.add('cl');
                const lbl = LABELS[`${r},${c}`];
                if (lbl) {
                    const s = document.createElement('span');
                    s.className = 'tcell-lbl'; s.textContent = lbl;
                    cell.appendChild(s);
                }
                const vs = document.createElement('span');
                vs.className = 'tcell-val';
                cell.appendChild(vs);
                cell.addEventListener('click', () => selCell(r, c));
                el.appendChild(cell);
            }
        }
    }

    function selCell(r, c) {
        document.querySelectorAll('#tut-board .tcell.tsel').forEach(el => el.classList.remove('tsel'));
        sel = {r, c};
        gcell(r, c)?.classList.add('tsel');
        syncNumpad();
    }

    function syncNumpad() {
        const v = sel ? board[sel.r][sel.c] : 0;
        document.querySelectorAll('#tut-numpad .tnpb').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.v) === v);
        });
    }

    function setVal(v) {
        if (!sel) return;
        const {r, c} = sel;
        board[r][c] = v;
        const vs = gcell(r,c)?.querySelector('.tcell-val');
        if (vs) vs.textContent = v ? String(v) : '';
        gcell(r,c)?.classList.remove('terror');
        syncNumpad();
        checkWin();
    }

    function checkWin() {
        if (!board.every(row => row.every(v => v !== 0))) return;
        const ok = board.every((row, r) => row.every((v, c) => v === SOL[r][c]));
        if (ok) { setTimeout(showSuccess, 400); return; }
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++)
                if (board[r][c] !== SOL[r][c]) gcell(r,c)?.classList.add('terror');
    }

    function showSuccess() {
        document.getElementById('tut-puzzle').style.display  = 'none';
        document.getElementById('tut-success').style.display = 'flex';
    }

    function renderSlide() {
        const slides = getSlides();
        const s = slides[slide];
        const isConsole = document.documentElement.getAttribute('data-theme') === 'console';
        const titleEl = document.getElementById('tut-stitle');
        const bodyEl = document.getElementById('tut-sbody');
        if (titleEl) titleEl.textContent = isConsole ? s.title.toLowerCase() : s.title;
        if (bodyEl) bodyEl.innerHTML  = s.body;
        document.querySelectorAll('.tut-dot').forEach((d, i) => d.classList.toggle('active', i === slide));
        const back = document.getElementById('tut-back');
        if (back) back.style.visibility = slide === 0 ? 'hidden' : 'visible';
        const next = document.getElementById('tut-next');
        if (next) next.textContent = slide === slides.length - 1 ? t('tut-next-last') : t('tut-next');
    }

    function show() {
        _active = true; slide = 0;
        const ov = document.getElementById('tut-overlay');
        if (!ov) return;
        document.getElementById('tut-slides').style.display  = 'flex';
        document.getElementById('tut-puzzle').style.display  = 'none';
        document.getElementById('tut-success').style.display = 'none';
        renderSlide();
        ov.classList.add('visible');
    }

    function hide() {
        _active = false;
        document.getElementById('tut-overlay')?.classList.remove('visible');
        localStorage.setItem('numori-tutorial-seen', 'true');
    }

    function isActive() { return _active; }

    function init() {
        // Erster Start → Abfrage anzeigen
        if (!localStorage.getItem('numori-tutorial-seen')) {
            document.getElementById('tut-welcome')?.classList.add('visible');
            document.getElementById('tut-w-yes')?.addEventListener('click', () => {
                document.getElementById('tut-welcome').classList.remove('visible');
                localStorage.setItem('numori-tutorial-seen', 'true');
            });
            document.getElementById('tut-w-no')?.addEventListener('click', () => {
                document.getElementById('tut-welcome').classList.remove('visible');
                show();
            });
        }

        // Tutorial-Button in den Einstellungen
        document.getElementById('btn-tutorial')?.addEventListener('click', () => {
            document.getElementById('settings-overlay')?.classList.remove('visible');
            show();
        });

    // Über Numori / Impressum
    document.getElementById('btn-about')?.addEventListener('click', () => {
        document.getElementById('settings-overlay')?.classList.remove('visible');
        document.getElementById('about-overlay')?.classList.add('visible');
    });
    document.getElementById('about-close')?.addEventListener('click', () => {
        document.getElementById('about-overlay')?.classList.remove('visible');
    });

        // Slide-Navigation
        document.getElementById('tut-back')?.addEventListener('click', () => {
            if (slide > 0) { slide--; renderSlide(); }
        });
        document.getElementById('tut-next')?.addEventListener('click', () => {
            if (slide < getSlides().length - 1) { slide++; renderSlide(); }
            else {
                document.getElementById('tut-slides').style.display = 'none';
                document.getElementById('tut-puzzle').style.display = 'flex';
                buildBoard();
            }
        });

        document.querySelectorAll('.tut-skip').forEach(btn => btn.addEventListener('click', hide));
        document.getElementById('tut-finish')?.addEventListener('click', hide);

        // Mini-Numpad
        document.getElementById('tut-numpad')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.tnpb');
            if (!btn || !sel) return;
            const v = parseInt(btn.dataset.v);
            if (!isNaN(v)) setVal(v > 0 && board[sel.r][sel.c] === v ? 0 : v);
        });

        // Tastatur – Capture-Phase damit der Haupt-Handler nicht feuert
        document.addEventListener('keydown', (e) => {
            if (!_active) return;
            if (document.getElementById('tut-puzzle')?.style.display === 'none') return;
            if (!sel) return;
            const v = parseInt(e.key);
            if (v >= 1 && v <= 3) { e.preventDefault(); e.stopImmediatePropagation(); setVal(v); return; }
            if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); e.stopImmediatePropagation(); setVal(0); return; }
            if (e.key === 'ArrowRight') { e.preventDefault(); e.stopImmediatePropagation(); selCell(sel.r, Math.min(2, sel.c+1)); return; }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); e.stopImmediatePropagation(); selCell(sel.r, Math.max(0, sel.c-1)); return; }
            if (e.key === 'ArrowDown')  { e.preventDefault(); e.stopImmediatePropagation(); selCell(Math.min(2, sel.r+1), sel.c); return; }
            if (e.key === 'ArrowUp')    { e.preventDefault(); e.stopImmediatePropagation(); selCell(Math.max(0, sel.r-1), sel.c); }
        }, true);
    }

    return { show, hide, init, isActive };
})();

// ── Zahlenpad-Overlay ─────────────────────────────────────────────
const numpadModule = (() => {
    let overlay, pad, grid, clearBtn;
    let currentScale = 1.0;


    function init() {
        overlay  = document.getElementById('numpad-overlay');
        pad      = document.getElementById('numpad');
        grid     = document.getElementById('numpad-grid');
        clearBtn = document.getElementById('numpad-clear');
        if (!overlay || !pad || !grid || !clearBtn) return;

        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof setNumber === 'function' && typeof selected !== 'undefined')
                setNumber(selected.r, selected.c, 0);
        });

        const notesBtn = document.getElementById('numpad-notes');
        if (notesBtn) {
            notesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof setNotesMode === 'function')
                    setNotesMode(!notesMode);
                syncNotesBtn();
            });
        }

        // Drag-Logik
        const titlebar = document.getElementById('numpad-titlebar');
        if (titlebar) {
            let dragX = 0, dragY = 0;
            function startDrag(clientX, clientY) {
                dragX = clientX - overlay.getBoundingClientRect().left;
                dragY = clientY - overlay.getBoundingClientRect().top;
            }
            function moveDrag(clientX, clientY) {
                let left = clientX - dragX;
                let top  = clientY - dragY;
                left = Math.max(0, Math.min(left, window.innerWidth  - overlay.offsetWidth));
                top  = Math.max(0, Math.min(top,  window.innerHeight - overlay.offsetHeight));
                overlay.style.left = left + 'px';
                overlay.style.top  = top  + 'px';
                overlay._leftPct = left / window.innerWidth;
                overlay._topPct  = top  / window.innerHeight;
                localStorage.setItem('numori-numpad-pos', JSON.stringify({
                    leftPct: overlay._leftPct, topPct: overlay._topPct
                }));
            }
            titlebar.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startDrag(e.clientX, e.clientY);
                function onMove(e) { moveDrag(e.clientX, e.clientY); }
                function onUp() {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup',   onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup',   onUp);
            });
            titlebar.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const t = e.touches[0];
                startDrag(t.clientX, t.clientY);
                function onMove(e) { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }
                function onEnd() {
                    titlebar.removeEventListener('touchmove', onMove);
                    titlebar.removeEventListener('touchend',  onEnd);
                }
                titlebar.addEventListener('touchmove', onMove, { passive: false });
                titlebar.addEventListener('touchend',  onEnd);
            }, { passive: false });
        }

        // Resize-Logik (uniform scale)
        const resizeHandle = document.getElementById('numpad-resize');
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const startX     = e.clientX;
                const startY     = e.clientY;
                const startScale = currentScale;
                const startDiag  = Math.sqrt(startX * startX + startY * startY);
                function onMove(e) {
                    const diag  = Math.sqrt(e.clientX * e.clientX + e.clientY * e.clientY);
                    const delta = (e.clientX - startX + e.clientY - startY) / 200;
                    currentScale = Math.max(0.6, Math.min(3.0, startScale + delta));
                    pad.style.transform       = `scale(${currentScale})`;
                    pad.style.transformOrigin = 'top left';
                    localStorage.setItem('numori-numpad-scale', currentScale);
                }
                function onUp() {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup',   onUp);
                }
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup',   onUp);
            });
        }
    }

    function buildButtons(n) {
        grid.innerHTML = '';
        const cols = n <= 6 ? 3 : 4;
        grid.style.gridTemplateColumns = `repeat(${cols}, 38px)`;
        for (let v = 1; v <= n; v++) {
            const btn = document.createElement('button');
            btn.className = 'numpad-btn';
            btn.textContent = String(v);
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof selected === 'undefined') return;
                if (notesMode && typeof toggleNote === 'function') {
                    toggleNote(selected.r, selected.c, v);
                } else if (typeof setNumber === 'function') {
                    setNumber(selected.r, selected.c, v);
                }
            });
            grid.appendChild(btn);
        }
    }

    function _numpadKey() {
        return window.matchMedia('(max-width: 600px)').matches
            ? 'numori-numpad-mobile'
            : 'numori-numpad-desktop';
    }
    // Migration: war der Key bisher unter dem jeweils anderen Schlüssel gespeichert
    // (passiert wenn die App erstmals mit dem korrigierten Key-Splitting geöffnet wird),
    // wird der Wert einmalig übernommen und unter dem neuen Key gespeichert.
    (function migrateNumpadKey() {
        const key = _numpadKey();
        if (localStorage.getItem(key) !== null) return; // bereits gesetzt, nichts tun
        const otherKey = key === 'numori-numpad-desktop' ? 'numori-numpad-mobile' : 'numori-numpad-desktop';
        const otherVal = localStorage.getItem(otherKey);
        if (otherVal !== null) localStorage.setItem(key, otherVal);
    })();
    let enabled = localStorage.getItem(_numpadKey()) === 'true';

    function syncNotesBtn() {
        const notesBtn = document.getElementById('numpad-notes');
        if (notesBtn) notesBtn.dataset.active = notesMode ? 'true' : 'false';
    }

    function _applyPosition() {
        // Setzt Position anhand gespeicherter Prozentwerte
        // Muss nach display:block aufgerufen werden damit offsetWidth bekannt ist
        const savedPos = JSON.parse(localStorage.getItem('numori-numpad-pos') || 'null');
        let leftPct = savedPos ? savedPos.leftPct : null;
        let topPct  = savedPos ? savedPos.topPct  : null;

        if (leftPct === null) {
            // Default: rechts neben dem Board
            const board = document.getElementById('board');
            const rect  = board ? board.getBoundingClientRect() : null;
            leftPct = rect ? (rect.right + 16) / window.innerWidth  : 0.7;
            topPct  = rect ? rect.top          / window.innerHeight : 0.2;
        }

        const left = Math.max(0, Math.min(leftPct * window.innerWidth,  window.innerWidth  - overlay.offsetWidth));
        const top  = Math.max(0, Math.min(topPct  * window.innerHeight, window.innerHeight - overlay.offsetHeight));
        overlay.style.left  = left + 'px';
        overlay.style.top   = top  + 'px';
        overlay._leftPct    = leftPct;
        overlay._topPct     = topPct;
    }

    function show(n) {
        if (!overlay || !enabled) return;
        buildButtons(n);
        syncNotesBtn();

        // Scale wiederherstellen
        const savedScale = parseFloat(localStorage.getItem('numori-numpad-scale') || '1');
        if (!isNaN(savedScale) && savedScale !== 1) {
            currentScale = savedScale;
            pad.style.transform       = `scale(${currentScale})`;
            pad.style.transformOrigin = 'top left';
        }

        const isMobile = window.matchMedia('(max-width: 600px)').matches;
        overlay.classList.toggle('numpad-overlay--mobile', isMobile);

        overlay.style.display = 'block';

        if (isMobile) {
            // Mobile: CSS-Klasse übernimmt Layout – JS-Inline-Styles leeren
            overlay.style.left   = '';
            overlay.style.top    = '';
            overlay.style.right  = '';
            overlay.style.bottom = '';
            overlay.style.width  = '';

            // Bottom Nav auf gleiche Höhe wie Numpad setzen
            requestAnimationFrame(() => {
                const numpadH = overlay.offsetHeight;
                const bottomNav = document.querySelector('.mobile-bottom-nav');
                if (bottomNav && numpadH > 0) {
                    const safeBottom = parseInt(getComputedStyle(document.documentElement)
                        .getPropertyValue('--sab') || '0') || 0;
                    bottomNav.style.height = `${numpadH}px`;
                    // Numpad direkt über Bottom Nav positionieren
                    overlay.style.bottom = `${numpadH}px`;
                }
            });
        } else {
            // Desktop: frei positionierbares Overlay via JS
            _applyPosition();
        }
    }

    function hide() {
        if (overlay) overlay.style.display = 'none';
        const bottomNav = document.querySelector('.mobile-bottom-nav');
        if (bottomNav) bottomNav.style.height = '';
    }

    function toggle() {
        enabled = !enabled;
        localStorage.setItem(_numpadKey(), String(enabled));
        if (enabled && currentPuzzle) {
            show(currentPuzzle.solution.length);
        } else if (!enabled) {
            hide();
        }
        return enabled;
    }

    function isEnabled() { return enabled; }

    function reposition() {
        if (!overlay || overlay.style.display === 'none') return;
        if (window.matchMedia('(max-width: 600px)').matches) return; // Mobile: CSS übernimmt
        if (overlay._leftPct === undefined) return;
        let left = overlay._leftPct * window.innerWidth;
        let top  = overlay._topPct  * window.innerHeight;
        left = Math.max(0, Math.min(left, window.innerWidth  - overlay.offsetWidth));
        top  = Math.max(0, Math.min(top,  window.innerHeight - overlay.offsetHeight));
        overlay.style.left = left + 'px';
        overlay.style.top  = top  + 'px';
    }

    return { init, show, hide, toggle, isEnabled, syncNotesBtn, reposition };
})();
// selectCell bleibt unverändert – Numpad wird über renderBoard ein/ausgeblendet

// Numpad initialisieren sobald DOM bereit
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => numpadModule.init());
} else {
    numpadModule.init();
}

// Fokus nach Button-Klick sofort aufheben (verhindert Browser-Focus-Ring)
document.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn) btn.blur();
}, true);
