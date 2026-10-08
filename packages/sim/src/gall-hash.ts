import { GALL_ASKS, GALL_PHASES, type GallState } from "./gall.js";

/**
 * What THE GALL puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The point goes in because it was drawn off the
 * `Rng` and decides whose hand counts, and each seat's finger because it is
 * heard on the tick and judged at the lift.
 */
export function gallHashParts(s: GallState): number[] {
  const out = [
    GALL_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.point,
    s.from,
    s.taps,
    s.leaps,
    s.hits,
    s.down.length,
    ...s.down,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(GALL_ASKS.indexOf(step.ask) + 1);
    out.push(step.taps);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
