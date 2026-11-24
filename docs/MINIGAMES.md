# Minigames (v0.5.0)

There are three minigames. Each is **pure rules** in `src/systems/` (unit tested with bots), drawn by a scene in `src/scenes/`. All numbers are in `src/config.js`.

| Game | Where it appears in the story | Rules file | Scene |
|---|---|---|---|
| Savanna Run | Between areas (see MINIGAME.md) | `runner.js` | `RunnerScene` |
| Horse Charge | Finale of **The Lion's Path** (Sundiata's battle) | `horse.js` | `HorseScene` |
| Wisdom Catch | Finale of **The Web of Wisdom** (Anansi) | `basket.js` | `BasketScene` |

Every minigame also runs from **Mini Games** on the title screen ("arcade mode"): endless, ends when you fail, the best score is kept (`src/systems/arcade.js`, localStorage key `sankofa-trails/arcade`, separate from the save file so the save keeps exactly the SRS fields). In the story the player can always press **Skip**.

## Looks of the running game
The rules are the same everywhere; the pictures change with the place you travel to: savanna (courtyard, wall garden, Kangaba hall), desert (road, exile plains), ember (forge), battle (Kirina), forest (forest, big tree), village (farm village, village square). In the Mini Games menu each run picks a random look. Obstacles keep their size and hitbox (small, medium, tall); only the picture changes.

## Horse Charge
- Keys: **Space / Up / W** jump, **E / Enter / X / F** throw a spear. Mouse: click the left half to jump, the right half to throw. Touch: Jump (left) and Throw (right) buttons.
- Soldiers walk towards you and **must be stopped** with a spear (they are too tall to jump). Rocks and bushes must be jumped. A spear flies over rocks. Spear cooldown 0.4 s.
- Story mode: stop 8 soldiers to win. Arcade: endless, score = 10 per soldier + distance.
- The first thing that appears is always a soldier. Gaps between things are at least 1.35 s of riding so there is always time to react. Test: a bot wins 23 of 25 random battles.

## Wisdom Catch
- Keys: **Left/Right or A/D**. Mouse: move the mouse. Touch: drag, or hold the < > buttons.
- Knowledge (scroll, Adinkra heart, star) = **+1 shell**. Bad things (thorn, stone, vial: dark with a red outline) = **-3 shells**. Missed knowledge costs nothing. Below 0 shells you lose.
- Story mode: start with 3 shells, reach 15 to win. Arcade: start with 5, endless, score = knowledge caught.
- Things fall faster and more often over time; each new item appears at most 380 px sideways from the last, so it is always reachable. Test: a bot wins 22 of 25 rounds.

## Using a minigame as a trail ending
On the **last scene** of a trail JSON add `"finale": "horse"` or `"finale": "basket"`. After the last dialogue the minigame plays (win or Skip), then the trail-complete screen with the completion code appears. The validator rejects other values and non-final scenes. The runner between areas stays as it was (`"travel": false` turns it off).

## Tuning
`CONFIG.HORSE` and `CONFIG.BASKET`: speeds, gaps, goals, shells. After changing, run `npx vitest run tests/horse.test.js tests/basket.test.js`; they fail if a game becomes unwinnable.

## Suggested SRS addition
**FR 6.2 Minigames.** AC 1: each minigame is playable with keyboard, mouse and touch (FR 2.2). AC 2: a story minigame can always be skipped. AC 3: arcade best scores persist on the device and never block play if storage fails (NFR 8). AC 4: progress is saved before a minigame starts.
