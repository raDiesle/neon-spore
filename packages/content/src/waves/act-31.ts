import type { Wave } from "../wave-types.js";

/**
 * Waves 423 to 432 of the game, in the order they are played: THE CAROM's
 * block, the filler before THE TASTER and the boss THE TASTER.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_31: Wave[] = [
  {
    id: "theCarom",
    name: "THE CAROM",
    guide: {
      scene: "theCarom",
    },
    entries: [
      { beat: 0, col: 0, kind: "carom", color: "red" },
      { beat: 12, col: 10, kind: "carom", color: "cyan" },
      { beat: 24, col: 2, kind: "carom", color: "cyan" },
      { beat: 28, col: 8, kind: "carom", color: "red" },
    ],
  },
  {
    id: "theCaromAgain",
    name: "CAROM RISING",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "carom", color: "cyan" },
      { beat: 7, col: 1, kind: "carom", color: "cyan" },
      { beat: 14, col: 10, kind: "carom", color: "cyan" },
      { beat: 21, col: 7, kind: "carom", color: "cyan" },
      { beat: 28, col: 0, kind: "carom", color: "red" },
    ],
  },
  {
    id: "theCaromReach",
    name: "CAROM VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "carom", color: "red" },
      { beat: 5, col: 10, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 13, col: 4, kind: "clasp", color: "cyan" },
      { beat: 19, col: 8, kind: "carom", color: "cyan" },
      { beat: 25, col: 3, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 31, col: 7, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theCaromPair",
    name: "CAROM ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 4, kind: "carom", color: "red" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 7, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 21, col: 0, color: "red" },
      { beat: 25, col: 10, kind: "choir", color: "cyan" },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 38, col: 1, kind: "carom", color: "red" },
    ],
  },
  {
    id: "theCaromRecall",
    name: "OLD CAROM SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 4, kind: "carom", color: "red" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 17, col: 0, kind: "seeder", color: "red" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 30, col: 0, kind: "carom", color: "red" },
      { beat: 38, col: 1, color: "cyan" },
    ],
  },
  {
    id: "theCaromPeak",
    name: "CAROM INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 10, kind: "carom", color: "red" },
      { beat: 8, col: 1, color: "red" },
      { beat: 16, col: 7, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 19, col: 1, color: "cyan" },
      { beat: 19, col: 9, color: "cyan" },
      { beat: 26, col: 0, kind: "torch", color: null },
      { beat: 33, col: 9, kind: "carom", color: "cyan" },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 42, col: 0, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 47, col: 6, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerTasterBreathe",
    name: "SOFT CAROM",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 10, kind: "carom", color: "red" },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 22, col: 10, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 30, col: 0, color: "red" },
      { beat: 37, col: 5, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "fillerTasterRecall",
    name: "CAROM REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 3, kind: "carom", color: "red" },
      { beat: 12, col: 10, color: "red" },
      { beat: 17, col: 8, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 28, col: 3, kind: "carom", color: "cyan" },
      { beat: 34, col: 8, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
    ],
  },
  {
    id: "fillerTasterBend",
    name: "CAROM RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 2, kind: "carom", color: "red" },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 8, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 22, col: 0, kind: "carom", color: "red" },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 34, col: 6, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 39, col: 10, kind: "carom", color: "red" },
      { beat: 44, col: 2, color: "red" },
      { beat: 44, col: 8, color: "red" },
    ],
  },
  {
    id: "theTaster",
    name: "THE TASTER",
    guide: {
      scene: "theTaster",
    },
    entries: [
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 8, kind: "meteor", color: null },
      { beat: 30, col: 5, color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 44, col: 10, kind: "meteor", color: null },
      { beat: 50, col: 3, color: "red" },
      { beat: 56, col: 7, color: "cyan" },
      { beat: 64, col: 5, kind: "meteor", color: null },
      { beat: 72, col: 2, color: "cyan" },
      { beat: 80, col: 8, color: "red" },
    ],
    boss: { kind: "taster" },
    bossType: "normal",
  },
];
