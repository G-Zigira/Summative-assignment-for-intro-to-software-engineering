import { describe, it, expect } from 'vitest';
import { validateTrail, validateCodex } from '../src/content/validate.js';
import { TRAILS, CODEX } from '../src/content/index.js';

const codexIds = new Set(CODEX.map((c) => c.id));
const clone = (o) => JSON.parse(JSON.stringify(o));
const trail1 = () => clone(TRAILS.find((t) => t.id === 'trail1'));
const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
const hasError = (result, fragment) => result.errors.some((e) => e.includes(fragment));

describe('shipping content', () => {
  it('every trail passes validation with no errors', () => {
    for (const trail of TRAILS) {
      expect(validateTrail(trail, codexIds).errors, trail.id).toEqual([]);
    }
  });
  it('the codex passes validation', () => {
    expect(validateCodex(CODEX).errors).toEqual([]);
  });
  it('no scene places the player or an NPC under the touch controls', () => {
    for (const trail of TRAILS) {
      const { warnings } = validateTrail(trail, codexIds);
      expect(warnings.filter((w) => w.includes('touch controls')), trail.id).toEqual([]);
    }
  });
  it('sample trails are flagged as not releasable', () => {
    const { warnings } = validateTrail(TRAILS[0], codexIds);
    expect(warnings.some((w) => w.includes('not releasable'))).toBe(true);
  });
});

describe('validateTrail catches content mistakes', () => {
  it('context panel over 80 words (FR 4.1)', () => {
    const t = trail1();
    t.scenes[0].nodes.find((n) => n.type === 'context').text = words(81);
    expect(hasError(validateTrail(t, codexIds), 'max 80')).toBe(true);
  });

  it('decision with only one option (FR 3.4)', () => {
    const t = trail1();
    t.scenes[0].nodes.find((n) => n.type === 'decision').options.pop();
    expect(hasError(validateTrail(t, codexIds), 'options (must be 2-4)')).toBe(true);
  });

  it('option without an outcome (FR 3.4)', () => {
    const t = trail1();
    delete t.scenes[0].nodes.find((n) => n.type === 'decision').options[0].outcome;
    expect(hasError(validateTrail(t, codexIds), 'missing outcome')).toBe(true);
  });

  it('option that skips the context panel (FR 3.4)', () => {
    const t = trail1();
    t.scenes[0].nodes.find((n) => n.type === 'decision').options[0].next = 't1-s1-n3';
    expect(hasError(validateTrail(t, codexIds), 'must be a "context" node')).toBe(true);
  });

  it('node pointing at a node that does not exist (dead end)', () => {
    const t = trail1();
    t.scenes[0].nodes[0].next = 'ghost';
    expect(hasError(validateTrail(t, codexIds), 'not a node in this scene')).toBe(true);
  });

  it('story loop that could trap the player', () => {
    const t = trail1();
    t.scenes[0].nodes[1].next = 't1-s1-n0';
    expect(hasError(validateTrail(t, codexIds), 'loops back')).toBe(true);
  });

  it('unknown codex id', () => {
    const t = trail1();
    t.scenes[0].nodes.find((n) => n.type === 'context').unlocksCodex = ['codex-missing'];
    expect(hasError(validateTrail(t, codexIds), 'unknown codex entry')).toBe(true);
  });

  it('scene chain that never reaches the final scene', () => {
    const t = trail1();
    t.scenes[1].nextScene = 't1-s1';
    expect(hasError(validateTrail(t, codexIds), 'never reaches the final scene')).toBe(true);
  });

  it('duplicate node ids across scenes (save data stores decision ids)', () => {
    const t = trail1();
    t.scenes[1].nodes[0].id = 't1-s1-n1';
    t.scenes[1].startNode = 't1-s1-n1';
    expect(hasError(validateTrail(t, codexIds), 'not unique')).toBe(true);
  });

  it('"reviewed" status requires a reviewer and date', () => {
    const t = trail1();
    t.review = { status: 'reviewed', reviewer: null, date: null };
    expect(hasError(validateTrail(t, codexIds), 'reviewer/date')).toBe(true);
    t.review = { status: 'reviewed', reviewer: 'A. Teacher', date: '2026-11-20' };
    const result = validateTrail(t, codexIds);
    expect(result.errors).toEqual([]);
    expect(result.warnings.some((w) => w.includes('not releasable'))).toBe(false);
  });
});

describe('touch-zone warning', () => {
  it('warns when a playerStart sits under the D-pad', () => {
    const t = trail1();
    t.scenes[0].playerStart = { x: 120, y: 400 };
    const { warnings } = validateTrail(t, codexIds);
    expect(warnings.some((w) => w.includes('playerStart is under the on-screen touch controls'))).toBe(true);
  });
});

describe('validateCodex', () => {
  it('rejects over-long text (FR 4.2.2), bad category and duplicate ids', () => {
    const bad = [
      { id: 'a', category: 'Terms', title: 'A', text: words(101), trailId: 't' },
      { id: 'a', category: 'Nope', title: 'B', text: 'ok', trailId: 't' },
    ];
    const { errors } = validateCodex(bad);
    expect(errors.some((e) => e.includes('max 100'))).toBe(true);
    expect(errors.some((e) => e.includes('category'))).toBe(true);
    expect(errors.some((e) => e.includes('duplicate'))).toBe(true);
  });
});

describe('pictures (props and sprites)', () => {
  const clone = () => JSON.parse(JSON.stringify(TRAILS[0]));
  it('rejects an unknown prop name', () => {
    const t = clone();
    t.scenes[0].props = [{ key: 'no-such-prop', x: 10, y: 300 }];
    const { errors } = validateTrail(t, new Set(CODEX.map((c) => c.id)));
    expect(errors.some((e) => e.includes('unknown prop'))).toBe(true);
  });
  it('rejects an unknown npc sprite', () => {
    const t = clone();
    t.scenes[0].npc.sprite = 'dragon';
    const { errors } = validateTrail(t, new Set(CODEX.map((c) => c.id)));
    expect(errors.some((e) => e.includes('npc.sprite'))).toBe(true);
  });
});
