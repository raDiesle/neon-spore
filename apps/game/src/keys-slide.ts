import {
  type ControlSet,
  controlPress,
  type DeskKey,
  deskSlideKeys,
  deskStepSeats,
} from "@neon-spore/content";
import type { Layout } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";

/**
 * The two keys under each hand that move something **sideways**, and keep
 * moving it while they are held.
 *
 * Split out of `keys.ts` when the panel gate took that file past its 250-line
 * limit, along a seam it already had: next door is every key that *says*
 * something once — a trigger, a mouth, an arm — and this is the pair that
 * carries a thing along and repeats until the finger comes off.
 *
 * **Which thing, is the panel's answer and no longer this file's.** A/D and
 * J/L used to be the cannon and the plate by name, and every round that had
 * something to slide asked for letters of its own — Z and X for THE GAUGE's
 * valve, A and D again for PINBALL's bucket, in a second switch next door. The
 * pair is a *slot* now (`content/src/keys-desk.ts`): whatever this panel puts
 * on player 1's sideways pair is what A and D move, and the same for J and L.
 *
 * **Two kinds land in that slot and they are held differently.** A strip names
 * a *column*, so a key is a step and holding it steps again on a repeat driven
 * by the **sim tick** rather than by wall-clock time — a held key covers the
 * same ground on a slow machine as on a fast one. A valve or a bucket names a
 * *direction*, so the key is the hold itself: one command down, one up, and
 * nothing to repeat. `DeskKey.step` is which of the two this is, and it is the
 * only thing here that has to know.
 *
 * **A is still both seats.** One person at a desk is playing both halves, so
 * player 1's pair also carries player 2's strip along with it where the panel
 * has one, and J/L move that strip alone. It is the one convenience in this
 * file, and it is a convenience about a *person* rather than about a panel.
 *
 * Every press goes through the `send` it is given, which is the panel gate
 * (`content/src/control-sets-keys.ts`).
 */

/** Ticks (at `cfg.tickHz`, currently 120) before a held move key starts repeating. */
const KEY_REPEAT_DELAY_TICKS = 24;
/** Ticks between repeats once a held move key is repeating. */
const KEY_REPEAT_INTERVAL_TICKS = 8;

export interface Sliding {
  /** Whether this key is one of the four; it has already been answered if so. */
  down(code: string): boolean;
  /** The same question on the way up, and the release of a held one is sent. */
  up(code: string): boolean;
  /** One sim tick of whatever is still held. */
  tick(): void;
}

export function bindSliding(
  layout: () => Layout,
  mid: number,
  send: (player: 1 | 2, command: Command) => void,
  /** The panel this wave is played on, read fresh: a wave step changes it
   * under the same listener (`keys.ts`). */
  controls: () => ControlSet,
): Sliding {
  // Where each seat's strip stands, as this rig believes it. It starts in the
  // middle rather than at column zero, so the first press is a step from where
  // the ship actually is.
  const col: Record<1 | 2, number> = { 1: mid, 2: mid };
  const repeatTicks = new Map<string, number>();

  /** Both seats' sideways keys on this panel, as one list to look a code up
   * in. Read per press: the panel changes between waves. */
  const pairs = (): readonly DeskKey[] => [
    ...deskSlideKeys(controls(), 1),
    ...deskSlideKeys(controls(), 2),
  ];

  const stepStrip = (key: DeskKey): void => {
    const cols = layout().cols;
    col[key.player] = Math.min(cols - 1, Math.max(0, col[key.player] + (key.step ?? 0)));
    send(key.player, controlPress(key.control, col[key.player]).down);
  };

  /** One press of a strip key, and every seat it moves — `deskStepSeats` is
   * the rule, this is the stepping. */
  const stepAll = (key: DeskKey): void => {
    for (const k of deskStepSeats(controls(), key)) stepStrip(k);
  };

  return {
    down(code) {
      const key = pairs().find((k) => k.code === code);
      if (key === undefined) return false;
      if (key.step === undefined) {
        send(key.player, controlPress(key.control).down);
        return true;
      }
      stepAll(key);
      repeatTicks.set(code, KEY_REPEAT_DELAY_TICKS);
      return true;
    },
    up(code) {
      const key = pairs().find((k) => k.code === code);
      if (key === undefined) return false;
      repeatTicks.delete(code);
      // A held direction has a release and a strip has none: nothing in the
      // simulation lets go of a valve on its own, and a column is a place that
      // stays where it was put.
      const release = controlPress(key.control).up;
      if (release !== undefined) send(key.player, release);
      return true;
    },
    tick() {
      for (const [code, remaining] of repeatTicks) {
        if (remaining > 1) {
          repeatTicks.set(code, remaining - 1);
          continue;
        }
        const key = pairs().find((k) => k.code === code);
        if (key !== undefined) stepAll(key);
        repeatTicks.set(code, KEY_REPEAT_INTERVAL_TICKS);
      }
    },
  };
}
