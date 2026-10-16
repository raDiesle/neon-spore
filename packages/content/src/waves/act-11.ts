import type { Wave } from "../wave-types.js";

/**
 * Waves 119 to 128 of the game, in the order they are played: THE THROB's block
 * and the boss THE VANE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_11: Wave[] = [
  {
    id: "theThrob",
    name: "THE THROB",
    guide: {
      scene: "theThrob",
    },
    entries: [{ beat: 0, col: 5, kind: "throb", color: "red" }],
  },
  {
    id: "theThrobAgain",
    name: "FIRST THROB",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "throb", color: "red" },
      { beat: 8, col: 4, kind: "throb", color: "red" },
      { beat: 15, col: 7, kind: "throb", color: "red" },
      { beat: 22, col: 5, kind: "throb", color: "red" },
      { beat: 28, col: 3, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobSpread",
    name: "THROB SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "throb", color: "red" },
      { beat: 6, col: 7, kind: "throb", color: "red" },
      { beat: 11, col: 9, kind: "throb", color: "red" },
      { beat: 18, col: 6, kind: "throb", color: "red" },
      { beat: 25, col: 9, kind: "throb", color: "red" },
      { beat: 32, col: 6, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobReach",
    name: "THROB WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "throb", color: "red" },
      { beat: 6, col: 5, kind: "meteor", color: null },
      { beat: 11, col: 9, kind: "throb", color: "red" },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 22, col: 9, kind: "throb", color: "red" },
      { beat: 28, col: 5, kind: "meteor", color: null },
    ],
  },
  {
    id: "theThrobPair",
    name: "THROB TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 4, kind: "throb", color: "red" },
      { beat: 12, col: 0, color: "red" },
      { beat: 16, col: 1, kind: "meteorMedium", color: null },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 26, col: 1, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 30, col: 0, color: "red" },
      { beat: 35, col: 10, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobBreathe",
    name: "THROB LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 7, col: 2, kind: "throb", color: "red" },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 21, col: 8, kind: "meteor", color: null },
      { beat: 29, col: 4, color: "red" },
      { beat: 37, col: 5, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobRecall",
    name: "ANCIENT THROB",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 1, kind: "throb", color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 18, col: 2, kind: "throb", color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 29, col: 6, kind: "throb", color: "red" },
      { beat: 35, col: 2, color: "red" },
    ],
  },
  {
    id: "theThrobBend",
    name: "THROB MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 5, kind: "throb", color: "red" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 16, col: 5, kind: "meteorMedium", color: null },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 2, kind: "throb", color: "red" },
      { beat: 31, col: 0, kind: "meteorMedium", color: null },
      { beat: 36, col: 3, color: "cyan" },
      { beat: 36, col: 7, color: "cyan" },
      { beat: 41, col: 5, kind: "throb", color: "red" },
      { beat: 47, col: 1, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theThrobPeak",
    name: "THROB THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 0, kind: "throb", color: "red" },
      { beat: 8, col: 4, color: "cyan" },
      { beat: 12, col: 3, kind: "meteorMedium", color: null },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 20, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 24, col: 3, kind: "throb", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 32, col: 9, kind: "meteorMedium", color: null },
      { beat: 36, col: 3, kind: "beatbox", color: null, beats: 3 },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 44, col: 4, kind: "throb", color: "red" },
      { beat: 48, col: 10, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theVane",
    name: "THE VANE",
    entries: [
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 3, col: 8, color: "red" },
    ],
    boss: { kind: "vane" },
    bossType: "normal",
    controls: "standard5",
  },
];
