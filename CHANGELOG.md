# Changelog

All notable changes to this project are recorded here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow the SRS revision where it makes sense.

## [Unreleased]

## [0.5.0] - 2026-11-24

### Added
- **Mini Games** menu on the title screen: play Savanna Run, Horse Charge or Wisdom Catch endlessly until you fail or quit. Best scores are kept on the device (separate storage key, not in the save file)
- **Horse Charge** (Sundiata's battle): a rider gallops, the action buttons jump and throw spears at soldiers; a soldier you do not stop, or an obstacle you do not jump, ends the run. It is now the finale of The Lion's Path
- **Wisdom Catch** (Anansi): move a basket to catch falling knowledge (+1 shell) and dodge bad things (-3 shells). It is now the finale of The Web of Wisdom
- Trail scenes can set `"finale": "horse"` or `"basket"` on the final scene; skipping is always possible
- New art (rider, soldiers, spear, battle sky, 3 knowledge and 3 bad items), new music (`horse-loop`, `basket-loop`) and effects (`throw-spear`, `soldier-down`, `bad-catch`, `game-over`)
- Unit tests for both minigames (bots must win 23/25 and 22/25 random rounds) and the best-score store; browser tests for the menu and both games

### Changed
- Title menu: Mini Games button added below Settings
- The runner has an endless arcade mode (no target, Quit instead of Skip, game over with best score)

## [0.4.0] - 2026-11-24

### Added
- Two new trails: **The Lion's Path** (Sundiata, 4 scenes) and **The Web of Wisdom** (Anansi, 4 scenes). Both are drafts (`review.status: "sample"`) and need fact-checking before release. Trail 1 is now the **Tutorial**
- Story pieces: touchable objects in each scene (star marker, E / tap / click) that reveal a piece of the story; collected pieces are saved and counted (HUD, trail select). Optional, never required to progress
- Completion code (`SK-<order>-<xxxx>`) shown when a trail is finished
- Double jump in the runner (jump again in mid-air); cowrie shells to collect for bonus points
- Settings screen (volume, text size, controls) from Title and Pause; saved with the game
- Typewriter text in dialogue (first press completes the line, second advances)
- Synthesized music and sound effects (`npm run audio`), wired to every slot; new art (6 characters, 14 props, 3 backgrounds)
- New areas: forest, kirina, big-tree. 18 new Codex entries (21 total)

### Fixed
- The character could walk up into the sky/wall; walking is now limited to the ground
- A tall tree in the runner could not be jumped; the double jump clears it (and tests check it)

### Changed
- Save format gains an optional `fragments` list; older saves still load
- Pause and Title menus re-spaced for the Settings button

## [0.3.0] - 2026-11-21

### Added
- Travel minigame: moving to a new area plays a Chrome-dino-style runner (jump over rocks, bushes and trees with the action button, tap or click). Reach 250 points to arrive; Skip is always available. See docs/MINIGAME.md
- Runner rules as pure logic with 10 unit tests (including a bot that must win 23 of 25 random runs); 3 new browser tests
- Runner backdrop and ground art, audio slots `MUSIC.runner`, `SFX.jump`, `SFX.crash`, `SFX.arrive`
- Optional `"travel": false` on a scene to turn the minigame off after it

## [0.2.0] - 2026-11-12

### Added
- Original art generated from code (`npm run art`): title/area backgrounds, player + Elder + Guide walk-cycle sprites, 9 props, emblem. See docs/ART.md
- Asset manifest, loading bar, walk animations; scenes draw backgrounds, props and sprites (shapes remain as fallback if a file is missing)
- Trail JSON: optional `npc.sprite`, `props`, `obstacles[].prop`; validator checks the names and keeps people off the back wall
- Audio hooks with empty slots (`src/audio/audioManifest.js`), AudioManager (autoplay unlock, volume setting, crossfade) and docs/AUDIO.md

### Fixed
- Saving: after Quit to Title, Continue was missing/stale and unsaved progress leaked into the next session. Title now reloads the last save point; a successful write marks the save as valid.

## [0.1.0] - 2026-11-10

### Added
- Project scaffold: Vite, Phaser 3, Vitest, Playwright, GitHub Actions CI and Pages deploy
- Pure-logic systems with unit tests: safe storage, save manager, unlocks, dialogue engine, settings, device detection
- Content format, sample Trail 1 (placeholder), placeholder Trail 2, three Codex entries
- Content validator implementing the SRS content acceptance criteria
- Scenes: Boot, Title, Trail select, Game, Pause, Codex
- Desktop and touch controls with CSS-pixel-correct target sizes
- Storage-failure handling: blocked, full, corrupt and incompatible saves
- Documentation: architecture, content schema, save data, traceability, testing, pilot plan, roadmap, ADRs
