import type { Layout } from "@neon-spore/render";
import type { InputBuffer } from "./input.js";

/**
 * The keyboard, for playing both roles alone at a desk. Its own file rather
 * than the tail of `input.ts`: touch is the game's input and this is the test
 * rig's, and the two only ever met in the same file because they push into the
 * same buffer.
 */

export interface KeyBindings {
  buffer: InputBuffer;
  layout: () => Layout;
  isOver: () => boolean;
  onPauseToggle: () => void;
  onWaveStep: (delta: number) => void;
}

/** Ticks (at `cfg.tickHz`, currently 120) before a held move key starts repeating. */
const KEY_REPEAT_DELAY_TICKS = 24;
/** Ticks between repeats once a held move key is repeating. */
const KEY_REPEAT_INTERVAL_TICKS = 8;

/**
 * A/D slide the cannon *and* the shield together, J/L move the shield alone.
 * Holding any of them keeps sliding: one step on keydown, then steps on a
 * repeat timer driven by `tick()` — the sim tick, not wall-clock time, so a
 * held key is exactly as reproducible as everything else in `sim`.
 */
export function bindKeys({
  buffer,
  layout,
  isOver,
  onPauseToggle,
  onWaveStep,
}: KeyBindings): () => void {
  let cannon = -1;
  let shield = -1;
  const held = new Set<string>();
  const repeatTicks = new Map<string, number>();

  const moveCannon = (delta: number): void => {
    const cols = layout().cols;
    cannon = Math.min(cols - 1, Math.max(0, cannon + delta));
    buffer.push(1, { kind: "cannonCol", col: cannon });
  };
  const moveShield = (delta: number): void => {
    const cols = layout().cols;
    shield = Math.min(cols - 1, Math.max(0, shield + delta));
    buffer.push(2, { kind: "shieldCol", col: shield });
  };
  const moveKeys: Record<string, () => void> = {
    KeyA: () => {
      moveCannon(-1);
      moveShield(-1);
    },
    KeyD: () => {
      moveCannon(1);
      moveShield(1);
    },
    KeyJ: () => moveShield(-1),
    KeyL: () => moveShield(1),
  };

  window.addEventListener("keydown", (e) => {
    if (held.has(e.code)) return;
    held.add(e.code);
    const cols = layout().cols;
    if (cannon < 0) cannon = Math.floor(cols / 2);
    if (shield < 0) shield = Math.floor(cols / 2);

    const moveKey = moveKeys[e.code];
    if (moveKey) {
      moveKey();
      repeatTicks.set(e.code, KEY_REPEAT_DELAY_TICKS);
      return;
    }
    switch (e.code) {
      case "KeyI":
        buffer.push(1, { kind: "guard" });
        break;
      case "KeyS":
        buffer.push(1, { kind: "intake" });
        break;
      case "KeyW":
        buffer.push(2, { kind: "fire", color: "red" });
        buffer.push(1, { kind: "guard" });
        break;
      // Red on its own. W sends red *and* a guard, which is one press for a
      // whole defence and two gestures for THE MIRROR — a sequence asking for
      // a red shot and nothing else cannot be answered with it.
      case "KeyQ":
        buffer.push(2, { kind: "fire", color: "red" });
        break;
      case "KeyE":
        buffer.push(2, { kind: "fire", color: "cyan" });
        break;
      case "ArrowRight":
        e.preventDefault();
        onWaveStep(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        onWaveStep(-1);
        break;
      case "KeyP":
        onPauseToggle();
        break;
      case "Enter":
        if (isOver()) buffer.push(1, { kind: "restart" });
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    repeatTicks.delete(e.code);
  });

  /** Called once per sim tick to advance held-key repeats. */
  return function tick(): void {
    for (const [code, remaining] of repeatTicks) {
      if (remaining > 1) {
        repeatTicks.set(code, remaining - 1);
        continue;
      }
      moveKeys[code]?.();
      repeatTicks.set(code, KEY_REPEAT_INTERVAL_TICKS);
    }
  };
}
