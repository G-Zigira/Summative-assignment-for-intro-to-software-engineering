// FR 2.1 / 2.2: pick desktop (keyboard + mouse) or touch controls.
//
// Rule: a device uses touch controls when its PRIMARY pointer is coarse
// (phones and tablets). A laptop with a touchscreen still has a fine primary
// pointer, so it gets desktop controls and can switch in Settings.
//
// `env` is injectable so this can be unit tested without a browser.

export function detectDevice(env = globalThis.window) {
  const coarse = Boolean(env?.matchMedia?.('(pointer: coarse)')?.matches);
  return coarse ? 'touch' : 'desktop';
}

/** @param {'auto'|'keyboard'|'touch'} setting */
export function resolveControlScheme(setting, env) {
  if (setting === 'keyboard') return 'desktop';
  if (setting === 'touch') return 'touch';
  return detectDevice(env);
}
