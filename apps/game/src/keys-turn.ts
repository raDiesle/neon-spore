import { type ControlSet, controlPress, controlTurns, deskKeys } from "@neon-spore/content";
import {
  BEARING_TURN,
  type Command,
  NO_BEARING,
  orreryTurnPerTickMilli,
  type SimConfig,
  windPerTickMilli,
} from "@neon-spore/sim";

/**
 * The desk keyboard's two keys that stand in for a hand **going round in a
 * circle**: THE CLAW's crank on the panel, and THE ORRERY's ring on the field.
 *
 * A key cannot turn. Every other control in the game is a press or a hold and
 * a key is exactly as good as a thumb at both, which is the whole of
 * `keys-desk.ts`'s bargain — but these two are turned, and what they answer is
 * the *bearing* a finger reports going round them (`sim/bearing.ts`). A key
 * held down reports nothing at all, so each rig below turns on the player's
 * behalf: one bearing per sim tick, a little further round each time, for as
 * long as the key is down.
 *
 * **At the rate the simulation names, never one chosen here.** The crank turns
 * at `windPerTickMilli`, the speed the arm used to come home under its own
 * power; the ring turns at `orreryTurnPerTickMilli`, one organ a beat, which is
 * the ring's own drift. Both are asked for rather than written out, so a change
 * to either mechanism reaches the desk in the same edit.
 *
 * **And with a shift held, the other way round.** A key cannot be turned either
 * way, so the direction is chosen when it goes down: the key alone turns
 * forward, shift and the key turns back, and a player who wants to change their
 * mind lets go and presses again. Shift rather than a letter of its own, because
 * the desk keyboard is not allowed to spend one — the owner's rule is that a
 * panel borrows the keys that are already there (`keys-desk.ts`).
 *
 * **One file for both, because they are one trick.** It was the crank's alone
 * (`keys-crank.ts`) and the ring arrived with nothing to copy but the whole of
 * it: a grab that carries no bearing, a bearing a tick from nought, a release,
 * and a rate read off the rules. Two files would have been that paragraph
 * twice, and the second copy is the one that stops being true.
 *
 * Beside `keys-slide.ts` for that file's reason: next door is the pair of keys
 * that carry something sideways and repeat on the tick, and these are the keys
 * that *turn* something on the tick. Both are keys whose whole behaviour is what
 * happens while they are held; everything that says one thing once stays in
 * `keys.ts`.
 */

export interface Turning {
  /** Whether this key turns something; it has already been answered if so.
   * `back` is a shift held with it: the turn goes the other way round. */
  down(code: string, back?: boolean): boolean;
  /** The same question on the way up, and the hand comes off. */
  up(code: string): boolean;
  /** One sim tick of a key that is still held: the next bearing. */
  tick(): void;
}

/**
 * The letter THE ORRERY's ring is turned with at a desk.
 *
 * **A letter of its own, which almost nothing here gets**, and THE CHOIR's
 * shake is the precedent (`keys.ts`'s `KeyK`): the ring is not a button on any
 * panel, so `deskKeys` has no slot to put it in, and it is a gesture a desk
 * cannot make at all. It sends a `drag` either way, which is one of the kinds
 * no panel may refuse (`content/src/control-sets-keys.ts`), and on a field with
 * no orrery on it the simulation does nothing with one (`orreryRingHeard`) — so
 * there is nothing to gate and nothing to gate it on.
 */
const RING_KEY = "KeyO";

/** Both rigs, asked in turn: a code belongs to at most one of them. */
export function bindTurning(
  cfg: SimConfig,
  send: (player: 1 | 2, command: Command) => void,
  /** The panel this wave is played on, read fresh: a wave step changes it
   * under the same listener (`keys.ts`). */
  controls: () => ControlSet,
): Turning {
  const crank = crankRig(cfg, send, controls);
  const ring = ringRig(cfg, send);
  return {
    down: (code, back = false) => crank.down(code, back) || ring.down(code, back),
    up: (code) => crank.up(code) || ring.up(code),
    tick: () => {
      crank.tick();
      ring.tick();
    },
  };
}

function crankRig(
  cfg: SimConfig,
  send: (player: 1 | 2, command: Command) => void,
  controls: () => ControlSet,
): Turning {
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
      at = (at + way * step + BEARING_TURN) % BEARING_TURN;
    },
  };
}

/**
 * The ring, which is a handle on the **field** rather than a control on a
 * panel — so there is no `ControlId` to ask for a press and the two messages
 * are written out: a grab carrying `NO_BEARING`, and a lift saying the hand is
 * off (`sim/orrery-hand.ts` reads both as *no reference yet*).
 *
 * Player 1's, unauthored and unasked, because the ring is his every beat of the
 * fight: the navigator carries both colours and the core's own colour is the
 * one thing she reads off this boss.
 */
function ringRig(cfg: SimConfig, send: (player: 1 | 2, command: Command) => void): Turning {
  const step = orreryTurnPerTickMilli(cfg);
  let at: number | null = null;
  let way: 1 | -1 = 1;
  const drag = (on: boolean, fromMilli: number): Command =>
    ({ kind: "drag", target: "orreryRing", on, fromMilli }) as const;

  return {
    down: (code, back = false) => {
      if (code !== RING_KEY) return false;
      way = back ? -1 : 1;
      send(1, drag(true, NO_BEARING));
      at = 0;
      return true;
    },
    up: (code) => {
      if (code !== RING_KEY) return false;
      at = null;
      send(1, drag(false, NO_BEARING));
      return true;
    },
    tick: () => {
      if (at === null) return;
      send(1, drag(true, at));
      at = (at + way * step + BEARING_TURN) % BEARING_TURN;
    },
  };
}
