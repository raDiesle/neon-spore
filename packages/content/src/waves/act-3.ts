import type { Wave } from "../wave-types.js";

/**
 * Waves 32 to 42 of the game, in the order they are played: THE LANCE's block
 * and the boss BULB QUEEN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_3: Wave[] = [
  {
    id: "theLance",
    name: "THE LANCE",
    guide: {
      scene: "theLance",
    },
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 1, col: 3, color: "cyan" },
      { beat: 2, col: 3, color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 12, col: 8, color: "red" },
    ],
  },
  {
    id: "thePurge",
    name: "THE PURGE",
    guide: {
      scene: "thePurge",
    },
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 10, color: "red" },
      { beat: 3, col: 7, color: "cyan" },
    ],
    pods: [{ beat: 0, col: 5, row: 2, kind: "purge" }],
  },
  {
    id: "theLanceAgain",
    name: "LANCE AGAIN",
    variant: true,
    entries: [
      { beat: 7, col: 5, kind: "meteor", color: null },
      { beat: 14, col: 6, kind: "meteor", color: null },
      { beat: 30, col: 5, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 0, col: 4, row: 3, kind: "ward" },
      { beat: 22, col: 4, row: 3, kind: "ward" },
    ],
  },
  {
    id: "theLanceSpread",
    name: "LANCE WIDE",
    variant: true,
    entries: [
      { beat: 7, col: 5, color: "red" },
      { beat: 14, col: 4, color: "red" },
      { beat: 25, col: 6, color: "red" },
      { beat: 32, col: 5, color: "red" },
    ],
    pods: [
      { beat: 0, col: 4, row: 4, kind: "ward" },
      { beat: 19, col: 3, row: 4, kind: "ward" },
    ],
  },
  {
    id: "theLanceReach",
    name: "LANCE AT THE EDGE",
    variant: true,
    entries: [
      { beat: 6, col: 5, kind: "meteor", color: null },
      { beat: 11, col: 9, kind: "meteor", color: null },
      { beat: 22, col: 10, kind: "meteor", color: null },
      { beat: 27, col: 5, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 0, col: 10, row: 4, kind: "ward" },
      { beat: 16, col: 3, row: 3, kind: "ward" },
    ],
  },
  {
    id: "theLancePair",
    name: "LANCE IN PAIRS",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 10, col: 10, color: "red" },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 32, col: 4, color: "red" },
    ],
    pods: [
      { beat: 4, col: 4, row: 4, kind: "ward" },
      { beat: 15, col: 2, row: 3, kind: "purge" },
      { beat: 26, col: 10, row: 3, kind: "ward" },
    ],
  },
  {
    id: "theLanceBreathe",
    name: "LANCE AT EASE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 12, col: 4, color: "red" },
      { beat: 27, col: 8, color: "red" },
      { beat: 39, col: 6, color: "red" },
    ],
    pods: [
      { beat: 6, col: 7, row: 4, kind: "ward" },
      { beat: 20, col: 2, row: 4, kind: "ward" },
      { beat: 33, col: 7, row: 3, kind: "ward" },
    ],
  },
  {
    id: "theLanceRecall",
    name: "LANCE RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 33, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 0, row: 4, kind: "ward" },
      { beat: 16, col: 2, row: 3, kind: "ward" },
      { beat: 28, col: 5, row: 4, kind: "ward" },
    ],
  },
  {
    id: "theLanceBend",
    name: "LANCE TWICE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 12, col: 6, color: "red" },
      { beat: 24, col: 2, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
    pods: [
      { beat: 6, col: 10, row: 4, kind: "ward" },
      { beat: 18, col: 7, row: 3, kind: "purge" },
      { beat: 29, col: 5, row: 3, kind: "ward" },
      { beat: 34, col: 10, row: 3, kind: "purge" },
    ],
  },
  {
    id: "theLancePeak",
    name: "LANCE PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 4, col: 1, row: 4, kind: "ward" },
      { beat: 12, col: 10, row: 3, kind: "purge" },
      { beat: 20, col: 7, row: 3, kind: "ward" },
      { beat: 24, col: 0, row: 3, kind: "purge" },
      { beat: 32, col: 3, row: 4, kind: "ward" },
      { beat: 36, col: 2, row: 3, kind: "purge" },
    ],
  },
  {
    id: "bulbQueen",
    name: "BULB QUEEN",
    guide: {
      scene: "bulbQueen",
    },
    entries: [],
    pods: [{ beat: 2, col: 5, row: 4, kind: "purge" }],
    boss: { kind: "queen", col: 5, petals: 9 },
    bossType: "normal",
    controls: "standard5",
  },
];
