// Usage:
//   npm run validate:content            errors fail, warnings are printed
//   npm run validate:content:release    warnings (e.g. un-reviewed trails) also fail
//
// Run this before every commit that touches src/data/.

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTrail, validateCodex } from '../src/content/validate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src', 'data');
const release = process.argv.includes('--release');

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

const codex = readJson(path.join(dataDir, 'codex.json'));
const codexResult = validateCodex(codex);
const codexIds = new Set(codex.map((c) => c.id));

const trailFiles = readdirSync(path.join(dataDir, 'trails')).filter((f) => f.endsWith('.json')).sort();
const errors = [...codexResult.errors];
const warnings = [...codexResult.warnings];
const orders = new Map();
const trailIds = new Set();

for (const file of trailFiles) {
  let trail;
  try {
    trail = readJson(path.join(dataDir, 'trails', file));
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }
  const result = validateTrail(trail, codexIds);
  errors.push(...result.errors);
  warnings.push(...result.warnings);
  if (orders.has(trail.order)) errors.push(`${file}: "order" ${trail.order} is already used by ${orders.get(trail.order)}`);
  orders.set(trail.order, file);
  trailIds.add(trail.id);
}

for (const entry of codex) {
  if (!trailIds.has(entry.trailId)) errors.push(`codex "${entry.id}": trailId "${entry.trailId}" is not a trail`);
}

console.log(`Checked ${trailFiles.length} trail file(s) and ${codex.length} codex entries.`);
warnings.forEach((w) => console.warn(`  warning: ${w}`));
errors.forEach((e) => console.error(`  ERROR:   ${e}`));

const failed = errors.length > 0 || (release && warnings.length > 0);
console.log(failed ? '\nContent validation FAILED.' : '\nContent validation passed.');
process.exit(failed ? 1 : 0);
