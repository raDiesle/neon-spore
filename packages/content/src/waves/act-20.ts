import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 210 to 219 of the game, in the order they are played: THE MAGNET's
 * block and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_20: Wave[] = [
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
      { beat: 46, col: 10, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetAgain",
    name: "MAGNET RISING",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "magnet", color: "cyan" },
      { beat: 8, col: 3, kind: "magnet", color: "red" },
      { beat: 15, col: 9, kind: "magnet", color: "red" },
      { beat: 23, col: 1, kind: "magnet", color: "red" },
      { beat: 31, col: 7, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theMagnetSpread",
    name: "MAGNET CONFETTI",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "magnet", color: "red" },
      { beat: 5, col: 6, kind: "meteor", color: null },
      { beat: 11, col: 1, kind: "magnet", color: "red" },
      { beat: 17, col: 5, kind: "meteor", color: null },
      { beat: 22, col: 1, kind: "magnet", color: "red" },
      { beat: 28, col: 3, kind: "meteor", color: null },
    ],
  },
  {
    id: "theMagnetReach",
    name: "LONG MAGNET ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "magnet", color: "red" },
      { beat: 6, col: 6, kind: "fence", color: null },
      { beat: 12, col: 0, kind: "meteor", color: null },
      { beat: 18, col: 4, kind: "magnet", color: "cyan" },
      { beat: 23, col: 0, kind: "fence", color: null },
      { beat: 29, col: 9, kind: "meteor", color: null },
    ],
  },
  {
    id: "theMagnetPair",
    name: "MAGNET PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 7, kind: "magnet", color: "cyan" },
      { beat: 11, col: 5, color: "red" },
      { beat: 17, col: 6, kind: "fence", color: null },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 29, col: 0, kind: "magnet", color: "cyan" },
      { beat: 34, col: 10, color: "cyan" },
      { beat: 38, col: 7, kind: "fence", color: null },
    ],
  },
  {
    id: "theMagnetBreathe",
    name: "LAZY MAGNET",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 0, kind: "magnet", color: "red" },
      { beat: 15, col: 4, color: "cyan" },
      { beat: 23, col: 2, kind: "fence", color: null },
      { beat: 29, col: 7, color: "cyan" },
      { beat: 36, col: 6, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetRecall",
    name: "MAGNET REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 4, kind: "magnet", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 28, col: 10, kind: "magnet", color: "red" },
      { beat: 34, col: 4, color: "cyan" },
    ],
    pods: [{ beat: 17, col: 9, row: 3, kind: "pod" }],
  },
  {
    id: "theMagnetBend",
    name: "MAGNET RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 4, kind: "magnet", color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 17, col: 2, kind: "fence", color: null },
      { beat: 22, col: 5, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 3, kind: "magnet", color: "red" },
      { beat: 33, col: 4, kind: "fence", color: null },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
      { beat: 43, col: 5, kind: "magnet", color: "cyan" },
      { beat: 48, col: 4, kind: "fence", color: null },
    ],
  },
  {
    id: "theMagnetPeak",
    name: "MAGNET OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 4, col: 5, kind: "magnet", color: "red" },
      { beat: 8, col: 3, color: "cyan" },
      { beat: 12, col: 1, kind: "fence", color: null },
      { beat: 16, col: 0, color: "red" },
      { beat: 16, col: 10, color: "red" },
      { beat: 20, col: 0, kind: "meteorMedium", color: null },
      { beat: 24, col: 7, kind: "magnet", color: "red" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 4, kind: "fence", color: null },
      { beat: 36, col: 5, kind: "meteorMedium", color: null },
      { beat: 40, col: 4, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 44, col: 9, kind: "magnet", color: "red" },
      { beat: 48, col: 5, kind: "fence", color: null },
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
