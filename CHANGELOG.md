# Changelog

## v1.2.0 — 21/06/2026

### Neu
- **Achievement-System** — über 25 Achievements in verschiedenen Kategorien (Core, Leaderboard, Console, Flipper); Toast-Benachrichtigung bei Freischaltung, Detail-Modal bei Klick, retroaktive Vergabe für Bestandsnutzer; Statistik-Tracking pro Größe, Schwierigkeit und Theme
- **PDF-Lösungsexport** — optionale zweite Seite im PDF-Export mit aufgedeckter Lösung
- **Tutorial als PDF** — interaktives Tutorial ist jetzt auch als druckbare HTML/PDF-Seite verfügbar

### Verbesserungen
- **Flipper-Ticker** — Highscore-Ticker überarbeitet
- **Console-Theme** — Detailverbesserungen am Matrix-Gewinnbildschirm und Fehlerbildschirm
- **Undo-Tracking** — `undoWasUsed`-Flag für Achievement-Prüfungen (no_undo)
- **Footer aufgeräumt** — redundantes Timer-Symbol und "Timer starten"-Label entfernt (via `T`-Shortcut erreichbar)
- **Tutorial erweitert** — dritter Slide enthält jetzt einen "Tipp/Hint"-Eintrag mit Glühbirnen-Symbol
- **Statistik-Modal** — Desktop-Ansicht breiter (700px), Achievement-Raster mehrspaltig, Überlaufverhalten verbessert
- **Tutorial-Navigation** — Buttons (Zurück/Überspringen/Weiter) auf Mobilgeräten zentriert
- **Leaderboard-Feedback** — Error Toast erscheint bei Supabase-Fehlern; Warnhinweis in Einstellungen wenn Leaderboard-Übermittlung deaktiviert ist

### Fehlerbehebungen
- **Globale Leaderboard-Übermittlung** — Zeiten können jetzt auch ohne lokalen Top-5-Rang für wöchentliche, monatliche und Gesamtzeiträume übermittelt werden. Zuvor hatte nur das Tagesrätsel diesen Fallback.
- **Globale Rang-Anzeige** — Gewinnbildschirm, Console- und Flipper-Theme zeigen jetzt nur noch einen globalen Rang bei ≤ 10 (zuvor 20), konsistent mit der Leaderboard-Ansicht.
- **Flipper-Theme** — "Anleitung als PDF"-Button funktioniert wieder (fehlendes `display: inline-flex` ergänzt)

---

## v1.1.0 — 24/03/2026

### Neu
- **Überarbeiteter Rätsel-Generator** — komplette Neuentwicklung mit AC-3 Constraint Propagation; Rätsel werden jetzt schneller generiert, sind immer eindeutig lösbar und skalieren korrekt auf größere Gitter
- **Experten-Schwierigkeit** — neue Schwierigkeitsstufe verfügbar für 6×6 und größere Gitter; erfordert logisches Denken über mehrere Constraints gleichzeitig
- **8×8 und 9×9 Gitter** — zwei neue Gittergrößen, ausschließlich in Experten-Schwierigkeit
- **Globales Leaderboard** — Online-Ranking via Supabase; Top 20 pro Gittergröße und Schwierigkeit mit täglichen, wöchentlichen, monatlichen und Gesamtzeiträumen; Namenseingabe nach qualifiziertem Lauf (keine Hinweise, keine Validierung verwendet)
- **Tagesrätsel-Info auf Willkommensbildschirm** — zeigt heutige Gittergröße, Schwierigkeit und ob es bereits gelöst wurde

### Verbesserungen
- **Tagesrätsel** — Seed-Leiste zeigt dauerhaft die gelöste Zeit nach Abschluss des Tagesrätsels; Gewinn-Popup zeigt jetzt den Tagesrang statt des Gesamtrangs
- **Statistik-Modal** — "Leaderboard"-Tab umbenannt in "Lokal" zur besseren Übersicht neben dem neuen Global-Tab
- **Flipper-Theme auf Mobile** — verbesserte Lesbarkeit der DMD-Anzeige und Punkteanzeige auf kleinen Bildschirmen
- **Datenschutzhinweis** — umformuliert für bessere Verständlichkeit; bestätigt explizit die lokale Speicherung und enthält einen Hinweis zum Deaktivieren der Leaderboard-Übermittlung

