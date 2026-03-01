# Changelog

## [0.6.0] - 2026-03-01

### Neu
- **Undo/Redo** – Züge lassen sich mit Strg+Z/Y oder den Toolbar-Buttons rückgängig machen bzw. wiederholen
- **Tippgeber** – Hinweis-Button (💡) zeigt auf Wunsch die korrekte Zahl für eine Zelle an
- **Fortschrittsbalken** – zeigt den prozentualen Lösungsfortschritt in Echtzeit an
- **Züge-Zähler** – zählt alle eingetragenen Zahlen; Notizen und Löschungen werden nicht gewertet
- **Wettkampf-Modus** (🏆, in Entwicklung) – Zeitmessung für zukünftiges Leaderboard
- **Windows-Installer** (.exe) verfügbar

### Verbesserungen
- **Rätsel-ID** enkodiert jetzt Größe und Schwierigkeit (Format: `4M-AB3X7K`), sodass eine ID ein Rätsel eindeutig identifiziert
- **Laden-Button** (▶) neben dem ID-Feld – Rätsel per Klick laden, Dropdowns passen sich automatisch an
- Diverse kleine GUI-Anpassungen

### Bugfixes
- Schwierigkeits-Dropdown wurde nach dem Lösen eines Rätsels mit der Rätsel-ID überschrieben
- Notizen in Zeile/Spalte werden bei Undo/Redo korrekt wiederhergestellt
- Züge-Zähler zeigt `–` wenn die Lösung automatisch aufgedeckt wird

---

## Ausblick

### [0.7.0] – geplant
- Überarbeitete Toolbar
- PDF-Export
- Verschiedene Layouts zur Wahl

### [1.0.0] – geplant
- Android APK
- Leaderboard-Funktion
