import { PLUMB_ASKS, PLUMB_PHASES, type PlumbState } from "./plumb.js";

/**
 * What THE PLUMB puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. Both leans go in too: a drift is heard on the
 * tick, so two devices that disagree about a lean disagree about the next
 * beat's count.
 */
export function plumbHashParts(s: PlumbState): number[] {
  const out = [
    PLUMB_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.weights.length,
    ...s.weights,
    s.hits,
    s.coreLit ? 1 : 0,
    s.tiltMilli.length,
    ...s.tiltMilli,
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(PLUMB_ASKS.indexOf(step.ask) + 1);
    out.push(step.rangeMilli);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
