import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P3: Wave[] = [
  {
    id: "theStrand",
    name: "THE STRAND",
    hints: "theStrand",
    entries: [
      { beat: 0, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 36, col: 2, kind: "strand", color: "red", beads: 5 },
    ],
    controls: "standard2",
  },
  {
    id: "theStrandRecall",
    name: "ANCIENT STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 7, col: 0, kind: "strand", color: "cyan", beads: 3 },
      { beat: 14, col: 7, color: "red" },
      { beat: 21, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 28, col: 2, color: "red" },
      { beat: 36, col: 1, kind: "strand", color: "cyan", beads: 3 },
    ],
    controls: "standard2",
  },
  {
    id: "theVeil",
    name: "THE VEIL",
    hints: "theVeil",
    entries: [
      { beat: 0, col: 5, kind: "veil", color: null },
      { beat: 10, col: 2, kind: "veil", color: null },
      { beat: 18, col: 8, kind: "veil", color: null },
      { beat: 26, col: 3, kind: "veil", color: null },
      { beat: 34, col: 0, kind: "veil", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theVeilRecall",
    name: "VEIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 2, kind: "veil", color: null },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 23, col: 5, kind: "veil", color: null },
      { beat: 30, col: 6, color: "red" },
      { beat: 38, col: 0, kind: "veil", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theThirdShot",
    name: "THE SHELL",
    hints: "theThirdShot",
    entries: [
      { beat: 0, col: 2, kind: "shell", color: "cyan" },
      { beat: 10, col: 7, kind: "shell", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theThirdShotRecall",
    name: "SHELL SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 7, col: 8, kind: "shell", color: "cyan" },
      { beat: 15, col: 7, color: "cyan" },
      { beat: 23, col: 4, kind: "shell", color: "red" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 38, col: 4, kind: "shell", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "holdAndAim",
    name: "HOLD AND AIM",
    hints: "holdAndAim",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 7, col: 1, color: "red" },
      { beat: 14, col: 10, color: "red" },
      { beat: 20, col: 0, color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 33, col: 2, color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theMagnet",
    name: "THE MAGNET",
    hints: "theMagnet",
    entries: [
      { beat: 0, col: 5, kind: "magnet", color: "red" },
      { beat: 14, col: 3, kind: "magnet", color: "cyan" },
      { beat: 28, col: 7, kind: "magnet", color: "red" },
      { beat: 44, col: 1, kind: "magnet", color: "cyan" },
      { beat: 52, col: 9, kind: "magnet", color: "red" },
    ],
    controls: "standard2",
  },
];
