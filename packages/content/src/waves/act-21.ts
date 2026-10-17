import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 275 to 284 of the game, in the order they are played: THE MAGNET's
 * block, the filler before THE GORGE and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_21: Wave[] = [
  {
    id: "theMagnet",
    name: "THE MAGNET",
    guide: {
      scene: "theMagnet",
    },
    entries: [
      { beat: 0, col: 5, kind: "magnet", color: "red" },
      { beat: 14, col: 2, kind: "magnet", color: "cyan" },
      { beat: 28, col: 7, kind: "magnet", color: "red" },
      { beat: 44, col: 0, kind: "magnet", color: "cyan" },
      { beat: 52, col: 10, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetAgain",
    name: "MAGNET RISING",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "magnet", color: "red" },
      { beat: 7, col: 8, kind: "magnet", color: "cyan" },
      { beat: 13, col: 1, kind: "magnet", color: "red" },
      { beat: 21, col: 9, kind: "magnet", color: "red" },
      { beat: 28, col: 1, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetReach",
    name: "LONG MAGNET ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "magnet", color: "red" },
      { beat: 6, col: 8, kind: "fence", color: null },
      { beat: 19, col: 8, kind: "magnet", color: "red" },
      { beat: 24, col: 4, kind: "fence", color: null },
    ],
    pods: [{ beat: 11, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theMagnetPair",
    name: "MAGNET DUET",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 9, kind: "magnet", color: "red" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 16, col: 10, kind: "fence", color: null },
      { beat: 24, col: 2, color: "red" },
      { beat: 30, col: 9, kind: "torch", color: null },
      { beat: 36, col: 6, color: "red" },
      { beat: 40, col: 3, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theMagnetRecall",
    name: "MAGNET LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 0, kind: "magnet", color: "cyan" },
      { beat: 14, col: 10, color: "red" },
      { beat: 21, col: 0, kind: "meteor", color: null },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 34, col: 8, kind: "magnet", color: "red" },
      { beat: 40, col: 7, color: "red" },
    ],
  },
  {
    id: "theMagnetPeak",
    name: "MAGNET OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 3, kind: "magnet", color: "red" },
      { beat: 8, col: 9, color: "red" },
      { beat: 16, col: 8, kind: "fence", color: null },
      { beat: 20, col: 4, color: "cyan" },
      { beat: 20, col: 7, color: "cyan" },
      { beat: 24, col: 1, kind: "veer", color: null },
      { beat: 28, col: 5, kind: "magnet", color: "red" },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 39, col: 2, kind: "fence", color: null },
      { beat: 44, col: 7, kind: "veer", color: null },
      { beat: 47, col: 5, color: "cyan" },
      { beat: 47, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeBreathe",
    name: "MAGNET DREAM",
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 2, kind: "magnet", color: "cyan" },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 20, col: 4, kind: "fence", color: null },
      { beat: 26, col: 9, color: "red" },
      { beat: 38, col: 1, color: "cyan" },
    ],
    pods: [{ beat: 32, col: 8, row: 3, kind: "pod" }],
  },
  {
    id: "fillerGorgeRecall",
    name: "MAGNET REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 4, kind: "magnet", color: "cyan" },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 1, kind: "rind", color: "cyan" },
      { beat: 24, col: 8, color: "red" },
      { beat: 29, col: 6, kind: "magnet", color: "red" },
      { beat: 34, col: 0, color: "red" },
      { beat: 39, col: 3, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeBend",
    name: "MAGNET MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 3, kind: "magnet", color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 10, kind: "fence", color: null },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 28, col: 3, kind: "magnet", color: "red" },
      { beat: 33, col: 7, kind: "fence", color: null },
      { beat: 39, col: 5, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 44, col: 7, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    guide: {
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 28, col: 8, kind: "meteor", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 10, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 60, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, kind: "meteor", color: null },
      { beat: 82, col: 2, color: "cyan" },
    ],
    boss: { kind: "gorge", levels: GORGE_LEVELS },
    bossType: "normal",
  },
];
