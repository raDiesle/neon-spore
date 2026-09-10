import * as crawlerLook from "../../../../../packages/render/src/crawler-look.js";
import { patch, type Variant } from "../../../variant.js";
import { gut } from "./paint.js";

/**
 * `creature:crawler` / `gut` — the ring is a bag with something in it.
 *
 * **What the shipped side is.** A solid ball: opaque fill, pores on the
 * surface, a light over it. Everything that says *alive* is on the outside.
 *
 * **What this argues.** That a maggot is see-through, and that what says
 * alive about one is the dark mass inside it moving a beat behind the body.
 * VESICLE off the shapes page, with an organ in it: a soft dark ellipse in
 * the ring, pushed toward the tail as the ring squeezes and swinging back
 * as it lets go on the shared clock — inertia, not decoration — and narrowed
 * by the contraction the way the bag round it is. Along the limb away from
 * the key a crescent of the body's own light is added, which is what thin
 * skin does where the light comes through it from behind. The shipped pores
 * stay, fainter, riding the roll on top, and the shipped light pass and
 * specular go over all of it.
 *
 * **How it can lose.** *The organ is a second body.* A dark mass inside a
 * ring is a shape, and a pair reading a worm for which ring is which
 * material may read the mass as a mark that means something. If at the pair
 * the organ reads as a readout, it has to go softer and smaller until it is
 * a shadow and not a thing.
 */
export const CRAWLER_GUT: Variant = {
  slot: "creature:crawler",
  name: "gut",
  sentence:
    "a dark organ seen through translucent skin, pushed to the tail by the squeeze and swinging back a beat behind, under a rim of light where the skin is thinnest — a bag with something alive in it",
  dir: "tools/versus/candidates/creature-crawler/gut",
  patches: [
    patch({
      target: crawlerLook.CRAWLER_LOOK,
      // No accessor: `crawler.ts` reads the export itself, once per ring. The
      // module namespace is the whole route there is.
      reached: () => crawlerLook.CRAWLER_LOOK,
      where: {
        file: "packages/render/src/crawler-look.ts",
        symbol: "CRAWLER_LOOK",
        type: "CrawlerLook",
      },
      fields: { slime: gut },
    }),
  ],
};
