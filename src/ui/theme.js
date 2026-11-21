// Colours use a high-contrast palette (NFR 3: text/background contrast >= 4.5:1).
// System fonts only: no font download, which keeps the load time down (NFR 2).

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export const COLORS = {
  background: 0x14110f,
  panel: 0x1f1a16,
  button: 0x3a2d22,
  buttonHover: 0x5a4330,
  buttonDisabled: 0x2a2420,
  border: 0x5c5148,
  accent: 0xe0a030,
  context: 0x4aa3a0,
  // CSS colour strings for Phaser text
  text: '#f5efe6',
  textDisabled: '#9b9085',
  accentText: '#f2c14e',
  contextText: '#7fd1ce',
  warning: '#ff9a8a',
};

/** Floor colours per area id; unknown areas get a neutral colour. */
export const AREA_COLORS = {
  courtyard: 0x2d3b2a,
  'wall-garden': 0x3a3326,
  road: 0x2b3340,
  placeholder: 0x333333,
};
