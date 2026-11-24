// Wisdom Catch: the rules of the Anansi basket minigame. Pure logic (no Phaser), unit tested.
// Knowledge falls (+1 shell when caught) and so do bad things (-3 shells). Missing knowledge costs nothing.
// Story mode: reach the goal to win. Both modes: dropping below 0 shells loses.
// BasketScene draws what this module computes. See docs/MINIGAMES.md.

import { CONFIG } from '../config.js';

export const GOOD_TYPES = ['scroll', 'adinkra', 'light'];
export const BAD_TYPES = ['thorn', 'stone', 'vial'];

export function makeRng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param {{endless?: boolean}} options endless = arcade mode (no goal, starts with more shells) */
export function createRun(seed = 1, { endless = false, cfg = CONFIG.BASKET } = {}) {
  return {
    cfg, endless,
    rng: makeRng(seed),
    time: 0,
    shells: endless ? cfg.START_ARCADE : cfg.START_STORY,
    caught: 0,      // knowledge caught
    hurt: 0,        // bad things caught
    missed: 0,      // knowledge that fell past (no penalty)
    x: CONFIG.GAME_WIDTH / 2, // the basket's centre
    move: 0,        // -1, 0, 1 from the keys / buttons
    target: null,   // x to move towards (finger / mouse), or null
    items: [],      // { kind: 'good'|'bad', type, x, y, vy, caught? }
    nextSpawnIn: 0.6,
    lastX: CONFIG.GAME_WIDTH / 2,
    events: [],     // { type: 'good'|'bad', x } - the scene plays sounds and drains this
    status: 'running', // 'running' | 'won' | 'lost'
  };
}

export const setMove = (run, dir) => { run.move = Math.sign(dir); run.target = null; };
export const setTarget = (run, x) => { run.target = x; };

const fallSpeed = (run) => Math.min(run.cfg.FALL_MAX, run.cfg.FALL_START + run.cfg.FALL_ACCEL * run.time);
const spawnEvery = (run) => Math.max(run.cfg.SPAWN_MIN, run.cfg.SPAWN_START - run.cfg.SPAWN_DECAY * run.time);
const badShare = (run) => Math.min(run.cfg.BAD_MAX, run.cfg.BAD_START + 0.002 * run.time);

function spawn(run) {
  const { cfg } = run;
  const margin = 40;
  const bad = run.rng() < badShare(run);
  let x = run.lastX;
  for (let tries = 0; tries < 6; tries += 1) {
    const lo = Math.max(margin, run.lastX - cfg.MAX_SHIFT);
    const hi = Math.min(CONFIG.GAME_WIDTH - margin, run.lastX + cfg.MAX_SHIFT);
    x = lo + run.rng() * (hi - lo);
    // never drop two things on top of each other: they could not be told apart or separated
    if (!run.items.some((i) => i.y < 150 && Math.abs(i.x - x) < cfg.WIDTH * 0.8)) break;
  }
  run.lastX = x;
  const types = bad ? BAD_TYPES : GOOD_TYPES;
  run.items.push({
    kind: bad ? 'bad' : 'good',
    type: types[Math.floor(run.rng() * types.length)],
    x, y: -30, vy: fallSpeed(run) * (0.92 + run.rng() * 0.16),
  });
}

export function step(run, dt) {
  if (run.status !== 'running') return run;
  const { cfg } = run;
  run.time += dt;

  // Move the basket (keys / buttons, or towards the finger / mouse).
  const half = cfg.WIDTH / 2;
  if (run.move !== 0) run.x += run.move * cfg.SPEED * dt;
  else if (run.target !== null) {
    const d = run.target - run.x;
    const stepPx = Math.min(Math.abs(d), cfg.POINTER_SPEED * dt);
    run.x += Math.sign(d) * stepPx;
  }
  run.x = Math.min(CONFIG.GAME_WIDTH - half, Math.max(half, run.x));

  run.nextSpawnIn -= dt;
  if (run.nextSpawnIn <= 0) { spawn(run); run.nextSpawnIn += spawnEvery(run); }

  for (const it of run.items) {
    const prevY = it.y;
    it.y += it.vy * dt;
    // caught: the item's bottom crosses the basket's rim while it is over the basket
    const bottom = it.y + cfg.ITEM_R;
    if (!it.done && bottom >= cfg.RIM_Y && prevY + cfg.ITEM_R < cfg.RIM_Y + 30 && Math.abs(it.x - run.x) <= half + 6) {
      it.done = true; it.caught = true;
      if (it.kind === 'good') { run.shells += cfg.GOOD_SHELLS; run.caught += 1; }
      else { run.shells += cfg.BAD_SHELLS; run.hurt += 1; }
      run.events.push({ type: it.kind, x: it.x });
    } else if (!it.done && it.y > CONFIG.GAME_HEIGHT + 40) {
      it.done = true;
      if (it.kind === 'good') run.missed += 1;
    }
  }
  run.items = run.items.filter((i) => !i.done);

  if (run.shells < 0) run.status = 'lost';
  else if (!run.endless && run.shells >= cfg.GOAL) run.status = 'won';
  return run;
}
