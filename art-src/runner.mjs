import { C } from './palette.mjs';
import { svgDoc, rng } from './lib.mjs';

// Backdrop and ground for the runner minigame. Both repeat sideways, so nothing may cross
// the left/right edges: hills use whole numbers of sine waves, trees stay clear of the edges.

const W = 1920;

function wave(base, amp, waves, phase, fill, opacity = 1, bottom = 1080) {
  let d = `M0 ${bottom}`;
  for (let x = 0; x <= W; x += 16) d += ` L${x} ${(base + amp * Math.sin((2 * Math.PI * waves * x) / W + phase)).toFixed(1)}`;
  return `<path d="${d} L${W} ${bottom} Z" fill="${fill}" opacity="${opacity}"/>`;
}

function acacia(x, base, s, fill) {
  return `<g transform="translate(${x} ${base}) scale(${s})" fill="${fill}">
    <path d="M-6 0 C-4 -40 -8 -70 -16 -96 L16 -96 C10 -70 8 -40 6 0 Z"/>
    <path d="M-120 -100 C-80 -140 -30 -150 0 -140 C30 -152 82 -142 122 -100 C70 -118 30 -118 0 -112 C-30 -118 -70 -118 -120 -100 Z"/></g>`;
}

export function runnerSky() {
  const r = rng(77);
  let stars = '';
  for (let i = 0; i < 70; i++) stars += `<circle cx="${100 + r() * 1720}" cy="${r() * 420}" r="${0.8 + r() * 1.8}" fill="#fff" opacity="${0.2 + r() * 0.5}"/>`;
  let clouds = '';
  [[420, 300, 1], [1180, 230, 0.8], [1560, 360, 0.9]].forEach(([x, y, s]) => {
    clouds += `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".13"><ellipse cx="0" cy="0" rx="150" ry="22"/><ellipse cx="60" cy="-16" rx="90" ry="20"/></g>`;
  });
  const inner = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.dusk0}"/><stop offset=".35" stop-color="${C.dusk1}"/><stop offset=".6" stop-color="${C.dusk2}"/>
      <stop offset=".78" stop-color="${C.dusk3}"/><stop offset="1" stop-color="${C.dusk4}"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${C.sun}" stop-opacity=".9"/><stop offset="1" stop-color="${C.dusk3}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="1080" fill="url(#sky)"/>${stars}${clouds}
  <circle cx="1000" cy="760" r="300" fill="url(#glow)"/><circle cx="1000" cy="770" r="86" fill="${C.sun}"/>
  ${wave(800, 40, 3, 0.6, '#7a3560', 0.9)}
  ${wave(860, 30, 4, 2.1, '#4a2142', 1)}
  ${acacia(300, 870, 0.9, '#1d0f1c')}${acacia(760, 868, 0.7, '#1d0f1c')}${acacia(1340, 872, 1, '#1d0f1c')}${acacia(1700, 866, 0.65, '#1d0f1c')}
  <rect y="868" width="${W}" height="212" fill="#2a1424"/>`;
  return { svg: svgDoc(W, 1080, inner), width: W, height: 1080 };
}

export function runnerGround() {
  const r = rng(88);
  let bits = '';
  for (let i = 0; i < 46; i++) {
    const x = 30 + r() * 1860, y = 70 + r() * 110;
    bits += `<ellipse cx="${x}" cy="${y}" rx="${4 + r() * 8}" ry="${2 + r() * 3}" fill="${C.earth1}" opacity="${0.25 + r() * 0.35}"/>`;
  }
  let tufts = '';
  for (let i = 0; i < 26; i++) {
    const x = 30 + r() * 1860;
    tufts += `<path d="M${x} 26 l-5 -16 M${x} 26 l0 -22 M${x} 26 l5 -16" stroke="${C.leaf3}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8"/>`;
  }
  const inner = `
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a766"/><stop offset="1" stop-color="#9a6a3c"/></linearGradient></defs>
  <rect width="${W}" height="200" fill="url(#g)"/>
  <rect width="${W}" height="14" fill="${C.leaf1}"/><rect y="14" width="${W}" height="6" fill="${C.earth1}" opacity=".6"/>
  ${tufts}${bits}`;
  return { svg: svgDoc(W, 200, inner), width: W, height: 200 };
}
