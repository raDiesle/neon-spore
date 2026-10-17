import type { Wave } from "../wave-types.js";

/**
 * Waves 415 to 424 of the game, in the order they are played: THE CRYSTAL's
 * block, the filler before THE RATCHET and the boss THE RATCHET.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_37: Wave[] = [
  {
    id: "theCrystal",
    name: "THE CRYSTAL",
    guide: {
      scene: "theCrystal",
    },
    entries: [
      { beat: 0, col: 0, kind: "crystal", color: "red" },
      { beat: 20, col: 10, kind: "crystal", color: "cyan" },
      { beat: 40, col: 2, kind: "crystal", color: "cyan" },
      { beat: 46, col: 8, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalAgain",
    name: "CRYSTAL RISING",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "crystal", color: "red" },
      { beat: 8, col: 8, kind: "recoil", color: "red" },
      { beat: 15, col: 2, kind: "crystal", color: "cyan" },
      { beat: 22, col: 6, kind: "recoil", color: "red" },
      { beat: 28, col: 7, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalReach",
    name: "LONG CRYSTAL ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "crystal", color: "cyan" },
      { beat: 6, col: 8, kind: "recoil", color: "red" },
      { beat: 12, col: 1, kind: "morsel", color: "cyan" },
      { beat: 17, col: 8, kind: "crystal", color: "cyan" },
      { beat: 25, col: 4, kind: "recoil", color: "red" },
      { beat: 30, col: 9, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "theCrystalPair",
    name: "CRYSTAL PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 4, col: 5, kind: "crystal", color: "red" },
      { beat: 9, col: 2, color: "red" },
      { beat: 14, col: 7, kind: "recoil", color: "red" },
      { beat: 20, col: 1, color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 24, col: 2, kind: "coil", color: null },
      { beat: 30, col: 6, kind: "crystal", color: "cyan" },
      { beat: 34, col: 3, color: "red" },
      { beat: 34, col: 7, color: "red" },
      { beat: 40, col: 2, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theCrystalRecall",
    name: "CRYSTAL REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 6, kind: "crystal", color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 16, col: 7, kind: "clasp", color: "cyan" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 1, kind: "crystal", color: "red" },
      { beat: 34, col: 8, kind: "clasp", color: "red" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "theCrystalPeak",
    name: "CRYSTAL OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 5, kind: "crystal", color: "red" },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 13, col: 9, kind: "recoil", color: "red" },
      { beat: 17, col: 3, kind: "magnet", color: "red" },
      { beat: 25, col: 3, color: "cyan" },
      { beat: 25, col: 6, color: "cyan" },
      { beat: 29, col: 3, kind: "crystal", color: "cyan" },
      { beat: 34, col: 9, kind: "recoil", color: "cyan" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 41, col: 9, kind: "magnet", color: "red" },
      { beat: 46, col: 3, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "fillerRatchetBreathe",
    name: "SOFT CRYSTAL",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 8, col: 1, kind: "crystal", color: "cyan" },
      { beat: 15, col: 8, color: "cyan" },
      { beat: 22, col: 4, kind: "recoil", color: "red" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 35, col: 4, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "fillerRatchetRecall",
    name: "CRYSTAL SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 9, kind: "crystal", color: "cyan" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 17, col: 5, kind: "magnet", color: "red" },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 27, col: 9, kind: "crystal", color: "red" },
      { beat: 33, col: 1, kind: "magnet", color: "cyan" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerRatchetBend",
    name: "CROOKED CRYSTAL",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 4, kind: "crystal", color: "cyan" },
      { beat: 10, col: 1, color: "red" },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 7, kind: "recoil", color: "cyan" },
      { beat: 21, col: 10, kind: "crystal", color: "red" },
      { beat: 26, col: 2, color: "red" },
      { beat: 26, col: 8, color: "red" },
      { beat: 32, col: 2, kind: "recoil", color: "red" },
      { beat: 37, col: 5, kind: "crystal", color: "red" },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 42, col: 7, color: "cyan" },
      { beat: 48, col: 2, kind: "recoil", color: "red" },
    ],
  },
  {
    id: "theRatchet",
    name: "THE RATCHET",
    guide: {
      scene: "theRatchet",
    },
    entries: [],
    boss: { kind: "ratchet" },
    bossType: "normal",
  },
];
