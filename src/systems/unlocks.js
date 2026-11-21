// Pure functions that change save data. They never mutate their input, which
// keeps them easy to test (FR 3.3, FR 4.2.1).

const unique = (list) => [...new Set(list)];

export function isTrailUnlocked(save, trailId) {
  return save.unlockedTrails.includes(trailId);
}

export function isTrailCompleted(save, trailId) {
  return save.completedTrails.includes(trailId);
}

/**
 * FR 3.3 + SP-3: finishing Trail N unlocks Trail N+1 and clears the
 * "current scene" so Continue returns to the trail-selection screen.
 * @param {string[]} trailOrder trail ids in unlock order
 * @returns {{save: object, newlyUnlocked: string|null}}
 */
export function completeTrail(save, trailId, trailOrder) {
  const index = trailOrder.indexOf(trailId);
  const nextId = index >= 0 ? trailOrder[index + 1] : undefined;
  const newlyUnlocked = nextId && !save.unlockedTrails.includes(nextId) ? nextId : null;

  return {
    newlyUnlocked,
    save: {
      ...save,
      completedTrails: unique([...save.completedTrails, trailId]),
      unlockedTrails: nextId ? unique([...save.unlockedTrails, nextId]) : save.unlockedTrails,
      trailId: null,
      sceneId: null,
      areaId: null,
      position: null,
    },
  };
}

/**
 * FR 4.2.1: an entry unlocks only once.
 * @returns {{save: object, newIds: string[]}} newIds = entries unlocked by THIS call
 */
export function unlockCodexEntries(save, ids = []) {
  const newIds = unique(ids).filter((id) => !save.unlockedCodex.includes(id));
  if (newIds.length === 0) return { save, newIds };
  return { save: { ...save, unlockedCodex: [...save.unlockedCodex, ...newIds] }, newIds };
}

/** FR 3.2.2: remember which option was picked at each decision (replaces a replayed decision). */
export function recordChoice(save, decisionId, optionId) {
  const others = save.choices.filter((c) => c.decisionId !== decisionId);
  return { ...save, choices: [...others, { decisionId, optionId }] };
}
