import { SEAM_ASKS, SEAM_PHASES, type SeamState } from "./seam.js";

/**
 * What THE SEAM puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, the way THE VALVE's marks do
 * (`valve-hash.ts`): copied onto the state at install, so two devices handed
 * different scripts would light different steps. Its length goes in ahead of
 * it so two scripts differing only in how long they are cannot fold into the
 * same number.
 */
export function seamHashParts(s: SeamState): number[] {
  const out = [
    SEAM_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.sealed,
    s.litTick,
    s.shot ? 1 : 0,
    s.guarded ? 1 : 0,
    s.quenched,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(SEAM_ASKS.indexOf(step.ask) + 1);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.offset);
    out.push(step.seals ? 1 : 0);
  }
  return out;
}
