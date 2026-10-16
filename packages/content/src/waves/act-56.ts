import type { Wave } from "../wave-types.js";

/**
 * Waves 574 to 582 of the game, in the order they are played: THE RECOIL's
 * review and the boss THE LATCH.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_56: Wave[] = [
  {
    id: "reviewRecoilAgain",
    name: "FIRST RECOIL",
    entries: [
      { beat: 0, col: 10, kind: "recoil", color: "cyan" },
      { beat: 8, col: 4, kind: "lid", color: "red" },
      { beat: 14, col: 9, kind: "choir", color: "red" },
      { beat: 21, col: 0, kind: "recoil", color: "red" },
      { beat: 29, col: 6, kind: "lid", color: "red" },
    ],
  },
  {
    id: "reviewRecoilSpread",
    name: "RECOIL SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "recoil", color: "red" },
      { beat: 6, col: 2, kind: "lid", color: "cyan" },
      { beat: 12, col: 0, kind: "clasp", color: "cyan" },
      { beat: 19, col: 10, kind: "recoil", color: "red" },
      { beat: 26, col: 5, kind: "lid", color: "red" },
      { beat: 31, col: 1, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "reviewRecoilReach",
    name: "RECOIL WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "recoil", color: "red" },
      { beat: 6, col: 9, kind: "lid", color: "red" },
      { beat: 11, col: 3, kind: "morsel", color: "red" },
      { beat: 17, col: 10, kind: "recoil", color: "red" },
      { beat: 23, col: 0, kind: "lid", color: "red" },
      { beat: 29, col: 5, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "reviewRecoilPair",
    name: "RECOIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 3, kind: "recoil", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 0, kind: "lid", color: "cyan" },
      { beat: 22, col: 2, kind: "magnet", color: "red" },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 33, col: 3, kind: "recoil", color: "red" },
      { beat: 38, col: 7, kind: "lid", color: "cyan" },
    ],
  },
  {
    id: "reviewRecoilBreathe",
    name: "RECOIL LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 8, col: 4, kind: "recoil", color: "red" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 23, col: 10, kind: "lid", color: "cyan" },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 38, col: 10, kind: "dart", color: "red" },
    ],
  },
  {
    id: "reviewRecoilRecall",
    name: "ANCIENT RECOIL",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 8, kind: "recoil", color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 17, col: 9, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 22, col: 1, kind: "recoil", color: "cyan" },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 34, col: 10, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 39, col: 1, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "reviewRecoilBend",
    name: "RECOIL MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 3, kind: "recoil", color: "cyan" },
      { beat: 11, col: 1, kind: "lid", color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 22, col: 5, kind: "recoil", color: "red" },
      { beat: 27, col: 4, kind: "lid", color: "red" },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 38, col: 1, kind: "recoil", color: "red" },
      { beat: 43, col: 6, kind: "lid", color: "cyan" },
      { beat: 48, col: 1, color: "cyan" },
      { beat: 48, col: 9, color: "cyan" },
    ],
  },
  {
    id: "reviewRecoilPeak",
    name: "RECOIL THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 0, col: 9, color: "red" },
      { beat: 4, col: 10, kind: "recoil", color: "cyan" },
      { beat: 8, col: 3, kind: "lid", color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 12, col: 6, color: "red" },
      { beat: 16, col: 3, kind: "coil", color: null },
      { beat: 20, col: 1, kind: "recoil", color: "red" },
      { beat: 24, col: 4, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 28, col: 6, kind: "lid", color: "cyan" },
      { beat: 32, col: 9, kind: "coil", color: null },
      { beat: 35, col: 3, color: "red" },
      { beat: 35, col: 7, color: "red" },
      { beat: 38, col: 6, kind: "recoil", color: "cyan" },
      { beat: 42, col: 2, kind: "lid", color: "red" },
      { beat: 46, col: 0, color: "cyan" },
      { beat: 46, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theLatch",
    name: "THE LATCH",
    guide: {
      scene: "theLatch",
    },
    entries: [],
    boss: {
      kind: "latch",
      steps: [
        { ask: "haul", knots: 2, beats: 28 },
        { ask: "yank", knots: 2, beats: 32 },
        { ask: "cross", knots: 2, beats: 32 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
];
