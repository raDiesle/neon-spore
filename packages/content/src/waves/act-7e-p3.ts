import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7e-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7E_P3: Wave[] = [
  {
    id: "theCrystalBreathe",
    name: "EASY CRYSTALS",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 0, kind: "crystal", color: "cyan" },
      { beat: 15, col: 6, color: "red" },
      { beat: 22, col: 0, kind: "carom", color: "red" },
      { beat: 28, col: 4, color: "red" },
      { beat: 36, col: 1, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theCrystalRecall",
    name: "CRYSTAL RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 2, kind: "crystal", color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 2, kind: "shell", color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 28, col: 1, kind: "crystal", color: "cyan" },
      { beat: 33, col: 5, color: "cyan" },
      { beat: 39, col: 6, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theCrystalBend",
    name: "CRYSTALS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 5, kind: "crystal", color: "cyan" },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 1, kind: "carom", color: "cyan" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 27, col: 4, kind: "crystal", color: "red" },
      { beat: 32, col: 10, kind: "carom", color: "cyan" },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 6, color: "cyan" },
      { beat: 44, col: 3, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theCrystalPeak",
    name: "CRYSTAL PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 3, col: 0, kind: "crystal", color: "cyan" },
      { beat: 6, col: 5, color: "red" },
      { beat: 10, col: 4, kind: "carom", color: "cyan" },
      { beat: 14, col: 1, color: "red" },
      { beat: 14, col: 9, color: "red" },
      { beat: 21, col: 2, kind: "crystal", color: "red" },
      { beat: 25, col: 3, color: "cyan" },
      { beat: 25, col: 7, color: "cyan" },
      { beat: 29, col: 8, kind: "carom", color: "red" },
      { beat: 36, col: 4, color: "red" },
      { beat: 36, col: 7, color: "red" },
      { beat: 40, col: 2, kind: "crystal", color: "cyan" },
      { beat: 44, col: 4, kind: "carom", color: "cyan" },
      { beat: 48, col: 5, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 5, row: 3, kind: "purge" },
      { beat: 32, col: 0, row: 3, kind: "purge" },
    ],
  },
];
