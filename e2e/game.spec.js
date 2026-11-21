import { test, expect } from '@playwright/test';
import {
  SAVE_KEY, watchErrors, waitForScene, clickGame, readSave, startNewGameAndTrail1, talkThroughScene,
} from './helpers.js';

test.describe('desktop', () => {
  test('title screen loads without errors', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page.locator('#game canvas')).toBeVisible();
    await waitForScene(page, 'TitleScene');
    expect(await page.evaluate(() => window.__session.loadStatus)).toBe('none');
    expect(errors).toEqual([]);
  });

  test('FR 1.1: arrow keys move the character; it stops when released', async ({ page }) => {
    await startNewGameAndTrail1(page);
    const x0 = await page.evaluate(() => window.__game.scene.getScene('GameScene').player.x);
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(400);
    await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(150);
    const x1 = await page.evaluate(() => window.__game.scene.getScene('GameScene').player.x);
    expect(x1).toBeGreaterThan(x0 + 40);
    await page.waitForTimeout(200);
    const x2 = await page.evaluate(() => window.__game.scene.getScene('GameScene').player.x);
    expect(Math.abs(x2 - x1)).toBeLessThan(2); // stopped
  });

  test('FR 1.2: no dialogue out of range, prompt and dialogue in range', async ({ page }) => {
    await startNewGameAndTrail1(page);
    await page.keyboard.press('e', { delay: 60 });
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.__game.scene.getScene('GameScene').dialogueOpen)).toBe(false);

    await page.evaluate(() => {
      const s = window.__game.scene.getScene('GameScene');
      s.player.setPosition(s.npc.x - 60, s.npc.y);
    });
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__game.scene.getScene('GameScene').prompt.visible)).toBe(true);
    await page.keyboard.press('e', { delay: 60 });
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').dialogueOpen);
  });

  test('plays Trail 1 start to finish: unlocks, saves, and Continue (FR 3.2, 3.3, 3.4, 4.2.1)', async ({ page }) => {
    const errors = watchErrors(page);
    await startNewGameAndTrail1(page);

    expect(await talkThroughScene(page)).toBe('next-scene'); // scene 1 -> SP-1 save
    let save = await readSave(page);
    expect(save).toMatchObject({ trailId: 'trail1', sceneId: 't1-s2', areaId: 'wall-garden', position: { x: 120, y: 230 } });
    expect(save.unlockedCodex).toEqual(expect.arrayContaining(['codex-sankofa', 'codex-adinkra']));
    expect(save.choices).toEqual([{ decisionId: 't1-s1-d1', optionId: 'b' }]);

    // --- Continue after a reload returns to the same scene (FR 3.2.3)
    await page.reload();
    await waitForScene(page, 'TitleScene');
    expect(await page.evaluate(() => window.__session.loadStatus)).toBe('ok');
    await clickGame(page, 480, 270); // Continue
    await waitForScene(page, 'GameScene');
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').player?.body);
    expect(await page.evaluate(() => window.__game.scene.getScene('GameScene').story.id)).toBe('t1-s2');

    // --- Finish the trail
    expect(await talkThroughScene(page)).toBe('next-scene');
    expect(await talkThroughScene(page)).toBe('trail-complete');
    save = await readSave(page);
    expect(save.completedTrails).toEqual(['trail1']);
    expect(save.unlockedTrails).toEqual(['trail1', 'trail2']); // FR 3.3
    expect(save.unlockedCodex.sort()).toEqual(['codex-adinkra', 'codex-ghana', 'codex-sankofa']);
    expect(save).toMatchObject({ trailId: null, sceneId: null, position: null }); // SP-3
    expect(errors).toEqual([]);
  });

  test('SP-4: manual save from the pause menu restores the position (FR 3.2.1 d)', async ({ page }) => {
    await startNewGameAndTrail1(page);
    await page.evaluate(() => window.__game.scene.getScene('GameScene').player.setPosition(300, 200));
    await page.keyboard.press('Escape', { delay: 60 });
    await waitForScene(page, 'PauseScene');
    await clickGame(page, 480, 230); // Save
    await page.waitForFunction((k) => localStorage.getItem(k) !== null, SAVE_KEY);
    expect(await readSave(page)).toMatchObject({ trailId: 'trail1', sceneId: 't1-s1', position: { x: 300, y: 200 } });

    await page.reload();
    await waitForScene(page, 'TitleScene');
    await clickGame(page, 480, 270); // Continue
    await waitForScene(page, 'GameScene');
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').player?.body);
    const pos = await page.evaluate(() => {
      const p = window.__game.scene.getScene('GameScene').player;
      return { x: Math.round(p.x), y: Math.round(p.y) };
    });
    expect(pos).toEqual({ x: 300, y: 200 });
  });

  test('Quit to Title keeps the last save point: Continue works and unsaved progress is dropped', async ({ page }) => {
    await startNewGameAndTrail1(page);
    await page.evaluate(() => window.__game.scene.getScene('GameScene').player.setPosition(300, 200));
    await page.keyboard.press('Escape', { delay: 60 });
    await waitForScene(page, 'PauseScene');
    await clickGame(page, 480, 230); // Save
    await page.waitForFunction((k) => localStorage.getItem(k) !== null, SAVE_KEY);
    await page.keyboard.press('Escape', { delay: 60 }); // close the pause menu (Resume)
    await page.waitForFunction(() => !window.__game.scene.isActive('PauseScene'));

    // Walk somewhere else WITHOUT saving, then quit to the title screen.
    await page.evaluate(() => window.__game.scene.getScene('GameScene').player.setPosition(500, 450));
    await page.keyboard.press('Escape', { delay: 60 });
    await waitForScene(page, 'PauseScene');
    await clickGame(page, 480, 390); // Quit to Title
    await waitForScene(page, 'TitleScene');

    expect(await page.evaluate(() => window.__session.loadStatus)).toBe('ok');
    await clickGame(page, 480, 270); // Continue
    await waitForScene(page, 'GameScene');
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').player?.body);
    const pos = await page.evaluate(() => {
      const p = window.__game.scene.getScene('GameScene').player;
      return { x: Math.round(p.x), y: Math.round(p.y) };
    });
    expect(pos).toEqual({ x: 300, y: 200 }); // the saved spot, not (500, 450)
  });

  test('FR 3.3: completing a trail unlocks the next one on the selection screen', async ({ page }) => {
    await startNewGameAndTrail1(page);
    await talkThroughScene(page);
    await talkThroughScene(page);
    expect(await talkThroughScene(page)).toBe('trail-complete');
    await waitForScene(page, 'TrailSelectScene');
    await clickGame(page, 480, 206); // Trail 2 is now enabled
    await waitForScene(page, 'GameScene');
    expect(await page.evaluate(() => window.__game.scene.getScene('GameScene').trail.id)).toBe('trail2');
  });
});

