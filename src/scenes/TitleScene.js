import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
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
    // Dark bands keep the text readable (NFR 3: contrast >= 4.5:1) over the picture.
    this.add.rectangle(W / 2, 140, W, 150, 0x000000, 0.55).setDepth(-1);
    this.add.rectangle(W / 2, 310, 400, 190, 0x000000, 0.5).setDepth(-1);
    audio.playMusic('title');

    makeText(this, W / 2, 110, 'Sankofa Trails', 54, { fontStyle: 'bold', color: COLORS.accentText }).setOrigin(0.5);
    makeText(this, W / 2, 170, 'Go back and fetch it: walk the trails of African history.', 20, {
      color: COLORS.text,
    }).setOrigin(0.5);

    const canContinue = session.loadStatus === 'ok';
    // Overwriting anything that exists (good save or unreadable one) needs a confirmation (FR 3.5.3).
    const needsConfirm = session.storageAvailable && session.loadStatus !== 'none';

    makeButton(this, {
      x: W / 2, y: 270, width: 320, label: 'Continue', enabled: canContinue,
      onClick: () => this.#continue(),
    });

    const newGame = makeButton(this, {
      x: W / 2, y: 350, width: 320, label: 'New Game',
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

    this.#showNotices(W, H);
  }

  #continue() {
    const { trailId, sceneId } = session.save;
    if (trailId && sceneId) this.scene.start('GameScene', { resume: true });
    else this.scene.start('TrailSelectScene');
  }

  #showNotices(W, H) {
    const notice = (message) =>
      makeText(this, W / 2, H - 60, message, 20, { color: COLORS.warning, align: 'center', wordWrap: { width: W - 80 } })
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
