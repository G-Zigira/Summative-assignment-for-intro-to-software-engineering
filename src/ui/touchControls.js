import { CONFIG } from '../config.js';
import { COLORS, FONT } from './theme.js';
import { minTarget, minGap } from './button.js';

// FR 2.2: on-screen D-pad (bottom left) and a Talk button (bottom right).
// Every button is >= 48 CSS px with >= 8 CSS px between neighbours (NFR 3).

export class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.pressed = { up: false, down: false, left: false, right: false };
    this.interactQueued = false;
    this.parts = [];

    const size = Math.max(72, minTarget(scene));
    const gap = Math.max(10, minGap(scene));
    const margin = 24;
    const cx = margin + size + gap + size / 2;
    const cy = CONFIG.GAME_HEIGHT - margin - size - gap - size / 2;

    const pad = [
      ['up', '^', cx, cy - size - gap],
      ['down', 'v', cx, cy + size + gap],
      ['left', '<', cx - size - gap, cy],
      ['right', '>', cx + size + gap, cy],
    ];
    for (const [dir, glyph, x, y] of pad) {
      this.#button(x, y, size, size, glyph, () => { this.pressed[dir] = true; }, () => { this.pressed[dir] = false; });
    }

    const talkW = Math.max(size * 1.6, 140);
    this.#button(
      CONFIG.GAME_WIDTH - margin - talkW / 2, CONFIG.GAME_HEIGHT - margin - size / 2,
      talkW, size, 'Talk', () => { this.interactQueued = true; }, () => {},
    );
  }

  #button(x, y, w, h, label, onDown, onUp) {
    const bg = this.scene.add.rectangle(x, y, w, h, COLORS.button, 0.65)
      .setStrokeStyle(2, COLORS.accent).setDepth(5).setInteractive();
    const text = this.scene.add.text(x, y, label, {
      fontFamily: FONT, fontSize: '28px', color: COLORS.text,
    }).setOrigin(0.5).setDepth(6);
    bg.on('pointerdown', onDown);
    bg.on('pointerup', onUp);
    bg.on('pointerout', onUp);
    bg.on('pointerupoutside', onUp);
    this.parts.push(bg, text);
  }

  /** @returns {{x: number, y: number}} each -1, 0 or 1 */
  get direction() {
    return {
      x: Number(this.pressed.right) - Number(this.pressed.left),
      y: Number(this.pressed.down) - Number(this.pressed.up),
    };
  }

  /** True once per tap of the Talk button. */
  consumeInteract() {
    const queued = this.interactQueued;
    this.interactQueued = false;
    return queued;
  }

  setVisible(visible) {
    this.parts.forEach((p) => {
      p.setVisible(visible);
      if (p.input) p.input.enabled = visible;
    });
    if (!visible) {
      Object.keys(this.pressed).forEach((k) => { this.pressed[k] = false; });
    }
  }

  destroy() {
    this.parts.forEach((p) => p.destroy());
    this.parts = [];
  }
}
