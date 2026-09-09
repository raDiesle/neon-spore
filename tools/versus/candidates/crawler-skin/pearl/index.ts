import * as crawlerLook from "../../../../../packages/render/src/crawler-look.js";
import { patch, type Variant } from "../../../variant.js";
import { pearl } from "./paint.js";

/**
 * `crawler:skin` / `pearl` — a worm made of six turning balls instead of six
 * shapes with a highlight painted on each.
 *
 * The shipped wet is three ellipses: a belly shadow under the ring, a specular
 * along the top, and a catchlight that slides sideways as the ring squeezes.
 * It is good paint and it is entirely **posed** — every mark is laid out in
 * picture coordinates and moved by picture arithmetic, so what travels when the
 * worm walks is the highlight, and a highlight that travels is a light that is
 * following the animal about. `docs/style-guide.md`'s Depth section names the
 * failure exactly: a body's silhouette is posed and its surface is *placed*,
 * and the two are reachable by different machinery.
 *
 * PEARL is the other half of that rule applied to the one creature on this
 * field that already has a wave running down it. Each ring is a ball: the
 * shipped `litRound` puts a terminator across it in the value half only, eight
 * pores are pinned at fixed longitudes and latitudes and carried round by a
 * roll that runs backwards along the way the worm is going, and one specular
 * sits still while all of it travels underneath. The pores at the back come
 * into view and the ones at the front go away — the **reveal**, which
 * `docs/dimensional.md` measures at 22.9 : 1 against the 1.10 : 1 an affine
 * pose manages, and which is the one cue that is a difference in kind rather
 * than of degree.
 *
 * **The roll is the animation, and it is the argument.** A maggot's skin
 * travels toward its tail while the maggot travels toward the wall, so the
 * surface rolling backwards is what the picture is claiming: not that the worm
 * is shiny, but that it is *crawling*, and that its wet is on something with a
 * far side.
 *
 * **It costs no frames.** The terminator is `key-light.ts`'s baked sprite,
 * keyed on a radius quantised to four pixels and a spin quantised to a
 * twenty-fourth, so six rings on the field hit one cached canvas; and the
 * pores are eight ellipses of which about half are drawn on any frame, against
 * the three the shipped wet draws unconditionally.
 *
 * How it can lose, in the pair's own words, because they should be looking for
 * it. **A worm should not glitter.** Eight dark pores travelling round six
 * rings at forty pixels each is a lot of small moving marks in the row directly
 * above the ship, which is the busiest row on the screen and the one a player
 * is reading a colour off. If the worm reads as *sequins* rather than as
 * *slime*, that is this candidate, and the answer is not fewer pores — the
 * answer is the shipped one.
 */
export const CRAWLER_PEARL: Variant = {
  slot: "crawler:skin",
  name: "pearl",
  sentence:
    "each ring is a ball with pores placed on it and a light that stays put — the surface rolls backwards as the worm walks, and its far side comes into view",
  dir: "tools/versus/candidates/crawler-skin/pearl",
  patches: [
    patch({
      target: crawlerLook.CRAWLER_LOOK,
      // No accessor: `drawLink` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => crawlerLook.CRAWLER_LOOK,
      where: {
        file: "packages/render/src/crawler-look.ts",
        symbol: "CRAWLER_LOOK",
        type: "CrawlerLook",
      },
      // `slime` alone, and `face` deliberately left as it ships. The slot's
      // question is what a worm's *surface* is made of; a maggot's head is a
      // hard cap with a face on it and is a different question, which a vote
      // on two fields at once could not answer.
      fields: { slime: pearl },
    }),
  ],
};
