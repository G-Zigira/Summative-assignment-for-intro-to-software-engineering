import { test, expect } from '@playwright/test';
import {
  watchErrors, waitForScene, clickGame, readSave, startNewGameAndTrail1, talkThroughScene,
} from './helpers.js';

const gameScene = (page, fn, arg) => page.evaluate(fn, arg);

test.describe('walking, story pieces, settings', () => {
  test('bug fix: the character cannot walk up into the wall / sky', async ({ page }) => {
    await startNewGameAndTrail1(page);
    await page.evaluate(() => window.__game.scene.getScene('GameScene').player.setPosition(320, 230));
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2200);
    await page.keyboard.up('ArrowUp');
    const y = await gameScene(page, () => window.__game.scene.getScene('GameScene').player.y);
    expect(y).toBeGreaterThanOrEqual(148); // feet stop at the base of the wall (y 170)
    expect(y).toBeLessThan(200);
  });

  test('touching an object shows a story piece, counts it once, and saves it at the next save point', async ({ page }) => {
    const errors = watchErrors(page);
    await startNewGameAndTrail1(page);
    // stand next to the first story piece (clay pots) and press E
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('GameScene');
      const it = s.items[0];
      s.player.setPosition(it.x + 20, it.y + 10);
    });
    await expect.poll(() => gameScene(page, () => window.__game.scene.getScene('GameScene').prompt.visible)).toBe(true);
    await page.keyboard.press('e', { delay: 60 });
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').dialogueOpen);
    expect(await gameScene(page, () => window.__session.save.fragments)).toEqual(['t1-i1']);
    await page.keyboard.press('Space', { delay: 40 }); // first press shows the rest of the text
    await page.keyboard.press('Space', { delay: 40 }); // second closes
    await page.waitForFunction(() => !window.__game.scene.getScene('GameScene').dialogueOpen);
    // reading it again does not count twice
    await page.keyboard.press('e', { delay: 60 });
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').dialogueOpen);
    await page.keyboard.press('Space', { delay: 40 });
    await page.keyboard.press('Space', { delay: 40 });
    await page.waitForFunction(() => !window.__game.scene.getScene('GameScene').dialogueOpen);
    expect(await gameScene(page, () => window.__session.save.fragments)).toEqual(['t1-i1']);
    // finishing the scene is a save point: the piece is written to storage
    await talkThroughScene(page);
    expect((await readSave(page)).fragments).toEqual(['t1-i1']);
    expect(errors).toEqual([]);
  });

  test('FR 5.1: settings change the volume and are remembered when you reopen the title screen', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'TitleScene');
    await clickGame(page, 480, 394); // Settings
    await waitForScene(page, 'SettingsScene');
    const before = await page.evaluate(() => window.__session.save.settings.volume);
    await clickGame(page, 800, 150); // volume +
    await page.waitForFunction((v) => window.__session.save.settings.volume === v + 10, before);
    await clickGame(page, 480, 470); // Done
    await waitForScene(page, 'TitleScene');
    expect(await page.evaluate(() => window.__game.scene.isActive('SettingsScene'))).toBe(false);
    await clickGame(page, 480, 322); // New Game keeps the settings
    await waitForScene(page, 'TrailSelectScene');
    expect(await page.evaluate(() => window.__session.save.settings.volume)).toBe(before + 10);
  });
});

test.describe('the new trails', () => {
  async function unlockAll(page) {
    await page.goto('/');
    await waitForScene(page, 'TitleScene');
    await clickGame(page, 480, 322);
    await waitForScene(page, 'TrailSelectScene');
    await page.evaluate(() => {
      window.__session.save.unlockedTrails = ['trail1', 'trail2', 'trail3'];
      window.__game.scene.getScene('TrailSelectScene').scene.restart();
    });
    await page.waitForTimeout(300);
  }

  for (const [name, y, id, scenes] of [['The Lion\'s Path', 206, 'trail2', 4], ['The Web of Wisdom', 282, 'trail3', 4]]) {
    test(`${name}: play every scene, the runner appears between areas, and the trail completes with a code`, async ({ page }) => {
      const errors = watchErrors(page);
      await unlockAll(page);
      await clickGame(page, 480, y);
      await waitForScene(page, 'GameScene');
      await page.waitForFunction(() => window.__game.scene.getScene('GameScene').player?.body);
      expect(await page.evaluate(() => window.__game.scene.getScene('GameScene').trail.id)).toBe(id);
      let result;
      for (let i = 0; i < scenes; i += 1) result = await talkThroughScene(page);
      expect(result).toBe('trail-complete');
      const save = await readSave(page);
      expect(save.completedTrails).toContain(id);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('runner: double jump', () => {
  test('pressing the action button twice jumps twice; cowries and a third press do nothing wrong', async ({ page }) => {
    await page.goto('/');
    await waitForScene(page, 'TitleScene');
    await page.evaluate(() => window.__game.scene.start('RunnerScene', { trailId: 'trail1', sceneId: 't1-s2' }));
    await waitForScene(page, 'RunnerScene');
    await page.keyboard.press('Space', { delay: 40 }); // start (and first jump)
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene').run.jumps >= 1);
    await page.evaluate(() => { const r = window.__game.scene.getScene('RunnerScene').run; r.obstacles = []; r.nextSpawnAt = 1e9; });
    await page.keyboard.press('Space', { delay: 40 });
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene').run.jumps === 2);
    await page.keyboard.press('Space', { delay: 40 }); // a third press in the air is ignored
    const jumps = await page.evaluate(() => window.__game.scene.getScene('RunnerScene').run.jumps);
    expect(jumps).toBe(2);
  });
});
