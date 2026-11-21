import { C } from './palette.mjs';
import { svgDoc, rng } from './lib.mjs';

// Objects that stand in the scenes. Each is drawn at 2x and shown at half size.
// The bottom-centre of every picture is where the object touches the ground.

const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".28"/>`;

function defsWood(id = 'wood') {
  return `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${C.wood2}"/><stop offset="1" stop-color="${C.wood}"/></linearGradient>`;
}

export function baobab() {
  const w = 320, h = 460;
  const r = rng(7);
  let tufts = '';
  const ends = [[48, 120], [92, 58], [150, 30], [214, 56], [262, 110], [120, 100], [190, 96]];
  for (const [x, y] of ends) {
    for (let i = 0; i < 5; i++) {
      const dx = (r() - 0.5) * 60, dy = (r() - 0.5) * 34, rad = 16 + r() * 16;
      tufts += `<circle cx="${x + dx}" cy="${y + dy}" r="${rad}" fill="${i % 2 ? C.leaf1 : C.leaf2}"/>`;
    }
  }
  const inner = `
  <defs>
    <linearGradient id="trunk" x1="0" x2="1"><stop offset="0" stop-color="#7d5a3c"/><stop offset=".55" stop-color="#a47a52"/><stop offset="1" stop-color="#5f4129"/></linearGradient>
  </defs>
  ${shadow(160, 444, 120, 16)}
  <path d="M96 448 C104 390 118 330 124 250 C128 200 118 170 120 150 L200 150 C202 170 192 200 196 250 C202 330 216 390 226 448 Z" fill="url(#trunk)"/>
  <path d="M96 448 C104 440 128 432 160 432 C192 432 218 440 226 448 Z" fill="#5f4129" opacity=".5"/>
  <g stroke="#4c3321" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round">
    <path d="M138 420 C134 340 136 270 134 200"/><path d="M164 430 C162 340 166 270 162 190"/><path d="M190 420 C190 350 184 280 182 210"/>
  </g>
  <g stroke="#7d5a3c" stroke-linecap="round" fill="none">
    <path d="M132 170 C112 140 84 128 52 118" stroke-width="20"/>
    <path d="M142 160 C132 120 112 84 94 62" stroke-width="22"/>
    <path d="M160 154 C160 110 156 70 152 34" stroke-width="22"/>
    <path d="M178 160 C190 120 206 84 214 58" stroke-width="22"/>
    <path d="M190 170 C214 142 242 126 264 112" stroke-width="20"/>
  </g>
  ${tufts}`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function stall() {
  const w = 360, h = 320;
  let stripes = '';
  const cols = [C.clay, C.cream];
  for (let i = 0; i < 8; i++) {
    const x0 = 30 + i * 37.5;
    stripes += `<path d="M${x0} 70 L${x0 + 37.5} 70 L${x0 + 40} 106 Q${x0 + 20} 120 ${x0} 106 Z" fill="${cols[i % 2]}"/>`;
  }
  const inner = `
  <defs>${defsWood()}</defs>
  ${shadow(180, 304, 150, 14)}
  <rect x="34" y="70" width="12" height="230" fill="url(#wood)"/><rect x="314" y="70" width="12" height="230" fill="url(#wood)"/>
  <path d="M20 70 L60 22 L300 22 L340 70 Z" fill="${C.clay2}"/>
  <path d="M30 70 L66 28 L294 28 L330 70 Z" fill="${C.clay}"/>
  ${stripes}
  <rect x="34" y="200" width="292" height="16" rx="3" fill="${C.wood2}"/>
  <rect x="44" y="216" width="272" height="84" fill="${C.wood}"/>
  <path d="M44 216 L316 216 L316 232 L44 232 Z" fill="#000" opacity=".15"/>
  <path d="M60 232 l30 0 l-15 24 z M120 232 l30 0 l-15 24 z M180 232 l30 0 l-15 24 z M240 232 l30 0 l-15 24 z" fill="${C.gold}" opacity=".85"/>
  <g>
    <ellipse cx="96" cy="196" rx="44" ry="22" fill="#8a5a2a"/><rect x="52" y="178" width="88" height="22" fill="#8a5a2a"/>
    <circle cx="74" cy="172" r="12" fill="#e5802f"/><circle cx="98" cy="166" r="12" fill="#f0a030"/><circle cx="120" cy="172" r="12" fill="#e5802f"/><circle cx="86" cy="182" r="12" fill="#f0a030"/><circle cx="110" cy="182" r="12" fill="#e5802f"/>
    <ellipse cx="228" cy="196" rx="44" ry="22" fill="#8a5a2a"/><rect x="184" y="178" width="88" height="22" fill="#8a5a2a"/>
    <circle cx="206" cy="172" r="12" fill="#6f9a43"/><circle cx="230" cy="166" r="12" fill="#a6c45e"/><circle cx="252" cy="172" r="12" fill="#6f9a43"/><circle cx="218" cy="182" r="12" fill="#a6c45e"/><circle cx="242" cy="182" r="12" fill="#6f9a43"/>
  </g>
  <path d="M290 200 C292 170 304 160 312 164 L312 200 Z" fill="${C.teal}"/>`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function pots() {
  const w = 220, h = 190;
  const pot = (cx, base, rw, ph, col, band) => `
    <path d="M${cx - rw * 0.55} ${base - ph} C${cx - rw * 1.1} ${base - ph * 0.55} ${cx - rw * 0.9} ${base} ${cx - rw * 0.4} ${base} L${cx + rw * 0.4} ${base}
             C${cx + rw * 0.9} ${base} ${cx + rw * 1.1} ${base - ph * 0.55} ${cx + rw * 0.55} ${base - ph} Z" fill="${col}"/>
    <ellipse cx="${cx}" cy="${base - ph}" rx="${rw * 0.55}" ry="${rw * 0.16}" fill="#2a1a10"/>
    <path d="M${cx - rw * 0.98} ${base - ph * 0.5} L${cx + rw * 0.98} ${base - ph * 0.5}" stroke="${band}" stroke-width="7"/>
    <path d="M${cx - rw * 0.9} ${base - ph * 0.5 + 10} l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8 l8 -8" stroke="${band}" stroke-width="3" fill="none" transform="translate(${rw * 0.05} 0)"/>`;
  const inner = `
  ${shadow(110, 176, 100, 12)}
  ${pot(60, 172, 46, 94, C.clay, C.cream)}
  ${pot(138, 174, 38, 74, '#a8512a', C.gold)}
  ${pot(176, 170, 28, 52, '#b9663a', C.cream)}`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function drum() {
  const w = 140, h = 200;
  let rope = '';
  for (let i = 0; i < 5; i++) {
    const x = 36 + i * 17;
    rope += `<path d="M${x} 58 L${x + 8} 112 L${x + 17} 58" stroke="${C.cream}" stroke-width="3" fill="none"/>`;
  }
  const inner = `
  <defs>${defsWood('dw')}</defs>
  ${shadow(70, 188, 52, 9)}
  <path d="M30 40 C26 80 54 96 52 130 C50 160 34 176 40 186 L100 186 C106 176 90 160 88 130 C86 96 114 80 110 40 Z" fill="url(#dw)"/>
  <ellipse cx="70" cy="40" rx="40" ry="12" fill="#e8d3a6"/><ellipse cx="70" cy="40" rx="40" ry="12" fill="none" stroke="${C.wood}" stroke-width="5"/>
  ${rope}
  <path d="M44 150 L96 150 M46 160 L94 160" stroke="${C.gold}" stroke-width="4"/>`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function carvedDoor() {
  const w = 300, h = 380;
  const inner = `
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2416"/><stop offset="1" stop-color="#f0a850"/></linearGradient>
  </defs>
  ${shadow(150, 368, 110, 10)}
  <rect x="30" y="120" width="240" height="252" rx="8" fill="${C.brick0}"/>
  <path d="M60 372 L60 190 Q60 130 150 130 Q240 130 240 190 L240 372 Z" fill="url(#glow)"/>
  <path d="M60 372 L60 190 Q60 130 150 130 Q240 130 240 190 L240 372" fill="none" stroke="${C.wood}" stroke-width="14"/>
  <rect x="40" y="136" width="220" height="14" fill="${C.wood}" opacity="0"/>
  <path d="M96 372 L96 250 Q150 224 204 250 L204 372 Z" fill="#2a1a10" opacity=".55"/>
  <g transform="translate(150 66)">
    <circle r="54" fill="${C.wood}" stroke="${C.gold}" stroke-width="4"/>
    <circle r="44" fill="#4a2f1b"/>
    ${sankofaBirdShape(C.gold, 0.62)}
  </g>
  <path d="M36 150 l14 -12 l14 12 l14 -12 l14 12 M200 138 l14 12 l14 -12 l14 12 l14 -12" stroke="${C.gold}" stroke-width="4" fill="none"/>`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

/** A bird with its feet forward and its head turned back, holding a seed: the Sankofa idea. Drawn around (0,0). */
export function sankofaBirdShape(fill, scale = 1) {
  return `<g transform="scale(${scale})" fill="${fill}">
    <path d="M-34 14 C-40 -6 -20 -26 4 -22 C16 -20 26 -12 30 -2 C36 6 32 20 22 26 L26 40 L12 40 L8 28 C0 30 -10 30 -16 28 L-20 40 L-32 40 L-26 26 C-30 22 -34 18 -34 14 Z"/>
    <path d="M-30 -2 C-52 -26 -44 -52 -20 -54 C-8 -55 -2 -46 -6 -38 C-12 -44 -22 -44 -26 -36 C-30 -28 -26 -14 -14 -10 Z"/>
    <path d="M-46 -48 L-62 -44 L-46 -40 Z"/>
    <circle cx="-62" cy="-37" r="6"/>
    <path d="M26 -2 C46 -14 52 -34 44 -52 C40 -40 34 -30 22 -22 Z"/>
  </g>`;
}

export function bush() {
  const w = 180, h = 130;
  const r = rng(11);
  let blobs = '';
  const cols = [C.leaf0, C.leaf1, C.leaf2];
  for (let i = 0; i < 12; i++) {
    const x = 30 + r() * 120, y = 50 + r() * 50;
    blobs += `<circle cx="${x}" cy="${y}" r="${22 + r() * 16}" fill="${cols[i % 3]}"/>`;
  }
  let flowers = '';
  for (let i = 0; i < 7; i++) flowers += `<circle cx="${34 + r() * 112}" cy="${44 + r() * 52}" r="4.5" fill="${i % 2 ? C.gold : C.cream}"/>`;
  const inner = `${shadow(90, 116, 78, 10)}<g>${blobs}</g>${flowers}`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function rock() {
  const w = 150, h = 100;
  const inner = `
  ${shadow(75, 90, 62, 8)}
  <path d="M14 86 C8 62 22 36 46 28 C60 14 90 14 104 30 C128 38 142 62 136 86 Z" fill="#8a7a6a"/>
  <path d="M46 28 C60 14 90 14 104 30 C90 34 66 36 46 28 Z" fill="#b3a592"/>
  <path d="M22 80 C30 62 40 54 56 50" stroke="#6b5d50" stroke-width="4" fill="none" opacity=".6"/>`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function signpost() {
  const w = 190, h = 250;
  const inner = `
  <defs>${defsWood('sw')}</defs>
  ${shadow(95, 238, 44, 8)}
  <rect x="86" y="24" width="18" height="214" rx="4" fill="url(#sw)"/>
  <path d="M30 44 L130 44 L152 64 L130 84 L30 84 Z" fill="${C.wood2}" stroke="${C.wood}" stroke-width="4"/>
  <path d="M164 108 L66 108 L44 128 L66 148 L164 148 Z" fill="${C.wood2}" stroke="${C.wood}" stroke-width="4"/>
  <circle cx="60" cy="64" r="10" fill="none" stroke="${C.ink}" stroke-width="3"/><circle cx="60" cy="64" r="3.5" fill="${C.ink}"/>
  <path d="M120 118 l10 10 l-10 10 l-10 -10 z" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function rug() {
  const w = 300, h = 160;
  let tri = '';
  for (let i = 0; i < 9; i++) tri += `<path d="M${30 + i * 30} 26 l15 -14 l15 14 z M${30 + i * 30} 134 l15 14 l15 -14 z" fill="${C.gold}"/>`;
  const inner = `
  <rect x="8" y="8" width="284" height="144" rx="10" fill="${C.clay2}"/>
  <rect x="20" y="20" width="260" height="120" rx="6" fill="${C.clay}"/>
  <rect x="44" y="44" width="212" height="72" rx="4" fill="${C.cream}"/>
  <path d="M60 80 L100 56 L140 80 L100 104 Z M160 80 L200 56 L240 80 L200 104 Z" fill="${C.teal}"/>
  <circle cx="150" cy="80" r="14" fill="${C.clay2}"/><circle cx="150" cy="80" r="6" fill="${C.gold}"/>
  ${tri}`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export function emblemIcon() {
  const w = 256, h = 256;
  const inner = `
  <circle cx="128" cy="128" r="120" fill="#3a2416" stroke="${C.gold}" stroke-width="8"/>
  <circle cx="128" cy="128" r="100" fill="#4a2f1b"/>
  <g transform="translate(128 140)">${sankofaBirdShape(C.gold, 1.6)}</g>`;
  return { svg: svgDoc(w, h, inner), width: w, height: h };
}

export const PROPS = { baobab, stall, pots, drum, 'carved-door': carvedDoor, bush, rock, signpost, rug };
