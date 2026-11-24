# Changing the sounds and music: step by step

Everything you hear is a plain **mp3 file** in `public/assets/audio/`. The game plays the file whose name is listed in `src/audio/audioManifest.js`. So "changing a sound" = putting a different mp3 under the same name.

## 1. Replace one sound (the easy way)

1. Get your sound as an mp3 (or wav/ogg/m4a; the tool converts it if ffmpeg is installed).
2. Open a terminal in the project folder and run:
   ```
   npm run audio:list
   ```
   You will see every slot, for example `sfx  crash  crash  placeholder (generated)`. The first name (`crash`) is the **slot**.
3. Put your file in that slot:
   ```
   npm run audio:set -- ~/Downloads/my-boom.mp3 crash
   ```
   (On Windows: `npm run audio:set -- C:\Users\you\Downloads\my-boom.mp3 crash`)
4. Reload the game in the browser (Ctrl+Shift+R). Done. `npm run audio:list` now shows `YOURS` next to it.

## 2. Replace one sound by hand (no commands)

1. Look at the table below and find the **file name** for what you want to change (for example `crash`).
2. Rename your mp3 to exactly that name: `crash.mp3`.
3. Copy it into `public/assets/audio/` and choose "Replace". Reload the game with Ctrl+Shift+R.

If you are running `npm run dev`, the page reloads by itself. If the old sound still plays, the browser kept a copy: hard-reload (Ctrl+Shift+R).

## 3. Use a different background music for a place

Background music is chosen by **where you are** (the `area` of the scene). The slots are the area names:

| Slot | Where it plays | File |
|---|---|---|
| `title` | Title screen, trail select, Mini Games menu, Codex | `title-theme` |
| `courtyard` | Tutorial: the courtyard | `courtyard-loop` |
| `wall-garden` | Tutorial and others: the wall garden | `wall-garden-loop` |
| `road` | Tutorial: the road | `road-loop` |
| `kangaba-hall` | Lion's Path 1: Kangaba hall | `kangaba-hall-loop` |
| `forge` | Lion's Path 2: the forge | `forge-loop` |
| `exile-plains` | Lion's Path 3: the exile | `exile-plains-loop` |
| `kirina` | Lion's Path 4: Kirina | `kirina-loop` |
| `forest` | Web of Wisdom 1: the forest | `forest-loop` |
| `farm-village` | Web of Wisdom 2: the farms | `farm-village-loop` |
| `big-tree` | Web of Wisdom 3: the big tree | `big-tree-loop` |
| `village-square` | Web of Wisdom 4: the square | `village-square-loop` |
| `runner` | Running minigame | `runner-loop` |
| `horse` | Horse Charge | `horse-loop` |
| `basket` | Wisdom Catch | `basket-loop` |
| `trailComplete` | Short sting when a trail ends | `trail-complete` |

Example: `npm run audio:set -- ~/Music/kirina-battle.mp3 kirina`.

**Want one track for the whole game?** Set the same file for several slots: open `src/audio/audioManifest.js` and change the names after the colons, e.g. `forge: 'kirina-loop',`. Then replace that one file. (The tool warns you when several slots share a file.)

**Want silence in a place?** Change its line to `forge: null,`.

Tips for music: it **loops**, so pick a track that starts and ends smoothly; 60 to 120 seconds is plenty; keep files under about 1.5 MB so the game loads fast. mp3 can leave a tiny gap at the loop point; if that bothers you, put a matching `.ogg` next to it and set `AUDIO_FORMATS = ['ogg', 'mp3']` at the bottom of `audioManifest.js`.

## 4. Sound effects

| Slot | When it plays | File |
|---|---|---|
| `click` | Any button press | `click` |
| `talk` | Starting a conversation | `talk` |
| `choose` | Picking a dialogue option | `choose` |
| `codexUnlock` | "New Codex entry" | `codex-unlock` |
| `save` / `error` | Progress saved / could not save | `save`, `error` |
| `footstep` | Walking | `footstep` |
| `textBlip` | Story text appearing letter by letter | `text-blip` |
| `collect` | Story piece or cowrie collected, knowledge caught | `collect` |
| `jump` / `doubleJump` | Runner and Horse Charge jumps | `jump`, `double-jump` |
| `crash` | Tripped or hit | `crash` |
| `arrive` | Minigame won | `arrive` |
| `throwSpear` | Horse Charge: spear thrown | `throw-spear` |
| `soldierDown` | Horse Charge: soldier stopped | `soldier-down` |
| `badCatch` | Wisdom Catch: caught a bad thing | `bad-catch` |
| `gameOver` | Arcade run ended | `game-over` |

Short effects work best: under 1 second, except `arrive` and `gameOver` (about 1 to 2 seconds). Very loud files can be annoying; the in-game Volume setting scales everything.

## 5. Adding a brand-new sound

1. Put `my-sound.mp3` in `public/assets/audio/`.
2. In `src/audio/audioManifest.js` add a line to `SFX`, e.g. `drumHit: 'my-sound',`.
3. In the scene code where it should play, call `audio.playSfx('drumHit');` (see how `GameScene.js` plays `'talk'`).

## 6. If something goes wrong

- **No sound at all:** browsers only start audio after the first click or key press. Click once in the game.
- **A slot is silent:** run `npm run audio:list`; a slot marked `MISSING` has no mp3 with that name.
- **My file is not mp3:** the tool converts wav/ogg/m4a/flac when ffmpeg is installed; otherwise use any online "to mp3" converter.
- **Go back to the placeholders:** `npm run audio` regenerates the original synthesized sounds for the original slots (it overwrites files with those names, so only do this if you want to reset them).
- **Copyright:** only use sounds you made or that are licensed for games. Add each one to `docs/CREDITS.md`.
