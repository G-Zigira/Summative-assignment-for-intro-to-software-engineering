// The game's content, loaded once. Trails are sorted by "order"; that order is
// also the unlock order (FR 3.3). To add a trail: create src/data/trails/trailN.json
// and import it here. See docs/CONTENT-SCHEMA.md.

import trail1 from '../data/trails/trail1.json';
import trail2 from '../data/trails/trail2.json';
import codex from '../data/codex.json';

export const TRAILS = [trail1, trail2].sort((a, b) => a.order - b.order);
export const TRAIL_ORDER = TRAILS.map((t) => t.id);
export const CODEX = codex;

export const getTrail = (id) => TRAILS.find((t) => t.id === id) ?? null;
export const getCodexEntry = (id) => CODEX.find((c) => c.id === id) ?? null;
