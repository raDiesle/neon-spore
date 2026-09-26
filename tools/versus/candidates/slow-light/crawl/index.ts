import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { crawlWindow } from "./paint.js";

/**
 * CRAWL — offered 26 September 2026, when the owner took PRISM on top of the
 * streams and asked for the streams to be argued again as light *slowing*
 * round the boss. Every answer in `slow:light` keeps the prism and the fuse
 * and replaces the streams (`../window.ts`).
 */
export const SLOW_CRAWL: Variant = {
  slot: "slow:light",
  name: "crawl",
  sentence:
    "crawl — the streams, braking: sparks leave the edge of the screen as long cold streaks and slow as they near, shortening to points and warming to red, until they bank up into a rim a tenth of a body off the skin",
  dir: "tools/versus/candidates/slow-light/crawl",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: crawlWindow },
    }),
  ],
};
