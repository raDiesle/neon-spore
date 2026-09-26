import { OCULUS_ASKS, OCULUS_PHASES, type OculusState } from "./oculus.js";

/**
 * What THE OCULUS puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The two leaves go in too: a slip is heard on
 * the tick, so two devices that disagree about a thumb disagree about the
 * next beat's count.
 */
export function oculusHashParts(s: OculusState): number[] {
  const out = [
    OCULUS_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.litTick,
    s.cursor,
    s.leavesShut,
    s.hits,
    s.socketOpen ? 1 : 0,
    s.held.length,
    ...s.held.map((h) => (h ? 1 : 0)),
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(OCULUS_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
    out.push(step.offset ?? 0);
  }
  return out;
}
