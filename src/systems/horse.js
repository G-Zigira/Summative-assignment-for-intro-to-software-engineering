// Horse Charge: the rules of the Sundiata battle minigame. Pure logic (no Phaser), unit tested.
// The rider gallops by itself. Jump over rocks and bushes; throw spears at the soldiers.
// A soldier that reaches the rider, or an obstacle that is not jumped, ends the run.
// HorseScene draws what this module computes. See docs/MINIGAMES.md.

import { CONFIG } from '../config.js';

export const OBSTACLES = [
  { kind: 'rock', prop: 'rock', w: 56, h: 40, scale: 0.5 },
  { kind: 'bush', prop: 'bush', w: 66, h: 48, scale: 0.55 },
];
export const SOLDIER = { w: 46, h: 140 };
const RIDER = { w: 64, h: 70 };    // the horse and rider hitbox (a bit smaller than the picture)
const SPEAR = { w: 70, h: 14 };

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

/** @param {number} seed  @param {{endless?: boolean}} options endless = arcade mode (no winning) */
export function createRun(seed = 1, { endless = false, cfg = CONFIG.HORSE } = {}) {
  return {
    cfg, endless,
    rng: makeRng(seed),
    time: 0, distance: 0, speed: cfg.START_SPEED,
    y: 0, vy: 0,
    cooldown: 0,
    kills: 0, throws: 0, jumps: 0,
    spears: [],     // { x (world), y (height above the ground), alive }
    obstacles: [],  // { kind, x (left edge), w, h, prop, scale }
    soldiers: [],   // { x (left edge), w, h, alive, died? }
    events: [],     // 'jump' | 'throw' | 'kill' | 'crash' | 'win' - the scene plays sounds and drains this
    nextSpawnAt: 800,
    status: 'running', // 'running' | 'crashed' | 'won'
    crashedBy: null,   // 'soldier' | 'obstacle'
  };
}

export const onGround = (run) => run.y <= 0 && run.vy <= 0;
export const riderX = (run) => run.distance + run.cfg.PLAYER_X; // world x of the rider's centre
export const scoreOf = (run) =>
  run.kills * run.cfg.KILL_POINTS + Math.floor(run.distance / run.cfg.PX_PER_POINT);

export function jump(run) {
  if (run.status !== 'running' || !onGround(run)) return false;
  run.vy = run.cfg.JUMP_VELOCITY;
  run.jumps += 1;
  run.events.push('jump');
  return true;
}

/** Throw a spear (needs the cooldown to be over). */
export function throwSpear(run) {
  if (run.status !== 'running' || run.cooldown > 0) return false;
  run.cooldown = run.cfg.SPEAR_COOLDOWN;
  run.throws += 1;
  run.spears.push({ x: riderX(run) + 30, y: run.y + run.cfg.SPEAR_HEIGHT, alive: true });
  run.events.push('throw');
  return true;
}

function spawnIfNeeded(run) {
  const { cfg } = run;
  while (run.nextSpawnAt < run.distance + CONFIG.GAME_WIDTH + 200) {
    const ramp = Math.min(1, run.distance / 6000);
    // The first thing is always a soldier, so the player learns to throw.
    const soldier = run.soldiers.length === 0 && run.obstacles.length === 0 ? true : run.rng() < 0.5 + 0.2 * ramp;
    if (soldier) run.soldiers.push({ ...SOLDIER, x: run.nextSpawnAt, alive: true });
    else {
      const t = OBSTACLES[Math.floor(run.rng() * OBSTACLES.length)];
      run.obstacles.push({ ...t, x: run.nextSpawnAt });
    }
    // The gap is in seconds of riding at the CURRENT speed (plus the soldiers' own walking speed).
    const speedThen = Math.min(cfg.MAX_SPEED, run.speed + cfg.ACCEL * 3);
    const seconds = cfg.MIN_GAP + run.rng() * cfg.EXTRA_GAP - 0.25 * ramp;
    run.nextSpawnAt += 60 + (speedThen + cfg.SOLDIER_SPEED) * seconds;
  }
}

const overlapX = (ax, aw, bx, bw) => ax < bx + bw && ax + aw > bx;

/** Advance by dt seconds (use steps of 1/60 or less). */
export function step(run, dt) {
  if (run.status !== 'running') return run;
  const { cfg } = run;
  run.time += dt;
  run.cooldown = Math.max(0, run.cooldown - dt);
  run.speed = Math.min(cfg.MAX_SPEED, run.speed + cfg.ACCEL * dt);
  run.distance += run.speed * dt;

  if (run.y > 0 || run.vy > 0) {
    run.vy -= cfg.GRAVITY * dt;
    run.y += run.vy * dt;
    if (run.y <= 0) { run.y = 0; run.vy = 0; }
  }

  spawnIfNeeded(run);
  for (const s of run.soldiers) if (s.alive) s.x -= cfg.SOLDIER_SPEED * dt;

  // Spears fly in the world and kill the first soldier they touch.
  for (const sp of run.spears) {
    if (!sp.alive) continue;
    sp.x += cfg.SPEAR_SPEED * dt;
    for (const s of run.soldiers) {
      if (s.alive && overlapX(sp.x, SPEAR.w, s.x, s.w) && sp.y < s.h && sp.y + SPEAR.h > 0) {
        s.alive = false; s.diedAt = run.time; sp.alive = false;
        run.kills += 1;
        run.events.push('kill');
        break;
      }
    }
    if (sp.x > run.distance + CONFIG.GAME_WIDTH + 120) sp.alive = false;
  }
  run.spears = run.spears.filter((sp) => sp.alive);
  run.soldiers = run.soldiers.filter((s) => s.alive || run.time - s.diedAt < 0.6);
  run.obstacles = run.obstacles.filter((o) => o.x + o.w > run.distance - 200);
  run.soldiers = run.soldiers.filter((s) => s.x + s.w > run.distance - 200);

  // Crashing: into an obstacle you did not jump, or into a soldier you did not stop.
  const rx = riderX(run) - RIDER.w / 2;
  if (run.obstacles.some((o) => overlapX(rx, RIDER.w, o.x, o.w) && run.y < o.h)) {
    run.status = 'crashed'; run.crashedBy = 'obstacle'; run.events.push('crash'); return run;
  }
  if (run.soldiers.some((s) => s.alive && overlapX(rx, RIDER.w, s.x, s.w) && run.y < s.h)) {
    run.status = 'crashed'; run.crashedBy = 'soldier'; run.events.push('crash'); return run;
  }
  if (!run.endless && run.kills >= cfg.TARGET_KILLS) { run.status = 'won'; run.events.push('win'); }
  return run;
}
