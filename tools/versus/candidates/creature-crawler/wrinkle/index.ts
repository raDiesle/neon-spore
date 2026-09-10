import * as crawlerLook from "../../../../../packages/render/src/crawler-look.js";
import { patch, type Variant } from "../../../variant.js";
import { wrinkle } from "./paint.js";

/**
 * `creature:crawler` / `wrinkle` — a ring that squeezes bunches its skin.
 *
 * **What the shipped side is.** A ball with pores on it, and the pores are
 * the same on a tight ring and a slack one: the contraction changes the
 * outline and nothing on the surface answers it.
 *
 * **What this argues.** That a segment is a bag of skin over a muscle, and
 * when the muscle shortens the skin creases. FOLD off the shapes page, as
 * lines of longitude: six meridians turning with the shipped roll, each an
 * ellipse arc whose half-width is `rx·sin(α)` — a line down the middle when
 * it faces us, bowed to the limb a quarter turn on — each a ridge drawn as a
 * shadow line and a lit line a hair toward the key, lit by calling
 * `surfaceLit` on the fold's own normal. Their strength is the squeeze:
 * nearly gone on a slack ring, deep on a tight one, so the wave that runs
 * down the worm is seen on the skin of every ring it passes. The light pass
 * and the specular are the shipped ones; the pores go.
 *
 * **How it can lose.** *It is a beach ball.* Six meridians on a ball is the
 * one pattern that says *toy*, and on a slack ring a faint set of them may
 * read as a drawn grid rather than as skin. If at the pair the folds show
 * when nothing is squeezing, `SLACK` has to go to nought.
 */
export const CRAWLER_WRINKLE: Variant = {
  slot: "creature:crawler",
  name: "wrinkle",
  sentence:
    "six meridians of fold that come up across a ring as it squeezes and smooth away as it slackens, each a ridge lit toward the key and riding the roll — the contraction seen on the skin, not only in the outline",
  dir: "tools/versus/candidates/creature-crawler/wrinkle",
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
      fields: { slime: wrinkle },
    }),
  ],
};
