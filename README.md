# NUMORI

Numori ist ein kostenloses, werbefreies Logik-Rätselspiel basierend auf dem KenKen/Calcudoku-Prinzip.
Fülle das Gitter so aus, dass jede Zeile und Spalte jede Zahl genau einmal enthält – und die Käfig-Ziele erfüllt sind.

![Numori Screenshot](screenshot.png)

---

## Spielprinzip

- Jede Zahl von 1 bis N muss in jeder Zeile und Spalte genau einmal vorkommen.
- Jeder markierte Käfig zeigt eine Zahl und eine Rechenoperation (z. B. `6×`). Die Zahlen im Käfig müssen mit der angegebenen Operation das Ziel ergeben.
- Käfige mit nur einer Zelle zeigen direkt den gesuchten Wert.

---

## Features

- **Größen:** 3×3 bis 7×7
- **Schwierigkeitsgrade:** Leicht, Mittel, Schwer
- **Rätsel-ID:** Jedes Rätsel hat eine eindeutige ID (z. B. `4M-AB3X7K`) – damit lässt sich ein Rätsel jederzeit exakt reproduzieren und teilen
- **Undo/Redo** – Strg+Z / Strg+Y oder Toolbar-Buttons
- **Notiz-Modus** – Hilfszahlen in Zellen eintragen (Taste `N`)
- **Tippgeber** – zeigt auf Wunsch die korrekte Zahl für eine Zelle (💡)
- **Sofort-Validierung** – hebt richtige und falsche Eingaben hervor (Taste `V`)
- **Fortschrittsbalken** – zeigt den Lösungsfortschritt in Echtzeit
- **Züge-Zähler** – zählt eingetragene Zahlen
- **Wettkampf-Modus** (🏆, in Entwicklung) – Zeitmessung für zukünftiges Leaderboard

---

## Tastaturkürzel

| Taste | Aktion |
|---|---|
| Pfeiltasten | Navigation |
| 1–9 | Zahl eingeben |
| Entf / Backspace | Zelle löschen |
| N | Notiz-Modus umschalten |
| V | Validierung umschalten |
| Strg+Z | Undo |
| Strg+Y | Redo |

---

## Download & Installation

Fertige Builds für Windows (.exe) und Linux (.AppImage) sind unter [Releases](../../releases) verfügbar – einfach herunterladen und starten.

---

## Lizenz

MIT

---

## Roadmap

### v0.7.0
- Überarbeitete Toolbar
- PDF-Export
- Verschiedene Layouts zur Wahl

### v1.0.0
- Android APK
- Leaderboard-Funktion
