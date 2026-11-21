# Testing

## Levels

| Level | Tool | What it proves | Run |
|---|---|---|---|
| Content validation | `scripts/validate-content.js` | Story data obeys the SRS content rules | `npm run validate:content` |
| Unit | Vitest (`tests/`) | Rules: saving, unlocking, dialogue, settings, device detection | `npm test` |
| End to end | Playwright (`e2e/`) | The real game works in a real browser: play-through, save/resume, storage failures, touch targets | `npm run e2e` |
| Manual | You, with devices | Performance on real phones, usability, contrast, other browsers | Sections below |

CI runs the first three on every push and pull request.

First time only for e2e: `npx playwright install chromium`.

## Writing tests

- Put a rule in `src/systems/` as a pure function, then test it in `tests/`. This is the cheapest test to write and run.
- Name tests after the requirement: `it('... (FR 3.5.2)')`. Add the row to [TRACEABILITY.md](TRACEABILITY.md).
- `tests/helpers.js` has `fakeBackend()` to simulate blocked, full or garbling storage.
- e2e tests drive the game through `window.__game` (dev server only). `e2e/helpers.js` has
  `clickGame(page, x, y)` for clicking in 960x540 game coordinates, and `talkThroughScene(page)`.
- To also test Firefox and WebKit, add projects to `playwright.config.js` and run
  `npx playwright install firefox webkit`.

## Manual test procedures

Record every run in the results tables in this file (copy them into a dated section or a spreadsheet).

### M1. Load time (NFR 2)

Target: 5 s or less on 4G, median of 5 runs, on the reference devices.

1. Chrome DevTools > Network > add a custom throttling profile: download 9 Mbps, upload 9 Mbps, latency 170 ms.
2. Disable cache, hard reload.
3. Time from navigation start until the title screen is interactive (Performance panel, or a stopwatch on a screen recording).
4. Repeat 5 times, take the median. Repeat on the Android and iPhone reference devices with a real or throttled connection.
5. Also test unthrottled broadband (25 Mbps or faster): target 3 s or less.

| Date | Device | Network | Runs (s) | Median | Pass? |
|---|---|---|---|---|---|
| | | | | | |

### M2. Frame rate (NFR 2)

Target: average at least 30 fps over a 5-minute play session, at most 5% of frames below 30 fps.

1. In the dev console, sample for 5 minutes: `const s=[]; const t=setInterval(()=>s.push(__game.loop.actualFps),1000); setTimeout(()=>{clearInterval(t); console.log('avg', s.reduce((a,b)=>a+b)/s.length, 'below30', s.filter(f=>f<30).length/s.length)},300000)`
2. Play normally during that time (walk, open dialogue, change scene).
3. On a phone, use remote debugging (Chrome `chrome://inspect`, Safari Web Inspector) and run the same snippet. This needs the dev server reachable from the phone (`npm run dev -- --host`).

| Date | Device | Average fps | % below 30 | Pass? |
|---|---|---|---|---|

### M3. Usability test (NFR 3)

Target: at least 5 first-time players; at least 80% finish the tutorial unaided in 3 minutes or less; average rating of "the controls were easy to use" at least 4 out of 5.

1. Recruit 5 or more people who have never seen the game. Do not coach them.
2. Give them only the URL. Ask them to: move the character, talk to a character, continue a dialogue, open the Codex.
3. Time each person from the title screen. Note every moment they hesitate, ask for help, or press the wrong thing.
4. Afterwards ask: "The controls were easy to use" (1 strongly disagree to 5 strongly agree).
5. Fix the problems you saw, then retest with different people if the target was missed.

| Player | Device | Finished unaided? | Time (s) | Rating (1-5) | Problems seen |
|---|---|---|---|---|---|

> The tutorial itself is not built yet (see [ROADMAP.md](ROADMAP.md)). Until then, use the first scene.

### M4. Readability (NFR 3)

- Contrast: check each text/background colour pair in `ui/theme.js` with a contrast checker (for example the WebAIM Contrast Checker). Need at least 4.5:1.
- Text size: on the smallest reference phone, body text must be at least 16 CSS px. Body text is 20 game px x the text-size multiplier (1, 1.25, 1.5), shown at `canvas width / 960` scale. At the default multiplier it is at least 16 CSS px when the canvas is at least 640 px wide. Verify on the real device and with the Small setting once Settings exist.
- Touch targets: automated in `e2e/mobile.spec.js` on an emulated phone. Spot-check on a real one.

### M5. Browser and device matrix (NFR 4, 5, 6)

Run the Trail 1 script below on each row. A pass means no blocking defect: it loads, moves, shows dialogue, saves, and finishes.

**Trail 1 script:** New Game > Trail 1 > walk to the character > talk > finish all scenes > see "Trail complete" > check the next trail is unlocked > reload > Continue.

| Browser / device | Version | OS | Pass? | Notes |
|---|---|---|---|---|
| Chrome (desktop) | | | | |
| Firefox (desktop) | | | | |
| Safari (desktop) | | | | |
| Edge (desktop) | | | | |
| Chrome (Android reference phone) | | | | |
| Safari (iPhone reference) | | | | |

### M6. Storage failures on real browsers (NFR 8)

Run the four hand tests in [SAVE-DATA.md](SAVE-DATA.md#how-to-test-by-hand) in Safari private browsing and in Chrome Incognito.

## Reference devices (NFR 7)

Write the exact devices you use here so results can be reproduced:

| Role | Device | OS / browser | Notes |
|---|---|---|---|
| Android reference | | | At least 4 GB RAM, mid-range 2020+ processor, latest Chrome |
| iPhone reference | | | iPhone 8 or newer, latest Safari |
