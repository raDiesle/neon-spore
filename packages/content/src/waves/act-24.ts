import type { Wave } from "../wave-types.js";

/**
 * Waves 305 to 314 of the game, in the order they are played: THE BALLOON's
 * block, the filler before THE SINEW and the boss THE SINEW.
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
    name: "BALLOON VOYAGE",
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
    name: "BALLOON ALLIANCE",
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
    name: "BALLOON LEGEND",
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
    id: "fillerSinewBreathe",
    name: "SOFT BALLOON",
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 2, kind: "balloon", color: null },
      { beat: 14, col: 9, color: "red" },
      { beat: 20, col: 2, kind: "choir", color: "cyan" },
      { beat: 28, col: 7, color: "red" },
      { beat: 36, col: 9, kind: "balloon", color: null },
    ],
  },
  {
    id: "fillerSinewRecall",
    name: "BALLOON RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 5, kind: "balloon", color: null },
      { beat: 11, col: 7, color: "red" },
      { beat: 16, col: 4, kind: "glutton", color: "red" },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 27, col: 6, kind: "balloon", color: null },
      { beat: 32, col: 10, kind: "glutton", color: "red" },
      { beat: 38, col: 4, color: "red" },
      { beat: 38, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerSinewBend",
    name: "BALLOON MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 0, kind: "balloon", color: null },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 19, col: 1, kind: "choir", color: "red" },
      { beat: 24, col: 7, kind: "balloon", color: null },
      { beat: 29, col: 2, color: "red" },
      { beat: 29, col: 8, color: "red" },
      { beat: 34, col: 8, kind: "choir", color: "cyan" },
      { beat: 40, col: 2, kind: "balloon", color: null },
      { beat: 46, col: 1, color: "red" },
      { beat: 46, col: 9, color: "red" },
    ],
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    guide: {
      scene: "theSinew",
    },
    entries: [],
    boss: { kind: "sinew" },
    bossType: "normal",
  },
];
