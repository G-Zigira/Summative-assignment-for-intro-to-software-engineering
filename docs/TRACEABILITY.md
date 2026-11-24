# Requirements traceability (SRS v1.1)

Every requirement, where it is implemented, how it is verified, and its status. Keep this file
up to date: it is the evidence for a reviewer that each requirement is testable and tested.

**Status key:** Done = implemented and automatically tested. Partial = some of it done.
Manual = needs a human or a device. To do = not started. Out of scope = not in version 1.0.

## Functional requirements

| ID | Requirement | Implementation | Verified by | Status |
|---|---|---|---|---|
| FR 1.1 | Move character (arrows/WASD, D-pad; stops on release; no walking through solids) | `GameScene.update()`, `config.PLAYER_SPEED` | e2e "arrow keys move the character; it stops" | Done. The 100 ms response time is not measured yet. |
| FR 1.2 | Interact within 1 tile; prompt; E / Enter / click / Talk | `GameScene.#inRange()`, `#startDialogue()` | e2e "no dialogue out of range, prompt and dialogue in range" | Done |
| FR 2.1 | Detect device type | `systems/device.js` | `tests/device-settings.test.js` | Done. **See deviation below.** |
| FR 2.2 | Switch control scheme; every desktop action has a touch equivalent | `ui/touchControls.js`, `session.controlScheme()` | e2e mobile test (touch controls present) | Partial. Switching in Settings needs the Settings menu. Touch has no Codex/Save shortcut, only the Menu button. |
| FR 3.1 | Dialogue shows speaker, text, Continue or 2-4 choices; no dead ends | `DialogueRunner`, `DialogueUI`, `validate.js` | dialogue tests, validator tests, e2e play-through | Done |
| FR 3.2.1 | Save at SP-1..SP-4; indicator within 1 s | `GameScene.#finishScene()`, `manualSave()`, `PauseScene` | e2e play-through (SP-1, SP-3), e2e manual save (SP-4) | Done |
| FR 3.2.2 | Save contains exactly the listed fields | `createNewSave()`, `validateSave()` | `saveManager.test.js` "exactly the documented fields", e2e save inspection | Done |
| FR 3.2.3 | Continue restores everything; within 3 s | `SaveManager.load()`, `GameScene.create()` | `saveManager.test.js` round trip, e2e reload + Continue | Done. The 3 s timing is not measured yet. |
| FR 3.2.4 | Mid-dialogue state not saved; resume starts the dialogue from line 1 | `DialogueRunner.startScene()` | `dialogue.test.js` "restarting a scene begins at the first line" | Done |
| FR 3.3 | Trail 1 unlocked at start; Trail N+1 after N; locked trails show a lock | `unlocks.completeTrail()`, `TrailSelectScene` | `unlocks.test.js`, e2e "completing a trail unlocks the next one" | Done |
| FR 3.4 | Choices never block progress; outcome + context panel; first/last option both finish | `DialogueRunner.choose()`, `validate.js`, `simulateRun()` | `dialogue.test.js` (first/last runs), `validate.test.js` | Done |
| FR 3.5.1 | Storage unavailable: notice, Continue/Save disabled, game playable | `SaveManager`, `TitleScene`, `PauseScene` | `storage.test.js`, `saveManager.test.js`, e2e "storage blocked" | Done |
| FR 3.5.2 | Write fails: retry once, message, keep playing, previous save kept | `SaveManager.write()`, `GameScene.#showSaveResult()` | `saveManager.test.js` (retry count, previous restored) | Done. The on-screen message is not covered by an e2e test. |
| FR 3.5.3 | Corrupt/incompatible save: no crash, offer New Game, overwrite only after confirm | `SaveManager.load()`, `TitleScene` | `saveManager.test.js`, e2e corrupt + wrong-version tests | Done |
| FR 4.1 | Context panel after each decision/key event; at most 80 words; closable | `DialogueUI.showContext()`, `validate.js` | validator tests (80-word rule, panel after choices) | Done. "A panel for every key event" is a content-review item. |
| FR 4.2.1 | Codex entry unlocks once, with a notification | `unlocks.unlockCodexEntries()`, `GameScene.#applyUnlocks()` | `unlocks.test.js`, e2e play-through | Done. The 1 s notification time is not measured yet. |
| FR 4.2.2 | Codex from pause menu or button; categories; at most 100 words | `CodexScene`, `validate.js` | validator test (100 words) | Partial. The Codex screen has no automated UI test. |
| FR 4.2.3 | Locked entries show a placeholder and count `n/total` | `CodexScene` | Manual | Manual |
| FR 4.3 | Multiple languages | None | n/a | Out of scope for 1.0 |
| FR 5.1 | Settings: volume, text size, controls, with defaults | `systems/settings.js` (logic only), `fontPx()` | `device-settings.test.js` | Partial. **No Settings menu yet**, and no audio, so volume has no effect. |

