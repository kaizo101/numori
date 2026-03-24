// ── MUSIC PLAYER ─────────────────────────────────────────────────
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
