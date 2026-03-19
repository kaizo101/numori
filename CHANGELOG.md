# Changelog

## v1.0.0 — 2026-03-19

### New
- **Android APK** — first public APK release via Capacitor
- **Flipper theme** — full pinball arcade theme with DMD display (attract, playing, win, tilt, highscore and initials flow), coin slot, scrolling ticker with high scores, Flipper-specific font (Bitcount Grid Single)
- **Local leaderboard** — top entries per grid size and difficulty with name, time, moves and date; gold/silver/bronze ranking; name entry after high score incl. Flipper DMD integration
- **DE/EN localization** — full localization of all UI texts; automatic language detection; manually switchable in settings
- **Statistics & leaderboard as tabs** — combined in a single modal instead of separate views
- **Mobile status bar** — shows puzzle ID, move counter and copy button for quick puzzle ID sharing
- **Confetti animation** on win
- **Imprint & privacy notice** — section in settings; privacy notice confirms local-only storage with no data transmission

### Changes
- **Competitive mode** — removed from development; replaced by the local leaderboard, which automatically tracks and ranks fair runs (no validation or hints used)

### Licenses
Bitcount Grid Single (`assets/fonts/BitcountGridSingle-Regular.ttf`) — used in the Flipper theme.
License: **SIL Open Font License 1.1** — Copyright © 2024 Petr van Blokland

---

## v0.9.2 — 2026-03-12

### New
- **Music player on mobile** — music panel in the more menu (Console theme); play/pause, next/previous, volume and track display
- **Auto-save on close** — game state is automatically saved in the web version when the tab is closed or the page is left

### Improvements
- Number pad on mobile revised — optimized layout and presentation for small screens

---

## v0.9.1 — 2026-03-11

### New
- **Mobile layout** *(Preview)* — optimized layout for smartphones (≤ 600px): compact top toolbar with size, difficulty, puzzle ID and daily puzzle; fixed bottom nav with notes, hint, undo, redo and more menu
- **Seed modal** — puzzle ID input on mobile as modal instead of text field; shows the current puzzle ID
- **Puzzle ID above the board** — current ID is shown in the top left on mobile
- **Number pad auto-open** — opens automatically on mobile when a puzzle is started
- **Matrix win screen on mobile** — touch buttons instead of keyboard input; animation is now time-based (consistent across all devices and frame rates)

### Improvements
- Cage labels and notes on mobile 40% larger
- Difficulty dropdown on mobile now adjusts correctly when grid size changes
- Minimum window size in Electron set to 900×600 (prevents accidental mobile layout activation)

### Bug Fixes
- Mobile bottom nav in Console theme had green background instead of black
- Console theme vignette overlay was covering mobile elements

---

## v0.9.0 — 2026-03-10

