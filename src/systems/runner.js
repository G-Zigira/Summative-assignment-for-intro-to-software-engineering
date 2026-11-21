// The runner minigame's rules. Pure logic (no Phaser) so it can be unit tested.
// RunnerScene draws what this module computes. See docs/MINIGAME.md.

import { CONFIG } from '../config.js';

/** Obstacle kinds. Hitboxes are in game pixels and a bit smaller than the pictures (forgiving). */
export const OBSTACLE_TYPES = [
  { kind: 'rock', prop: 'rock', w: 56, h: 40, scale: 0.5 },
  { kind: 'bush', prop: 'bush', w: 66, h: 48, scale: 0.55 },
  { kind: 'tree', prop: 'baobab', w: 40, h: 96, scale: 0.42 },
];

/** Small deterministic random generator (so tests and replays are repeatable). */
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

export function createRun(seed = 1, cfg = CONFIG.RUNNER) {
  return {
    cfg,
    rng: makeRng(seed),
    time: 0,
    distance: 0,
    speed: cfg.START_SPEED,
    y: 0,          // height above the ground (0 = standing)
    vy: 0,
    obstacles: [], // { kind, x (left edge, world px), w, h, prop, scale }
    nextSpawnAt: 700, // world distance of the next obstacle
    status: 'running', // 'running' | 'crashed' | 'won'
    jumps: 0,
  };
}

export const scoreOf = (run) => Math.floor(run.distance / run.cfg.PX_PER_POINT);
export const onGround = (run) => run.y <= 0 && run.vy <= 0;

/** Jump if standing on the ground. Returns true if the jump started. */
export function jump(run) {
  if (run.status !== 'running' || !onGround(run)) return false;
  run.vy = run.cfg.JUMP_VELOCITY;
  run.jumps += 1;
  return true;
}

/** Seconds a jump keeps the runner above `height` px (used to keep gaps fair). */
export function airtimeAbove(height, cfg = CONFIG.RUNNER) {
  const disc = cfg.JUMP_VELOCITY ** 2 - 2 * cfg.GRAVITY * height;
  return disc > 0 ? (2 * Math.sqrt(disc)) / cfg.GRAVITY : 0;
}

function spawnIfNeeded(run) {
  const { cfg } = run;
  // Keep obstacles queued up to one screen ahead of the runner.
  while (run.nextSpawnAt < run.distance + CONFIG.GAME_WIDTH + 200) {
    // Early on, only the low obstacles; the tall tree joins after a few seconds.
    const pool = run.distance < 1500 ? OBSTACLE_TYPES.slice(0, 2) : OBSTACLE_TYPES;
    const type = pool[Math.floor(run.rng() * pool.length)];
    run.obstacles.push({ ...type, x: run.nextSpawnAt });
    // Gap is measured in running time at the CURRENT speed, so it is always jumpable.
    const gapSeconds = cfg.MIN_GAP_AIRTIME + run.rng() * cfg.EXTRA_GAP_AIRTIME;
    const speedThen = Math.min(cfg.MAX_SPEED, run.speed + cfg.ACCEL * 3);
    run.nextSpawnAt += type.w + speedThen * gapSeconds;
  }
}

/** The runner's hitbox in world coordinates (a little smaller than the picture). */
export function playerBox(run) {
  const { cfg } = run;
  const w = 26;
  const h = 50;
  return { x: run.distance + cfg.PLAYER_X - w / 2, y: run.y, w, h }; // y = height of the feet
}

export function hits(run, o) {
  const p = playerBox(run);
  const overlapX = p.x < o.x + o.w && p.x + p.w > o.x;
  const overlapY = p.y < o.h; // feet below the top of the obstacle
  return overlapX && overlapY;
}

/** Advance the run by dt seconds. */
export function step(run, dt, target = run.cfg.TARGET_SCORE) {
  if (run.status !== 'running') return run;
  const { cfg } = run;
  run.time += dt;
  run.speed = Math.min(cfg.MAX_SPEED, run.speed + cfg.ACCEL * dt);
  run.distance += run.speed * dt;

  if (run.y > 0 || run.vy > 0) {
    run.vy -= cfg.GRAVITY * dt;
    run.y += run.vy * dt;
    if (run.y <= 0) { run.y = 0; run.vy = 0; }
  }

  spawnIfNeeded(run);
  run.obstacles = run.obstacles.filter((o) => o.x + o.w > run.distance - 200);
  if (run.obstacles.some((o) => hits(run, o))) { run.status = 'crashed'; return run; }
  if (scoreOf(run) >= target) run.status = 'won';
  return run;
}
