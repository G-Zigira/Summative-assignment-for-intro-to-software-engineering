import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { makeButton, makeText } from '../ui/button.js';
import { bgKey, propKey, hasTexture } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';
import { ARCADE_GAMES } from '../systems/arcade.js';
import { bests } from '../ui/miniGameKit.js';

// The Mini Games menu: play any of the three minigames again and again, until you fail or quit.
// Best scores are kept on this device (see systems/arcade.js).

const ICONS = { runner: 'cowrie', horse: 'spear', basket: 'know-light' };

export class ArcadeScene extends Phaser.Scene {
  constructor() { super('ArcadeScene'); }

  create() {
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    this.cameras.main.setBackgroundColor(COLORS.background);
    if (hasTexture(this, bgKey('title'))) this.add.image(W / 2, H / 2, bgKey('title')).setScale(0.5).setDepth(-3);
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.62).setDepth(-2);
    audio.playMusic('title');

    makeText(this, W / 2, 44, 'Mini Games', 40, { fontStyle: 'bold', color: COLORS.accentText }).setOrigin(0.5);
    makeText(this, W / 2, 84, 'Play as long as you like. The game ends when you fail or quit.', 18, { color: COLORS.text }).setOrigin(0.5);

    const best = bests();
    ARCADE_GAMES.forEach((g, i) => {
      const y = 170 + i * 112;
      this.add.rectangle(W / 2, y, 880, 100, 0x1f1a16, 0.9).setStrokeStyle(2, COLORS.border);
      const icon = propKey(ICONS[g.id]);
      if (hasTexture(this, icon)) this.add.image(W / 2 - 400, y, icon).setScale(g.id === 'horse' ? 0.5 : 0.7);
      makeText(this, W / 2 - 340, y - 44, g.title, 26, { fontStyle: 'bold', color: COLORS.accentText });
      makeText(this, W / 2 - 340, y - 8, g.blurb, 16, { color: COLORS.text, wordWrap: { width: 560 } });
      makeText(this, W / 2 - 340, y + 30, `Best: ${best[g.id]} ${g.unit}`, 16, { color: COLORS.contextText });
      makeButton(this, {
        x: W / 2 + 340, y, width: 150, height: 64, label: 'Play',
        onClick: () => this.scene.start(g.scene, { mode: 'arcade' }),
      });
    });

    makeButton(this, { x: W / 2, y: H - 44, width: 220, height: 56, label: 'Back', onClick: () => this.scene.start('TitleScene') });
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('TitleScene'));
  }
}
