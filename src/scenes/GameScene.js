import Phaser from 'phaser';
import { addAmbient, fadeIn, AMBIENT_FOR_AREA } from '../ui/fx.js';
import { CONFIG } from '../config.js';
import { COLORS, AREA_COLORS } from '../ui/theme.js';
import { makeButton, makeText } from '../ui/button.js';
import { DialogueUI } from '../ui/dialogueUI.js';
import { TouchControls } from '../ui/touchControls.js';
import { session, persist, controlScheme } from '../session.js';
import { getTrail, getCodexEntry, TRAIL_ORDER } from '../content/index.js';
import { DialogueRunner } from '../systems/dialogue.js';
import { bgKey, propKey, spriteKey, hasTexture, ASSET_SCALE } from '../assets/manifest.js';
import { audio } from '../audio/audioManager.js';
import { completeTrail, unlockCodexEntries, recordChoice, collectFragment, completionCode } from '../systems/unlocks.js';

// The play scene: one story scene at a time. Walk, talk to the NPC, make choices,
// read context panels, unlock Codex entries, and save at the save points
// (docs/SAVE-DATA.md). All story rules live in systems/dialogue.js; this file is
// the Phaser glue. The player and NPC are invisible physics rectangles; their pictures
// (sprites) follow them. If a picture failed to load, the rectangle is shown instead.

