import { describe, it, expect } from 'vitest';
import { createRun, step, jump, scoreOf, airtimeAbove, hits, OBSTACLE_TYPES, makeRng } from '../src/systems/runner.js';
import { CONFIG } from '../src/config.js';

const R = CONFIG.RUNNER;
const DT = 1 / 60;

/** Play with a simple bot: jump when the next obstacle is `lead` px ahead. */
function bot(seed, lead, maxSeconds = 120) {
  const run = createRun(seed);
  for (let i = 0; i < maxSeconds * 60 && run.status === 'running'; i += 1) {
    const front = run.distance + R.PLAYER_X + 13;
    const next = run.obstacles.find((o) => o.x + o.w > front - 13);
    if (next && next.x - front < lead && next.x - front > -10) jump(run);
    step(run, DT);
  }
  return run;
}

describe('runner rules', () => {
  it('score grows with distance and reaching the target wins', () => {
    const run = createRun(1);
    run.obstacles = []; run.nextSpawnAt = 1e9; // no obstacles
    while (run.status === 'running') step(run, DT);
    expect(run.status).toBe('won');
    expect(scoreOf(run)).toBeGreaterThanOrEqual(R.TARGET_SCORE);
  });

  it('a normal run takes between 8 and 25 seconds', () => {
    const run = createRun(1);
    run.nextSpawnAt = 1e9;
    while (run.status === 'running') step(run, DT);
    expect(run.time).toBeGreaterThan(8);
    expect(run.time).toBeLessThan(25);
  });

  it('jumping leaves and returns to the ground; no double jump', () => {
    const run = createRun(2);
    run.nextSpawnAt = 1e9;
    expect(jump(run)).toBe(true);
    step(run, 0.1);
    expect(run.y).toBeGreaterThan(0);
    expect(jump(run)).toBe(false);
    for (let i = 0; i < 120; i += 1) step(run, DT);
    expect(run.y).toBe(0);
    expect(jump(run)).toBe(true);
  });

  it('crashes when running into an obstacle', () => {
    const run = createRun(3);
    run.obstacles = [{ ...OBSTACLE_TYPES[0], x: run.distance + R.PLAYER_X + 40 }];
    run.nextSpawnAt = 1e9;
    for (let i = 0; i < 60 && run.status === 'running'; i += 1) step(run, DT);
    expect(run.status).toBe('crashed');
  });

  it('a well-timed jump clears every obstacle type', () => {
    for (const type of OBSTACLE_TYPES) {
      const run = createRun(4);
      run.nextSpawnAt = 1e9;
      run.obstacles = [{ ...type, x: run.distance + 400 }];
      for (let i = 0; i < 240 && run.status === 'running'; i += 1) {
        const front = run.distance + R.PLAYER_X + 13;
        if (run.obstacles[0] && run.obstacles[0].x - front < 90 && run.obstacles[0].x - front > 0) jump(run);
        step(run, DT);
      }
      expect(run.status, type.kind).not.toBe('crashed');
    }
  });

  it('every obstacle is lower than the jump height', () => {
    const peak = R.JUMP_VELOCITY ** 2 / (2 * R.GRAVITY);
    OBSTACLE_TYPES.forEach((o) => expect(o.h).toBeLessThan(peak - 20));
  });

  it('is always winnable: a simple bot with fair timing wins on many seeds', () => {
    let wins = 0;
    for (let seed = 1; seed <= 25; seed += 1) {
      const run = bot(seed, 95);
      if (run.status === 'won') wins += 1;
    }
    expect(wins).toBeGreaterThanOrEqual(23);
  });

  it('gaps leave time to land before the next obstacle', () => {
    const run = createRun(7);
    run.nextSpawnAt = 700;
    step(run, DT);
    // force lots of spawning
    run.distance = 50000; run.speed = R.MAX_SPEED; step(run, DT);
    for (let i = 1; i < run.obstacles.length; i += 1) {
      const gap = run.obstacles[i].x - (run.obstacles[i - 1].x + run.obstacles[i - 1].w);
      expect(gap / R.MAX_SPEED).toBeGreaterThan(R.MIN_GAP_AIRTIME * 0.9);
    }
    expect(airtimeAbove(96)).toBeGreaterThan(0.3);
  });

  it('same seed gives the same obstacles', () => {
    const a = createRun(9); const b = createRun(9);
    for (let i = 0; i < 300; i += 1) { step(a, DT); step(b, DT); }
    expect(a.obstacles.map((o) => o.x)).toEqual(b.obstacles.map((o) => o.x));
    expect(makeRng(5)()).toBe(makeRng(5)());
  });

  it('hits() only counts feet below the obstacle top', () => {
    const run = createRun(1);
    const o = { ...OBSTACLE_TYPES[0], x: run.distance + R.PLAYER_X - 10 };
    expect(hits(run, o)).toBe(true);
    run.y = o.h + 5;
    expect(hits(run, o)).toBe(false);
  });
});