test.describe('storage failures (FR 3.5, NFR 8)', () => {
  test('FR 3.5.1: storage blocked -> notice, no Continue, game still playable', async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new DOMException('denied', 'SecurityError'); },
      });
    });
    await page.goto('/');
    await waitForScene(page, 'TitleScene');
    expect(await page.evaluate(() => window.__session.storageAvailable)).toBe(false);
    expect(await page.evaluate(() => window.__session.loadStatus)).toBe('unavailable');

    await clickGame(page, 480, 350); // New Game
    await waitForScene(page, 'TrailSelectScene');
    await clickGame(page, 480, 130);
    await waitForScene(page, 'GameScene');
    expect(await talkThroughScene(page)).toBe('next-scene'); // plays on, saving silently skipped
    expect(errors).toEqual([]);
  });

  test('FR 3.5.3: corrupted save -> no crash, New Game replaces it after confirming', async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript((key) => localStorage.setItem(key, '{this is not json'), SAVE_KEY);
    await page.goto('/');
    await waitForScene(page, 'TitleScene');
    expect(await page.evaluate(() => window.__session.loadStatus)).toBe('corrupt');

    await clickGame(page, 480, 350); // first tap only asks for confirmation
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.__game.scene.isActive('TitleScene'))).toBe(true);
    await clickGame(page, 480, 350); // second tap confirms
    await waitForScene(page, 'TrailSelectScene');
    expect(await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY)).toBeNull();
    expect(errors).toEqual([]);
  });

  test('FR 3.5.3: save from a different version -> treated as unreadable, not a crash', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ version: 999 })), SAVE_KEY);
    await page.goto('/');
    await waitForScene(page, 'TitleScene');
    expect(await page.evaluate(() => window.__session.loadStatus)).toBe('incompatible');
  });
});

