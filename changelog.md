# NUMORI – Changelog

## v0.5.0 – 27.02.2026

### Neu gegenüber v0.4.0

#### Rätsel-ID
- Jedes Rätsel erhält eine eindeutige 6-stellige ID (Seed)
- ID wird in der Statusleiste angezeigt
- Bekannte Rätsel können über die ID-Eingabe exakt reproduziert werden

#### Timer
- Timer startet automatisch nach Puzzle-Generierung
- Timer läuft immer im Hintergrund, auch wenn unsichtbar
- Neuer Toggle-Button ⏱ in der Toolbar – aktiviert die sichtbare Zeitanzeige rechts neben dem Button
- Zeitanzeige im Timer-Modus in Orange hervorgehoben
- Timer stoppt automatisch bei korrekter Lösung
- Timer stoppt und wird verworfen wenn „Lösung anzeigen" genutzt wird
- Timer startet neu bei Reset
- Im Timer-Modus ist die Sofort-Validierung gesperrt
- Leaderboard-Stub vorbereitet (`saveToLeaderboard()`) für spätere Implementierung

#### Gewinn-Erkennung
- Gewinn-Prüfung läuft immer, unabhängig vom Validierungs-Toggle
- Kein Gewinn-Event wenn „Lösung anzeigen" genutzt wurde

#### Gewinn-Banner
- Zentriertes Modal mit Backdrop-Blur bei korrekter Lösung
- Zeigt Größe, Schwierigkeit, Rätsel-ID und benötigte Zeit
- Bleibt offen bis manuell geschlossen
- Buttons: „Neues Rätsel" und „Schließen"
- Pop-Animation beim Erscheinen

#### Willkommens-Screen
- App startet nicht mehr mit automatisch generiertem Rätsel
- Willkommens-Screen mit Hinweistext wird beim Start angezeigt
- Screen verschwindet sobald das erste Rätsel generiert wird

### Bugfixes
- Leeres `#board`-Div auf dem Willkommens-Screen nicht mehr sichtbar

### Tastatursteuerung
- "V" für Validierung ergänzt und im Footer hinzugefügt

---

## v0.4.0

### Features
- Prozedural generierte Rätsel – unbegrenzte einzigartige Puzzles
- Rastergrößen: 3×3 bis 7×7
- 3 Schwierigkeitsgrade: Leicht, Mittel, Schwer
- Notizmodus – Kandidaten-Ziffern eintragen (Taste: N)
- Lösung anzeigen bei Bedarf
- Zurücksetzen – Rätsel von vorne beginnen

---

## Geplant für v0.6.0
- Einen Tipp geben
- Undo-Funktion
- Windows-EXE
