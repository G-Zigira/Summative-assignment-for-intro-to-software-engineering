import { C } from './palette.mjs';
import { svgDoc } from './lib.mjs';

// Sprite sheet: 4 columns (walk cycle) x 4 rows (down, left, right, up), each frame 96 x 128.
// Displayed at half size (48 x 64) in the game, so it stays sharp on large screens.
// Walk cycle: stand, left foot forward, stand, right foot forward.

export const FRAME_W = 96;
export const FRAME_H = 128;

export const STYLES = {
  player: {
    skin: C.skinPlayer, hair: C.hairDark, hairStyle: 'short', top: '#2f8f8c', accent: C.gold,
    bottom: '#3a2d22', shoe: '#2a1c14', robe: false, extra: 'satchel',
  },
  elder: {
    skin: C.skinElder, hair: C.hairGrey, hairStyle: 'elder', top: '#b5542f', accent: C.cream,
    bottom: '#7a3a22', shoe: '#2a1c14', robe: true, extra: 'staff',
  },
  guide: {
    skin: C.skinGuide, hair: C.hairDark, hairStyle: 'wrap', top: '#6b4a8a', accent: C.gold,
    bottom: '#3d2d52', shoe: '#2a1c14', robe: false, extra: 'none', wrap: C.teal,
  },
  // A jeli (griot): keeper of history, in an indigo robe and a gold head wrap.
  griot: {
    skin: '#7a4a30', hair: C.hairDark, hairStyle: 'wrap', top: '#2c4a8a', accent: C.gold,
    bottom: '#1f3463', shoe: '#2a1c14', robe: true, extra: 'none', wrap: '#e0a030',
  },
  // A child, drawn smaller (scale).
  child: {
    skin: '#8d5a3b', hair: C.hairDark, hairStyle: 'short', top: '#c4572f', accent: C.cream,
    bottom: '#3a2d22', shoe: '#2a1c14', robe: false, extra: 'none', scale: 0.78,
  },
  // Anansi, the clever one: black and gold with a rust head wrap.
  anansi: {
    skin: '#5b3622', hair: C.hairDark, hairStyle: 'wrap', top: '#262626', accent: C.gold,
    bottom: '#3a2d22', shoe: '#2a1c14', robe: false, extra: 'none', wrap: '#b5542f',
  },
};

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
};

