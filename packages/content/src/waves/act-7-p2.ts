import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7_P2: Wave[] = [
  {
    id: "theFenceBreathe",
    name: "EASY FENCES",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 2, kind: "fence", color: null },
      { beat: 13, col: 8, color: "red" },
      { beat: 19, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 25, col: 4, color: "cyan" },
      { beat: 32, col: 8, kind: "meteor", color: null },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "theFenceRecall",
    name: "FENCE RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 7, kind: "fence", color: null },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 0, kind: "recoil", color: "red" },
      { beat: 22, col: 10, color: "red" },
      { beat: 28, col: 4, kind: "fence", color: null },
      { beat: 33, col: 8, color: "red" },
      { beat: 38, col: 5, kind: "recoil", color: "red" },
    ],
  },
  {
    id: "theFenceBend",
    name: "FENCES AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 5, kind: "fence", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 16, col: 8, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 27, col: 6, kind: "fence", color: null },
      { beat: 33, col: 7, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 43, col: 7, kind: "fence", color: null },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 3, col: 3, kind: "fence", color: null },
      { beat: 7, col: 4, color: "cyan" },
      { beat: 10, col: 2, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 14, col: 5, color: "red" },
      { beat: 14, col: 8, color: "red" },
      { beat: 21, col: 7, kind: "fence", color: null },
      { beat: 24, col: 4, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 28, col: 9, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 35, col: 0, color: "red" },
      { beat: 35, col: 10, color: "red" },
      { beat: 39, col: 4, kind: "fence", color: null },
      { beat: 43, col: 3, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 47, col: 4, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 4, row: 3, kind: "purge" },
      { beat: 31, col: 7, row: 3, kind: "purge" },
    ],
  },
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
];
