import { svgDoc, rng } from './lib.mjs';

// Five new story places, each used by ONE part of one trail so no picture is repeated:
//   kangaba-hall (Lion's Path 1), forge (2), exile-plains (3), farm-village (Web of Wisdom 2), village-square (4).
// Same rules as the other area pictures: 1920 x 1080, the back wall / horizon fills the top 345 px,
// the floor below it is where people walk.

const W = 1920, H = 1080, HORIZON = 345;
const out = (inner) => ({ svg: svgDoc(W, H, inner), width: W, height: H });
const DEFS = (extra = '') => `<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .16 0"/></filter>
  <radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
  <radialGradient id="glowO"><stop offset="0" stop-color="#ffb347" stop-opacity=".85"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowY"><stop offset="0" stop-color="#fff0a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffd54a" stop-opacity="0"/></radialGradient>${extra}</defs>`;
const FINISH = `<rect width="${W}" height="${H}" filter="url(#grain)"/><rect width="${W}" height="${H}" fill="url(#vig)"/>`;
const seamShadow = `<rect y="${HORIZON - 2}" width="${W}" height="14" fill="#000" opacity=".22"/>`;

function ridge(baseY, amp, seed, fill, opacity = 1, step = 170, bottom = HORIZON + 8) {
  const r = rng(seed); const pts = [];
  for (let x = -step; x <= W + step; x += step) pts.push([x, baseY - r() * amp]);
  let d = `M${pts[0][0]} ${bottom} L${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], cx = (x0 + x1) / 2; d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`; }
  return `<path d="${d} L${pts.at(-1)[0]} ${bottom} Z" fill="${fill}" opacity="${opacity}"/>`;
}

function hut(x, base, s, wall, roof, lit = false) {
  return `<g transform="translate(${x} ${base}) scale(${s})">
    <path d="M-70 0 L-70 -70 Q0 -84 70 -70 L70 0 Z" fill="${wall}"/>
    <path d="M-96 -66 L0 -176 L96 -66 Q0 -50 -96 -66 Z" fill="${roof}"/>
    <path d="M-60 -70 L0 -150 M-20 -64 L10 -160 M24 -62 L36 -150 M-84 -66 L-44 -118 M66 -60 L52 -116" stroke="#000" stroke-width="3" opacity=".22"/>
    <path d="M-16 0 L-16 -40 Q0 -54 16 -40 L16 0 Z" fill="${lit ? '#ffb347' : '#1d120b'}"/>
    ${lit ? '<ellipse cx="0" cy="-20" rx="70" ry="40" fill="url(#glowO)"/>' : ''}</g>`;
}

const acacia = (x, base, s, fill) => `<g transform="translate(${x} ${base}) scale(${s})" fill="${fill}">
  <path d="M-6 0 C-4 -40 -8 -70 -16 -96 L16 -96 C10 -70 8 -40 6 0 Z"/>
  <path d="M-120 -100 C-80 -140 -30 -150 0 -140 C30 -152 82 -142 122 -100 C70 -118 30 -118 0 -112 C-30 -118 -70 -118 -120 -100 Z"/></g>`;

const tufts = (r, n, y0, y1, colA, colB, op = 0.7) => {
  let s = '';
  for (let i = 0; i < n; i++) { const x = r() * W, y = y0 + r() * (y1 - y0); s += `<path d="M${x} ${y} l-4 -14 M${x} ${y} l0 -19 M${x} ${y} l4 -14" stroke="${r() > 0.5 ? colA : colB}" stroke-width="3" stroke-linecap="round" opacity="${op}"/>`; }
  return s;
};

