import * as crawlerLook from "../../../../../packages/render/src/crawler-look.js";
import { patch, type Variant } from "../../../variant.js";
import { larvaFace, larvaSlime } from "./paint.js";

/**
 * `creature:crawler` / `larva` — a real fly maggot, seen through.
 *
 * **What the shipped side is.** GUT: every ring the same smooth egg with a
 * soft dark organ in it and one soft highlight. The owner, 19 October 2026:
 * it *looks more like mathematic shapes* than a living thing.
 *
 * **What this argues.** That what makes a maggot read as an animal is what
 * you see *through* it. One dark gut runs the whole length, at the same
 * height on every ring so the rings' tracts join into one, swollen where a
 * mouthful sits — in places no two rings share — and pushed back by the
 * squeeze, which is food being moved. A silver breathing tube runs down the
 * upper flank with a twig into each ring. The thin trailing edge of every
 * ring glows its own colour where the light comes through, and the leading
 * end goes dark where it tucks under the ring in front, so the rings read as
 * folds of one body rather than eggs laid on each other. The face drops the
 * cartoon eye for what a maggot really has: a black mouth hook on a dark frame
 * inside a clear head, raking out and back on the squeeze.
 *
 * **How it can lose.** *No eye.* A pair reading which way the worm faces may
 * miss the eye more than they gain from the hook.
 */
export const CRAWLER_LARVA: Variant = {
  slot: "creature:crawler",
  name: "larva",
  sentence:
    "a real fly maggot seen through — the gut running its length with mouthfuls moving down it, a silver breathing tube down its flank, rings dark where they tuck under each other and glowing where the thin edge lets light through, and a black mouth hook raking inside a clear head",
  dir: "tools/versus/candidates/creature-crawler/larva",
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
      fields: { slime: larvaSlime, face: larvaFace },
    }),
  ],
};
