// ====================================================================================
//  WHERE THE MUSIC AND SOUNDS GO.   Step-by-step guide: docs/AUDIO-HOWTO.md
//
//  Every sound is a file in  public/assets/audio/  named  <name>.mp3  (an  <name>.ogg  next to it is
//  optional). The list below says which file plays when. The game ships with simple synthesized
//  placeholders (made by `npm run audio`).
//
//  EASIEST WAY TO REPLACE ONE (needs Node, which you already have):
//      npm run audio:list                                  shows every slot and what is in it
//      npm run audio:set -- ~/Downloads/boom.mp3 crash     puts your file in the "crash" slot
//  OR by hand: rename your mp3 to the file name shown below (e.g. crash.mp3), copy it into
//  public/assets/audio/ over the old one, and reload the page.
//  To give a slot a different file name, change the text after the colon (no extension).
//  A slot set to null stays silent.
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
  'kangaba-hall': 'kangaba-hall-loop', // The Lion's Path, scene 1 (starts as a copy of the courtyard loop)
  forge: 'forge-loop',                 // The Lion's Path, scene 2
  'exile-plains': 'exile-plains-loop', // The Lion's Path, scene 3
  'farm-village': 'farm-village-loop', // The Web of Wisdom, scene 2
  'village-square': 'village-square-loop', // The Web of Wisdom, scene 4
  placeholder: null,
  runner: 'runner-loop',         // the running minigame (between areas and in Mini Games)
  horse: 'horse-loop',           // Horse Charge minigame
  basket: 'basket-loop',         // Wisdom Catch minigame
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
  arrive: 'arrive',             // minigame won / reached the next area
  throwSpear: 'throw-spear',    // Horse Charge: spear thrown
  soldierDown: 'soldier-down',  // Horse Charge: soldier stopped
  badCatch: 'bad-catch',        // Wisdom Catch: caught a bad thing (-3 shells)
  gameOver: 'game-over',        // arcade: the run ended
};

// mp3 is tried first (every browser plays it), so a single .mp3 file is enough.
export const AUDIO_FORMATS = ['mp3', 'ogg'];
