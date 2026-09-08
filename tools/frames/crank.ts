import { CRANK_TURN, DEFAULT_CONFIG, NO_CRANK, windPerTickMilli } from "@neon-spore/sim";
import type { PressSpec } from "./spec.js";

/**
 * **A turn of THE CLAW's crank, written on the press line.**
 *
 * Every control in the game is a press or a thumb held down, and both are
 * photographable — except this one. What winds the arm home is not a verb and
 * not a distance: it is a *stream of bearings*, a few dozen of them, and what
 * moves rope is the step between two (`sim/crank.ts`). One `drag` at `crank`
 * on its own is only a hand going on, so the lane that built the winder could
 * photograph the arm hanging and could not photograph it coming down — the
 * picture of the one thing the control does — and the lane that made it turn
 * both ways could send the owner the panel at rest and nothing else.
 *
 * So a crank press carries **how many turns of the drum**, negative for
 * anticlockwise, and expands here into the same stream the desk keyboard and a
 * rehearsal already send: the grab, then one bearing a tick from the named
 * one, then the hand coming off.
 *
 *   --press 200:1:crank=2      two turns clockwise from tick 200: the arm winds home
 *   --press 90:1:crank=-1.5    a turn and a half the other way: the arm is raised
 *
 * **The rate is asked for rather than chosen.** `windPerTickMilli` is the
 * simulation's own, the same number `apps/game/src/keys-crank.ts` turns the
 * desk keyboard's crank at and `content/src/scene-drag.ts` turns a rehearsal's
 * ghost hand at; this is the third caller and, like the second, writes nothing
 * new to get it (`packages/sim/test/purity.test.ts` keeps a table against the
 * second copy of a rule).
 *
 * **The bearings start from nought**, exactly as the keyboard's do, because the
 * grab reports `NO_CRANK` and the reference is the last bearing *this* hand
 * gave: a hand that pretended to start at the top of the circle would wind up
 * to half a turn of rope that no finger ever travelled.
 */
export function crankPresses(tick: number, player: 1 | 2, turns: number): PressSpec[] {
  const step = windPerTickMilli(DEFAULT_CONFIG);
  const ticks = Math.max(1, Math.round((Math.abs(turns) * CRANK_TURN) / step));
  const way = turns < 0 ? -1 : 1;
  const bearing = (which: number): PressSpec => ({
    tick: tick + which,
    player,
    command: {
      kind: "drag",
      target: "crank",
      on: true,
      // Positive and inside one turn either way round: a bearing is where on
      // the circle the finger is, and the simulation reads the *step* between
      // two of them, so an anticlockwise hand counts down through the modulus
      // rather than into negative numbers.
      fromMilli: (((which * way * step) % CRANK_TURN) + CRANK_TURN) % CRANK_TURN,
    },
  });
  const grab: PressSpec = {
    tick,
    player,
    command: { kind: "drag", target: "crank", on: true, fromMilli: NO_CRANK },
  };
  const out: PressSpec[] = [grab];
  for (let i = 0; i <= ticks; i++) out.push(bearing(i));
  out.push({
    tick: tick + ticks,
    player,
    command: { kind: "drag", target: "crank", on: false, fromMilli: NO_CRANK },
  });
  return out;
}

/** How many turns `crank=VALUE` asks for, refusing what is not a number. */
export function parseTurns(argument: string | undefined, one: string, whole: string): number {
  const turns = Number(argument);
  if (argument === undefined || !Number.isFinite(turns) || turns === 0) {
    throw new Error(
      `--press ${whole}: "${one}" — crank takes turns of the drum, e.g. crank=2 or crank=-1.5. ` +
        "A crank with no turns on it is a hand going on and nothing winding",
    );
  }
  return turns;
}