// ------------------------------------------------------------------ Kangaba: the royal hall (night, torchlight)
export function kangabaHall() {
  const r = rng(101);
  let band = '', pillars = '', tiles = '';
  for (let i = 0; i < 48; i++) { const x = 20 + i * 40; band += `<path d="M${x} 288 l16 -18 l16 18 l-16 18 Z" fill="#f3e3bf" opacity=".85"/><path d="M${x + 16} 276 l5 12 l-5 12 l-5 -12 Z" fill="#c4572f"/>`; }
  for (const x of [250, 600, 1320, 1670]) {
    pillars += `<rect x="${x - 36}" y="0" width="72" height="${HORIZON}" fill="url(#pil)"/>`;
    for (let k = 0; k < 7; k++) pillars += `<path d="M${x - 30} ${40 + k * 42} l15 14 l15 -14 l15 14 l15 -14" stroke="#3a1f10" stroke-width="5" fill="none" opacity=".6"/>`;
    pillars += `<rect x="${x - 46}" y="${HORIZON - 26}" width="92" height="26" fill="#5a3320"/><rect x="${x - 46}" y="0" width="92" height="20" fill="#5a3320"/>`;
  }
  for (let i = 0; i < 20; i++) { const x = r() * W, y = HORIZON + 30 + r() * 700; tiles += `<ellipse cx="${x}" cy="${y}" rx="${30 + r() * 60}" ry="${6 + r() * 10}" fill="#000" opacity="${0.05 + r() * 0.07}"/>`; }
  const lamp = (x, y) => `<circle cx="${x}" cy="${y}" r="190" fill="url(#glowO)" opacity=".7"/><path d="M${x} 0 V${y - 30}" stroke="#2a1a10" stroke-width="4"/><path d="M${x - 24} ${y - 30} h48 l-8 44 h-32 Z" fill="#c9955a" stroke="#5a3320" stroke-width="4"/><ellipse cx="${x}" cy="${y + 6}" rx="10" ry="16" fill="#ffe08a"/>`;
  const torch = (x) => `<rect x="${x - 6}" y="200" width="12" height="90" fill="#4a2a14"/><circle cx="${x}" cy="196" r="150" fill="url(#glowO)"/><path d="M${x} 150 C${x - 26} 180 ${x - 18} 204 ${x} 204 C${x + 18} 204 ${x + 26} 180 ${x} 150 Z" fill="#ff9a2e"/><path d="M${x} 170 C${x - 10} 186 ${x - 8} 200 ${x} 200 C${x + 8} 200 ${x + 10} 186 ${x} 170 Z" fill="#ffe08a"/>`;
  return out(`${DEFS(`<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a3a22"/><stop offset="1" stop-color="#a8693a"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4426"/><stop offset="1" stop-color="#2e1c10"/></linearGradient>
  <linearGradient id="pil" x1="0" x2="1"><stop offset="0" stop-color="#7a4a2a"/><stop offset=".5" stop-color="#a8693a"/><stop offset="1" stop-color="#5a3320"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#floor)"/><rect width="${W}" height="${HORIZON}" fill="url(#wall)"/>
  <path d="M810 ${HORIZON} V150 Q960 40 1110 150 V${HORIZON} Z" fill="#1a0f0a" stroke="#5a3320" stroke-width="18"/>
  <ellipse cx="960" cy="260" rx="120" ry="150" fill="url(#glowO)" opacity=".55"/>
  <path d="M810 150 Q960 40 1110 150" fill="none" stroke="#e0a030" stroke-width="6"/>
  <rect y="262" width="${W}" height="52" fill="#2a1a10" opacity=".78"/>${band}
  ${pillars}${torch(740)}${torch(1180)}${lamp(430, 120)}${lamp(1490, 120)}
  ${seamShadow}${tiles}
  <ellipse cx="960" cy="470" rx="620" ry="70" fill="#ff9a2e" opacity=".10"/><ellipse cx="430" cy="600" rx="260" ry="60" fill="#ff9a2e" opacity=".07"/><ellipse cx="1490" cy="600" rx="260" ry="60" fill="#ff9a2e" opacity=".07"/>
  ${FINISH}`);
}

// ------------------------------------------------------------------ the forge (dusk, furnace glow, embers)
export function forge() {
  const r = rng(102);
  let embers = '', lumps = '', smoke = '', bars = '';
  for (let i = 0; i < 110; i++) embers += `<circle cx="${r() * W}" cy="${HORIZON + 20 + r() * 700}" r="${1.5 + r() * 4}" fill="${r() > 0.4 ? '#ff9a2e' : '#ffd27a'}" opacity="${0.35 + r() * 0.5}"/>`;
  for (let i = 0; i < 60; i++) lumps += `<ellipse cx="${r() * W}" cy="${HORIZON + 40 + r() * 700}" rx="${8 + r() * 22}" ry="${4 + r() * 8}" fill="#120c0a" opacity="${0.4 + r() * 0.4}"/>`;
  [[520, 300], [1380, 260]].forEach(([x, y]) => { smoke += `<g fill="#2a1a22" opacity=".5"><ellipse cx="${x}" cy="${y}" rx="40" ry="110"/><ellipse cx="${x + 20}" cy="${y - 120}" rx="70" ry="50"/><ellipse cx="${x - 10}" cy="${y - 190}" rx="100" ry="40" opacity=".7"/></g>`; });
  for (let i = 0; i < 6; i++) bars += `<rect x="${1480 + i * 8}" y="${280 - i * 3}" width="8" height="64" fill="#6a6d7a" stroke="#2b2c33" stroke-width="2"/>`;
  return out(`${DEFS(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0f20"/><stop offset=".5" stop-color="#8a2f3a"/><stop offset="1" stop-color="#f0873a"/></linearGradient>
  <linearGradient id="ash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3630"/><stop offset="1" stop-color="#1e1512"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#ash)"/><rect width="${W}" height="${HORIZON + 6}" fill="url(#sky)"/>
  ${ridge(330, 50, 7, '#4a2142', 0.9)}${smoke}
  ${hut(210, 336, 1.15, '#4a2a1c', '#2a1a14')}${hut(1700, 336, 1.05, '#4a2a1c', '#2a1a14', true)}
  <g transform="translate(960 ${HORIZON + 4})">
    <path d="M-330 0 L-330 -150 L330 -150 L330 0 Z" fill="#3a2418"/>
    <path d="M-400 -146 L0 -300 L400 -146 Q0 -120 -400 -146 Z" fill="#6a4a22"/>
    <path d="M-340 -140 L-20 -270 M-200 -134 L40 -278 M-60 -130 L120 -270 M100 -132 L240 -240 M-300 -138 L-150 -230 M240 -136 L320 -196" stroke="#2a1a0c" stroke-width="5" opacity=".5"/>
    <rect x="-250" y="-150" width="500" height="150" fill="#1a0e0a"/>
    <ellipse cx="0" cy="-60" rx="260" ry="130" fill="url(#glowO)"/>
    <path d="M-120 0 L-100 -90 Q0 -130 100 -90 L120 0 Z" fill="#7a3a22"/><path d="M-80 0 L-66 -64 Q0 -90 66 -64 L80 0 Z" fill="#ff7a2a"/><path d="M-50 0 L-40 -44 Q0 -62 40 -44 L50 0 Z" fill="#ffd27a"/>
    <rect x="-300" y="-110" width="40" height="110" fill="#2a1a12"/><rect x="260" y="-110" width="40" height="110" fill="#2a1a12"/>
  </g>
  ${bars}${seamShadow}
  <ellipse cx="960" cy="420" rx="640" ry="80" fill="#ff7a2a" opacity=".22"/><ellipse cx="960" cy="400" rx="330" ry="40" fill="#ffd27a" opacity=".18"/>
  ${lumps}${embers}${FINISH}`);
}

// ------------------------------------------------------------------ exile: dry plains and far mountains
export function exilePlains() {
  const r = rng(103);
  let cracks = '', pebbles = '', haze = '';
  for (let i = 0; i < 40; i++) { const x = r() * W, y = HORIZON + 60 + r() * 640; cracks += `<path d="M${x} ${y} l${20 + r() * 50} ${r() * 14 - 7} l${10 + r() * 30} ${r() * 20 - 4} M${x + 20} ${y + 2} l${r() * 30 - 15} ${14 + r() * 20}" stroke="#7a5428" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>`; }
  for (let i = 0; i < 50; i++) pebbles += `<ellipse cx="${r() * W}" cy="${HORIZON + 40 + r() * 700}" rx="${5 + r() * 12}" ry="${3 + r() * 6}" fill="${r() > 0.5 ? '#8a6a44' : '#c9a468'}" opacity=".8"/>`;
  for (let i = 0; i < 12; i++) haze += `<ellipse cx="${r() * W}" cy="${HORIZON + 12 + r() * 14}" rx="${120 + r() * 200}" ry="10" fill="#fff3c8" opacity=".12"/>`;
  return out(`${DEFS(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb4d8"/><stop offset=".55" stop-color="#f7e1a0"/><stop offset="1" stop-color="#f2b872"/></linearGradient>
  <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b277"/><stop offset="1" stop-color="#9a6f3c"/></linearGradient>
  <radialGradient id="sun"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset="1" stop-color="#f7e1a0" stop-opacity="0"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#sand)"/><rect width="${W}" height="${HORIZON + 6}" fill="url(#sky)"/>
  <circle cx="1450" cy="210" r="260" fill="url(#sun)"/><circle cx="1450" cy="214" r="58" fill="#fff3c0"/>
  <g fill="#fff" opacity=".35"><ellipse cx="400" cy="90" rx="190" ry="20"/><ellipse cx="520" cy="72" rx="110" ry="16"/><ellipse cx="1000" cy="130" rx="150" ry="14"/></g>
  ${ridge(300, 120, 31, '#8d8aa6', 0.85, 240)}${ridge(325, 60, 32, '#b7866a', 0.95, 200)}${ridge(342, 22, 33, '#cf9b62', 1, 130)}
  ${acacia(300, 340, 0.8, '#3a2a1a')}${acacia(1640, 342, 1, '#3a2a1a')}
  ${haze}${seamShadow}${cracks}${pebbles}${tufts(r, 90, HORIZON + 40, 1060, '#9a7a38', '#b8923e', 0.75)}
  <path d="M0 520 C300 500 600 540 900 515 C1300 490 1600 535 1920 510" stroke="#fff3c8" stroke-width="4" fill="none" opacity=".12"/>
  ${FINISH}`);
}

// ------------------------------------------------------------------ the farming village (bright day)
export function farmVillage() {
  const r = rng(104);
  let fields = '', crops = '', clouds = '', patches = '';
  for (let i = 0; i < 18; i++) fields += `<rect x="${i * 110}" y="${296 + (i % 2) * 4}" width="104" height="42" fill="${i % 2 ? '#a6c45e' : '#8fb24a'}" opacity=".9"/>`;
  [[300, 90, 1], [900, 60, 1.3], [1500, 110, 0.9]].forEach(([x, y, s]) => { clouds += `<g fill="#fff" opacity=".85" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="130" ry="30"/><ellipse cx="70" cy="-20" rx="80" ry="28"/><ellipse cx="-60" cy="-14" rx="70" ry="24"/></g>`; });
  for (const [x, y, w] of [[150, 760, 360], [1620, 800, 380]]) {
    patches += `<rect x="${x - w / 2}" y="${y}" width="${w}" height="170" rx="30" fill="#5a3a22" opacity=".7"/>`;
    for (let k = 0; k < 5; k++) for (let m = 0; m < 9; m++) crops += `<path d="M${x - w / 2 + 26 + m * (w / 9.3)} ${y + 30 + k * 30} q-8 -16 -14 -24 M${x - w / 2 + 26 + m * (w / 9.3)} ${y + 30 + k * 30} q8 -16 14 -24" stroke="#7fae4a" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  const granary = (x) => `<g transform="translate(${x} 336)"><rect x="-40" y="-40" width="8" height="40" fill="#5a3a22"/><rect x="32" y="-40" width="8" height="40" fill="#5a3a22"/><rect x="-52" y="-120" width="104" height="82" rx="16" fill="#c9955a"/><path d="M-70 -116 L0 -176 L70 -116 Z" fill="#b88a3e"/></g>`;
  return out(`${DEFS(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f0"/><stop offset="1" stop-color="#e9f6d0"/></linearGradient>
  <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fae4a"/><stop offset="1" stop-color="#4c7a34"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#grass)"/><rect width="${W}" height="${HORIZON + 6}" fill="url(#sky)"/>${clouds}
  ${ridge(300, 70, 41, '#6f9a6a', 0.8, 220)}${fields}
  ${hut(180, 330, 0.9, '#c9955a', '#a8742e')}${hut(520, 336, 1.1, '#d9a468', '#b88a3e')}${granary(760)}${hut(1160, 334, 1.0, '#c9955a', '#a8742e')}${granary(1400)}${hut(1740, 336, 1.15, '#d9a468', '#b88a3e')}
  ${seamShadow}
  <path d="M760 ${HORIZON} C800 520 700 700 600 ${H} L1320 ${H} C1220 700 1120 520 1160 ${HORIZON} Z" fill="#c9a268" opacity=".55"/>
  ${patches}${crops}${tufts(r, 140, HORIZON + 30, 1070, '#a6c45e', '#3f6b34', 0.8)}
  ${[...Array(24)].map(() => `<circle cx="${r() * W}" cy="${HORIZON + 40 + r() * 700}" r="${3 + r() * 3}" fill="${['#fff', '#ffd54a', '#f08a8a'][Math.floor(r() * 3)]}" opacity=".85"/>`).join('')}
  ${FINISH}`);
}

// ------------------------------------------------------------------ the village square at twilight (wisdom lights)
export function villageSquare() {
  const r = rng(105);
  let stars = '', lights = '', motes = '', ring = '';
  for (let i = 0; i < 90; i++) stars += `<circle cx="${r() * W}" cy="${r() * 220}" r="${0.8 + r() * 1.8}" fill="#fff" opacity="${0.25 + r() * 0.6}"/>`;
  let d = 'M60 120'; for (let i = 1; i <= 24; i++) d += ` L${60 + i * 77.5} ${120 + Math.sin((i / 24) * Math.PI * 4) * 0 + 36 * Math.abs(Math.sin((i / 24) * Math.PI * 4))}`;
  for (let i = 0; i < 25; i++) { const x = 60 + i * 77.5, y = 120 + 36 * Math.abs(Math.sin((i / 24) * Math.PI * 4)); lights += `<circle cx="${x}" cy="${y}" r="38" fill="url(#glowY)" opacity=".7"/><circle cx="${x}" cy="${y}" r="7" fill="#fff0a8"/>`; }
  for (let i = 0; i < 46; i++) motes += `<circle cx="${r() * W}" cy="${HORIZON + 20 + r() * 720}" r="${3 + r() * 5}" fill="#fff0a8" opacity="${0.25 + r() * 0.5}"/><circle cx="${r() * W}" cy="${HORIZON + 20 + r() * 720}" r="22" fill="url(#glowY)" opacity=".25"/>`;
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; ring += `<ellipse cx="${960 + Math.cos(a) * 620}" cy="${700 + Math.sin(a) * 190}" rx="${14 + r() * 8}" ry="${8 + r() * 4}" fill="${i % 2 ? '#c9a468' : '#e3c58f'}" opacity=".7"/>`; }
  return out(`${DEFS(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14103a"/><stop offset=".55" stop-color="#6a2f6a"/><stop offset="1" stop-color="#f08a4b"/></linearGradient>
  <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5f3a"/><stop offset="1" stop-color="#4a2f1c"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#earth)"/><rect width="${W}" height="${HORIZON + 6}" fill="url(#sky)"/>${stars}
  <circle cx="1560" cy="110" r="54" fill="#fff6d0"/><circle cx="1560" cy="110" r="150" fill="url(#glowY)" opacity=".4"/>
  ${ridge(318, 50, 51, '#3a1f4a', 0.95, 200)}
  ${hut(200, 336, 1.1, '#2a1a26', '#1a1018', true)}${hut(560, 338, 0.9, '#2a1a26', '#1a1018')}${hut(1380, 338, 0.95, '#2a1a26', '#1a1018', true)}${hut(1730, 336, 1.15, '#2a1a26', '#1a1018')}
  <g transform="translate(960 ${HORIZON + 2}) scale(.55)" fill="#1a1018"><path d="M-92 0 C-84 -90 -64 -200 -60 -300 C-58 -340 -66 -362 -64 -376 L64 -376 C66 -362 58 -340 60 -300 C64 -200 84 -90 92 0 Z"/>
    <g fill="none" stroke="#1a1018" stroke-width="30" stroke-linecap="round"><path d="M-50 -360 C-90 -400 -150 -420 -210 -440"/><path d="M0 -376 C0 -440 6 -500 0 -560"/><path d="M50 -360 C90 -400 150 -420 214 -440"/></g>
    <circle cx="-214" cy="-446" r="42"/><circle cx="0" cy="-568" r="46"/><circle cx="218" cy="-446" r="42"/><circle cx="-110" cy="-520" r="36"/><circle cx="116" cy="-520" r="36"/></g>
  <path d="${d}" stroke="#2a1a10" stroke-width="3" fill="none" opacity=".6"/>${lights}
  ${seamShadow}<ellipse cx="960" cy="700" rx="660" ry="210" fill="#5a3a22" opacity=".45"/>${ring}
  <ellipse cx="960" cy="640" rx="360" ry="90" fill="#ffb347" opacity=".12"/>${motes}${FINISH}`);
}

export const PLACE_BACKGROUNDS = { 'kangaba-hall': kangabaHall, forge, 'exile-plains': exilePlains, 'farm-village': farmVillage, 'village-square': villageSquare };
