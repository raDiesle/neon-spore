import type { Wave } from "../wave-types.js";

/**
 * Waves 251 to 260 of the game, in the order they are played: THE MAGNET's
 * block and the boss THE TASTER.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_23: Wave[] = [
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
      { beat: 0, col: 7, kind: "magnet", color: "red" },
      { beat: 7, col: 3, kind: "magnet", color: "red" },
      { beat: 13, col: 7, kind: "magnet", color: "red" },
      { beat: 21, col: 1, kind: "magnet", color: "cyan" },
      { beat: 27, col: 9, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetSpread",
    name: "MAGNET CONFETTI",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "magnet", color: "red" },
      { beat: 6, col: 3, color: "red" },
      { beat: 11, col: 9, kind: "magnet", color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 21, col: 7, kind: "magnet", color: "red" },
      { beat: 27, col: 0, color: "red" },
    ],
  },
  {
    id: "theMagnetReach",
    name: "LONG MAGNET ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "magnet", color: "red" },
      { beat: 5, col: 9, kind: "fence", color: null },
      { beat: 11, col: 5, color: "red" },
      { beat: 16, col: 1, kind: "magnet", color: "red" },
      { beat: 21, col: 7, kind: "fence", color: null },
      { beat: 27, col: 2, color: "red" },
    ],
  },
  {
    id: "theMagnetPair",
    name: "MAGNET PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "magnet", color: "red" },
      { beat: 10, col: 0, color: "red" },
      { beat: 15, col: 4, kind: "fence", color: null },
      { beat: 19, col: 7, color: "red" },
      { beat: 24, col: 1, kind: "seeder", color: "red" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 32, col: 5, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theMagnetBreathe",
    name: "LAZY MAGNET",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 7, col: 6, kind: "magnet", color: "red" },
      { beat: 14, col: 0, color: "red" },
      { beat: 22, col: 7, kind: "fence", color: null },
      { beat: 29, col: 0, color: "red" },
      { beat: 35, col: 2, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theMagnetRecall",
    name: "MAGNET REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 3, kind: "magnet", color: "cyan" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 17, col: 10, kind: "magnet", color: "red" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 27, col: 5, kind: "magnet", color: "cyan" },
      { beat: 33, col: 1, color: "cyan" },
      { beat: 39, col: 8, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetBend",
    name: "MAGNET RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 1, kind: "magnet", color: "red" },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 15, col: 10, kind: "fence", color: null },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 1, kind: "magnet", color: "red" },
      { beat: 33, col: 6, kind: "fence", color: null },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
      { beat: 44, col: 1, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetPeak",
    name: "MAGNET OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 9, kind: "magnet", color: "red" },
      { beat: 7, col: 10, color: "red" },
      { beat: 10, col: 9, kind: "fence", color: null },
      { beat: 13, col: 3, color: "cyan" },
      { beat: 13, col: 7, color: "cyan" },
      { beat: 17, col: 7, kind: "meteor", color: null },
      { beat: 20, col: 2, kind: "magnet", color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 28, col: 5, kind: "fence", color: null },
      { beat: 31, col: 3, kind: "meteor", color: null },
      { beat: 35, col: 2, color: "red" },
      { beat: 35, col: 8, color: "red" },
      { beat: 39, col: 3, kind: "magnet", color: "cyan" },
      { beat: 43, col: 6, kind: "fence", color: null },
      { beat: 46, col: 0, color: "cyan" },
    ],
  },
  {
    id: "theTaster",
    name: "THE TASTER",
    guide: {
      scene: "theTaster",
    },
    entries: [
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 8, kind: "meteor", color: null },
      { beat: 30, col: 5, color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 44, col: 10, kind: "meteor", color: null },
      { beat: 50, col: 3, color: "red" },
      { beat: 56, col: 7, color: "cyan" },
      { beat: 64, col: 5, kind: "meteor", color: null },
      { beat: 72, col: 2, color: "cyan" },
      { beat: 80, col: 8, color: "red" },
    ],
    boss: { kind: "taster" },
    bossType: "normal",
  },
];
