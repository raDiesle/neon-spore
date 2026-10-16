import { NETTLE_SCRIPT } from "../nettle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 401 to 410 of the game, in the order they are played: THE CRAWLER's
 * block and the boss THE NETTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_39: Wave[] = [
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
      { beat: 0, col: 6, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 8, col: 3, kind: "volley", color: "cyan" },
      { beat: 15, col: 10, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 23, col: 4, kind: "volley", color: "red" },
      { beat: 31, col: 6, kind: "crawler", color: null, segments: 3, side: "left" },
    ],
  },
  {
    id: "theCrawlerSpread",
    name: "CRAWLER SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 7, col: 8, kind: "volley", color: "cyan" },
      { beat: 13, col: 3, kind: "recoil", color: "red" },
      { beat: 18, col: 5, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 25, col: 6, kind: "volley", color: "cyan" },
      { beat: 31, col: 0, kind: "recoil", color: "red" },
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
      { beat: 30, col: 0, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theCrawlerPair",
    name: "CRAWLER MEETS VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 0, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 8, col: 10, color: "cyan" },
      { beat: 12, col: 0, kind: "volley", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 20, col: 3, kind: "recoil", color: "cyan" },
      { beat: 26, col: 9, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 30, col: 1, color: "cyan" },
      { beat: 30, col: 9, color: "cyan" },
      { beat: 34, col: 6, kind: "volley", color: "red" },
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
      { beat: 15, col: 5, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 20, col: 0, color: "cyan" },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 26, col: 7, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 32, col: 6, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
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
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 1, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 6, col: 1, color: "red" },
      { beat: 6, col: 9, color: "red" },
      { beat: 9, col: 6, kind: "volley", color: "cyan" },
      { beat: 15, col: 3, color: "cyan" },
      { beat: 15, col: 6, color: "cyan" },
      { beat: 19, col: 4, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 22, col: 3, kind: "volley", color: "cyan" },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "cyan" },
      { beat: 33, col: 8, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 37, col: 3, color: "cyan" },
      { beat: 37, col: 7, color: "cyan" },
      { beat: 40, col: 9, kind: "volley", color: "red" },
      { beat: 46, col: 1, color: "cyan" },
      { beat: 46, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 4, col: 9, row: 3, kind: "pod" },
      { beat: 20, col: 10, row: 3, kind: "pod" },
      { beat: 36, col: 0, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theNettle",
    name: "THE NETTLE",
    guide: {
      both: "A jellyfish over the ship. Its rings say what to do. A hand is your thumb on it. SHOOT, SHIELD or SUCK is the panel, under the ring.",
      p1: "1. Pull, tap, turn or hold the rings on the left, and the shared ones.\n2. Move the cannon under SHOOT or SUCK. Hold SUCK yourself.\n3. When the shield is under SHIELD, press your shield button.",
      p2: "1. Pull, tap, turn or hold the rings on the right, and the shared ones.\n2. Fire when the cannon is under SHOOT.\n3. Move the shield under SHIELD, and say when.",
    },
    entries: [],
    boss: { kind: "nettle", steps: NETTLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
