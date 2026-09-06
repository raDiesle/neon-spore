import { CRAWLER_PULSE } from "../../../../../packages/content/src/crawler-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `crawler:pulse` / `fine` — the same idea as `stepped`, at thirty-two
 * positions per cycle instead of sixteen.
 *
 * The trade this half of the slot exists to show. Doubling the positions halves
 * how far the contour jumps between two of them, so the contraction should read
 * as smoother; it also halves how long each cached path is reused, from four or
 * five frames down to two or three, which is most of the saving `stepped` was
 * offered for. If both read as living, `stepped` is the one worth having; if
 * neither does, the wave stays continuous and the 23 us a nine-ring worm spends
 * rebuilding its contours is the price of a body that moves like an animal.
 *
 * See `../stepped/index.ts` for the measurement and the argument in full.
 */
export const CRAWLER_FINE: Variant = {
  slot: "crawler:pulse",
  name: "fine",
  sentence: "thirty-two positions instead of sixteen — half the step, and half the saving",
  dir: "tools/versus/candidates/crawler-pulse/fine",
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
          const steps = 32;
          const phase = beats / 2 - order * perLink;
          return Math.sin((Math.round(phase * steps) / steps) * Math.PI * 2);
        },
      },
    }),
  ],
};
