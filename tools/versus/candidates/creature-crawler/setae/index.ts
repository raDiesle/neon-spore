import * as crawlerLook from "../../../../../packages/render/src/crawler-look.js";
import { patch, type Variant } from "../../../variant.js";
import { setae } from "./paint.js";

/**
 * `creature:crawler` / `setae` — every ring wears a girdle of bristles, and
 * the walk is seen on them.
 *
 * **What the shipped side is.** PEARL: each ring a lit ball with eight pores
 * rolling backwards on it under a specular that stays put. The surface
 * travels, which is right — but nothing on it *does* anything when the ring
 * contracts, so the walk is in the outline alone.
 *
 * **What this argues.** That a maggot's segments carry setae, and that
 * bristles are what a contraction is seen on. SOFT SPIKE off the shapes
 * page, twelve to a ring, pinned at one latitude behind the ring's middle
 * and carried round by the shipped roll: each stands off the surface along
 * its own normal, is drawn only where the surface faces us, reads short
 * end-on across the middle and full length at the limb, and **sweeps back
 * toward the tail by the squeeze** — so the wave that runs down the worm
 * runs down its hairs, a ring at a time. They are drawn outside the contour,
 * because a hair cut to the body is a hair that stops where the body does.
 * The light pass and the specular are the shipped ones; the pores go.
 *
 * **How it can lose.** *It is a caterpillar.* Bristles on a body say
 * *insect* louder than *maggot*, and twelve per ring on six rings is
 * seventy-two strokes on the busiest row of the screen. If at the pair the
 * worm reads as a different animal, or the field under it slows, the girdle
 * has to thin to six and shorten.
 */
export const CRAWLER_SETAE: Variant = {
  slot: "creature:crawler",
  name: "setae",
  sentence:
    "a girdle of twelve short bristles round the rear of every ring, placed by longitude and carried round by the roll, sweeping back as the ring squeezes — a walk seen on hairs standing off a ball",
  dir: "tools/versus/candidates/creature-crawler/setae",
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
      fields: { slime: setae },
    }),
  ],
};
