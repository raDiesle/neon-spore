import type { Wave } from "../wave-types.js";

/**
 * Waves 261 to 270 of the game, in the order they are played: THE CHOIR's block
 * and the boss THE SINEW.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_24: Wave[] = [
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
      { beat: 0, col: 0, kind: "choir", color: "red" },
      { beat: 6, col: 10, kind: "choir", color: "red" },
      { beat: 14, col: 7, kind: "choir", color: "cyan" },
      { beat: 20, col: 10, kind: "choir", color: "red" },
      { beat: 26, col: 9, kind: "choir", color: "cyan" },
      { beat: 32, col: 10, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theChoirSpread",
    name: "CHOIR SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "choir", color: "cyan" },
      { beat: 5, col: 3, kind: "magnet", color: "cyan" },
      { beat: 12, col: 5, kind: "choir", color: "cyan" },
      { beat: 19, col: 10, kind: "magnet", color: "red" },
      { beat: 24, col: 9, kind: "choir", color: "cyan" },
      { beat: 30, col: 8, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theChoirReach",
    name: "CHOIR WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "choir", color: "red" },
      { beat: 5, col: 9, kind: "magnet", color: "red" },
      { beat: 11, col: 5, kind: "meteorMedium", color: null },
      { beat: 16, col: 0, kind: "choir", color: "red" },
      { beat: 22, col: 5, kind: "magnet", color: "red" },
      { beat: 27, col: 1, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theChoirPair",
    name: "CHOIR TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 3, kind: "choir", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 15, col: 10, kind: "magnet", color: "red" },
      { beat: 20, col: 0, color: "red" },
      { beat: 25, col: 6, kind: "throb", color: "red" },
      { beat: 29, col: 9, color: "cyan" },
      { beat: 33, col: 6, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirBreathe",
    name: "CHOIR LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 10, kind: "choir", color: "red" },
      { beat: 13, col: 4, color: "cyan" },
      { beat: 19, col: 2, kind: "magnet", color: "red" },
      { beat: 26, col: 1, color: "red" },
      { beat: 33, col: 0, kind: "shell", color: "red" },
      { beat: 40, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "ANCIENT CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 8, kind: "choir", color: "red" },
      { beat: 11, col: 9, color: "red" },
      { beat: 16, col: 1, kind: "veer", color: null },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 27, col: 10, kind: "choir", color: "red" },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 38, col: 3, kind: "veer", color: null },
    ],
  },
  {
    id: "theChoirBend",
    name: "CHOIR MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 9, kind: "choir", color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 18, col: 1, kind: "magnet", color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 29, col: 0, kind: "choir", color: "cyan" },
      { beat: 35, col: 8, kind: "magnet", color: "red" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 46, col: 9, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 3, col: 7, kind: "choir", color: "cyan" },
      { beat: 6, col: 5, color: "red" },
      { beat: 9, col: 0, kind: "magnet", color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 0, kind: "choir", color: "red" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 26, col: 3, kind: "magnet", color: "cyan" },
      { beat: 34, col: 1, color: "red" },
      { beat: 34, col: 9, color: "red" },
      { beat: 38, col: 10, kind: "choir", color: "cyan" },
      { beat: 42, col: 3, kind: "magnet", color: "red" },
      { beat: 45, col: 0, color: "red" },
    ],
    pods: [
      { beat: 15, col: 2, row: 4, kind: "husk" },
      { beat: 30, col: 2, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    guide: {
      scene: "theSinew",
    },
    entries: [],
    boss: { kind: "sinew" },
    bossType: "normal",
  },
];
