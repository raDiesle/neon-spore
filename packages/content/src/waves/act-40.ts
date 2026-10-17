import type { Wave } from "../wave-types.js";

/**
 * Waves 445 to 454 of the game, in the order they are played: THE CRAWLER's
 * block, the filler before THE UNDERTOW and the boss THE UNDERTOW.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_40: Wave[] = [
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
      { beat: 0, col: 8, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 8, col: 1, kind: "volley", color: "red" },
      { beat: 14, col: 8, kind: "magnet", color: "red" },
      { beat: 22, col: 3, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 30, col: 9, kind: "volley", color: "red" },
    ],
  },
  {
    id: "theCrawlerReach",
    name: "OUTER CRAWLER",
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
    name: "CRAWLER MEETS VOLLEY",
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
    name: "CRAWLER APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 5, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 7, col: 2, color: "cyan" },
      { beat: 7, col: 8, color: "cyan" },
      { beat: 15, col: 0, kind: "volley", color: "red" },
      { beat: 18, col: 1, kind: "rind", color: "cyan" },
      { beat: 22, col: 0, color: "red" },
      { beat: 22, col: 10, color: "red" },
      { beat: 26, col: 1, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 32, col: 9, kind: "volley", color: "cyan" },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
      { beat: 45, col: 10, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "fillerUndertowBreathe",
    name: "SOFT CRAWLER",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 5, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 16, col: 6, color: "red" },
      { beat: 23, col: 0, kind: "volley", color: "cyan" },
      { beat: 31, col: 10, color: "red" },
      { beat: 37, col: 1, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerUndertowRecall",
    name: "CRAWLER RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 6, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 10, kind: "morsel", color: "red" },
      { beat: 25, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 30, col: 3, color: "red" },
      { beat: 30, col: 6, color: "red" },
      { beat: 35, col: 4, kind: "morsel", color: "red" },
      { beat: 40, col: 8, kind: "crawler", color: null, segments: 7, side: "left" },
    ],
  },
  {
    id: "fillerUndertowBend",
    name: "CROOKED CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 5, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 10, col: 4, kind: "volley", color: "red" },
      { beat: 15, col: 0, color: "red" },
      { beat: 15, col: 10, color: "red" },
      { beat: 21, col: 2, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 26, col: 1, kind: "volley", color: "red" },
      { beat: 31, col: 3, color: "red" },
      { beat: 31, col: 6, color: "red" },
      { beat: 37, col: 7, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 43, col: 3, kind: "volley", color: "cyan" },
      { beat: 48, col: 1, color: "red" },
      { beat: 48, col: 9, color: "red" },
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
