import { describe, it, expect } from 'vitest';
import { loadBests, recordScore, ARCADE_GAMES } from '../src/systems/arcade.js';
import { createSafeStorage } from '../src/systems/storage.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };

describe('arcade best scores', () => {
  it('starts at zero for all three games', () => {
    const m0 = memory(); const b = loadBests(createSafeStorage(() => m0));
    expect(Object.keys(b)).toEqual(ARCADE_GAMES.map((g) => g.id));
    expect(Object.values(b)).toEqual([0, 0, 0]);
  });
  it('keeps only the best and says when it is new', () => {
    const m = memory(); const s = createSafeStorage(() => m);
    expect(recordScore(s, 'horse', 40)).toEqual({ best: 40, isNew: true });
    expect(recordScore(s, 'horse', 25)).toEqual({ best: 40, isNew: false });
    expect(recordScore(s, 'horse', 41.9)).toEqual({ best: 41, isNew: true });
    expect(loadBests(s).horse).toBe(41);
    expect(loadBests(s).basket).toBe(0);
  });
  it('works (without remembering) when storage is unavailable, and ignores a damaged value', () => {
    const none = createSafeStorage(() => null);
    expect(recordScore(none, 'runner', 10).isNew).toBe(true);
    expect(loadBests(none).runner).toBe(0);
    const bad = memory(); bad.setItem('sankofa-trails/arcade', '{nope');
    expect(loadBests(createSafeStorage(() => bad)).horse).toBe(0);
  });
});
