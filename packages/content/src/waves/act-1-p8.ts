import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p7.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P8: Wave[] = [
  {
    id: "leverBlistersReach",
    name: "LEVER HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "blister", color: null, row: 2, by: 1, gesture: "lever" },
      { beat: 5, col: 5, kind: "blister", color: null, row: 3, by: 1, gesture: "lever" },
      { beat: 11, col: 10, kind: "blister", color: null, row: 3, gesture: "lever" },
      { beat: 17, col: 6, kind: "blister", color: null, row: 3, by: 1, gesture: "lever" },
      { beat: 22, col: 2, kind: "blister", color: null, row: 3, gesture: "lever" },
      { beat: 28, col: 8, kind: "blister", color: null, row: 2, by: 1, gesture: "lever" },
    ],
    controls: "standard4",
  },
  {
    id: "leverBlistersPair",
    name: "LEVER PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 3, kind: "blister", color: null, row: 3, by: 1, gesture: "lever" },
      { beat: 11, col: 6, color: "red" },
      { beat: 16, col: 8, kind: "torch", color: null },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 28, col: 5, kind: "blister", color: null, row: 2, by: 1, gesture: "lever" },
      { beat: 32, col: 4, color: "red" },
      { beat: 37, col: 10, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "fiveBlisters",
    name: "HELLO BLISTER",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 2, by: 2 },
      { beat: 10, col: 8, kind: "blister", color: null, row: 2, by: 1, gesture: "hold" },
      {
        beat: 20,
        col: 2,
        kind: "blister",
        color: null,
        row: 3,
        by: 2,
        gesture: "swipe",
        way: "left",
      },
      { beat: 30, col: 7, kind: "blister", color: null, row: 2, by: 1, gesture: "turn" },
      { beat: 40, col: 3, kind: "blister", color: null, row: 2, by: 2, gesture: "rub" },
      {
        beat: 41,
        col: 8,
        kind: "blister",
        color: null,
        row: 3,
        by: 1,
        gesture: "swipe",
        way: "up",
      },
    ],
    controls: "standard4",
  },
];
