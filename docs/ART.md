# Art: how the pictures work

All pictures are **original, generated from code** (hand-authored SVG in `art-src/`, rendered with Chromium). They are placeholders good enough to ship the pilot with, and are designed to be swapped out.

| Folder (`public/assets/`) | Contents | Size |
|---|---|---|
| `backgrounds/` | `title`, `courtyard`, `wall-garden`, `road`, `placeholder` (.jpg) | 1920x1080, shown at 960x540. Top 340 px (170 game px) = back wall, the walkable floor is below. |
| `sprites/` | `player`, `elder`, `guide` (.png sheets) | 4x4 frames of 96x128: rows = down, left, right, up; columns = walk cycle. Shown at half size (48x64). |
| `props/` | `baobab stall pots drum carved-door bush rock signpost rug` (.png, transparent) | Drawn at 2x, shown at half size; the bottom-centre of the picture is its base. |
| `ui/` | `emblem.png` | 256x256 |

## Change a picture
- **Edit the code**: `art-src/characters.mjs`, `props.mjs`, `backgrounds.mjs`, colours in `palette.mjs`. Then `npx playwright install chromium` (once) and `npm run art` (or `npm run art -- baobab` for one picture).
- **Replace with your own art** (Procreate, Figma, Aseprite...): export a file with the *same name and size* into `public/assets/`. Do not re-run `npm run art` for it afterwards, or it will be overwritten.

## Use pictures in content (trail JSON)
```json
"npc": { "name": "Elder", "x": 700, "y": 300, "sprite": "elder" },
"props": [ { "key": "baobab", "x": 700, "y": 190 } ],          // x,y = where the base touches the ground
"obstacles": [ { "x": 420, "y": 270, "w": 120, "h": 80, "prop": "stall" } ]   // solid + drawn as a prop
```
Things lower on the screen draw in front. Props are decoration only; use `obstacles` for anything the player must not walk through. Keep people at y >= 190 (below the wall). `npm run validate:content` checks all names.

## Add a new prop / character / area
Add the drawing and register it (`PROPS`, `STYLES`, `BACKGROUNDS`), add its name to `src/assets/manifest.js`, run `npm run art`. A new area id with no background falls back to the grey `placeholder`.

If a picture file is missing the game still runs and shows plain shapes instead.

## Added in 0.6.0
- `art-src/places.mjs`: `kangaba-hall`, `forge`, `exile-plains`, `farm-village`, `village-square` (1920x1080 JPG, horizon at the top 345 px like the other areas). Build one with `node art-src/build-art.mjs forge`.
- `art-src/runner-themes.mjs`: for each theme `rt-<theme>-sky.jpg`, `rt-<theme>-ground.png`, and obstacles `rt-<theme>-a/b/c.png` (small about 130x90, medium about 150x110, tall about 120x280, drawn at 2x). Which theme plays where is in `src/assets/runnerThemes.js` (`AREA_THEME`). To add a theme: add art, add an entry in `RUNNER_THEMES`, map areas to it.
- Title screen: `title` in `art-src/backgrounds.mjs` (redrawn). Buttons and panels are drawn in code (`src/ui/button.js`, `src/ui/dialogueUI.js`); colours are in `src/ui/theme.js`.
- Effects (vignette, floating lights, fade) are in `src/ui/fx.js`; `AMBIENT_FOR_AREA` chooses the lights for each place.

## Added in 0.5.0
`art-src/battle.mjs`: props `horse-a`, `horse-b`, `horse-jump` (gallop frames), `soldier-a`, `soldier-b`, `spear`, `know-scroll`, `know-adinkra`, `know-light`, `bad-thorn`, `bad-stone`, `bad-vial`; background `battle-sky`. Build only these with `node art-src/build-art.mjs horse` (the argument filters by name) so pictures you replaced are not overwritten.

## Added in 0.4.0
Sprites: `griot`, `child`, `anansi`. Props: kora, iron-rod, anvil, tent, spears, wisdom-pot, web, fern, forest-tree, basket, calabash, campfire, cowrie, mortar. Backgrounds: forest, kirina, big-tree. Drawn in `art-src/more.mjs` and `characters.mjs`; registered in `build-art.mjs` and `src/assets/manifest.js`. All are placeholders in the same original style; replace by keeping file name and size.
