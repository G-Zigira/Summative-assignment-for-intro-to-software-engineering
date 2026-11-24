// Central place for every number that comes from the SRS (v1.1).
// If a requirement changes, change it here and in docs/TRACEABILITY.md.

export const CONFIG = Object.freeze({
  // --- Display -----------------------------------------------------------
  GAME_WIDTH: 960,
  GAME_HEIGHT: 540,
  TILE_SIZE: 64,

  // --- Gameplay (FR 1.1, FR 1.2) ----------------------------------------
  PLAYER_SPEED: 200, // px per second
  INTERACT_RANGE: 64, // FR 1.2: interaction is possible within 1 tile (64 px)

  // --- Usability (NFR 3) --------------------------------------------------
  // These are CSS pixels, not game pixels. The canvas is scaled to fit the
  // screen, so ui/button.js converts them to game pixels at runtime.
  MIN_TOUCH_TARGET_CSS_PX: 48,
  MIN_TOUCH_GAP_CSS_PX: 8,
  MIN_BODY_TEXT_CSS_PX: 16,
  // Screen areas covered by the on-screen D-pad (bottom left) and Talk button (bottom
  // right) on touch devices. Keep player starts and NPCs out of these (game pixels).
  TOUCH_ZONES: [
    { x: 0, y: 270, w: 280, h: 270 },
    { x: 780, y: 430, w: 180, h: 110 },
  ],

  // --- Travel minigame: the runner between areas (docs/MINIGAME.md) -----------
  RUNNER: {
    TARGET_SCORE: 250,     // reach this to arrive at the next area
    PX_PER_POINT: 25,      // distance run that earns 1 point
    START_SPEED: 320,      // px per second
    MAX_SPEED: 620,
    ACCEL: 10,             // px/s gained per second
    GRAVITY: 2400,
    JUMP_VELOCITY: 800,    // peak height about 133 px
    AIR_JUMP_VELOCITY: 760, // the second jump, pressed in the air (double jump)
    MAX_JUMPS: 2,
    COWRIE_POINTS: 5,      // each cowrie shell collected adds this many points
    GROUND_Y: 450,         // where the runner's feet stand
    PLAYER_X: 150,
    MIN_GAP_AIRTIME: 0.95, // gaps are at least this many seconds of running (always jumpable)
    EXTRA_GAP_AIRTIME: 0.9,
  },

  // --- Saving (FR 3.2, FR 3.5) --------------------------------------------
  SAVE_KEY: 'sankofa-trails/save',
  SAVE_VERSION: 1,
  SAVE_INDICATOR_MS: 2000,

  // --- Codex and dialogue (FR 3.4, FR 4.1, FR 4.2) ------------------------
  CODEX_TOAST_MS: 2500,
  TYPE_MS_PER_CHAR: 12,     // text appears letter by letter; any press shows the rest
  MAX_ITEM_WORDS: 45,       // a story piece (touched object) is a short note
  MAX_ITEMS_PER_SCENE: 4,
  CHOICES_MIN: 2,
  CHOICES_MAX: 4,
  MAX_CONTEXT_WORDS: 80,
  MAX_CODEX_WORDS: 100,
  CODEX_CATEGORIES: ['Figures', 'Places', 'Terms'],

  // --- Settings (FR 5.1) ---------------------------------------------------
  VOLUME_DEFAULT: 70,
  VOLUME_STEP: 10,
  // Multiplier applied to every font size. "medium" is the default.
  TEXT_SIZES: { small: 1, medium: 1.25, large: 1.5 },
  TEXT_SIZE_DEFAULT: 'medium',
  CONTROL_SCHEMES: ['auto', 'keyboard', 'touch'],
  CONTROL_SCHEME_DEFAULT: 'auto',
});
