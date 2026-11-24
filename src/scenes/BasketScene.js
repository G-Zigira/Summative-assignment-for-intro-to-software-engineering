import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { makeButton, minTarget } from '../ui/button.js';
import { controlScheme } from '../session.js';
import { bgKey, propKey, hasTexture } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';
import { hudLabel, bigMessage, popText, saveBest, bests } from '../ui/miniGameKit.js';
import { createRun, step, setMove, setTarget } from '../systems/basket.js';

// Wisdom Catch: Anansi's basket. Move the basket left and right (arrow keys / A D, the on-screen
// arrows, or drag a finger / move the mouse). Knowledge gives +1 shell, bad things -3 shells;
// below 0 shells you lose. Story mode: reach 15 shells. Arcade mode: endless, best score kept.
// The rules live in systems/basket.js; this file draws them. Docs: docs/MINIGAMES.md.

const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
const B = CONFIG.BASKET;
const JustDown = Phaser.Input.Keyboard.JustDown;

export class BasketScene extends Phaser.Scene {
  constructor() { super('BasketScene'); }

  init(data) {
    this.data0 = data ?? {};
    this.arcade = this.data0.mode === 'arcade';
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.state = 'ready'; // 'ready' | 'running' | 'lost' | 'won'
    this.attempts = 0;
    this.leaving = false;
    this.lockUntil = 0;
    this.touchDir = 0;
    this.views = new Map();
    this.run = this.#newRun();

    if (hasTexture(this, bgKey('forest'))) this.add.image(W / 2, H / 2, bgKey('forest')).setScale(0.5).setDepth(-10);
    else this.add.rectangle(W / 2, H / 2, W, H, 0x27422a).setDepth(-10);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1410, 0.4).setDepth(-9); // darkens the picture so the falling things stand out

    this.basket = hasTexture(this, propKey('basket'))
      ? this.add.image(this.run.x, B.RIM_Y - 10, propKey('basket')).setOrigin(0.5, 0).setScale(0.55).setDepth(5)
      : this.add.rectangle(this.run.x, B.RIM_Y + 30, B.WIDTH, 60, 0x9a6a3c).setDepth(5);

    this.title = this.arcade ? 'Wisdom Catch' : "Anansi's Wisdom";
    this.shellText = hudLabel(this, '', 16, 12, 18);
    hudLabel(this, this.title, 16, 54, 16, { color: COLORS.accentText });
    this.infoText = hudLabel(this, '', 16, 96, 16, { color: COLORS.accentText });
    this.exitButton = makeButton(this, { width: 130, height: 48, label: this.arcade ? 'Quit' : 'Skip', fontSize: 18, depth: 12, onClick: () => this.#leave() });
    this.exitButton.setPosition(W - 16 - this.exitButton.width / 2, 16 + this.exitButton.height / 2);

    this.message = bigMessage(this, 210);
    const touch = controlScheme() === 'touch';
    this.#say((touch
      ? 'Drag, or hold the arrows, to move the basket.\n'
      : 'Arrow keys / A D (or the mouse) move the basket.\n')
      + 'Catch knowledge: +1 shell.   Dodge the bad things: -3 shells!\n'
      + (this.arcade ? 'Below 0 shells you lose.' : `Reach ${B.GOAL} shells to share Anansi's wisdom.`)
      + (touch ? '\nTap to start.' : '\nPress a key to start.'));

