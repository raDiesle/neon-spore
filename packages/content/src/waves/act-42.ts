import type { Wave } from "../wave-types.js";

/**
 * Waves 442 to 451 of the game, in the order they are played: THE CRAWLER's
 * block and the boss THE KEEL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_42: Wave[] = [
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
      { beat: 0, col: 10, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 8, col: 0, kind: "volley", color: "cyan" },
      { beat: 14, col: 1, kind: "rind", color: "red" },
      { beat: 22, col: 6, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 30, col: 9, kind: "volley", color: "red" },
    ],
  },
  {
    id: "theCrawlerSpread",
    name: "CRAWLER SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 5, col: 10, kind: "volley", color: "cyan" },
      { beat: 12, col: 4, kind: "morsel", color: "cyan" },
      { beat: 17, col: 5, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 24, col: 4, kind: "volley", color: "cyan" },
      { beat: 29, col: 7, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "theCrawlerReach",
    name: "OUTER CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 5, col: 4, kind: "volley", color: "cyan" },
      { beat: 11, col: 0, kind: "coil", color: null },
      { beat: 16, col: 10, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 22, col: 3, kind: "volley", color: "cyan" },
      { beat: 28, col: 9, kind: "coil", color: null },
    ],
  },
  {
    id: "theCrawlerPair",
    name: "CRAWLER MEETS VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 1, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 8, col: 0, color: "cyan" },
      { beat: 13, col: 7, kind: "volley", color: "red" },
      { beat: 17, col: 0, color: "cyan" },
      { beat: 17, col: 10, color: "cyan" },
      { beat: 22, col: 3, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 28, col: 7, kind: "volley", color: "red" },
      { beat: 34, col: 0, color: "cyan" },
      { beat: 34, col: 10, color: "cyan" },
      { beat: 38, col: 5, kind: "crawler", color: null, segments: 3, side: "left" },
    ],
  },
  {
    id: "theCrawlerBreathe",
    name: "CRAWLER DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 7, col: 4, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 13, col: 10, color: "red" },
      { beat: 19, col: 4, kind: "volley", color: "cyan" },
      { beat: 26, col: 10, color: "cyan" },
      { beat: 32, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 38, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theCrawlerRecall",
    name: "CRAWLER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 9, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 10, col: 10, color: "red" },
      { beat: 15, col: 5, kind: "glutton", color: "cyan" },
      { beat: 20, col: 0, color: "cyan" },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 26, col: 7, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 32, col: 6, kind: "glutton", color: "red" },
      { beat: 38, col: 4, color: "red" },
      { beat: 38, col: 7, color: "red" },
    ],
  },
  {
    id: "theCrawlerBend",
    name: "TWISTED CRAWLER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 7, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 12, col: 0, color: "red" },
      { beat: 12, col: 10, color: "red" },
      { beat: 17, col: 3, kind: "volley", color: "red" },
      { beat: 22, col: 9, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 27, col: 4, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 32, col: 2, kind: "volley", color: "cyan" },
      { beat: 38, col: 5, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 44, col: 1, color: "cyan" },
      { beat: 44, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theCrawlerPeak",
    name: "CRAWLER APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 9, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 8, col: 5, color: "red" },
      { beat: 8, col: 8, color: "red" },
      { beat: 11, col: 9, kind: "volley", color: "cyan" },
      { beat: 15, col: 3, kind: "lid", color: "red" },
      { beat: 19, col: 2, color: "cyan" },
      { beat: 19, col: 8, color: "cyan" },
      { beat: 23, col: 6, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 27, col: 7, kind: "volley", color: "cyan" },
      { beat: 31, col: 5, color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 34, col: 7, kind: "lid", color: "red" },
      { beat: 38, col: 4, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 6, color: "red" },
      { beat: 44, col: 7, kind: "volley", color: "red" },
      { beat: 48, col: 6, kind: "lid", color: "cyan" },
    ],
  },
  {
    id: "theKeel",
    name: "THE KEEL",
    guide: {
      both: "Six joints. When one lights, tap it if it is on your half. The middle opens: shoot it in its colour. Then the joints light fast. Shoot the rock.",
      p1: "1. Tap a lit joint on the left half of the spine.\n2. Move the cannon under the open middle, then under the rock.\n3. The joints light fast at the end. Watch which half.",
      p2: "1. Tap a lit joint on the right half of the spine.\n2. Fire the open middle in the colour it shows.\n3. Fire the rock the tail throws before it lands.",
    },
    entries: [],
    boss: { kind: "keel", socket: "red", reprise: [4, 3, 0] },
    bossType: "normal",
  },
];
