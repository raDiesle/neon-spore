import { CRAWLER_PULSE } from "../../../../../packages/content/src/crawler-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `crawler:pulse` / `stepped` — the contraction wave stands in one of sixteen
 * positions per cycle instead of gliding through all of them.
 *
 * **What it is for.** Every ring of every worm rebuilds its own contour on
 * every frame, because the squeeze that shapes it is a continuous sine of the
 * shared clock and there is no key two frames agree on. Measured through a null
 * canvas at 390x844 dpr 3, one ring's contour costs 2.6 us to build, so a
 * nine-ring worm pays 23 us a frame — about a tenth of THE CRAWLER's whole
 * frame, and it is paid every frame the body is on the field. Quantise the wave
 * and the contour becomes cacheable: sixteen positions is sixteen paths, and at
 * 60 frames to a roughly 72-frame cycle each one is reused for four or five
 * frames running.
 *
 * **What it costs.** The pulse is the one thing on screen that says which end
 * of a worm is the front — it runs from the head backwards, which is how a
 * maggot moves. Sixteen steps is about thirteen a second at the tempo this game
 * is played at, and the question a vote answers is whether that reads as a
 * living contraction or as a body ticking.
 *
 * `fine` beside it is the same idea at thirty-two, which steps half as far and
 * saves about half as much.
 */
export const CRAWLER_STEPPED: Variant = {
  slot: "crawler:pulse",
  name: "stepped",
  sentence: "sixteen positions in a cycle instead of a glide — a ring's contour becomes cacheable",
  dir: "tools/versus/candidates/crawler-pulse/stepped",
  patches: [
    patch({
      target: CRAWLER_PULSE,
      // No accessor: `render/crawler.ts` reads the export itself, once per
      // ring per frame. The record is the whole route there is.
      reached: () => CRAWLER_PULSE,
      where: {
        file: "packages/content/src/crawler-shape.ts",
        symbol: "CRAWLER_PULSE",
      },
      fields: {
        squeezeAt(beats: number, order: number, perLink = 0.22): number {
          const steps = 16;
          const phase = beats / 2 - order * perLink;
          return Math.sin((Math.round(phase * steps) / steps) * Math.PI * 2);
        },
      },
    }),
  ],
};
