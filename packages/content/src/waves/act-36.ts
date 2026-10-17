import type { Wave } from "../wave-types.js";

/**
 * Waves 405 to 414 of the game, in the order they are played: THE RECOIL's
 * block, the filler before THE HASP and the boss THE HASP.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_36: Wave[] = [
  {
    id: "theRecoil",
    name: "THE RECOIL",
    guide: {
      scene: "theRecoil",
    },
    entries: [
      { beat: 0, col: 5, kind: "recoil", color: "red" },
      { beat: 14, col: 2, kind: "recoil", color: "cyan" },
      { beat: 24, col: 0, kind: "recoil", color: "red" },
      { beat: 28, col: 10, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theRecoilAgain",
    name: "RECOIL AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "recoil", color: "cyan" },
      { beat: 7, col: 6, kind: "lid", color: "cyan" },
      { beat: 14, col: 1, kind: "recoil", color: "red" },
      { beat: 21, col: 5, kind: "lid", color: "cyan" },
      { beat: 28, col: 8, kind: "recoil", color: "red" },
    ],
  },
  {
    id: "theRecoilReach",
    name: "RECOIL HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "recoil", color: "red" },
      { beat: 7, col: 0, kind: "lid", color: "cyan" },
      { beat: 14, col: 9, kind: "meteorMedium", color: null },
      { beat: 19, col: 5, kind: "recoil", color: "red" },
      { beat: 25, col: 9, kind: "lid", color: "red" },
      { beat: 31, col: 5, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theRecoilPair",
    name: "RECOIL DUET",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 8, kind: "recoil", color: "red" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 16, col: 3, kind: "lid", color: "red" },
      { beat: 20, col: 1, color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 24, col: 4, kind: "meteor", color: null },
      { beat: 28, col: 8, kind: "recoil", color: "red" },
      { beat: 33, col: 1, color: "red" },
      { beat: 33, col: 9, color: "red" },
      { beat: 39, col: 2, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theRecoilRecall",
    name: "RECOIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 4, kind: "recoil", color: "red" },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 16, col: 9, kind: "magnet", color: "red" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 29, col: 0, kind: "recoil", color: "cyan" },
      { beat: 35, col: 5, kind: "magnet", color: "red" },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
    ],
  },
  {
    id: "theRecoilPeak",
    name: "RECOIL FURY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 3, col: 1, kind: "recoil", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 14, col: 2, kind: "lid", color: "red" },
      { beat: 18, col: 6, kind: "torch", color: null },
      { beat: 22, col: 1, color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 27, col: 4, kind: "recoil", color: "cyan" },
      { beat: 32, col: 9, kind: "lid", color: "red" },
      { beat: 37, col: 4, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 41, col: 8, kind: "torch", color: null },
      { beat: 44, col: 7, kind: "recoil", color: "cyan" },
      { beat: 48, col: 4, color: "cyan" },
      { beat: 48, col: 7, color: "cyan" },
    ],
  },
  {
    id: "fillerHaspBreathe",
    name: "RECOIL SIESTA",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 8, col: 7, kind: "recoil", color: "cyan" },
      { beat: 14, col: 10, color: "red" },
      { beat: 21, col: 0, kind: "lid", color: "cyan" },
      { beat: 27, col: 4, color: "red" },
      { beat: 35, col: 5, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "fillerHaspRecall",
    name: "RECOIL RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 10, kind: "recoil", color: "cyan" },
      { beat: 12, col: 6, color: "red" },
      { beat: 18, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 23, col: 0, color: "red" },
      { beat: 23, col: 10, color: "red" },
      { beat: 28, col: 9, kind: "recoil", color: "red" },
      { beat: 34, col: 1, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 39, col: 0, color: "red" },
      { beat: 39, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerHaspBend",
    name: "RECOIL ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 8, kind: "recoil", color: "cyan" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 0, kind: "lid", color: "red" },
      { beat: 23, col: 10, kind: "recoil", color: "cyan" },
      { beat: 31, col: 4, color: "cyan" },
      { beat: 31, col: 7, color: "cyan" },
      { beat: 36, col: 7, kind: "lid", color: "red" },
      { beat: 42, col: 9, kind: "recoil", color: "red" },
      { beat: 47, col: 5, color: "cyan" },
      { beat: 47, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theHasp",
    name: "THE HASP",
    guide: {
      scene: "theHasp",
    },
    entries: [],
    boss: { kind: "hasp" },
    bossType: "normal",
  },
];
