import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { makeButton, makeText, minTarget, minGap } from '../ui/button.js';
import { session } from '../session.js';
import { CODEX } from '../content/index.js';

// FR 4.2.2 / 4.2.3: lists entries by category; locked entries show "???" and
// cannot be opened; the header shows unlocked/total. Runs as an overlay.

const PER_PAGE = 6;

export class CodexScene extends Phaser.Scene {
  constructor() {
    super('CodexScene');
  }

  init(data) {
    this.from = data?.from;
    this.page = 0;
    this.selectedId = null;
  }

  create() {
    this.#render();
    this.input.keyboard.on('keydown-ESC', () => this.#close());
    this.input.keyboard.on('keydown-C', () => this.#close());
  }

  #entries() {
    // Group by category in the order Figures, Places, Terms.
    return CONFIG.CODEX_CATEGORIES.flatMap((cat) => CODEX.filter((e) => e.category === cat));
  }

  #render() {
    this.children.removeAll(true);
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    const unlocked = new Set(session.save.unlockedCodex);
    const entries = this.#entries();

    this.add.rectangle(W / 2, H / 2, W, H, COLORS.background, 0.97).setInteractive();
    const count = entries.filter((e) => unlocked.has(e.id)).length;
    makeText(this, W / 2, 36, `Codex  ${count}/${entries.length}`, 34, { fontStyle: 'bold', color: COLORS.accentText })
      .setOrigin(0.5);

    const rowH = Math.max(60, minTarget(this) + minGap(this));
    const pages = Math.max(1, Math.ceil(entries.length / PER_PAGE));
    const slice = entries.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE);

    slice.forEach((entry, i) => {
      const open = unlocked.has(entry.id);
      makeButton(this, {
        x: 250, y: 100 + i * rowH, width: 400, height: rowH - 10, enabled: open, fontSize: 20,
        label: open ? `${entry.title}  (${entry.category})` : '???',
        onClick: () => { this.selectedId = entry.id; this.#render(); },
      });
    });

    const selected = entries.find((e) => e.id === this.selectedId);
    if (selected) {
      makeText(this, 480, 100, selected.title, 28, { fontStyle: 'bold', color: COLORS.accentText });
      makeText(this, 480, 150, selected.text, 20, { wordWrap: { width: 440 } });
    } else {
      makeText(this, 480, 100, 'Pick an unlocked entry to read it.', 20, { color: COLORS.textDisabled, wordWrap: { width: 440 } });
    }

    const bottom = H - 40;
    makeButton(this, { x: 90, y: bottom, width: 140, label: 'Prev', enabled: this.page > 0, onClick: () => { this.page -= 1; this.#render(); } });
    makeButton(this, { x: 250, y: bottom, width: 140, label: 'Next', enabled: this.page < pages - 1, onClick: () => { this.page += 1; this.#render(); } });
    makeButton(this, { x: W - 110, y: bottom, width: 180, label: 'Close', onClick: () => this.#close() });
  }

  #close() {
    if (this.from) this.scene.resume(this.from);
    this.scene.stop();
  }
}
