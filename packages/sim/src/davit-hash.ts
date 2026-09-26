import { DAVIT_ASKS, DAVIT_PHASES, type DavitState } from "./davit.js";

/**
 * What THE DAVIT puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. Both leans, both fingers, both counts and the
 * boom go in too: a lift is judged on the tick against the other seat's lean
 * and its own count, so two devices that disagree about either disagree about
 * whether the next lift lands.
 */
export function davitHashParts(s: DavitState): number[] {
  const out = [
    DAVIT_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.swings.length,
    ...s.swings,
    s.hits,
    s.pivotLit ? 1 : 0,
    s.tiltMilli.length,
    ...s.tiltMilli,
    s.holding.length,
    ...s.holding.map((h) => (h ? 1 : 0)),
    s.drawnBeats.length,
    ...s.drawnBeats,
    s.aimMilli,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(DAVIT_ASKS.indexOf(step.ask) + 1);
    out.push(step.leanMilli);
    out.push(step.rangeMilli);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
