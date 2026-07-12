const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXCLUDE = [
    'node_modules', 'dist', 'android', 'www', '.git',
    'scripts', 'resources', 'tests',
];
const EXT_MAP = {
    '.js': 'script', '.css': 'style', '.html': 'html',
    '.svg': 'svg', '.png': 'image', '.ico': 'icon',
    '.ttf': 'font', '.otf': 'font', '.mp3': 'music',
};
const ROOT = path.resolve(__dirname, '..');

function shouldExclude(absPath) {
    const rel = path.relative(ROOT, absPath);
    if (path.basename(rel) === 'main.js' || path.basename(rel) === 'preload.js') return true;
    if (/\.md$/.test(rel)) return true;
    if (/package\.json$/.test(rel)) return true;
    if (/capacitor\.config\..*/.test(rel)) return true;
    return EXCLUDE.some(d => rel.startsWith(d + path.sep) || rel === d);
}

function syncFile(absPath) {
    const rel = path.relative(ROOT, absPath);
    if (shouldExclude(absPath)) return;
    const ext = path.extname(rel);
    const type = EXT_MAP[ext] || 'other';
    const dest = path.join(ROOT, 'www', rel);
    try {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(absPath, dest);
        console.log(`[${new Date().toLocaleTimeString()}] ${type}  ${rel}`);
    } catch (err) {
        // ignore transient errors (e.g. temp files)
    }
}

let capTimer = null;
function debouncedCapSync() {
    if (capTimer) clearTimeout(capTimer);
    capTimer = setTimeout(() => {
        try {
            console.log('[cap] Syncing Android project…');
            execSync('npx cap sync android', { cwd: ROOT, stdio: 'inherit' });
        } catch (err) {
            console.error('[cap] Sync failed:', err.message);
        }
        capTimer = null;
    }, 1500);
}

console.log('Watching for changes… (Ctrl+C to stop)');

try {
    fs.watch(ROOT, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        const absPath = path.resolve(ROOT, filename);
        // fs.watch may fire for parent dirs — skip non-files
        if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) return;
        syncFile(absPath);
        debouncedCapSync();
    });
} catch (err) {
    console.error('Watch failed:', err.message);
    process.exit(1);
}
