import { CONFIG } from '../config.js';

// FR 5.1: volume 0-100 in steps of 10 (default 70), text size small/medium/large,
// control scheme auto/keyboard/touch. Missing or invalid values fall back to defaults.

export function defaultSettings() {
  return {
    volume: CONFIG.VOLUME_DEFAULT,
    textSize: CONFIG.TEXT_SIZE_DEFAULT,
    controlScheme: CONFIG.CONTROL_SCHEME_DEFAULT,
  };
}

export function sanitizeSettings(input) {
  const defaults = defaultSettings();
  if (!input || typeof input !== 'object') return defaults;

  let volume = defaults.volume;
  if (typeof input.volume === 'number' && Number.isFinite(input.volume)) {
    const clamped = Math.min(100, Math.max(0, input.volume));
    volume = Math.round(clamped / CONFIG.VOLUME_STEP) * CONFIG.VOLUME_STEP;
  }

  const textSize = Object.hasOwn(CONFIG.TEXT_SIZES, input.textSize)
    ? input.textSize
    : defaults.textSize;

  const controlScheme = CONFIG.CONTROL_SCHEMES.includes(input.controlScheme)
    ? input.controlScheme
    : defaults.controlScheme;

  return { volume, textSize, controlScheme };
}

export function textScale(settings) {
  return CONFIG.TEXT_SIZES[sanitizeSettings(settings).textSize];
}
