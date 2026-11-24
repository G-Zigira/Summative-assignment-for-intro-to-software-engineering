import { C } from './palette.mjs';
import { svgDoc, rng } from './lib.mjs';

// Props and backgrounds added for the Lion's Path and Web of Wisdom trails.
// Same rules as props.mjs: drawn at 2x, bottom-centre = where the object touches the ground.

const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".28"/>`;
const out = (w, h, inner) => ({ svg: svgDoc(w, h, inner), width: w, height: h });

function kora() {
  const w = 220, h = 300;
  let strings = '';
  for (let i = 0; i < 7; i++) strings += `<path d="M${96 + i * 5} 40 L${84 + i * 8} 196" stroke="#f3e3bf" stroke-width="1.6" opacity=".9"/>`;
  return out(w, h, `
  ${shadow(110, 286, 62, 10)}
  <rect x="104" y="20" width="12" height="190" rx="5" fill="${C.wood}"/>
  <g fill="${C.gold}"><circle cx="100" cy="36" r="4"/><circle cx="120" cy="50" r="4"/><circle cx="100" cy="64" r="4"/><circle cx="120" cy="78" r="4"/></g>
  <ellipse cx="110" cy="232" rx="62" ry="54" fill="#a8693a"/><ellipse cx="110" cy="232" rx="62" ry="54" fill="none" stroke="${C.wood}" stroke-width="5"/>
  <ellipse cx="110" cy="222" rx="48" ry="40" fill="#e3c58f"/>
  <circle cx="82" cy="216" r="3" fill="${C.wood}"/><circle cx="138" cy="216" r="3" fill="${C.wood}"/><circle cx="110" cy="248" r="3" fill="${C.wood}"/>
  <rect x="86" y="196" width="48" height="7" rx="3" fill="${C.wood}"/>
  ${strings}`);
}

function ironRod() {
  const w = 120, h = 340;
  return out(w, h, `
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#4b4d57"/><stop offset=".5" stop-color="#8a8d99"/><stop offset="1" stop-color="#3a3c46"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#ffb347" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient></defs>
  ${shadow(60, 326, 44, 8)}
  <ellipse cx="60" cy="318" rx="40" ry="14" fill="#6b5a48"/><ellipse cx="60" cy="312" rx="34" ry="10" fill="#8a7560"/>
  <rect x="52" y="30" width="16" height="286" rx="7" fill="url(#g)"/>
  <rect x="48" y="130" width="24" height="8" rx="3" fill="#2b2c33"/><rect x="48" y="220" width="24" height="8" rx="3" fill="#2b2c33"/>
  <circle cx="60" cy="36" r="46" fill="url(#glow)"/><rect x="52" y="22" width="16" height="40" rx="7" fill="#ff8a3a"/>`);
}

function anvil() {
  const w = 240, h = 200;
  return out(w, h, `
  ${shadow(120, 188, 92, 10)}
  <path d="M70 188 L84 120 L156 120 L170 188 Z" fill="#7a4a2a"/><path d="M84 120 L156 120 L160 134 L80 134 Z" fill="#a8693a"/>
  <path d="M48 70 L190 70 C206 70 214 84 196 96 L160 100 L158 118 L82 118 L80 100 L58 98 C46 90 44 78 48 70 Z" fill="#555865"/>
  <path d="M48 70 L190 70 L186 80 L52 80 Z" fill="#8a8d99"/>
  <rect x="172" y="104" width="12" height="82" rx="4" transform="rotate(18 178 150)" fill="${C.wood}"/><rect x="160" y="96" width="44" height="22" rx="5" transform="rotate(18 182 107)" fill="#3a3c46"/>
  <circle cx="60" cy="150" r="6" fill="#ff8a3a" opacity=".8"/><circle cx="48" cy="164" r="4" fill="#ffb347" opacity=".8"/>`);
}

function tent() {
  const w = 320, h = 260;
  return out(w, h, `
  ${shadow(160, 248, 140, 12)}
  <path d="M20 244 L160 40 L300 244 Z" fill="${C.clay}"/>
  <path d="M160 40 L300 244 L226 244 Z" fill="${C.clay2}" opacity=".55"/>
  <path d="M160 40 L112 244 M160 40 L208 244" stroke="${C.cream}" stroke-width="6" opacity=".8"/>
  <path d="M130 244 L160 130 L190 244 Z" fill="#2a1710"/>
  <path d="M40 214 L280 214" stroke="${C.gold}" stroke-width="6" stroke-dasharray="14 10"/>
  <rect x="158" y="14" width="4" height="34" fill="${C.wood}"/><path d="M162 14 L196 24 L162 34 Z" fill="${C.gold}"/>`);
}

function spears() {
  const w = 240, h = 300;
  let sp = '';
  [[70, -6], [120, 0], [170, 6]].forEach(([x, a]) => { sp += `<g transform="rotate(${a} ${x} 280)"><rect x="${x - 3}" y="30" width="6" height="252" rx="3" fill="${C.wood}"/><path d="M${x} 6 L${x + 11} 40 L${x} 34 L${x - 11} 40 Z" fill="#9aa0ad"/></g>`; });
  return out(w, h, `
  ${shadow(120, 288, 86, 10)}
  <rect x="40" y="246" width="160" height="12" rx="5" fill="${C.wood2}"/>
  ${sp}
  <circle cx="120" cy="196" r="52" fill="${C.clay}" stroke="${C.wood}" stroke-width="7"/>
  <circle cx="120" cy="196" r="34" fill="none" stroke="${C.cream}" stroke-width="5"/><circle cx="120" cy="196" r="13" fill="${C.gold}"/>`);
}

function wisdomPot() {
  const w = 260, h = 280;
  return out(w, h, `
  <defs><radialGradient id="glow"><stop offset="0" stop-color="#fff2b0" stop-opacity=".85"/><stop offset="1" stop-color="#ffd35a" stop-opacity="0"/></radialGradient>
  <radialGradient id="clay" cx=".4" cy=".35"><stop offset="0" stop-color="#d9784a"/><stop offset="1" stop-color="${C.clay2}"/></radialGradient></defs>
  <circle cx="130" cy="130" r="128" fill="url(#glow)"/>
  ${shadow(130, 266, 84, 11)}
  <path d="M96 66 C58 84 36 132 46 188 C54 238 92 262 130 262 C168 262 206 238 214 188 C224 132 202 84 164 66 Z" fill="url(#clay)"/>
  <rect x="92" y="48" width="76" height="26" rx="12" fill="#a3431f"/><ellipse cx="130" cy="50" rx="36" ry="9" fill="#2a1710"/>
  <path d="M58 150 Q130 176 202 150" stroke="${C.cream}" stroke-width="6" fill="none"/>
  <path d="M60 188 Q130 214 200 188" stroke="${C.cream}" stroke-width="6" fill="none"/>
  <g fill="${C.gold}"><circle cx="84" cy="168" r="6"/><circle cx="130" cy="180" r="6"/><circle cx="176" cy="168" r="6"/><circle cx="106" cy="226" r="5"/><circle cx="154" cy="226" r="5"/></g>
  <path d="M130 30 C128 12 140 6 146 0" stroke="#fff2b0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`);
}

