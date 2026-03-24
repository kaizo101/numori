# Numori

Numori is a free, ad-free logic puzzle game — similar to Sudoku, but with arithmetic operations.
Fill the grid so that every row and column contains each number exactly once, and every cage reaches its target value.

![Numori – Classic Theme](screenshot.png)

---

## Web Version

Numori is also available as a web app:
👉 [kaizo101.github.io/numori](https://kaizo101.github.io/numori)

Optimized for desktop and mobile.

---

## How to Play

- Every row and column contains each number from 1 to N exactly once
- Cages define a target number and an arithmetic operation (+, −, ×, ÷)
- The numbers in a cage must produce the target using the given operation

---

## Features (v1.1.0)

- Procedurally generated puzzles — unlimited unique puzzles (AC-3 constraint propagation)
- Grid sizes: 3×3 to 9×9
- 4 difficulty levels (Easy, Medium, Hard, Expert)
- Puzzle IDs — share and replay specific puzzles
- **Android APK** — optimized mobile layout with touch controls, status bar with move counter and copy button
- **Global leaderboard** — online ranking via Supabase; top 20 per grid size and difficulty with daily, weekly, monthly and all-time periods
- **Local leaderboard** — best times per grid size and difficulty with name, time, moves and date; gold/silver/bronze ranking
- **DE/EN localization** — automatic language detection, manually switchable in settings
- PDF export — save puzzles as blank A4 PDF for printing
- 4 themes — Classic, Numori Dark, Console, Flipper
- Daily puzzle with weekly schedule and best-time tracking
- Auto-save and restore game state
- Win banner with confetti and statistics (size, difficulty, time, moves)
- Error indicator when all cells are filled but the solution is wrong
- Instant validation (V key)
- Notes mode (N key)
- Hints
- Undo/Redo
- Full keyboard navigation
- Number pad overlay — complete mouse control without keyboard
- Music player — chiptune background music (Console theme)
- Statistics — best times, average time, solved puzzles per size and difficulty
- Interactive tutorial — step-by-step introduction to the rules
- Automatic updates via Electron
- Adjustable font size (small / medium / large)
- Imprint & privacy notice in settings

---

## Themes

Numori offers four themes, selectable via settings. Your choice is saved.

- **Classic** — warm, light design with Georgia font and beige background
- **Numori Dark** — dark design inspired by the app icon, blue-grey palette, Poppins font and gold accents in the win banner
- **Console** — retro CRT aesthetic with phosphor-green text, scanlines and Matrix animations. ACCESS GRANTED / ACCESS DENIED as win screen.
- **Flipper** — pinball dot-matrix aesthetic with amber palette, Bitcount font and a scrolling high-score ticker in the header.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow keys | Navigate cells |
| 1–9 | Enter number |
| Del / Backspace | Clear cell |
| N | Toggle notes mode |
| V | Toggle validation |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Enter | Load puzzle ID |

---

## Building the APK

The Android folder is not included in this repository but can be reproduced from the source:

```bash
npm install
npx cap add android
npx cap sync android
# Then open in Android Studio or:
cd android && ./gradlew assembleDebug
```

Requirements: Node.js, Android Studio with SDK.

---

## License

Numori is licensed under the **GNU General Public License v3.0**.
See [LICENSE](LICENSE) for the full license text.

---

## Author

Developed by Lukas Schäfer — feedback and contributions welcome.

---

## Third-party Licenses

### Poppins
Used in the Numori Dark theme (`assets/fonts/Poppins-Medium.ttf`, `assets/fonts/Poppins-Italic.ttf`).

License: **SIL Open Font License 1.1**
Copyright: © 2014–2020 Indian Type Foundry

The full license file is located at `assets/fonts/OFL.txt`.

### VT323
Used in the Console theme.

License: **SIL Open Font License 1.1**
Copyright: © 2015 Peter Hull

### Share Tech Mono
Used in the Console theme.

License: **SIL Open Font License 1.1**
Copyright: © 2012 Carrois Type Design

### Bitcount Grid Single
Used in the Flipper theme (`assets/fonts/BitcountGridSingle-Regular.ttf`).

License: **SIL Open Font License 1.1**
Copyright: © 2024 Petr van Blokland

### Norse & Norse Bold
Used in the Space theme (`assets/fonts/Norse.otf`, `assets/fonts/Norsebold.otf`).

License: **Freeware** — © Joël Carrouché
Free for personal and commercial use including embedding in applications. Font files may not be modified or sold.
Full license: `assets/fonts/freefont_license.txt`

### Lucide Icons
Used in the toolbar (inline SVG).

License: **ISC License**
Copyright: © 2022 Lucide Contributors
