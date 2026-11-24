import '@fontsource/marcellus/latin-400.css';
import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { TrailSelectScene } from './scenes/TrailSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { CodexScene } from './scenes/CodexScene.js';
import { RunnerScene } from './scenes/RunnerScene.js';
import { HorseScene } from './scenes/HorseScene.js';
import { BasketScene } from './scenes/BasketScene.js';
import { ArcadeScene } from './scenes/ArcadeScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { session } from './session.js';

const game = new Phaser.Game({
  type: Phaser.AUTO, // WebGL when available, canvas otherwise
  parent: 'game',
  width: CONFIG.GAME_WIDTH,
  height: CONFIG.GAME_HEIGHT,
  backgroundColor: '#14110f',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  input: { activePointers: 3 }, // D-pad + Talk button need multi-touch
  scene: [BootScene, TitleScene, TrailSelectScene, GameScene, PauseScene, CodexScene, RunnerScene, HorseScene, BasketScene, ArcadeScene, SettingsScene],
});

// Handy for debugging and for the end-to-end tests. Not exposed in production builds.
if (import.meta.env.DEV) {
  window.__game = game;
  window.__session = session;
}
