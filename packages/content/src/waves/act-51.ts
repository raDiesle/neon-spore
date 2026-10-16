import type { Wave } from "../wave-types.js";

/**
 * Waves 517 to 525 of the game, in the order they are played: THE CRAWLER's
 * review and the boss THE TRAPEZE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_51: Wave[] = [
  {
    id: "reviewCrawlerAgain",
    name: "FIRST CRAWLER",
    entries: [
      { beat: 0, col: 9, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 8, col: 1, kind: "volley", color: "red" },
      { beat: 14, col: 9, kind: "meteorMedium", color: null },
      { beat: 20, col: 10, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 28, col: 6, kind: "volley", color: "red" },
    ],
  },
  {
    id: "reviewCrawlerSpread",
    name: "CRAWLER SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 7, col: 2, kind: "volley", color: "red" },
      { beat: 14, col: 7, kind: "clasp", color: "cyan" },
      { beat: 20, col: 4, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 27, col: 10, kind: "volley", color: "cyan" },
      { beat: 32, col: 1, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "reviewCrawlerReach",
    name: "CRAWLER WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 5, col: 6, kind: "volley", color: "cyan" },
      { beat: 11, col: 0, kind: "rind", color: "cyan" },
      { beat: 16, col: 10, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 22, col: 3, kind: "volley", color: "cyan" },
      { beat: 28, col: 7, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "reviewCrawlerPair",
    name: "CRAWLER TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 6, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 14, col: 3, kind: "volley", color: "red" },
      { beat: 19, col: 2, kind: "veer", color: null },
      { beat: 25, col: 4, color: "red" },
      { beat: 25, col: 7, color: "red" },
      { beat: 31, col: 9, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 37, col: 8, kind: "volley", color: "red" },
    ],
  },
  {
    id: "reviewCrawlerBreathe",
    name: "CRAWLER LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 5, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 13, col: 0, color: "red" },
      { beat: 21, col: 10, kind: "volley", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 34, col: 3, kind: "rind", color: "red" },
    ],
  },
  {
    id: "reviewCrawlerRecall",
    name: "ANCIENT CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 3, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 12, col: 3, color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 17, col: 3, kind: "shell", color: "cyan" },
      { beat: 23, col: 9, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 29, col: 4, color: "red" },
      { beat: 29, col: 7, color: "red" },
      { beat: 34, col: 0, kind: "shell", color: "cyan" },
      { beat: 39, col: 10, kind: "crawler", color: null, segments: 5, side: "right" },
    ],
  },
  {
    id: "reviewCrawlerBend",
    name: "CRAWLER MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 2, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 10, col: 3, kind: "volley", color: "red" },
      { beat: 15, col: 0, color: "cyan" },
      { beat: 15, col: 10, color: "cyan" },
      { beat: 20, col: 0, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 26, col: 5, kind: "volley", color: "red" },
      { beat: 31, col: 1, color: "cyan" },
      { beat: 31, col: 9, color: "cyan" },
      { beat: 37, col: 5, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 43, col: 4, kind: "volley", color: "cyan" },
      { beat: 48, col: 0, color: "red" },
      { beat: 48, col: 10, color: "red" },
    ],
  },
  {
    id: "reviewCrawlerPeak",
    name: "CRAWLER THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 8, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 7, col: 4, kind: "volley", color: "cyan" },
      { beat: 10, col: 2, color: "red" },
      { beat: 10, col: 8, color: "red" },
      { beat: 14, col: 5, kind: "echo", color: "red" },
      { beat: 18, col: 0, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 25, col: 6, kind: "volley", color: "red" },
      { beat: 29, col: 4, kind: "echo", color: "cyan" },
      { beat: 33, col: 2, color: "red" },
      { beat: 33, col: 8, color: "red" },
      { beat: 36, col: 10, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 40, col: 5, kind: "volley", color: "cyan" },
      { beat: 44, col: 2, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
      { beat: 48, col: 0, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theTrapeze",
    name: "THE TRAPEZE",
    guide: {
      scene: "theTrapeze",
    },
    entries: [],
    boss: {
      kind: "trapeze",
      steps: [
        { ask: "push", gongSide: 1, gongMilli: 10000, beats: 32 },
        { ask: "call", gongSide: -1, gongMilli: 14000, beats: 40 },
        { ask: "shoot", gongSide: 1, gongMilli: 16000, beats: 48 },
        { ask: "lock", gongSide: -1, gongMilli: 18000, beats: 48 },
      ],
    },
    bossType: "normal",
  },
];
