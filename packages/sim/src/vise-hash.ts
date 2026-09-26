import { VISE_ASKS, VISE_PHASES, type ViseState } from "./vise.js";

/**
 * What THE VISE puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The two gaps go in too: a slip is heard on the
 * tick, so two devices that disagree about a pinch disagree about the next
 * beat's count.
 */
export function viseHashParts(s: ViseState): number[] {
  const out = [
    VISE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.litTick,
    s.cursor,
    s.cracks.length,
    ...s.cracks,
    s.hits,
    s.bared ? 1 : 0,
    s.gapMilli.length,
    ...s.gapMilli,
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(VISE_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
    out.push(step.offset ?? 0);
  }
  return out;
}
