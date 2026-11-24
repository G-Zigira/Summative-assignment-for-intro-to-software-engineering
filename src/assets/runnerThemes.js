// Looks for the running minigame. The rules (runner.js) never change: only the pictures.
// Each theme = a sky, a ground strip and a picture for each of the three obstacle sizes
// (rock = small, bush = medium, tree = tall). Which theme plays depends on where you are travelling TO.
// Pictures come from art-src/runner-themes.mjs (`npm run art`); see docs/ART.md to replace them.

import { propKey } from './manifest.js';

const themed = (t, sky) => ({
  label: t,
  sky: sky ?? `rt-${t}-sky`,
  ground: `rt-${t}-ground`,
  obstacles: {
    rock: { prop: `rt-${t}-a`, scale: 0.5 },
    bush: { prop: `rt-${t}-b`, scale: 0.5 },
    tree: { prop: `rt-${t}-c`, scale: 0.5 },
  },
});

export const RUNNER_THEMES = {
  savanna: { label: 'savanna', sky: 'runner-sky', ground: 'runner-ground', obstacles: { rock: { prop: 'rock', scale: 0.5 }, bush: { prop: 'bush', scale: 0.55 }, tree: { prop: 'baobab', scale: 0.3 } } },
  ember: themed('ember'),
  desert: themed('desert'),
  forest: themed('forest'),
  village: themed('village'),
  battle: themed('battle', 'battle-sky'),
};

/** The area you are travelling to decides the look. Unknown areas use the savanna. */
export const AREA_THEME = {
  courtyard: 'savanna', 'wall-garden': 'savanna', 'kangaba-hall': 'savanna',
  road: 'desert', 'exile-plains': 'desert',
  forge: 'ember',
  kirina: 'battle',
  forest: 'forest', 'big-tree': 'forest',
  'farm-village': 'village', 'village-square': 'village',
};

export const themeNameForArea = (area) => (RUNNER_THEMES[AREA_THEME[area]] ? AREA_THEME[area] : 'savanna');
export const themeNames = () => Object.keys(RUNNER_THEMES);
export const obstacleProp = (theme, kind) => RUNNER_THEMES[theme].obstacles[kind] ?? RUNNER_THEMES.savanna.obstacles[kind];
export { propKey };
