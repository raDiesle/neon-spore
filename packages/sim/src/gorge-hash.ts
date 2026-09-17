import type { GorgeState } from "./gorge.js";

/**
 * What THE GORGE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `candle-hash.ts` is one: `hash-boss.ts` grows
 * by a whole boss at a time.
 *
 * **The intakes are the fields that matter most**, all four numbers of each:
 * two devices disagreeing about one tally would have player 1 calling a
 * fourth bead the other phone has not swallowed, and the pierce window
 * opening on one screen only. The phase is not here because it is not kept —
 * it is read off the ruptures, the mouth and the out beat, which are.
 */
export function gorgeHashParts(g: GorgeState): number[] {
  const out = [g.col, g.intakes.length, g.ruptures, g.swallowed, g.spitBeat, g.mouth, g.outBeat];
  for (const k of g.intakes) {
    out.push(
      k.beads,
      k.color === null ? 0 : k.color === "red" ? 1 : 2,
      k.fullBeat,
      k.ruptured ? 1 : 0,
    );
  }
  return out;
}
