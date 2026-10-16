import type { Wave } from "../wave-types.js";

/**
 * Waves 493 to 501 of the game, in the order they are played: THE VEIL's review
 * and the boss THE TRAPEZE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_49: Wave[] = [
  {
    id: "reviewVeilAgain",
    name: "VEILS RETURN",
    entries: [
      { beat: 0, col: 0, kind: "veil", color: null },
      { beat: 8, col: 7, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 14, col: 0, kind: "countdown", color: "cyan" },
      { beat: 21, col: 4, kind: "veil", color: null },
      { beat: 29, col: 2, kind: "mine", color: "cyan", row: 6, sees: 2 },
    ],
  },
  {
    id: "reviewVeilSpread",
    name: "VEILS WIDER",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "veil", color: null },
      { beat: 6, col: 10, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 11, col: 1, kind: "choir", color: "cyan" },
      { beat: 18, col: 3, kind: "veil", color: null },
      { beat: 23, col: 0, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 28, col: 3, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "reviewVeilReach",
    name: "VEILS OUT WIDE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veil", color: null },
      { beat: 5, col: 9, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 10, col: 5, kind: "echo", color: "cyan" },
      { beat: 15, col: 10, kind: "veil", color: null },
      { beat: 20, col: 1, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 26, col: 9, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewVeilPair",
    name: "VEILS IN PAIRS",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 5, kind: "veil", color: null },
      { beat: 12, col: 1, color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 2, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 23, col: 6, kind: "choir", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 3, kind: "veil", color: null },
      { beat: 37, col: 5, kind: "mine", color: "cyan", row: 11, sees: 1 },
    ],
  },
  {
    id: "reviewVeilBreathe",
    name: "VEILS AT REST",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 3, kind: "veil", color: null },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 20, col: 0, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 28, col: 10, color: "red" },
      { beat: 35, col: 0, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "reviewVeilRecall",
    name: "VEILS RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 8, kind: "veil", color: null },
      { beat: 10, col: 1, color: "red" },
      { beat: 10, col: 9, color: "red" },
      { beat: 16, col: 8, kind: "coil", color: null },
      { beat: 21, col: 7, kind: "veil", color: null },
      { beat: 26, col: 2, color: "cyan" },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 31, col: 6, kind: "coil", color: null },
      { beat: 36, col: 1, kind: "veil", color: null },
    ],
  },
  {
    id: "reviewVeilBend",
    name: "VEILS DOUBLED",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 9, kind: "veil", color: null },
      { beat: 12, col: 7, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 17, col: 0, color: "cyan" },
      { beat: 17, col: 10, color: "cyan" },
      { beat: 22, col: 3, kind: "veil", color: null },
      { beat: 27, col: 5, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 32, col: 1, color: "red" },
      { beat: 32, col: 9, color: "red" },
      { beat: 37, col: 6, kind: "veil", color: null },
      { beat: 42, col: 8, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 47, col: 0, color: "cyan" },
      { beat: 47, col: 10, color: "cyan" },
    ],
  },
  {
    id: "reviewVeilPeak",
    name: "VEILS SUMMIT",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 10, color: "cyan" },
      { beat: 4, col: 9, kind: "veil", color: null },
      { beat: 8, col: 10, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 16, col: 8, kind: "fence", color: null },
      { beat: 20, col: 0, kind: "veil", color: null },
      { beat: 24, col: 2, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 28, col: 7, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 31, col: 5, kind: "fence", color: null },
      { beat: 34, col: 3, color: "red" },
      { beat: 34, col: 6, color: "red" },
      { beat: 38, col: 1, kind: "veil", color: null },
      { beat: 42, col: 3, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 46, col: 3, color: "red" },
      { beat: 46, col: 6, color: "red" },
    ],
  },
  {
    id: "theTrapeze",
    name: "THE TRAPEZE",
    guide: {
      scene: "theTrapeze",
    },
    entries: [],
    boss: {
      kind: "trapeze",
      steps: [
        { ask: "push", gongSide: 1, gongMilli: 10000, beats: 32 },
        { ask: "call", gongSide: -1, gongMilli: 14000, beats: 40 },
        { ask: "shoot", gongSide: 1, gongMilli: 16000, beats: 48 },
        { ask: "lock", gongSide: -1, gongMilli: 18000, beats: 48 },
      ],
    },
    bossType: "normal",
  },
];
