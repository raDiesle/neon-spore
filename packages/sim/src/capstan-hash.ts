import { CAPSTAN_ASKS, CAPSTAN_PHASES, type CapstanState } from "./capstan.js";

/**
 * What THE CAPSTAN puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. Both seats' leans and reversal counts go in
 * too: each is heard on the tick and decides which band the next reversal
 * wears, so two devices that disagree about one of them disagree about a band.
 */
export function capstanHashParts(s: CapstanState): number[] {
  const out = [
    CAPSTAN_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.wear.length,
    ...s.wear,
    s.hits,
    s.bared ? 1 : 0,
    s.tiltMilli.length,
    ...s.tiltMilli,
    s.rubs.length,
    ...s.rubs,
    s.rubbed ? 1 : 0,
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(CAPSTAN_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
