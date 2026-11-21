import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/** Small deterministic random generator so every build produces identical pictures. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">${inner}</svg>`;

/**
 * jobs: [{ name, svg, width, height, out, type: 'png'|'jpeg', quality?, svgOut? }]
 * Renders each SVG in Chromium and writes the picture (and the editable .svg source).
 */
export async function renderAll(jobs) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const job of jobs) {
    mkdirSync(path.dirname(job.out), { recursive: true });
    await page.setViewportSize({ width: job.width, height: job.height });
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:${job.type === 'jpeg' ? '#000' : 'transparent'}">${job.svg}</body></html>`,
    );
    await page.screenshot({
      path: job.out, type: job.type, quality: job.type === 'jpeg' ? (job.quality ?? 80) : undefined,
      omitBackground: job.type === 'png', clip: { x: 0, y: 0, width: job.width, height: job.height },
    });
    if (job.svgOut) {
      mkdirSync(path.dirname(job.svgOut), { recursive: true });
      writeFileSync(job.svgOut, `<?xml version="1.0" encoding="UTF-8"?>\n${job.svg}\n`);
    }
    console.log('  rendered', path.relative(process.cwd(), job.out));
  }
  await browser.close();
}
