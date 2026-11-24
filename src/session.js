// Runtime state shared by all scenes: the current save and the save manager.
// Scenes import `session` instead of passing data around through Phaser.

import { createSafeStorage } from './systems/storage.js';
import { SaveManager, createNewSave } from './systems/saveManager.js';
import { resolveControlScheme } from './systems/device.js';
import { textScale, sanitizeSettings } from './systems/settings.js';
import { TRAIL_ORDER } from './content/index.js';

export const session = {
  saveManager: null,
  save: null,
  /** 'unavailable' | 'none' | 'ok' | 'corrupt' | 'incompatible' (result of the startup load) */
  loadStatus: 'none',
  storageAvailable: false,
  storageNoticeShown: false,
};

// A new game keeps the player's settings (volume, text size, controls) from before.
const freshSave = () => {
  const save = createNewSave({ firstTrailId: TRAIL_ORDER[0] });
  if (session.save?.settings) save.settings = session.save.settings;
  return save;
};

/** Called once by BootScene. FR 3.5.1: detect storage, load, never crash. */
export function initSession(storage = createSafeStorage()) {
  session.saveManager = new SaveManager(storage);
  session.storageAvailable = session.saveManager.available;
  const loaded = session.saveManager.load();
  session.loadStatus = loaded.status;
  session.save = loaded.status === 'ok' ? loaded.save : freshSave();
  session.storageNoticeShown = false;
}

/**
 * Re-read the save from storage. The title screen calls this every time it opens, so
 * Continue and New Game always reflect the LAST SAVE POINT: progress made since then
 * (which only lived in memory) is dropped, exactly as if the player had closed the tab.
 * If storage is unavailable there is nothing to re-read, so memory is kept.
 */
export function refreshFromStorage() {
  if (!session.saveManager?.available) return;
  const loaded = session.saveManager.load();
  session.loadStatus = loaded.status;
  session.save = loaded.status === 'ok' ? loaded.save : freshSave();
}

/**
 * Write the current save. Returns {ok} | {ok:false, skipped:true} when storage is
 * unavailable (play continues without saving, FR 3.5.1) | {ok:false, error}.
 */
export function persist() {
  if (!session.storageAvailable) return { ok: false, skipped: true, error: 'unavailable' };
  const result = session.saveManager.write(session.save);
  if (result.ok) {
    session.save = result.save;
    session.loadStatus = 'ok'; // a valid save now exists, so Continue must be available
  }
  return result;
}

/** FR 3.5.3: only called after the player confirmed overwriting an old/unreadable save. */
export function startNewGame() {
  if (session.storageAvailable) session.saveManager.clear();
  session.save = freshSave();
  session.loadStatus = 'none';
}

export const controlScheme = () => resolveControlScheme(session.save.settings.controlScheme);
export const currentTextScale = () => textScale(session.save.settings);

/**
 * Change settings (FR 5.1). If a valid save exists on disk, only its settings field is rewritten,
 * so changing a setting in the middle of a scene never saves unsaved progress (SP-1..SP-4 stay
 * the only save points). With no save yet the change lives in memory and is written at the
 * first save point.
 */
export function updateSettings(patch) {
  session.save = { ...session.save, settings: sanitizeSettings({ ...session.save.settings, ...patch }) };
  if (!session.saveManager?.available) return { ok: false, skipped: true };
  const stored = session.saveManager.load();
  if (stored.status !== 'ok') return { ok: false, skipped: true };
  return session.saveManager.write({ ...stored.save, settings: session.save.settings });
}
