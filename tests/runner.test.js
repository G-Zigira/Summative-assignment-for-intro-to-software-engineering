import { describe, it, expect } from 'vitest';
import { createRun, step, jump, scoreOf, airtimeAbove, hits, onGround, OBSTACLE_TYPES, makeRng } from '../src/systems/runner.js';
import { CONFIG } from '../src/config.js';

const R = CONFIG.RUNNER;
const DT = 1 / 60;

/** A simple bot: jumps when the next obstacle is close, and double-jumps over tall ones. */
function bot(seed, maxSeconds = 120) {
  const run = createRun(seed);
  for (let i = 0; i < maxSeconds * 60 && run.status === 'running'; i += 1) {
    const front = run.distance + R.PLAYER_X + 13;
    const next = run.obstacles.find((o) => o.x + o.w > front - 13);
    const ahead = next ? next.x - front : Infinity;
    const tall = next && next.h > 100;
    if (next && ahead > -10 && ahead < run.speed * (tall ? 0.3 : 0.21)) {
      if (onGround(run)) jump(run);
      else if (tall && run.airJumps === 0 && run.vy < 200) jump(run); // second jump on the way up
    }
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

  it('jump leaves the ground, a second press in the air double-jumps, a third does nothing', () => {
    const run = createRun(2);
    run.nextSpawnAt = 1e9;
    expect(jump(run)).toBe('jump');
    step(run, 0.15);
    const y1 = run.y;
    expect(y1).toBeGreaterThan(0);
    expect(jump(run)).toBe('double');
    expect(jump(run)).toBe(false);
    for (let i = 0; i < 90; i += 1) step(run, DT);
    expect(run.y).toBe(0);
    expect(jump(run)).toBe('jump'); // landing resets the double jump
  });

  it('the double jump reaches higher than a single jump', () => {
    const peak = (double) => {
      const run = createRun(2); run.nextSpawnAt = 1e9;
      jump(run); let max = 0;
      for (let i = 0; i < 120; i += 1) {
        if (double && run.airJumps === 0 && run.vy < 150) jump(run);
        step(run, DT); max = Math.max(max, run.y);
      }
      return max;
    };
    expect(peak(true)).toBeGreaterThan(peak(false) + 60);
  });

  it('the tall tree cannot be cleared with one jump (at any timing), but can with a double jump', () => {
    const tree = OBSTACLE_TYPES.find((o) => o.kind === 'tree');
    const clearedAt = (double, lead) => {
      const run = createRun(5); run.nextSpawnAt = 1e9;
      const ob = { ...tree, x: run.distance + 400 };
      run.obstacles = [ob];
      for (let i = 0; i < 200 && run.status === 'running'; i += 1) {
        const ahead = ob.x - (run.distance + R.PLAYER_X + 13);
        if (onGround(run) && ahead <= lead && ahead > 0 && run.jumps === 0) jump(run);
        if (double && run.airJumps === 0 && run.jumps === 1 && run.vy < 200) jump(run);
        step(run, DT);
      }
      return run.status !== 'crashed';
    };
    const leads = Array.from({ length: 60 }, (_, i) => 10 + i * 3);
    expect(leads.some((l) => clearedAt(false, l))).toBe(false);
    expect(leads.filter((l) => clearedAt(true, l)).length).toBeGreaterThan(10); // a wide, forgiving window
  });

  it('collecting cowrie shells adds points', () => {
    const run = createRun(6); run.nextSpawnAt = 1e9;
    run.pickups = [{ x: run.distance + R.PLAYER_X + 100, h: 30, taken: false }];
    for (let i = 0; i < 30; i += 1) step(run, DT); // running along the ground through it
    expect(run.cowries).toBe(1);
    expect(scoreOf(run)).toBeGreaterThanOrEqual(R.COWRIE_POINTS);
  });

  it('crashes when running into an obstacle', () => {
    const run = createRun(3);
    run.obstacles = [{ ...OBSTACLE_TYPES[0], x: run.distance + R.PLAYER_X + 40 }];
    run.nextSpawnAt = 1e9;
    for (let i = 0; i < 60 && run.status === 'running'; i += 1) step(run, DT);
    expect(run.status).toBe('crashed');
  });

  it('a well-timed jump clears every obstacle type (a double jump for the tree)', () => {
    for (const type of OBSTACLE_TYPES) {
      const run = createRun(4);
      run.nextSpawnAt = 1e9;
      const ob = { ...type, x: run.distance + 400 };
      run.obstacles = [ob];
      const tall = type.h > 100;
      for (let i = 0; i < 240 && run.status === 'running'; i += 1) {
        const ahead = ob.x - (run.distance + R.PLAYER_X + 13);
        if (ahead < run.speed * (tall ? 0.3 : 0.21) && ahead > 0 && onGround(run)) jump(run);
        if (tall && run.airJumps === 0 && run.jumps === 1 && run.vy < 200) jump(run);
        step(run, DT);
      }
      expect(run.status, type.kind).not.toBe('crashed');
    }
  });

  it('obstacles are lower than the double-jump height, and only the tree needs it', () => {
    const single = R.JUMP_VELOCITY ** 2 / (2 * R.GRAVITY);
    OBSTACLE_TYPES.forEach((o) => expect(o.h).toBeLessThan(single + 120));
    expect(OBSTACLE_TYPES.filter((o) => o.h > single - 20).map((o) => o.kind)).toEqual(['tree']);
  });

  it('is always winnable: a simple bot with fair timing wins on many seeds', () => {
    let wins = 0;
    for (let seed = 1; seed <= 25; seed += 1) {
      const run = bot(seed);
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
