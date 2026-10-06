import { GOVERNOR_ASKS, GOVERNOR_PHASES, type GovernorState } from "./governor.js";

/**
 * What THE GOVERNOR puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The needle and its speed go in because they are
 * the simulation's own, turned on the tick, and decide whether a tap lands;
 * the marks landed and the thumbs because they are heard on the tick — each
 * pair with its length ahead of it, THE CAPSTAN's way (`capstan-hash.ts`),
 * and each step's marks with theirs.
 */
export function governorHashParts(s: GovernorState): number[] {
  const out = [
    GOVERNOR_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.needleMilli,
    s.landed,
    s.taps.length,
    ...s.taps,
    s.hits,
    s.hubLit ? 1 : 0,
    s.tapDown.length,
    ...s.tapDown.map((d) => (d ? 1 : 0)),
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(GOVERNOR_ASKS.indexOf(step.ask) + 1);
    out.push(step.ordered ? 1 : 0);
    out.push(step.marks.length);
    for (const mark of step.marks) out.push(mark.seat, mark.markMilli);
    out.push(step.paceMilli);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