## Non-functional requirements

| ID | Requirement | Implementation / evidence | Status |
|---|---|---|---|
| NFR 1 | No accounts; save contains only the listed fields; no data leaves the device | No network code; `saveManager.test.js` checks the fields | Done |
| NFR 2 | Load in 5 s on 4G (9 Mbps / 170 ms); 30 fps average on reference devices | Production build is about 330 KB gzipped (Phaser chunk 318 KB), so the transfer takes well under a second at 9 Mbps | Manual. Measure on the reference devices, see [TESTING.md](TESTING.md). |
| NFR 3 | Usability: tutorial completion, rating, 48x48 px targets, 16 px text, 4.5:1 contrast | Targets: `ui/button.js` + e2e mobile test (Done). Text: base 20 px x 1.25 default scale. Contrast: palette chosen for it. | Partial. Tutorial and usability test not built yet. Contrast and 16 px text not formally measured. |
| NFR 4 | Same build on desktop and mobile; same behaviour | One build, one code path with an input adapter | Partial. e2e runs desktop and emulated phone; real-device comparison is manual. |
| NFR 5 | Latest two versions of Chrome, Firefox, Safari, Edge; Chrome Android; Safari iOS | Standard web APIs only | Partial. e2e runs Chromium only. Firefox/WebKit are a one-line config change. Safari/iOS manual. |
| NFR 6 | Windows 10+, macOS 12+, Linux, Android 10+, iOS 15+ | Static site | Manual |
| NFR 7 | Reference devices defined | Defined in the SRS | Manual. Acquire or borrow the devices. |
| NFR 8 | No crash or blank screen when storage fails; valid earlier save survives | `SaveManager`, `storage.js` | Done. See FR 3.5.x tests. |

## Deviation to resolve in the SRS

**FR 2.1** says a handheld device is detected when the primary pointer is coarse **and** the
screen is narrower than 1024 px. The code uses only "primary pointer is coarse". Reason: tablets
in landscape (for example an iPad at 1180 px wide) are wider than 1024 px but should still get
touch controls, and Section 3.1 of the SRS lists tablets as handheld devices. A touchscreen
laptop has a fine primary pointer, so it correctly gets desktop controls either way.
Suggested SRS wording: *"A handheld device is detected when the primary pointer is touch-based
(CSS media query `(pointer: coarse)`); otherwise the desktop scheme is used."* Update the
SRS, or change `systems/device.js` and its test; they should agree.

## Gaps the SRS implies that are not built

- Tutorial for the usability test ("move, interact, advance dialogue, open the Codex").
- A **completion code** on the trail-complete screen, which the hypothesis uses to confirm completion in the post-game survey. See [PILOT-PLAN.md](PILOT-PLAN.md).
- Settings menu (FR 5.1).

## Added in 0.5.0
| Requirement | Where |
|---|---|
| Minigames (suggested FR 6.2) | `horse.js`, `basket.js`, `arcade.js`, `tests/horse.test.js`, `tests/basket.test.js`, `tests/arcade.test.js`, `e2e/minigames.spec.js` |
| Finale minigames in the trails | `finale` in trail2/trail3 JSON, e2e playthroughs |

## Added in 0.4.0
| Requirement | Where |
|---|---|
| FR 5.1 Settings (volume, text size, controls) | `SettingsScene`, `settings.js`, e2e "settings" |
| Trails 2 and 3, tutorial trail | `src/data/trails/trail2.json`, `trail3.json`, e2e playthroughs |
| Story pieces (suggested FR) | `items`, `tests/items.test.js`, e2e "story piece" |
| Completion code | `unlocks.js completionCode`, tests |
| Double jump / cowries (suggested FR 6.1 AC 7) | `runner.js`, `tests/runner.test.js` |
