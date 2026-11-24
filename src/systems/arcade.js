// Best scores for the arcade menu (the three minigames, played endlessly).
// Stored under their OWN key, not in the save file (the save keeps exactly the fields in the SRS).
// Storage can fail (FR 3.5.1 / NFR 8): every function works without it.

import { CONFIG } from '../config.js';

export const ARCADE_GAMES = [
  { id: 'runner', scene: 'RunnerScene', title: 'Savanna Run', blurb: 'Run, jump and double jump. Cowries give bonus points.', unit: 'points' },
  { id: 'horse', scene: 'HorseScene', title: 'Horse Charge', blurb: "Throw spears at soldiers and jump the rocks.", unit: 'points' },
  { id: 'basket', scene: 'BasketScene', title: 'Wisdom Catch', blurb: 'Catch knowledge (+1 shell), dodge bad things (-3).', unit: 'knowledge' },
];

const emptyBests = () => Object.fromEntries(ARCADE_GAMES.map((g) => [g.id, 0]));

export function loadBests(storage) {
  const bests = emptyBests();
  try {
    const r = storage?.read(CONFIG.ARCADE_KEY);
    if (r?.ok && r.value) {
      const data = JSON.parse(r.value);
      for (const g of ARCADE_GAMES) if (Number.isFinite(data?.[g.id]) && data[g.id] > 0) bests[g.id] = Math.floor(data[g.id]);
    }
  } catch { /* unreadable: start from zero */ }
  return bests;
}

/** Record a finished run. @returns {{best: number, isNew: boolean}} (never throws) */
export function recordScore(storage, id, score) {
  const bests = loadBests(storage);
  const value = Math.max(0, Math.floor(score));
  const isNew = value > bests[id];
  if (isNew) {
    bests[id] = value;
    try { storage?.write(CONFIG.ARCADE_KEY, JSON.stringify(bests)); } catch { /* keep playing */ }
  }
  return { best: bests[id], isNew };
}
