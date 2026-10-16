import { MATRON_PHASES, MATRON_THROWS, type MatronState } from "./matron.js";

/**
 * What THE MATRON puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE HYDRA's reason (`hydra-hash.ts`):
 * each level's ring, its pods' columns and its throws, with their lengths
 * ahead of them. The pods hung go in by id because the catch is matched
 * against them; the ones taken because they are the fight; the throws thrown
 * because the next beat reads on from there.
 */
export function matronHashParts(s: MatronState): number[] {
  const out = [
    MATRON_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.hung.length,
    ...s.hung,
    s.takenMask,
    s.taken,
    s.thrown,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(step.beats);
    out.push(step.pods.length);
    for (const p of step.pods) out.push(p);
    out.push(step.throws.length);
    for (const t of step.throws) out.push(t.at, t.offset, MATRON_THROWS.indexOf(t.what) + 1);
  }
  return out;
}
