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

/** Story pieces (objects the player touches). Returns {save, isNew}. */
export function collectFragment(save, id) {
  const found = save.fragments ?? [];
  if (found.includes(id)) return { save, isNew: false };
  return { save: { ...save, fragments: [...found, id] }, isNew: true };
}

/** How many of a trail's story pieces were found: {found, total}. */
export function fragmentProgress(save, trail) {
  const ids = (trail.scenes ?? []).flatMap((s) => (s.items ?? []).map((i) => i.id));
  const found = ids.filter((id) => (save.fragments ?? []).includes(id)).length;
  return { found, total: ids.length };
}

/**
 * The pilot's completion code (docs/PILOT-PLAN.md): shown when a trail is finished and typed
 * into the post-game survey. Derived from the trail and the player's choices, e.g. "SK-2-7QF3".
 * It is a checksum, not a secret: it only tells the researchers the form was filled by someone
 * who reached the end.
 */
export function completionCode(save, trail) {
  const ids = new Set((trail.scenes ?? []).flatMap((s) => (s.nodes ?? []).map((n) => n.id)));
  const picked = save.choices.filter((c) => ids.has(c.decisionId)).map((c) => `${c.decisionId}:${c.optionId}`).sort().join('|');
  let h = 2166136261;
  for (const ch of `${trail.id}|${picked}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `SK-${trail.order}-${h.toString(36).toUpperCase().padStart(4, '0').slice(-4)}`;
}
