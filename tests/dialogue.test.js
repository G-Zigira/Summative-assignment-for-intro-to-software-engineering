import { describe, it, expect } from 'vitest';
import { DialogueRunner, simulateRun, pickFirst, pickLast } from '../src/systems/dialogue.js';
import { TRAILS } from '../src/content/index.js';

const trail1 = TRAILS.find((t) => t.id === 'trail1');

describe('DialogueRunner', () => {
  it('walks a scene: line -> decision -> outcome -> context -> line -> scene end', () => {
    const runner = new DialogueRunner(trail1);
    let step = runner.startScene('t1-s1');
    expect(step.node.id).toBe('t1-s1-n1');
    step = runner.advance();
    expect(step.node.id).toBe('t1-s1-n2');
    step = runner.advance();
    expect(step.node.type).toBe('decision');

    const { choice, step: afterChoice } = runner.choose('b');
    expect(choice).toMatchObject({ decisionId: 't1-s1-d1', optionId: 'b' });
    expect(choice.outcome.length).toBeGreaterThan(0);
    expect(afterChoice.node.type).toBe('context'); // FR 3.4: context panel follows a choice
    expect(afterChoice.unlocks).toContain('codex-adinkra'); // option-level unlock
    expect(afterChoice.unlocks).toContain('codex-sankofa'); // node-level unlock

    step = runner.advance();
    expect(step.node.id).toBe('t1-s1-n3');
    step = runner.advance();
    expect(step).toMatchObject({ kind: 'sceneEnd', nextSceneId: 't1-s2', trailComplete: false });
  });

  it('a different choice leads to the same next node (choices never block progress)', () => {
    const a = new DialogueRunner(trail1);
    a.startScene('t1-s1'); a.advance(); a.advance();
    const b = new DialogueRunner(trail1);
    b.startScene('t1-s1'); b.advance(); b.advance();
    expect(a.choose('a').step.node.id).toBe(b.choose('b').step.node.id);
  });

  it('restarting a scene always begins at the first line (FR 3.2.4)', () => {
    const runner = new DialogueRunner(trail1);
    runner.startScene('t1-s1'); runner.advance();
    expect(runner.startScene('t1-s1').node.id).toBe('t1-s1-n1');
  });

  it('the final scene reports trailComplete', () => {
    const runner = new DialogueRunner(trail1);
    let step = runner.startScene('t1-s3');
    while (step.kind === 'node') step = runner.advance();
    expect(step).toMatchObject({ kind: 'sceneEnd', trailComplete: true, nextSceneId: null });
  });

  it('throws helpful errors for misuse', () => {
    const runner = new DialogueRunner(trail1);
    expect(() => runner.startScene('nope')).toThrow(/Unknown scene/);
    runner.startScene('t1-s1'); runner.advance(); runner.advance();
    expect(() => runner.advance()).toThrow(/choose/);
    expect(() => runner.choose('zzz')).toThrow(/Unknown option/);
  });
});

describe('simulateRun: FR 3.4 acceptance test', () => {
  for (const trail of TRAILS) {
    it(`${trail.id}: always choosing the FIRST option reaches the final scene`, () => {
      expect(simulateRun(trail, pickFirst).completed).toBe(true);
    });
    it(`${trail.id}: always choosing the LAST option reaches the final scene`, () => {
      expect(simulateRun(trail, pickLast).completed).toBe(true);
    });
  }

  it('records every choice and every codex unlock along the way', () => {
    const run = simulateRun(trail1, pickLast);
    expect(run.scenes).toEqual(['t1-s1', 't1-s2', 't1-s3']);
    expect(run.choices.map((c) => c.optionId)).toEqual(['b', 'b']);
    expect([...run.codex].sort()).toEqual(['codex-adinkra', 'codex-ghana', 'codex-sankofa']);
  });

  it('detects a loop instead of hanging', () => {
    const loopy = {
      id: 'loop', startScene: 's',
      scenes: [{ id: 's', final: true, startNode: 'a',
        nodes: [{ id: 'a', type: 'line', speaker: 'x', text: 'y', next: 'a' }] }],
    };
    expect(() => simulateRun(loopy, pickFirst, { maxSteps: 50 })).toThrow(/maxSteps/);
  });
});
