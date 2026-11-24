import { CONFIG } from '../config.js';
import { defaultSettings, sanitizeSettings } from './settings.js';

// Save data and persistence. See docs/SAVE-DATA.md for the full description.
// Requirements covered: FR 3.2.1 - 3.2.4, FR 3.5.1 - 3.5.3, NFR 8.

const isString = (v) => typeof v === 'string';
const isStringOrNull = (v) => v === null || typeof v === 'string';

/** A brand-new save: only the first trail is unlocked (FR 3.3). */
export function createNewSave({ firstTrailId, now = () => new Date() } = {}) {
  return {
    version: CONFIG.SAVE_VERSION,
    savedAt: now().toISOString(),
    trailId: null,
    sceneId: null,
    areaId: null,
    position: null, // {x, y} or null
    unlockedTrails: firstTrailId ? [firstTrailId] : [],
    completedTrails: [],
    unlockedCodex: [],
    choices: [], // [{decisionId, optionId}]
    fragments: [], // ids of the story pieces (touched objects) found
    settings: defaultSettings(),
  };
}

/**
 * @returns {{valid: true} | {valid: false, reason: 'corrupt'|'incompatible'}}
 * "incompatible" = a well-formed save from a different save version (FR 3.5.3).
 */
export function validateSave(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, reason: 'corrupt' };
  }
  if (typeof data.version !== 'number') return { valid: false, reason: 'corrupt' };
  if (data.version !== CONFIG.SAVE_VERSION) return { valid: false, reason: 'incompatible' };

  const listsOfStrings = ['unlockedTrails', 'completedTrails', 'unlockedCodex'];
  for (const key of listsOfStrings) {
    if (!Array.isArray(data[key]) || !data[key].every(isString)) {
      return { valid: false, reason: 'corrupt' };
    }
  }
  if (
    !Array.isArray(data.choices) ||
    !data.choices.every((c) => c && isString(c.decisionId) && isString(c.optionId))
  ) {
    return { valid: false, reason: 'corrupt' };
  }
  // `fragments` was added after the first release: older saves without it stay valid.
  if (data.fragments !== undefined && (!Array.isArray(data.fragments) || !data.fragments.every(isString))) {
    return { valid: false, reason: 'corrupt' };
  }
  if (!isStringOrNull(data.trailId) || !isStringOrNull(data.sceneId) || !isStringOrNull(data.areaId)) {
    return { valid: false, reason: 'corrupt' };
  }
  const p = data.position;
  if (p !== null && !(p && Number.isFinite(p.x) && Number.isFinite(p.y))) {
    return { valid: false, reason: 'corrupt' };
  }
  if (!data.settings || typeof data.settings !== 'object') {
    return { valid: false, reason: 'corrupt' };
  }
  return { valid: true };
}

export class SaveManager {
  /**
   * @param storage the object returned by createSafeStorage()
   */
  constructor(storage, { key = CONFIG.SAVE_KEY, now = () => new Date() } = {}) {
    this.storage = storage;
    this.key = key;
    this.now = now;
    this.available = storage.isAvailable(); // FR 3.5.1: checked once at startup
  }

  /**
   * @returns {{status: 'unavailable'|'none'|'ok'|'corrupt'|'incompatible', save?: object}}
   */
  load() {
    if (!this.available) return { status: 'unavailable' };
    const result = this.storage.read(this.key);
    if (!result.ok) return { status: 'unavailable' };
    if (result.value === null) return { status: 'none' };

    let parsed;
    try {
      parsed = JSON.parse(result.value);
    } catch {
      return { status: 'corrupt' };
    }
    const check = validateSave(parsed);
    if (!check.valid) return { status: check.reason };
    return { status: 'ok', save: { ...parsed, fragments: parsed.fragments ?? [], settings: sanitizeSettings(parsed.settings) } };
  }

  /**
   * FR 3.5.2: write, read back to verify, retry once. If both attempts fail the
   * previous save is put back so it can still be loaded.
   * @returns {{ok: true, save: object} | {ok: false, error: string}}
   */
  write(save) {
    if (!this.available) return { ok: false, error: 'unavailable' };

    const stamped = { ...save, savedAt: this.now().toISOString() };
    const payload = JSON.stringify(stamped);

    const before = this.storage.read(this.key);
    const previous = before.ok ? before.value : null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const written = this.storage.write(this.key, payload);
      if (written.ok) {
        const readBack = this.storage.read(this.key);
        if (readBack.ok && readBack.value === payload) return { ok: true, save: stamped };
      }
    }

    if (previous !== null) this.storage.write(this.key, previous); // best effort
    return { ok: false, error: 'write-failed' };
  }

  /** Used by "Start New Game" after the player confirms (FR 3.5.3). */
  clear() {
    if (!this.available) return { ok: false, error: 'unavailable' };
    return this.storage.remove(this.key);
  }
}
