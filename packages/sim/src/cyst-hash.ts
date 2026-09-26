import { CYST_ASKS, CYST_PHASES, type CystState } from "./cyst.js";

/**
 * What THE CYST puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The gaps and the taps' edges go in too: both
 * are heard on the tick, so two devices that disagree about a thumb disagree
 * about the next beat.
 */
export function cystHashParts(s: CystState): number[] {
  const out = [
    CYST_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.cracks.length,
    ...s.cracks,
    s.hits,
    s.bared ? 1 : 0,
    s.gapMilli.length,
    ...s.gapMilli,
    s.tapDown.length,
    ...s.tapDown.map((down) => (down ? 1 : 0)),
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(CYST_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
