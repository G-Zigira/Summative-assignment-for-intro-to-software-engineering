import { MUSIC, SFX, AUDIO_FORMATS } from './audioManifest.js';
import { session } from '../session.js';
import { CONFIG } from '../config.js';

// Plays music and sound effects. Every call is safe when a slot is empty (null), when a file
// failed to load, or when the browser has not unlocked audio yet: it simply does nothing.
// The player's volume setting (save.settings.volume, 0-100) is applied to everything.

const FADE_MS = 600;
const MUSIC_BASE_VOLUME = 0.6; // music sits under effects
const musicKey = (slot) => `music-${slot}`;
const sfxKey = (slot) => `sfx-${slot}`;

class AudioManager {
  constructor() {
    this.game = null;
    this.current = null; // { slot, sound }
    this.pending = null; // music slot requested while the browser still blocks audio
    this.lastStep = 0;
  }

  /** Queue the files listed in audioManifest.js. Called from BootScene.preload(). */
  preload(scene) {
    const urls = (name) => AUDIO_FORMATS.map((ext) => `assets/audio/${name}.${ext}`);
    for (const [slot, name] of Object.entries(MUSIC)) if (name) scene.load.audio(musicKey(slot), urls(name));
    for (const [slot, name] of Object.entries(SFX)) if (name) scene.load.audio(sfxKey(slot), urls(name));
  }

  init(game) {
    this.game = game;
    // Browsers block sound until the first tap/click. When that happens, start the waiting music.
    const unlock = () => { if (this.pending) this.playMusic(this.pending); };
    game.sound?.once?.('unlocked', unlock);
  }

  get volume() {
    const v = session.save?.settings?.volume;
    return (typeof v === 'number' ? v : CONFIG.VOLUME_DEFAULT) / 100;
  }

  #has(key) {
    return Boolean(this.game?.cache?.audio?.exists(key));
  }

  /** Start looping music for a slot (e.g. 'title' or an area id). Same track = keep playing. */
  playMusic(slot, { loop = true, keepIfMissing = false } = {}) {
    if (!this.game) return;
    const key = musicKey(slot);
    if (keepIfMissing && !this.#has(key)) return; // e.g. no jingle supplied: leave the current music alone
    if (this.current?.slot === slot && this.current.sound?.isPlaying) return;
    this.stopMusic();
    if (!this.#has(key)) return; // empty slot: silence
    if (this.game.sound.locked) { this.pending = slot; return; }
    this.pending = null;
    const sound = this.game.sound.add(key, { loop, volume: 0 });
    sound.play();
    this.#fade(sound, this.volume * MUSIC_BASE_VOLUME, FADE_MS);
    this.current = { slot, sound };
  }

  stopMusic() {
    const old = this.current;
    this.current = null;
    if (!old?.sound) return;
    this.#fade(old.sound, 0, FADE_MS, () => old.sound.destroy());
  }

  /** Smooth volume change driven by the game loop (not a scene, which may be stopped). */
  #fade(sound, to, ms, onDone) {
    const from = sound.volume ?? 0;
    let elapsed = 0;
    const tick = (_time, delta) => {
      elapsed += delta;
      const k = Math.min(1, elapsed / ms);
      if (sound.manager) sound.setVolume(from + (to - from) * k);
      if (k >= 1 || !sound.manager) {
        this.game.events.off('step', tick);
        onDone?.();
      }
    };
    this.game.events.on('step', tick);
  }

  /** Play a one-off sound effect by slot name. */
  playSfx(slot) {
    if (!this.game) return;
    const key = sfxKey(slot);
    if (!this.#has(key) || this.game.sound.locked) return;
    this.game.sound.play(key, { volume: this.volume });
  }

  /** Walking sound, rate-limited. Call every frame while the player moves. */
  footstep(now) {
    if (now - this.lastStep < 300) return;
    this.lastStep = now;
    this.playSfx('footstep');
  }

  /** Re-apply the volume setting to the music that is playing (call after the setting changes). */
  refreshVolume() {
    if (this.current?.sound) this.current.sound.setVolume(this.volume * MUSIC_BASE_VOLUME);
  }
}

export const audio = new AudioManager();
