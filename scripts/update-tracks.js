#!/usr/bin/env node

/**
 * update-tracks.js
 * Liest alle MP3-Dateien aus den music/-Unterordnern,
 * extrahiert Autor und Titel aus dem Dateinamen
 * und aktualisiert das MUSIC_TRACKS-Array in app.js.
 *
 * Dateinamens-Schema: [autor]-[songname]-[ID].mp3
 * Ordner-Schema: music/[theme]/
 *
 * Verwendung:
 *   node scripts/update-tracks.js
 */

const fs   = require('fs');
const path = require('path');

const MUSIC_DIR = path.join(__dirname, '..', 'music');
const APP_JS    = path.join(__dirname, '..', 'app.js');

// Alle Theme-Unterordner einlesen
const themeDirs = fs.readdirSync(MUSIC_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

if (themeDirs.length === 0) {
    console.error('Keine Theme-Unterordner in music/ gefunden.');
    process.exit(1);
}

// Pro Theme die MP3s einlesen und parsen
const tracksByTheme = {};

for (const theme of themeDirs) {
    const dir   = path.join(MUSIC_DIR, theme);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3')).sort();

    tracksByTheme[theme] = files.map(file => {
        const base  = path.basename(file, '.mp3');
        const parts = base.split('-');

        const author     = capitalize(parts[0]);
        const titleParts = parts.slice(1, parts.length - 1); // ohne ID
        const title      = titleParts.map(capitalize).join(' ');

        return { file, title: title || base, author };
    });

    console.log(`✓ ${theme}: ${files.length} Titel gefunden`);
    tracksByTheme[theme].forEach(t => console.log(`  · ${t.author} – ${t.title}`));
}

// app.js einlesen
let appJs = fs.readFileSync(APP_JS, 'utf-8');

// Pro Theme das jeweilige Array ersetzen
// Marker-Format: // TRACKS:[theme] ... // END-TRACKS:[theme]
let changed = false;

for (const [theme, tracks] of Object.entries(tracksByTheme)) {
    const startMarker = `// TRACKS:${theme}`;
    const endMarker   = `// END-TRACKS:${theme}`;

    if (!appJs.includes(startMarker)) {
        console.warn(`⚠ Kein Marker "${startMarker}" in app.js gefunden – übersprungen.`);
        continue;
    }

    const maxFileLen = Math.max(...tracks.map(t => t.file.length));
    const maxTitleLen = Math.max(...tracks.map(t => t.title.length));

    const rows = tracks.map(t =>
        `    { file: '${t.file.padEnd(maxFileLen)}', title: '${t.title.padEnd(maxTitleLen)}', author: '${t.author}' },`
    ).join('\n');

    const block = `${startMarker}\n${rows}\n    ${endMarker}`;

    const regex = new RegExp(`${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`);
    appJs = appJs.replace(regex, block);
    changed = true;
}

if (changed) {
    fs.writeFileSync(APP_JS, appJs, 'utf-8');
    console.log('\n✓ app.js aktualisiert.');
} else {
    console.log('\nKeine Änderungen vorgenommen.');
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
