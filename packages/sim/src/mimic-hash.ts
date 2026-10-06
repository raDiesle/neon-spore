import { MIMIC_ASKS, MIMIC_PHASES, type MimicState } from "./mimic.js";

/**
 * What THE MIMIC puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The pictures, every one shown so far and where they stand go in
 * because the pictures are the simulation's own pick from the seeded `Rng`
 * and decide what peels; the board because both screens draw it — each array
 * with its length ahead of it, THE CAPSTAN's way (`capstan-hash.ts`).
 */
export function mimicHashParts(s: MimicState): number[] {
  const out = [
    MIMIC_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.signs.length,
    ...s.signs,
    s.origins.length,
    ...s.origins,
    s.shown.length,
    ...s.shown,
    s.paint.length,
    ...s.paint,
    s.peeled.length,
    ...s.peeled.map((p) => (p ? 1 : 0)),
    s.changed ? 1 : 0,
    s.reaches,
    s.peels,
    s.hits,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(MIMIC_ASKS.indexOf(step.ask) + 1);
    out.push(step.reader);
    out.push(step.changes ? 1 : 0);
    out.push(step.size);
    out.push(step.beats);
  }
  return out;
}