test.describe('travel minigame (runner)', () => {
  async function reachRunner(page) {
    await startNewGameAndTrail1(page);
    await page.evaluate(() => {
      const s = window.__game.scene.getScene('GameScene');
      s.player.setPosition(s.npc.x - 60, s.npc.y);
    });
    await page.keyboard.press('e', { delay: 60 });
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').dialogueOpen);
    for (let i = 0; i < 60 && !(await page.evaluate(() => window.__game.scene.isActive('RunnerScene'))); i += 1) {
      const options = await page.evaluate(() => window.__game.scene.getScene('GameScene').ui?.optionIds?.length ?? 0);
      await page.keyboard.press(options > 0 ? '2' : 'Space', { delay: 40 });
      await page.waitForTimeout(80);
    }
    await waitForScene(page, 'RunnerScene');
  }
  const runner = (page, fn) => page.evaluate(fn);

  test('moving to a new area starts the runner; the action button jumps; the save was already made', async ({ page }) => {
    const errors = watchErrors(page);
    await reachRunner(page);
    expect(await readSave(page)).toMatchObject({ trailId: 'trail1', sceneId: 't1-s2' }); // saved before the run
    await page.keyboard.press('Space', { delay: 60 }); // start
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene').state === 'running');
    await page.keyboard.press('Space', { delay: 60 }); // jump
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene').run.y > 0 || window.__game.scene.getScene('RunnerScene').run.jumps > 0);
    expect(await runner(page, () => window.__game.scene.getScene('RunnerScene').run.jumps)).toBeGreaterThan(0);
    await page.waitForTimeout(1500); // score grows while running (or the run ended by tripping)
    expect(await runner(page, () => window.__game.scene.getScene('RunnerScene').run.distance)).toBeGreaterThan(100);
    expect(errors).toEqual([]);
  });

  test('reaching the target score arrives at the next area', async ({ page }) => {
    await reachRunner(page);
    await page.evaluate(() => window.__game.scene.getScene('RunnerScene').debugWin());
    await waitForScene(page, 'GameScene');
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').story?.id === 't1-s2');
  });

  test('tripping shows a retry message; the Skip button always works', async ({ page }) => {
    await reachRunner(page);
    await page.keyboard.press('Space', { delay: 60 }); // start, then never jump again
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene').state === 'crashed', null, { timeout: 15000 });
    await page.waitForTimeout(450);
    await page.keyboard.press('Space', { delay: 60 }); // retry
    await page.waitForFunction(() => window.__game.scene.getScene('RunnerScene').state === 'running');
    const b = await page.evaluate(() => { const s = window.__game.scene.getScene('RunnerScene').skipButton; return { x: s.bg.x, y: s.bg.y }; });
    await clickGame(page, b.x, b.y);
    await waitForScene(page, 'GameScene');
    await page.waitForFunction(() => window.__game.scene.getScene('GameScene').story?.id === 't1-s2');
  });
});
