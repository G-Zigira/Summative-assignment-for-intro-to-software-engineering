import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { makeButton, minTarget } from '../ui/button.js';
import { controlScheme } from '../session.js';
import { propKey, hasTexture } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';
import { hudLabel, bigMessage, saveBest, bests } from '../ui/miniGameKit.js';
import { createRun, step, jump, throwSpear, onGround, scoreOf } from '../systems/horse.js';

// Horse Charge: the Sundiata battle. The rider gallops by itself; jump over rocks and bushes
// (Space / Up / W, or the left half of the screen) and throw spears at the soldiers
// (E / Enter / X, or the right half). A soldier that reaches the rider, or an obstacle that is not
// jumped, ends the run. Story mode: defeat 8 soldiers. Arcade mode: endless, best score kept.
// The rules live in systems/horse.js; this file draws them. Docs: docs/MINIGAMES.md.

const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
const HC = CONFIG.HORSE;
const JustDown = Phaser.Input.Keyboard.JustDown;

export class HorseScene extends Phaser.Scene {
  constructor() { super('HorseScene'); }

  init(data) {
    this.data0 = data ?? {};
    this.arcade = this.data0.mode === 'arcade';
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.state = 'ready'; // 'ready' | 'running' | 'crashed' | 'won'
    this.attempts = 0;
    this.leaving = false;
    this.lockUntil = 0;
    this.views = { soldiers: new Map(), spears: new Map(), obstacles: new Map() };
    this.run = this.#newRun();

    if (hasTexture(this, 'battle-sky')) this.sky = this.add.tileSprite(0, 0, W, H, 'battle-sky').setOrigin(0).setTileScale(0.5).setDepth(-10);
    else this.add.rectangle(W / 2, H / 2, W, H, 0x5a1f36).setDepth(-10);
    if (hasTexture(this, 'runner-ground')) this.ground = this.add.tileSprite(0, H - 100, W, 100, 'runner-ground').setOrigin(0).setTileScale(0.5).setDepth(-5);
    else this.add.rectangle(W / 2, H - 50, W, 100, 0x9a6a3c).setDepth(-5);

    if (hasTexture(this, propKey('horse-a'))) this.rider = this.add.image(HC.PLAYER_X, HC.GROUND_Y + 4, propKey('horse-a')).setOrigin(0.5, 1).setScale(0.5).setDepth(2);
    else this.rider = this.add.rectangle(HC.PLAYER_X, HC.GROUND_Y - 35, 90, 70, 0x7a4524).setDepth(2);

    this.title = this.arcade ? 'Horse Charge' : 'The Battle of Kirina';
    this.scoreText = hudLabel(this, '', 16, 12, 18);
    hudLabel(this, this.title, 16, 54, 16, { color: COLORS.accentText });
    this.bestText = this.arcade ? hudLabel(this, `Best ${bests().horse}`, 16, 96, 16, { color: COLORS.accentText }) : null;

    this.exitButton = makeButton(this, { width: 130, height: 48, label: this.arcade ? 'Quit' : 'Skip', fontSize: 18, depth: 12, onClick: () => this.#leave(false) });
    this.exitButton.setPosition(W - 16 - this.exitButton.width / 2, 16 + this.exitButton.height / 2);

    this.message = bigMessage(this, 230);
    const touch = controlScheme() === 'touch';
    this.#say(touch
      ? 'Tap JUMP to jump rocks, THROW to throw spears.\nStop every soldier before he reaches you!\nTap to start.'
      : 'Space / Up = jump        E / Enter / X = throw a spear\n(or click the left half = jump, right half = throw)\nStop every soldier before he reaches you!\nPress a key to start.');

    if (touch) {
      const size = Math.max(72, minTarget(this));
      const w = Math.max(size * 1.6, 140);
      this.jumpButton = makeButton(this, { width: w, height: size, label: 'Jump', fontSize: 26, depth: 12, onClick: () => {} });
      this.jumpButton.setPosition(24 + w / 2, H - 24 - size / 2);
      this.throwButton = makeButton(this, { width: w, height: size, label: 'Throw', fontSize: 26, depth: 12, onClick: () => {} });
      this.throwButton.setPosition(W - 24 - w / 2, H - 24 - size / 2);
      for (const [b, fn] of [[this.jumpButton, () => this.#doJump()], [this.throwButton, () => this.#doThrow()]]) {
        b.bg.off('pointerup');
        b.bg.on('pointerdown', fn);
      }
    }

    this.keys = this.input.keyboard.addKeys({ space: 'SPACE', up: 'UP', w: 'W', e: 'E', enter: 'ENTER', x: 'X', f: 'F' });
    this.input.on('pointerdown', (p, over) => {
      if (over.length) return;
      if (p.x < W / 2) this.#doJump(); else this.#doThrow();
    });
    audio.playMusic('horse', { keepIfMissing: true });
  }

  #newRun() { return createRun(Math.floor(Math.random() * 1e9), { endless: this.arcade }); }
  #say(t) { this.message.setText(t).setVisible(true); }

  #begin() { this.state = 'running'; this.message.setVisible(false); }

  #doJump() {
    if (this.time.now < this.lockUntil) return;
    if (this.state === 'ready') this.#begin();
    else if (this.state === 'crashed') return this.#retry();
    if (this.state === 'running') jump(this.run);
  }

  #doThrow() {
    if (this.time.now < this.lockUntil) return;
    if (this.state === 'ready') this.#begin();
    else if (this.state === 'crashed') return this.#retry();
    if (this.state === 'running') throwSpear(this.run);
  }

  #retry() {
    for (const m of Object.values(this.views)) { m.forEach((v) => v.destroy()); m.clear(); }
    this.run = this.#newRun();
    this.state = 'running';
    this.message.setVisible(false);
    this.rider.clearTint?.();
  }

