import { HALTER_ASKS, HALTER_PHASES, type HalterState } from "./halter.js";

/**
 * What THE HALTER puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. Both seats' rests, stirrings and grips go in
 * too: every one is heard on the tick, so two devices that disagree about a
 * single command disagree about the next beat.
 */
export function halterHashParts(s: HalterState): number[] {
  const out = [
    HALTER_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.cracks.length,
    ...s.cracks,
    s.hits,
    s.bared ? 1 : 0,
    s.restBeats.length,
    ...s.restBeats,
    s.stirred.length,
    ...s.stirred.map((stirred) => (stirred ? 1 : 0)),
    s.grips.length,
    ...s.grips,
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(HALTER_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
