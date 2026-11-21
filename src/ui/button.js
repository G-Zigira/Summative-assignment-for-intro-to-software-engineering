import { CONFIG } from '../config.js';
import { COLORS, FONT } from './theme.js';
import { currentTextScale } from '../session.js';
import { audio } from '../audio/audioManager.js';

// The canvas is scaled to fit the screen, so a "48 px touch target" (NFR 3) has to be
// converted from CSS pixels to game pixels. On a small phone the canvas is drawn
// smaller than 960 px wide, so the same target needs MORE game pixels.

/** CSS pixels per game pixel right now (1 = canvas shown at native size). */
export function cssScale(scene) {
  const shown = scene.scale.displaySize.width;
  const game = scene.scale.gameSize.width;
  return shown > 0 && game > 0 ? shown / game : 1;
}

/** Smallest allowed touch-target edge, in game pixels. */
export function minTarget(scene) {
  return Math.ceil(CONFIG.MIN_TOUCH_TARGET_CSS_PX / cssScale(scene));
}

/** Gap between neighbouring targets, in game pixels. */
export function minGap(scene) {
  return Math.ceil(CONFIG.MIN_TOUCH_GAP_CSS_PX / cssScale(scene));
}

/** Font size in game pixels, honouring the player's text-size setting (FR 5.1). */
export function fontPx(base) {
  return Math.round(base * currentTextScale());
}

/**
 * A rectangular text button. Never smaller than the minimum touch target.
 * @returns {{bg, text, width, height, setPosition, setLabel, destroy}}
 */
export function makeButton(scene, opts) {
  const {
    x = 0, y = 0, width = 240, height = 64, label, onClick,
    enabled = true, fontSize = 20, depth = 0, wrap = false,
  } = opts;

  const min = minTarget(scene);
  const w = Math.max(width, min);
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONT,
      fontSize: `${fontPx(fontSize)}px`,
      color: enabled ? COLORS.text : COLORS.textDisabled,
      align: 'center',
      wordWrap: wrap ? { width: w - 24 } : undefined,
    })
    .setOrigin(0.5);
  const h = Math.max(height, min, text.height + 16);

  const bg = scene.add
    .rectangle(0, 0, w, h, enabled ? COLORS.button : COLORS.buttonDisabled)
    .setStrokeStyle(2, enabled ? COLORS.accent : COLORS.border);
  bg.setDepth(depth);
  text.setDepth(depth + 1);

  if (enabled) {
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(COLORS.buttonHover));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.button));
    bg.on('pointerup', () => { audio.playSfx('click'); onClick?.(); });
  }

  const api = {
    bg,
    text,
    width: w,
    height: h,
    setPosition(px, py) {
      bg.setPosition(px, py);
      text.setPosition(px, py);
      return api;
    },
    setLabel(l) {
      text.setText(l);
    },
    setVisible(visible) {
      bg.setVisible(visible);
      text.setVisible(visible);
      if (bg.input) bg.input.enabled = visible;
      return api;
    },
    destroy() {
      bg.destroy();
      text.destroy();
    },
  };
  return api.setPosition(x, y);
}

/** Plain text that respects the text-size setting. */
export function makeText(scene, x, y, str, base = 20, style = {}) {
  return scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${fontPx(base)}px`,
    color: COLORS.text,
    ...style,
  });
}
