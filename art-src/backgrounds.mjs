import { C } from './palette.mjs';
import { svgDoc, rng } from './lib.mjs';
import { sankofaBirdShape } from './props.mjs';

// Full-screen pictures, drawn at 1920 x 1080 and shown at 960 x 540.
// In the area backgrounds the back wall / horizon fills the top 340 px (170 in game pixels);
// the player can only walk below that line (`walkTop` in GameScene).

const W = 1920;
const H = 1080;

const NOISE = (id, opacity = 0.2, freq = 0.8) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="4"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0"/>
  </filter>`;

const vignette = (strength = 0.45) => `
  <defs><radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${strength}"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>`;

/** Smooth closed ridge across the picture, filled down to `bottom`. */
function ridge(baseY, amp, seed, fill, opacity = 1, bottom = H, step = 160) {
  const r = rng(seed);
  const pts = [];
  for (let x = -step; x <= W + step; x += step) pts.push([x, baseY - r() * amp]);
  let d = `M${pts[0][0]} ${bottom} L${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  d += ` L${pts[pts.length - 1][0]} ${bottom} Z`;
  return `<path d="${d}" fill="${fill}" opacity="${opacity}"/>`;
}

function baobabSilhouette(x, base, s, fill) {
  return `<g transform="translate(${x} ${base}) scale(${s})" fill="${fill}" stroke="${fill}" stroke-linecap="round">
    <path d="M-92 0 C-84 -90 -64 -200 -60 -300 C-58 -340 -66 -362 -64 -376 L64 -376 C66 -362 58 -340 60 -300 C64 -200 84 -90 92 0 Z" stroke="none"/>
    <g fill="none" stroke-width="30">
      <path d="M-50 -360 C-90 -400 -150 -420 -210 -440"/><path d="M-30 -372 C-50 -430 -90 -480 -120 -520"/>
      <path d="M0 -376 C0 -440 6 -500 0 -560"/><path d="M30 -372 C50 -430 92 -480 124 -520"/><path d="M50 -360 C90 -400 150 -420 214 -440"/>
    </g>
    <g stroke="none">
      <circle cx="-214" cy="-446" r="38"/><circle cx="-186" cy="-462" r="30"/><circle cx="-124" cy="-528" r="40"/><circle cx="-92" cy="-546" r="28"/>
      <circle cx="0" cy="-568" r="42"/><circle cx="34" cy="-566" r="30"/><circle cx="126" cy="-528" r="40"/><circle cx="96" cy="-548" r="28"/>
      <circle cx="218" cy="-446" r="38"/><circle cx="188" cy="-464" r="30"/>
    </g>
  </g>`;
}

function acacia(x, base, s, fill) {
  return `<g transform="translate(${x} ${base}) scale(${s})" fill="${fill}" stroke="${fill}" stroke-linecap="round">
    <path d="M-6 0 C-4 -40 -8 -70 -16 -96 L16 -96 C10 -70 8 -40 6 0 Z" stroke="none"/>
    <path d="M-120 -100 C-80 -140 -30 -150 0 -140 C30 -152 82 -142 122 -100 C70 -118 30 -118 0 -112 C-30 -118 -70 -118 -120 -100 Z" stroke="none"/>
  </g>`;
}

// ------------------------------------------------------------------ title
export function title() {
  const r = rng(21);
  let stars = '';
  for (let i = 0; i < 110; i++) stars += `<circle cx="${r() * W}" cy="${r() * 560}" r="${0.8 + r() * 2.2}" fill="#fff" opacity="${0.25 + r() * 0.6}"/>`;
  let birds = '';
  [[820, 300, 1], [900, 270, 0.8], [980, 320, 0.9], [1060, 285, 0.7]].forEach(([x, y, s]) => {
    birds += `<path d="M${x - 16 * s} ${y} Q${x - 8 * s} ${y - 12 * s} ${x} ${y} Q${x + 8 * s} ${y - 12 * s} ${x + 16 * s} ${y}" stroke="#1d0f1c" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  });
  const inner = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.dusk0}"/><stop offset=".32" stop-color="${C.dusk1}"/><stop offset=".52" stop-color="${C.dusk2}"/>
      <stop offset=".68" stop-color="${C.dusk3}"/><stop offset=".78" stop-color="${C.dusk4}"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${C.sun}" stop-opacity=".9"/><stop offset=".45" stop-color="${C.dusk4}" stop-opacity=".35"/><stop offset="1" stop-color="${C.dusk3}" stop-opacity="0"/></radialGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1f2c"/><stop offset="1" stop-color="#120a10"/></linearGradient>
    ${NOISE('grain', 0.16, 0.7)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars}
  <circle cx="620" cy="760" r="420" fill="url(#glow)"/>
  <circle cx="620" cy="770" r="118" fill="${C.sun}"/>
  ${birds}
  ${ridge(760, 70, 3, '#7a3560', 0.85, H, 200)}
  ${ridge(820, 60, 5, '#4a2142', 0.95, H, 170)}
  <rect y="840" width="${W}" height="${H - 840}" fill="url(#ground)"/>
  <path d="M780 842 L1010 842 L1360 ${H} L420 ${H} Z" fill="${C.dusk4}" opacity=".16"/>
  ${acacia(520, 850, 1.1, '#1a0d17')}${acacia(1080, 846, 0.8, '#1a0d17')}${acacia(1250, 850, 0.65, '#1a0d17')}
  ${baobabSilhouette(220, 1030, 1.15, '#120a10')}
  ${baobabSilhouette(1800, 1010, 0.95, '#120a10')}
  <g transform="translate(1560 640)">
    <circle r="168" fill="#2a1522" opacity=".8"/><circle r="156" fill="none" stroke="${C.gold}" stroke-width="7"/>
    <circle r="138" fill="none" stroke="${C.gold}" stroke-width="2.5" opacity=".7"/>
    <g transform="translate(0 14)">${sankofaBirdShape(C.gold, 2.1)}</g>
  </g>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
  ${vignette(0.5)}`;
  return { svg: svgDoc(W, H, inner), width: W, height: H };
}

// ------------------------------------------------------------------ courtyard
export function courtyard() {
  const r = rng(31);
  let tiles = '';
  const rowH = 96;
  for (let y = 340, row = 0; y < H; y += rowH, row++) {
    const tw = 210;
    for (let x = -(row % 2) * (tw / 2); x < W; x += tw) {
      const l = 0.9 + r() * 0.2;
      const rch = Math.round(201 * l), gch = Math.round(149 * l), bch = Math.round(90 * l);
      tiles += `<rect x="${x + 3}" y="${y + 3}" width="${tw - 6}" height="${rowH - 6}" rx="8" fill="rgb(${rch},${gch},${bch})" stroke="${C.earth1}" stroke-opacity=".45" stroke-width="3"/>`;
    }
  }
  let pebbles = '';
  for (let i = 0; i < 80; i++) pebbles += `<ellipse cx="${r() * W}" cy="${380 + r() * 680}" rx="${3 + r() * 6}" ry="${2 + r() * 3}" fill="${C.earth1}" opacity="${0.25 + r() * 0.3}"/>`;
  let zig = '';
  for (let x = 0; x < W; x += 80) zig += `<path d="M${x} 112 l40 -34 l40 34 z" fill="${C.cream}"/><path d="M${x + 14} 104 l26 -22 l26 22 z" fill="${C.clay}"/>`;
  const inner = `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.brick1}"/><stop offset="1" stop-color="${C.brick0}"/></linearGradient>
    <pattern id="bricks" width="160" height="64" patternUnits="userSpaceOnUse">
      <rect width="160" height="64" fill="none"/>
      <path d="M0 0 H160 M0 32 H160 M0 0 V32 M80 32 V64" stroke="#000" stroke-opacity=".16" stroke-width="3" fill="none"/>
    </pattern>
    <radialGradient id="warm" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#ffd98f" stop-opacity=".32"/><stop offset="1" stop-color="#ffd98f" stop-opacity="0"/></radialGradient>
    <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
    ${NOISE('grain', 0.18, 0.9)}
  </defs>
  <rect width="${W}" height="${H}" fill="${C.earth3}"/>
  ${tiles}${pebbles}
  <rect width="${W}" height="340" fill="url(#wall)"/><rect width="${W}" height="340" fill="url(#bricks)"/>
  <rect y="132" width="${W}" height="30" fill="${C.brick0}"/>${zig}
  <rect y="290" width="${W}" height="50" fill="${C.brick0}"/><rect y="286" width="${W}" height="8" fill="${C.brick2}" opacity=".7"/>
  <rect y="300" width="${W}" height="80" fill="url(#wallShade)"/>
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
  ${vignette(0.5)}`;
  return { svg: svgDoc(W, H, inner), width: W, height: H };
}

// ------------------------------------------------------------------ wall garden
export function wallGarden() {
  const r = rng(41);
  let motifs = '';
  for (let x = 40, i = 0; x < W; x += 160, i++) {
    const cx = x + 40;
    if (i % 3 === 0) motifs += `<g transform="translate(${cx} 120)"><circle r="46" fill="none" stroke="${C.clay}" stroke-width="8"/><circle r="28" fill="none" stroke="${C.teal}" stroke-width="8"/><circle r="10" fill="${C.clay2}"/></g>`;
    else if (i % 3 === 1) motifs += `<g transform="translate(${cx} 120)"><path d="M0 -50 L46 0 L0 50 L-46 0 Z" fill="none" stroke="${C.clay2}" stroke-width="8"/><circle r="10" fill="${C.gold}"/><circle cx="0" cy="-26" r="4" fill="${C.clay2}"/><circle cx="0" cy="26" r="4" fill="${C.clay2}"/></g>`;
    else motifs += `<g transform="translate(${cx} 120)"><path d="M-46 30 l23 -50 l23 50 l23 -50 l23 50" fill="none" stroke="${C.teal}" stroke-width="8" stroke-linejoin="round"/><path d="M-46 -30 h92" stroke="${C.clay}" stroke-width="8"/></g>`;
  }
  let beds = '';
  const bedRects = [[160, 520, 420, 150], [1340, 480, 420, 150], [180, 820, 380, 130], [1380, 800, 400, 140]];
  for (const [x, y, w, h] of bedRects) {
    beds += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#4a3220" stroke="#2c1d12" stroke-width="6"/>`;
    for (let i = 0; i < 14; i++) {
      const px = x + 24 + r() * (w - 48), py = y + 22 + r() * (h - 44);
      beds += `<circle cx="${px}" cy="${py}" r="${12 + r() * 8}" fill="${i % 3 ? C.leaf2 : C.leaf1}"/>`;
      if (i % 4 === 0) beds += `<circle cx="${px}" cy="${py - 4}" r="5" fill="${i % 8 === 0 ? C.gold : C.cream}"/>`;
    }
  }
  let stones = '';
  const path = [[960, 1040], [930, 940], [990, 850], [940, 760], [980, 670], [950, 580], [970, 490], [960, 400]];
  for (const [x, y] of path) stones += `<ellipse cx="${x}" cy="${y}" rx="70" ry="30" fill="#b9a68b" stroke="#8b7a62" stroke-width="5"/>`;
  let grass = '';
  for (let i = 0; i < 160; i++) {
    const x = r() * W, y = 360 + r() * 700;
    grass += `<path d="M${x} ${y} l-4 -14 M${x} ${y} l0 -18 M${x} ${y} l4 -14" stroke="${r() > 0.5 ? C.leaf3 : C.leaf0}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
  }
  const inner = `
  <defs>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.leaf1}"/><stop offset="1" stop-color="${C.leaf0}"/></linearGradient>
    <linearGradient id="plaster" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecc590"/><stop offset="1" stop-color="${C.plaster}"/></linearGradient>
    <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
    ${NOISE('grain', 0.2, 0.85)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#grass)"/>
  ${grass}${stones}${beds}
  <rect width="${W}" height="340" fill="url(#plaster)"/>
  <rect y="20" width="${W}" height="200" fill="#fff" opacity=".08"/>
  ${motifs}
  <rect y="238" width="${W}" height="10" fill="${C.clay2}" opacity=".5"/><rect y="290" width="${W}" height="50" fill="${C.brick1}"/><rect y="286" width="${W}" height="8" fill="${C.brick2}" opacity=".8"/>
  <rect y="300" width="${W}" height="80" fill="url(#wallShade)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
  ${vignette(0.45)}`;
  return { svg: svgDoc(W, H, inner), width: W, height: H };
}

// ------------------------------------------------------------------ road
export function road() {
  const r = rng(51);
  let tufts = '';
  for (let i = 0; i < 260; i++) {
    const y = 360 + Math.pow(r(), 0.8) * 700, x = r() * W;
    const s = 0.6 + (y - 340) / 700;
    tufts += `<path d="M${x} ${y} l${-5 * s} ${-16 * s} M${x} ${y} l0 ${-22 * s} M${x} ${y} l${5 * s} ${-16 * s}" stroke="${r() > 0.5 ? '#c9a24a' : '#8a7430'}" stroke-width="${3 * s}" stroke-linecap="round" opacity=".7"/>`;
  }
  let acacias = '';
  [[260, 1], [520, 0.7], [1180, 0.8], [1500, 1.1], [1780, 0.7]].forEach(([x, s]) => { acacias += acacia(x, 345, s, '#3a2438'); });
  const inner = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a78"/><stop offset=".55" stop-color="#d4607a"/><stop offset="1" stop-color="${C.dusk4}"/></linearGradient>
    <linearGradient id="savanna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8923e"/><stop offset="1" stop-color="#7a5a24"/></linearGradient>
    <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6c08a"/><stop offset="1" stop-color="#c9955a"/></linearGradient>
    <radialGradient id="sunglow"><stop offset="0" stop-color="${C.sun}" stop-opacity=".95"/><stop offset="1" stop-color="${C.dusk3}" stop-opacity="0"/></radialGradient>
    ${NOISE('grain', 0.2, 0.8)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#savanna)"/>
  <rect width="${W}" height="345" fill="url(#sky)"/>
  <circle cx="1000" cy="330" r="200" fill="url(#sunglow)"/><circle cx="1000" cy="332" r="58" fill="${C.sun}"/>
  ${ridge(330, 50, 9, '#6a3a6a', 0.9, 350, 220)}
  ${ridge(345, 28, 13, '#4a2a52', 1, 352, 150)}
  ${acacias}
  <rect y="344" width="${W}" height="8" fill="#000" opacity=".15"/>
  <path d="M900 346 L1040 346 C1100 500 1290 700 1380 ${H} L560 ${H} C660 760 860 520 900 346 Z" fill="url(#dirt)"/>
  <path d="M900 346 C860 520 660 760 560 ${H}" stroke="#8a5f30" stroke-width="8" fill="none" opacity=".5"/>
  <path d="M1040 346 C1100 500 1290 700 1380 ${H}" stroke="#8a5f30" stroke-width="8" fill="none" opacity=".5"/>
  ${tufts}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
  ${vignette(0.45)}`;
  return { svg: svgDoc(W, H, inner), width: W, height: H };
}

// ------------------------------------------------------------------ placeholder
export function placeholder() {
  let grid = '';
  for (let x = 0; x <= W; x += 120) grid += `<path d="M${x} 340 V${H}" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`;
  for (let y = 340; y <= H; y += 120) grid += `<path d="M0 ${y} H${W}" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`;
  const inner = `
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a52"/><stop offset="1" stop-color="#2c2c34"/></linearGradient>${NOISE('grain', 0.14, 0.8)}</defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="340" fill="#3a3a42"/>${grid}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>${vignette(0.4)}`;
  return { svg: svgDoc(W, H, inner), width: W, height: H };
}

export const BACKGROUNDS = { title, courtyard, 'wall-garden': wallGarden, road, placeholder };
