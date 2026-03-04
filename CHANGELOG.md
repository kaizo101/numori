# Changelog

## v0.8.0 — 2026-03-04

### Neu
- **Console-Theme** — Retro-CRT-Ästhetik mit phosphorgrüner Schrift (VT323/Share Tech Mono), Scanlines auf Toolbar, Board und Willkommensscreen, Typewriter-Statusleiste und Typewriter-Animation im Seed-Eingabefeld
- **Matrix-Winscreen** (Console) — Animierter Abschlussbildschirm mit Matrix-Regen, Flash, Fly-In und Typewriter-Phasen; zeigt Größe, Schwierigkeit, Zeit, Züge und Seed. ACCESS GRANTED bei korrekter Lösung, ACCESS DENIED bei reiner Tipp-Lösung
- **Tägliches Rätsel** — Täglich wechselndes Rätsel, deterministisch aus dem Datum generiert; aufsteigender Wochenplan (Mo: 4×4 Leicht → So: 6×6 Schwer); Bestzeit wird lokal gespeichert; Kalender-Icon in der Toolbar zeigt Gelöst-Status
- **Spielstand speichern** — Beim Schließen der App wird gefragt ob der aktuelle Stand gespeichert werden soll; beim nächsten Start wird automatisch weitergemacht
- **3-2-1 Countdown** — Startet beim Beginn eines neuen Rätsels im Wettkampf-Modus; Board ist während des Countdowns gesperrt; theme-spezifisches Design. Grundlage für den vollständigen Wettkampf-Modus *(in Entwicklung)*
- **Fehler-Anzeige** — Erscheint wenn alle Zellen ausgefüllt sind aber die Lösung nicht stimmt; theme-spezifisch (Console: roter ERROR-Screen, Dark: dunkles Modal, Klassisch: helles Modal)
- **Züge im Gewinnbanner** — Züge-Zähler wird jetzt auch im Abschluss-Banner angezeigt

### Verbesserungen
- Validierungsmodus wird beim Start eines neuen Rätsels automatisch zurückgesetzt
- Bei Aktivierung der Sofort-Validierung wird angeboten, alle falschen Ziffern automatisch zu löschen
- Züge-Zähler überarbeitet
- Info-Popup im Console-Theme überarbeitet (Scanlines, Rahmen)
- Modalfenster im Console-Theme durchgängig lowercase

---

## v0.9.0 — geplant

### Geplant
- **Musikplayer** — Hintergrundmusik während des Spiels
- **Maussteuerung** — Zahlenpad direkt auf dem Board, vollständige Bedienung ohne Tastatur
- **Aktualisierungsverwaltung** — Automatische Updates via Electron
- **Statistiken** — Bestzeiten pro Größe und Schwierigkeit, Anzahl gelöster Rätsel, Durchschnittszeit
- **Interaktives Tutorial** — Schritt-für-Schritt-Einführung ins Spielprinzip anhand eines einfachen 3×3-Rätsels

---

## v0.7.0 — 2026-03-02

### Neu
- **PDF-Export** — Rätsel können als leeres A4-PDF gespeichert werden (zum Ausdrucken). Der Export enthält Rätselgröße, Schwierigkeit und Rätsel-ID als Kopfzeile. Immer im klassischen Look, unabhängig vom aktiven Theme.
- **Theme-System** — Zwei Designs wählbar über das Einstellungs-Menü (Zahnrad-Button im Header):
  - **Klassisch** — das bisherige warme Design
  - **Numori Dark** — modernes, dunkles Design im Stil des App-Icons. Nutzt die Schriftart Poppins (SIL Open Font License, siehe unten), abgerundete Ecken und eine blaugraue Farbpalette. Die gewählte Einstellung wird gespeichert.
- **Versionsnummer** im Header sichtbar.
- **Timer** jetzt prominent oben rechts im Spielfeld platziert.

### Verbesserungen
- **Gewinnbanner** komplett überarbeitet — im klassischen Theme weiß/invertiert mit Header-Blau, im Numori Dark Theme mit Goldakzenten, SVG-Pokal und Statistik-Leiste.
- **Toolbar-Icons** auf systemunabhängige SVGs umgestellt (zuvor Emojis, die je nach Betriebssystem unterschiedlich aussahen).
- **Custom Dropdowns** im Numori Dark Theme — abgerundet, mit Poppins-Schrift und sanfter Öffnungsanimation.
- **Info-Popup** (Schwierigkeit) im klassischen Theme invertiert — weißer Hintergrund, dunkler Text.
- **Wettkampf-Modus** kann nur noch aktiviert werden wenn das Rätsel noch leer ist und weder Tipps noch Validierung genutzt wurden. Bei neuem Rätsel wird die Sperre zurückgesetzt.

### Bugfixes
- Validierungs- und Tipp-Felder wurden im klassischen Theme schwarz eingefärbt.
- Beim Laden einer Rätsel-ID sprangen die Dropdowns nicht mehr auf die korrekte Größe und Schwierigkeit.

---

## v0.6.0 und früher

Siehe vorherige Release-Notizen.

---

## Lizenzen

### Poppins
Genutzt im Numori Dark Theme (`assets/fonts/Poppins-Medium.ttf`, `assets/fonts/Poppins-Italic.ttf`).

Lizenz: **SIL Open Font License 1.1**
Copyright: © 2014–2020 Indian Type Foundry

Die vollständige Lizenzdatei liegt unter `assets/fonts/OFL.txt`.
Die SIL OFL erlaubt die freie Nutzung, Weitergabe und Einbindung in kommerzielle Produkte, solange die Schrift nicht allein verkauft wird und die Lizenzdatei beigelegt ist.

Weitere Informationen: https://scripts.sil.org/OFL

### Lucide Icons
Genutzt in der Toolbar (inline SVG).

Lizenz: **ISC License**
Copyright: © 2022 Lucide Contributors

Die ISC License erlaubt die freie Nutzung und Weitergabe ohne weitere Auflagen.
