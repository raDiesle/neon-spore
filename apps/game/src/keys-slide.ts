import type { Layout } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";

/**
 * The desk keys that **slide** something, and keep sliding while they are
 * held.
 *
 * Split out of `keys.ts` when the panel gate took that file past its 250-line
 * limit, along a seam it already had: next door is every key that *says*
 * something once — a trigger, a mouth, an arm, a page of a guide — and this is
 * the four that move a swelling along the hull and repeat until the finger
 * comes off. They share a buffer and nothing else, and only these four need a
 * timer, a column of their own to remember and a place in the tick loop.
 *
 * A/D slide the cannon *and* the shield together, J/L move the shield alone.
 * One step on keydown, then steps on a repeat driven by the **sim tick**
 * rather than by wall-clock time, so a held key covers the same ground on a
 * slow machine as on a fast one.
 *
 * Every press goes through the `send` it is given, which is the panel gate
 * (`content/src/control-sets-keys.ts`): on a wave whose panel has no strip,
 * holding A moves nothing and sends nothing.
 */

/** Ticks (at `cfg.tickHz`, currently 120) before a held move key starts repeating. */
const KEY_REPEAT_DELAY_TICKS = 24;
/** Ticks between repeats once a held move key is repeating. */
const KEY_REPEAT_INTERVAL_TICKS = 8;

export interface Sliding {
  /** Whether this key slides something; it has already been done if so. */
  down(code: string): boolean;
  /** The key came up: stop repeating it. */
  up(code: string): void;
  /** One sim tick of whatever is still held. */
  tick(): void;
}

export function bindSliding(
  layout: () => Layout,
  mid: number,
  send: (player: 1 | 2, command: Command) => void,
): Sliding {
  // Where each swelling stands, as this rig believes it. `-1` until the first
  // press, so the first step is from the middle rather than from column zero.
  let cannon = mid;
  let shield = mid;
  const repeatTicks = new Map<string, number>();

  const moveCannon = (delta: number): void => {
    const cols = layout().cols;
    cannon = Math.min(cols - 1, Math.max(0, cannon + delta));
    send(1, { kind: "cannonCol", col: cannon });
  };
  const moveShield = (delta: number): void => {
    const cols = layout().cols;
    shield = Math.min(cols - 1, Math.max(0, shield + delta));
    send(2, { kind: "shieldCol", col: shield });
  };

  const keys: Record<string, () => void> = {
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

  return {
    down(code) {
      const key = keys[code];
      if (!key) return false;
      key();
      repeatTicks.set(code, KEY_REPEAT_DELAY_TICKS);
      return true;
    },
    up(code) {
      repeatTicks.delete(code);
    },
    tick() {
      for (const [code, remaining] of repeatTicks) {
        if (remaining > 1) {
          repeatTicks.set(code, remaining - 1);
          continue;
        }
        keys[code]?.();
        repeatTicks.set(code, KEY_REPEAT_INTERVAL_TICKS);
      }
    },
  };
}
