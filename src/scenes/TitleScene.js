import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS, FONT_DISPLAY } from '../ui/theme.js';
import { addAmbient, fadeIn, bake } from '../ui/fx.js';
import { makeButton, makeText } from '../ui/button.js';
import { session, startNewGame, refreshFromStorage } from '../session.js';
import { bgKey, hasTexture } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    refreshFromStorage(); // Continue must reflect the last save point (see session.js)
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    this.cameras.main.setBackgroundColor(COLORS.background);
    if (hasTexture(this, bgKey('title'))) {
      this.add.image(W / 2, H / 2, bgKey('title')).setScale(0.5).setDepth(-2);
    }
    // A soft dark fade at the top and a rounded panel behind the menu keep the text readable
    // (NFR 3: contrast >= 4.5:1) without hiding the picture.
    this.add.image(0, 0, bake(this, 'title-scrim', W, 270, (g) => {
      g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.78, 0.78, 0, 0).fillRect(0, 0, W, 270);
    })).setOrigin(0).setDepth(-1);
    this.add.image(W / 2, 345, bake(this, 'title-panel', 424, 302, (g) => {
      g.fillStyle(0x000000, 0.5).fillRoundedRect(2, 2, 420, 298, 22);
      g.lineStyle(2, COLORS.accent, 0.55).strokeRoundedRect(2, 2, 420, 298, 22);
      g.lineStyle(1, COLORS.accent, 0.25).strokeRoundedRect(9, 9, 406, 284, 17);
    })).setDepth(-1);
    // The emblem in the picture glows softly.
    const glow = this.add.circle(780, 320, 190, 0xf2c14e, 0.10).setDepth(-1.5);
    this.tweens.add({ targets: glow, alpha: 0.03, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    addAmbient(this, 'fireflies', { top: 300, depth: -1.2 });
    fadeIn(this, 450);
    audio.playMusic('title');

    makeText(this, W / 2, 104, 'Sankofa Trails', 66, { fontFamily: FONT_DISPLAY, color: COLORS.accentText, stroke: '#2a1522', strokeThickness: 8, shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 10, fill: true } }).setOrigin(0.5);
    makeText(this, W / 2, 166, 'Go back and fetch it: walk the trails of African history.', 20, {
      color: COLORS.text, backgroundColor: '#00000099', padding: { x: 14, y: 5 },
    }).setOrigin(0.5);

    const canContinue = session.loadStatus === 'ok';
    // Overwriting anything that exists (good save or unreadable one) needs a confirmation (FR 3.5.3).
    const needsConfirm = session.storageAvailable && session.loadStatus !== 'none';

    makeButton(this, {
      x: W / 2, y: 250, width: 320, label: 'Continue', enabled: canContinue,
      onClick: () => this.#continue(),
    });

    const newGame = makeButton(this, {
      x: W / 2, y: 322, width: 320, label: 'New Game',
      onClick: () => {
        if (needsConfirm && !this.confirming) {
          this.confirming = true;
          newGame.setLabel('Tap again to erase old save');
          return;
        }
        startNewGame();
        this.scene.start('TrailSelectScene');
      },
    });

    makeButton(this, {
      x: W / 2, y: 394, width: 320, label: 'Settings',
      onClick: () => {
        this.scene.launch('SettingsScene', { from: 'TitleScene' });
        this.scene.bringToTop('SettingsScene');
        this.scene.pause();
      },
    });

    makeButton(this, {
      x: W / 2, y: 466, width: 320, label: 'Mini Games',
      onClick: () => this.scene.start('ArcadeScene'),
    });

    this.#showNotices(W, H);
  }

  #continue() {
    const { trailId, sceneId } = session.save;
    if (trailId && sceneId) this.scene.start('GameScene', { resume: true });
    else this.scene.start('TrailSelectScene');
  }

  #showNotices(W, H) {
    const notice = (message) =>
      makeText(this, W / 2, H - 20, message, 16, { color: COLORS.warning, align: 'center', wordWrap: { width: W - 80 } })
        .setOrigin(0.5);

    // FR 3.5.1: storage unavailable. Shown once; Continue stays disabled (and Save is disabled in the pause menu).
    if (!session.storageAvailable) {
      if (!session.storageNoticeShown) {
        session.storageNoticeShown = true;
        notice("Progress can't be saved in this browser. You can still play, but nothing will be remembered.");
      }
      return;
    }
    // FR 3.5.3: unreadable or incompatible save. The game does not crash; New Game replaces it after confirming.
    if (session.loadStatus === 'corrupt' || session.loadStatus === 'incompatible') {
      notice("Your saved game couldn't be loaded. Choose New Game to start again.");
    }
  }
}