### Fehlerbehebungen
- Diagonale Käfig-Validierung lehnte fälschlicherweise wiederholte Werte ab, die in Nicht-Latin-Square-Käfigen gültig sind
- Flipper-DMD zeigte eine Lücke statt des Schwierigkeitslabels wenn Experte ausgewählt war
- E-Mail-Adresse im Über-Bereich war in Numori Dark aufgrund unzureichendem Kontrast unlesbar

### Lizenzen
Norse & Norse Bold (`assets/fonts/Norse.otf`, `assets/fonts/Norsebold.otf`) — verwendet im Space-Theme.
Lizenz: **Freeware** — © Joël Carrouché, frei für persönliche und kommerzielle Nutzung einschließlich Einbettung in Anwendungen. Font-Dateien dürfen nicht modifiziert oder verkauft werden.

---

## v1.0.0 — 19/03/2026

### Neu
- **Android APK** — erste öffentliche APK-Veröffentlichung via Capacitor
- **Flipper-Theme** — vollständiges Pinball-Arcade-Theme mit DMD-Anzeige (Attract, Playing, Win, Tilt, Highscore und Initials Flow), Coin Slot, scrollender Ticker mit Highscores, Flipper-spezifische Schrift (Bitcount Grid Single)
- **Lokales Leaderboard** — Top-Einträge pro Gittergröße und Schwierigkeit mit Name, Zeit, Zügen und Datum; Gold/Silber/Bronze-Ranking; Namenseingabe nach Highscore inkl. Flipper-DMD-Integration
- **DE/EN Lokalisierung** — vollständige Lokalisierung aller UI-Texte; automatische Spracherkennung; manuell umschaltbar in den Einstellungen
- **Statistiken & Leaderboard als Tabs** — zusammengefasst in einem Modal statt separater Ansichten
- **Mobile Statusleiste** — zeigt Rätsel-ID, Züge-Zähler und Kopier-Button zum schnellen Teilen der Rätsel-ID
- **Konfetti-Animation** bei Gewinn
- **Impressum & Datenschutzhinweis** — Bereich in den Einstellungen; Datenschutzhinweis bestätigt lokale Speicherung ohne Datenübertragung

### Änderungen
- **Wettkampf-Modus** — aus der Entwicklung entfernt; ersetzt durch das lokale Leaderboard, das faire Läufe automatisch verfolgt und rankt (keine Validierung oder Hinweise verwendet)

### Lizenzen
Bitcount Grid Single (`assets/fonts/BitcountGridSingle-Regular.ttf`) — verwendet im Flipper-Theme.
Lizenz: **SIL Open Font License 1.1** — Copyright © 2024 Petr van Blokland

---

## v0.9.2 — 12/03/2026

### Neu
- **Musikplayer auf Mobile** — Musik-Panel im Mehr-Menü (Console-Theme); Play/Pause, Nächster/Vorheriger, Lautstärke und Track-Anzeige
- **Auto-Save beim Schließen** — Spielstand wird in der Webversion automatisch gespeichert wenn der Tab geschlossen oder die Seite verlassen wird

### Verbesserungen
- Zahlenpad auf Mobile überarbeitet — optimiertes Layout und Darstellung für kleine Bildschirme

---

## v0.9.1 — 11/03/2026

### Neu
- **Mobile-Layout** *(Preview)* — optimiertes Layout für Smartphones (≤ 600px): kompakte obere Toolbar mit Größe, Schwierigkeit, Rätsel-ID und Tagesrätsel; feste untere Navigation mit Notizen, Hinweis, Undo, Redo und Mehr-Menü
- **Seed-Modal** — Rätsel-ID-Eingabe auf Mobile als Modal statt Textfeld; zeigt die aktuelle Rätsel-ID
- **Rätsel-ID über dem Board** — aktuelle ID wird auf Mobile oben links angezeigt
- **Zahlenpad Auto-Open** — öffnet sich auf Mobile automatisch wenn ein Rätsel gestartet wird
- **Matrix-Gewinnbildschirm auf Mobile** — Touch-Buttons statt Tastatureingabe; Animation ist jetzt zeitbasiert (konsistent auf allen Geräten und Frameraten)

