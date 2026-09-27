import { FLUE_ASKS, FLUE_PHASES, type FlueState } from "./flue.js";

/**
 * What THE FLUE puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it, and each step's notches with theirs. The ember
 * goes in because it is the simulation's own and decides whether a tap
 * lands, and the rests, the stirs and the thumbs because they are heard on
 * the tick and counted on the beat — each seat's pair with its length ahead
 * of it, THE CAPSTAN's way (`capstan-hash.ts`).
 */
export function flueHashParts(s: FlueState): number[] {
  const out = [
    FLUE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.emberMilli,
    s.emberDir,
    s.taps,
    s.vents,
    s.hits,
    s.bared ? 1 : 0,
    s.restBeats.length,
    ...s.restBeats,
    s.stirred.length,
    ...s.stirred.map((stirred) => (stirred ? 1 : 0)),
    s.tapDown.length,
    ...s.tapDown.map((d) => (d ? 1 : 0)),
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(FLUE_ASKS.indexOf(step.ask) + 1);
    out.push(step.rester === "both" ? 3 : step.rester);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
    out.push(step.notches.length, ...step.notches);
  }
  return out;
}
