# Sankofa Trails

A 2D browser game that teaches African history and culture. The player walks through
story scenes, talks to characters, makes choices, reads short historical context panels
and collects entries in a Codex. It runs from a URL on desktop and mobile with no installation.

> *Sankofa*: "go back and fetch it." A word from the Akan language of Ghana, often shown as a
> bird that looks backward while its feet face forward.

This repository implements the **Software Requirements Specification v1.1**. Every
requirement is traced to code and tests in [docs/TRACEABILITY.md](docs/TRACEABILITY.md).

## Quick start

Requires **Node 20.19 or newer** (see `.nvmrc`).

```bash
npm install
npm run dev            # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm test` | Unit tests (Vitest) |
| `npm run validate:content` | Check every trail and Codex entry against the content rules |
| `npm run validate:content:release` | Same, but un-reviewed content also fails (use before a release) |
| `npx playwright install chromium` | One-time browser download for the end-to-end tests |
| `npm run e2e` | End-to-end tests: plays the game in a real browser, desktop and emulated phone |
| `npm run build` | Production build into `dist/` |
| `npm run check` | Content validation + unit tests + build (what CI runs first) |

## Controls

| | Desktop | Touch |
|---|---|---|
| Move | Arrow keys or W A S D | On-screen D-pad |
| Talk | E, Enter, or click the character | Talk button |
| Dialogue | Space/Enter to continue, 1-4 to choose | Tap |
| Menu | Esc | Menu button |

## What is built so far

- Core loop: move, collide, talk, dialogue lines, choices with outcomes, context panels
- Trail unlocking and Codex unlocking (each unlocks once, with a notification)
- Save points (scene complete, area change, trail complete, manual save) with read-back verification
- Storage-failure handling: blocked storage, full storage, corrupted or incompatible saves
- Desktop and touch controls with automatic detection; touch targets sized in CSS pixels
- A content validator that turns the SRS acceptance criteria into automatic checks
- One **sample** trail (3 scenes) and a placeholder second trail. Replace both with researched content.

Not built yet: Settings menu UI, audio, real art and tilemaps, tutorial, completion code for the
pilot surveys. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Project layout

```
src/
  config.js            Every number that comes from the SRS
  session.js           Current save + save manager shared by scenes
  systems/             Pure logic, no Phaser. Fully unit tested.
    storage.js           Never-throwing localStorage wrapper
    saveManager.js       Save schema, load, verified write, retry
    unlocks.js           Trail / Codex unlock rules, recording choices
    dialogue.js          Story engine + simulateRun (FR 3.4 test)
    settings.js          Defaults, validation, text sizes
    device.js            Desktop vs touch detection
  content/             Loading and validating story content
  data/                Story content as JSON (trails/, codex.json)
  scenes/              Phaser scenes: Boot, Title, TrailSelect, Game, Pause, Codex
  ui/                  Buttons, dialogue panel, touch controls, theme
tests/                 Unit tests
e2e/                   Browser tests (Playwright)
scripts/               validate-content.js
docs/                  Architecture, schema, save data, testing, roadmap, ...
.github/               CI, GitHub Pages deploy, PR and issue templates
```

## Documentation

| Document | Read it when you want to... |
|---|---|
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Set up, branch, commit, and know what "done" means |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Understand how the pieces fit |
| [docs/CONTENT-SCHEMA.md](docs/CONTENT-SCHEMA.md) | Write or edit a trail |
| [docs/CONTENT-GUIDELINES.md](docs/CONTENT-GUIDELINES.md) | Research, write and fact-check content |
| [docs/SAVE-DATA.md](docs/SAVE-DATA.md) | See what is saved, when, and how failures are handled |
| [docs/TRACEABILITY.md](docs/TRACEABILITY.md) | See which requirement is done, where, and how it is tested |
| [docs/TESTING.md](docs/TESTING.md) | Run automatic tests and the manual test procedures |
| [docs/PILOT-PLAN.md](docs/PILOT-PLAN.md) | Run the 8-week pilot from the SMART hypothesis |
| [docs/MINIGAME.md](docs/MINIGAME.md) | The runner between areas: controls, tuning, suggested SRS text |
| [docs/ART.md](docs/ART.md) | Change or replace pictures (`npm run art`) |
| [docs/AUDIO.md](docs/AUDIO.md) | Add music and sound effects (empty slots ready) |
| [docs/ROADMAP.md](docs/ROADMAP.md) | See what comes next |
| [docs/adr/](docs/adr/) | Find out why a technical decision was made |

## Deployment

Pushing to `main` runs CI and, once GitHub Pages is enabled (Settings > Pages > Source:
GitHub Actions), publishes the game. The build uses relative paths, so it also works on
Netlify, Cloudflare Pages, or any static host.

## Licence

No licence has been chosen yet. Add a `LICENSE` file before making the repository public.
