import { SLING_AIMS, SLING_ASKS, SLING_PHASES, type SlingState } from "./sling.js";

/**
 * What THE SLING puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. Both fingers and both counts go in too: a lift
 * is judged on the tick against the count, so two devices that disagree about
 * a hold disagree about whether the next lift looses.
 */
export function slingHashParts(s: SlingState): number[] {
  const out = [
    SLING_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.arms.length,
    ...s.arms,
    s.hits,
    s.yokeLit ? 1 : 0,
    s.holding.length,
    ...s.holding.map((h) => (h ? 1 : 0)),
    s.drawnBeats.length,
    ...s.drawnBeats,
    s.loosed.length,
    ...s.loosed.map((l) => (l ? 1 : 0)),
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(SLING_ASKS.indexOf(step.ask) + 1);
    out.push(SLING_AIMS.indexOf(step.aim) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
