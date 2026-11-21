# ADR 0001: Technology stack

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

The SRS requires a 2D game that runs from a URL on desktop and mobile browsers with no
installation (NFR 4, 6), loads in 5 seconds on 4G (NFR 2), works offline from local storage only
(NFR 1), and is built by a small student team in an Agile process.

## Decision

- **Phaser 3** for rendering, input, scenes and arcade physics
- **Vite** for the dev server and production build
- **Plain JavaScript (ES modules)**, no framework
- **Vitest** for unit tests and **Playwright** for end-to-end tests
- **GitHub Actions** for CI and **GitHub Pages** for hosting (any static host works)

## Why

- Phaser is a mature, well-documented 2D engine made for browser games, with touch input,
  scaling and arcade physics built in. This matches the whole feature list of the SRS.
- The production build is about 330 KB gzipped, so the 5-second load target has a lot of room.
- A static site needs no server, which matches "no accounts, no data leaves the device".
- Plain JavaScript keeps the barrier low and lets the pure logic (`src/systems/`) be tested in
  Node without a browser. TypeScript is a reasonable later upgrade.
- Playwright can emulate a phone (touch, coarse pointer, landscape), which is what the
  device-detection and touch-target requirements need.

## Alternatives considered

| Option | Why not (for now) |
|---|---|
| Godot web export | Larger initial download and a heavier toolchain; harder to keep within the 5 s target on mobile data |
| Other small JS engines (Kaplay, Excalibur) | Capable, but a smaller ecosystem for tilemaps, scaling and mobile input than Phaser |
| Plain canvas, no engine | We would rebuild input, scaling, physics and scenes by hand |
| React or similar UI framework + DOM | Good for menus, awkward for a game loop; two rendering systems to maintain |
| Unity WebGL | Large builds, slow load on mobile |

## Consequences

- The game is placeholder-art ready: swap rectangles for sprites without changing logic.
- Phaser is the biggest part of the download; it is split into its own cacheable chunk.
- Vite 8 uses a new bundler; `manualChunks` must be a function (see `vite.config.js`).
- If audio is added, browsers require a user tap before sound can start.
