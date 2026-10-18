import type { Wave } from "../wave-types.js";

/**
 * Waves 282 to 291 of the game, in the order they are played: THE BALLOON's
 * block, the filler before THE SINEW and the boss THE SINEW.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_18: Wave[] = [
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
      { beat: 0, col: 2, kind: "balloon", color: null },
      { beat: 8, col: 3, kind: "balloon", color: null },
      { beat: 15, col: 8, kind: "balloon", color: null },
      { beat: 22, col: 2, kind: "balloon", color: null },
      { beat: 29, col: 8, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonReach",
    name: "BALLOON VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "balloon", color: null },
      { beat: 5, col: 10, kind: "choir", color: "red" },
      { beat: 13, col: 5, kind: "balloon", color: null },
      { beat: 18, col: 9, kind: "choir", color: "red" },
      { beat: 24, col: 4, kind: "balloon", color: null },
      { beat: 30, col: 0, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theBalloonPair",
    name: "BALLOON ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 10, kind: "balloon", color: null },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 20, col: 7, kind: "choir", color: "cyan" },
      { beat: 25, col: 2, color: "cyan" },
      { beat: 30, col: 4, kind: "gyre", color: null },
      { beat: 35, col: 1, color: "cyan" },
    ],
  },
  {
    id: "theBalloonRecall",
    name: "BALLOON LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 4, kind: "balloon", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 18, col: 2, kind: "wisp", color: null },
      { beat: 24, col: 1, color: "red" },
      { beat: 31, col: 10, kind: "balloon", color: null },
      { beat: 37, col: 0, color: "red" },
    ],
  },
  {
    id: "theBalloonPeak",
    name: "BALLOON THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 3, kind: "balloon", color: null },
      { beat: 9, col: 2, color: "cyan" },
      { beat: 13, col: 1, kind: "choir", color: "red" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 24, col: 8, kind: "meteorMedium", color: null },
      { beat: 28, col: 4, kind: "balloon", color: null },
      { beat: 31, col: 3, color: "red" },
      { beat: 31, col: 6, color: "red" },
      { beat: 34, col: 5, kind: "choir", color: "cyan" },
      { beat: 39, col: 0, kind: "meteorMedium", color: null },
      { beat: 45, col: 2, color: "red" },
      { beat: 45, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerSinewBreathe",
    name: "SOFT BALLOON",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 7, col: 8, kind: "balloon", color: null },
      { beat: 14, col: 5, color: "red" },
      { beat: 22, col: 8, kind: "choir", color: "red" },
      { beat: 29, col: 3, color: "cyan" },
      { beat: 37, col: 0, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "fillerSinewRecall",
    name: "BALLOON RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 0, kind: "balloon", color: null },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 10, kind: "recoil", color: "red" },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 32, col: 5, kind: "balloon", color: null },
      { beat: 37, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerSinewBend",
    name: "BALLOON MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 5, kind: "balloon", color: null },
      { beat: 10, col: 2, color: "red" },
      { beat: 16, col: 1, kind: "choir", color: "red" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 28, col: 3, kind: "balloon", color: null },
      { beat: 33, col: 1, kind: "choir", color: "red" },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 6, color: "cyan" },
      { beat: 44, col: 7, kind: "balloon", color: null },
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
