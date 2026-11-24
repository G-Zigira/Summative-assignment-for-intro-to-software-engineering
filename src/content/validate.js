// Content validator. Runs in Node (npm run validate:content) and in unit tests.
// It turns the SRS acceptance criteria for content into automatic checks:
//   FR 3.1  every node can be reached and no node is a dead end
//   FR 3.4  2-4 options, every option has an outcome and leads to a context panel,
//           and "always first option" / "always last option" both finish the trail
//   FR 4.1  context panels are 80 words or fewer
//   FR 4.2  codex entries are 100 words or fewer, unlock ids exist
//   Business rule: a trail is only releasable once review.status === "reviewed"

import { CONFIG } from '../config.js';
import { simulateRun, pickFirst, pickLast } from '../systems/dialogue.js';
import { PROPS as PROP_NAMES, SPRITES as SPRITE_NAMES, BACKGROUNDS as BG_NAMES } from '../assets/manifest.js';

const wordCount = (s) => (typeof s === 'string' ? s.trim().split(/\s+/).filter(Boolean).length : 0);
const NODE_TYPES = ['line', 'context', 'decision'];

export function validateCodex(entries) {
  const errors = [];
  if (!Array.isArray(entries)) return { errors: ['codex.json must be an array'], warnings: [] };
  const seen = new Set();
  for (const e of entries) {
    const where = `codex "${e?.id}"`;
    if (!e?.id) { errors.push('codex entry without id'); continue; }
    if (seen.has(e.id)) errors.push(`${where}: duplicate id`);
    seen.add(e.id);
    if (!CONFIG.CODEX_CATEGORIES.includes(e.category)) {
      errors.push(`${where}: category must be one of ${CONFIG.CODEX_CATEGORIES.join(', ')}`);
    }
    if (!e.title) errors.push(`${where}: missing title`);
    if (!e.text) errors.push(`${where}: missing text`);
    if (wordCount(e.text) > CONFIG.MAX_CODEX_WORDS) {
      errors.push(`${where}: ${wordCount(e.text)} words (max ${CONFIG.MAX_CODEX_WORDS})`);
    }
    if (!e.trailId) errors.push(`${where}: missing trailId`);
  }
  return { errors, warnings: [] };
}

