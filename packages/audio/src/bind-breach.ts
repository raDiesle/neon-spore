import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * **What a hull breach sounds like**, split by what it cost rather than by
 * what hit: the pair needs to know how bad it was before it needs to know
 * what did it.
 *
 * Its own file on `bind-volley.ts`'s terms — `bind.ts` is at its limit, and
 * the argument below is the whole of why this cue was wrong for as long as it
 * was. There is nothing to say about a breach that is not said here.
 */

/**
 * **What makes a breach heavy**, in the whole hull points a `breach` event
 * carries (`sim/events.ts`).
 *
 * It used to be `8000`, which is a number in thousandths — and nothing the
 * simulation emits is anywhere near it. `breachHull` is called with
 * `damageMeteor` (20), `damageCarom` (20), `damageGhostDive` (18),
 * `damageCreature` (12) and a lure's blast share (5), so the comparison was
 * always false and the heavy cue — *the plate going, a long low tear with the
 * room shaking after it* — had never been heard in the running game. A rock
 * reaching the hull sounded exactly like a slick brushing it. The test proved
 * the split with `20_000` and `3_000`, which is why it survived: both of those
 * fall on the right side of the line whichever unit is meant.
 *
 * 15 is above `damageCreature` and below `damageGhostDive`, which is the line
 * the pair would draw: a body that merely *arrived* is light, and anything
 * that is a rock or that aimed at the ship is heavy. `test/bind.test.ts` holds
 * it against the simulation's own numbers, so a config that moves either side
 * of the line fails there rather than going quiet here.
 */
export const HEAVY_BREACH_DAMAGE = 15;

export function breachCue(e: Extract<SimEvent, { type: "breach" }>, cols: number): Cue {
  return {
    id: e.damage >= HEAVY_BREACH_DAMAGE ? "hull.breachHeavy" : "hull.breachLight",
    pan: panForCol(e.col, cols),
  };
}
