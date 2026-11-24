import { C } from './palette.mjs';
import { svgDoc, rng } from './lib.mjs';

// Pictures for the two new minigames: Horse Charge (rider, soldiers, spear, battle sky)
// and Wisdom Catch (knowledge and bad things). Drawn at 2x; bottom = the ground.

const out = (w, h, inner) => ({ svg: svgDoc(w, h, inner), width: w, height: h });

// ---- Horse and rider (facing right). frame: 'a' | 'b' (gallop) | 'jump' ----
function horse(frame) {
  const w = 380, h = 300;
  const legs = {
    a: { f1: [[236, 196], [286, 244], [300, 288]], f2: [[222, 196], [214, 246], [206, 286]], h1: [[112, 198], [74, 246], [58, 286]], h2: [[126, 198], [150, 248], [170, 286]] },
    b: { f1: [[236, 196], [262, 250], [262, 288]], f2: [[222, 196], [250, 238], [292, 262]], h1: [[112, 198], [96, 252], [92, 288]], h2: [[126, 198], [88, 232], [48, 262]] },
    jump: { f1: [[236, 196], [290, 214], [326, 214]], f2: [[222, 196], [276, 228], [312, 232]], h1: [[112, 198], [62, 216], [30, 230]], h2: [[126, 198], [70, 232], [40, 250]] },
  }[frame];
  const lift = frame === 'jump' ? -26 : 0;
  const leg = ([a, b, c], col) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}" stroke="${col}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="${c[0]}" cy="${c[1]}" r="8" fill="#2a1a10"/>`;
  return out(w, h, `
  <ellipse cx="190" cy="294" rx="130" ry="9" fill="#000" opacity=".25"/>
  <g transform="translate(0 ${lift})">
    ${leg(legs.f2, '#4b2a16')}${leg(legs.h2, '#4b2a16')}
    <path d="M70 160 C40 150 24 190 30 230 C44 200 56 184 76 180 Z" fill="#2a1a10"/>
    <ellipse cx="172" cy="170" rx="92" ry="44" fill="#7a4524"/>
    <path d="M232 156 C262 140 276 112 280 92 L312 100 C310 134 290 170 250 198 Z" fill="#7a4524"/>
    <ellipse cx="318" cy="102" rx="38" ry="19" transform="rotate(28 318 102)" fill="#7a4524"/>
    <ellipse cx="334" cy="112" rx="18" ry="12" transform="rotate(28 334 112)" fill="#5a331a"/>
    <circle cx="316" cy="92" r="4.5" fill="#1d1410"/>
    <path d="M276 86 L290 62 L298 90 Z" fill="#7a4524"/>
    <path d="M262 98 C250 110 244 136 238 158 L252 160 C262 138 272 118 282 104 Z" fill="#2a1a10"/>
    ${leg(legs.f1, '#7a4524')}${leg(legs.h1, '#7a4524')}
    <path d="M128 140 L226 140 L222 176 L132 176 Z" fill="${C.clay}"/><path d="M128 140 L226 140 L224 150 L130 150 Z" fill="${C.gold}"/>
    <path d="M296 110 C314 124 326 124 338 120" stroke="${C.gold}" stroke-width="5" fill="none"/>
    <!-- rider -->
    <path d="M138 96 C108 92 88 112 70 142 C98 138 120 130 150 124 Z" fill="${C.teal}" opacity=".9"/>
    <rect x="148" y="70" width="42" height="74" rx="14" fill="${C.cream}"/>
    <rect x="148" y="104" width="42" height="12" fill="${C.gold}"/>
    <path d="M170 130 L204 156 L192 166 L160 142 Z" fill="#8d5a3b"/>
    <circle cx="170" cy="52" r="20" fill="#8d5a3b"/>
    <path d="M148 46 C152 22 190 18 192 46 L192 40 C186 30 154 30 148 46 Z" fill="${C.clay}"/>
    <path d="M148 46 C152 32 190 30 192 44 L192 52 L148 52 Z" fill="${C.clay}"/>
    <circle cx="178" cy="54" r="2.6" fill="#1d1410"/>
    <path d="M176 92 L256 70" stroke="#8d5a3b" stroke-width="12" stroke-linecap="round"/>
    <path d="M222 80 L356 48" stroke="${C.wood}" stroke-width="7" stroke-linecap="round"/>
    <path d="M354 36 L384 46 L356 60 Z" fill="#c9ccd6"/><path d="M354 36 L384 46 L370 48 Z" fill="#fff" opacity=".5"/>
  </g>`);
}

// ---- Soldier of the Sosso army (facing left, towards the rider) ----
function soldier(frame) {
  const w = 150, h = 300;
  const l = frame === 'a' ? [[64, 196, 44, 290], [84, 196, 98, 290]] : [[64, 196, 76, 290], [84, 196, 62, 290]];
  return out(w, h, `
  <ellipse cx="76" cy="292" rx="46" ry="8" fill="#000" opacity=".28"/>
  <path d="M${l[0][0]} ${l[0][1]} L${l[0][2]} ${l[0][3]}" stroke="#2a1a10" stroke-width="18" stroke-linecap="round"/>
  <path d="M${l[1][0]} ${l[1][1]} L${l[1][2]} ${l[1][3]}" stroke="#3a2416" stroke-width="18" stroke-linecap="round"/>
  <rect x="116" y="30" width="7" height="262" rx="3" fill="${C.wood}"/>
  <path d="M112 34 L119 4 L128 34 Z" fill="#b9bcc8"/>
  <path d="M52 100 L100 100 L106 204 L46 204 Z" fill="#5a1f2a"/>
  <path d="M46 196 L106 196 L108 214 L44 214 Z" fill="${C.gold}"/>
  <rect x="56" y="104" width="38" height="10" fill="${C.gold}"/>
  <circle cx="76" cy="72" r="23" fill="#4a2c1c"/>
  <path d="M52 66 C54 38 98 38 100 66 L100 58 L76 28 L52 58 Z" fill="#1d1410"/>
  <path d="M60 52 L76 20 L92 52 Z" fill="${C.clay2}"/>
  <circle cx="64" cy="76" r="3" fill="#fff"/><circle cx="64" cy="76" r="1.6" fill="#1d1410"/>
  <path d="M54 88 L70 84" stroke="#1d1410" stroke-width="3"/>
  <path d="M96 120 L116 150" stroke="#4a2c1c" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="34" cy="150" rx="26" ry="46" fill="${C.clay2}" stroke="${C.cream}" stroke-width="4"/>
  <ellipse cx="34" cy="150" rx="10" ry="18" fill="${C.gold}"/>
  <path d="M40 130 L58 142" stroke="#4a2c1c" stroke-width="12" stroke-linecap="round"/>`);
}

function spear() {
  return out(150, 28, `
  <path d="M6 14 L116 14" stroke="${C.wood}" stroke-width="6" stroke-linecap="round"/>
  <path d="M112 3 L146 14 L112 25 Z" fill="#d9dce6"/><path d="M112 3 L146 14 L128 14 Z" fill="#fff" opacity=".55"/>
  <path d="M6 14 L22 5 M6 14 L22 23 M20 14 L34 6 M20 14 L34 22" stroke="${C.clay}" stroke-width="4" stroke-linecap="round"/>`);
}

// ---- Knowledge (good) and bad things, 88 x 88 ----
const glow = (col) => `<defs><radialGradient id="g"><stop offset="0" stop-color="${col}" stop-opacity=".75"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="44" cy="44" r="43" fill="url(#g)"/>`;
const fall = (inner) => out(88, 88, inner);

const GOOD = {
  'know-scroll': () => fall(`${glow('#ffe08a')}
    <rect x="22" y="26" width="44" height="38" rx="4" fill="${C.cream}"/>
    <ellipse cx="22" cy="45" rx="8" ry="20" fill="#e3c58f"/><ellipse cx="66" cy="45" rx="8" ry="20" fill="#e3c58f"/>
    <path d="M30 36 H58 M30 45 H58 M30 54 H50" stroke="${C.clay2}" stroke-width="3" stroke-linecap="round"/>
    <rect x="40" y="62" width="8" height="12" fill="${C.clay}"/>`),
  'know-adinkra': () => fall(`${glow('#7fe0dc')}
    <circle cx="44" cy="44" r="25" fill="${C.teal}" stroke="${C.gold}" stroke-width="4"/>
    <path d="M44 62 C30 52 26 44 28 38 C30 31 40 31 44 38 C48 31 58 31 60 38 C62 44 58 52 44 62 Z" fill="${C.gold}"/>
    <circle cx="44" cy="44" r="4" fill="${C.cream}"/>`),
  'know-light': () => fall(`${glow('#fff3b0')}
    <path d="M44 14 L52 36 L75 38 L57 53 L63 76 L44 63 L25 76 L31 53 L13 38 L36 36 Z" fill="#ffd54a" stroke="#c98a1a" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="44" cy="46" r="7" fill="#fff8d6"/>`),
};
const BAD = {
  'bad-thorn': () => fall(`${glow('#7a1a3a')}
    <g fill="#2a1535" stroke="#e2455a" stroke-width="2.5" stroke-linejoin="round">
    <path d="M44 6 L51 28 L72 16 L60 36 L82 44 L60 52 L72 72 L51 60 L44 82 L37 60 L16 72 L28 52 L6 44 L28 36 L16 16 L37 28 Z"/></g>
    <circle cx="44" cy="44" r="11" fill="#e2455a"/><path d="M38 40 L50 48 M50 40 L38 48" stroke="#2a1535" stroke-width="3.5" stroke-linecap="round"/>`),
  'bad-stone': () => fall(`${glow('#7a1a3a')}
    <path d="M14 58 L24 28 L46 16 L68 26 L76 54 L58 72 L28 70 Z" fill="#4c4a58" stroke="#e2455a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 28 L40 40 L46 16 M40 40 L28 70 M40 40 L58 72 M40 40 L68 26" stroke="#2a2833" stroke-width="2.5" fill="none"/>
    <path d="M30 52 L38 46 M52 54 L60 48" stroke="#e2455a" stroke-width="3.5" stroke-linecap="round"/>`),
  'bad-vial': () => fall(`${glow('#7a1a3a')}
    <path d="M36 12 H52 V30 C70 40 76 56 70 68 C64 78 24 78 18 68 C12 56 18 40 36 30 Z" fill="#3c8a4a" stroke="#e2455a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="34" y="8" width="20" height="9" rx="3" fill="#6b4a2a"/>
    <circle cx="36" cy="56" r="6" fill="#a6e86a"/><circle cx="52" cy="62" r="4" fill="#a6e86a"/><circle cx="50" cy="48" r="3" fill="#a6e86a"/>
    <path d="M40 38 L48 46 M48 38 L40 46" stroke="#1d1410" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>`),
};

export const BATTLE_PROPS = {
  'horse-a': () => horse('a'), 'horse-b': () => horse('b'), 'horse-jump': () => horse('jump'),
  'soldier-a': () => soldier('a'), 'soldier-b': () => soldier('b'), spear,
  ...GOOD, ...BAD,
};

// ---- Battle backdrop (repeats sideways, like runner-sky) ----
export function battleSky() {
  const W = 1920;
  const r = rng(404);
  const wave = (base, amp, waves, phase, fill, op = 1) => {
    let d = 'M0 1080';
    for (let x = 0; x <= W; x += 16) d += ` L${x} ${(base + amp * Math.sin((2 * Math.PI * waves * x) / W + phase)).toFixed(1)}`;
    return `<path d="${d} L${W} 1080 Z" fill="${fill}" opacity="${op}"/>`;
  };
  let smoke = '';
  [[260, 560], [900, 600], [1480, 540]].forEach(([x, y], i) => {
    smoke += `<g fill="#2a1a22" opacity=".55"><ellipse cx="${x}" cy="${y}" rx="46" ry="150"/><ellipse cx="${x + 20}" cy="${y - 150}" rx="80" ry="60"/><ellipse cx="${x - 10}" cy="${y - 230}" rx="110" ry="50" opacity=".7"/></g>`;
  });
  let spears = '';
  for (let i = 0; i < 18; i++) {
    const x = 60 + i * 100 + r() * 40;
    spears += `<g transform="translate(${x} 880)" fill="#1d0f14"><rect x="-2" y="-${110 + r() * 50}" width="4" height="${120 + r() * 50}"/><path d="M-7 -${108 + r() * 50} L0 -${140 + r() * 50} L7 -${108 + r() * 50} Z"/></g>`;
  }
  const inner = `
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1a0f20"/><stop offset=".35" stop-color="#5a1f36"/><stop offset=".62" stop-color="#c0452a"/><stop offset=".82" stop-color="#f0873a"/><stop offset="1" stop-color="#ffc56b"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset="1" stop-color="#f0873a" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="1080" fill="url(#sky)"/>
  <circle cx="1200" cy="780" r="320" fill="url(#glow)"/><circle cx="1200" cy="790" r="82" fill="#ffe08a"/>
  ${smoke}${wave(820, 36, 3, 1.0, '#6a2a3a', 0.95)}${wave(870, 26, 4, 2.4, '#3a1a28')}${spears}
  <rect y="880" width="${W}" height="200" fill="#2a1424"/>`;
  return { svg: svgDoc(W, 1080, inner), width: W, height: 1080 };
}
