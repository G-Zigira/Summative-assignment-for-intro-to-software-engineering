import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { makeButton, makeText } from '../ui/button.js';
import { session } from '../session.js';

// Pause menu overlay. FR 3.2.1(d): manual Save lives here, and is only reachable when no
// dialogue is open (GameScene refuses to open this menu during dialogue).
export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setInteractive();
    makeText(this, W / 2, 70, 'Paused', 40, { fontStyle: 'bold', color: COLORS.accentText }).setOrigin(0.5);

    const game = () => this.scene.get('GameScene');
    this.status = makeText(this, W / 2, H - 50, '', 20, { color: COLORS.accentText }).setOrigin(0.5);

    makeButton(this, { x: W / 2, y: 150, width: 320, label: 'Resume', onClick: () => this.#resume() });

    // FR 3.5.1: Save is disabled when storage is unavailable.
    makeButton(this, {
      x: W / 2, y: 230, width: 320, label: session.storageAvailable ? 'Save' : 'Save (unavailable)',
      enabled: session.storageAvailable,
      onClick: () => {
        const result = game().manualSave();
        this.status.setText(result.ok ? 'Progress saved' : "Couldn't save your progress");
        this.status.setColor(result.ok ? COLORS.accentText : COLORS.warning);
      },
    });

    makeButton(this, {
      x: W / 2, y: 310, width: 320, label: 'Codex',
      onClick: () => {
        this.scene.launch('CodexScene', { from: 'PauseScene' });
        this.scene.bringToTop('CodexScene');
        this.scene.pause();
      },
    });

    makeButton(this, {
      x: W / 2, y: 390, width: 320, label: 'Quit to Title',
      onClick: () => {
        this.scene.stop('GameScene');
        this.scene.start('TitleScene');
      },
    });

    this.input.keyboard.on('keydown-ESC', () => this.#resume());
  }

  #resume() {
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
