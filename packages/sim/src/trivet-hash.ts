import { TRIVET_ASKS, TRIVET_PHASES, type TrivetState } from "./trivet.js";

/**
 * What THE TRIVET puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The pads held go in too: a lift is heard on
 * the tick, so two devices that disagree about a pad disagree about the next
 * beat's count.
 */
export function trivetHashParts(s: TrivetState): number[] {
  const out = [
    TRIVET_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.feet.length,
    ...s.feet,
    s.hits,
    s.hubLit ? 1 : 0,
    s.padsDown.length,
    ...s.padsDown,
    s.heldBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(TRIVET_ASKS.indexOf(step.ask) + 1);
    out.push(step.pads);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
