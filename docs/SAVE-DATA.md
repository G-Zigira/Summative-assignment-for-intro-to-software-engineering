# Save data

Implements FR 3.2.1 to 3.2.4 and FR 3.5.1 to 3.5.3 (SRS v1.1, Section 4.2). Code:
`src/systems/saveManager.js`, `src/systems/storage.js`, `src/session.js`.

## Where it is stored

One JSON string in the browser's `localStorage` under the key `sankofa-trails/save`.
Nothing is sent over the network and no personal data is stored (NFR 1).

## The save record (FR 3.2.2)

```jsonc
{
  "version": 1,                        // SAVE_VERSION in config.js
  "savedAt": "2026-11-10T10:00:00.000Z",
  "trailId": "trail1",                 // null when between trails
  "sceneId": "t1-s2",
  "areaId": "wall-garden",
  "position": { "x": 120, "y": 140 },  // null when between trails
  "unlockedTrails": ["trail1", "trail2"],
  "completedTrails": ["trail1"],
  "unlockedCodex": ["codex-sankofa", "codex-adinkra"],
  "choices": [{ "decisionId": "t1-s1-d1", "optionId": "b" }],
  "settings": { "volume": 70, "textSize": "medium", "controlScheme": "auto" }
}
```

A unit test asserts that a new save has exactly these fields and no others.

## Save points (FR 3.2.1)

| Point | When | What changes in the save | Continue returns to |
|---|---|---|---|
| **SP-1** Scene complete | The last line of a scene (and its context panel) is finished | `sceneId` and `areaId` = next scene; `position` = that scene's `playerStart` | The start of the next scene |
| **SP-2** Area change | The next scene is in a different `area` | Same write as SP-1 | The start of the new area |
| **SP-3** Trail complete | The final scene is finished | Trail added to `completedTrails`; next trail added to `unlockedTrails`; `trailId`, `sceneId`, `areaId`, `position` set to `null` | The trail-selection screen |
| **SP-4** Manual save | **Save** in the pause menu (not available during a dialogue) | `position` = where the player stands | The same position in the same scene |

Choices and Codex unlocks are held in memory as they happen and written at the next save point.

A "Progress saved" message shows for 2 seconds after each successful automatic save; the pause menu shows it after a manual save.

## What is not saved (FR 3.2.4)

- Progress **inside** a dialogue. If the browser closes mid-dialogue, resuming puts the player
  back in the scene, and the dialogue starts from its first line again.
- Open menus or panels, and temporary animations.

Codex entries unlocked during an unfinished dialogue are lost if the player quits before the
next save point; this keeps "resume = last save point" simple and predictable.

## Writing safely (FR 3.5.2)

`SaveManager.write()`:

1. Stamp `savedAt` and serialise.
2. Remember the previous stored value.
3. Write, then **read back** and compare. If it matches: done.
4. If the write threw (for example `QuotaExceededError`) or the read-back differs: **retry once**.
5. If it still fails: put the previous value back, return `{ok: false}`. The game shows
   "Couldn't save your progress", keeps the current state in memory, and play continues.

## Loading (FR 3.2.3, FR 3.5.1, FR 3.5.3)

`SaveManager.load()` never throws. It returns a status:

| Status | Meaning | What the player sees |
|---|---|---|
| `ok` | Valid save | **Continue** is enabled |
| `none` | Nothing saved yet | Continue disabled |
| `unavailable` | Storage blocked, missing or not writable (private mode, blocked cookies) | Notice: "Progress can't be saved in this browser." Continue and Save are disabled. The game is fully playable. |
| `corrupt` | Not valid JSON, or the wrong shape | Notice: "Your saved game couldn't be loaded." **New Game** asks for a second tap, then replaces it |
| `incompatible` | A valid save but a different `version` | Same as `corrupt` |

Invalid or missing `settings` fall back to the defaults (FR 5.1).

## Changing the save format

1. Add or change fields in `createNewSave()` and `validateSave()`.
2. If old saves would break, increase `SAVE_VERSION` in `config.js`. Players with an old save
   then get the `incompatible` message and must start a new game.
3. To keep old saves working instead, add a migration step in `load()` that upgrades the old
   shape before validating, and add a test with a sample old save.
4. Update this document, the SRS table in Section 4.2, and `tests/saveManager.test.js`.

## How to test by hand

- **Blocked storage:** open the game in a private window in a browser that blocks storage
  there, or in Chrome DevTools > Application > Storage, block site data.
- **Full storage:** in DevTools console, fill storage, then play to a save point:
  `try { for (let i=0;;i++) localStorage.setItem('fill'+i, 'x'.repeat(1e6)) } catch(e) {}`
- **Corrupt save:** `localStorage.setItem('sankofa-trails/save', '{broken')` then reload.
- **Wrong version:** `localStorage.setItem('sankofa-trails/save', '{"version":999}')` then reload.

The first, third and fourth are also automated in `e2e/game.spec.js`.
