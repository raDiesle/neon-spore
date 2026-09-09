import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `bulb:shape` / `spike` — eight deep points instead of six shallow ones.
 *
 * **This slot reopens a decided question, on purpose.** `creature:bulb` / `six`
 * was taken on 8 September 2026; the owner asked on 9 September for completely
 * different shapes for both first bodies, so the outline is open again. The
 * ammunition colour is the one thing no candidate here touches.
 *
 * **What this argues.** That the bulb should be *spiky*. Eight lobes at nearly
 * twice the shipped depth: a starfish rather than a spore, with real gaps
 * between the arms instead of a scalloped rim. Eight is past counting on the
 * fingers, which is deliberate: this body is meant to be named by how sharp it
 * is rather than by how many arms it has, and no shipped body carries eight.
 *
 * **How it can lose.** *A star is a hazard.* Deep points are what the game
 * draws on things that hurt — the fence's shards, a broken plate — and a body
 * that looks armed is a body a pair hesitates over.
 */
export const BULB_SPIKE: Variant = {
  slot: "bulb:shape",
  name: "spike",
  sentence: "eight deep arms with real gaps between them — a starfish rather than a scalloped ball",
  dir: "tools/versus/candidates/bulb-shape/spike",
  patches: [
    patch({
      target: silhouettes.BULB,
      reached: () => silhouettes.BULB,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "BULB",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 8, depth: 0.38, wobble: 0.04, rx: 50, ry: 50, seed: 1 },
    }),
  ],
};