    this.keys = this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', space: 'SPACE', enter: 'ENTER', e: 'E' });
    this.input.on('pointerdown', (p, over) => { if (over.length) return; this.#start(); setTarget(this.run, p.x); });
    this.input.on('pointermove', (p) => { if (this.state === 'running') setTarget(this.run, p.x); });
    this.touchDir = 0;

    if (touch) {
      const size = Math.max(72, minTarget(this));
      for (const [label, dir, x] of [['<', -1, 24 + size / 2], ['>', 1, W - 24 - size / 2]]) {
        const b = makeButton(this, { width: size, height: size, label, fontSize: 34, depth: 12, onClick: () => {} });
        b.setPosition(x, H - 24 - size / 2);
        b.bg.off('pointerup');
        b.bg.on('pointerdown', () => { this.#start(); this.touchDir = dir; });
        b.bg.on('pointerup', () => { this.touchDir = 0; });
        b.bg.on('pointerout', () => { this.touchDir = 0; });
      }
    }
    audio.playMusic('basket', { keepIfMissing: true });
  }

  #newRun() { return createRun(Math.floor(Math.random() * 1e9), { endless: this.arcade }); }
  #say(t) { this.message.setText(t).setVisible(true); }

  #start() {
    if (this.time.now < this.lockUntil) return;
    if (this.state === 'ready') { this.state = 'running'; this.message.setVisible(false); }
    else if (this.state === 'lost') this.#retry();
  }

  #retry() {
    this.views.forEach((v) => v.destroy());
    this.views.clear();
    this.run = this.#newRun();
    this.state = 'running';
    this.message.setVisible(false);
  }

  update(_t, delta) {
    const k = this.keys;
    if (this.state !== 'running' && Object.values(k).some((key) => JustDown(key))) this.#start();
    if (this.state !== 'running') return;

    const dir = (k.left.isDown || k.a.isDown ? -1 : 0) + (k.right.isDown || k.d.isDown ? 1 : 0) || this.touchDir;
    if (dir !== 0) setMove(this.run, dir);
    else if (this.run.move !== 0) setMove(this.run, 0);

    let left = Math.min(delta, 50) / 1000;
    while (left > 0) {
      const dt = Math.min(left, 1 / 60);
      step(this.run, dt);
      left -= dt;
    }
    this.#drain();
    this.#draw();
    if (this.run.status === 'lost') this.#lose();
    else if (this.run.status === 'won') this.#win();
  }

  #drain() {
    for (const e of this.run.events.splice(0)) {
      if (e.type === 'good') { audio.playSfx('collect'); popText(this, e.x, B.RIM_Y - 20, '+1', '#f2c14e'); }
      else { audio.playSfx('badCatch'); popText(this, e.x, B.RIM_Y - 20, '-3', '#ff6a7a'); this.cameras.main.shake(140, 0.006); }
    }
  }

  #draw() {
    const run = this.run;
    this.basket.x = run.x;
    const live = new Set(run.items);
    for (const [item, view] of this.views) if (!live.has(item)) { view.destroy(); this.views.delete(item); }
    for (const it of run.items) {
      let view = this.views.get(it);
      if (!view) {
        const key = propKey(`${it.kind === 'good' ? 'know' : 'bad'}-${it.type}`);
        view = hasTexture(this, key)
          ? this.add.image(0, 0, key).setScale(0.5).setDepth(4)
          : this.add.circle(0, 0, B.ITEM_R, it.kind === 'good' ? 0xf2c14e : 0xe2455a).setDepth(4);
        this.views.set(it, view);
      }
      view.x = it.x; view.y = it.y;
      view.angle = Math.sin(run.time * 3 + it.x) * (it.kind === 'bad' ? 14 : 6);
    }
    this.shellText.setText(this.arcade ? `Shells ${run.shells}   Knowledge ${run.caught}` : `Shells ${run.shells} / ${B.GOAL}`)
      .setColor(run.shells <= 1 ? COLORS.warning : COLORS.text);
    this.infoText.setText(this.arcade ? `Best ${bests().basket}` : `Knowledge caught ${run.caught}`);
  }

  #lose() {
    this.state = 'lost';
    this.attempts += 1;
    this.lockUntil = this.time.now + 400;
    audio.playSfx('gameOver');
    if (this.arcade) {
      const { best, isNew } = saveBest('basket', this.run.caught);
      this.infoText.setText(`Best ${best}`);
      this.#say(`Game over!  Knowledge caught: ${this.run.caught}${isNew ? '  (new best!)' : ''}\nPress a key to play again, or Quit.`);
    } else {
      this.#say(`The pot ran out of shells!\nPress a key to try again.${this.attempts >= 2 ? '\nOr press Skip to go on.' : ''}`);
    }
  }

  #win() {
    if (this.leaving) return;
    this.state = 'won';
    audio.playSfx('arrive');
    this.#say("The wisdom is shared with everyone!");
    this.time.delayedCall(1100, () => this.#leave());
  }

  #leave() {
    if (this.leaving) return;
    this.leaving = true;
    if (this.arcade) this.scene.start('ArcadeScene');
    else this.scene.start('GameScene', this.data0.exitData ?? this.data0);
  }

  skip() { this.#leave(); }

  /** For tests: win instantly. */
  debugWin() {
    this.state = 'running';
    this.message.setVisible(false);
    this.run.shells = B.GOAL;
  }
}
