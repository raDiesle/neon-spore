import type { Wave } from "../wave-types.js";

/**
 * Waves 220 to 229 of the game, in the order they are played: HEAVY ROCKS's
 * block, the filler before THE HIVE and the boss THE HIVE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_12: Wave[] = [
  {
    id: "theWard",
    name: "HEAVY ROCKS",
    guide: {
      scene: "theWard",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 8, col: 4, kind: "meteorMedium", color: null },
      { beat: 16, col: 7, kind: "meteorFast", color: null },
      { beat: 24, col: 3, kind: "meteorFaster", color: null },
      { beat: 32, col: 9, kind: "meteorFastest", color: null },
    ],
  },
  {
    id: "theWardAgain",
    name: "HEAVY ROCK RISING",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "meteorMedium", color: null },
      { beat: 8, col: 4, kind: "meteorMedium", color: null },
      { beat: 16, col: 3, kind: "meteorMedium", color: null },
      { beat: 24, col: 7, kind: "meteorMedium", color: null },
      { beat: 31, col: 3, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardReach",
    name: "LONG HEAVY ROCK ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "meteorMedium", color: null },
      { beat: 7, col: 10, kind: "meteor", color: null },
      { beat: 13, col: 5, kind: "meteorMedium", color: null },
      { beat: 18, col: 10, kind: "meteor", color: null },
      { beat: 25, col: 0, kind: "meteorMedium", color: null },
      { beat: 32, col: 9, kind: "meteor", color: null },
    ],
  },
  {
    id: "theWardPair",
    name: "HEAVY ROCK PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 9, kind: "meteorMedium", color: null },
      { beat: 11, col: 4, color: "red" },
      { beat: 17, col: 6, kind: "weight", color: null },
      { beat: 22, col: 9, color: "red" },
      { beat: 26, col: 5, kind: "rind", color: "red" },
      { beat: 32, col: 4, color: "cyan" },
      { beat: 38, col: 7, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardRecall",
    name: "HEAVY ROCK SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 2, kind: "meteorMedium", color: null },
      { beat: 11, col: 0, color: "red" },
      { beat: 18, col: 10, kind: "lure", color: "cyan" },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 31, col: 5, kind: "meteorMedium", color: null },
      { beat: 36, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theWardPeak",
    name: "HEAVY ROCK ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 3, col: 1, kind: "meteorMedium", color: null },
      { beat: 3, col: 9, kind: "meteorMedium", color: null },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 15, col: 4, color: "red" },
      { beat: 19, col: 6, kind: "weight", color: null },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 31, col: 10, kind: "echo", color: "red" },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 42, col: 9, kind: "meteorMedium", color: null },
      { beat: 45, col: 7, kind: "weight", color: null },
      { beat: 48, col: 3, color: "red" },
      { beat: 48, col: 6, color: "red" },
    ],
  },
  {
    id: "fillerHiveBreathe",
    name: "HEAVY ROCK LULLABY",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 8, col: 7, kind: "meteorMedium", color: null },
      { beat: 14, col: 8, color: "red" },
      { beat: 20, col: 7, kind: "meteor", color: null },
      { beat: 26, col: 1, color: "cyan" },
      { beat: 33, col: 3, kind: "meteorMedium", color: null },
      { beat: 39, col: 5, color: "red" },
    ],
  },
  {
    id: "fillerHiveRecall",
    name: "HEAVY ROCK LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 6, kind: "meteorMedium", color: null },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 5, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 28, col: 6, kind: "meteorMedium", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 0, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
  },
  {
    id: "fillerHiveBend",
    name: "HEAVY ROCK MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 4, kind: "meteorMedium", color: null },
      { beat: 6, col: 7, kind: "meteorMedium", color: null },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 17, col: 4, color: "red" },
      { beat: 22, col: 8, kind: "weight", color: null },
      { beat: 28, col: 2, color: "red" },
      { beat: 33, col: 6, kind: "meteorMedium", color: null },
      { beat: 39, col: 5, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 45, col: 9, kind: "weight", color: null },
    ],
  },
  {
    id: "theHive",
    name: "THE HIVE",
    guide: {
      scene: "theHive",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
];
