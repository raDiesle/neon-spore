import type { Wave } from "../wave-types.js";

/**
 * Waves 426 to 435 of the game, in the order they are played: THE CRYSTAL's
 * block, the filler before THE REPRISE and the boss THE REPRISE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_35: Wave[] = [
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
      { beat: 0, col: 9, kind: "crystal", color: "cyan" },
      { beat: 8, col: 7, kind: "recoil", color: "cyan" },
      { beat: 15, col: 4, kind: "crystal", color: "cyan" },
      { beat: 23, col: 0, kind: "recoil", color: "cyan" },
      { beat: 30, col: 4, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalReach",
    name: "LONG CRYSTAL ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "crystal", color: "cyan" },
      { beat: 5, col: 4, kind: "recoil", color: "red" },
      { beat: 11, col: 9, kind: "coil", color: null },
      { beat: 18, col: 0, kind: "crystal", color: "red" },
      { beat: 24, col: 5, kind: "recoil", color: "red" },
      { beat: 30, col: 10, kind: "coil", color: null },
    ],
  },
  {
    id: "theCrystalPair",
    name: "CRYSTAL WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 5, kind: "crystal", color: "cyan" },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 7, kind: "recoil", color: "red" },
      { beat: 20, col: 3, color: "cyan" },
      { beat: 20, col: 7, color: "cyan" },
      { beat: 24, col: 1, kind: "coil", color: null },
      { beat: 29, col: 7, kind: "crystal", color: "red" },
      { beat: 34, col: 1, color: "red" },
      { beat: 34, col: 9, color: "red" },
      { beat: 38, col: 3, kind: "recoil", color: "red" },
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
      { beat: 16, col: 7, kind: "dart", color: "red" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 1, kind: "crystal", color: "red" },
      { beat: 34, col: 8, kind: "dart", color: "cyan" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "theCrystalPeak",
    name: "CRYSTAL ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 3, col: 3, kind: "crystal", color: "red" },
      { beat: 7, col: 3, color: "cyan" },
      { beat: 7, col: 7, color: "cyan" },
      { beat: 11, col: 10, kind: "recoil", color: "cyan" },
      { beat: 15, col: 3, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 15, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 19, col: 7, color: "cyan" },
      { beat: 23, col: 5, kind: "crystal", color: "red" },
      { beat: 26, col: 1, color: "cyan" },
      { beat: 26, col: 9, color: "cyan" },
      { beat: 34, col: 0, kind: "recoil", color: "red" },
      { beat: 39, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 43, col: 1, color: "red" },
      { beat: 43, col: 9, color: "red" },
      { beat: 47, col: 7, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "fillerRepriseBreathe",
    name: "SOFT CRYSTAL",
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 10, kind: "crystal", color: "red" },
      { beat: 14, col: 0, color: "red" },
      { beat: 21, col: 5, kind: "recoil", color: "cyan" },
      { beat: 29, col: 2, color: "cyan" },
      { beat: 37, col: 6, kind: "balloon", color: null },
    ],
  },
  {
    id: "fillerRepriseRecall",
    name: "CRYSTAL RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 4, kind: "crystal", color: "cyan" },
      { beat: 12, col: 7, color: "red" },
      { beat: 18, col: 5, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 31, col: 10, kind: "crystal", color: "cyan" },
      { beat: 37, col: 2, kind: "meteor", color: null, cross: 1, row: 4 },
    ],
  },
  {
    id: "fillerRepriseBend",
    name: "CRYSTAL MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 4, kind: "crystal", color: "cyan" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 17, col: 3, kind: "recoil", color: "cyan" },
      { beat: 22, col: 0, kind: "crystal", color: "cyan" },
      { beat: 29, col: 1, color: "cyan" },
      { beat: 29, col: 9, color: "cyan" },
      { beat: 35, col: 4, kind: "recoil", color: "cyan" },
      { beat: 41, col: 6, kind: "crystal", color: "cyan" },
      { beat: 46, col: 0, color: "cyan" },
      { beat: 46, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theReprise",
    name: "THE REPRISE",
    guide: {
      scene: "theReprise",
    },
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 5, color: "cyan" },
      { beat: 6, col: 10, color: "red" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 14, col: 7, color: "red" },
      { beat: 18, col: 0, color: "red" },
      { beat: 21, col: 10, color: "cyan" },
    ],
    boss: { kind: "reprise", beat: 12 },
    bossType: "normal",
  },
];
