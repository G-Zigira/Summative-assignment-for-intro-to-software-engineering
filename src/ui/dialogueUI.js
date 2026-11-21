import { CONFIG } from '../config.js';
import { COLORS } from './theme.js';
import { makeButton, makeText } from './button.js';

// The dialogue / context-panel / choice UI shown at the bottom of the screen.
// It only draws things and reports clicks; the story logic lives in systems/dialogue.js.

const PAD = 20;
const MARGIN = 16;
const PANEL_W = CONFIG.GAME_WIDTH - 2 * MARGIN;
const X0 = MARGIN;

export class DialogueUI {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    /** Called when the player presses Space/Enter on a message panel. */
    this.confirm = null;
    /** Option ids in display order, for the 1-4 number keys. */
    this.optionIds = [];
    this.onChoose = null;
  }

  get isOpen() {
    return this.items.length > 0;
  }

  hide() {
    this.items.forEach((i) => i.destroy());
    this.items = [];
    this.confirm = null;
    this.optionIds = [];
    this.onChoose = null;
  }

  /** Number-key shortcut for choices (desktop). */
  chooseByIndex(index) {
    const id = this.optionIds[index];
    if (id !== undefined) this.onChoose?.(id);
  }

  #text(str, size, style = {}) {
    const t = makeText(this.scene, 0, 0, str, size, {
      wordWrap: { width: PANEL_W - 2 * PAD },
      ...style,
    }).setDepth(21);
    this.items.push(t);
    return t;
  }

  #panel(height, borderColor) {
    const top = CONFIG.GAME_HEIGHT - MARGIN - height;
    const bg = this.scene.add
      .rectangle(CONFIG.GAME_WIDTH / 2, top + height / 2, PANEL_W, height, COLORS.panel, 0.97)
      .setStrokeStyle(3, borderColor)
      .setDepth(20)
      .setInteractive(); // swallows clicks so they do not reach the world underneath
    this.items.push(bg);
    return top;
  }

  /**
   * A text panel with a title/speaker, body and one button.
   * Used for dialogue lines, outcomes, context panels and the trail-complete message.
   */
  showMessage({ title, text, buttonLabel = 'Continue', onClose, context = false }) {
    this.hide();
    const titleText = title
      ? this.#text(title, 22, {
          fontStyle: 'bold',
          color: context ? COLORS.contextText : COLORS.accentText,
        })
      : null;
    const body = this.#text(text, 20);
    const button = makeButton(this.scene, {
      width: 180, height: 56, label: buttonLabel, fontSize: 20, depth: 22,
      onClick: () => onClose?.(),
    });
    this.items.push(button);

    const height = PAD + (titleText ? titleText.height + 8 : 0) + body.height + 14 + button.height + PAD;
    const top = this.#panel(height, context ? COLORS.context : COLORS.accent);

    let y = top + PAD;
    if (titleText) {
      titleText.setPosition(X0 + PAD, y);
      y += titleText.height + 8;
    }
    body.setPosition(X0 + PAD, y);
    button.setPosition(X0 + PANEL_W - PAD - button.width / 2, top + height - PAD - button.height / 2);
    this.confirm = () => onClose?.();
  }

  /** A context panel (FR 4.1): same layout, teal border. */
  showContext(node, onClose) {
    this.showMessage({ title: node.title, text: node.text, buttonLabel: 'Close', onClose, context: true });
  }

  /** FR 3.4: 2-4 options as buttons. */
  showDecision(node, onChoose) {
    this.hide();
    const prompt = this.#text(node.prompt, 22, { fontStyle: 'bold', color: COLORS.accentText });
    const buttons = node.options.map((option, i) => {
      const b = makeButton(this.scene, {
        width: PANEL_W - 2 * PAD, height: 56, label: `${i + 1}.  ${option.text}`,
        fontSize: 20, depth: 22, wrap: true, onClick: () => onChoose(option.id),
      });
      this.items.push(b);
      return b;
    });

    const gap = 8;
    const buttonsHeight = buttons.reduce((sum, b) => sum + b.height, 0) + gap * (buttons.length - 1);
    const height = PAD + prompt.height + 12 + buttonsHeight + PAD;
    const top = this.#panel(height, COLORS.accent);

    prompt.setPosition(X0 + PAD, top + PAD);
    let y = top + PAD + prompt.height + 12;
    for (const b of buttons) {
      b.setPosition(X0 + PANEL_W / 2, y + b.height / 2);
      y += b.height + gap;
    }
    this.optionIds = node.options.map((o) => o.id);
    this.onChoose = onChoose;
  }
}
