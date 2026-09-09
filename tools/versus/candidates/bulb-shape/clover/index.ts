import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `bulb:shape` / `clover` — four, which is the count a person makes without
 * counting.
 *
 * **What this argues.** That six is one too many. Four deep lobes round a
 * middle is the largest number a player reads at a glance without going one,
 * two, three — and the whole reason the bulb carries lobes at all is that the
 * count is what the pair says out loud. Deeper than the shipped shape, so each
 * lobe is a thing rather than a scallop.
 *
 * **How it can lose.** *Four is a cross, and a cross is furniture.* Four
 * symmetrical arms is the shape of a target, a compass, a joint — and the field
 * already draws a bracket around a locked body. If a bulb starts reading as a
 * mark on the screen rather than as a thing falling through it, this is
 * finished.
 */
export const BULB_CLOVER: Variant = {
  slot: "bulb:shape",
  name: "clover",
  sentence: "four deep lobes instead of six shallow ones — the largest count read without counting",
  dir: "tools/versus/candidates/bulb-shape/clover",
  patches: [
    patch({
      target: silhouettes.BULB,
      reached: () => silhouettes.BULB,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "BULB",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 4, depth: 0.34, wobble: 0.045, rx: 52, ry: 52, seed: 1 },
    }),
  ],
};