function web() {
  const w = 300, h = 320;
  let spokes = '', rings = '';
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; spokes += `<path d="M150 150 L${150 + Math.cos(a) * 124} ${150 + Math.sin(a) * 124}" stroke="#f3e3bf" stroke-width="2" opacity=".85"/>`; }
  for (const r of [26, 52, 80, 108]) {
    let d = '';
    for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 2; d += `${i ? 'L' : 'M'}${150 + Math.cos(a) * r * (i % 2 ? 0.94 : 1)} ${150 + Math.sin(a) * r * (i % 2 ? 0.94 : 1)} `; }
    rings += `<path d="${d}Z" stroke="#f3e3bf" stroke-width="2" fill="none" opacity=".85"/>`;
  }
  return out(w, h, `
  ${shadow(150, 308, 110, 9)}
  <rect x="22" y="30" width="14" height="284" rx="6" fill="${C.wood}"/><rect x="264" y="30" width="14" height="284" rx="6" fill="${C.wood}"/>
  ${spokes}${rings}
  <g transform="translate(150 150)" fill="#1d1410" stroke="#1d1410" stroke-width="3" stroke-linecap="round"><ellipse rx="9" ry="12"/><circle cy="-14" r="6"/>
  <path d="M-8 -4 l-16 -10 M-8 2 l-18 0 M-8 8 l-16 12 M8 -4 l16 -10 M8 2 l18 0 M8 8 l16 12" fill="none"/></g>`);
}

