import type { BroodStep } from "@neon-spore/sim";

/**
 * THE BROOD's script: nine steps, twenty-four buds, and from the second step
 * on a body laid out of its hide every few beats.
 *
 * Read a bud as `sim/brood.ts` reads it: `offset` columns from where the sac
 * stands, red a slick and cyan a bulb, and `ripenBeats` how long every bud of
 * the step hangs before it drops; `layEvery` how often it lays a body while
 * the step grows, and `swayEvery` how often it lurches a column.
 *
 * **The climb is the ask**, and the owner's of 16 October 2026 — *too easy …
 * increase it a lot*. One bud, to learn it; then one with bodies laid round
 * it; two at once; then the first sway, with one bud, so the lurch is learnt
 * on its own; then two that sway, three that are laid round, three that sway
 * and are laid round, and last four and four.
 *
 * Named rather than written into the wave, for THE INSTAR's reason: a step
 * with a list inside it is read down a page, and the director writes the
 * name back out (`tools/director/src/serialize-boss.ts`).
 */
export const BROOD_SCRIPT: readonly BroodStep[] = [
  { buds: [{ offset: 0, color: "red" }], ripenBeats: 10 },
  { buds: [{ offset: -2, color: "cyan" }], ripenBeats: 10, layEvery: 4 },
  {
    buds: [
      { offset: -3, color: "red" },
      { offset: 2, color: "cyan" },
    ],
    ripenBeats: 12,
    layEvery: 4,
  },
  { buds: [{ offset: 1, color: "red" }], ripenBeats: 14, swayEvery: 5 },
  {
    buds: [
      { offset: 2, color: "cyan" },
      { offset: -2, color: "red" },
    ],
    ripenBeats: 14,
    layEvery: 4,
    swayEvery: 6,
  },
  {
    buds: [
      { offset: -4, color: "cyan" },
      { offset: 0, color: "red" },
      { offset: 4, color: "cyan" },
    ],
    ripenBeats: 14,
    layEvery: 3,
  },
  {
    buds: [
      { offset: -3, color: "red" },
      { offset: 1, color: "cyan" },
      { offset: 3, color: "red" },
    ],
    ripenBeats: 16,
    layEvery: 3,
    swayEvery: 6,
  },
  {
    buds: [
      { offset: -4, color: "red" },
      { offset: -1, color: "cyan" },
      { offset: 1, color: "red" },
      { offset: 4, color: "cyan" },
    ],
    ripenBeats: 18,
    layEvery: 3,
    swayEvery: 5,
  },
  {
    buds: [
      { offset: -3, color: "cyan" },
      { offset: -1, color: "red" },
      { offset: 2, color: "cyan" },
      { offset: 4, color: "red" },
    ],
    ripenBeats: 18,
    layEvery: 3,
    swayEvery: 5,
  },
];
