import { test } from '@playwright/test';
import { expect, watchErrors, waitForScene, clickGame } from './helpers.js';

const ARCADE_KEY = 'sankofa-trails/arcade';

async function openArcade(page) {
  await page.goto('/');
  await waitForScene(page, 'TitleScene');
  await clickGame(page, 480, 466); // Mini Games
  await waitForScene(page, 'ArcadeScene');
}

// Play buttons are at x = 480 + 340, rows at y 170, 282, 394
const PLAY = { runner: 170, horse: 282, basket: 394 };

test.describe('mini games menu', () => {
  test('the title menu opens the three minigames; Quit / Back return', async ({ page }) => {
    const errors = watchErrors(page);
    await openArcade(page);
    for (const [id, scene] of [['runner', 'RunnerScene'], ['horse', 'HorseScene'], ['basket', 'BasketScene']]) {
      await clickGame(page, 820, PLAY[id]);
      await waitForScene(page, scene);
      expect(await page.evaluate((s) => window.__game.scene.getScene(s).arcade, scene)).toBe(true);
      await page.evaluate((s) => window.__game.scene.getScene(s).skip(), scene); // same as the Quit button
      await waitForScene(page, 'ArcadeScene');
    }
    await clickGame(page, 480, 496); // Back
    await waitForScene(page, 'TitleScene');
    expect(errors).toEqual([]);
  });

  test('savanna run (arcade): never ends by winning; tripping shows game over and keeps the best score', async ({ page }) => {
    await openArcade(page);
    await clickGame(page, 820, PLAY.runner);
    await waitForScene(page, 'RunnerScene');
    await page.keyboard.press('Space', { delay: 40 }); // start
    await page.evaluate(() => { const r = window.__game.scene.getScene('RunnerScene').run; r.distance = 400 * 25; r.obstacles = []; r.nextSpawnAt = r.distance + 1; });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__game.scene.getScene('RunnerScene').run.status)).toBe('running'); // past the story target
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene').state === 'crashed', null, { timeout: 15000 });
    const best = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), ARCADE_KEY));
    expect(best.runner).toBeGreaterThan(300);
  });
});

test.describe('horse charge', () => {
  async function startHorse(page) {
    await openArcade(page);
    await clickGame(page, 820, PLAY.horse);
    await waitForScene(page, 'HorseScene');
    await page.keyboard.press('Space', { delay: 40 }); // start (and jump)
    await page.evaluate(() => { const r = window.__game.scene.getScene('HorseScene').run; r.nextSpawnAt = 1e9; r.obstacles = []; });
    await page.waitForFunction(() => window.__game.scene.getScene('HorseScene').run.y === 0);
  }

  test('E throws a spear that stops a soldier', async ({ page }) => {
    const errors = watchErrors(page);
    await startHorse(page);
    await page.evaluate(() => { const r = window.__game.scene.getScene('HorseScene').run; r.soldiers.push({ x: r.distance + r.cfg.PLAYER_X + 520, w: 46, h: 140, alive: true }); });
    await page.keyboard.press('e', { delay: 40 });
    await page.waitForFunction(() => window.__game.scene.getScene('HorseScene').run.kills === 1);
    expect(errors).toEqual([]);
  });

  test('a soldier you did not stop ends the run: game over, the best is saved, any key rides again', async ({ page }) => {
    await startHorse(page);
    await page.evaluate(() => { const r = window.__game.scene.getScene('HorseScene').run; r.soldiers.push({ x: r.distance + r.cfg.PLAYER_X + 200, w: 46, h: 140, alive: true }); });
    await page.waitForFunction(() => window.__game.scene.getScene('HorseScene').state === 'crashed');
    expect(await page.evaluate(() => window.__game.scene.getScene('HorseScene').run.crashedBy)).toBe('soldier');
    await page.waitForTimeout(500);
    expect(JSON.parse(await page.evaluate((k) => localStorage.getItem(k), ARCADE_KEY)).horse).toBeGreaterThanOrEqual(0);
    await page.keyboard.press('Space', { delay: 40 });
    await page.waitForFunction(() => window.__game.scene.getScene('HorseScene').state === 'running');
  });
});

test.describe('wisdom catch', () => {
  async function startBasket(page) {
    await openArcade(page);
    await clickGame(page, 820, PLAY.basket);
    await waitForScene(page, 'BasketScene');
    await page.keyboard.press('Space', { delay: 40 });
    await page.waitForFunction(() => window.__game.scene.getScene('BasketScene').state === 'running');
    await page.evaluate(() => { const r = window.__game.scene.getScene('BasketScene').run; r.nextSpawnIn = 1e9; r.items = []; });
  }
  const drop = (page, kind) => page.evaluate((k) => {
    const r = window.__game.scene.getScene('BasketScene').run;
    r.items.push({ kind: k, type: k === 'good' ? 'scroll' : 'thorn', x: r.x, y: 380, vy: 300 });
  }, kind);

  test('knowledge gives +1 shell, a bad thing takes 3, and the keys move the basket', async ({ page }) => {
    const errors = watchErrors(page);
    await startBasket(page);
    const shells = () => page.evaluate(() => window.__game.scene.getScene('BasketScene').run.shells);
    const start = await shells();
    await drop(page, 'good');
    await page.waitForFunction((n) => window.__game.scene.getScene('BasketScene').run.shells === n, start + 1);
    await drop(page, 'bad');
    await page.waitForFunction((n) => window.__game.scene.getScene('BasketScene').run.shells === n, start - 2);
    const x0 = await page.evaluate(() => window.__game.scene.getScene('BasketScene').run.x);
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(900);
    await page.keyboard.up('ArrowLeft');
    expect(await page.evaluate(() => window.__game.scene.getScene('BasketScene').run.x)).toBeLessThan(x0 - 100);
    expect(errors).toEqual([]);
  });

  test('going below 0 shells ends the run, saves the best, and a key plays again', async ({ page }) => {
    await startBasket(page);
    await page.evaluate(() => { window.__game.scene.getScene('BasketScene').run.shells = 1; });
    await drop(page, 'good');
    await page.waitForFunction(() => window.__game.scene.getScene('BasketScene').run.caught === 1);
    await drop(page, 'bad');
    await page.waitForFunction(() => window.__game.scene.getScene('BasketScene').state === 'lost');
    await page.waitForTimeout(500);
    expect(JSON.parse(await page.evaluate((k) => localStorage.getItem(k), ARCADE_KEY)).basket).toBe(1);
    await page.keyboard.press('Space', { delay: 40 });
    await page.waitForFunction(() => window.__game.scene.getScene('BasketScene').state === 'running');
  });
});

test('the running game looks different depending on where you are going', async ({ page }) => {
  await page.goto('/');
  await waitForScene(page, 'TitleScene');
  const themeFor = async (trailId, sceneId) => {
    await page.evaluate(([t, s]) => window.__game.scene.getScenes(true)[0].scene.start('RunnerScene', { trailId: t, sceneId: s }), [trailId, sceneId]);
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene')?.themeName && window.__game.scene.isActive('RunnerScene'));
    return page.evaluate(() => window.__game.scene.getScene('RunnerScene').themeName);
  };
  expect(await themeFor('trail2', 't2-s2')).toBe('ember');
  expect(await themeFor('trail2', 't2-s4')).toBe('battle');
  expect(await themeFor('trail3', 't3-s2')).toBe('village');
  expect(await themeFor('trail3', 't3-s3')).toBe('forest');
});