  update(_t, delta) {
    const k = this.keys;
    if (['space', 'up', 'w'].some((n) => JustDown(k[n]))) this.#doJump();
    if (['e', 'enter', 'x', 'f'].some((n) => JustDown(k[n]))) this.#doThrow();
    if (this.state !== 'running') return;

    let left = Math.min(delta, 50) / 1000;
    while (left > 0) {
      const dt = Math.min(left, 1 / 60);
      step(this.run, dt);
      left -= dt;
    }
    this.#drain();
    this.#draw();
    if (this.run.status === 'crashed') this.#crash();
    else if (this.run.status === 'won') this.#win();
  }

  #drain() {
    for (const e of this.run.events.splice(0)) {
      if (e === 'jump') audio.playSfx('jump');
      else if (e === 'throw') audio.playSfx('throwSpear');
      else if (e === 'kill') audio.playSfx('soldierDown');
    }
  }

  /** Make / move / remove the pictures for a list of game objects. */
  #sync(map, list, make, place) {
    const live = new Set(list);
    for (const [obj, view] of map) if (!live.has(obj)) { view.destroy(); map.delete(obj); }
    for (const obj of list) {
      let view = map.get(obj);
      if (!view) { view = make(obj); map.set(obj, view); }
      place(view, obj);
    }
  }

  #draw() {
    const run = this.run;
    if (this.sky) this.sky.tilePositionX = run.distance * 0.15 * 2;
    if (this.ground) this.ground.tilePositionX = run.distance * 2;

    // Rider: gallop frames on the ground, stretched out in the air.
    const y = HC.GROUND_Y + 4 - run.y;
    this.rider.setY(this.rider.type === 'Image' ? y : y - 31);
    if (this.rider.type === 'Image') {
      const frame = onGround(run) ? (Math.floor(run.distance / 45) % 2 ? 'horse-b' : 'horse-a') : 'horse-jump';
      if (hasTexture(this, propKey(frame))) this.rider.setTexture(propKey(frame));
    }

    this.#sync(this.views.obstacles, run.obstacles, (o) => {
      const key = propKey(o.prop);
      return hasTexture(this, key)
        ? this.add.image(0, HC.GROUND_Y + 4, key).setOrigin(0.5, 1).setScale(o.scale).setDepth(1)
        : this.add.rectangle(0, HC.GROUND_Y - o.h / 2, o.w, o.h, 0x5a4a3a).setDepth(1);
    }, (v, o) => { v.x = o.x - run.distance + o.w / 2; });

    // Soldiers (the dead ones fall over and fade, then are removed)
    this.#sync(this.views.soldiers, run.soldiers, (s) => {
      const key = propKey('soldier-a');
      return hasTexture(this, key)
        ? this.add.image(0, HC.GROUND_Y + 4, key).setOrigin(0.5, 1).setScale(0.5).setDepth(1)
        : this.add.rectangle(0, HC.GROUND_Y - s.h / 2, s.w, s.h, 0x5a1f2a).setDepth(1);
    }, (v, s) => {
      v.x = s.x - run.distance + s.w / 2;
      if (v.type === 'Image') {
        if (s.alive) v.setTexture(propKey(Math.floor((run.time + s.x / 90) * 5) % 2 ? 'soldier-b' : 'soldier-a'));
        else {
          const t = Math.min(1, (run.time - s.diedAt) / 0.5);
          v.setAngle(70 * t).setAlpha(1 - t).y = HC.GROUND_Y + 4 - 10 * t;
        }
      }
    });

    this.#sync(this.views.spears, run.spears, () => (hasTexture(this, propKey('spear'))
      ? this.add.image(0, 0, propKey('spear')).setOrigin(0, 0.5).setScale(0.5).setDepth(3)
      : this.add.rectangle(0, 0, 70, 6, 0xd9dce6).setOrigin(0, 0.5).setDepth(3)),
    (v, sp) => { v.x = sp.x - run.distance; v.y = HC.GROUND_Y - sp.y; });

    const kills = run.kills;
    this.scoreText.setText(this.arcade ? `Score ${scoreOf(run)}   Soldiers ${kills}` : `Soldiers stopped ${Math.min(kills, HC.TARGET_KILLS)} / ${HC.TARGET_KILLS}`);
  }

  #crash() {
    this.state = 'crashed';
    this.attempts += 1;
    audio.playSfx('crash');
    this.cameras.main.shake(180, 0.01);
    this.rider.setTint?.(0xff8a7a);
    this.lockUntil = this.time.now + 400;
    if (this.arcade) {
      const score = scoreOf(this.run);
      const { best, isNew } = saveBest('horse', score);
      this.bestText?.setText(`Best ${best}`);
      audio.playSfx('gameOver');
      this.#say(`Game over!  Score ${score}${isNew ? '  (new best!)' : ''}\nSoldiers stopped: ${this.run.kills}\nPress a key to ride again, or Quit.`);
    } else {
      const why = this.run.crashedBy === 'soldier' ? 'A soldier reached you!' : 'You hit an obstacle!';
      this.#say(`${why}\nPress a key to ride again.${this.attempts >= 2 ? '\nOr press Skip to go on.' : ''}`);
    }
  }

  #win() {
    if (this.leaving) return;
    this.state = 'won';
    audio.playSfx('arrive');
    this.#say('Victory! The Sosso army is beaten.');
    this.time.delayedCall(1100, () => this.#leave(true));
  }

  #leave() {
    if (this.leaving) return;
    this.leaving = true;
    if (this.arcade) this.scene.start('ArcadeScene');
    else this.scene.start('GameScene', this.data0.exitData ?? this.data0);
  }

  /** Same as pressing Skip / Quit. */
  skip() { this.#leave(); }

  /** For tests: win instantly. */
  debugWin() {
    this.#begin();
    this.run.kills = HC.TARGET_KILLS;
  }
}
