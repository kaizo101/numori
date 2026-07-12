# Test-Automatisierung - Übersicht

## ✅ Bereits automatisiert (103 Tests)

### achievements.test.js (33 Tests)
- Achievement-System (Storage, Unlock-Logik)
- Theme-Achievements (Console, Flipper, Space, Synthwave)
- Daily/Streak-System
- Leaderboard-Achievements
- Retroactive Achievements
- Stats-Tracking

### solver.test.js
- Puzzle-Generator (alle Größen/Schwierigkeiten)
- Latin-Square-Validierung
- Eindeutige Lösbarkeit
- Score-Kalkulation
- Deterministische Seed-Generierung

### persistence.test.js (6 Tests) ✅ NEU
- Font Scale wird gespeichert und geladen
- Theme wird gespeichert und geladen
- Music Volume bleibt erhalten
- Language wird gespeichert
- Leaderboard Consent wird gespeichert
- Verschiedene Datentypen funktionieren

### mintime.test.js (12 Tests) ✅ NEU
- MinTime-Konstanten für alle Grid-Größen (3x3 bis 9x9)
- Submit erlaubt bei Zeit >= MinTime
- Submit abgelehnt bei Zeit < MinTime
- Edge Cases (genau MinTime, 1 Sekunde drunter)
- Fallback 10 Sekunden für unbekannte Größen

### score.test.js (16 Tests) ✅ NEU
- Global Leaderboard Score-Formel
- Daily Leaderboard Score-Formel
- Edge Cases (Zeit = 0, sehr kurze/lange Zeiten)
- Score wird korrekt gerundet
- Score-Vergleiche

### consent.test.js (19 Tests) ✅ NEU
- Consent State Management (null/granted/denied)
- Submit-Logik (nur bei granted)
- Consent Modal Logik (nur bei null)
- Consent Warning Logik (nur bei denied)
- Kombinierte Logik-Tests

### daily.test.js (18 Tests) ✅ NEU
- Date Key Generation (YYYY-MM-DD Format)
- Daily Seed Generation (6 Zeichen, deterministisch)
- Daily Schedule (Wochenaufstieg Easy → Hard)
- Integration: Date → DateKey → Seed

---

## 📊 Test-Statistiken

**Total:** 103 automatisierte Tests  
**Status:** Alle neuen Tests ✅ bestanden  
**Ausführung:** `npm test`

---

## 🔧 Manuell zu testende Bereiche

### Visuelle Tests
- Theme-spezifisches Design (Console CRT, Space Partikel)
- Animationen (Matrix-Regen, Flipper DMD)
- Responsive Layout (Mobile/Desktop)
- Print-Layout

### Integration Tests
- Supabase-Integration (braucht echte DB)
- Electron-spezifische Features (Auto-Update)
- APK-spezifische Features (Capacitor)

### Manuelle Interaktion
- Stresstests (schnelle Klicks, Theme-Wechsel)
- Touch-Gesten
- Audio-Tests (Musik, Sounds)
- PDF Export
- Keyboard Navigation

---

## 📝 Checkliste-Integration

Die TEST_CHECKLIST.md enthält jetzt einen Abschnitt **"Automatisierte Tests"** mit einem Toggle:
- ✅ `npm test` läuft erfolgreich durch (alle 103 Tests)

Wenn dieser Toggle aktiviert ist, sind alle automatisierten Tests bestanden.

---

## 🚀 Ausführung

```bash
# Alle Tests ausführen
npm test

# Nur bestimmte Test-Datei
node --test tests/persistence.test.js
node --test tests/mintime.test.js
node --test tests/score.test.js
node --test tests/consent.test.js
node --test tests/daily.test.js
```

---

## 💡 Nächste Schritte (optional)

Falls später mehr Tests gewünscht sind:

### Mittel automatisierbar
- PDF Export (braucht PDF-Library oder Mock)
- Keyboard Navigation (braucht DOM-Mocking)
- Theme-Switch (braucht DOM-Mocking)

### Schwer/nicht automatisierbar
- Visuelle Tests
- Supabase-Integration
- Electron/APK-spezifische Features
