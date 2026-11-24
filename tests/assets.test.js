import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { BACKGROUNDS, PROPS } from '../src/assets/manifest.js';
import { MUSIC, SFX } from '../src/audio/audioManifest.js';
import { RUNNER_THEMES, AREA_THEME, themeNameForArea } from '../src/assets/runnerThemes.js';
import { TRAILS } from '../src/content/index.js';

const pub = (...p) => path.join(process.cwd(), 'public', 'assets', ...p);

describe('every picture and sound the game asks for exists', () => {
  it('backgrounds and props', () => {
    for (const n of BACKGROUNDS) expect(fs.existsSync(pub('backgrounds', `${n}.jpg`)), `background ${n}`).toBe(true);
    for (const n of PROPS) expect(fs.existsSync(pub('props', `${n}.png`)), `prop ${n}`).toBe(true);
  });
  it('runner themes: sky, ground and three obstacles each', () => {
    for (const [name, t] of Object.entries(RUNNER_THEMES)) {
      expect(fs.existsSync(pub('backgrounds', `${t.sky}.jpg`)), `${name} sky`).toBe(true);
      expect(fs.existsSync(pub('backgrounds', `${t.ground}.png`)), `${name} ground`).toBe(true);
      for (const k of ['rock', 'bush', 'tree']) expect(fs.existsSync(pub('props', `${t.obstacles[k].prop}.png`)), `${name} ${k}`).toBe(true);
    }
  });
  it('every music and sound slot has an mp3 (one mp3 is enough for the game)', () => {
    for (const [slot, file] of [...Object.entries(MUSIC), ...Object.entries(SFX)]) {
      if (file) expect(fs.existsSync(pub('audio', `${file}.mp3`)), `${slot} -> ${file}.mp3`).toBe(true);
    }
  });
});

describe('places and looks', () => {
  it('every trail scene has its own background picture, and no area repeats within a trail', () => {
    for (const trail of TRAILS) {
      const areas = trail.scenes.map((s) => s.area);
      for (const a of areas) expect(BACKGROUNDS, `${trail.id} area ${a}`).toContain(a);
      if (!trail.tutorial) expect(new Set(areas).size, `${trail.id} repeats an area`).toBe(areas.length);
    }
  });
  it('the two story trails share no background with each other', () => {
    const [, t2, t3] = TRAILS;
    const a = new Set(t2.scenes.map((s) => s.area));
    expect(t3.scenes.filter((s) => a.has(s.area)).map((s) => s.area)).toEqual([]);
  });
  it('every area has a runner theme, and the story trails use at least 3 different looks', () => {
    for (const a of Object.keys(AREA_THEME)) expect(RUNNER_THEMES[AREA_THEME[a]]).toBeTruthy();
    expect(themeNameForArea('unknown-place')).toBe('savanna');
    const looks = new Set(TRAILS.flatMap((t) => t.scenes.slice(1).map((s) => themeNameForArea(s.area))));
    expect(looks.size).toBeGreaterThanOrEqual(4);
  });
});
