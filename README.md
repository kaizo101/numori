# Numori

Numori ist ein kostenloses, werbefreies Logik-Rätselspiel – ähnlich einem Sudoku, aber mit Rechenoperationen.
Fülle das Gitter so aus, dass jede Zeile und Spalte jede Zahl genau einmal enthält – und die Käfig-Ziele erfüllt sind.

![Numori – Klassisches Theme](screenshot.png)

---

## Spielprinzip

- Jede Zeile und Spalte enthält jede Zahl von 1 bis N genau einmal
- Käfige geben eine Zielzahl und eine Rechenoperation vor (+, −, x, ÷)
- Die Zahlen im Käfig müssen mit der Operation das Ziel ergeben

---

## Features (v0.8.0)

- Prozedural generierte Rätsel – unbegrenzte einzigartige Puzzles
- Rastergrößen: 3×3 bis 7×7
- 3 Schwierigkeitsgrade (Leicht, Mittel, Schwer)
- Rätsel-IDs – Puzzles teilen und wiederholen
- PDF-Export – Rätsel als leeres A4-PDF speichern und ausdrucken
- Theme-System – Klassisch, Numori Dark, Console
- Wettkampf-Modus mit Timer und 3-2-1 Countdown
- Tägliches Rätsel mit Wochenplan und Bestzeit-Speicherung
- Spielstand speichern beim Schließen, automatisch wiederherstellen beim Start
- Gewinn-Banner mit Statistiken (Größe, Schwierigkeit, Zeit, Züge)
- Fehler-Anzeige wenn alle Zellen ausgefüllt aber die Lösung falsch ist
- Sofort-Validierung (V-Taste)
- Notizen (N-Taste)
- Tipps
- Undo/Redo
- Vollständige Tastatursteuerung

---

## Themes

Numori bietet drei Themes, wählbar über den Zahnrad-Button im Header. Die Auswahl wird gespeichert.

- **Klassisch** — warmes, helles Design mit Georgia-Schrift und beigem Hintergrund
- **Numori Dark** — dunkles Design im Stil des App-Icons, blaugraue Farbpalette, Poppins-Schrift und Goldakzente im Gewinnbanner
- **Console** — Retro-CRT-Ästhetik mit phosphorgrüner Schrift, Scanlines und Matrix-Animationen. ACCESS GRANTED / ACCESS DENIED als Abschlussbildschirm.

---

## Tastaturkürzel

| Taste | Aktion |
|-------|--------|
| Pfeiltasten | Zelle navigieren |
| 1–9 | Zahl eingeben |
| Entf / Backspace | Zelle leeren |
| N | Notizmodus umschalten |
| V | Validierung umschalten |
| Strg+Z | Undo |
| Strg+Y | Redo |
| Enter | Seed laden |

---

## Roadmap

### v0.9.0
- Musikplayer
- Reine Maussteuerung (Zahlenpad auf dem Board)
- Aktualisierungsverwaltung
- Statistiken (Bestzeiten, gelöste Rätsel, Durchschnittszeit)
- Interaktives Tutorial

### v1.0.0
- Android APK (via Capacitor)
- Leaderboard (lokal)

---

## Autor

Entwickelt von Lukas Schäfer — Feedback und Beiträge willkommen.

---

## Lizenzen

### Poppins
Genutzt im Numori Dark Theme (`assets/fonts/Poppins-Medium.ttf`, `assets/fonts/Poppins-Italic.ttf`).

Lizenz: **SIL Open Font License 1.1**
Copyright: © 2014–2020 Indian Type Foundry

Die vollständige Lizenzdatei liegt unter `assets/fonts/OFL.txt`.

### Lucide Icons
Genutzt in der Toolbar (inline SVG).

Lizenz: **ISC License**
Copyright: © 2022 Lucide Contributors
