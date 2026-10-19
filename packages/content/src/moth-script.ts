import type { MothStep } from "@neon-spore/sim";

/**
 * THE MOTH's script: four levels, each asking something the last did not.
 *
 * Read a step as `sim/moth.ts` reads it: `spots` columns off its body where a
 * red eyespot glows on a wing, `dustEvery` how often it shakes a slick off a
 * wing, `inTurn` whether they glow one at a time, and on the last step `hits`
 * how many times its belly is hit and `hopEvery` how often it hops away.
 *
 * **The story is the levels.** First the two fore wings, far out, while it
 * follows the cannon — learn that it comes to a still light. Then four
 * spots lit one at a time, each on the far side of the last, so the cannon
 * crosses under the moth every shot. Then the two hind wings, close in,
 * while it sheds slicks that fall like FIRST STEP's own red bodies — the
 * cannon has two things to be under. Then, its wings
 * gone, it flies from the light, and its belly opens only as it comes down
 * on the cannon — the one place the first two levels taught never to stay.
 *
 * Named rather than written into the wave, for THE INSTAR's reason: a step
 * with a list inside it is read down a page, and the director writes the
 * name back out (`tools/director/src/serialize-boss.ts`).
 */
export const MOTH_SCRIPT: readonly MothStep[] = [
  { kind: "wings", spots: [-2, 2] },
  { kind: "wings", spots: [-2, 2, -1, 1], inTurn: true },
  { kind: "wings", spots: [-2, -1, 1, 2], dustEvery: 4 },
  { kind: "belly", hits: 4, hopEvery: 6 },
];
