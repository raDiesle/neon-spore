import type { Wave } from "../wave-types.js";

/**
 * Waves 397 to 406 of the game, in the order they are played: THE RECOIL's
 * block and the boss THE HASP.
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
      { beat: 0, col: 0, kind: "recoil", color: "red" },
      { beat: 6, col: 7, kind: "lid", color: "cyan" },
      { beat: 14, col: 5, kind: "recoil", color: "red" },
      { beat: 22, col: 6, kind: "lid", color: "red" },
      { beat: 29, col: 10, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theRecoilSpread",
    name: "RECOIL RAIN",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "recoil", color: "cyan" },
      { beat: 5, col: 9, kind: "lid", color: "cyan" },
      { beat: 11, col: 6, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 0, kind: "recoil", color: "cyan" },
      { beat: 23, col: 3, kind: "lid", color: "red" },
      { beat: 28, col: 2, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theRecoilReach",
    name: "RECOIL HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "recoil", color: "red" },
      { beat: 6, col: 3, kind: "lid", color: "red" },
      { beat: 11, col: 9, kind: "dart", color: "cyan" },
      { beat: 16, col: 2, kind: "recoil", color: "red" },
      { beat: 22, col: 6, kind: "lid", color: "red" },
      { beat: 27, col: 0, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "theRecoilPair",
    name: "RECOIL DUET",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 0, kind: "recoil", color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 7, kind: "lid", color: "cyan" },
      { beat: 20, col: 1, color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 26, col: 7, kind: "recoil", color: "cyan" },
      { beat: 31, col: 6, kind: "lid", color: "red" },
      { beat: 35, col: 1, color: "red" },
      { beat: 35, col: 9, color: "red" },
      { beat: 40, col: 3, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theRecoilBreathe",
    name: "RECOIL HUSH",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 7, kind: "recoil", color: "red" },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 19, col: 10, kind: "lid", color: "red" },
      { beat: 25, col: 5, color: "cyan" },
      { beat: 40, col: 0, color: "red" },
    ],
    pods: [{ beat: 32, col: 4, row: 4, kind: "husk" }],
  },
  {
    id: "theRecoilRecall",
    name: "RECOIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 9, kind: "recoil", color: "red" },
      { beat: 11, col: 2, color: "red" },
      { beat: 17, col: 9, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 29, col: 7, kind: "recoil", color: "red" },
      { beat: 35, col: 8, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theRecoilBend",
    name: "RECOIL PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 9, kind: "recoil", color: "red" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 0, kind: "lid", color: "cyan" },
      { beat: 22, col: 4, kind: "recoil", color: "cyan" },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 33, col: 0, kind: "lid", color: "cyan" },
      { beat: 39, col: 7, kind: "recoil", color: "cyan" },
      { beat: 44, col: 1, color: "cyan" },
      { beat: 44, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theRecoilPeak",
    name: "RECOIL FURY",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 9, kind: "recoil", color: "cyan" },
      { beat: 8, col: 2, color: "red" },
      { beat: 8, col: 8, color: "red" },
      { beat: 12, col: 0, kind: "lid", color: "cyan" },
      { beat: 16, col: 1, kind: "veer", color: null },
      { beat: 20, col: 3, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 24, col: 7, kind: "recoil", color: "red" },
      { beat: 28, col: 2, kind: "lid", color: "red" },
      { beat: 32, col: 3, color: "cyan" },
      { beat: 32, col: 6, color: "cyan" },
      { beat: 35, col: 5, kind: "veer", color: null },
      { beat: 39, col: 4, kind: "recoil", color: "red" },
      { beat: 43, col: 0, color: "cyan" },
      { beat: 43, col: 10, color: "cyan" },
      { beat: 47, col: 3, kind: "lid", color: "cyan" },
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
