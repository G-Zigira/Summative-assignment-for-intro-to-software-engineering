import { expect } from '@playwright/test';

export const SAVE_KEY = 'sankofa-trails/save';

/** Collect page errors and console errors so tests can assert there are none. */
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

export const waitForScene = (page, key) =>
  page.waitForFunction((k) => window.__game?.scene.isActive(k), key);

/** Click at game coordinates (960x540 space), whatever the canvas is scaled to. */
export async function clickGame(page, x, y) {
  const box = await page.locator('#game canvas').boundingBox();
  const scale = box.width / 960;
  await page.mouse.click(box.x + x * scale, box.y + y * scale);
}

export const readSave = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)), SAVE_KEY);

export async function startNewGameAndTrail1(page) {
  await page.goto('/');
  await waitForScene(page, 'TitleScene');
  await clickGame(page, 480, 350); // New Game
  await waitForScene(page, 'TrailSelectScene');
  await clickGame(page, 480, 130); // Trail 1
  await waitForScene(page, 'GameScene');
  await page.waitForFunction(() => window.__game.scene.getScene('GameScene').player?.body);
}

/**
 * Walk to the NPC, start the dialogue, and click through it (choosing option 2 at decisions)
 * until the story scene changes or the trail ends. Returns what happened.
 */
export async function talkThroughScene(page) {
  const startStory = await page.evaluate(() => window.__game.scene.getScene('GameScene').story.id);
  await page.evaluate(() => {
    const s = window.__game.scene.getScene('GameScene');
    s.player.setPosition(s.npc.x - 60, s.npc.y); // within INTERACT_RANGE (64 px)
  });
  await page.keyboard.press('e', { delay: 60 });
  await page.waitForFunction(() => window.__game.scene.getScene('GameScene').dialogueOpen);

  for (let i = 0; i < 60; i += 1) {
    const info = await page.evaluate(() => {
      const g = window.__game;
      const s = g.scene.getScene('GameScene');
      return {
        trailSelect: g.scene.isActive('TrailSelectScene'),
        runner: g.scene.isActive('RunnerScene'),
        story: s.story?.id,
        open: s.dialogueOpen,
        options: s.ui?.optionIds?.length ?? 0,
      };
    });
    if (info.trailSelect) return 'trail-complete';
    if (info.runner) { // the travel minigame between areas: skip it (it has its own tests)
      await page.evaluate(() => window.__game.scene.getScene('RunnerScene').skip());
      await waitForScene(page, 'GameScene');
      await page.waitForFunction((id) => {
        const s = window.__game.scene.getScene('GameScene');
        return s.player?.body && s.story?.id !== id;
      }, startStory);
      return 'next-scene';
    }
    if (info.story !== startStory && !info.open) return 'next-scene';
    await page.keyboard.press(info.options > 0 ? '2' : 'Space', { delay: 40 });
    await page.waitForTimeout(80);
  }
  throw new Error('dialogue did not finish');
}

export { expect };
