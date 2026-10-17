import type { Wave } from "../wave-types.js";

/**
 * Waves 284 to 293 of the game, in the order they are played: THE BALLOON's
 * block, the filler before THE SURGE and the boss THE SURGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_26: Wave[] = [
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
      { beat: 0, col: 8, kind: "balloon", color: null },
      { beat: 6, col: 0, kind: "balloon", color: null },
      { beat: 13, col: 1, kind: "balloon", color: null },
      { beat: 20, col: 10, kind: "balloon", color: null },
      { beat: 26, col: 1, kind: "balloon", color: null },
      { beat: 32, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonReach",
    name: "BALLOON WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "balloon", color: null },
      { beat: 5, col: 4, kind: "choir", color: "cyan" },
      { beat: 11, col: 9, kind: "weight", color: null },
      { beat: 17, col: 5, kind: "balloon", color: null },
      { beat: 23, col: 9, kind: "choir", color: "cyan" },
      { beat: 28, col: 4, kind: "weight", color: null },
    ],
  },
  {
    id: "theBalloonPair",
    name: "BALLOON TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 9, kind: "balloon", color: null },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 9, kind: "choir", color: "cyan" },
      { beat: 20, col: 1, color: "red" },
      { beat: 25, col: 4, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 30, col: 9, color: "red" },
      { beat: 34, col: 2, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonRecall",
    name: "ANCIENT BALLOON",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 7, kind: "balloon", color: null },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 0, kind: "weight", color: null },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 27, col: 0, kind: "balloon", color: null },
      { beat: 32, col: 5, color: "cyan" },
      { beat: 37, col: 0, kind: "weight", color: null },
    ],
  },
  {
    id: "theBalloonPeak",
    name: "BALLOON THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 10, kind: "balloon", color: null },
      { beat: 7, col: 7, color: "cyan" },
      { beat: 11, col: 6, kind: "choir", color: "red" },
      { beat: 14, col: 1, color: "red" },
      { beat: 14, col: 9, color: "red" },
      { beat: 21, col: 5, kind: "balloon", color: null },
      { beat: 25, col: 4, color: "red" },
      { beat: 25, col: 7, color: "red" },
      { beat: 29, col: 5, kind: "choir", color: "cyan" },
      { beat: 36, col: 1, color: "cyan" },
      { beat: 36, col: 9, color: "cyan" },
      { beat: 40, col: 8, kind: "balloon", color: null },
      { beat: 44, col: 2, kind: "choir", color: "red" },
      { beat: 47, col: 5, color: "red" },
    ],
    pods: [
      { beat: 17, col: 9, row: 4, kind: "husk" },
      { beat: 33, col: 3, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerSurgeBreathe",
    name: "BALLOON LULLABY",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 4, kind: "balloon", color: null },
      { beat: 14, col: 10, color: "cyan" },
      { beat: 20, col: 7, kind: "choir", color: "cyan" },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 33, col: 7, kind: "glutton", color: "red" },
      { beat: 39, col: 6, color: "cyan" },
    ],
  },
  {
    id: "fillerSurgeRecall",
    name: "BALLOON HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 10, kind: "balloon", color: null },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 2, kind: "veer", color: null },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 26, col: 10, kind: "balloon", color: null },
      { beat: 32, col: 9, kind: "veer", color: null },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerSurgeBend",
    name: "BALLOON MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 2, kind: "balloon", color: null },
      { beat: 10, col: 0, color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 8, kind: "choir", color: "red" },
      { beat: 22, col: 10, kind: "balloon", color: null },
      { beat: 27, col: 5, color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 32, col: 1, kind: "choir", color: "red" },
      { beat: 37, col: 9, kind: "balloon", color: null },
      { beat: 43, col: 4, color: "cyan" },
      { beat: 43, col: 7, color: "cyan" },
      { beat: 48, col: 8, kind: "choir", color: "red" },
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