### Verbesserungen
- Käfig-Labels und Notizen auf Mobile 40% größer
- Schwierigkeits-Dropdown auf Mobile passt sich jetzt korrekt an bei Größenänderung
- Minimale Fenstergröße in Electron auf 900×600 gesetzt (verhindert versehentliche Mobile-Layout-Aktivierung)

### Fehlerbehebungen
- Mobile Bottom-Nav im Console-Theme hatte grünen Hintergrund statt schwarz
- Console-Theme Vignette-Overlay überdeckte Mobile-Elemente

---

## v0.9.0 — 10/03/2026

### Neu
- **Musikplayer** (Console-Theme) — 17 lizenzfreie Chiptune-Tracks; Play/Pause, Nächster/Vorheriger, Lautstärkeregelung; scrollbarer Playlist mit Track-Auswahl; Marquee-Animation für Künstler und Titel; Lautstärke in localStorage gespeichert
- **Zahlenpad-Overlay** — frei positionierbares und skalierbares Zahlenpad; Notiz-Modus-Toggle direkt im Pad; Position und Skalierung in localStorage gespeichert; umschaltbar via Toolbar-Button
- **Statistiken** — Modal mit Bestzeit, Durchschnittszeit, beste Züge und Anzahl gelöster Rätsel pro Größe und Schwierigkeit; Reset-Option; Statistiken in localStorage gespeichert
- **Interaktives Tutorial** — 3 Erklärungs-Slides (Spielregeln, Käfige & Operationen, nützliche Features) gefolgt von einem spielbaren 3×3 Rätsel; beim ersten Start wird gefragt ob das Tutorial übersprungen werden soll; jederzeit über Einstellungen zugänglich; Theme-spezifisches Design
- **Automatische Updates** — Update-Check beim Start via `electron-updater`; unaufdringliches Banner mit Download- und Install-Option; Installation beim nächsten Neustart
- **GitHub Pages** — Numori ist verfügbar unter [kaizo101.github.io/numori](https://kaizo101.github.io/numori) als Webversion

### Verbesserungen
- **Schwierigkeitsmodell** überarbeitet: `maxSingleRatio` für Leicht von 40% auf 20% reduziert (weniger freie Zellen); Multiplikation in Mittel auf 2-Zellen-Käfige beschränkt (verhindert brutal schwere große Käfige); größenabhängige Op-Gewichte für Mittel (3+ Zellen-Käfige immer Addition, 2-Zellen-Käfige ausgewogen `+/-/*`); toter Soft-Cap-Code (`targetAvgSize`) entfernt
- **Header und Toolbar** skalieren jetzt korrekt mit Fenstergröße (Clamp-Werte mit v0.8 Minimum)
- **Toolbar** überarbeitet — Theme-Wechsler, Statistiken und Einstellungen als separate Buttons oben rechts
- Käfig-Eckradien für Eckzellen im Dark-Theme

### Fehlerbehebungen
- `saveGameState` setzte fälschlicherweise den Daily-Mode-Status zurück (Copy-Paste-Fehler)
- Undo erhöhte den Züge-Zähler statt ihn unverändert zu lassen
- `#btn-load-seed` hatte eine hardcodierte Höhe und überlappte das Seed-Input-Feld auf großen Fenstern

---

## v0.8.0 — 04/03/2026

### Neu
- **Console-Theme** — Retro-CRT-Ästhetik mit Phosphor-Grün-Text (VT323/Share Tech Mono), Scanlines auf Toolbar, Board und Willkommensbildschirm, Schreibmaschinen-Statusleiste und Schreibmaschinen-Animation im Seed-Input-Feld
- **Matrix-Gewinnbildschirm** (Console) — animierter Abschlussbildschirm mit Matrix-Rain, Flash, Fly-In und Schreibmaschinen-Phasen; zeigt Größe, Schwierigkeit, Zeit, Züge und Seed. ACCESS GRANTED für korrekte Lösung, ACCESS DENIED für Hinweis-Lösung
- **Tagesrätsel** — täglich wechselndes Rätsel, deterministisch aus dem Datum generiert; aufsteigender Wochenplan (Mo: 4×4 Leicht → So: 6×6 Schwer); Bestzeit lokal gespeichert; Kalender-Icon in Toolbar zeigt Gelöst-Status
- **Spielstand speichern** — beim Schließen der App wird gefragt ob der aktuelle Stand gespeichert werden soll; automatisch beim nächsten Start fortgesetzt
- **3-2-1 Countdown** — startet beim Beginn eines neuen Rätsels im Wettkampf-Modus; Board ist während Countdown gesperrt; Theme-spezifisches Design
- **Fehleranzeige** — erscheint wenn alle Zellen gefüllt sind aber die Lösung falsch ist; Theme-spezifisch (Console: roter ERROR-Screen, Dark: dunkles Modal, Classic: helles Modal)
- **Züge im Gewinn-Banner** — Züge-Zähler wird jetzt auch im Abschluss-Banner angezeigt

### Verbesserungen
- Validierungs-Modus wird automatisch zurückgesetzt beim Start eines neuen Rätsels
- Bei aktivierter Sofort-Validierung wird angeboten, alle falschen Ziffern automatisch zu löschen
- Züge-Zähler überarbeitet
- Info-Popup im Console-Theme überarbeitet (Scanlines, Border)
- Modal-Fenster im Console-Theme konsequent lowercase

---

## v0.7.0 — 02/03/2026

### Neu
- **PDF-Export** — Rätsel können als leeres A4-PDF gespeichert werden (zum Ausdrucken). Der Export enthält Gittergröße, Schwierigkeit und Rätsel-ID als Header. Immer im klassischen Look, unabhängig vom aktiven Theme.
- **Theme-System** — zwei Designs auswählbar über das Einstellungen-Menü (Zahnrad-Button im Header):
  - **Klassisch** — das bisherige warme Design
  - **Numori Dark** — modernes dunkles Design im Stil des App-Icons. Verwendet die Poppins-Schrift (SIL Open Font License, siehe unten), abgerundete Ecken und eine Blau-Grau-Farbpalette. Die ausgewählte Einstellung wird gespeichert.
- **Versionsnummer** im Header sichtbar.
- **Timer** jetzt prominent oben rechts im Spielbereich platziert.

### Verbesserungen
- **Gewinn-Banner** komplett überarbeitet — im klassischen Theme weiß/invertiert mit Header-Blau, in Numori Dark mit Gold-Akzenten, SVG-Trophäe und Statistik-Leiste.
- **Toolbar-Icons** auf systemunabhängige SVGs umgestellt (zuvor Emojis, die auf jedem OS anders aussahen).
- **Custom-Dropdowns** im Numori-Dark-Theme — abgerundet, mit Poppins-Schrift und sanfter Öffnungs-Animation.
- **Info-Popup** (Schwierigkeit) im klassischen Theme invertiert — weißer Hintergrund, dunkler Text.
- **Wettkampf-Modus** kann jetzt nur aktiviert werden wenn das Rätsel noch leer ist und weder Hinweise noch Validierung verwendet wurden. Die Sperre wird bei jedem neuen Rätsel zurückgesetzt.

### Fehlerbehebungen
- Validierungs- und Hinweis-Zellen wurden im klassischen Theme schwarz gefärbt.
- Laden einer Rätsel-ID sprang nicht mehr korrekt zu richtiger Größe und Schwierigkeit in den Dropdowns.

---

## v0.6.0 und früher

Siehe frühere Release-Notes.

---

## Drittanbieter-Lizenzen

### Poppins
Verwendet im Numori-Dark-Theme (`assets/fonts/Poppins-Medium.ttf`, `assets/fonts/Poppins-Italic.ttf`).

Lizenz: **SIL Open Font License 1.1**
Copyright: © 2014–2020 Indian Type Foundry

Die vollständige Lizenzdatei befindet sich unter `assets/fonts/OFL.txt`.
Die SIL OFL erlaubt freie Nutzung, Weiterverbreitung und Einbettung in kommerzielle Produkte, solange die Schrift nicht einzeln verkauft wird und die Lizenzdatei mitgeliefert wird.

Weitere Informationen: https://scripts.sil.org/OFL

### Lucide Icons
Verwendet in der Toolbar (Inline-SVG).

Lizenz: **ISC License**
Copyright: © 2022 Lucide Contributors

Die ISC License erlaubt freie Nutzung und Weiterverbreitung ohne weitere Bedingungen.
