import { describe, it, expect } from 'vitest';
import { createRun, step, setMove, setTarget } from '../src/systems/basket.js';
import { CONFIG } from '../src/config.js';

const B = CONFIG.BASKET;
const DT = 1 / 60;

/** A careful bot: goes for the lowest reachable knowledge, and never into a bad thing's path. */
function bot(seed, { endless = false, seconds = 120 } = {}) {
  const run = createRun(seed, { endless });
  for (let i = 0; i < seconds * 60 && run.status === 'running'; i += 1) {
    const rim = B.RIM_Y - B.ITEM_R;
    const t = (it) => (rim - it.y) / it.vy;
    const reach = (x, tt) => Math.abs(x - run.x) <= B.SPEED * tt + B.WIDTH / 2 - 14;
    const safe = (x, tt) => !run.items.some((b) => b.kind === 'bad' && t(b) > -0.1 && t(b) < tt + 0.25 && Math.abs(b.x - x) < B.WIDTH / 2 + B.ITEM_R + 8);
    const goods = run.items.filter((g) => g.kind === 'good' && t(g) > 0).sort((a, b) => t(a) - t(b));
    const pick = goods.find((g) => reach(g.x, t(g)) && safe(g.x, t(g)));
    if (pick) setTarget(run, pick.x);
    else {
      // otherwise stand where nothing bad is about to land
      const danger = run.items.filter((b) => b.kind === 'bad' && t(b) > -0.1 && t(b) < 1.2 && Math.abs(b.x - run.x) < B.WIDTH);
      if (danger.length) setTarget(run, danger[0].x > run.x ? Math.max(60, danger[0].x - B.WIDTH) : Math.min(900, danger[0].x + B.WIDTH));
    }
    step(run, DT);
  }
  return run;
}

describe('wisdom catch rules', () => {
  it('catching knowledge gives +1 shell, a bad thing takes 3', () => {
    const run = createRun(1); run.nextSpawnIn = 1e9;
    const before = run.shells;
    run.items.push({ kind: 'good', type: 'scroll', x: run.x, y: B.RIM_Y - 60, vy: 300 });
    for (let i = 0; i < 30; i += 1) step(run, DT);
    expect(run.shells).toBe(before + 1);
    expect(run.caught).toBe(1);
    run.items.push({ kind: 'bad', type: 'thorn', x: run.x, y: B.RIM_Y - 60, vy: 300 });
    for (let i = 0; i < 30; i += 1) step(run, DT);
    expect(run.shells).toBe(before + 1 - 3);
    expect(run.hurt).toBe(1);
  });

  it('missed knowledge costs nothing; missed bad things are harmless', () => {
    const run = createRun(1); run.nextSpawnIn = 1e9; run.x = 100;
    run.items.push({ kind: 'good', type: 'light', x: 800, y: 300, vy: 400 }, { kind: 'bad', type: 'stone', x: 700, y: 300, vy: 400 });
    const before = run.shells;
    for (let i = 0; i < 120; i += 1) step(run, DT);
    expect(run.shells).toBe(before);
    expect(run.missed).toBe(1);
    expect(run.items.length).toBe(0);
  });

  it('dropping below 0 shells loses; reaching the goal wins (story mode only)', () => {
    const lose = createRun(1); lose.nextSpawnIn = 1e9; lose.shells = 2;
    lose.items.push({ kind: 'bad', type: 'vial', x: lose.x, y: B.RIM_Y - 40, vy: 300 });
    for (let i = 0; i < 30; i += 1) step(lose, DT);
    expect(lose.shells).toBe(-1);
    expect(lose.status).toBe('lost');

    const win = createRun(1); win.nextSpawnIn = 1e9; win.shells = B.GOAL - 1;
    win.items.push({ kind: 'good', type: 'scroll', x: win.x, y: B.RIM_Y - 40, vy: 300 });
    for (let i = 0; i < 30; i += 1) step(win, DT);
    expect(win.status).toBe('won');

    const arcade = createRun(1, { endless: true }); arcade.nextSpawnIn = 1e9; arcade.shells = B.GOAL - 1;
    arcade.items.push({ kind: 'good', type: 'scroll', x: arcade.x, y: B.RIM_Y - 40, vy: 300 });
    for (let i = 0; i < 30; i += 1) step(arcade, DT);
    expect(arcade.status).toBe('running');
  });

  it('the basket moves with the keys, towards a finger, and stays on screen', () => {
    const run = createRun(1); run.nextSpawnIn = 1e9;
    setMove(run, -1);
    for (let i = 0; i < 300; i += 1) step(run, DT);
    expect(run.x).toBe(B.WIDTH / 2);
    setTarget(run, 700);
    setMove(run, 0); setTarget(run, 700);
    for (let i = 0; i < 60; i += 1) step(run, DT);
    expect(run.x).toBeCloseTo(700, 0);
    setMove(run, 1);
    for (let i = 0; i < 300; i += 1) step(run, DT);
    expect(run.x).toBe(CONFIG.GAME_WIDTH - B.WIDTH / 2);
  });

  it('things fall faster and more often as time passes', () => {
    const a = createRun(1); const b = createRun(1);
    b.time = 90;
    step(a, DT); step(b, DT);
    a.nextSpawnIn = 0; b.nextSpawnIn = 0;
    step(a, DT); step(b, DT);
    expect(b.items[b.items.length - 1].vy).toBeGreaterThan(a.items[a.items.length - 1].vy);
  });

  it('there is always a falling thing within reach of the previous one (consecutive items are close)', () => {
    const run = createRun(9);
    const xs = [];
    for (let i = 0; i < 60 * 60; i += 1) { const before = run.lastX; step(run, DT); if (run.lastX !== before) xs.push(run.lastX); run.status = 'running'; run.shells = 99; }
    for (let i = 1; i < xs.length; i += 1) expect(Math.abs(xs[i] - xs[i - 1])).toBeLessThanOrEqual(B.MAX_SHIFT + 1);
  });

  it('the game is winnable: a bot wins at least 22 of 25 stories', () => {
    let wins = 0;
    for (let seed = 1; seed <= 25; seed += 1) if (bot(seed * 7919).status === 'won') wins += 1;
    expect(wins).toBeGreaterThanOrEqual(22);
  });

  it('a story round takes a sensible time (15 to 60 seconds)', () => {
    const r = bot(42);
    expect(r.status).toBe('won');
    expect(r.time).toBeGreaterThan(15);
    expect(r.time).toBeLessThan(60);
  });
});
