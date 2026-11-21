// The story engine. It knows nothing about Phaser, so it can be unit tested and
// used by the content validator. See docs/CONTENT-SCHEMA.md for the data format.
//
// Requirements covered: FR 3.1, FR 3.4 (choices never block progress), FR 4.2.1.

export class DialogueRunner {
  constructor(trail) {
    this.trail = trail;
    this.sceneMap = new Map(trail.scenes.map((s) => [s.id, s]));
    this.scene = null;
    this.nodeMap = null;
    this.node = null;
  }

  /** Start (or restart) a scene from its first line. FR 3.2.4: mid-dialogue state is never restored. */
  startScene(sceneId) {
    const scene = this.sceneMap.get(sceneId);
    if (!scene) throw new Error(`Unknown scene: ${sceneId}`);
    this.scene = scene;
    this.nodeMap = new Map(scene.nodes.map((n) => [n.id, n]));
    return this.#enter(scene.startNode, []);
  }

  /** Move past a "line" or "context" node. */
  advance() {
    if (!this.node) throw new Error('advance() called with no active node');
    if (this.node.type === 'decision') throw new Error('A decision needs choose(), not advance()');
    return this.#enter(this.node.next ?? null, []);
  }

  /**
   * Pick an option at a decision node.
   * @returns {{choice: {decisionId, optionId, outcome}, step: object}}
   */
  choose(optionId) {
    if (!this.node || this.node.type !== 'decision') throw new Error('choose() needs an active decision');
    const option = this.node.options.find((o) => o.id === optionId);
    if (!option) throw new Error(`Unknown option ${optionId} at ${this.node.id}`);
    const choice = { decisionId: this.node.id, optionId, outcome: option.outcome ?? '' };
    const step = this.#enter(option.next ?? null, option.unlocksCodex ?? []);
    return { choice, step };
  }

  #enter(nodeId, extraUnlocks) {
    if (nodeId === null || nodeId === undefined) {
      this.node = null;
      const s = this.scene;
      return {
        kind: 'sceneEnd',
        sceneId: s.id,
        nextSceneId: s.final ? null : (s.nextScene ?? null),
        trailComplete: Boolean(s.final),
        unlocks: extraUnlocks,
      };
    }
    const node = this.nodeMap.get(nodeId);
    if (!node) throw new Error(`Unknown node ${nodeId} in scene ${this.scene.id}`);
    this.node = node;
    return { kind: 'node', node, unlocks: [...extraUnlocks, ...(node.unlocksCodex ?? [])] };
  }
}

/**
 * Play a whole trail automatically. `pick(options, node)` chooses an option.
 * Used by tests and the validator to prove FR 3.4's acceptance criterion:
 * "always choosing the first option" and "always choosing the last option"
 * both reach the final scene.
 */
export function simulateRun(trail, pick = (options) => options[0], { maxSteps = 10000 } = {}) {
  const runner = new DialogueRunner(trail);
  const result = { completed: false, scenes: [], choices: [], codex: new Set(), steps: 0 };
  let sceneId = trail.startScene;

  while (sceneId) {
    result.scenes.push(sceneId);
    let step = runner.startScene(sceneId);
    for (;;) {
      result.steps += 1;
      if (result.steps > maxSteps) throw new Error('simulateRun exceeded maxSteps (possible loop)');
      step.unlocks.forEach((id) => result.codex.add(id));

      if (step.kind === 'sceneEnd') {
        if (step.trailComplete) {
          result.completed = true;
          return result;
        }
        sceneId = step.nextSceneId;
        break;
      }
      if (step.node.type === 'decision') {
        const option = pick(step.node.options, step.node);
        const { choice, step: next } = runner.choose(option.id);
        result.choices.push(choice);
        step = next;
      } else {
        step = runner.advance();
      }
    }
  }
  return result;
}

export const pickFirst = (options) => options[0];
export const pickLast = (options) => options[options.length - 1];
