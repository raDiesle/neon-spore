import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p8.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P9: Wave[] = [
  {
    id: "leverBlistersRecall",
    name: "LEVER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 7, col: 9, kind: "blister", color: null, row: 3, gesture: "lever" },
      { beat: 15, col: 10, color: "cyan" },
      { beat: 22, col: 1, kind: "magnet", color: "red" },
      { beat: 29, col: 4, color: "cyan" },
      { beat: 37, col: 2, kind: "blister", color: null, row: 2, gesture: "lever" },
    ],
    controls: "standard4",
  },
  {
    id: "leverBlistersPeak",
    name: "LEVER ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 0, kind: "blister", color: null, row: 2, gesture: "lever" },
      { beat: 13, col: 10, color: "red" },
      { beat: 20, col: 0, kind: "torch", color: null },
      { beat: 25, col: 5, color: "red" },
      { beat: 29, col: 6, kind: "blister", color: null, row: 2, gesture: "lever" },
      { beat: 33, col: 5, color: "red" },
      { beat: 37, col: 4, kind: "lure", color: "cyan" },
      { beat: 42, col: 9, color: "cyan" },
      { beat: 46, col: 5, kind: "blister", color: null, row: 3, gesture: "lever" },
    ],
    controls: "standard4",
  },
  {
    id: "fiveBlisters",
    name: "HELLO BLISTER",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 2 },
      { beat: 10, col: 8, kind: "blister", color: null, row: 2, gesture: "hold" },
      { beat: 20, col: 2, kind: "blister", color: null, row: 3, gesture: "swipe", way: "left" },
      { beat: 30, col: 7, kind: "blister", color: null, row: 2, gesture: "turn" },
      { beat: 40, col: 3, kind: "blister", color: null, row: 2, gesture: "rub" },
      { beat: 41, col: 8, kind: "blister", color: null, row: 3, gesture: "swipe", way: "up" },
    ],
    controls: "standard4",
  },
];