/**
 * @param {object} trail parsed trail JSON
 * @param {Set<string>} codexIds ids that exist in codex.json
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateTrail(trail, codexIds = new Set()) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(`[${trail?.id ?? '?'}] ${m}`);
  const warn = (m) => warnings.push(`[${trail?.id ?? '?'}] ${m}`);

  if (!trail || typeof trail !== 'object') return { errors: ['trail is not an object'], warnings };
  for (const key of ['id', 'title', 'startScene']) if (!trail[key]) err(`missing "${key}"`);
  if (!Number.isInteger(trail.order)) err('"order" must be an integer');
  if (!Array.isArray(trail.scenes) || trail.scenes.length === 0) {
    err('"scenes" must be a non-empty array');
    return { errors, warnings };
  }

  // Review status (Business Rules: facts are checked before release).
  if (trail.review?.status !== 'reviewed') {
    warn(`review.status is "${trail.review?.status ?? 'missing'}" - not releasable until "reviewed"`);
  } else if (!trail.review.reviewer || !trail.review.date) {
    err('review.status is "reviewed" but reviewer/date are missing');
  }

  // Scenes
  const sceneIds = new Set();
  const nodeIds = new Set(); // unique across the trail: save data stores decision ids
  const itemIds = new Set(); // story-piece ids are unique across the trail (the save stores them)
  for (const scene of trail.scenes) {
    if (sceneIds.has(scene.id)) err(`duplicate scene id "${scene.id}"`);
    sceneIds.add(scene.id);
  }
  if (!sceneIds.has(trail.startScene)) err(`startScene "${trail.startScene}" does not exist`);

  const finals = trail.scenes.filter((s) => s.final);
  if (finals.length !== 1) err(`exactly one scene must have "final": true (found ${finals.length})`);

  for (const scene of trail.scenes) {
    const sc = `scene "${scene.id}"`;
    if (!scene.title) err(`${sc}: missing title`);
    if (!scene.area) err(`${sc}: missing area`);
    if (scene.final && scene.nextScene) err(`${sc}: the final scene must not have nextScene`);
    if (!scene.final && !sceneIds.has(scene.nextScene)) {
      err(`${sc}: nextScene "${scene.nextScene}" does not exist`);
    }
    const npc = scene.npc;
    if (!npc || !npc.name || !Number.isFinite(npc.x) || !Number.isFinite(npc.y)) {
      err(`${sc}: needs npc {name, x, y}`);
    } else if (npc.x < 0 || npc.x > CONFIG.GAME_WIDTH || npc.y < 0 || npc.y > CONFIG.GAME_HEIGHT) {
      err(`${sc}: npc is outside the ${CONFIG.GAME_WIDTH}x${CONFIG.GAME_HEIGHT} play area`);
    }

    // Touch controls cover the bottom corners; anything there would be hidden or untappable.
    const inTouchZone = (pt) => pt && CONFIG.TOUCH_ZONES.some(
      (z) => pt.x >= z.x && pt.x <= z.x + z.w && pt.y >= z.y && pt.y <= z.y + z.h,
    );
    if (inTouchZone(scene.playerStart)) warn(`${sc}: playerStart is under the on-screen touch controls`);
    if (inTouchZone(scene.npc)) warn(`${sc}: the npc is under the on-screen touch controls`);

    // Pictures: every name must exist in src/assets/manifest.js, and people must stand on the floor
    // (the top 170 px of each area picture is the back wall).
    if (scene.area && !BG_NAMES.includes(scene.area)) warn(`${sc}: no background picture for area "${scene.area}" (the grey placeholder is used)`);
    if (npc?.sprite && !SPRITE_NAMES.includes(npc.sprite)) err(`${sc}: npc.sprite "${npc.sprite}" is not one of ${SPRITE_NAMES.join(', ')}`);
    for (const pr of scene.props ?? []) {
      if (!PROP_NAMES.includes(pr.key)) err(`${sc}: unknown prop "${pr.key}" (known: ${PROP_NAMES.join(', ')})`);
      if (!Number.isFinite(pr.x) || !Number.isFinite(pr.y)) err(`${sc}: every prop needs numeric x and y`);
    }
    for (const ob of scene.obstacles ?? []) {
      if (ob.prop && !PROP_NAMES.includes(ob.prop)) err(`${sc}: obstacle prop "${ob.prop}" is unknown`);
    }
    // Story pieces (items the player touches): short notes that add to the story.
    const items = scene.items ?? [];
    if (items.length > CONFIG.MAX_ITEMS_PER_SCENE) err(`${sc}: ${items.length} items (max ${CONFIG.MAX_ITEMS_PER_SCENE})`);
    for (const it of items) {
      const w = `${sc} item "${it.id}"`;
      if (!it.id) { err(`${sc}: an item has no id`); continue; }
      if (itemIds.has(it.id)) err(`${w}: duplicate item id`);
      itemIds.add(it.id);
      if (!PROP_NAMES.includes(it.prop)) err(`${w}: unknown prop "${it.prop}"`);
      if (!it.title) err(`${w}: missing title`);
      if (!it.text) err(`${w}: missing text`);
      if (wordCount(it.text) > CONFIG.MAX_ITEM_WORDS) err(`${w}: ${wordCount(it.text)} words (max ${CONFIG.MAX_ITEM_WORDS})`);
      if (!Number.isFinite(it.x) || !Number.isFinite(it.y)) err(`${w}: needs numeric x and y`);
      else {
        if (it.y < 190) warn(`${w}: is on the back wall (y < 190)`);
        if (inTouchZone({ x: it.x, y: it.y })) warn(`${w}: is under the on-screen touch controls`);
        if (npc && Math.hypot(it.x - npc.x, it.y - 24 - npc.y) < 80) warn(`${w}: is too close to the npc (the prompt would be ambiguous)`);
        for (const other of items) {
          if (other !== it && Number.isFinite(other.x) && Math.hypot(it.x - other.x, it.y - other.y) < 80) warn(`${w}: is too close to item "${other.id}"`);
        }
      }
      for (const id of it.unlocksCodex ?? []) if (!codexIds.has(id)) err(`${w}: unlocks unknown codex entry "${id}"`);
    }
    if (scene.travel !== undefined && typeof scene.travel !== 'boolean') err(`${sc}: travel must be true or false`);
    if (scene.finale !== undefined && !['horse', 'basket'].includes(scene.finale)) err(`${sc}: finale must be "horse" or "basket"`);
    if (scene.finale !== undefined && !scene.final) err(`${sc}: finale only works on the last scene of a trail`);
    if (scene.playerStart && scene.playerStart.y < 170) warn(`${sc}: playerStart is on the back wall (y < 170)`);
    if (npc && npc.y < 190) warn(`${sc}: the npc is on the back wall (y < 190)`);

    if (!Array.isArray(scene.nodes) || scene.nodes.length === 0) {
      err(`${sc}: needs at least one node`);
      continue;
    }
    const local = new Map();
    for (const node of scene.nodes) {
      if (nodeIds.has(node.id)) err(`${sc}: node id "${node.id}" is not unique in the trail`);
      nodeIds.add(node.id);
      local.set(node.id, node);
    }
    if (!local.has(scene.startNode)) err(`${sc}: startNode "${scene.startNode}" does not exist`);

    const checkCodex = (ids, where) => {
      for (const id of ids ?? []) {
        if (!codexIds.has(id)) err(`${where}: unlocks unknown codex entry "${id}"`);
      }
    };
    const checkNext = (next, where) => {
      if (next !== null && next !== undefined && !local.has(next)) {
        err(`${where}: next "${next}" is not a node in this scene`);
      }
    };

    for (const node of scene.nodes) {
      const nd = `${sc} node "${node.id}"`;
      if (!NODE_TYPES.includes(node.type)) { err(`${nd}: type must be one of ${NODE_TYPES.join(', ')}`); continue; }
      checkCodex(node.unlocksCodex, nd);

      if (node.type === 'line') {
        if (!node.speaker) err(`${nd}: line needs a speaker`);
        if (!node.text) err(`${nd}: line needs text`);
        checkNext(node.next, nd);
      } else if (node.type === 'context') {
        if (!node.title) err(`${nd}: context panel needs a title`);
        if (!node.text) err(`${nd}: context panel needs text`);
        if (wordCount(node.text) > CONFIG.MAX_CONTEXT_WORDS) {
          err(`${nd}: context text is ${wordCount(node.text)} words (max ${CONFIG.MAX_CONTEXT_WORDS})`);
        }
        checkNext(node.next, nd);
      } else {
        const n = node.options?.length ?? 0;
        if (!node.prompt) err(`${nd}: decision needs a prompt`);
        if (n < CONFIG.CHOICES_MIN || n > CONFIG.CHOICES_MAX) {
          err(`${nd}: ${n} options (must be ${CONFIG.CHOICES_MIN}-${CONFIG.CHOICES_MAX})`);
        }
        const optionIds = new Set();
        for (const o of node.options ?? []) {
          const od = `${nd} option "${o.id}"`;
          if (!o.id || optionIds.has(o.id)) err(`${od}: option ids must exist and be unique within the decision`);
          optionIds.add(o.id);
          if (!o.text) err(`${od}: missing text`);
          if (!o.outcome) err(`${od}: missing outcome text (FR 3.4)`);
          checkCodex(o.unlocksCodex, od);
          checkNext(o.next, od);
          // FR 3.4: after any choice the game shows the outcome AND a context panel.
          if (local.get(o.next)?.type !== 'context') err(`${od}: next must be a "context" node (FR 3.4)`);
        }
      }
    }

    // FR 3.1: every node reachable, and no cycles (a cycle could trap the player).
    const reachable = new Set();
    const visiting = new Set();
    const visit = (id) => {
      if (id === null || id === undefined || !local.has(id)) return;
      if (visiting.has(id)) { err(`${sc}: the story loops back to "${id}"`); return; }
      if (reachable.has(id)) return;
      reachable.add(id);
      visiting.add(id);
      const node = local.get(id);
      if (node.type === 'decision') (node.options ?? []).forEach((o) => visit(o.next));
      else visit(node.next);
      visiting.delete(id);
    };
    visit(scene.startNode);
    for (const node of scene.nodes) {
      if (!reachable.has(node.id)) warn(`${sc}: node "${node.id}" can never be reached`);
    }
  }

  // The scene chain must lead from startScene to the final scene.
  const seen = new Set();
  let cursor = trail.scenes.find((s) => s.id === trail.startScene);
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    if (cursor.final) break;
    cursor = trail.scenes.find((s) => s.id === cursor.nextScene);
  }
  if (!cursor?.final) err('the scene chain from startScene never reaches the final scene');
  for (const scene of trail.scenes) {
    if (!seen.has(scene.id)) warn(`scene "${scene.id}" is not on the main path`);
  }

  // FR 3.4 acceptance test, run for real.
  if (errors.length === 0) {
    for (const [label, picker] of [['first', pickFirst], ['last', pickLast]]) {
      try {
        if (!simulateRun(trail, picker).completed) err(`always choosing the ${label} option does not finish the trail`);
      } catch (e) {
        err(`always choosing the ${label} option failed: ${e.message}`);
      }
    }
  }

  return { errors, warnings };
}
