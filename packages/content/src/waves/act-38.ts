import type { Wave } from "../wave-types.js";

/**
 * Waves 412 to 421 of the game, in the order they are played: THE CRYSTAL's
 * block, the filler before THE RATCHET and the boss THE RATCHET.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_38: Wave[] = [
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
      { beat: 0, col: 0, kind: "crystal", color: "cyan" },
      { beat: 6, col: 7, kind: "recoil", color: "cyan" },
      { beat: 14, col: 1, kind: "crystal", color: "cyan" },
      { beat: 20, col: 5, kind: "recoil", color: "cyan" },
      { beat: 28, col: 10, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalReach",
    name: "LONG CRYSTAL ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "crystal", color: "red" },
      { beat: 6, col: 4, kind: "recoil", color: "red" },
      { beat: 11, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 16, col: 0, kind: "crystal", color: "cyan" },
      { beat: 22, col: 8, kind: "recoil", color: "red" },
      { beat: 28, col: 1, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theCrystalPair",
    name: "CRYSTAL PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 4, col: 7, kind: "crystal", color: "cyan" },
      { beat: 9, col: 10, color: "red" },
      { beat: 14, col: 0, kind: "recoil", color: "cyan" },
      { beat: 19, col: 3, color: "red" },
      { beat: 19, col: 6, color: "red" },
      { beat: 23, col: 3, kind: "echo", color: "red" },
      { beat: 28, col: 5, kind: "crystal", color: "red" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 32, col: 9, color: "cyan" },
      { beat: 37, col: 0, kind: "recoil", color: "red" },
    ],
  },
  {
    id: "theCrystalRecall",
    name: "CRYSTAL REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 9, kind: "crystal", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 16, col: 10, kind: "crystal", color: "red" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 9, kind: "crystal", color: "red" },
      { beat: 33, col: 1, color: "cyan" },
      { beat: 39, col: 4, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalPeak",
    name: "CRYSTAL OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 3, col: 1, kind: "crystal", color: "red" },
      { beat: 7, col: 1, color: "red" },
      { beat: 7, col: 9, color: "red" },
      { beat: 11, col: 2, kind: "recoil", color: "cyan" },
      { beat: 14, col: 5, kind: "weight", color: null },
      { beat: 17, col: 0, color: "red" },
      { beat: 17, col: 10, color: "red" },
      { beat: 21, col: 7, kind: "crystal", color: "cyan" },
      { beat: 25, col: 4, kind: "recoil", color: "cyan" },
      { beat: 29, col: 2, color: "red" },
      { beat: 29, col: 8, color: "red" },
      { beat: 32, col: 1, kind: "weight", color: null },
      { beat: 36, col: 3, kind: "crystal", color: "cyan" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 44, col: 4, kind: "recoil", color: "red" },
      { beat: 48, col: 8, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerRatchetBreathe",
    name: "SOFT CRYSTAL",
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 8, kind: "crystal", color: "red" },
      { beat: 15, col: 3, color: "red" },
      { beat: 23, col: 10, kind: "recoil", color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 37, col: 3, kind: "choir", color: "red" },
    ],
  },
  {
    id: "fillerRatchetRecall",
    name: "CRYSTAL SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 9, kind: "crystal", color: "red" },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 16, col: 8, kind: "throb", color: "red" },
      { beat: 21, col: 5, color: "red" },
      { beat: 21, col: 8, color: "red" },
      { beat: 26, col: 0, kind: "crystal", color: "cyan" },
      { beat: 31, col: 2, kind: "throb", color: "red" },
      { beat: 36, col: 0, color: "red" },
      { beat: 36, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerRatchetBend",
    name: "CROOKED CRYSTAL",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 4, kind: "crystal", color: "cyan" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 4, kind: "recoil", color: "red" },
      { beat: 23, col: 6, kind: "crystal", color: "cyan" },
      { beat: 29, col: 0, color: "red" },
      { beat: 29, col: 10, color: "red" },
      { beat: 34, col: 8, kind: "recoil", color: "cyan" },
      { beat: 39, col: 6, kind: "crystal", color: "cyan" },
      { beat: 44, col: 0, color: "red" },
      { beat: 44, col: 10, color: "red" },
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
