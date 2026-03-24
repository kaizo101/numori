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
