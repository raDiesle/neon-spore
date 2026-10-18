import type { Wave } from "../wave-types.js";

/**
 * Waves 456 to 465 of the game, in the order they are played: THE CRAWLER's
 * block, the filler before THE UNDERTOW and the boss THE UNDERTOW.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_38: Wave[] = [
  {
    id: "theCrawler",
    name: "THE CRAWLER",
    guide: {
      scene: "theCrawler",
    },
    entries: [
      { beat: 0, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 24, col: 10, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 48, col: 0, kind: "crawler", color: null, segments: 7, side: "left" },
    ],
  },
  {
    id: "theCrawlerAgain",
    name: "CRAWLER DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 6, col: 8, kind: "volley", color: "cyan" },
      { beat: 13, col: 0, kind: "meteorMedium", color: null },
      { beat: 21, col: 3, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 27, col: 8, kind: "volley", color: "red" },
    ],
  },
  {
    id: "theCrawlerReach",
    name: "FAR CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 6, col: 5, kind: "volley", color: "cyan" },
      { beat: 12, col: 10, kind: "clasp", color: "cyan" },
      { beat: 18, col: 3, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 24, col: 9, kind: "volley", color: "red" },
      { beat: 31, col: 0, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theCrawlerPair",
    name: "CRAWLER TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 4, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 9, col: 0, color: "cyan" },
      { beat: 15, col: 2, kind: "volley", color: "red" },
      { beat: 19, col: 3, color: "red" },
      { beat: 19, col: 7, color: "red" },
      { beat: 25, col: 10, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 30, col: 4, kind: "volley", color: "red" },
      { beat: 34, col: 0, color: "red" },
      { beat: 34, col: 10, color: "red" },
    ],
  },
  {
    id: "theCrawlerRecall",
    name: "CRAWLER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 9, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 17, col: 6, kind: "lid", color: "cyan" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 29, col: 1, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 35, col: 7, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theCrawlerPeak",
    name: "CRAWLER INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 7, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 10, col: 9, color: "cyan" },
      { beat: 14, col: 4, kind: "volley", color: "cyan" },
      { beat: 17, col: 6, kind: "throb", color: "red" },
      { beat: 21, col: 2, color: "red" },
      { beat: 21, col: 8, color: "red" },
      { beat: 24, col: 10, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 29, col: 4, kind: "volley", color: "red" },
      { beat: 33, col: 1, color: "red" },
      { beat: 33, col: 9, color: "red" },
      { beat: 36, col: 7, kind: "throb", color: "red" },
      { beat: 44, col: 6, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 48, col: 4, color: "cyan" },
      { beat: 48, col: 7, color: "cyan" },
    ],
  },
  {
    id: "fillerUndertowBreathe",
    name: "SOFT CRAWLER",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 20, col: 2, kind: "volley", color: "cyan" },
      { beat: 26, col: 10, color: "red" },
      { beat: 34, col: 6, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerUndertowRecall",
    name: "CRAWLER RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 2, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 9, kind: "throb", color: "red" },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 30, col: 5, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 35, col: 3, kind: "throb", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 6, color: "cyan" },
    ],
  },
  {
    id: "fillerUndertowBend",
    name: "CROOKED CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 5, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 10, col: 3, color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 16, col: 0, kind: "volley", color: "red" },
      { beat: 22, col: 5, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 33, col: 6, kind: "volley", color: "cyan" },
      { beat: 38, col: 4, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 44, col: 0, color: "red" },
      { beat: 44, col: 10, color: "red" },
    ],
  },
  {
    id: "theUndertow",
    name: "THE UNDERTOW",
    guide: {
      scene: "theUndertow",
    },
    entries: [
      { beat: 54, col: 2, color: "red" },
      { beat: 62, col: 8, color: "cyan" },
      { beat: 70, col: 0, color: "cyan" },
      { beat: 78, col: 10, color: "red" },
      { beat: 86, col: 3, color: "red" },
      { beat: 94, col: 7, color: "cyan" },
    ],
    boss: { kind: "undertow" },
    bossType: "normal",
  },
];
