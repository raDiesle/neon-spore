import { BEARING_TURN, DEFAULT_CONFIG, NO_BEARING, orreryTurnPerTickMilli } from "@neon-spore/sim";
import type { PressSpec } from "./spec.js";

/**
 * **A turn of THE ORRERY's ring, written on the press line.**
 *
 * The crank's own case, one boss over, and the reasoning next door in
 * `crank.ts` holds word for word: what turns a ring is not a verb and not a
 * distance but a *stream of bearings*, and what moves anything is the step
 * between two of them (`sim/orrery-hand.ts`). One `drag` at `orreryRing` on its
 * own is a hand going on and a ring standing still — so the lane that built the
 * hand could photograph the rings drifting on their own cadence and could not
 * photograph the one thing the pilot does about them.
 *
 * **Organs rather than turns**, which is the one place this parts from the
 * crank's spelling. A turn of the drum is the thing a player of THE CLAW feels;
 * an organ is the thing this pair *counts* — three out and coming back, the gap
 * at the bottom on the beat — so a press line about a ring says how many
 * sockets it moved and the gearing is the simulation's business:
 *
 *   --press 200:1:orreryRing=1     one organ clockwise from tick 200
 *   --press 90:1:orreryRing=-2     two the other way: the gap goes back
 *
 * A turn and a half of a thumb buys one organ (`orreryHandMilliPerOrgan`), so
 * one organ is seventy-five ticks of this rig — a beat — and a picture of a gap
 * dragged three sockets round costs three beats of the capture's own clock.
 * That is the control rather than an awkwardness of the tool: the ring is
 * heavy, and a frame is the only place that ever gets to be read slowly.
 *
 * **The rate is asked for rather than chosen**, exactly as the crank's is:
 * `orreryTurnPerTickMilli` is one organ a beat, the ring's own drift, and is
 * the same number the desk keyboard and a rehearsal's ghost thumb turn at
 * (`packages/sim/test/copies-table.ts` carries the row).
 */
export function ringPresses(tick: number, player: 1 | 2, organs: number): PressSpec[] {
  const step = orreryTurnPerTickMilli(DEFAULT_CONFIG);
  const per = Math.max(1, DEFAULT_CONFIG.orreryHandMilliPerOrgan);
  // Rounded **up**, so the stream is never a socket short of what was asked
  // for: the ring banks whatever it is handed and pays out whole organs
  // (`wind` in `sim/orrery-hand.ts`), and one tick's worth of overshoot is a
  // long way inside the next detent.
  const ticks = Math.max(1, Math.ceil((Math.abs(organs) * per) / step));
  const way = organs < 0 ? -1 : 1;
  const bearing = (which: number): PressSpec => ({
    tick: tick + which,
    player,
    command: {
      kind: "drag",
      target: "orreryRing",
      on: true,
      // Positive and inside one turn either way round, for the crank's reason:
      // a bearing is where on the circle the hand is, so a hand going the other
      // way counts down through the modulus rather than into negative numbers.
      fromMilli: (((which * way * step) % BEARING_TURN) + BEARING_TURN) % BEARING_TURN,
    },
  });
  const hand = (on: boolean, at: number): PressSpec => ({
    tick: tick + at,
    player,
    command: { kind: "drag", target: "orreryRing", on, fromMilli: NO_BEARING },
  });
  const out: PressSpec[] = [hand(true, 0)];
  for (let i = 0; i <= ticks; i++) out.push(bearing(i));
  out.push(hand(false, ticks));
  return out;
}

/** How many organs `orreryRing=VALUE` asks for, refusing what is not a whole
 * number of them: the ring moves in sockets, and half a socket is a ring drawn
 * lying about where its gap is (`sim/orrery-hand.ts`). */
export function parseOrgans(argument: string | undefined, one: string, whole: string): number {
  const organs = Number(argument);
  if (argument === undefined || !Number.isInteger(organs) || organs === 0) {
    throw new Error(
      `--press ${whole}: "${one}" — orreryRing takes whole organs, e.g. orreryRing=1 or ` +
        "orreryRing=-2. A ring with no organs on it is a hand going on and nothing turning",
    );
  }
  return organs;
}
