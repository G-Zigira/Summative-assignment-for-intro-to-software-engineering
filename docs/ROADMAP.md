# Roadmap and backlog

The SRS says the project follows an Agile model. Work in short iterations (1-2 weeks), each
ending with something playable that you test with real people. Dates are yours to set; the order
below is a suggestion that puts the riskiest things first.

## Iteration 0: starter (done)

- [x] Project setup: Vite, Phaser, Vitest, Playwright, CI, Pages deploy
- [x] Pure-logic systems with unit tests: storage, saving, unlocking, dialogue, settings, device
- [x] Content format and validator (FR 3.1, 3.4, 4.1, 4.2 checks)
- [x] Core loop in the browser: move, talk, choices, context panels, Codex, pause, save/continue
- [x] Storage-failure handling (FR 3.5) with tests
- [x] Touch controls with CSS-pixel-correct target sizes
- [x] Sample trail (3 scenes) and placeholder Trail 2

## Iteration 1: make it a real game

| # | Item | SRS | Notes |
|---|---|---|---|
| 1.1 | **Settings menu**: volume, text size, control scheme; persisted | FR 5.1, FR 2.2 | Logic exists in `systems/settings.js`. Add `SettingsScene`, call `persist()` on change, re-layout on text-size change. |
| 1.2 | **Tutorial scene**: move, interact, advance dialogue, open Codex | NFR 3 | The usability test measures this. Keep it to about 1 minute. |
| 1.3 | Real maps with Tiled; load tilemap JSON in `BootScene.preload()` | FR 1.1 | Replace rectangles. Keep `obstacles` working until then. |
| 1.6 | Travel minigame (runner) between areas | proposed FR 6.1 | Done in v0.3.0, see docs/MINIGAME.md. Add FR 6.1 to the SRS. |
| 1.4 | Character and NPC sprites; simple walk animation | | First pass done in v0.2.0 (generated art, docs/ART.md). Replace/improve over time. |
| 1.5 | Audio: music and effects; apply the volume setting | FR 5.1 | Hooks are in (`src/audio/`); fill the slots, see docs/AUDIO.md. Volume slider UI still to build. |
| 1.6 | Re-layout on resize / rotation | NFR 3 | Scenes read the canvas scale once at creation. |

## Iteration 2: real content

| # | Item | Notes |
|---|---|---|
| 2.1 | Choose Trail 1's topic and learning goals | Write them down first. Everything else follows. |
| 2.2 | Research and write Trail 1 (see [CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md)) | Keep sources in a spreadsheet next to the JSON. |
| 2.3 | Fact-check and sign off; set `review.status: "reviewed"` | Required before the pilot. |
| 2.4 | Codex entries for Trail 1 | 100 words or fewer each. |
| 2.5 | Playtest with 3-5 people and revise pacing and wording | |

## Iteration 3: quality

| # | Item | SRS |
|---|---|---|
| 3.1 | Add Firefox and WebKit to `playwright.config.js`; fix what breaks | NFR 5 |
| 3.2 | Measure load time and fps on the reference devices; optimise if needed | NFR 2, 7 |
| 3.3 | Contrast and text-size audit | NFR 3 |
| 3.4 | Usability test with 5+ first-time players; fix and retest | NFR 3 |
| 3.5 | e2e test for the Codex screen and the "couldn't save" message | FR 4.2, 3.5.2 |
| 3.6 | Reconcile FR 2.1 wording with the code (see [TRACEABILITY.md](TRACEABILITY.md)) | FR 2.1 |
| 3.7 | Keyboard focus and screen-reader basics (accessibility pass) | |

## Iteration 4: pilot readiness

| # | Item |
|---|---|
| 4.1 | Completion code on the trail-complete screen |
| 4.2 | Surveys and consent wording ([PILOT-PLAN.md](PILOT-PLAN.md)) |
| 4.3 | `npm run validate:content:release` passes; deploy to a stable URL |
| 4.4 | Comparison text version of Trail 1 |
| 4.5 | Start the 8-week pilot |

## Later ideas (not in version 1.0)

- More trails (the unlock chain already supports them)
- Multiple languages (FR 4.3): move all UI strings into a language file first
- Branching stories that really diverge (needs an SRS change: today every path rejoins the final scene)
- Larger worlds with several areas and exits between them
- Optional login or cloud save (would change NFR 1)

## How to work an iteration

1. Pick items; write each as a GitHub issue with its acceptance criterion copied from the SRS.
2. Branch, build, add tests, update [TRACEABILITY.md](TRACEABILITY.md).
3. `npm run check` and `npm run e2e` pass; open a pull request; CI must be green.
4. Merge, deploy, play it yourself, and show someone. Note what you learned for the next iteration.
5. Update the task tracker and the stand-up summary.
