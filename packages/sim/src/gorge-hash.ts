import type { GorgeState } from "./gorge.js";

/**
 * What THE GORGE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `throat-hash.ts` is one: `hash-boss.ts` grows
 * by a whole boss at a time.
 *
 * **The intakes are the fields that matter most**, all five numbers of each:
 * two devices disagreeing about one tally would have player 1 calling a
 * fourth bead the other phone has not swallowed, and the pierce window
 * opening on one screen only. The phase is not here because it is not kept —
 * it is read off the ruptures, the mouth and the out beat, which are.
 */
export function gorgeHashParts(g: GorgeState): number[] {
  const out = [g.col, g.intakes.length, g.ruptures, g.swallowed, g.spitBeat, g.mouth, g.outBeat];
  // The two thumbs: a pinch one phone has and the other has not would vent
  // the intake on one screen only, and a pry the same would end the fight on one.
  out.push(g.pinch, g.pry, g.pryBeat, g.pryFills);
  for (const k of g.intakes) {
    out.push(
      k.beads,
      k.color === null ? 0 : k.color === "red" ? 1 : 2,
      k.fullBeat,
      k.ruptured ? 1 : 0,
      k.pierced,
    );
  }
  return out;
}
