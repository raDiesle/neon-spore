import type { BroodStep } from "@neon-spore/sim";

/**
 * THE BROOD's script: eight steps, seventeen buds, and from the second step
 * on a body laid out of its hide every five or six beats.
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
 * and are laid round, and last four.
 *
 * **And then eased**, the owner's of 17 October 2026 — *now too difficult …
 * reduce number of sequence falling down enemies releasing*: one four-bud
 * step gone, and a body laid every five or six beats rather than three or
 * four. With each seat held to one press a second AUTO lays about ten in
 * forty seconds, where it laid twenty-three in fifty-five; it clears at one
 * press each per 1.75 seconds, where the old script lost at 1.5.
 *
 * Named rather than written into the wave, for THE INSTAR's reason: a step
 * with a list inside it is read down a page, and the director writes the
 * name back out (`tools/director/src/serialize-boss.ts`).
 */
export const BROOD_SCRIPT: readonly BroodStep[] = [
  { buds: [{ offset: 0, color: "red" }], ripenBeats: 10 },
  { buds: [{ offset: -2, color: "cyan" }], ripenBeats: 10, layEvery: 6 },
  {
    buds: [
      { offset: -3, color: "red" },
      { offset: 2, color: "cyan" },
    ],
    ripenBeats: 12,
    layEvery: 6,
  },
  { buds: [{ offset: 1, color: "red" }], ripenBeats: 14, swayEvery: 6 },
  {
    buds: [
      { offset: 2, color: "cyan" },
      { offset: -2, color: "red" },
    ],
    ripenBeats: 14,
    layEvery: 6,
    swayEvery: 7,
  },
  {
    buds: [
      { offset: -4, color: "cyan" },
      { offset: 0, color: "red" },
      { offset: 4, color: "cyan" },
    ],
    ripenBeats: 16,
    layEvery: 5,
  },
  {
    buds: [
      { offset: -3, color: "red" },
      { offset: 1, color: "cyan" },
      { offset: 3, color: "red" },
    ],
    ripenBeats: 18,
    layEvery: 5,
    swayEvery: 7,
  },
  {
    buds: [
      { offset: -4, color: "red" },
      { offset: -1, color: "cyan" },
      { offset: 1, color: "red" },
      { offset: 4, color: "cyan" },
    ],
    ripenBeats: 20,
    layEvery: 5,
    swayEvery: 7,
  },
];
