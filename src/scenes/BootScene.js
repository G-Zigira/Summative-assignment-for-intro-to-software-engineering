import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { initSession } from '../session.js';
import { loadAll, createAnimations } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';

// Runs once at startup: loads every picture (and sound, if any are listed in
// src/audio/audioManifest.js), shows a progress bar, then opens the title screen.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.add.text(W / 2, H / 2 - 40, 'Loading...', { fontFamily: 'system-ui, sans-serif', fontSize: '24px', color: COLORS.text }).setOrigin(0.5);
    this.add.rectangle(W / 2, H / 2, 400, 16).setStrokeStyle(2, COLORS.border);
    const bar = this.add.rectangle(W / 2 - 198, H / 2, 4, 12, COLORS.accent).setOrigin(0, 0.5);
    this.load.on('progress', (p) => { bar.width = Math.max(4, 396 * p); });
    // A file that fails to load must never block the game: scenes fall back to shapes / silence.
    this.load.on('loaderror', (file) => console.warn(`Could not load ${file.key}`));

    loadAll(this);
    audio.preload(this);
  }

  create() {
    initSession(); // FR 3.5.1: detect storage + load the save, never throws
    createAnimations(this);
    audio.init(this.game);
    // Wait (briefly) for the heading font so the first screen does not flash a different one.
    const go = () => this.scene.start('TitleScene');
    const wait = document.fonts?.load ? Promise.race([document.fonts.load('30px Marcellus'), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    wait.catch(() => {}).then(go);
  }
}
