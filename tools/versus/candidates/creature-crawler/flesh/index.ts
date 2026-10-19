import * as crawlerLook from "../../../../../packages/render/src/crawler-look.js";
import { patch, type Variant } from "../../../variant.js";
import { fleshFace, fleshSlime } from "./paint.js";

/**
 * `creature:crawler` / `flesh` — meat with blood in it.
 *
 * **What the shipped side is.** GUT: every ring the same smooth egg with a
 * soft dark organ in it and one soft highlight. The owner, 19 October 2026:
 * it *looks more like mathematic shapes* than a living thing.
 *
 * **What this argues.** That a body reads as alive when it has blood in it.
 * A vessel runs along the flank at the same height on every ring, so the
 * rings' vessels join into one, with veins branching off it up and down in a
 * pattern no two rings share — on the trailing half of each ring, the half
 * the ring in front does not cover. A second vessel runs down the back, and a
 * heartbeat runs along it from tail to head every two beats. Soft blotches,
 * a breathing pore low on each flank, and the same dark crease where each
 * ring tucks under the next. The head is a hard capsule: darker, polished,
 * three simple eyes, and two jaws that close on the squeeze.
 *
 * **How it can lose.** *Veins are lines,* and a pair reading a worm for which
 * ring is which material may read a branching mark as damage — a crack.
 */
export const CRAWLER_FLESH: Variant = {
  slot: "creature:crawler",
  name: "flesh",
  sentence:
    "meat with blood in it — dark veins branching under the skin, every ring its own, a vessel down the back that a heartbeat runs along from tail to head, soft blotches, a breathing pore on each flank, and a hard dark head with simple eyes and jaws",
  dir: "tools/versus/candidates/creature-crawler/flesh",
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
      fields: { slime: fleshSlime, face: fleshFace },
    }),
  ],
};
