import { test, expect } from '@playwright/test';
import { watchErrors, waitForScene, clickGame } from './helpers.js';

// Runs on an emulated Pixel 5 in landscape (touch, coarse pointer).
test('FR 2.1/2.2 + NFR 3: touch controls appear and every target is >= 48 CSS px', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await waitForScene(page, 'TitleScene');
  await clickGame(page, 480, 350); // New Game (a tap on touch devices)
  await waitForScene(page, 'TrailSelectScene');
  await clickGame(page, 480, 130);
  await waitForScene(page, 'GameScene');
  await page.waitForFunction(() => window.__game.scene.getScene('GameScene').player?.body);

  const report = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('GameScene');
    const canvas = document.querySelector('#game canvas').getBoundingClientRect();
    const cssPerGame = canvas.width / 960;
    return {
      scheme: scene.scheme,
      hasTouch: Boolean(scene.touch),
      // [width, height] in CSS px of the D-pad, Talk and Menu buttons
      sizes: [...scene.touch.parts.filter((p) => p.type === 'Rectangle'), scene.menuButton.bg]
        .map((r) => [r.width * cssPerGame, r.height * cssPerGame]),
    };
  });

  expect(report.scheme).toBe('touch');
  expect(report.hasTouch).toBe(true);
  expect(report.sizes.length).toBe(6); // 4 D-pad + Talk + Menu
  for (const [w, h] of report.sizes) {
    expect(w).toBeGreaterThanOrEqual(48);
    expect(h).toBeGreaterThanOrEqual(48);
  }
  expect(errors).toEqual([]);
});
