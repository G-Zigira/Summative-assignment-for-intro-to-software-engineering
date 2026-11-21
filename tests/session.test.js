import { describe, it, expect } from 'vitest';
import { createSafeStorage } from '../src/systems/storage.js';
import { createNewSave } from '../src/systems/saveManager.js';
import { unlockCodexEntries } from '../src/systems/unlocks.js';
import { session, initSession, persist, refreshFromStorage, startNewGame } from '../src/session.js';
import { fakeBackend } from './helpers.js';

const boot = (opts) => {
  const fake = fakeBackend(opts);
  initSession(createSafeStorage(fake.getBackend));
  return fake;
};

describe('session: the title screen always reflects the last save point', () => {
  it('after a successful save, Continue becomes available (loadStatus "ok")', () => {
    boot();
    expect(session.loadStatus).toBe('none');
    session.save = { ...session.save, trailId: 'trail1', sceneId: 't1-s1', position: { x: 5, y: 6 } };
    expect(persist().ok).toBe(true);
    expect(session.loadStatus).toBe('ok');
  });

  it('progress made after the last save is dropped when the title screen reloads', () => {
    boot();
    session.save = { ...session.save, trailId: 'trail1', sceneId: 't1-s1', position: { x: 300, y: 200 } };
    persist();
    // The player keeps playing, unlocking things and moving on, without saving:
    session.save = unlockCodexEntries({ ...session.save, sceneId: 't1-s2', position: { x: 1, y: 1 } }, ['codex-sankofa']).save;

    refreshFromStorage();
    expect(session.loadStatus).toBe('ok');
    expect(session.save).toMatchObject({ sceneId: 't1-s1', position: { x: 300, y: 200 }, unlockedCodex: [] });
  });

  it('with nothing saved, a refresh gives a fresh game', () => {
    boot();
    session.save = { ...session.save, trailId: 'trail1', sceneId: 't1-s2' };
    refreshFromStorage();
    expect(session.loadStatus).toBe('none');
    expect(session.save.sceneId).toBeNull();
  });

  it('with storage unavailable, in-memory progress is kept (there is nothing to re-read)', () => {
    boot({ throwOnAccess: true });
    session.save = { ...session.save, trailId: 'trail1', sceneId: 't1-s2' };
    refreshFromStorage();
    expect(session.loadStatus).toBe('unavailable');
    expect(session.save.sceneId).toBe('t1-s2');
    expect(persist()).toMatchObject({ ok: false, skipped: true });
  });

  it('a corrupt save stays reported as corrupt after a refresh', () => {
    const fake = boot();
    fake.data.set('sankofa-trails/save', '{oops');
    refreshFromStorage();
    expect(session.loadStatus).toBe('corrupt');
  });

  it('startNewGame erases the stored save and resets memory', () => {
    boot();
    session.save = { ...createNewSave({ firstTrailId: 'trail1' }), trailId: 'trail1', sceneId: 't1-s1' };
    persist();
    startNewGame();
    refreshFromStorage();
    expect(session.loadStatus).toBe('none');
  });
});
