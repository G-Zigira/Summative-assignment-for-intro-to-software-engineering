import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { makeButton, makeText, minTarget } from '../ui/button.js';
import { session, updateSettings } from '../session.js';
import { audio } from '../audio/audioManager.js';

// FR 5.1 / FR 2.2: volume (0-100 in steps of 10), text size, control scheme.
// Opens over the title screen or the pause menu. Volume applies at once; text size and the control
// scheme apply from the next scene (this screen redraws itself so you can see the text size).
const LABELS = {
  textSize: { small: 'Small', medium: 'Medium', large: 'Large' },
  controlScheme: { auto: 'Automatic', keyboard: 'Keyboard and mouse', touch: 'Touch' },
};

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  init(data) {
    this.from = data?.from ?? 'TitleScene';
  }

  create() {
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82).setInteractive();
    makeText(this, W / 2, 56, 'Settings', 38, { fontStyle: 'bold', color: COLORS.accentText }).setOrigin(0.5);

    const s = session.save.settings;
    const step = CONFIG.VOLUME_STEP;
    const sizes = Object.keys(CONFIG.TEXT_SIZES);
    const schemes = CONFIG.CONTROL_SCHEMES;
    const cycle = (list, value, dir) => list[(list.indexOf(value) + dir + list.length) % list.length];
    const small = Math.max(64, minTarget(this));

    const row = (y, name, valueText, onMinus, onPlus) => {
      makeText(this, 90, y, name, 22, { color: COLORS.text }).setOrigin(0, 0.5);
      makeButton(this, { x: 520, y, width: small, label: '-', onClick: onMinus });
      makeText(this, 660, y, valueText, 22, { color: COLORS.accentText, align: 'center' }).setOrigin(0.5);
      makeButton(this, { x: 800, y, width: small, label: '+', onClick: onPlus });
    };
    const change = (patch) => {
      const result = updateSettings(patch);
      audio.refreshVolume();
      audio.playSfx('click');
      if (!result.ok && !result.skipped) this.status.setText("Couldn't save your settings");
      this.scene.restart({ from: this.from });
    };

    row(150, 'Volume', `${s.volume}%`,
      () => change({ volume: Math.max(0, s.volume - step) }),
      () => change({ volume: Math.min(100, s.volume + step) }));
    row(240, 'Text size', LABELS.textSize[s.textSize],
      () => change({ textSize: cycle(sizes, s.textSize, -1) }),
      () => change({ textSize: cycle(sizes, s.textSize, 1) }));
    row(330, 'Controls', LABELS.controlScheme[s.controlScheme],
      () => change({ controlScheme: cycle(schemes, s.controlScheme, -1) }),
      () => change({ controlScheme: cycle(schemes, s.controlScheme, 1) }));

    this.status = makeText(this, W / 2, 400, session.storageAvailable
      ? 'Text size and controls change from the next scene.'
      : 'Settings are kept only until you close the game.', 16, { color: COLORS.text, align: 'center' }).setOrigin(0.5);

    makeButton(this, { x: W / 2, y: 470, width: 260, label: 'Done', onClick: () => this.#close() });
    this.input.keyboard.on('keydown-ESC', () => this.#close());
  }

  #close() {
    this.scene.resume(this.from);
    this.scene.stop();
  }
}
