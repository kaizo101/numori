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
