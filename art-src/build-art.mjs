// Draws every picture in the game and writes it to public/assets/ (and the editable
// SVG source to art-src/svg/). Run with:   npm run art
//
// Requires the Playwright browser:   npx playwright install chromium
//
// To change a picture: edit the drawing in characters.mjs, props.mjs or backgrounds.mjs
// (or colours in palette.mjs), run `npm run art`, and reload the game.
// To REPLACE a picture with your own art: keep the same file name and size in
// public/assets/ (see docs/ART.md) and do not run `npm run art` for that file.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAll } from './lib.mjs';
import { characterSheet, STYLES } from './characters.mjs';
import { PROPS, emblemIcon } from './props.mjs';
import { BACKGROUNDS } from './backgrounds.mjs';
import { runnerSky, runnerGround } from './runner.mjs';
import { MORE_PROPS, MORE_BACKGROUNDS } from './more.mjs';
import { BATTLE_PROPS, battleSky } from './battle.mjs';
import { PLACE_BACKGROUNDS } from './places.mjs';
import { themeJobs } from './runner-themes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = (...p) => path.join(root, 'public', 'assets', ...p);
const svgs = (...p) => path.join(root, 'art-src', 'svg', ...p);
const only = process.argv[2]; // optional: build only names containing this text

const jobs = [];
for (const name of Object.keys(STYLES)) {
  jobs.push({ name, ...characterSheet(name), type: 'png', out: assets('sprites', `${name}.png`), svgOut: svgs(`sprite-${name}.svg`) });
}
for (const [name, make] of Object.entries({ ...PROPS, ...MORE_PROPS, ...BATTLE_PROPS })) {
  jobs.push({ name, ...make(), type: 'png', out: assets('props', `${name}.png`), svgOut: svgs(`prop-${name}.svg`) });
}
for (const [name, make] of Object.entries({ ...BACKGROUNDS, ...MORE_BACKGROUNDS, ...PLACE_BACKGROUNDS })) {
  jobs.push({ name, ...make(), type: 'jpeg', quality: 80, out: assets('backgrounds', `${name}.jpg`), svgOut: svgs(`bg-${name}.svg`) });
}
jobs.push({ name: 'runner-sky', ...runnerSky(), type: 'jpeg', quality: 80, out: assets('backgrounds', 'runner-sky.jpg'), svgOut: svgs('bg-runner-sky.svg') });
jobs.push({ name: 'battle-sky', ...battleSky(), type: 'jpeg', quality: 80, out: assets('backgrounds', 'battle-sky.jpg'), svgOut: svgs('bg-battle-sky.svg') });
jobs.push({ name: 'runner-ground', ...runnerGround(), type: 'png', out: assets('backgrounds', 'runner-ground.png'), svgOut: svgs('bg-runner-ground.svg') });
jobs.push(...themeJobs(assets, svgs));
jobs.push({ name: 'emblem', ...emblemIcon(), type: 'png', out: assets('ui', 'emblem.png'), svgOut: svgs('ui-emblem.svg') });

await renderAll(jobs.filter((j) => !only || j.name.includes(only)));
console.log('Done.');
