import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `slick:shape` / `chain` — four sacs, not two.
 *
 * **What this argues.** That the shipped shape is right about *what* the body
 * is and shy about how much of it there is. Four deep lobes along the long
 * axis instead of two: the same idea — sacs holding on to each other — carried
 * far enough that the count is the thing a player names it by. It is the only
 * candidate in this slot that agrees with the shipped answer and pushes it.
 *
 * **How it can lose.** *Four waists is three places a body can look severed.*
 * The slick's pinch is already deep enough to read as two things at speed, and
 * doubling the count doubles the chance a pair reads one body as a row of them
 * — which matters, because how many bodies are in a column is a thing they say
 * out loud to each other.
 */
export const SLICK_CHAIN: Variant = {
  slot: "slick:shape",
  name: "chain",
  sentence:
    "four sacs along the axis instead of two — the shipped idea, carried until the count is the name",
  dir: "tools/versus/candidates/slick-shape/chain",
  patches: [
    patch({
      target: silhouettes.SLICK,
      reached: () => silhouettes.SLICK,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "SLICK",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 4, depth: 0.38, wobble: 0.05, rx: 76, ry: 40, seed: 0 },
    }),
  ],
};
