// Helper for replacing the game's sounds and music.   See docs/AUDIO-HOWTO.md
//
//   npm run audio:list                                   every slot, its file, and whether it is still the generated placeholder
//   npm run audio:set -- <your-file> <slot> [--keep-ogg]  put your file into a slot (slot = name like "crash", or a file name like "jump")
//
// <your-file> can be mp3 (copied as it is) or wav/ogg/m4a/flac (converted to mp3 if ffmpeg is installed).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public', 'assets', 'audio');
const hashFile = path.join(root, 'audio-src', 'generated-hashes.json');
const { MUSIC, SFX } = await import(pathToFileURL(path.join(root, 'src', 'audio', 'audioManifest.js')).href);

const sha = (f) => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
const generated = fs.existsSync(hashFile) ? JSON.parse(fs.readFileSync(hashFile, 'utf8')) : {};
const slots = [
  ...Object.entries(MUSIC).map(([key, file]) => ({ kind: 'music', key, file })),
  ...Object.entries(SFX).map(([key, file]) => ({ kind: 'sfx', key, file })),
];
const size = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;

function list() {
  console.log('kind   slot               file                     status');
  for (const s of slots) {
    const mp3 = s.file && path.join(dir, `${s.file}.mp3`);
    let status;
    if (!s.file) status = 'silent (null)';
    else if (!fs.existsSync(mp3)) status = 'MISSING: add ' + s.file + '.mp3';
    else status = (generated[`${s.file}.mp3`] === sha(mp3) ? 'placeholder (generated)' : 'YOURS') + `  ${size(mp3)}`;
    console.log(`${s.kind.padEnd(6)} ${s.key.padEnd(18)} ${(s.file ?? '-').padEnd(24)} ${status}`);
  }
}

function set(args) {
  const [input, slotName] = args.filter((a) => !a.startsWith('--'));
  const keepOgg = args.includes('--keep-ogg');
  if (!input || !slotName) { console.error('Usage: npm run audio:set -- <your-file> <slot>\nRun "npm run audio:list" to see the slots.'); process.exit(1); }
  if (!fs.existsSync(input)) { console.error(`I cannot find the file: ${input}`); process.exit(1); }
  const match = slots.filter((s) => s.key.toLowerCase() === slotName.toLowerCase() || s.file === slotName);
  if (match.length === 0) { console.error(`There is no slot called "${slotName}". Run "npm run audio:list" to see them.`); process.exit(1); }
  const file = match[0].file;
  if (!file) { console.error(`The slot "${slotName}" is set to null (silent) in src/audio/audioManifest.js. Give it a file name first.`); process.exit(1); }
  const shared = slots.filter((s) => s.file === file).map((s) => s.key);
  if (shared.length > 1) console.log(`Note: ${shared.join(', ')} all use "${file}", so they will all change.`);

  const target = path.join(dir, `${file}.mp3`);
  fs.mkdirSync(dir, { recursive: true });
  if (path.extname(input).toLowerCase() === '.mp3') fs.copyFileSync(input, target);
  else {
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-ac', match[0].kind === 'music' ? '2' : '1', '-b:a', '160k', target]);
    if (r.error || r.status !== 0) { console.error('That file is not an mp3 and ffmpeg is not available to convert it. Convert it to mp3 first (for example with an online converter) and try again.'); process.exit(1); }
  }
  // The old generated .ogg would be ignored by the browser anyway; remove it so nothing stale is left.
  const ogg = path.join(dir, `${file}.ogg`);
  if (!keepOgg && fs.existsSync(ogg)) { fs.unlinkSync(ogg); console.log(`Removed the old placeholder ${file}.ogg`); }
  console.log(`Done: ${match[0].kind} slot "${match[0].key}" now plays your file (${size(target)}) as public/assets/audio/${file}.mp3\nReload the game (Ctrl+Shift+R) to hear it.`);
  if (match[0].kind === 'music') console.log('Tip: music loops, so choose a track that ends where it starts (no long silence at the end).');
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'list') list();
else if (cmd === 'set') set(rest);
else if (cmd === 'hashes') { // maintainers only: remember which files are the generated ones
  const out = {};
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.mp3'))) out[f] = sha(path.join(dir, f));
  fs.writeFileSync(hashFile, JSON.stringify(out, null, 1));
  console.log(`Wrote ${Object.keys(out).length} hashes`);
} else console.log('Commands: list | set <file> <slot>');
