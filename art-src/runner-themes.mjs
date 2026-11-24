import { svgDoc, rng } from './lib.mjs';

// Extra looks for the running minigame (the rules do not change, only the pictures):
//   ember (to the forge), desert (the exile), forest (the big tree), village (farms and the square), battle (Kirina).
// Each theme has: a sky that repeats sideways, a ground strip, and three obstacles (small, medium, tall).
// Obstacles are drawn at 2x: about 130x90, 150x110 and 120x280 (shown at half size). Bottom-centre = the ground.

const W = 1920;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="9" fill="#000" opacity=".28"/>`;

function wave(base, amp, waves, phase, fill, op = 1, bottom = 1080) {
  let d = `M0 ${bottom}`;
  for (let x = 0; x <= W; x += 16) d += ` L${x} ${(base + amp * Math.sin((2 * Math.PI * waves * x) / W + phase)).toFixed(1)}`;
  return `<path d="${d} L${W} ${bottom} Z" fill="${fill}" opacity="${op}"/>`;
}
const acacia = (x, base, s, fill) => `<g transform="translate(${x} ${base}) scale(${s})" fill="${fill}"><path d="M-6 0 C-4 -40 -8 -70 -16 -96 L16 -96 C10 -70 8 -40 6 0 Z"/><path d="M-120 -100 C-80 -140 -30 -150 0 -140 C30 -152 82 -142 122 -100 C70 -118 30 -118 0 -112 C-30 -118 -70 -118 -120 -100 Z"/></g>`;
const grad = (id, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const sky = (inner) => ({ svg: svgDoc(W, 1080, inner), width: W, height: 1080 });
const strip = (inner) => ({ svg: svgDoc(W, 200, inner), width: W, height: 200 });

// ------------------------------------------------------------------ skies
const SKIES = {
  ember() {
    const r = rng(201); let sparks = '', smoke = '';
    for (let i = 0; i < 90; i++) sparks += `<circle cx="${100 + r() * 1720}" cy="${r() * 860}" r="${1.2 + r() * 3}" fill="${r() > 0.4 ? '#ff9a2e' : '#ffd27a'}" opacity="${0.25 + r() * 0.5}"/>`;
    [[360, 700], [1100, 720], [1620, 690]].forEach(([x, y]) => { smoke += `<g fill="#2a1420" opacity=".5"><rect x="${x - 26}" y="${y - 140}" width="52" height="150" fill="#1a0c14"/><ellipse cx="${x + 10}" cy="${y - 190}" rx="60" ry="90"/><ellipse cx="${x + 36}" cy="${y - 310}" rx="90" ry="50"/></g>`; });
    return sky(`<defs>${grad('s', [[0, '#120a1c'], [0.4, '#6a1f2e'], [0.7, '#c2452e'], [1, '#f0873a']])}<radialGradient id="g"><stop offset="0" stop-color="#ffb347" stop-opacity=".8"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="1080" fill="url(#s)"/><circle cx="1000" cy="800" r="360" fill="url(#g)"/>${smoke}
    ${wave(800, 40, 3, 0.6, '#4a1a30', 0.9)}${wave(860, 30, 4, 2.1, '#2a1020')}${sparks}<rect y="868" width="${W}" height="212" fill="#1c1018"/>`);
  },
  desert() {
    return sky(`<defs>${grad('s', [[0, '#7fa8d8'], [0.5, '#f7e1a0'], [1, '#f2b872']])}<radialGradient id="g"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset="1" stop-color="#f7e1a0" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="1080" fill="url(#s)"/><circle cx="1300" cy="560" r="330" fill="url(#g)"/><circle cx="1300" cy="580" r="72" fill="#fff3c0"/>
    <g fill="#fff" opacity=".4"><ellipse cx="400" cy="200" rx="200" ry="22"/><ellipse cx="1560" cy="290" rx="160" ry="18"/></g>
    ${wave(740, 70, 2, 1.0, '#9a90b0', 0.8)}${wave(800, 40, 3, 0.4, '#c98f5a', 0.95)}${wave(850, 26, 5, 2.2, '#d9a468')}
    ${acacia(520, 862, 0.8, '#3a2a1a')}${acacia(1500, 860, 1, '#3a2a1a')}<rect y="868" width="${W}" height="212" fill="#c28f56"/>`);
  },
  forest() {
    const r = rng(203); let trunks = '', shafts = '', motes = '';
    for (let i = 0; i < 9; i++) { const x = 140 + i * 200 + r() * 40, w = 40 + r() * 30; trunks += `<rect x="${x}" y="120" width="${w}" height="780" fill="#16301f" opacity="${0.6 + r() * 0.3}"/><circle cx="${x + w / 2}" cy="140" r="${90 + r() * 50}" fill="#1f4026" opacity=".9"/>`; }
    for (let i = 0; i < 6; i++) { const x = 200 + i * 300; shafts += `<path d="M${x} 0 L${x + 120} 0 L${x - 80} 880 L${x - 260} 880 Z" fill="#fff6b0" opacity=".07"/>`; }
    for (let i = 0; i < 50; i++) motes += `<circle cx="${100 + r() * 1720}" cy="${200 + r() * 650}" r="${2 + r() * 3}" fill="#fff2b0" opacity="${0.2 + r() * 0.4}"/>`;
    return sky(`<defs>${grad('s', [[0, '#0f2a1f'], [0.5, '#2f5a38'], [1, '#a6c45e']])}</defs>
    <rect width="${W}" height="1080" fill="url(#s)"/>${wave(780, 50, 3, 0.8, '#1f4026', 0.8)}${trunks}${shafts}${wave(850, 30, 4, 2.0, '#16301f')}${motes}<rect y="868" width="${W}" height="212" fill="#16301f"/>`);
  },
  village() {
    const r = rng(204); let huts = '', smoke = '';
    [[360, 0.9], [760, 1.1], [1180, 0.8], [1560, 1.0]].forEach(([x, s], i) => {
      huts += `<g transform="translate(${x} 868) scale(${s})"><path d="M-70 0 L-70 -70 Q0 -84 70 -70 L70 0 Z" fill="${i % 2 ? '#b07a44' : '#c9955a'}"/><path d="M-96 -66 L0 -176 L96 -66 Q0 -50 -96 -66 Z" fill="#a8742e"/><path d="M-16 0 L-16 -40 Q0 -54 16 -40 L16 0 Z" fill="#2a1a10"/></g>`;
      smoke += `<ellipse cx="${x + 20}" cy="${640 - i * 10}" rx="30" ry="60" fill="#fff" opacity=".18"/>`;
    });
    return sky(`<defs>${grad('s', [[0, '#7cc4f0'], [0.7, '#e9f6d0'], [1, '#fbe8b0']])}</defs>
    <rect width="${W}" height="1080" fill="url(#s)"/>
    <g fill="#fff" opacity=".9"><ellipse cx="420" cy="200" rx="170" ry="30"/><ellipse cx="500" cy="176" rx="100" ry="28"/><ellipse cx="1300" cy="270" rx="150" ry="26"/></g>
    ${wave(800, 60, 3, 0.3, '#6f9a6a', 0.85)}${wave(850, 24, 5, 1.7, '#8fb24a')}${smoke}${huts}<rect y="868" width="${W}" height="212" fill="#6f9a43"/>`);
  },
};

// ------------------------------------------------------------------ ground strips (200 tall at 2x)
const GROUNDS = {
  ember() {
    const r = rng(211); let c = '', e = '';
    for (let i = 0; i < 26; i++) { const x = 30 + r() * 1860, y = 50 + r() * 120; c += `<path d="M${x} ${y} l${20 + r() * 40} ${r() * 12 - 6} l${10 + r() * 20} ${r() * 16}" stroke="#ff7a2a" stroke-width="3" fill="none" opacity="${0.4 + r() * 0.4}" stroke-linecap="round"/>`; }
    for (let i = 0; i < 50; i++) e += `<circle cx="${r() * W}" cy="${40 + r() * 150}" r="${1.5 + r() * 3}" fill="#ffb347" opacity="${0.3 + r() * 0.5}"/>`;
    return strip(`<defs>${grad('g', [[0, '#4a3630'], [1, '#1c1210']])}</defs><rect width="${W}" height="200" fill="url(#g)"/><rect width="${W}" height="14" fill="#6a4a3a"/>${c}${e}`);
  },
  desert() {
    const r = rng(212); let rip = '', pb = '';
    for (let i = 0; i < 22; i++) { const x = r() * W, y = 40 + r() * 140; rip += `<path d="M${x} ${y} q40 -10 80 0 t80 0" stroke="#a8794a" stroke-width="3" fill="none" opacity=".4"/>`; }
    for (let i = 0; i < 30; i++) pb += `<ellipse cx="${r() * W}" cy="${50 + r() * 130}" rx="${4 + r() * 8}" ry="${3 + r() * 4}" fill="#b08650" opacity=".7"/>`;
    return strip(`<defs>${grad('g', [[0, '#e8c888'], [1, '#a8794a']])}</defs><rect width="${W}" height="200" fill="url(#g)"/><rect width="${W}" height="12" fill="#f0d6a0"/>${rip}${pb}`);
  },
  forest() {
    const r = rng(213); let l = '', t = '';
    for (let i = 0; i < 40; i++) l += `<ellipse cx="${r() * W}" cy="${40 + r() * 140}" rx="${8 + r() * 12}" ry="${4 + r() * 5}" transform="rotate(${r() * 90} ${r() * W} 100)" fill="${['#a8693a', '#c9955a', '#6f9a43'][i % 3]}" opacity=".6"/>`;
    for (let i = 0; i < 30; i++) { const x = 30 + r() * 1860; t += `<path d="M${x} 28 l-6 -18 M${x} 28 l0 -24 M${x} 28 l6 -18" stroke="#a6c45e" stroke-width="3" stroke-linecap="round"/>`; }
    return strip(`<defs>${grad('g', [[0, '#3f6b34'], [0.18, '#5a3a22'], [1, '#2a1c12']])}</defs><rect width="${W}" height="200" fill="url(#g)"/>${l}${t}`);
  },
  village() {
    const r = rng(214); let st = '', t = '';
    for (let i = 0; i < 40; i++) st += `<ellipse cx="${r() * W}" cy="${50 + r() * 130}" rx="${5 + r() * 10}" ry="${3 + r() * 4}" fill="#a8845a" opacity=".6"/>`;
    for (let i = 0; i < 36; i++) { const x = 30 + r() * 1860; t += `<path d="M${x} 26 l-5 -16 M${x} 26 l0 -22 M${x} 26 l5 -16" stroke="#3f6b34" stroke-width="3" stroke-linecap="round"/>`; }
    return strip(`<defs>${grad('g', [[0, '#6f9a43'], [0.14, '#c9a268'], [1, '#8a6a40']])}</defs><rect width="${W}" height="200" fill="url(#g)"/>${st}${t}`);
  },
  battle() {
    const r = rng(215); let d = '';
    for (let i = 0; i < 40; i++) d += `<ellipse cx="${r() * W}" cy="${40 + r() * 140}" rx="${10 + r() * 24}" ry="${3 + r() * 5}" fill="#1a0c0a" opacity="${0.2 + r() * 0.3}"/>`;
    for (let i = 0; i < 24; i++) { const x = r() * W, y = 40 + r() * 140; d += `<path d="M${x} ${y} l30 -4" stroke="#8a3a2a" stroke-width="3" opacity=".6" stroke-linecap="round"/>`; }
    return strip(`<defs>${grad('g', [[0, '#5a3a32'], [1, '#2a1614']])}</defs><rect width="${W}" height="200" fill="url(#g)"/><rect width="${W}" height="12" fill="#7a4a3a"/>${d}`);
  },
};

// ------------------------------------------------------------------ obstacles: a (small), b (medium), c (tall)
const box = (w, h, inner) => ({ svg: svgDoc(w, h, inner), width: w, height: h });
const OBST = {
  ember: {
    a: () => box(130, 90, `${shadow(65, 84, 56)}<path d="M10 82 L22 44 L44 52 L56 26 L84 46 L100 34 L120 82 Z" fill="#2a1d1a" stroke="#ff7a2a" stroke-width="3" stroke-linejoin="round"/><path d="M40 80 L48 58 L62 64 L72 50 L86 80 Z" fill="#ff7a2a" opacity=".85"/><circle cx="64" cy="48" r="5" fill="#ffd27a"/>`),
    b: () => box(150, 110, `${shadow(75, 104, 64)}<g stroke="#2b2c33" stroke-width="3"><rect x="14" y="76" width="120" height="24" rx="4" fill="#7a7d8a"/><rect x="26" y="50" width="100" height="24" rx="4" fill="#9a9dab"/><rect x="40" y="24" width="72" height="24" rx="4" fill="#ff8a3a"/></g><ellipse cx="76" cy="40" rx="60" ry="30" fill="#ffb347" opacity=".25"/>`),
    c: () => box(120, 280, `${shadow(60, 272, 50)}<path d="M26 270 L40 70 L80 70 L94 270 Z" fill="#6a3a2a"/><path d="M22 70 L98 70 L90 50 L30 50 Z" fill="#4a2a20"/><path d="M40 270 L46 120 M64 270 L62 100 M82 270 L80 130" stroke="#3a1f18" stroke-width="3" opacity=".6"/><ellipse cx="60" cy="52" rx="26" ry="10" fill="#ff7a2a"/><ellipse cx="60" cy="40" rx="48" ry="40" fill="#ffb347" opacity=".25"/><g fill="#3a2a30" opacity=".7"><ellipse cx="70" cy="18" rx="22" ry="14"/><ellipse cx="82" cy="-4" rx="18" ry="10"/></g>`),
  },
  desert: {
    a: () => box(130, 90, `${shadow(65, 84, 52)}<g fill="none" stroke="#6a4a2a" stroke-width="4" stroke-linecap="round"><circle cx="65" cy="50" r="34"/><path d="M36 36 Q65 70 94 36 M32 54 Q65 20 98 54 M48 24 Q70 60 82 76 M82 24 Q62 56 50 76 M34 66 H96"/></g><g stroke="#3a2a14" stroke-width="3"><path d="M30 44 l-10 -4 M100 56 l10 4 M66 14 l0 -8"/></g>`),
    b: () => box(150, 110, `${shadow(75, 104, 60)}<path d="M20 104 C30 70 48 48 60 16 C64 6 86 6 90 16 C102 48 120 70 130 104 Z" fill="#b07a44"/><path d="M34 90 H118 M42 70 H108 M54 48 H96" stroke="#8a5a2a" stroke-width="4" opacity=".7"/><path d="M62 24 Q76 14 88 24" stroke="#d9a468" stroke-width="4" fill="none"/>`),
    c: () => box(120, 280, `${shadow(60, 272, 40)}<path d="M52 272 C50 200 56 140 52 90 L68 90 C66 140 72 200 70 272 Z" fill="#4a3426"/><g stroke="#4a3426" stroke-width="9" stroke-linecap="round" fill="none"><path d="M60 130 C40 110 28 92 14 64"/><path d="M60 106 C70 80 84 60 96 30"/><path d="M60 170 C82 150 96 140 110 110"/></g><g stroke="#4a3426" stroke-width="5" stroke-linecap="round" fill="none"><path d="M24 80 L8 78 M20 74 L26 52 M88 50 L106 46 M92 40 L88 20"/></g>`),
  },
  forest: {
    a: () => box(130, 90, `${shadow(65, 84, 58)}<rect x="8" y="30" width="114" height="52" rx="22" fill="#7a4a2a"/><ellipse cx="112" cy="56" rx="14" ry="26" fill="#d9a468"/><ellipse cx="112" cy="56" rx="8" ry="16" fill="none" stroke="#a8693a" stroke-width="3"/><path d="M12 36 q30 -14 70 -6 q20 4 24 -2" stroke="#6f9a43" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M30 60 H80 M24 70 H70" stroke="#5a3318" stroke-width="3" opacity=".6"/>`),
    b: () => box(150, 110, `${shadow(75, 104, 60)}<g><rect x="30" y="64" width="16" height="40" fill="#f3e3bf"/><ellipse cx="38" cy="64" rx="34" ry="22" fill="#d6452f"/><circle cx="28" cy="58" r="6" fill="#fff"/><circle cx="50" cy="66" r="5" fill="#fff"/></g><g><rect x="88" y="42" width="18" height="62" fill="#f3e3bf"/><ellipse cx="97" cy="44" rx="40" ry="26" fill="#e2552f"/><circle cx="84" cy="38" r="7" fill="#fff"/><circle cx="108" cy="46" r="6" fill="#fff"/><circle cx="96" cy="30" r="4" fill="#fff"/></g>`),
    c: () => box(120, 280, `${shadow(60, 272, 46)}<path d="M36 272 C40 200 34 120 40 60 L82 60 C86 120 80 200 84 272 Z" fill="#5a3a22"/><path d="M48 260 V80 M64 266 V70 M76 260 V90" stroke="#3a2416" stroke-width="3" opacity=".6"/><ellipse cx="60" cy="52" rx="56" ry="46" fill="#1f4026"/><ellipse cx="38" cy="40" rx="30" ry="26" fill="#2a5130"/><path d="M30 80 C20 130 34 170 26 220 M92 80 C102 120 90 160 98 210" stroke="#3f6b34" stroke-width="6" fill="none" stroke-linecap="round"/>`),
  },
  village: {
    a: () => box(130, 90, `${shadow(65, 84, 54)}<path d="M14 84 C6 60 12 44 28 40 L50 40 C66 44 70 60 62 84 Z" fill="#c4572f"/><path d="M62 84 C58 64 64 52 78 48 L100 48 C114 52 118 66 112 84 Z" fill="#a8452a"/><ellipse cx="39" cy="40" rx="12" ry="5" fill="#8f3a1f"/><path d="M20 62 H56 M68 66 H106" stroke="#f3e3bf" stroke-width="4" stroke-dasharray="6 4"/><path d="M36 40 C34 20 46 12 56 6 C66 12 76 20 80 48 Z" fill="#a8452a" opacity="0"/>`),
    b: () => box(150, 110, `${shadow(75, 104, 62)}<path d="M16 100 C6 70 20 50 40 46 L110 46 C130 50 144 70 134 100 Z" fill="#c9955a" stroke="#7a4a2a" stroke-width="3"/><path d="M24 78 H126 M20 62 H130 M30 92 H120" stroke="#8a5a2a" stroke-width="3" opacity=".6"/><g fill="#e0a030"><circle cx="40" cy="42" r="8"/><circle cx="60" cy="36" r="9"/><circle cx="82" cy="36" r="9"/><circle cx="102" cy="42" r="8"/><circle cx="72" cy="28" r="8"/></g>`),
    c: () => box(120, 280, `${shadow(60, 272, 46)}<g fill="#5a3a22"><rect x="22" y="196" width="10" height="76"/><rect x="88" y="196" width="10" height="76"/><rect x="54" y="206" width="10" height="66"/></g><rect x="12" y="188" width="96" height="10" fill="#7a4a2a"/><path d="M20 190 L20 112 Q60 96 100 112 L100 190 Z" fill="#c9955a"/><path d="M8 116 L60 40 L112 116 Q60 100 8 116 Z" fill="#b88a3e"/><path d="M22 120 L60 62 M60 56 L56 108 M96 120 L70 66" stroke="#8a5a2a" stroke-width="3" opacity=".6"/><rect x="48" y="142" width="24" height="30" rx="4" fill="#2a1a10"/>`),
  },
  battle: {
    a: () => box(130, 90, `${shadow(65, 84, 54)}<g transform="rotate(-14 65 56)"><ellipse cx="62" cy="56" rx="40" ry="34" fill="#8a2f1a" stroke="#f3e3bf" stroke-width="5"/><ellipse cx="62" cy="56" rx="14" ry="20" fill="#e0a030"/></g><path d="M16 80 L122 34" stroke="#7a4a2a" stroke-width="7" stroke-linecap="round"/><path d="M118 24 L134 34 L116 42 Z" fill="#c9ccd6"/>`),
    b: () => box(150, 110, `${shadow(75, 104, 62)}<g fill="#7a4a2a" stroke="#3a2416" stroke-width="3" stroke-linejoin="round"><path d="M14 104 L22 30 L34 104 Z"/><path d="M44 104 L52 20 L64 104 Z"/><path d="M76 104 L84 26 L96 104 Z"/><path d="M106 104 L114 34 L126 104 Z"/></g><path d="M10 78 H132 M12 58 H130" stroke="#5a3318" stroke-width="7" stroke-linecap="round"/>`),
    c: () => box(120, 280, `${shadow(60, 272, 40)}<rect x="54" y="20" width="9" height="252" rx="3" fill="#7a4a2a"/><path d="M63 28 L112 44 Q96 64 112 84 L63 96 Z" fill="#8a2f1a" stroke="#f3e3bf" stroke-width="3"/><circle cx="86" cy="62" r="10" fill="#e0a030"/><path d="M50 22 L58 2 L66 22 Z" fill="#c9ccd6"/><path d="M38 272 L58 238 L80 272 Z" fill="#5a3318"/>`),
  },
};

export const THEME_NAMES = Object.keys(GROUNDS);   // ember, desert, forest, village, battle
export const THEME_SKIES = Object.keys(SKIES);     // battle reuses the "battle-sky" picture from battle.mjs

export function themeJobs(assets, svgs) {
  const jobs = [];
  for (const [t, make] of Object.entries(SKIES)) jobs.push({ name: `rt-${t}-sky`, ...make(), type: 'jpeg', quality: 80, out: assets('backgrounds', `rt-${t}-sky.jpg`), svgOut: svgs(`bg-rt-${t}-sky.svg`) });
  for (const [t, make] of Object.entries(GROUNDS)) jobs.push({ name: `rt-${t}-ground`, ...make(), type: 'png', out: assets('backgrounds', `rt-${t}-ground.png`), svgOut: svgs(`bg-rt-${t}-ground.svg`) });
  for (const [t, set] of Object.entries(OBST)) for (const [k, make] of Object.entries(set)) jobs.push({ name: `rt-${t}-${k}`, ...make(), type: 'png', out: assets('props', `rt-${t}-${k}.png`), svgOut: svgs(`prop-rt-${t}-${k}.svg`) });
  return jobs;
}
