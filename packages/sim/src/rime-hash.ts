import { RIME_ASKS, RIME_PHASES, type RimeState } from "./rime.js";

/**
 * What THE RIME puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The frost, the last reversal counts and the
 * rubbed marks go in too: a wipe is heard on the tick, so two devices that
 * disagree about a thumb disagree about the next beat's regrowth.
 */
export function rimeHashParts(s: RimeState): number[] {
  const out = [
    RIME_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.litTick,
    s.wipes.length,
    ...s.wipes,
    s.hits,
    s.bared ? 1 : 0,
    s.rimeMilli.length,
    ...s.rimeMilli,
    s.rubs.length,
    ...s.rubs,
    s.rubbed.length,
    ...s.rubbed.map((r) => (r ? 1 : 0)),
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(RIME_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
    out.push(step.offset ?? 0);
  }
  return out;
}
