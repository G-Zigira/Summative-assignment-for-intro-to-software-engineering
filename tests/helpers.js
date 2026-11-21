// A fake localStorage backend for tests. Options let us simulate the failure
// modes listed in FR 3.5 without a browser.
export function fakeBackend({ throwOnAccess = false, throwOnSet = false, failVerify = false } = {}) {
  const data = new Map();
  let setCalls = 0;
  const backend = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => {
      setCalls += 1;
      if (throwOnSet) {
        const e = new Error('quota');
        e.name = 'QuotaExceededError';
        throw e;
      }
      // failVerify: pretend to save but store something else (silent corruption)
      data.set(k, failVerify && !k.startsWith('__') ? `${v}#` : v);
    },
    removeItem: (k) => data.delete(k),
  };
  return {
    getBackend: () => {
      if (throwOnAccess) throw new Error('SecurityError');
      return backend;
    },
    data,
    get setCalls() {
      return setCalls;
    },
  };
}
