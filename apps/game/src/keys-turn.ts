import { type ControlSet, controlPress, controlTurns, deskKeys } from "@neon-spore/content";
import {
  BEARING_TURN,
  type Command,
  gimbalTurnPerTickMilli,
  NO_BEARING,
  type SimConfig,
  windPerTickMilli,
} from "@neon-spore/sim";

/**
 * The desk keyboard's keys that stand in for a hand **going round in a
 * circle**: THE CLAW's crank on the panel, and THE GIMBAL's two rings on the
 * field — one per seat.
 *
 * A key cannot turn. Every other control in the game is a press or a hold and
 * a key is exactly as good as a thumb at both, which is the whole of
 * `keys-desk.ts`'s bargain — but these are turned, and what they answer is
 * the *bearing* a finger reports going round them (`sim/bearing.ts`). A key
 * held down reports nothing at all, so each rig below turns on the player's
 * behalf: one bearing per sim tick, a little further round each time, for as
 * long as the key is down.
 *
 * **At the rate the simulation names, never one chosen here.** The crank turns
 * at `windPerTickMilli`, the speed the arm used to come home under its own
 * power; the rings turn at `gimbalTurnPerTickMilli`. Both are asked for rather
 * than written out, so a change to either mechanism reaches the desk in the
 * same edit.
 *
 * **And with a shift held, the other way round.** A key cannot be turned either
 * way, so the direction is chosen when it goes down: the key alone turns
 * forward, shift and the key turns back, and a player who wants to change their
 * mind lets go and presses again. Shift rather than a letter of its own, because
 * the desk keyboard is not allowed to spend one — the owner's rule is that a
 * panel borrows the keys that are already there (`keys-desk.ts`).
 *
 * **One file for all of them, because they are one trick.** It was the crank's
 * alone, and the rings arrived with nothing to copy but the whole of it: a grab that carries no bearing, a bearing a tick
 * from nought, a release, and a rate read off the rules. Two files would have
 * been that paragraph twice, and the second copy is the one that stops being
 * true.
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
 * THE GIMBAL's two, and the first time this file has had to spend a key on
 * **each seat**: the outer ring is the pilot's and the inner the navigator's,
 * always, and a desk with one key for both would be a desk that could never
 * put the two rings true together — which is the only thing this boss asks
 * for. Letters of their own, which almost nothing here gets, and THE CHOIR's
 * shake is the precedent (`keys.ts`'s `KeyK`): neither ring is a button on any
 * panel, so `deskKeys` has no slot to seat them in. Each sends a `drag`, which
 * is one of the kinds no panel may refuse (`content/src/control-sets-keys.ts`),
 * and on a field with no gimbal the simulation does nothing with one — so
 * there is nothing to gate and nothing to gate it on.
 *
 * **T and Y, adjacent under one hand and both unspent.** The pair wanted to
 * be G and H, which is where a right hand rests — but G is already the grip,
 * the one key at a desk that takes hold of a body, and a second meaning on it
 * would have made every gimbal turn also a grab (`keys-grip.ts`, and the test
 * that said so). A key at this desk is spent once.
 */
const GIMBAL_KEYS = { gimbalOuter: "KeyT", gimbalInner: "KeyY" } as const;

/** Both rigs, asked in turn: a code belongs to at most one of them. */
export function bindTurning(
  cfg: SimConfig,
  send: (player: 1 | 2, command: Command) => void,
  /** The panel this wave is played on, read fresh: a wave step changes it
   * under the same listener (`keys.ts`). */
  controls: () => ControlSet,
): Turning {
  const crank = crankRig(cfg, send, controls);
  const rings = [
    gimbalRig(cfg, send, "gimbalOuter", 1),
    gimbalRig(cfg, send, "gimbalInner", 2),
  ] as const;
  const all = [crank, ...rings] as const;
  return {
    down: (code, back = false) => all.some((r) => r.down(code, back)),
    up: (code) => all.some((r) => r.up(code)),
    tick: () => {
      for (const r of all) r.tick();
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
 * One of THE GIMBAL's rings, which is a handle on the **field** rather than a
 * control on a panel — so there is no `ControlId` to ask for a press and the
 * messages are written out, with the seat and the target handed in: a grab
 * carrying `NO_BEARING`, a
 * bearing a tick from nought, a lift, and a rate read off the rules
 * (`gimbalTurnPerTickMilli`).
 *
 * **The mirror is not here.** What a key sends is a bearing on the face the
 * hand is on, exactly as a thumb's is, and the inner ring's reflection is
 * applied once in the simulation (`sim/gimbal-hand.ts`). A desk that turned
 * the navigator's ring the other way round to be helpful would be rehearsing
 * a boss nobody is playing — the whole fight is that her key does the other
 * thing.
 */
function gimbalRig(
  cfg: SimConfig,
  send: (player: 1 | 2, command: Command) => void,
  target: "gimbalOuter" | "gimbalInner",
  player: 1 | 2,
): Turning {
  const step = gimbalTurnPerTickMilli(cfg);
  const key = GIMBAL_KEYS[target];
  let at: number | null = null;
  let way: 1 | -1 = 1;
  const drag = (on: boolean, fromMilli: number): Command =>
    ({ kind: "drag", target, on, fromMilli }) as const;

  return {
    down: (code, back = false) => {
      if (code !== key) return false;
      way = back ? -1 : 1;
      send(player, drag(true, NO_BEARING));
      at = 0;
      return true;
    },
    up: (code) => {
      if (code !== key) return false;
      at = null;
      send(player, drag(false, NO_BEARING));
      return true;
    },
    tick: () => {
      if (at === null) return;
      send(player, drag(true, at));
      at = (at + way * step + BEARING_TURN) % BEARING_TURN;
    },
  };
}
