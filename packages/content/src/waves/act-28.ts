import type { Wave } from "../wave-types.js";

/**
 * Waves 296 to 305 of the game, in the order they are played: THE COIL's block
 * and the boss THE SCUTTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_28: Wave[] = [
  {
    id: "theCoil",
    name: "THE COIL",
    guide: {
      scene: "theCoil",
    },
    entries: [
      { beat: 7, col: 8, kind: "coil", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 14, col: 3, kind: "meteor", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 46, col: 10, kind: "coil", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "theCoilAgain",
    name: "FIRST COIL",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "coil", color: null },
      { beat: 7, col: 0, kind: "coil", color: null },
      { beat: 13, col: 7, kind: "coil", color: null },
      { beat: 19, col: 2, kind: "coil", color: null },
      { beat: 25, col: 4, kind: "coil", color: null },
      { beat: 31, col: 1, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilSpread",
    name: "COIL SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "coil", color: null },
      { beat: 7, col: 2, kind: "moult", color: null },
      { beat: 12, col: 1, kind: "coil", color: null },
      { beat: 18, col: 5, kind: "moult", color: null },
      { beat: 25, col: 8, kind: "coil", color: null },
      { beat: 30, col: 9, kind: "moult", color: null },
    ],
  },
  {
    id: "theCoilReach",
    name: "COIL WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "coil", color: null },
      { beat: 6, col: 4, kind: "moult", color: null },
      { beat: 11, col: 10, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 16, col: 6, kind: "coil", color: null },
      { beat: 21, col: 10, kind: "moult", color: null },
      { beat: 27, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theCoilPair",
    name: "COIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 6, kind: "coil", color: null },
      { beat: 9, col: 10, color: "cyan" },
      { beat: 14, col: 0, kind: "moult", color: null },
      { beat: 19, col: 4, color: "cyan" },
      { beat: 23, col: 10, kind: "torch", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 33, col: 4, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilBreathe",
    name: "COIL LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 1, kind: "coil", color: null },
      { beat: 13, col: 7, color: "red" },
      { beat: 21, col: 5, kind: "moult", color: null },
      { beat: 29, col: 10, color: "red" },
      { beat: 37, col: 7, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theCoilRecall",
    name: "ANCIENT COIL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 2, kind: "coil", color: null },
      { beat: 11, col: 1, color: "red" },
      { beat: 16, col: 4, kind: "weight", color: null },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 5, kind: "coil", color: null },
      { beat: 33, col: 6, color: "red" },
      { beat: 38, col: 7, kind: "weight", color: null },
    ],
  },
  {
    id: "theCoilBend",
    name: "COIL MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 7, kind: "coil", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 2, kind: "moult", color: null },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 6, color: "red" },
      { beat: 29, col: 5, kind: "coil", color: null },
      { beat: 34, col: 4, kind: "moult", color: null },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 8, kind: "coil", color: null },
    ],
  },
  {
    id: "theTwitch",
    name: "COIL INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 26, col: 10, kind: "coil", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 48, col: 10, kind: "coil", color: null },
      { beat: 50, col: 10, kind: "coil", color: null },
      { beat: 52, col: 10, kind: "coil", color: null },
      { beat: 54, col: 10, kind: "coil", color: null },
      { beat: 62, col: 0, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "theScuttle",
    name: "THE SCUTTLE",
    guide: {
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
];