function fern() {
  const w = 200, h = 180;
  let fr = '';
  [[-60, 120], [-38, 140], [-16, 158], [8, 164], [30, 156], [52, 140], [70, 118]].forEach(([a, l], i) => {
    const rad = ((a - 90) * Math.PI) / 180, x2 = 100 + Math.cos(rad) * l, y2 = 170 + Math.sin(rad) * l;
    fr += `<path d="M100 172 Q${(100 + x2) / 2 + 8} ${(172 + y2) / 2 - 12} ${x2} ${y2}" stroke="${i % 2 ? C.leaf1 : C.leaf2}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
    for (let t = 0.3; t < 1; t += 0.14) fr += `<circle cx="${100 + (x2 - 100) * t}" cy="${172 + (y2 - 172) * t - 4}" r="${11 - t * 6}" fill="${i % 2 ? C.leaf2 : C.leaf3}"/>`;
  });
  return out(w, h, `${shadow(100, 174, 64, 7)}${fr}`);
}

function forestTree() {
  const w = 220, h = 460, r = rng(11);
  let can = '';
  for (let i = 0; i < 16; i++) can += `<circle cx="${40 + r() * 140}" cy="${30 + r() * 120}" r="${24 + r() * 26}" fill="${i % 3 ? C.leaf0 : C.leaf1}"/>`;
  return out(w, h, `
  ${shadow(110, 448, 78, 10)}
  <path d="M84 452 C92 400 98 340 96 260 C94 200 98 160 100 140 L120 140 C122 160 126 200 124 260 C122 340 128 400 138 452 Z" fill="#5f4129"/>
  <path d="M60 452 C80 440 92 420 96 400 M160 452 C140 440 128 420 124 400" stroke="#5f4129" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M104 160 L104 440" stroke="#4c3321" stroke-width="3" opacity=".5"/>${can}`);
}

function basket() {
  const w = 200, h = 170;
  let weave = '';
  for (let y = 80; y < 150; y += 14) weave += `<path d="M30 ${y} Q100 ${y + 12} 170 ${y}" stroke="${C.wood}" stroke-width="3" fill="none" opacity=".7"/>`;
  for (let x = 44; x < 170; x += 16) weave += `<path d="M${x} 74 L${x + (x - 100) * 0.05} 150" stroke="${C.wood}" stroke-width="2.4" opacity=".55"/>`;
  return out(w, h, `
  ${shadow(100, 160, 74, 9)}
  <path d="M26 72 L38 148 Q100 164 162 148 L174 72 Z" fill="#c9955a"/>${weave}
  <ellipse cx="100" cy="72" rx="76" ry="14" fill="#a8693a"/>
  <ellipse cx="100" cy="68" rx="66" ry="10" fill="#e3b24a"/>
  <g fill="#f3d27a"><circle cx="70" cy="64" r="4"/><circle cx="96" cy="60" r="4"/><circle cx="124" cy="64" r="4"/><circle cx="84" cy="70" r="4"/><circle cx="112" cy="70" r="4"/></g>`);
}

function calabash() {
  const w = 180, h = 150;
  return out(w, h, `
  ${shadow(90, 140, 64, 8)}
  <path d="M22 70 C22 128 60 140 90 140 C120 140 158 128 158 70 Z" fill="#c98a3d"/>
  <ellipse cx="90" cy="70" rx="68" ry="14" fill="#a96f2a"/><ellipse cx="90" cy="70" rx="58" ry="10" fill="#4a90a8"/>
  <path d="M60 68 Q90 62 120 68" stroke="#bfe3ee" stroke-width="3" fill="none" opacity=".7"/>
  <path d="M40 96 Q90 112 140 96 M44 116 Q90 130 136 116" stroke="${C.wood}" stroke-width="3" fill="none" opacity=".6"/>
  <rect x="104" y="30" width="8" height="52" rx="4" transform="rotate(25 108 56)" fill="${C.wood}"/><ellipse cx="124" cy="30" rx="12" ry="9" transform="rotate(25 124 30)" fill="#c98a3d"/>`);
}

function campfire() {
  const w = 200, h = 170;
  return out(w, h, `
  <defs><radialGradient id="g"><stop offset="0" stop-color="#ffb347" stop-opacity=".65"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="100" cy="110" rx="96" ry="60" fill="url(#g)"/>
  ${shadow(100, 158, 70, 9)}
  <g fill="#7b7b86" stroke="#4a4a55" stroke-width="3"><ellipse cx="42" cy="146" rx="18" ry="11"/><ellipse cx="72" cy="156" rx="16" ry="10"/><ellipse cx="128" cy="156" rx="16" ry="10"/><ellipse cx="158" cy="146" rx="18" ry="11"/></g>
  <rect x="50" y="132" width="100" height="14" rx="7" transform="rotate(-14 100 139)" fill="${C.wood}"/><rect x="50" y="132" width="100" height="14" rx="7" transform="rotate(14 100 139)" fill="${C.wood2}"/>
  <path d="M100 138 C70 128 76 92 96 70 C98 94 112 96 112 78 C134 98 138 130 100 138 Z" fill="#ff7a2a"/>
  <path d="M100 138 C86 130 88 108 100 94 C104 108 114 112 112 124 C112 132 108 136 100 138 Z" fill="#ffd35a"/>`);
}

function cowrie() {
  const w = 64, h = 64;
  return out(w, h, `
  <ellipse cx="32" cy="34" rx="26" ry="19" fill="#f3e3bf" stroke="#c9a96a" stroke-width="3"/>
  <ellipse cx="26" cy="26" rx="12" ry="5" fill="#fff" opacity=".6"/>
  <path d="M12 34 Q32 28 52 34" stroke="#8a6a35" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M18 31 l0 6 M25 30 l0 7 M32 29.5 l0 7 M39 30 l0 7 M46 31 l0 6" stroke="#8a6a35" stroke-width="1.8"/>`);
}

function mortar() {
  const w = 180, h = 200;
  return out(w, h, `
  ${shadow(90, 190, 62, 8)}
  <path d="M44 80 L36 182 Q90 196 144 182 L136 80 Z" fill="${C.wood2}"/><path d="M44 80 L136 80 L132 98 L48 98 Z" fill="${C.wood}"/>
  <ellipse cx="90" cy="80" rx="46" ry="11" fill="#4c3321"/>
  <path d="M52 120 Q90 132 128 120 M50 150 Q90 164 130 150" stroke="${C.wood}" stroke-width="3" fill="none" opacity=".6"/>
  <rect x="82" y="6" width="16" height="104" rx="7" transform="rotate(10 90 58)" fill="#c9955a"/><ellipse cx="104" cy="8" rx="13" ry="9" fill="#a8693a"/>`);
}

export const MORE_PROPS = { kora, 'iron-rod': ironRod, anvil, tent, spears, 'wisdom-pot': wisdomPot, web, fern, 'forest-tree': forestTree, basket, calabash, campfire, cowrie, mortar };

// ---------------------------------------------------------------------------- backgrounds
const W = 1920, H = 1080;
const NOISE = `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter>`;
const VIG = `<defs><radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vig)"/>`;

export function forest() {
  const r = rng(61);
  let trunks = '', leaves = '', litter = '', rays = '';
  for (let x = 40; x < W; x += 150 + r() * 60) {
    const tw = 50 + r() * 40;
    trunks += `<rect x="${x}" y="0" width="${tw}" height="360" fill="${r() > 0.5 ? '#2b1d12' : '#3a2616'}"/>`;
  }
  for (let i = 0; i < 90; i++) leaves += `<circle cx="${r() * W}" cy="${r() * 150}" r="${30 + r() * 60}" fill="${['#17301c', '#1f4026', '#2a5130'][i % 3]}"/>`;
  for (let i = 0; i < 260; i++) litter += `<ellipse cx="${r() * W}" cy="${370 + r() * 700}" rx="${6 + r() * 10}" ry="${2 + r() * 4}" fill="${['#6b4a22', '#8a5f2c', '#3f6b34', '#a6c45e'][i % 4]}" opacity=".55"/>`;
  for (let i = 0; i < 5; i++) { const x = 200 + i * 380 + r() * 60; rays += `<path d="M${x} 0 L${x + 90} 0 L${x + 330} 1080 L${x + 150} 1080 Z" fill="#fff2b0" opacity=".08"/>`; }
  return out(W, H, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a6a34"/><stop offset="1" stop-color="#27422a"/></linearGradient>
  <linearGradient id="back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16281a"/><stop offset="1" stop-color="#27422a"/></linearGradient>${NOISE}</defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="340" fill="url(#back)"/>${trunks}${leaves}
  <rect y="300" width="${W}" height="50" fill="#16281a"/>${litter}${rays}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>${VIG}`);
}

export function kirina() {
  const r = rng(71);
  let tents = '', dust = '', grass = '';
  for (let i = 0; i < 9; i++) { const x = 120 + i * 210 + r() * 40, s = 0.5 + r() * 0.3; tents += `<g transform="translate(${x} 336) scale(${s})"><path d="M-60 0 L0 -90 L60 0 Z" fill="${i % 2 ? '#7a3a22' : '#5a2a1c'}"/><path d="M-12 0 L0 -34 L12 0 Z" fill="#1d0f08"/></g>`; }
  for (let i = 0; i < 70; i++) dust += `<ellipse cx="${r() * W}" cy="${330 + r() * 20}" rx="${40 + r() * 80}" ry="${6 + r() * 8}" fill="#f0a060" opacity=".12"/>`;
  for (let i = 0; i < 220; i++) { const x = r() * W, y = 370 + r() * 700; grass += `<path d="M${x} ${y} l-4 -14 M${x} ${y} l0 -18 M${x} ${y} l4 -14" stroke="${r() > 0.5 ? '#b8923e' : '#8a7430'}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`; }
  return out(W, H, `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1230"/><stop offset=".5" stop-color="#a3364a"/><stop offset="1" stop-color="#f08a4b"/></linearGradient>
  <linearGradient id="plain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8923e"/><stop offset="1" stop-color="#6a4a1c"/></linearGradient>
  <radialGradient id="sun"><stop offset="0" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="1" stop-color="#f08a4b" stop-opacity="0"/></radialGradient>${NOISE}</defs>
  <rect width="${W}" height="${H}" fill="url(#plain)"/><rect width="${W}" height="345" fill="url(#sky)"/>
  <circle cx="1300" cy="330" r="220" fill="url(#sun)"/><circle cx="1300" cy="334" r="64" fill="#ffe08a"/>
  <path d="M0 330 C200 290 360 320 560 300 C780 280 980 330 1200 304 C1440 280 1660 326 1920 296 L1920 350 L0 350 Z" fill="#4a2142"/>
  ${tents}${dust}<rect y="344" width="${W}" height="10" fill="#000" opacity=".18"/>${grass}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>${VIG}`);
}

export function bigTree() {
  const r = rng(81);
  let bark = '', leaves = '', roots = '', motes = '';
  for (let i = 0; i < 14; i++) bark += `<path d="M${760 + i * 28} 0 C${750 + i * 30 + r() * 30} 140 ${770 + i * 28} 260 ${760 + i * 28 + r() * 20} 360" stroke="#3a2616" stroke-width="${3 + r() * 4}" fill="none" opacity=".55"/>`;
  for (let i = 0; i < 70; i++) leaves += `<circle cx="${r() * W}" cy="${r() * 120}" r="${30 + r() * 60}" fill="${['#1f4026', '#2a5130', '#3f6b34'][i % 3]}"/>`;
  roots += `<path d="M760 340 C700 380 640 400 560 420 L560 450 C660 440 740 410 780 370 Z M1160 340 C1220 380 1280 400 1360 420 L1360 450 C1260 440 1180 410 1140 370 Z" fill="#6b4a2c"/>`;
  for (let i = 0; i < 40; i++) motes += `<circle cx="${r() * W}" cy="${r() * 1080}" r="${2 + r() * 4}" fill="#fff2b0" opacity="${0.2 + r() * 0.4}"/>`;
  return out(W, H, `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3c0"/><stop offset="1" stop-color="#f6e7b0"/></linearGradient>
  <linearGradient id="trunk" x1="0" x2="1"><stop offset="0" stop-color="#5f4129"/><stop offset=".5" stop-color="#8a6240"/><stop offset="1" stop-color="#4c3321"/></linearGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9a43"/><stop offset="1" stop-color="#3f6b34"/></linearGradient>${NOISE}</defs>
  <rect width="${W}" height="${H}" fill="url(#ground)"/><rect width="${W}" height="345" fill="url(#sky)"/>
  <path d="M0 340 C300 300 500 330 800 310 C1100 290 1400 330 1920 300 L1920 350 L0 350 Z" fill="#6f9a43" opacity=".8"/>
  <rect x="740" y="0" width="440" height="350" fill="url(#trunk)"/>${bark}${roots}${leaves}
  <rect y="344" width="${W}" height="8" fill="#000" opacity=".15"/>${motes}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>${VIG}`);
}

export const MORE_BACKGROUNDS = { forest, kirina, 'big-tree': bigTree };
