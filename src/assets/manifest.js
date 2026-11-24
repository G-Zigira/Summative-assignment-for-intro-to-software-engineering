// Every picture the game loads. File names match what `npm run art` writes to public/assets/.
// To use your own art instead, overwrite the file with one of the same name and size
// (see docs/ART.md). Missing files never crash the game: scenes fall back to plain shapes.

export const ASSET_SCALE = 0.5; // pictures are drawn at 2x and shown at half size (sharp on high-DPI screens)

export const BACKGROUNDS = ['title', 'courtyard', 'wall-garden', 'road', 'forest', 'kirina', 'big-tree', 'placeholder',
  'kangaba-hall', 'forge', 'exile-plains', 'farm-village', 'village-square'];
export const PROPS = ['baobab', 'stall', 'pots', 'drum', 'carved-door', 'bush', 'rock', 'signpost', 'rug',
  'kora', 'iron-rod', 'anvil', 'tent', 'spears', 'wisdom-pot', 'web', 'fern', 'forest-tree', 'basket', 'calabash', 'campfire', 'cowrie', 'mortar',
  'horse-a', 'horse-b', 'horse-jump', 'soldier-a', 'soldier-b', 'spear',
  'know-scroll', 'know-adinkra', 'know-light', 'bad-thorn', 'bad-stone', 'bad-vial',
  ...['ember', 'desert', 'forest', 'village', 'battle'].flatMap((t) => ['a', 'b', 'c'].map((k) => `rt-${t}-${k}`))]; // runner themes
export const SPRITES = ['player', 'elder', 'guide', 'griot', 'child', 'anansi']; // 4 x 4 sheets of 96 x 128 frames: rows = down, left, right, up
export const SPRITE_FRAME = { w: 96, h: 128 };
export const DIRECTIONS = ['down', 'left', 'right', 'up'];

export const bgKey = (name) => `bg-${name}`;
export const propKey = (name) => `prop-${name}`;
export const spriteKey = (name) => `sprite-${name}`;

/** Queue every file for loading. Call from a scene's preload(). */
export function loadAll(scene) {
  scene.load.setPath('assets');
  BACKGROUNDS.forEach((n) => scene.load.image(bgKey(n), `backgrounds/${n}.jpg`));
  PROPS.forEach((n) => scene.load.image(propKey(n), `props/${n}.png`));
  SPRITES.forEach((n) =>
    scene.load.spritesheet(spriteKey(n), `sprites/${n}.png`, { frameWidth: SPRITE_FRAME.w, frameHeight: SPRITE_FRAME.h }));
  scene.load.image('runner-sky', 'backgrounds/runner-sky.jpg');
  scene.load.image('battle-sky', 'backgrounds/battle-sky.jpg');
  scene.load.image('runner-ground', 'backgrounds/runner-ground.png');
  ['ember', 'desert', 'forest', 'village'].forEach((t) => scene.load.image(`rt-${t}-sky`, `backgrounds/rt-${t}-sky.jpg`));
  ['ember', 'desert', 'forest', 'village', 'battle'].forEach((t) => scene.load.image(`rt-${t}-ground`, `backgrounds/rt-${t}-ground.png`));
  scene.load.image('emblem', 'ui/emblem.png');
  scene.load.setPath('');
}

/** Walk-cycle animations: `<sprite>-<direction>` (4 frames) and `<sprite>-idle-<direction>` (1 frame). */
export function createAnimations(scene) {
  for (const name of SPRITES) {
    const key = spriteKey(name);
    if (!scene.textures.exists(key)) continue;
    DIRECTIONS.forEach((dir, row) => {
      const start = row * 4;
      scene.anims.create({
        key: `${name}-${dir}`, frameRate: 8, repeat: -1,
        frames: scene.anims.generateFrameNumbers(key, { start, end: start + 3 }),
      });
    });
  }
}

export const hasTexture = (scene, key) => scene.textures.exists(key) && key !== '__MISSING';
