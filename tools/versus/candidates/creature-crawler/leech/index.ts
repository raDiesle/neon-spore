import * as crawlerLook from "../../../../../packages/render/src/crawler-look.js";
import { patch, type Variant } from "../../../variant.js";
import { leechFace, leechSlime } from "./paint.js";

/**
 * `creature:crawler` / `leech` — soaked.
 *
 * **What the shipped side is.** GUT: every ring the same smooth egg with a
 * soft dark organ in it and one soft highlight. The owner, 19 October 2026:
 * it *looks more like mathematic shapes* than a living thing.
 *
 * **What this argues.** That *wet* is what a slime-thing is, and that wet is
 * a hard glint, not a soft one: three sharp panes along the back the way
 * water throws back a window, sliding as the squeeze bends the skin, and a
 * cold rim of slime along the belly. Under it a leech's pattern — two dark
 * stripes wandering down the whole animal, joined ring to ring, with pale
 * flecks between them that no two rings share — and the same dark crease
 * where each ring tucks under the next. The face is a sucker: a dark cup at
 * the tip that opens on the release, under a short row of eyespots.
 *
 * **How it can lose.** *Stripes are a pattern,* and a pattern laid along the
 * worm may read as a decal rather than a skin.
 */
export const CRAWLER_LEECH: Variant = {
  slot: "creature:crawler",
  name: "leech",
  sentence:
    "soaked — a hard glint broken into panes along the back, two dark stripes wandering down the whole animal with pale flecks between, a cold rim of slime along the belly, and a dark sucker for a mouth under a row of eyespots",
  dir: "tools/versus/candidates/creature-crawler/leech",
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
      fields: { slime: leechSlime, face: leechFace },
    }),
  ],
};
