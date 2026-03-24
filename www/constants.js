// ── CONSTANTS ─────────────────────────────────────────────────────

const FONT_SCALE_KEY = 'numori-font-scale';

const MAX_HISTORY = 50;

const OPSYMBOL = { '+': '+', '-': '−', '*': '×', '/': ':' };

const DIFF_CODE = { easy: 'E', medium: 'M', hard: 'H', expert: 'X' };
const CODE_DIFF = { E: 'easy', M: 'medium', H: 'hard', X: 'expert' };

const DIFF_BY_SIZE = {
    3: ['easy'],
    4: ['easy', 'medium'],
    5: ['easy', 'medium', 'hard'],
    6: ['easy', 'medium', 'hard'],
    7: ['medium', 'hard', 'expert'],
    8: ['hard', 'expert'],
    9: ['expert'],
};

const DAILY_SCHEDULE = [
    // So  Mo      Di        Mi      Do        Fr      Sa
    { n: 6, diff: 'hard'   },  // 0 = Sonntag
    { n: 4, diff: 'easy'   },  // 1 = Montag
    { n: 4, diff: 'medium' },  // 2 = Dienstag
    { n: 5, diff: 'easy'   },  // 3 = Mittwoch
    { n: 5, diff: 'medium' },  // 4 = Donnerstag
    { n: 5, diff: 'hard'   },  // 5 = Freitag
    { n: 6, diff: 'medium' },  // 6 = Samstag
];
