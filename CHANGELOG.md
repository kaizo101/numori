# Changelog

## v0.9.0 — 2026-03-10

### Neu
- **Musikplayer** (Console-Theme) — 17 lizenzfreie Chiptune-Tracks; Play/Pause, Vor/Zurück, Lautstärkeregler; scrollbare Playlist mit Track-Auswahl; Marquee-Animation für Interpret und Titel; Lautstärke wird in localStorage gespeichert
- **Zahlenpad-Overlay** — frei positionierbares und skalierbares Zahlenpad; Notiz-Modus-Toggle direkt im Pad; Position und Skalierung werden in localStorage gespeichert; ein/ausschaltbar über Toolbar-Button
- **Statistiken** — Modal mit Bestzeit, Durchschnittszeit, besten Zügen und Anzahl gelöster Rätsel pro Größe und Schwierigkeit; Reset-Option; Statistiken in localStorage gespeichert
- **Interaktives Tutorial** — 3 Erklär-Slides (Spielprinzip, Käfige & Operationen, nützliche Funktionen) gefolgt von einem spielbaren 3×3-Rätsel; beim ersten Start wird gefragt ob das Tutorial übersprungen werden soll; jederzeit über die Einstellungen aufrufbar; theme-spezifisches Design
- **Automatische Updates** — Updateprüfung beim Start via `electron-updater`; nicht-invasives Banner mit Download- und Install-Option; Installation beim nächsten Neustart
- **GitHub Pages** — Numori ist unter [kaizo101.github.io/numori](https://kaizo101.github.io/numori) als Webversion verfügbar; Mobile-Optimierung folgt in v1.0

### Verbesserungen
- **Schwierigkeitsmodell** überarbeitet: `maxSingleRatio` für Leicht von 40% auf 20% gesenkt (weniger Gratis-Zellen); Multiplikation bei Mittel auf 2-Zeller beschränkt (verhindert brutal schwere Großkäfige); größenabhängige Op-Gewichte für Mittel (3+-Zeller immer Addition, 2-Zeller ausgewogenes `+/-/*`); toter Soft-Cap-Code (`targetAvgSize`) entfernt
- **Header und Toolbar** skalieren jetzt korrekt mit der Fenstergröße (clamp-Werte mit v0.8-Minimum)
- **Toolbar** überarbeitet – Theme-Wechsel, Statistiken und Einstellungen als separate Buttons oben rechts
- Käfigränder-Radien für Eck-Zellen im Dark-Theme

### Bugfixes
- `saveGameState` hat den Daily-Mode-Zustand fälschlicherweise zurückgesetzt (Copy-Paste-Fehler)
- Undo erhöhte den Züge-Zähler statt ihn unverändert zu lassen
- `#btn-load-seed` hatte eine fest kodierte Höhe und lief bei großen Fenstern aus dem Seed-Input-Feld heraus

---

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
