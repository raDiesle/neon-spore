import { FILAMENT_SCRIPT } from "../filament-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 415 to 424 of the game, in the order they are played: THE CRYSTAL's
 * block, the filler before THE FILAMENT and the boss THE FILAMENT.
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
    id: "fillerFilamentBreathe",
    name: "CRYSTAL LULLABY",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 7, col: 0, kind: "crystal", color: "red" },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 21, col: 4, kind: "recoil", color: "cyan" },
      { beat: 29, col: 7, color: "red" },
      { beat: 37, col: 6, kind: "dart", color: "red" },
    ],
  },
  {
    id: "fillerFilamentRecall",
    name: "ANCIENT CRYSTAL",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 4, kind: "crystal", color: "red" },
      { beat: 10, col: 9, color: "cyan" },
      { beat: 15, col: 4, kind: "seeder", color: "cyan" },
      { beat: 21, col: 3, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 26, col: 9, kind: "crystal", color: "red" },
      { beat: 32, col: 1, kind: "seeder", color: "red" },
      { beat: 37, col: 4, color: "cyan" },
      { beat: 37, col: 7, color: "cyan" },
    ],
  },
  {
    id: "fillerFilamentBend",
    name: "CRYSTAL RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 10, kind: "crystal", color: "red" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 2, kind: "recoil", color: "red" },
      { beat: 20, col: 8, kind: "crystal", color: "cyan" },
      { beat: 25, col: 3, color: "red" },
      { beat: 25, col: 7, color: "red" },
      { beat: 31, col: 8, kind: "recoil", color: "cyan" },
      { beat: 36, col: 9, kind: "crystal", color: "red" },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 47, col: 7, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theFilament",
    name: "THE FILAMENT",
    entries: [],
    boss: { kind: "filament", filaments: FILAMENT_SCRIPT },
    bossType: "normal",
    controls: "scene",
  },
];
