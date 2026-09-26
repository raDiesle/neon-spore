import { GRINDSTONE_ASKS, GRINDSTONE_PHASES, type GrindstoneState } from "./grindstone.js";

/**
 * What THE GRINDSTONE puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The rub counts, the rubbed flags and the pads
 * go in too: each is heard on the tick and read on the beat, so two devices
 * that disagree about one disagree about the next beat's grit or count.
 */
export function grindstoneHashParts(s: GrindstoneState): number[] {
  const out = [
    GRINDSTONE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.passes.length,
    ...s.passes,
    s.hits,
    s.locked ? 1 : 0,
    s.gritMilli.length,
    ...s.gritMilli,
    s.rubs.length,
    ...s.rubs,
    s.rubbed.length,
    ...s.rubbed.map((r) => (r ? 1 : 0)),
    s.padsDown.length,
    ...s.padsDown,
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(GRINDSTONE_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
