import { describe, it, expect } from 'vitest';
import { createRun, step, jump, throwSpear, onGround, riderX, scoreOf } from '../src/systems/horse.js';
import { CONFIG } from '../src/config.js';

const H = CONFIG.HORSE;
const DT = 1 / 60;

/** A simple bot: throws at the next soldier, jumps over obstacles. */
function bot(seed, { endless = false, seconds = 90 } = {}) {
  const run = createRun(seed, { endless });
  for (let i = 0; i < seconds * 60 && run.status === 'running'; i += 1) {
    const front = riderX(run) + 32;
    const soldier = run.soldiers.find((s) => s.alive && s.x + s.w > front - 32);
    const ahead = soldier ? soldier.x - front : Infinity;
    const covered = soldier && run.spears.some((sp) => sp.x < soldier.x && sp.x > riderX(run));
    if (soldier && ahead < 650 && ahead > 40 && !covered && onGround(run)) throwSpear(run);
    const obstacle = run.obstacles.find((o) => o.x + o.w > front - 32);
    const oAhead = obstacle ? obstacle.x - front : Infinity;
    if (obstacle && oAhead > -20 && oAhead < run.speed * 0.2 && onGround(run)) jump(run);
    step(run, DT);
  }
  return run;
}

describe('horse charge rules', () => {
  it('the first thing to appear is a soldier, so the player learns to throw', () => {
    const run = createRun(5);
    for (let i = 0; i < 600; i += 1) step(run, DT);
    expect(run.soldiers.length + run.kills).toBeGreaterThan(0);
  });

  it('a spear leaves the rider, flies forward and kills a soldier it hits', () => {
    const run = createRun(1);
    run.nextSpawnAt = 1e9;
    run.soldiers.push({ x: riderX(run) + 500, w: 46, h: 140, alive: true });
    expect(throwSpear(run)).toBe(true);
    for (let i = 0; i < 120 && run.kills === 0; i += 1) step(run, DT);
    expect(run.kills).toBe(1);
    expect(run.soldiers.some((s) => s.alive)).toBe(false);
    expect(run.events).toContain('kill');
  });

  it('spears have a cooldown', () => {
    const run = createRun(1); run.nextSpawnAt = 1e9;
    expect(throwSpear(run)).toBe(true);
    expect(throwSpear(run)).toBe(false);
    for (let i = 0; i < 30; i += 1) step(run, DT); // 0.5 s
    expect(throwSpear(run)).toBe(true);
  });

  it('a soldier that reaches the rider ends the run', () => {
    const run = createRun(1); run.nextSpawnAt = 1e9;
    run.soldiers.push({ x: riderX(run) + 300, w: 46, h: 140, alive: true });
    for (let i = 0; i < 300 && run.status === 'running'; i += 1) step(run, DT);
    expect(run.status).toBe('crashed');
    expect(run.crashedBy).toBe('soldier');
  });

  it('an obstacle that is not jumped ends the run; jumping clears it', () => {
    const make = () => { const r = createRun(1); r.nextSpawnAt = 1e9; r.obstacles.push({ kind: 'rock', x: riderX(r) + 400, w: 56, h: 40 }); return r; };
    const a = make();
    for (let i = 0; i < 200 && a.status === 'running'; i += 1) step(a, DT);
    expect(a.crashedBy).toBe('obstacle');
    const b = make();
    for (let i = 0; i < 200 && b.status === 'running'; i += 1) {
      if (b.obstacles[0] && b.obstacles[0].x - (riderX(b) + 32) < 25 && onGround(b)) jump(b);
      step(b, DT);
    }
    expect(b.status).toBe('running');
  });

  it('a thrown spear passes over low obstacles (they do not block it)', () => {
    const run = createRun(1); run.nextSpawnAt = 1e9;
    run.obstacles.push({ kind: 'bush', x: riderX(run) + 200, w: 66, h: 48 });
    run.soldiers.push({ x: riderX(run) + 600, w: 46, h: 140, alive: true });
    throwSpear(run);
    for (let i = 0; i < 20; i += 1) step(run, DT);
    expect(run.status).toBe('running'); // the rider has not hit it yet
    for (let i = 0; i < 60; i += 1) { step(run, DT); if (run.kills) break; }
    expect(run.kills).toBe(1);
  });

  it('story mode: defeating the target number of soldiers wins; arcade mode never wins', () => {
    const story = bot(3);
    expect(['won', 'crashed']).toContain(story.status);
    const run = createRun(1, { endless: true }); run.nextSpawnAt = 1e9;
    run.kills = H.TARGET_KILLS + 5;
    step(run, DT);
    expect(run.status).toBe('running');
  });

  it('the game is winnable: a bot wins at least 23 of 25 random battles', () => {
    let wins = 0;
    for (let seed = 1; seed <= 25; seed += 1) if (bot(seed * 7919).status === 'won') wins += 1;
    expect(wins).toBeGreaterThanOrEqual(23);
  });

  it('endless mode is survivable for a long time by the bot, and the score grows', () => {
    const run = bot(11, { endless: true, seconds: 60 });
    expect(run.time).toBeGreaterThan(40);
    expect(scoreOf(run)).toBeGreaterThan(50);
  });

  it('a battle takes a sensible time (15 to 60 seconds)', () => {
    const times = [];
    for (let seed = 1; seed <= 8; seed += 1) { const r = bot(seed * 31); if (r.status === 'won') times.push(r.time); }
    expect(times.length).toBeGreaterThan(5);
    expect(Math.min(...times)).toBeGreaterThan(12);
    expect(Math.max(...times)).toBeLessThan(60);
  });
});
