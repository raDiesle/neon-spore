import type { BroodStep } from "@neon-spore/sim";

/**
 * THE BROOD's script: six steps, ten buds, one more at a time as it goes.
 *
 * Read a bud as `sim/brood.ts` reads it: `offset` columns from the middle,
 * red a slick and cyan a bulb, and `ripenBeats` how long every bud of the
 * step hangs before it drops. **The climb is the ask.** One bud, then one
 * somewhere else in the other colour, then one far out; then two at once of
 * different colours, which is the first time the pair says which first; and
 * last three, both edges and the middle, with the longest window to do it in.
 *
 * Named rather than written into the wave, for THE INSTAR's reason: a step
 * with a list inside it is read down a page, and the director writes the
 * name back out (`tools/director/src/serialize-boss.ts`).
 */
export const BROOD_SCRIPT: readonly BroodStep[] = [
  { buds: [{ offset: 0, color: "red" }], ripenBeats: 10 },
  { buds: [{ offset: -2, color: "cyan" }], ripenBeats: 10 },
  { buds: [{ offset: 3, color: "red" }], ripenBeats: 9 },
  {
    buds: [
      { offset: -3, color: "red" },
      { offset: 2, color: "cyan" },
    ],
    ripenBeats: 12,
  },
  {
    buds: [
      { offset: 1, color: "cyan" },
      { offset: -1, color: "red" },
    ],
    ripenBeats: 12,
  },
  {
    buds: [
      { offset: -4, color: "cyan" },
      { offset: 0, color: "red" },
      { offset: 4, color: "cyan" },
    ],
    ripenBeats: 14,
  },
];
