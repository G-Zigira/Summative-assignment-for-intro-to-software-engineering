// A thin, never-throwing wrapper around localStorage.
//
// Why it exists (SRS FR 3.5 / NFR 8): localStorage can be missing, blocked,
// full, or can throw just by being *accessed* (Safari private mode, blocked
// cookies, some in-app browsers). Every other module talks to this wrapper,
// so a storage failure becomes a normal return value instead of a crash.

export function createSafeStorage(getBackend = () => globalThis.localStorage) {
  function backend() {
    try {
      return getBackend() ?? null;
    } catch {
      return null; // even reading window.localStorage can throw
    }
  }

  return {
    /** FR 3.5.1: can we write AND read back a value right now? */
    isAvailable() {
      const store = backend();
      if (!store) return false;
      const probeKey = '__sankofa_probe__';
      try {
        store.setItem(probeKey, '1');
        const ok = store.getItem(probeKey) === '1';
        store.removeItem(probeKey);
        return ok;
      } catch {
        return false;
      }
    },

    /** @returns {{ok: boolean, value?: string|null, error?: string}} */
    read(key) {
      try {
        const store = backend();
        if (!store) return { ok: false, error: 'unavailable' };
        return { ok: true, value: store.getItem(key) };
      } catch (e) {
        return { ok: false, error: e?.name ?? 'error' };
      }
    },

    /** @returns {{ok: boolean, error?: string}} e.g. error "QuotaExceededError" */
    write(key, value) {
      try {
        const store = backend();
        if (!store) return { ok: false, error: 'unavailable' };
        store.setItem(key, value);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e?.name ?? 'error' };
      }
    },

    remove(key) {
      try {
        const store = backend();
        if (!store) return { ok: false, error: 'unavailable' };
        store.removeItem(key);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e?.name ?? 'error' };
      }
    },
  };
}
