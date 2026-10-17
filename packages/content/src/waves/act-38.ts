import type { Wave } from "../wave-types.js";

/**
 * Waves 405 to 414 of the game, in the order they are played: THE RECOIL's
 * block, the filler before THE HASP and the boss THE HASP.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_38: Wave[] = [
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
      { beat: 0, col: 4, kind: "recoil", color: "red" },
      { beat: 8, col: 2, kind: "lid", color: "red" },
      { beat: 16, col: 5, kind: "recoil", color: "red" },
      { beat: 24, col: 0, kind: "lid", color: "cyan" },
      { beat: 30, col: 4, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theRecoilReach",
    name: "RECOIL HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "recoil", color: "cyan" },
      { beat: 6, col: 5, kind: "lid", color: "red" },
      { beat: 11, col: 1, kind: "echo", color: "cyan" },
      { beat: 17, col: 8, kind: "recoil", color: "cyan" },
      { beat: 23, col: 0, kind: "lid", color: "cyan" },
      { beat: 29, col: 5, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theRecoilPair",
    name: "RECOIL DUET",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 9, kind: "recoil", color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 14, col: 10, kind: "lid", color: "red" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 18, col: 10, color: "cyan" },
      { beat: 23, col: 2, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 29, col: 4, kind: "recoil", color: "red" },
      { beat: 34, col: 2, color: "red" },
      { beat: 34, col: 8, color: "red" },
      { beat: 38, col: 1, kind: "lid", color: "cyan" },
    ],
  },
  {
    id: "theRecoilRecall",
    name: "RECOIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 0, kind: "recoil", color: "cyan" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 17, col: 7, kind: "echo", color: "red" },
      { beat: 22, col: 0, color: "red" },
      { beat: 22, col: 10, color: "red" },
      { beat: 27, col: 0, kind: "recoil", color: "red" },
      { beat: 32, col: 2, kind: "echo", color: "red" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theRecoilPeak",
    name: "RECOIL FURY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 10, kind: "recoil", color: "cyan" },
      { beat: 7, col: 5, color: "red" },
      { beat: 7, col: 8, color: "red" },
      { beat: 10, col: 8, kind: "lid", color: "red" },
      { beat: 13, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 16, col: 0, color: "red" },
      { beat: 16, col: 10, color: "red" },
      { beat: 20, col: 7, kind: "recoil", color: "red" },
      { beat: 23, col: 5, kind: "lid", color: "red" },
      { beat: 26, col: 2, color: "red" },
      { beat: 26, col: 8, color: "red" },
      { beat: 29, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 33, col: 0, kind: "recoil", color: "red" },
      { beat: 37, col: 2, color: "cyan" },
      { beat: 37, col: 8, color: "cyan" },
      { beat: 41, col: 1, kind: "lid", color: "cyan" },
      { beat: 45, col: 6, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "fillerHaspBreathe",
    name: "RECOIL SIESTA",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 9, kind: "recoil", color: "red" },
      { beat: 14, col: 5, color: "red" },
      { beat: 22, col: 7, kind: "lid", color: "red" },
      { beat: 30, col: 0, color: "cyan" },
      { beat: 37, col: 8, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "fillerHaspRecall",
    name: "RECOIL RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 1, kind: "recoil", color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 1, kind: "fence", color: null },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 28, col: 7, kind: "recoil", color: "cyan" },
      { beat: 34, col: 4, kind: "fence", color: null },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerHaspBend",
    name: "RECOIL ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 3, kind: "recoil", color: "red" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 6, kind: "lid", color: "red" },
      { beat: 22, col: 8, kind: "recoil", color: "cyan" },
      { beat: 27, col: 1, color: "red" },
      { beat: 27, col: 9, color: "red" },
      { beat: 32, col: 9, kind: "lid", color: "cyan" },
      { beat: 37, col: 4, kind: "recoil", color: "red" },
      { beat: 43, col: 0, color: "red" },
      { beat: 43, col: 10, color: "red" },
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
