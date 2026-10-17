import type { Wave } from "../wave-types.js";

/**
 * Waves 284 to 293 of the game, in the order they are played: THE BALLOON's
 * block, the filler before THE SURGE and the boss THE SURGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_24: Wave[] = [
  {
    id: "theBalloon",
    name: "THE BALLOON",
    guide: {
      scene: "theBalloon",
    },
    entries: [
      { beat: 0, col: 3, kind: "balloon", color: null },
      { beat: 8, col: 8, kind: "balloon", color: null },
      { beat: 18, col: 7, kind: "balloon", color: null },
      { beat: 26, col: 0, kind: "balloon", color: null },
      { beat: 34, col: 10, kind: "balloon", color: null },
      { beat: 44, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonAgain",
    name: "FIRST BALLOON",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "balloon", color: null },
      { beat: 6, col: 2, kind: "balloon", color: null },
      { beat: 13, col: 10, kind: "balloon", color: null },
      { beat: 20, col: 1, kind: "balloon", color: null },
      { beat: 27, col: 10, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonReach",
    name: "BALLOON WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "balloon", color: null },
      { beat: 6, col: 2, kind: "choir", color: "red" },
      { beat: 12, col: 9, kind: "meteor", color: null },
      { beat: 17, col: 2, kind: "balloon", color: null },
      { beat: 25, col: 8, kind: "choir", color: "red" },
      { beat: 31, col: 4, kind: "meteor", color: null },
    ],
  },
  {
    id: "theBalloonPair",
    name: "BALLOON TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 0, kind: "balloon", color: null },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 17, col: 8, kind: "choir", color: "red" },
      { beat: 23, col: 5, color: "red" },
      { beat: 28, col: 8, kind: "meteorMedium", color: null },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 38, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonRecall",
    name: "ANCIENT BALLOON",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 4, kind: "balloon", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 2, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 25, col: 0, color: "cyan" },
      { beat: 32, col: 10, kind: "balloon", color: null },
      { beat: 39, col: 0, color: "cyan" },
    ],
  },
  {
    id: "theBalloonPeak",
    name: "BALLOON THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 3, kind: "balloon", color: null },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 1, kind: "choir", color: "cyan" },
      { beat: 19, col: 5, color: "cyan" },
      { beat: 19, col: 8, color: "cyan" },
      { beat: 27, col: 9, kind: "weight", color: null },
      { beat: 32, col: 4, kind: "balloon", color: null },
      { beat: 37, col: 0, color: "red" },
      { beat: 37, col: 10, color: "red" },
      { beat: 44, col: 1, kind: "choir", color: "red" },
    ],
  },
  {
    id: "fillerSurgeBreathe",
    name: "BALLOON LULLABY",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 7, kind: "balloon", color: null },
      { beat: 13, col: 9, color: "red" },
      { beat: 20, col: 0, kind: "choir", color: "red" },
      { beat: 26, col: 4, color: "cyan" },
      { beat: 32, col: 5, kind: "countdown", color: "cyan" },
      { beat: 40, col: 6, color: "red" },
    ],
  },
  {
    id: "fillerSurgeRecall",
    name: "BALLOON HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 6, kind: "balloon", color: null },
      { beat: 12, col: 8, color: "red" },
      { beat: 17, col: 5, kind: "fence", color: null },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 28, col: 4, kind: "balloon", color: null },
      { beat: 33, col: 3, kind: "fence", color: null },
      { beat: 38, col: 2, color: "red" },
      { beat: 38, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerSurgeBend",
    name: "BALLOON MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 8, kind: "balloon", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 6, color: "red" },
      { beat: 16, col: 3, kind: "choir", color: "cyan" },
      { beat: 22, col: 8, kind: "balloon", color: null },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 27, col: 6, color: "cyan" },
      { beat: 32, col: 0, kind: "choir", color: "red" },
      { beat: 37, col: 9, kind: "balloon", color: null },
      { beat: 45, col: 3, color: "cyan" },
      { beat: 45, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theSurge",
    name: "THE SURGE",
    guide: {
      scene: "theSurge",
    },
    entries: [
      { beat: 14, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 8, color: "red" },
      { beat: 30, col: 5, kind: "meteor", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 7, kind: "meteor", color: null },
      { beat: 58, col: 10, color: "red" },
      { beat: 66, col: 3, color: "cyan" },
      { beat: 76, col: 5, kind: "meteor", color: null },
    ],
    boss: { kind: "surge" },
    bossType: "normal",
  },
];
