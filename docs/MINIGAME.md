# Travel minigame: the runner

When the story moves to a **new area** (for example courtyard -> wall garden), the player runs there in a short Chrome-dinosaur-style game: the character runs by itself, and the **action button jumps** over rocks, bushes and trees. Reaching **250 points** arrives at the next scene.

## Controls (no extra buttons)
| Device | Jump |
|---|---|
| Keyboard | Space, E, Enter, Up or W (the same action keys as talking) |
| Mouse | Click anywhere |
| Touch | Tap anywhere, or the Jump button (bottom right, where Talk is) |

The first press starts the run. After tripping, the same press tries again. **Skip** (top right) always works, so nobody is stuck: the game is for fun, not a gate.

## Rules (all numbers in `src/config.js` -> `RUNNER`)
- Score = distance run / 25 px. Target 250 points, about 15 seconds.
- Speed rises from 320 to 620 px/s. Tall trees only appear after the first few seconds.
- Obstacles are spaced so a jump always clears them with time to land (checked by tests with a bot over 25 random runs).
- Tripping restarts the score; there is no limit on tries. After 2 trips a hint points to Skip.

## When does it play?
Only when the next scene has a different `area` than the current one. To turn it off after a particular scene, add `"travel": false` to that scene in the trail JSON. It never plays at the end of a trail.

## Saving
The save point (SP-1/SP-2) is written **before** the run starts. If the player quits during the run, Continue resumes at the next scene. Dying or skipping never loses progress.

## Where the code is
`src/systems/runner.js` (rules, no Phaser, unit tested in `tests/runner.test.js`), `src/scenes/RunnerScene.js` (drawing + input), `art-src/runner.mjs` (backdrop and ground; obstacles reuse the rock, bush and baobab props). Sound slots: `MUSIC.runner`, `SFX.jump`, `SFX.crash`, `SFX.arrive` (docs/AUDIO.md).

## Tune the difficulty
Easier: lower `START_SPEED` / `MAX_SPEED` / `TARGET_SCORE`, raise `MIN_GAP_AIRTIME`. Harder: the opposite. Run `npx vitest run tests/runner.test.js` afterwards; it fails if the game becomes unwinnable.

## Suggested SRS addition (so it is testable like the rest)
**FR 6.1 Travel minigame.** When the story moves to a new area, the game shows a running minigame.
- AC 1: The character jumps when the action button, a tap or a click is used; no other control is needed.
- AC 2: Reaching 250 points ends the minigame and loads the next scene within 2 s.
- AC 3: Tripping on an obstacle restarts the minigame; the player can retry without limit.
- AC 4: A Skip control is always visible and loads the next scene immediately.
- AC 5: Progress is saved before the minigame starts; leaving it never loses progress.
- AC 6: On touch devices the Jump button is at least 48 x 48 CSS px (NFR 3) and the game holds 30 fps on the reference device (NFR 1).
Add it to the SRS and to docs/TRACEABILITY.md when you decide to keep it.
