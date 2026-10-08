import { GALL_ASKS, GALL_PHASES, type GallState } from "./gall.js";

/**
 * What THE GALL puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The point goes in because it was drawn off the
 * `Rng` and decides which press counts, and the gap because it is heard on
 * the tick and counted on the beat.
 */
export function gallHashParts(s: GallState): number[] {
  const out = [
    GALL_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.point,
    s.closes,
    s.hits,
    s.bared ? 1 : 0,
    s.gapMilli,
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(GALL_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
