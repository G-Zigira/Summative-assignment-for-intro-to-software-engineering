import { CONFIG } from '../config.js';

// Small visual extras: a soft dark edge (vignette), floating lights that fit the place
// (embers, fireflies, dust...) and a fade-in between screens. All drawn in code (no files),
// all cheap, and none of it changes how the game plays.

const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;

/**
 * Draw something once into a texture and reuse it. (A Graphics object is redrawn every frame, which is
 * slow on weak devices; a baked picture is drawn like any other image.)  draw(g) paints in 0..w, 0..h.
 */
export function bake(scene, key, w, h, draw) {
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, Math.ceil(w), Math.ceil(h));
    g.destroy();
  }
  return key;
}

export function fadeIn(scene, ms = 350) {
  scene.cameras.main.fadeIn(ms, 20, 17, 15);
}

export function addVignette(scene, depth = 2.8, strength = 0.38) {
  const key = `vignette-${Math.round(strength * 100)}`;
  if (!scene.textures.exists(key)) {
    const tex = scene.textures.createCanvas(key, W, H);
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.32, W / 2, H * 0.55, H * 0.88);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    tex.refresh();
  }
  return scene.add.image(W / 2, H / 2, key).setDepth(depth);
}

// What floats around in each place (anything not listed gets plain dust).
export const AMBIENT_FOR_AREA = {
  courtyard: 'dust', 'wall-garden': 'petals', road: 'dust', 'exile-plains': 'dust',
  forest: 'fireflies', 'big-tree': 'fireflies', kirina: 'embers', forge: 'embers',
  'kangaba-hall': 'embers', 'farm-village': 'petals', 'village-square': 'lights',
  title: 'fireflies',
};

const KINDS = {
  embers:    { color: [0xff9a2e, 0xffd27a], count: 12, size: [1.5, 3.2], alpha: 0.8, dx: [-20, 30], dy: [-170, -70], dur: [2600, 5200] },
  fireflies: { color: [0xfff2a0, 0xc8ff9a], count: 10, size: [2, 3.6], alpha: 0.9, dx: [-50, 50], dy: [-40, 40], dur: [2600, 5200], blink: true },
  dust:      { color: [0xe8cf9a, 0xd9b277], count: 9, size: [1.5, 3], alpha: 0.35, dx: [120, 260], dy: [-12, 12], dur: [4500, 8000] },
  petals:    { color: [0xffffff, 0xffe28a, 0xf6a6b0], count: 8, size: [2, 3.4], alpha: 0.75, dx: [40, 120], dy: [60, 140], dur: [4500, 8000] },
  lights:    { color: [0xfff0a8, 0xffd54a], count: 12, size: [2, 4.2], alpha: 0.85, dx: [-30, 30], dy: [-120, -50], dur: [3500, 6500], blink: true },
};

export function addAmbient(scene, kindName, { top = 170, depth = 2.9 } = {}) {
  const k = KINDS[kindName] ?? KINDS.dust;
  const rand = (a, b) => a + Math.random() * (b - a);
  const made = [];
  for (let i = 0; i < k.count; i += 1) {
    const x = rand(0, W), y = rand(top, H);
    const c = scene.add.circle(x, y, rand(...k.size), k.color[i % k.color.length], 0).setDepth(depth);
    const dur = rand(...k.dur);
    scene.tweens.add({
      targets: c, x: x + rand(...k.dx), y: y + rand(...k.dy), duration: dur, repeat: -1, delay: rand(0, 2500), ease: 'Sine.easeInOut',
    });
    scene.tweens.add({
      targets: c, alpha: k.alpha, duration: dur / (k.blink ? 2.5 : 2), yoyo: true, repeat: -1, delay: rand(0, 2500),
    });
    made.push(c);
  }
  // Weak devices matter more than decoration: if the game is running slowly, the floating lights go away.
  scene.time.delayedCall(4000, () => {
    if (scene.game.loop.actualFps < 26) made.forEach((c) => { scene.tweens.killTweensOf(c); c.destroy(); });
  });
  return made;
}