const PLAYER_SIZE = 40;
const NPC_SIZE = 48;
const WALK_TOP = 170; // the back wall / horizon fills the top of every area picture
const DEFAULT_START = { x: 120, y: 270 };
const JustDown = Phaser.Input.Keyboard.JustDown;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.startData = data ?? {};
  }

  create() {
    const { GAME_WIDTH: W, GAME_HEIGHT: H } = CONFIG;
    const save = session.save;
    const resume = Boolean(this.startData.resume);

    // --- Which trail and scene? (defensive: content may have changed since the save) ---
    this.trail = getTrail(resume ? save.trailId : this.startData.trailId);
    if (!this.trail) {
      this.scene.start('TitleScene');
      return;
    }
    const wantedScene = resume ? save.sceneId : (this.startData.sceneId ?? this.trail.startScene);
    this.story =
      this.trail.scenes.find((s) => s.id === wantedScene) ??
      this.trail.scenes.find((s) => s.id === this.trail.startScene);
    const start = resume && save.position && this.story.id === wantedScene
      ? save.position
      : (this.story.playerStart ?? DEFAULT_START);

    session.save = { ...save, trailId: this.trail.id, sceneId: this.story.id, areaId: this.story.area };

    // --- World ---------------------------------------------------------------
    // The top of every area picture is a wall or the sky: people can only walk on the floor.
    // Bounds start PLAYER_SIZE above WALK_TOP so the character's feet can reach the wall's base but no higher.
    this.physics.world.setBounds(0, WALK_TOP - PLAYER_SIZE, W, H - WALK_TOP + PLAYER_SIZE);
    const bg = bgKey(this.story.area);
    if (hasTexture(this, bg)) this.add.image(W / 2, H / 2, bg).setScale(ASSET_SCALE).setDepth(-10);
    else if (hasTexture(this, bgKey('placeholder'))) this.add.image(W / 2, H / 2, bgKey('placeholder')).setScale(ASSET_SCALE).setDepth(-10);
    else this.add.rectangle(W / 2, H / 2, W, H, AREA_COLORS[this.story.area] ?? 0x2a2a2a).setDepth(-10);
    makeText(this, 16, 12, `${this.trail.title}  -  ${this.story.title}`, 16, {
      color: COLORS.text, backgroundColor: '#1f1a16cc', padding: { x: 8, y: 4 },
    }).setDepth(3);
    audio.playMusic(this.story.area);

    // World pictures are sorted by their feet (y), so things lower on screen draw in front.
    for (const p of this.story.props ?? []) this.#addProp(p.key, p.x, p.y, p.scale ?? 1);

    this.solids = this.physics.add.staticGroup();
    for (const o of this.story.obstacles ?? []) {
      const box = this.add.rectangle(o.x, o.y, o.w, o.h, 0x5a4a3a).setDepth(1);
      if (o.prop && this.#addProp(o.prop, o.x, o.y + o.h / 2, o.propScale ?? 1)) box.setAlpha(0);
      else box.setStrokeStyle(2, 0x8a7560);
      this.solids.add(box);
    }

    const npc = this.story.npc;
    this.npc = this.add.rectangle(npc.x, npc.y, NPC_SIZE, NPC_SIZE, 0xe0a030).setStrokeStyle(2, 0xffffff).setDepth(2);
    this.solids.add(this.npc);
    this.npcSprite = this.#addCharacter(npc.sprite ?? 'elder', this.npc, NPC_SIZE);
    if (this.npcSprite) this.npc.setAlpha(0);
    makeText(this, npc.x, npc.y - 78, npc.name, 16, {
      color: COLORS.accentText, backgroundColor: '#1f1a16cc', padding: { x: 6, y: 2 },
    }).setOrigin(0.5).setDepth(3);
    this.npc.setInteractive({ useHandCursor: true });
    this.npc.on('pointerup', () => this.#tryInteract()); // FR 1.2: click works on desktop

    // Story pieces: objects the player can touch (E / tap Talk / click) to read a short note.
    this.items = (this.story.items ?? []).map((it) => {
      const image = this.#addProp(it.prop, it.x, it.y, it.scale ?? 1);
      const found = (session.save.fragments ?? []).includes(it.id);
      const marker = found ? null : this.add.star(it.x, it.y - (image ? image.displayHeight : 40) - 14, 5, 5, 11, 0xffe08a)
        .setDepth(3).setStrokeStyle(2, 0xb07a1a);
      if (marker) this.tweens.add({ targets: marker, y: marker.y - 8, angle: 25, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      image?.setInteractive({ useHandCursor: true }).on('pointerup', () => this.#tryInteract());
      return { ...it, image, marker, found, cx: it.x, cy: it.y - 24 };
    });
    this.piecesText = makeText(this, 16, 44, '', 16, {
      color: COLORS.accentText, backgroundColor: '#1f1a16cc', padding: { x: 8, y: 4 },
    }).setDepth(3).setVisible(this.items.length > 0);
    this.#updatePieces();

    this.player = this.add.rectangle(start.x, start.y, PLAYER_SIZE, PLAYER_SIZE, 0xf5efe6).setDepth(2);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.solids);
    this.playerSprite = this.#addCharacter('player', this.player, PLAYER_SIZE);
    if (this.playerSprite) this.player.setAlpha(0);
    this.facing = 'down';

    // --- Controls ------------------------------------------------------------
    const kb = this.input.keyboard;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D');
    this.keys = kb.addKeys({
      interact: 'E', enter: 'ENTER', space: 'SPACE', esc: 'ESC',
      one: 'ONE', two: 'TWO', three: 'THREE', four: 'FOUR',
    });
    this.scheme = controlScheme(); // 'touch' | 'desktop' (FR 2.1)
    this.touch = this.scheme === 'touch' ? new TouchControls(this) : null;

    this.prompt = makeText(this, npc.x, npc.y - 104, this.scheme === 'touch' ? 'Tap Talk' : 'Press E to talk', 16, {
      color: COLORS.text, backgroundColor: '#1f1a16', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(3).setVisible(false);

    this.menuButton = makeButton(this, { width: 130, height: 48, label: 'Menu', fontSize: 18, depth: 4, onClick: () => this.#openPause() });
    this.menuButton.setPosition(W - 16 - this.menuButton.width / 2, 16 + this.menuButton.height / 2);

    // --- Story ---------------------------------------------------------------
    this.ui = new DialogueUI(this);
    this.runner = new DialogueRunner(this.trail);
    this.dialogueOpen = false;
    this.toasts = [];

    this.events.on('resume', () => {
      this.player.body.setVelocity(0, 0);
      Object.values(this.keys).forEach((k) => k.reset());
    });
    this.events.once('shutdown', () => this.touch?.destroy());

    // Atmosphere: lights that fit the place (see ui/fx.js). Purely visual.
    addAmbient(this, AMBIENT_FOR_AREA[this.story?.area] ?? 'dust', { top: WALK_TOP });
    fadeIn(this, 300);

    // Result of the autosave that happened just before this scene was restarted.
    if (this.startData.saveResult) this.#showSaveResult(this.startData.saveResult);
    // Coming back from the finale minigame: go straight to the trail-complete screen.
    if (this.startData.finaleDone) {
      this.dialogueOpen = true; // so Space / Enter work on the trail-complete message, as in a normal ending
      this.time.delayedCall(0, () => this.#finishScene({ kind: 'sceneEnd', trailComplete: true, nextSceneId: null }));
    }
  }

  update() {
    if (!this.player?.body) return;
    const body = this.player.body;

    if (this.dialogueOpen) {
      body.setVelocity(0, 0);
      this.#syncPlayerSprite({ x: 0, y: 0 });
      if (JustDown(this.keys.space) || JustDown(this.keys.enter)) this.ui.confirm?.();
      [this.keys.one, this.keys.two, this.keys.three, this.keys.four].forEach((key, i) => {
        if (JustDown(key)) this.ui.chooseByIndex(i);
      });
      return;
    }

    // FR 1.1: arrows or WASD (desktop), D-pad (touch). Movement starts and stops immediately.
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;
    if (this.touch) {
      dx += this.touch.direction.x;
      dy += this.touch.direction.y;
    }
    const v = new Phaser.Math.Vector2(Phaser.Math.Clamp(dx, -1, 1), Phaser.Math.Clamp(dy, -1, 1))
      .normalize()
      .scale(CONFIG.PLAYER_SPEED);
    body.setVelocity(v.x, v.y);
    this.#syncPlayerSprite(v);

    // FR 1.2: prompt when in range; E / Enter / Talk button starts the dialogue.
    const target = this.#nearestTarget();
    if (target) {
      const verb = target.kind === 'npc' ? 'talk' : 'look';
      this.prompt.setText(this.scheme === 'touch' ? 'Tap Talk' : `Press E to ${verb}`);
      this.prompt.setPosition(target.x, target.y - (target.kind === 'npc' ? 104 : (target.item.image?.displayHeight ?? 40) + 36));
    }
    this.prompt.setVisible(Boolean(target));
    const pressedE = JustDown(this.keys.interact);
    const pressedEnter = JustDown(this.keys.enter);
    const tappedTalk = this.touch ? this.touch.consumeInteract() : false;
    if (target && (pressedE || pressedEnter || tappedTalk)) this.#interactWith(target);

    if (JustDown(this.keys.esc)) this.#openPause();
  }

  // ------------------------------------------------------------------- pictures
  /** Draw a prop with its base (feet) at x,y. Returns the image, or null if the picture is missing. */
  #addProp(name, x, y, scale = 1) {
    const key = propKey(name);
    if (!hasTexture(this, key)) return null;
    return this.add.image(x, y, key).setOrigin(0.5, 1).setScale(ASSET_SCALE * scale).setDepth(y / 1000);
  }

  /** A character picture that stands on the bottom edge of its physics box. */
  #addCharacter(name, box, size) {
    const key = spriteKey(name);
    if (!hasTexture(this, key)) return null;
    const sprite = this.add.sprite(box.x, box.y + size / 2, key, 0).setOrigin(0.5, 1).setScale(ASSET_SCALE);
    sprite.setDepth((box.y + size / 2) / 1000);
    return sprite;
  }

  #syncPlayerSprite(v) {
    const sprite = this.playerSprite;
    if (!sprite) return;
    const moving = v.x !== 0 || v.y !== 0;
    if (moving) this.facing = Math.abs(v.x) > Math.abs(v.y) ? (v.x < 0 ? 'left' : 'right') : (v.y < 0 ? 'up' : 'down');
    sprite.setPosition(this.player.x, this.player.y + PLAYER_SIZE / 2);
    sprite.setDepth(sprite.y / 1000);
    if (moving) {
      sprite.anims.play(`player-${this.facing}`, true);
      audio.footstep(this.time.now);
    } else {
      sprite.anims.stop();
      sprite.setFrame(['down', 'left', 'right', 'up'].indexOf(this.facing) * 4);
    }
    // The NPC turns to face the player when close.
    if (this.npcSprite) {
      const dx = this.player.x - this.npc.x;
      const dy = this.player.y - this.npc.y;
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
      this.npcSprite.setFrame(dir * 4);
    }
  }

  // ---------------------------------------------------------------- interaction
  /** The closest thing the player can act on right now (the NPC or a story piece), or null. */
  #nearestTarget() {
    const { x, y } = this.player;
    let best = null;
    let bestD = Infinity;
    const consider = (kind, tx, ty, item) => {
      const d = Phaser.Math.Distance.Between(x, y, tx, ty);
      if (d <= CONFIG.INTERACT_RANGE && d < bestD) { best = { kind, x: tx, y: ty, item }; bestD = d; }
    };
    consider('npc', this.npc.x, this.npc.y);
    for (const it of this.items ?? []) consider('item', it.cx, it.cy + 24, it);
    return best;
  }

  #tryInteract() {
    if (this.dialogueOpen) return;
    const target = this.#nearestTarget();
    if (target) this.#interactWith(target);
  }

  #interactWith(target) {
    if (target.kind === 'npc') this.#startDialogue();
    else this.#readPiece(target.item);
  }

  #updatePieces() {
    const total = this.items.length;
    const found = this.items.filter((i) => i.found).length;
    this.piecesText.setText(`Story pieces ${found}/${total}`);
  }

  /** A touched object: a short note. The first time counts as a story piece (saved at the next save point). */
  #readPiece(item) {
    if (this.dialogueOpen) return;
    this.dialogueOpen = true;
    this.#setHudVisible(false);
    const first = !item.found;
    if (first) {
      const { save } = collectFragment(session.save, item.id);
      session.save = save;
      item.found = true;
      item.marker?.destroy();
      item.marker = null;
      audio.playSfx('collect');
      this.#updatePieces();
    } else audio.playSfx('click');
    this.ui.showMessage({
      title: `Story piece: ${item.title}`, text: item.text, context: true, buttonLabel: 'Close',
      onClose: () => {
        this.ui.hide();
        this.dialogueOpen = false;
        this.#setHudVisible(true);
        if (item.unlocksCodex?.length) this.#applyUnlocks(item.unlocksCodex);
        if (first) {
          const left = this.items.filter((i) => !i.found).length;
          this.#toast(left === 0 ? 'All story pieces here found!' : `Story piece found (${this.items.length - left}/${this.items.length})`, 2200, COLORS.accentText);
        }
      },
    });
  }

  #setHudVisible(visible) {
    this.prompt.setVisible(false);
    this.piecesText?.setVisible(visible && this.items.length > 0);
    this.touch?.setVisible(visible);
    this.menuButton.setVisible(visible);
  }

  #startDialogue() {
    if (this.dialogueOpen) return;
    this.dialogueOpen = true;
    audio.playSfx('talk');
    this.#setHudVisible(false);
    this.#handleStep(this.runner.startScene(this.story.id)); // FR 3.2.4: always from the first line
  }

  #handleStep(step) {
    this.#applyUnlocks(step.unlocks);

    if (step.kind === 'sceneEnd') {
      this.#finishScene(step);
      return;
    }
    const node = step.node;
    if (node.type === 'decision') {
      this.ui.showDecision(node, (optionId) => {
        audio.playSfx('choose');
        const { choice, step: next } = this.runner.choose(optionId);
        session.save = recordChoice(session.save, choice.decisionId, choice.optionId); // FR 3.2.2
        // FR 3.4: outcome text first, then the context panel (the next node), then the story continues.
        this.ui.showMessage({ text: choice.outcome, onClose: () => this.#handleStep(next) });
      });
    } else if (node.type === 'context') {
      this.ui.showContext(node, () => this.#handleStep(this.runner.advance()));
    } else {
      this.ui.showMessage({
        title: node.speaker, text: node.text, onClose: () => this.#handleStep(this.runner.advance()),
      });
    }
  }

  // ----------------------------------------------------------------- progression
  #applyUnlocks(ids) {
    if (!ids?.length) return;
    const { save, newIds } = unlockCodexEntries(session.save, ids); // FR 4.2.1: only once
    session.save = save;
    for (const id of newIds) {
      audio.playSfx('codexUnlock');
      this.#toast(`New Codex entry: ${getCodexEntry(id)?.title ?? id}`, CONFIG.CODEX_TOAST_MS, COLORS.accentText);
    }
  }

  #finishScene(step) {
    this.ui.hide();
    const next = step.trailComplete ? null : this.trail.scenes.find((s) => s.id === step.nextSceneId);

    if (!next && this.story.finale && !this.startData.finaleDone) {
      // The trail ends with a minigame (docs/MINIGAMES.md). Winning or skipping returns here and completes the trail.
      const done = { trailId: this.trail.id, sceneId: this.story.id, finaleDone: true };
      this.scene.start(this.story.finale === 'horse' ? 'HorseScene' : 'BasketScene', { ...done, exitData: done });
      return;
    }

    if (!next) {
      // SP-3: trail complete. Next trail unlocks, current scene is cleared.
      const result = completeTrail(session.save, this.trail.id, TRAIL_ORDER);
      session.save = result.save;
      this.#showSaveResult(this.#savePoint());
      audio.playMusic('trailComplete', { loop: false, keepIfMissing: true });
      const unlockedText = result.newlyUnlocked ? ' A new trail is unlocked.' : '';
      this.ui.showMessage({
        title: 'Trail complete!',
        text: `You finished "${this.trail.title}".${unlockedText}\nYour completion code: ${completionCode(session.save, this.trail)}`,
        buttonLabel: 'Back to trails',
        onClose: () => {
          this.ui.hide();
          this.scene.start('TrailSelectScene');
        },
      });
      return;
    }

    // SP-1 (scene complete) and SP-2 (area change) share one write.
    session.save = {
      ...session.save,
      trailId: this.trail.id, sceneId: next.id, areaId: next.area,
      position: next.playerStart ?? DEFAULT_START,
    };
    const saveResult = this.#savePoint();
    const data = { trailId: this.trail.id, sceneId: next.id, saveResult };
    // Moving to a new area = a journey: play the runner minigame first (docs/MINIGAME.md).
    // Progress was saved above, so quitting during the run resumes at the next scene.
    const travels = next.area !== this.story.area && this.story.travel !== false;
    if (travels) this.scene.start('RunnerScene', data);
    else this.scene.restart(data);
  }

  // ---------------------------------------------------------------------- saving
  /** @returns {{ok: boolean}|null} null when storage is unavailable (nothing to report) */
  #savePoint() {
    const result = persist();
    return result.skipped ? null : { ok: result.ok };
  }

  /** Called by PauseScene (FR 3.2.1 d). Refused while a dialogue is open. */
  manualSave() {
    if (this.dialogueOpen) return { ok: false, error: 'dialogue-open' };
    session.save = {
      ...session.save,
      trailId: this.trail.id, sceneId: this.story.id, areaId: this.story.area,
      position: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
    };
    return persist();
  }

  #showSaveResult(result) {
    if (!result) return;
    audio.playSfx(result.ok ? 'save' : 'error');
    this.#toast(
      result.ok ? 'Progress saved' : "Couldn't save your progress",
      result.ok ? CONFIG.SAVE_INDICATOR_MS : 3500,
      result.ok ? COLORS.accentText : COLORS.warning,
    );
  }

  #toast(message, ms, color) {
    const t = makeText(this, CONFIG.GAME_WIDTH / 2, 90 + this.toasts.length * 46, message, 18, {
      color, backgroundColor: '#1f1a16', padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setDepth(40);
    this.toasts.push(t);
    this.time.delayedCall(ms, () => {
      this.toasts = this.toasts.filter((x) => x !== t);
      t.destroy();
    });
  }

  #openPause() {
    if (this.dialogueOpen) return;
    this.player.body.setVelocity(0, 0);
    this.scene.launch('PauseScene');
    this.scene.bringToTop('PauseScene');
    this.scene.pause();
  }
}
