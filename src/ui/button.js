import { CONFIG } from '../config.js';
import { bake } from './fx.js';
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
      fontStyle: '600',
      color: enabled ? COLORS.text : COLORS.textDisabled,
      align: 'center',
      wordWrap: wrap ? { width: w - 24 } : undefined,
    })
    .setOrigin(0.5);
  const h = Math.max(height, min, text.height + 16);

  // The picture of the button is drawn with Graphics (rounded corners, a soft top highlight, a gold
  // frame). `bg` stays an invisible rectangle of the same size: it receives the clicks.
  const PAD = 6; // room for the shadow around the rounded shape inside the baked picture
  const gfx = scene.add.image(0, 0, '__DEFAULT').setDepth(depth);
  const draw = (state) => {
    const hover = state === 'hover' || state === 'down';
    const key = bake(scene, `btn-${Math.round(w)}x${Math.round(h)}-${enabled ? 1 : 0}-${hover ? 1 : 0}`, w + PAD * 2, h + PAD * 2, (g) => {
      const r = Math.min(16, h / 3), x0 = PAD, y0 = PAD;
      const base = !enabled ? COLORS.buttonDisabled : hover ? 0x6b4c30 : 0x4a3626;
      g.fillStyle(0x000000, enabled ? 0.38 : 0.2).fillRoundedRect(x0 + 1, y0 + 5, w, h, r);                  // shadow
      g.fillStyle(base, 1).fillRoundedRect(x0, y0, w, h, r);                                                  // body
      g.fillStyle(0xffffff, enabled ? (hover ? 0.16 : 0.09) : 0.03)
        .fillRoundedRect(x0 + 3, y0 + 3, w - 6, h / 2 - 3, { tl: r - 2, tr: r - 2, bl: 2, br: 2 });          // highlight
      g.lineStyle(2, enabled ? COLORS.accent : COLORS.border, 1).strokeRoundedRect(x0, y0, w, h, r);          // gold frame
      if (enabled) {
        g.lineStyle(1, COLORS.accent, 0.3).strokeRoundedRect(x0 + 5, y0 + 5, w - 10, h - 10, Math.max(4, r - 4));
        g.fillStyle(COLORS.accent, hover ? 1 : 0.8);
        for (const sx of [-1, 1]) { // a small diamond on each side, like the Adinkra borders in the pictures
          const cx = x0 + w / 2 + sx * (w / 2 - 14), cy = y0 + h / 2;
          g.fillTriangle(cx - 5, cy, cx, cy - 6, cx + 5, cy).fillTriangle(cx - 5, cy, cx, cy + 6, cx + 5, cy);
        }
      }
    });
    gfx.setTexture(key);
  };
  draw('idle');

  const bg = scene.add.rectangle(0, 0, w, h, 0x000000, 0.001);
  bg.setDepth(depth);
  text.setDepth(depth + 1);

  const grow = (k) => scene.tweens.add({ targets: [gfx, text], scale: k, duration: 90 });
  if (enabled) {
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { draw('hover'); grow(1.03); });
    bg.on('pointerout', () => { draw('idle'); grow(1); });
    bg.on('pointerdown', () => { draw('down'); grow(0.97); });
    bg.on('pointerup', () => { draw('hover'); audio.playSfx('click'); onClick?.(); });
  }

  const api = {
    bg,
    gfx,
    text,
    width: w,
    height: h,
    setPosition(px, py) {
      bg.setPosition(px, py);
      gfx.setPosition(px, py);
      text.setPosition(px, py);
      return api;
    },
    setLabel(l) {
      text.setText(l);
    },
    setVisible(visible) {
      bg.setVisible(visible);
      gfx.setVisible(visible);
      text.setVisible(visible);
      if (bg.input) bg.input.enabled = visible;
      return api;
    },
    destroy() {
      bg.destroy();
      gfx.destroy();
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