### New
- **Music player** (Console theme) — 17 royalty-free chiptune tracks; play/pause, next/previous, volume control; scrollable playlist with track selection; marquee animation for artist and title; volume saved in localStorage
- **Number pad overlay** — freely positionable and scalable number pad; notes mode toggle directly in the pad; position and scale saved in localStorage; toggleable via toolbar button
- **Statistics** — modal with best time, average time, best moves and number of solved puzzles per size and difficulty; reset option; statistics saved in localStorage
- **Interactive tutorial** — 3 explanation slides (game rules, cages & operations, useful features) followed by a playable 3×3 puzzle; on first launch the user is asked whether to skip the tutorial; accessible at any time via settings; theme-specific design
- **Automatic updates** — update check on launch via `electron-updater`; non-intrusive banner with download and install option; installation on next restart
- **GitHub Pages** — Numori is available at [kaizo101.github.io/numori](https://kaizo101.github.io/numori) as a web version

### Improvements
- **Difficulty model** revised: `maxSingleRatio` for Easy reduced from 40% to 20% (fewer free cells); multiplication in Medium restricted to 2-cell cages (prevents brutally hard large cages); size-dependent op weights for Medium (3+ cell cages always addition, 2-cell cages balanced `+/-/*`); dead soft-cap code (`targetAvgSize`) removed
- **Header and toolbar** now scale correctly with window size (clamp values with v0.8 minimum)
- **Toolbar** revised — theme switcher, statistics and settings as separate buttons in the top right
- Cage border radii for corner cells in the Dark theme

### Bug Fixes
- `saveGameState` was incorrectly resetting the daily mode state (copy-paste error)
- Undo was increasing the move counter instead of leaving it unchanged
- `#btn-load-seed` had a hardcoded height and overflowed the seed input field on large windows

---

## v0.8.0 — 2026-03-04

### New
- **Console theme** — retro CRT aesthetic with phosphor-green text (VT323/Share Tech Mono), scanlines on toolbar, board and welcome screen, typewriter status bar and typewriter animation in the seed input field
- **Matrix win screen** (Console) — animated completion screen with Matrix rain, flash, fly-in and typewriter phases; shows size, difficulty, time, moves and seed. ACCESS GRANTED for correct solution, ACCESS DENIED for hint-only solution
- **Daily puzzle** — daily changing puzzle, deterministically generated from the date; ascending weekly schedule (Mon: 4×4 Easy → Sun: 6×6 Hard); best time saved locally; calendar icon in toolbar shows solved status
- **Save game state** — on closing the app, the user is asked whether to save the current state; automatically resumed on next launch
- **3-2-1 countdown** — starts when beginning a new puzzle in competitive mode; board is locked during countdown; theme-specific design
- **Error display** — appears when all cells are filled but the solution is incorrect; theme-specific (Console: red ERROR screen, Dark: dark modal, Classic: light modal)
- **Moves in win banner** — move counter is now also shown in the completion banner

### Improvements
- Validation mode is automatically reset when starting a new puzzle
- When instant validation is activated, the user is offered to automatically clear all incorrect digits
- Move counter revised
- Info popup in Console theme revised (scanlines, border)
- Modal windows in Console theme consistently lowercase

---

## v0.7.0 — 2026-03-02

### New
- **PDF export** — puzzles can be saved as a blank A4 PDF (for printing). The export includes grid size, difficulty and puzzle ID as a header. Always in the classic look, regardless of the active theme.
- **Theme system** — two designs selectable via the settings menu (gear button in header):
  - **Classic** — the previous warm design
  - **Numori Dark** — modern dark design in the style of the app icon. Uses the Poppins font (SIL Open Font License, see below), rounded corners and a blue-grey colour palette. The selected setting is saved.
- **Version number** visible in the header.
- **Timer** now prominently placed in the top right of the game area.

### Improvements
- **Win banner** completely revised — in the classic theme white/inverted with header blue, in Numori Dark with gold accents, SVG trophy and statistics bar.
- **Toolbar icons** switched to system-independent SVGs (previously emojis, which looked different on each OS).
- **Custom dropdowns** in Numori Dark theme — rounded, with Poppins font and smooth open animation.
- **Info popup** (difficulty) in the classic theme inverted — white background, dark text.
- **Competitive mode** can now only be activated when the puzzle is still empty and neither hints nor validation have been used. The lock is reset for each new puzzle.

### Bug Fixes
- Validation and hint cells were coloured black in the classic theme.
- Loading a puzzle ID no longer correctly jumped the dropdowns to the right size and difficulty.

---

## v0.6.0 and earlier

See previous release notes.

---

## Third-party Licenses

### Poppins
Used in the Numori Dark theme (`assets/fonts/Poppins-Medium.ttf`, `assets/fonts/Poppins-Italic.ttf`).

License: **SIL Open Font License 1.1**
Copyright: © 2014–2020 Indian Type Foundry

The full license file is located at `assets/fonts/OFL.txt`.
The SIL OFL permits free use, redistribution and embedding in commercial products, as long as the font is not sold on its own and the license file is included.

Further information: https://scripts.sil.org/OFL

### Lucide Icons
Used in the toolbar (inline SVG).

License: **ISC License**
Copyright: © 2022 Lucide Contributors

The ISC License permits free use and redistribution without further conditions.
