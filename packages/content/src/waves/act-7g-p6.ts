import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7g-p5.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7G_P6: Wave[] = [
  {
    id: "theCoilReach",
    name: "COILS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "coil", color: null },
      { beat: 5, col: 6, kind: "magnet", color: "red" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 17, col: 5, kind: "coil", color: null },
      { beat: 23, col: 9, kind: "magnet", color: "cyan" },
      { beat: 28, col: 0, color: "cyan" },
    ],
  },
  {
    id: "theCoilPair",
    name: "COIL AND MAGNET",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 6, kind: "coil", color: null },
      { beat: 9, col: 10, color: "cyan" },
      { beat: 14, col: 0, kind: "magnet", color: "cyan" },
      { beat: 19, col: 4, color: "cyan" },
      { beat: 28, col: 3, color: "red" },
      { beat: 33, col: 4, kind: "coil", color: null },
    ],
    pods: [{ beat: 23, col: 10, row: 3, kind: "purge" }],
  },
  {
    id: "theCoilBreathe",
    name: "EASY COILS",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 1, kind: "coil", color: null },
      { beat: 13, col: 7, color: "red" },
      { beat: 21, col: 5, kind: "magnet", color: "red" },
      { beat: 29, col: 10, color: "red" },
      { beat: 37, col: 7, kind: "wisp", color: null },
    ],
  },
  {
    id: "theCoilRecall",
    name: "COIL RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 2, kind: "coil", color: null },
      { beat: 11, col: 1, color: "red" },
      { beat: 16, col: 4, kind: "dart", color: "red" },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 5, kind: "coil", color: null },
      { beat: 33, col: 6, color: "red" },
      { beat: 38, col: 7, kind: "dart", color: "red" },
    ],
  },
  {
    id: "theCoilBend",
    name: "COILS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 7, kind: "coil", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 18, col: 2, kind: "magnet", color: "cyan" },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 6, color: "red" },
      { beat: 29, col: 5, kind: "coil", color: null },
      { beat: 34, col: 4, kind: "magnet", color: "red" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 8, kind: "coil", color: null },
    ],
  },
  {
    id: "theTwitch",
    name: "THE TWITCH",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 26, col: 10, kind: "coil", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 48, col: 10, kind: "coil", color: null },
      { beat: 50, col: 10, kind: "coil", color: null },
      { beat: 52, col: 10, kind: "coil", color: null },
      { beat: 54, col: 10, kind: "coil", color: null },
      { beat: 62, col: 0, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
];
