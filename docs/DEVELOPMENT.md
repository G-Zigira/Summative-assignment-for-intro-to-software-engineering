# Development guide

## Set up

```bash
git clone <your repo url>
cd sankofa-trails
nvm use            # or install Node 22 / any version 20.19 or newer
npm install
npx playwright install chromium     # only needed for npm run e2e
npm run dev
```

Open http://localhost:5173. To test on a phone on the same Wi-Fi: `npm run dev -- --host`, then
open the address it prints on the phone.

## Everyday commands

```bash
npm run dev                 # play while editing
npm test                    # unit tests (run constantly)
npm run validate:content    # after any change in src/data/
npm run e2e                 # browser tests, about a minute
npm run check               # validate + unit tests + build
```

## Branches and commits

- `main` always works: CI passes and it can be deployed. Do not commit to it directly.
- Make a branch per piece of work: `feature/settings-menu`, `fix/codex-paging`, `content/trail1-draft`.
- Open a pull request into `main`. Fill in the template. CI must pass before merging.
- Write commit messages in the imperative, with a prefix: `feat:`, `fix:`, `content:`, `test:`, `docs:`, `chore:`.
  Example: `feat: add settings menu (FR 5.1)`.
- Mention the requirement id when there is one.

## Definition of done

A change is done when:

- [ ] It does what the SRS requirement's **acceptance criterion** says
- [ ] There is an automatic test for it (unit if it is a rule, e2e if it is browser behaviour), or a line in [TESTING.md](TESTING.md) saying how to test it by hand
- [ ] `npm run check` passes (and `npm run e2e` if you touched scenes or UI)
- [ ] [TRACEABILITY.md](TRACEABILITY.md) is updated
- [ ] Any new number from the SRS is in `config.js`, not buried in code
- [ ] Docs updated if behaviour, content format or save format changed
- [ ] If content changed: `npm run validate:content` passes

## Where to put things

| I want to... | Do this |
|---|---|
| Change a game rule (unlocking, saving, dialogue flow) | Edit `src/systems/`, add a test in `tests/` first |
| Add or edit story | Edit `src/data/`; see [CONTENT-SCHEMA.md](CONTENT-SCHEMA.md) |
| Add a screen | New file in `src/scenes/`, register it in `src/main.js`, link to it from another scene |
| Add a button | `makeButton()` from `src/ui/button.js` (it enforces the touch-target size) |
| Show text | `makeText()` (it applies the text-size setting) |
| Change a number from the SRS | `src/config.js` |
| Save a new thing | [SAVE-DATA.md](SAVE-DATA.md): "Changing the save format" |
| Add art or sound | Put files in `public/assets/`, load them in `BootScene.preload()`, credit them in `docs/CREDITS.md` |

## Debugging

In `npm run dev` these exist in the browser console:

```js
__game                                       // the Phaser game
__game.scene.getScene('GameScene')           // the play scene (player, npc, ui, trail, story, ...)
__session.save                               // the current save object
__session.loadStatus                         // 'ok' | 'none' | 'unavailable' | 'corrupt' | 'incompatible'
localStorage.getItem('sankofa-trails/save')  // what is actually stored
```

Handy: teleport next to the character and start talking:

```js
const s = __game.scene.getScene('GameScene'); s.player.setPosition(s.npc.x - 60, s.npc.y)
```

Reset everything: `localStorage.clear(); location.reload()`.

## Conventions

- Plain JavaScript with ES modules. Add a `// why` comment where the reason is not obvious, especially anything tied to a requirement.
- `systems/` and `content/` must not import Phaser. That is what keeps them testable.
- Never read or write `localStorage` directly; use `SaveManager`.
- Immutable updates for save data: return a new object (see `unlocks.js`).
- Keep scenes thin. If a scene method contains a rule, move the rule to `systems/`.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm run e2e` says the browser is missing | `npx playwright install chromium` |
| e2e fails with "port 5173 already in use" | Stop your running dev server, or set `reuseExistingServer` (already true locally) |
| Blank page after build on a sub-path | The build uses relative paths (`base: './'`); check you serve the whole `dist/` folder |
| Sound does nothing | Audio is switched off in `main.js` until sound assets exist |
