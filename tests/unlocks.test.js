import { describe, it, expect } from 'vitest';
import { createNewSave } from '../src/systems/saveManager.js';
import {
  completeTrail, unlockCodexEntries, recordChoice, isTrailUnlocked, isTrailCompleted,
} from '../src/systems/unlocks.js';

const order = ['trail1', 'trail2', 'trail3'];
const fresh = () => createNewSave({ firstTrailId: 'trail1' });

describe('trail unlocking (FR 3.3)', () => {
  it('only Trail 1 is unlocked on a new game', () => {
    const save = fresh();
    expect(isTrailUnlocked(save, 'trail1')).toBe(true);
    expect(isTrailUnlocked(save, 'trail2')).toBe(false);
  });

  it('finishing Trail N unlocks Trail N+1 and clears the current scene (SP-3)', () => {
    const playing = { ...fresh(), trailId: 'trail1', sceneId: 't1-s3', areaId: 'road', position: { x: 1, y: 2 } };
    const { save, newlyUnlocked } = completeTrail(playing, 'trail1', order);
    expect(newlyUnlocked).toBe('trail2');
    expect(isTrailCompleted(save, 'trail1')).toBe(true);
    expect(isTrailUnlocked(save, 'trail2')).toBe(true);
    expect(isTrailUnlocked(save, 'trail3')).toBe(false);
    expect([save.trailId, save.sceneId, save.areaId, save.position]).toEqual([null, null, null, null]);
  });

  it('replaying a finished trail does not report a new unlock or duplicate entries', () => {
    const once = completeTrail(fresh(), 'trail1', order).save;
    const twice = completeTrail(once, 'trail1', order);
    expect(twice.newlyUnlocked).toBeNull();
    expect(twice.save.unlockedTrails).toEqual(['trail1', 'trail2']);
    expect(twice.save.completedTrails).toEqual(['trail1']);
  });

  it('finishing the last trail unlocks nothing and does not crash', () => {
    const { newlyUnlocked } = completeTrail(fresh(), 'trail3', order);
    expect(newlyUnlocked).toBeNull();
  });

  it('does not mutate the input save', () => {
    const save = fresh();
    const copy = JSON.stringify(save);
    completeTrail(save, 'trail1', order);
    expect(JSON.stringify(save)).toBe(copy);
  });
});

describe('codex unlocking (FR 4.2.1)', () => {
  it('unlocks an entry once; triggering again creates no duplicate', () => {
    const first = unlockCodexEntries(fresh(), ['codex-sankofa']);
    expect(first.newIds).toEqual(['codex-sankofa']);
    const again = unlockCodexEntries(first.save, ['codex-sankofa']);
    expect(again.newIds).toEqual([]);
    expect(again.save.unlockedCodex).toEqual(['codex-sankofa']);
  });

  it('handles several ids and ignores repeats inside one call', () => {
    const { save, newIds } = unlockCodexEntries(fresh(), ['a', 'b', 'a']);
    expect(newIds).toEqual(['a', 'b']);
    expect(save.unlockedCodex).toEqual(['a', 'b']);
  });
});

describe('recording choices (FR 3.2.2)', () => {
  it('stores decision id and option id, replacing a replayed decision', () => {
    let save = recordChoice(fresh(), 'd1', 'a');
    save = recordChoice(save, 'd2', 'b');
    save = recordChoice(save, 'd1', 'b');
    expect(save.choices).toEqual([
      { decisionId: 'd2', optionId: 'b' },
      { decisionId: 'd1', optionId: 'b' },
    ]);
  });
});
