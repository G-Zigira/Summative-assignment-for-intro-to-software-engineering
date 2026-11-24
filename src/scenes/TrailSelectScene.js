import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS, FONT_DISPLAY } from '../ui/theme.js';
import { fadeIn } from '../ui/fx.js';
import { makeButton, makeText, minTarget } from '../ui/button.js';
import { session } from '../session.js';
import { TRAILS } from '../content/index.js';
import { bgKey, hasTexture } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';
import { isTrailUnlocked, isTrailCompleted, fragmentProgress } from '../systems/unlocks.js';

// FR 3.3: locked trails show a lock and cannot be started.
export class TrailSelectScene extends Phaser.Scene {
  constructor() {
    super('TrailSelectScene');
  }

  create() {
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    this.cameras.main.setBackgroundColor(COLORS.background);
    if (hasTexture(this, bgKey('title'))) {
      this.add.image(W / 2, H / 2, bgKey('title')).setScale(0.5).setDepth(-2);
      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.62).setDepth(-1); // dim so buttons stay readable
    }
    audio.playMusic('title');
    fadeIn(this);
    makeText(this, W / 2, 50, 'Choose a trail', 42, { fontFamily: FONT_DISPLAY, color: COLORS.accentText, stroke: '#2a1522', strokeThickness: 6 }).setOrigin(0.5);

    const pieces = (trail) => {
      const { found, total } = fragmentProgress(session.save, trail);
      return total > 0 && isTrailUnlocked(session.save, trail.id) ? `   (story pieces ${found}/${total})` : '';
    };
    const rowH = Math.max(76, minTarget(this) + 12);
    TRAILS.forEach((trail, i) => {
      const unlocked = isTrailUnlocked(session.save, trail.id);
      const done = isTrailCompleted(session.save, trail.id);
      const status = !unlocked ? '[LOCKED]  ' : done ? '[DONE]  ' : '';
      makeButton(this, {
        x: W / 2, y: 130 + i * rowH, width: 640, height: rowH - 12, wrap: true,
        label: `${status}${trail.tutorial ? 'Tutorial' : `Trail ${trail.order}`}: ${trail.title}${pieces(trail)}`,
        enabled: unlocked,
        onClick: () => this.scene.start('GameScene', { trailId: trail.id }),
      });
    });

    const bottom = CONFIG.GAME_HEIGHT - 50;
    makeButton(this, { x: W / 2 - 130, y: bottom, width: 220, label: 'Codex', onClick: () => this.#openCodex() });
    makeButton(this, { x: W / 2 + 130, y: bottom, width: 220, label: 'Back', onClick: () => this.scene.start('TitleScene') });
  }

  #openCodex() {
    this.scene.launch('CodexScene', { from: 'TrailSelectScene' });
    this.scene.bringToTop('CodexScene');
    this.scene.pause();
  }
}
