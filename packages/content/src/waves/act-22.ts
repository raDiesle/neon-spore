import type { Wave } from "../wave-types.js";

/**
 * Waves 231 to 240 of the game, in the order they are played: THE CHOIR's block
 * and the boss THE CURTAIN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_22: Wave[] = [
  {
    id: "theChoir",
    name: "THE CHOIR",
    guide: {
      scene: "theChoir",
    },
    entries: [
      { beat: 0, col: 3, kind: "choir", color: "red" },
      { beat: 10, col: 0, kind: "choir", color: "cyan" },
      { beat: 22, col: 7, kind: "choir", color: "cyan" },
      { beat: 34, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirAgain",
    name: "FIRST CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "choir", color: "cyan" },
      { beat: 6, col: 1, kind: "choir", color: "red" },
      { beat: 14, col: 3, kind: "choir", color: "red" },
      { beat: 21, col: 6, kind: "choir", color: "cyan" },
      { beat: 28, col: 4, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirSpread",
    name: "CHOIR SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "choir", color: "red" },
      { beat: 7, col: 5, color: "red" },
      { beat: 14, col: 7, kind: "choir", color: "cyan" },
      { beat: 21, col: 10, color: "red" },
      { beat: 26, col: 4, kind: "choir", color: "cyan" },
      { beat: 31, col: 8, color: "red" },
    ],
  },
  {
    id: "theChoirReach",
    name: "CHOIR WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "choir", color: "red" },
      { beat: 5, col: 5, kind: "magnet", color: "red" },
      { beat: 11, col: 9, kind: "meteorMedium", color: null },
      { beat: 16, col: 5, kind: "choir", color: "red" },
      { beat: 22, col: 1, kind: "magnet", color: "red" },
      { beat: 27, col: 8, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theChoirPair",
    name: "CHOIR TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 5, kind: "choir", color: "cyan" },
      { beat: 10, col: 0, color: "red" },
      { beat: 16, col: 10, kind: "magnet", color: "red" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 32, col: 3, color: "red" },
      { beat: 38, col: 10, kind: "choir", color: "cyan" },
    ],
    pods: [{ beat: 26, col: 4, row: 3, kind: "pod" }],
  },
  {
    id: "theChoirBreathe",
    name: "CHOIR LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 4, kind: "choir", color: "cyan" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 22, col: 7, kind: "magnet", color: "cyan" },
      { beat: 29, col: 2, color: "cyan" },
      { beat: 35, col: 8, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "ANCIENT CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 0, kind: "choir", color: "cyan" },
      { beat: 10, col: 10, color: "red" },
      { beat: 15, col: 7, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 20, col: 2, color: "red" },
      { beat: 26, col: 7, kind: "choir", color: "cyan" },
      { beat: 32, col: 2, color: "cyan" },
      { beat: 38, col: 8, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "theChoirBend",
    name: "CHOIR MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 1, kind: "choir", color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 2, kind: "magnet", color: "red" },
      { beat: 22, col: 1, color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 28, col: 3, kind: "choir", color: "cyan" },
      { beat: 34, col: 7, kind: "magnet", color: "red" },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
      { beat: 44, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 3, col: 4, kind: "choir", color: "red" },
      { beat: 7, col: 3, color: "red" },
      { beat: 10, col: 4, kind: "magnet", color: "red" },
      { beat: 13, col: 3, color: "red" },
      { beat: 13, col: 7, color: "red" },
      { beat: 16, col: 8, kind: "throb", color: "red" },
      { beat: 20, col: 7, kind: "choir", color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 28, col: 6, kind: "magnet", color: "red" },
      { beat: 32, col: 7, kind: "throb", color: "red" },
      { beat: 36, col: 1, color: "red" },
      { beat: 36, col: 9, color: "red" },
      { beat: 40, col: 4, kind: "choir", color: "red" },
      { beat: 44, col: 5, kind: "magnet", color: "cyan" },
      { beat: 47, col: 2, color: "cyan" },
    ],
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    guide: {
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
];
