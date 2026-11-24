// ====================================================================================
//  WHERE THE MUSIC AND SOUNDS GO.   (full guide: docs/AUDIO.md)
//
//  NOTE: the game ships with sounds made by `npm run audio` (audio-src/make_audio.py): simple
//  synthesized placeholders. Replace any of them by dropping a file with the SAME NAME into
//  public/assets/audio/ (both .ogg and .mp3), or point a slot at a different name.
//
//  1. Put your files in  public/assets/audio/   (e.g. title-theme.ogg and title-theme.mp3).
//  2. Replace a `null` below with the file name WITHOUT the extension, e.g.
//         title: 'title-theme',
//     (the game loads  title-theme.ogg  and  title-theme.mp3 — supply both for best support).
//  3. Reload the game. Nothing else to change. Slots left as `null` stay silent.
// ====================================================================================

/** Looping background music. One track plays at a time and crossfades when the scene changes. */
export const MUSIC = {
  title: 'title-theme',          // title screen + trail select + codex
  courtyard: 'courtyard-loop',   // area ids from the trail JSON ("area": "courtyard")
  'wall-garden': 'wall-garden-loop',
  road: 'road-loop',
  forest: 'forest-loop',
  kirina: 'kirina-loop',
  'big-tree': 'big-tree-loop',
  placeholder: null,
  runner: 'runner-loop',         // the running minigame between areas
  trailComplete: 'trail-complete', // short sting played when a trail is finished (plays once, no loop)
};

/** Short sound effects. */
export const SFX = {
  click: 'click',               // any button press
  talk: 'talk',                 // starting a conversation with an NPC
  choose: 'choose',             // picking a dialogue option
  codexUnlock: 'codex-unlock',  // "New Codex entry" toast
  save: 'save',                 // "Progress saved"
  error: 'error',               // "Couldn't save your progress"
  footstep: 'footstep',         // played while walking, every ~300 ms
  jump: 'jump',                 // runner minigame: jump
  doubleJump: 'double-jump',    // runner minigame: second jump in the air
  collect: 'collect',           // a story piece found / a cowrie shell collected
  textBlip: 'text-blip',        // plays softly while story text appears letter by letter
  crash: 'crash',               // runner minigame: tripped over an obstacle
  arrive: 'arrive',             // runner minigame: reached the next area
};

export const AUDIO_FORMATS = ['ogg', 'mp3'];