function frontOrBack(s, dir, f) {
  const back = dir === 'up';
  const bob = [0, -2, 0, -2][f];
  const legL = [0, 7, 0, 0][f];
  const legR = [0, 0, 0, 7][f];
  const armL = [0, -4, 0, 4][f];
  const armR = [0, 4, 0, -4][f];
  let out = `<ellipse cx="48" cy="117" rx="27" ry="8" fill="#000" opacity=".28"/>`;

  if (s.robe) {
    out += `<ellipse cx="38" cy="${112 - legL / 2}" rx="9" ry="5" fill="${s.shoe}"/><ellipse cx="58" cy="${112 - legR / 2}" rx="9" ry="5" fill="${s.shoe}"/>`;
  } else {
    out += `<rect x="34" y="${86 - legL}" width="13" height="28" rx="5" fill="${s.bottom}"/><ellipse cx="40.5" cy="${114 - legL}" rx="9" ry="5" fill="${s.shoe}"/>`;
    out += `<rect x="49" y="${86 - legR}" width="13" height="28" rx="5" fill="${s.bottom}"/><ellipse cx="55.5" cy="${114 - legR}" rx="9" ry="5" fill="${s.shoe}"/>`;
  }

  let body = '';
  // arms
  body += `<rect x="18" y="${52 + armL}" width="11" height="34" rx="5.5" fill="${shade(s.top, -18)}"/><circle cx="23.5" cy="${88 + armL}" r="5.5" fill="${s.skin}"/>`;
  body += `<rect x="67" y="${52 + armR}" width="11" height="34" rx="5.5" fill="${shade(s.top, -18)}"/><circle cx="72.5" cy="${88 + armR}" r="5.5" fill="${s.skin}"/>`;
  if (s.extra === 'staff') body += `<rect x="70.5" y="40" width="4.5" height="${78 - bob}" rx="2" fill="${C.wood}"/><circle cx="72.7" cy="40" r="5" fill="${C.wood2}"/>`;
  // torso
  if (s.robe) {
    body += `<path d="M25 50 Q25 44 34 44 L62 44 Q71 44 71 50 L76 104 Q48 112 20 104 Z" fill="${s.top}"/>`;
    body += `<path d="M21 96 Q48 104 75 96 L76 104 Q48 112 20 104 Z" fill="${s.accent}"/>`;
    body += `<path d="M48 44 L48 100" stroke="${shade(s.top, -30)}" stroke-width="2" opacity=".5"/>`;
  } else {
    body += `<rect x="27" y="46" width="42" height="46" rx="12" fill="${s.top}"/><rect x="27" y="80" width="42" height="8" fill="${s.accent}"/>`;
  }
  if (s.extra === 'satchel') {
    body += `<path d="M31 48 L65 88" stroke="${C.wood}" stroke-width="4.5" stroke-linecap="round"/>`;
    if (!back) body += `<rect x="58" y="80" width="17" height="15" rx="3" fill="${C.wood2}" stroke="${C.wood}" stroke-width="1.5"/>`;
  }
  // neck + head
  body += `<rect x="42" y="38" width="12" height="12" fill="${shade(s.skin, -14)}"/>`;
  body += `<circle cx="48" cy="30" r="19" fill="${s.skin}"/>`;
  if (back) {
    body += `<path d="M29 30 C27 8 69 8 67 30 C66 40 60 46 48 46 C36 46 30 40 29 30 Z" fill="${s.hair}"/>`;
    if (s.hairStyle === 'wrap') body += `<path d="M29 24 C32 8 64 8 67 24 L67 32 L29 32 Z" fill="${s.wrap}"/><circle cx="62" cy="14" r="7" fill="${s.wrap}"/>`;
  } else {
    if (s.hairStyle === 'wrap') {
      body += `<path d="M29 26 C31 7 65 7 67 26 L67 30 C58 24 38 24 29 30 Z" fill="${s.wrap}"/><circle cx="63" cy="13" r="7.5" fill="${s.wrap}"/><path d="M29 28 Q48 22 67 28" stroke="${s.accent}" stroke-width="2.5" fill="none"/>`;
    } else {
      body += `<path d="M29 29 C28 8 68 8 67 29 C62 20 34 20 29 29 Z" fill="${s.hair}"/>`;
    }
    if (s.hairStyle === 'elder') body += `<path d="M36 42 Q48 58 60 42 Q54 47 48 47 Q42 47 36 42 Z" fill="${s.hair}"/>`;
    body += `<ellipse cx="41" cy="31" rx="2.2" ry="2.9" fill="${C.ink}"/><ellipse cx="55" cy="31" rx="2.2" ry="2.9" fill="${C.ink}"/>`;
    body += `<path d="M37.5 26 Q41 24 44.5 26 M51.5 26 Q55 24 58.5 26" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    if (s.hairStyle !== 'elder') body += `<path d="M43 39 Q48 43.5 53 39" stroke="${C.ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }
  return `${out}<g transform="translate(0 ${bob})">${body}</g>`;
}

function side(s, f) {
  const bob = [0, -2, 0, -2][f];
  const a = [0, 22, 0, -22][f];
  const arm = [0, -26, 0, 26][f];
  let out = `<ellipse cx="48" cy="117" rx="27" ry="8" fill="#000" opacity=".28"/>`;
  const leg = (angle, color, shoe) =>
    `<g transform="rotate(${angle} 48 88)"><rect x="42" y="86" width="13" height="28" rx="5" fill="${color}"/><ellipse cx="51" cy="114" rx="10" ry="5" fill="${shoe}"/></g>`;
  if (s.robe) {
    out += `<ellipse cx="${46 - a / 3}" cy="112" rx="10" ry="5" fill="${s.shoe}"/><ellipse cx="${52 + a / 3}" cy="112" rx="10" ry="5" fill="${s.shoe}"/>`;
  } else {
    out += leg(-a, shade(s.bottom, -25), shade(s.shoe, -8)) + leg(a, s.bottom, s.shoe);
  }
  let body = '';
  body += `<g transform="rotate(${-arm} 48 56)"><rect x="42" y="52" width="11" height="34" rx="5.5" fill="${shade(s.top, -34)}"/><circle cx="47.5" cy="88" r="5.5" fill="${shade(s.skin, -14)}"/></g>`;
  if (s.robe) {
    body += `<path d="M32 48 Q32 44 38 44 L58 44 Q64 44 64 48 L70 104 Q48 112 26 104 Z" fill="${s.top}"/><path d="M27 96 Q48 104 69 96 L70 104 Q48 112 26 104 Z" fill="${s.accent}"/>`;
  } else {
    body += `<rect x="33" y="46" width="30" height="46" rx="11" fill="${s.top}"/><rect x="33" y="80" width="30" height="8" fill="${s.accent}"/>`;
  }
  if (s.extra === 'satchel') body += `<rect x="28" y="74" width="13" height="17" rx="3" fill="${C.wood2}" stroke="${C.wood}" stroke-width="1.5"/>`;
  body += `<g transform="rotate(${arm} 48 56)"><rect x="42" y="52" width="11" height="34" rx="5.5" fill="${s.top}"/><circle cx="47.5" cy="88" r="5.5" fill="${s.skin}"/></g>`;
  if (s.extra === 'staff') body += `<rect x="57" y="40" width="4.5" height="${78 - bob}" rx="2" fill="${C.wood}"/><circle cx="59.2" cy="40" r="5" fill="${C.wood2}"/><circle cx="52" cy="87" r="5.5" fill="${s.skin}"/>`;
  body += `<rect x="43" y="38" width="12" height="12" fill="${shade(s.skin, -14)}"/>`;
  body += `<circle cx="50" cy="30" r="19" fill="${s.skin}"/><circle cx="68" cy="33" r="3.6" fill="${s.skin}"/>`;
  if (s.hairStyle === 'wrap') {
    body += `<path d="M31 28 C30 8 66 6 69 26 C60 22 42 22 36 34 Z" fill="${s.wrap}"/><circle cx="35" cy="14" r="7.5" fill="${s.wrap}"/><path d="M33 27 Q50 20 68 27" stroke="${s.accent}" stroke-width="2.5" fill="none"/>`;
  } else {
    body += `<path d="M31 30 C28 8 66 6 68 26 C60 18 42 18 36 36 Z" fill="${s.hair}"/>`;
  }
  if (s.hairStyle === 'elder') body += `<path d="M52 44 Q64 54 69 40 Q62 44 52 42 Z" fill="${s.hair}"/>`;
  body += `<ellipse cx="59" cy="30" rx="2.1" ry="2.9" fill="${C.ink}"/><path d="M55 25.5 Q59 23.5 63 25.5" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return `${out}<g transform="translate(0 ${bob})">${body}</g>`;
}

export function characterSheet(name) {
  const s = STYLES[name];
  const rows = ['down', 'left', 'right', 'up'];
  let inner = '';
  rows.forEach((dir, r) => {
    for (let f = 0; f < 4; f++) {
      let g;
      if (dir === 'down' || dir === 'up') g = frontOrBack(s, dir, f);
      else if (dir === 'right') g = side(s, f);
      else g = `<g transform="translate(${FRAME_W} 0) scale(-1 1)">${side(s, f)}</g>`;
      if (s.scale) g = `<g transform="translate(48 117) scale(${s.scale}) translate(-48 -117)">${g}</g>`;
      inner += `<g transform="translate(${f * FRAME_W} ${r * FRAME_H})">${g}</g>`;
    }
  });
  const width = FRAME_W * 4;
  const height = FRAME_H * 4;
  return { svg: svgDoc(width, height, inner), width, height };
}
