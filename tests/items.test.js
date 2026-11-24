import { describe, it, expect } from 'vitest';
import { TRAILS, CODEX } from '../src/content/index.js';
import { validateTrail } from '../src/content/validate.js';
import { createNewSave } from '../src/systems/saveManager.js';
import { collectFragment, fragmentProgress, completionCode } from '../src/systems/unlocks.js';
import { simulateRun, pickFirst, pickLast } from '../src/systems/dialogue.js';
import { CONFIG } from '../src/config.js';

const codexIds = new Set(CODEX.map((c) => c.id));
const clone = (id) => JSON.parse(JSON.stringify(TRAILS.find((t) => t.id === id)));
const words = (t) => t.trim().split(/\s+/).length;

describe('story pieces (items)', () => {
  it('every shipped trail has 2-4 pieces per scene and passes validation', () => {
    for (const trail of TRAILS) {
      expect(validateTrail(trail, codexIds).errors, trail.id).toEqual([]);
      for (const s of trail.scenes) {
        expect(s.items.length, s.id).toBeGreaterThanOrEqual(2);
        expect(s.items.length, s.id).toBeLessThanOrEqual(CONFIG.MAX_ITEMS_PER_SCENE);
        s.items.forEach((i) => expect(words(i.text), i.id).toBeLessThanOrEqual(CONFIG.MAX_ITEM_WORDS));
      }
    }
  });

  it('there are three trails: a tutorial first, then the Lion\'s Path and the Web of Wisdom', () => {
    expect(TRAILS.map((t) => t.id)).toEqual(['trail1', 'trail2', 'trail3']);
    expect(TRAILS[0].tutorial).toBe(true);
    expect(TRAILS.slice(1).every((t) => t.scenes.length >= 4)).toBe(true);
  });

  it('every new trail completes with "always first option" and "always last option" (FR 3.4)', () => {
    for (const id of ['trail2', 'trail3']) {
      for (const pick of [pickFirst, pickLast]) {
        expect(simulateRun(TRAILS.find((t) => t.id === id), pick).completed, id).toBe(true);
      }
    }
  });

  it('validator rejects too many items, long text, unknown props and duplicate ids', () => {
    const t = clone('trail2');
    const s = t.scenes[0];
    s.items.push({ ...s.items[0], id: 'x1', x: 600, y: 500 }, { ...s.items[0], id: 'x2', x: 700, y: 520 });
    expect(validateTrail(t, codexIds).errors.some((e) => e.includes('items (max'))).toBe(true);
    const u = clone('trail2');
    u.scenes[0].items[0].text = Array(60).fill('word').join(' ');
    u.scenes[0].items[1].prop = 'nope';
    u.scenes[0].items[2].id = u.scenes[0].items[1].id;
    const errs = validateTrail(u, codexIds).errors.join('\n');
    expect(errs).toMatch(/words \(max/);
    expect(errs).toMatch(/unknown prop/);
    expect(errs).toMatch(/duplicate item id/);
  });

  it('collecting a piece is saved once; progress counts per trail', () => {
    let save = createNewSave({ firstTrailId: 'trail1' });
    expect(save.fragments).toEqual([]);
    const first = collectFragment(save, 't1-i1');
    expect(first.isNew).toBe(true);
    save = first.save;
    expect(collectFragment(save, 't1-i1').isNew).toBe(false);
    expect(fragmentProgress(save, TRAILS[0])).toEqual({ found: 1, total: 6 });
    expect(fragmentProgress(save, TRAILS[1]).found).toBe(0);
  });

  it('the completion code depends on the trail and is stable', () => {
    const save = createNewSave({ firstTrailId: 'trail1' });
    const a = completionCode(save, TRAILS[1]);
    expect(a).toMatch(/^SK-2-[0-9A-Z]{4}$/);
    expect(completionCode(save, TRAILS[1])).toBe(a);
    expect(completionCode(save, TRAILS[2])).not.toBe(a);
  });
});
