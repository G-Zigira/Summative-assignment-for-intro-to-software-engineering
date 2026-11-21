// ====================================================================================
//  WHERE THE MUSIC AND SOUNDS GO.   (full guide: docs/AUDIO.md)
//
//  1. Put your files in  public/assets/audio/   (e.g. title-theme.ogg and title-theme.mp3).
//  2. Replace a `null` below with the file name WITHOUT the extension, e.g.
//         title: 'title-theme',
//     (the game loads  title-theme.ogg  and  title-theme.mp3 — supply both for best support).
//  3. Reload the game. Nothing else to change. Slots left as `null` stay silent.
// ====================================================================================

/** Looping background music. One track plays at a time and crossfades when the scene changes. */
export const MUSIC = {
  title: null,        // title screen + trail select + codex
  courtyard: null,    // area ids from the trail JSON ("area": "courtyard")
  'wall-garden': null,
  road: null,
  placeholder: null,
  runner: null,       // the running minigame between areas
  trailComplete: null, // short sting played when a trail is finished (plays once, no loop)
};

/** Short sound effects. */
export const SFX = {
  click: null,        // any button press
  talk: null,         // starting a conversation with an NPC
  choose: null,       // picking a dialogue option
  codexUnlock: null,  // "New Codex entry" toast
  save: null,         // "Progress saved"
  error: null,        // "Couldn't save your progress"
  jump: null,         // runner minigame: jump
  crash: null,        // runner minigame: tripped over an obstacle
  arrive: null,       // runner minigame: reached the next area
  footstep: null,     // (optional) played while walking, every ~300 ms
};

export const AUDIO_FORMATS = ['ogg', 'mp3'];
