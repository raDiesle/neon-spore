import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p6.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P7: Wave[] = [
  {
    id: "theBlister",
    name: "THE BLISTER",
    guide: {
      scene: "theBlister",
    },
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 12, col: 2, kind: "blister", color: null, row: 3 },
    ],
    controls: "standard4",
  },
  {
    id: "tapBlisters",
    name: "TAP",
    guide: {
      scene: "tapBlisters",
    },
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 8, col: 4, kind: "blister", color: null, row: 2 },
      { beat: 16, col: 7, color: "red" },
      { beat: 24, col: 4, kind: "blister", color: null, row: 2 },
      { beat: 32, col: 5, color: "red" },
      { beat: 40, col: 6, kind: "blister", color: null, row: 2 },
      { beat: 48, col: 7, color: "red" },
      { beat: 56, col: 5, kind: "blister", color: null, row: 3 },
      { beat: 64, col: 7, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "tapBlistersRecall",
    name: "ANCIENT TAP",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 7, col: 2, kind: "blister", color: null, row: 2 },
      { beat: 15, col: 9, color: "cyan" },
      { beat: 22, col: 2, kind: "strand", color: "red", beads: 5 },
      { beat: 29, col: 5, color: "red" },
      { beat: 37, col: 9, kind: "blister", color: null, row: 2 },
    ],
    controls: "standard4",
  },
  {
    id: "holdBlisters",
    name: "HOLD",
    guide: {
      scene: "holdBlisters",
    },
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 5, kind: "blister", color: null, row: 2, gesture: "hold" },
      { beat: 16, col: 6, color: "red" },
      { beat: 24, col: 4, kind: "blister", color: null, row: 2, gesture: "hold" },
      { beat: 32, col: 5, color: "red" },
      { beat: 40, col: 6, kind: "blister", color: null, row: 2, gesture: "hold" },
      { beat: 48, col: 6, color: "red" },
      { beat: 56, col: 4, kind: "blister", color: null, row: 3, gesture: "hold" },
      { beat: 64, col: 5, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "holdBlistersRecall",
    name: "HOLD HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 6, kind: "blister", color: null, row: 2, gesture: "hold" },
      { beat: 15, col: 4, color: "red" },
      { beat: 22, col: 2, kind: "magnet", color: "red" },
      { beat: 30, col: 10, color: "red" },
      { beat: 37, col: 5, kind: "blister", color: null, row: 2, gesture: "hold" },
    ],
    controls: "standard4",
  },
  {
    id: "swipeBlisters",
    name: "SWIPE",
    guide: {
      scene: "swipeBlisters",
    },
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 5, kind: "blister", color: null, row: 2, gesture: "swipe", way: "up" },
      { beat: 16, col: 7, color: "red" },
      { beat: 24, col: 4, kind: "blister", color: null, row: 2, gesture: "swipe", way: "up" },
      { beat: 32, col: 3, color: "red" },
      { beat: 40, col: 4, kind: "blister", color: null, row: 3, gesture: "swipe", way: "down" },
      { beat: 48, col: 5, color: "red" },
      { beat: 56, col: 7, kind: "blister", color: null, row: 3, gesture: "swipe", way: "down" },
      { beat: 64, col: 6, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "swipeBlistersRecall",
    name: "SWIPE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 7, col: 4, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 14, col: 7, color: "red" },
      { beat: 22, col: 0, kind: "shell", color: "red" },
      { beat: 29, col: 6, color: "red" },
      { beat: 37, col: 0, kind: "blister", color: null, row: 2, gesture: "swipe", way: "up" },
    ],
    controls: "standard4",
  },
];
