import type { Wave } from "../wave-types.js";

/**
 * Waves 393 to 402 of the game, in the order they are played: THE CRAWLER's
 * block, the filler before THE UNDERTOW and the boss THE UNDERTOW.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_28: Wave[] = [
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
      { beat: 0, col: 3, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 7, col: 8, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 14, col: 0, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 20, col: 8, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 28, col: 4, kind: "crawler", color: null, segments: 5, side: "right" },
    ],
  },
  {
    id: "theCrawlerReach",
    name: "FAR CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 6, col: 3, kind: "volley", color: "cyan" },
      { beat: 19, col: 3, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 25, col: 8, kind: "volley", color: "red" },
    ],
    pods: [{ beat: 11, col: 10, row: 3, kind: "pod" }],
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
      { beat: 19, col: 3, color: "cyan" },
      { beat: 25, col: 10, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 30, col: 2, color: "red" },
      { beat: 38, col: 7, kind: "volley", color: "red" },
    ],
  },
  {
    id: "theCrawlerRecall",
    name: "CRAWLER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 8, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 3, kind: "wisp", color: null },
      { beat: 23, col: 9, color: "red" },
      { beat: 30, col: 0, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 36, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theCrawlerPeak",
    name: "CRAWLER INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 3, col: 1, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 15, col: 5, kind: "volley", color: "cyan" },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 19, col: 7, color: "cyan" },
      { beat: 23, col: 7, kind: "seeder", color: "red" },
      { beat: 27, col: 5, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 30, col: 3, color: "red" },
      { beat: 30, col: 7, color: "red" },
      { beat: 36, col: 10, kind: "volley", color: "red" },
      { beat: 43, col: 0, kind: "seeder", color: "red" },
      { beat: 48, col: 3, color: "red" },
      { beat: 48, col: 6, color: "red" },
    ],
  },
  {
    id: "fillerUndertowBreathe",
    name: "SOFT CRAWLER",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 3, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 5, kind: "volley", color: "cyan" },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 30, col: 8, kind: "choir", color: "cyan" },
      { beat: 36, col: 5, color: "cyan" },
    ],
  },
  {
    id: "fillerUndertowRecall",
    name: "CRAWLER RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 8, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 29, col: 10, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 16, col: 3, row: 3, kind: "pod" },
      { beat: 34, col: 5, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerUndertowBend",
    name: "CROOKED CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 0, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 10, col: 3, color: "cyan" },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 16, col: 5, kind: "volley", color: "cyan" },
      { beat: 22, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 34, col: 6, kind: "volley", color: "cyan" },
      { beat: 39, col: 0, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 45, col: 2, color: "red" },
      { beat: 45, col: 8, color: "red" },
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
