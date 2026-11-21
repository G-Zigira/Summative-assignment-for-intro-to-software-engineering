import { describe, it, expect } from 'vitest';
import { createSafeStorage } from '../src/systems/storage.js';
import { SaveManager, createNewSave, validateSave } from '../src/systems/saveManager.js';
import { recordChoice, unlockCodexEntries } from '../src/systems/unlocks.js';
import { CONFIG } from '../src/config.js';
import { fakeBackend } from './helpers.js';

const fixedNow = () => new Date('2026-11-10T10:00:00.000Z');
const make = (opts) => {
  const fake = fakeBackend(opts);
  const manager = new SaveManager(createSafeStorage(fake.getBackend), { now: fixedNow });
  return { fake, manager };
};

describe('save data (FR 3.2.2)', () => {
  it('a new save contains exactly the documented fields', () => {
    const save = createNewSave({ firstTrailId: 'trail1', now: fixedNow });
    expect(Object.keys(save).sort()).toEqual(
      ['version', 'savedAt', 'trailId', 'sceneId', 'areaId', 'position', 'unlockedTrails',
        'completedTrails', 'unlockedCodex', 'choices', 'settings'].sort(),
    );
    expect(save.unlockedTrails).toEqual(['trail1']); // FR 3.3: only Trail 1 on a new game
    expect(save.version).toBe(CONFIG.SAVE_VERSION);
  });
});

describe('SaveManager.load (FR 3.2.3, FR 3.5.1, FR 3.5.3)', () => {
  it('returns "none" when nothing is stored', () => {
    expect(make().manager.load().status).toBe('none');
  });

  it('round-trips a save: everything written is restored', () => {
    const { manager } = make();
    let save = createNewSave({ firstTrailId: 'trail1', now: fixedNow });
    save = { ...save, trailId: 'trail1', sceneId: 't1-s2', areaId: 'wall-garden', position: { x: 120, y: 140 } };
    save = unlockCodexEntries(save, ['codex-sankofa']).save;
    save = recordChoice(save, 't1-s1-d1', 'b');
    expect(manager.write(save).ok).toBe(true);

    const loaded = manager.load();
    expect(loaded.status).toBe('ok');
    expect(loaded.save).toMatchObject({
      trailId: 'trail1', sceneId: 't1-s2', areaId: 'wall-garden',
      position: { x: 120, y: 140 },
      unlockedCodex: ['codex-sankofa'],
      choices: [{ decisionId: 't1-s1-d1', optionId: 'b' }],
    });
  });

  it('reports "unavailable" when storage cannot be used (FR 3.5.1)', () => {
    const { manager } = make({ throwOnAccess: true });
    expect(manager.available).toBe(false);
    expect(manager.load().status).toBe('unavailable');
    expect(manager.write(createNewSave()).error).toBe('unavailable');
  });

  it('reports "corrupt" for unreadable JSON instead of crashing (FR 3.5.3)', () => {
    const { fake, manager } = make();
    fake.data.set(CONFIG.SAVE_KEY, '{not json');
    expect(manager.load().status).toBe('corrupt');
  });

  it('reports "corrupt" for JSON with the wrong shape (FR 3.5.3)', () => {
    const { fake, manager } = make();
    fake.data.set(CONFIG.SAVE_KEY, JSON.stringify({ version: 1, unlockedTrails: 'nope' }));
    expect(manager.load().status).toBe('corrupt');
  });

  it('reports "incompatible" for a different save version (FR 3.5.3)', () => {
    const { fake, manager } = make();
    const old = { ...createNewSave({ firstTrailId: 'trail1' }), version: 0 };
    fake.data.set(CONFIG.SAVE_KEY, JSON.stringify(old));
    expect(manager.load().status).toBe('incompatible');
  });

  it('falls back to default settings when saved settings are invalid (FR 5.1)', () => {
    const { fake, manager } = make();
    const save = createNewSave({ firstTrailId: 'trail1' });
    save.settings = { volume: 'loud', textSize: 'huge', controlScheme: 7 };
    fake.data.set(CONFIG.SAVE_KEY, JSON.stringify(save));
    expect(manager.load().save.settings).toEqual({ volume: 70, textSize: 'medium', controlScheme: 'auto' });
  });
});

describe('SaveManager.write (FR 3.5.2)', () => {
  it('stamps savedAt and verifies by reading back', () => {
    const { manager } = make();
    const result = manager.write(createNewSave({ firstTrailId: 'trail1' }));
    expect(result.ok).toBe(true);
    expect(result.save.savedAt).toBe('2026-11-10T10:00:00.000Z');
  });

  it('retries once, then reports failure when the quota is exceeded', () => {
    const { manager } = make();
    // Storage worked at startup, then filled up:
    const failing = fakeBackend({ throwOnSet: true });
    manager.storage = createSafeStorage(failing.getBackend);
    const result = manager.write(createNewSave({ firstTrailId: 'trail1' }));
    expect(result).toEqual({ ok: false, error: 'write-failed' });
    expect(failing.setCalls).toBe(2); // first try + exactly one retry
  });

  it('puts the previous save back when a new write cannot be verified', () => {
    const { fake, manager } = make();
    const first = createNewSave({ firstTrailId: 'trail1' });
    expect(manager.write(first).ok).toBe(true);
    const goodRaw = fake.data.get(CONFIG.SAVE_KEY);

    // A backend that silently garbles only the NEW save (read-back will not match):
    const data = new Map([[CONFIG.SAVE_KEY, goodRaw]]);
    manager.storage = createSafeStorage(() => ({
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, v.includes('"sceneId":"new"') ? `${v}#garbled` : v),
      removeItem: (k) => data.delete(k),
    }));

    const result = manager.write({ ...first, sceneId: 'new' });
    expect(result).toEqual({ ok: false, error: 'write-failed' });
    expect(data.get(CONFIG.SAVE_KEY)).toBe(goodRaw); // previous save restored
  });

  it('clear() removes the save so "Start New Game" can overwrite it', () => {
    const { manager } = make();
    manager.write(createNewSave({ firstTrailId: 'trail1' }));
    manager.clear();
    expect(manager.load().status).toBe('none');
  });
});

describe('validateSave', () => {
  it('accepts a fresh save and rejects non-objects', () => {
    expect(validateSave(createNewSave({ firstTrailId: 'trail1' })).valid).toBe(true);
    expect(validateSave(null).valid).toBe(false);
    expect(validateSave([]).valid).toBe(false);
    expect(validateSave('x').valid).toBe(false);
  });
});
