import { type ControlSet, controlPress, controlTurns, deskKeys } from "@neon-spore/content";
import { type Command, CRANK_TURN, type SimConfig, windPerTickMilli } from "@neon-spore/sim";

/**
 * The one key on the desk keyboard that stands in for a hand **going round in
 * a circle**: THE CLAW's crank.
 *
 * A key cannot turn. Every other control on every panel is a press or a hold
 * and a key is exactly as good as a thumb at both, which is the whole of
 * `keys-desk.ts`'s bargain — but the crank is turned, and what winds the rope
 * is the *bearing* a finger reports going round it (`sim/crank.ts`). A key
 * held down reports nothing at all, so this turns the crank on the player's
 * behalf: one bearing per sim tick, a little further round each time, for as
 * long as the key is down.
 *
 * **At the speed the arm used to come home by itself**, which is
 * `windPerTickMilli` and is asked for rather than chosen here. That is the
 * honest stand-in: a desk player driving both seats gets back exactly the free
 * return the panel used to give everybody, and the thing they cannot feel — a
 * thumb going round and round for two seconds — is the thing the phone is for.
 *
 * **And with a shift held, the other way round**, which is the crank paying
 * rope out and the arm going back up (`sim/crank.ts`). A key cannot be turned
 * either way, so the direction is chosen when it goes down: the key alone
 * winds in, shift and the key raises the arm, and a player who wants to change
 * their mind lets go and presses again. Shift rather than a letter of its own,
 * because the desk keyboard is not allowed to spend one — the owner's rule is
 * that a panel borrows the keys that are already there (`keys-desk.ts`).
 *
 * Its own file beside `keys-slide.ts` for that file's reason: next door is the
 * pair of keys that carry something sideways and repeat on the tick, and this
 * is the one key that *turns* something on the tick. Both are keys whose whole
 * behaviour is what happens while they are held; everything that says one
 * thing once stays in `keys.ts`.
 */

export interface Cranking {
  /** Whether this key is the crank's; it has already been answered if so.
   * `back` is a shift held with it: the turn goes anticlockwise and the arm
   * goes up rather than home. */
  down(code: string, back?: boolean): boolean;
  /** The same question on the way up, and the hand comes off the crank. */
  up(code: string): boolean;
  /** One sim tick of a key that is still held: the next bearing. */
  tick(): void;
}

export function bindCranking(
  cfg: SimConfig,
  send: (player: 1 | 2, command: Command) => void,
  /** The panel this wave is played on, read fresh: a wave step changes it
   * under the same listener (`keys.ts`). */
  controls: () => ControlSet,
): Cranking {
  const step = windPerTickMilli(cfg);
  /** Where this rig's hand has got to round the circle, or null for no hand. */
  let at: number | null = null;
  /** Which way it is going round, fixed when the key went down: `1` winds the
   * rope in, `-1` pays it out. */
  let way: 1 | -1 = 1;

  /** The crank's key on this panel, if this panel has a crank at all. There is
   * at most one — `deskKeys` seats a control in one slot (`keys-desk.ts`). */
  const key = () => deskKeys(controls()).find((k) => controlTurns(k.control));

  return {
    down: (code, back = false) => {
      const k = key();
      if (k === undefined || k.code !== code) return false;
      way = back ? -1 : 1;
      // The grab, which carries no bearing: the first one this sends is only a
      // starting point, and the rope moves on the ones after it.
      send(k.player, controlPress(k.control).down);
      at = 0;
      return true;
    },
    up: (code) => {
      const k = key();
      if (k === undefined || k.code !== code) return false;
      at = null;
      const off = controlPress(k.control).up;
      if (off) send(k.player, off);
      return true;
    },
    tick: () => {
      const k = key();
      if (at === null || k === undefined) return;
      send(k.player, { kind: "drag", target: "crank", on: true, fromMilli: at });
      at = (at + way * step + CRANK_TURN) % CRANK_TURN;
    },
  };
}
