import { describe, it, expect } from 'vitest';
import { createSafeStorage } from '../src/systems/storage.js';
import { fakeBackend } from './helpers.js';

describe('createSafeStorage (FR 3.5.1)', () => {
  it('reports available and round-trips a value', () => {
    const s = createSafeStorage(fakeBackend().getBackend);
    expect(s.isAvailable()).toBe(true);
    expect(s.write('k', 'v')).toEqual({ ok: true });
    expect(s.read('k')).toEqual({ ok: true, value: 'v' });
    expect(s.read('missing')).toEqual({ ok: true, value: null });
  });

  it('is unavailable when accessing localStorage throws (private mode / blocked)', () => {
    const s = createSafeStorage(fakeBackend({ throwOnAccess: true }).getBackend);
    expect(s.isAvailable()).toBe(false);
    expect(s.read('k').ok).toBe(false);
    expect(s.write('k', 'v').ok).toBe(false);
  });

  it('is unavailable when there is no backend at all', () => {
    const s = createSafeStorage(() => undefined);
    expect(s.isAvailable()).toBe(false);
  });

  it('is unavailable when writes throw (quota 0)', () => {
    const s = createSafeStorage(fakeBackend({ throwOnSet: true }).getBackend);
    expect(s.isAvailable()).toBe(false);
  });

  it('turns a quota error into a return value, never an exception (FR 3.5.2)', () => {
    const s = createSafeStorage(fakeBackend({ throwOnSet: true }).getBackend);
    expect(s.write('k', 'v')).toEqual({ ok: false, error: 'QuotaExceededError' });
  });
});
