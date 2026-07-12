const fs = require('fs');
const path = require('path');

const md = fs.readFileSync(path.join(__dirname, '..', 'TEST_CHECKLIST.md'), 'utf-8');
const lines = md.split('\n');

const items = [];
let currentSection = '';
let emoji = '';

for (const line of lines) {
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch) {
        const raw = sectionMatch[1];
        const emojiMatch = raw.match(/^[\u{1F000}-\u{1FFFF}]|^\u{2000}-\u{206F}|^\u{2B50}|^\u{2705}|^\u{274C}|^\u{1F3C6}|^\u{1F3AE}|^\u{1F4BB}|^\u{1F4F1}|^\u{1F30D}/u);
        emoji = emojiMatch ? emojiMatch[0] : '';
        currentSection = raw.replace(/^[\u{1F000}-\u{1FFFF}\u{2000}-\u{206F}\u{2B50}\u{2705}\u{274C}\u{1F3C6}\u{1F3AE}\u{1F4BB}\u{1F4F1}\u{1F30D}]\s*/u, '').trim();
        continue;
    }
    const itemMatch = line.match(/^- \[ \] (.+)$/);
    if (itemMatch) {
        items.push({ section: currentSection, emoji, text: itemMatch[1].trim() });
    }
}

const itemsJson = JSON.stringify(items).replace(/</g, '\\x3C');

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Numori – Test-Checkliste</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0d1117; color: #c9d1d9;
    padding: 20px; max-width: 900px; margin: 0 auto;
}
h1 { font-size: 1.3rem; margin-bottom: 4px; }
#stats { font-size: 0.85rem; color: #8b949e; margin-bottom: 16px; }
.section {
    background: #161b22; border: 1px solid #30363d;
    border-radius: 8px; margin-bottom: 12px; overflow: hidden;
}
.section-header {
    padding: 10px 14px; font-weight: 600; font-size: 0.95rem;
    background: #1c2128; cursor: pointer; user-select: none;
    display: flex; justify-content: space-between; align-items: center;
}
.section-header:hover { background: #21262d; }
.section-header .count { font-weight: 400; font-size: 0.8rem; color: #8b949e; }
.section-body { padding: 4px 0; }
.item {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 6px 14px; border-top: 1px solid #21262d;
    font-size: 0.85rem; line-height: 1.4;
    transition: background 0.15s;
}
.item:first-child { border-top: none; }
.item:hover { background: #1c2128; }
.item input[type="checkbox"] {
    margin-top: 2px; flex-shrink: 0; width: 16px; height: 16px;
    accent-color: #2ea043; cursor: pointer;
}
.item .text { flex: 1; }
.item.done .text { color: #8b949e; text-decoration: line-through; }
.item .note-btn {
    flex-shrink: 0; background: none; border: 1px solid #30363d;
    color: #8b949e; border-radius: 4px; padding: 1px 7px;
    font-size: 0.75rem; cursor: pointer; opacity: 0.5;
    transition: opacity 0.15s;
}
.item:hover .note-btn { opacity: 1; }
.item .note-btn.has-note { border-color: #d29922; color: #d29922; opacity: 1; }
.item .note-input {
    display: none; flex: 1; min-width: 120px;
    background: #0d1117; border: 1px solid #30363d;
    color: #c9d1d9; border-radius: 4px; padding: 3px 6px;
    font-size: 0.8rem; resize: vertical; font-family: inherit;
}
.item .note-input:focus { outline: none; border-color: #58a6ff; }
.item.editing .note-btn { display: none; }
.item.editing .note-input { display: block; }
.filter-bar {
    display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;
}
.filter-bar button {
    background: #21262d; border: 1px solid #30363d;
    color: #c9d1d9; border-radius: 20px; padding: 4px 12px;
    font-size: 0.78rem; cursor: pointer; transition: all 0.15s;
}
.filter-bar button.active { background: #1f6feb; border-color: #1f6feb; color: #fff; }
.filter-bar button:hover:not(.active) { background: #30363d; }
</style>
</head>
<body>
<h1>🧪 Numori – Test-Checkliste</h1>
<div id="stats">0 / 0 erledigt</div>
<div class="filter-bar" id="filters"></div>
<div id="sections"></div>

<script>
const ITEMS = ${itemsJson};

const STORAGE_KEY = 'numori-test-tool';
function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
}
function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = load();
let filterSection = '';
let openSections = new Set();

const sections = [...new Set(ITEMS.map(i => i.section))];

function renderFilters() {
    const bar = document.getElementById('filters');
    const allBtn = document.createElement('button');
    allBtn.textContent = 'Alle';
    allBtn.className = filterSection === '' ? 'active' : '';
    allBtn.onclick = () => { filterSection = ''; render(); };
    bar.appendChild(allBtn);
    for (const s of sections) {
        const btn = document.createElement('button');
        btn.textContent = s;
        btn.className = filterSection === s ? 'active' : '';
        btn.onclick = () => { filterSection = s; render(); };
        bar.appendChild(btn);
    }
}

function render() {
    const root = document.getElementById('sections');
    root.innerHTML = '';
    let total = 0, done = 0;

    for (const section of sections) {
        const sectionItems = ITEMS.filter((i, idx) => i.section === section);
        const filtered = sectionItems.filter((i, idx) => !filterSection || i.section === filterSection);
        if (filtered.length === 0) continue;

        const secTotal = sectionItems.length;
        const secDone = sectionItems.filter((i, idx) => state[idx]?.done).length;
        total += secTotal; done += secDone;

        const div = document.createElement('div');
        div.className = 'section';

        const header = document.createElement('div');
        header.className = 'section-header';
        const emoji = sectionItems[0]?.emoji || '';
        header.innerHTML = '<span>' + emoji + ' ' + section + '</span><span class="count">' + secDone + '/' + secTotal + '</span>';
        const body = document.createElement('div');
        body.className = 'section-body';
        body.style.display = 'none';

        header.onclick = () => {
            if (openSections.has(section)) openSections.delete(section);
            else openSections.add(section);
            body.style.display = openSections.has(section) ? '' : 'none';
        };

        for (const item of filtered) {
            const idx = ITEMS.indexOf(item);
            const st = state[idx] || { done: false, note: '' };

            const el = document.createElement('div');
            el.className = 'item' + (st.done ? ' done' : '') + (st.editing ? ' editing' : '');

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = st.done;
            cb.onchange = () => {
                st.done = cb.checked;
                state[idx] = st;
                save(state);
                el.classList.toggle('done', st.done);
                updateStats();
            };
            el.appendChild(cb);

            const text = document.createElement('span');
            text.className = 'text';
            text.textContent = item.text;
            el.appendChild(text);

            const noteInput = document.createElement('textarea');
            noteInput.className = 'note-input';
            noteInput.value = st.note || '';
            noteInput.placeholder = 'Notiz…';
            noteInput.onchange = () => {
                st.note = noteInput.value.trim();
                state[idx] = st;
                save(state);
            };
            el.appendChild(noteInput);

            const noteBtn = document.createElement('button');
            noteBtn.className = 'note-btn' + (st.note ? ' has-note' : '');
            noteBtn.textContent = st.note ? '📝' : '📌';
            noteBtn.onclick = (e) => {
                e.stopPropagation();
                st.editing = !st.editing;
                state[idx] = st;
                save(state);
                el.classList.toggle('editing', st.editing);
                if (!st.editing) {
                    noteInput.value = st.note || '';
                    noteBtn.className = 'note-btn' + (st.note ? ' has-note' : '');
                    noteBtn.textContent = st.note ? '📝' : '📌';
                }
                noteInput.focus?.();
            };
            el.appendChild(noteBtn);

            body.appendChild(el);
        }

        div.appendChild(header);
        div.appendChild(body);
        root.appendChild(div);
    }

    document.getElementById('stats').textContent = done + ' / ' + total + ' erledigt' + (done === total ? ' 🎉' : '');
}

function updateStats() {
    const total = ITEMS.length;
    const done = ITEMS.filter((i, idx) => state[idx]?.done).length;
    document.getElementById('stats').textContent = done + ' / ' + total + ' erledigt' + (done === total ? ' 🎉' : '');
}

renderFilters();
render();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'test-tool.html'), html);
console.log('Generated test-tool.html with ' + items.length + ' items');
