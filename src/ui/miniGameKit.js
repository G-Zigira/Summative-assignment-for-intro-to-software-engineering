import { createSafeStorage } from '../systems/storage.js';
import { loadBests, recordScore } from '../systems/arcade.js';
import { makeText } from './button.js';

// Small helpers shared by the three minigames (runner, horse, basket).

let storage = null;
const store = () => (storage ??= createSafeStorage());

/** Best scores for the arcade menu. Never throws. */
export const bests = () => loadBests(store());
export const saveBest = (id, score) => recordScore(store(), id, score);

/** A HUD label on a dark strip so it stays readable over any picture. */
export function hudLabel(scene, text, x, y, size, style = {}) {
  return makeText(scene, x, y, text, size, { backgroundColor: '#1f1a16cc', padding: { x: 8, y: 4 }, ...style }).setDepth(10);
}

/** The big centred message ("Press Space to start", "Game over"). */
export function bigMessage(scene, y = 190) {
  return makeText(scene, scene.scale.gameSize.width / 2, y, '', 22, {
    fontStyle: 'bold', align: 'center', color: '#f5efe6', lineSpacing: 6, backgroundColor: '#1f1a16dd', padding: { x: 16, y: 10 },
  }).setOrigin(0.5).setDepth(15);
}

/** A floating "+1" / "-3" that rises and fades. */
export function popText(scene, x, y, text, color) {
  const t = makeText(scene, x, y, text, 28, { fontStyle: 'bold', color, stroke: '#1d1410', strokeThickness: 5 }).setOrigin(0.5).setDepth(14);
  scene.tweens.add({ targets: t, y: y - 54, alpha: 0, duration: 800, onComplete: () => t.destroy() });
}
