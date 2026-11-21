import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { COLORS } from '../ui/theme.js';
import { makeButton, makeText, minTarget } from '../ui/button.js';
import { controlScheme } from '../session.js';
import { getTrail } from '../content/index.js';
import { propKey, spriteKey, hasTexture } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';
import { createRun, step, jump, scoreOf, onGround } from '../systems/runner.js';

// Travel minigame, shown when the story moves to a new area. The player runs and jumps over
// rocks, bushes and trees (like the Chrome dinosaur game). Reaching the target score arrives
// at the next area. Jump = the action button (Space / E / Enter / Up / W), a tap, or the
// on-screen Jump button. A Skip button is always there, so the game never blocks on it.
// The rules live in systems/runner.js; this file draws them. Docs: docs/MINIGAME.md.

const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
const R = CONFIG.RUNNER;
const SPRITE_SCALE = 0.6;
const JustDown = Phaser.Input.Keyboard.JustDown;

export class RunnerScene extends Phaser.Scene {
  constructor() {
    super('RunnerScene');
  }

  init(data) {
    this.nextData = data ?? {};
  }

  create() {
    const { trailId, sceneId } = this.nextData;
    const trail = getTrail(trailId);
    const next = trail?.scenes.find((s) => s.id === sceneId);
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.attempts = 0;
    this.state = 'ready'; // 'ready' | 'running' | 'crashed' | 'won'
    this.run = createRun(Math.floor(Math.random() * 1e9));
    this.obstacleViews = [];
    this.lockUntil = 0;
    this.leaving = false; // scene objects are reused by Phaser, so reset every field here

    // --- Scenery ---------------------------------------------------------------
    if (hasTexture(this, 'runner-sky')) {
      this.sky = this.add.tileSprite(0, 0, W, H, 'runner-sky').setOrigin(0).setTileScale(0.5).setDepth(-10);
    } else this.add.rectangle(W / 2, H / 2, W, H, 0x4a2a52).setDepth(-10);
    if (hasTexture(this, 'runner-ground')) {
      this.ground = this.add.tileSprite(0, H - 100, W, 100, 'runner-ground').setOrigin(0).setTileScale(0.5).setDepth(-5);
    } else this.add.rectangle(W / 2, H - 50, W, 100, 0x9a6a3c).setDepth(-5);

    // --- Runner ----------------------------------------------------------------
    const key = spriteKey('player');
    if (hasTexture(this, key)) {
      this.player = this.add.sprite(R.PLAYER_X, R.GROUND_Y, key, 8).setOrigin(0.5, 1).setScale(SPRITE_SCALE).setDepth(2);
    } else {
      this.player = this.add.rectangle(R.PLAYER_X, R.GROUND_Y - 25, 26, 50, 0xf5efe6).setDepth(2);
    }

    // --- HUD -------------------------------------------------------------------
    const label = (t, x, y, size, style = {}) => makeText(this, x, y, t, size, {
      backgroundColor: '#1f1a16cc', padding: { x: 8, y: 4 }, ...style,
    }).setDepth(10);
    this.scoreText = label('Score 0 / ' + R.TARGET_SCORE, 16, 12, 18);
    label(next ? `Travelling to: ${next.title}` : 'Travelling...', 16, 54, 16, { color: COLORS.accentText });
    this.barBg = this.add.rectangle(W / 2, 20, 240, 12, 0x000000, 0.6).setStrokeStyle(2, COLORS.border).setDepth(10);
    this.bar = this.add.rectangle(W / 2 - 118, 20, 4, 8, COLORS.accent).setOrigin(0, 0.5).setDepth(11);

    this.skipButton = makeButton(this, { width: 130, height: 48, label: 'Skip', fontSize: 18, depth: 12, onClick: () => this.#arrive(false) });
    this.skipButton.setPosition(W - 16 - this.skipButton.width / 2, 16 + this.skipButton.height / 2);

    const touch = controlScheme() === 'touch';
    this.message = makeText(this, W / 2, 190, '', 28, {
      fontStyle: 'bold', align: 'center', color: COLORS.text, backgroundColor: '#1f1a16dd', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(15);
    this.#say(touch ? 'Tap to jump over the trees.\nTap to start!' : 'Press Space (or E) to jump over the trees.\nPress it to start!');

    if (touch) {
      const size = Math.max(72, minTarget(this));
      const w = Math.max(size * 1.6, 140);
      this.jumpButton = makeButton(this, { width: w, height: size, label: 'Jump', fontSize: 28, depth: 12, onClick: () => {} });
      this.jumpButton.setPosition(W - 24 - w / 2, H - 24 - size / 2);
      this.jumpButton.bg.off('pointerup'); // act on press, not release
      this.jumpButton.bg.on('pointerdown', () => this.#action());
    }

    // --- Input: the action button jumps ----------------------------------------
    const kb = this.input.keyboard;
    this.keys = kb.addKeys({ space: 'SPACE', e: 'E', enter: 'ENTER', up: 'UP', w: 'W' });
    this.input.on('pointerdown', (_p, over) => { if (over.length === 0) this.#action(); });

    audio.playMusic('runner', { keepIfMissing: true });
  }

  /** Jump, start, or retry, depending on the state. */
  #action() {
    if (this.time.now < this.lockUntil) return;
    if (this.state === 'ready') {
      this.state = 'running';
      this.message.setVisible(false);
      this.#jump();
    } else if (this.state === 'running') this.#jump();
    else if (this.state === 'crashed') this.#retry();
  }

  #jump() {
    if (jump(this.run)) audio.playSfx('jump');
  }

  #retry() {
    this.run = createRun(Math.floor(Math.random() * 1e9));
    this.obstacleViews.forEach((v) => v.destroy());
    this.obstacleViews = [];
    this.state = 'running';
    this.message.setVisible(false);
    this.player.clearTint?.();
  }

  #say(text) {
    this.message.setText(text).setVisible(true);
  }

  update(_time, delta) {
    const pressed = Object.values(this.keys).some((k) => JustDown(k));
    if (pressed) this.#action();

    if (this.state === 'running') {
      let left = Math.min(delta, 50) / 1000;
      while (left > 0) { // small fixed steps keep jumps and hits consistent on slow devices
        const dt = Math.min(left, 1 / 60);
        step(this.run, dt);
        left -= dt;
      }
      this.#draw();
      if (this.run.status === 'crashed') this.#crash();
      else if (this.run.status === 'won') this.#arrive(true);
    }
  }

  #draw() {
    const run = this.run;
    if (this.sky) this.sky.tilePositionX = run.distance * 0.15 * 2;
    if (this.ground) this.ground.tilePositionX = run.distance * 2;

    // Runner
    const y = R.GROUND_Y - run.y;
    this.player.setY(this.player.type === 'Sprite' ? y : y - 25);
    if (this.player.anims) {
      if (onGround(run)) this.player.anims.play('player-right', true);
      else { this.player.anims.stop(); this.player.setFrame(9); }
    }

    // Obstacles: make a picture for each new one, move them, remove the old ones.
    const live = new Set(run.obstacles);
    this.obstacleViews = this.obstacleViews.filter((v) => {
      if (!live.has(v.obstacle)) { v.destroy(); return false; }
      return true;
    });
    for (const o of run.obstacles) {
      let view = this.obstacleViews.find((v) => v.obstacle === o);
      if (!view) {
        const key = propKey(o.prop);
        view = hasTexture(this, key)
          ? this.add.image(0, R.GROUND_Y + 4, key).setOrigin(0.5, 1).setScale(o.scale).setDepth(1)
          : this.add.rectangle(0, R.GROUND_Y - o.h / 2, o.w, o.h, 0x5a4a3a).setDepth(1);
        view.obstacle = o;
        this.obstacleViews.push(view);
      }
      view.x = o.x - run.distance + o.w / 2;
    }

    // HUD
    const score = Math.min(scoreOf(run), R.TARGET_SCORE);
    this.scoreText.setText(`Score ${score} / ${R.TARGET_SCORE}`);
    this.bar.width = Math.max(4, 236 * (score / R.TARGET_SCORE));
  }

  #crash() {
    this.state = 'crashed';
    this.attempts += 1;
    audio.playSfx('crash');
    this.cameras.main.shake(180, 0.01);
    this.player.setTint?.(0xff8a7a);
    this.player.anims?.stop();
    this.lockUntil = this.time.now + 350; // so a late key press does not skip the message
    const hint = this.attempts >= 2 ? '\nOr press Skip to go on.' : '';
    this.#say(`You tripped!\nPress jump to try again.${hint}`);
  }

  #arrive(won) {
    if (this.leaving) return;
    this.leaving = true;
    if (won) {
      this.state = 'won';
      audio.playSfx('arrive');
      this.#say('You made it!');
      this.time.delayedCall(900, () => this.#go());
    } else this.#go();
  }

  #go() {
    this.scene.start('GameScene', this.nextData);
  }

  /** Same as pressing Skip. */
  skip() {
    this.#arrive(false);
  }

  /** For tests: finish the run instantly. */
  debugWin() {
    this.state = 'running';
    this.message.setVisible(false);
    this.run.distance = R.TARGET_SCORE * R.PX_PER_POINT - 1;
  }
}
