import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7f.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7F_P2: Wave[] = [
  {
    id: "theVeerSpread",
    name: "VEERS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veer", color: null },
      { beat: 7, col: 3, kind: "volley", color: "red" },
      { beat: 14, col: 4, kind: "veer", color: null },
      { beat: 21, col: 2, kind: "volley", color: "red" },
      { beat: 28, col: 5, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerReach",
    name: "VEERS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veer", color: null },
      { beat: 6, col: 5, kind: "volley", color: "red" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 5, kind: "veer", color: null },
      { beat: 23, col: 1, kind: "volley", color: "red" },
      { beat: 29, col: 6, color: "cyan" },
    ],
  },
  {
    id: "theVeerPair",
    name: "VEER AND VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 10, col: 0, color: "red" },
      { beat: 15, col: 6, kind: "volley", color: "cyan" },
      { beat: 21, col: 2, color: "red" },
      { beat: 26, col: 1, kind: "veer", color: null },
      { beat: 32, col: 10, color: "cyan" },
      { beat: 36, col: 6, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVeerBreathe",
    name: "EASY VEERS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 0, kind: "veer", color: null },
      { beat: 13, col: 4, color: "cyan" },
      { beat: 19, col: 0, kind: "volley", color: "red" },
      { beat: 26, col: 2, color: "red" },
      { beat: 34, col: 7, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "theVeerRecall",
    name: "VEER RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 17, col: 10, kind: "ghost", color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 1, kind: "veer", color: null },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 39, col: 2, kind: "ghost", color: "red" },
    ],
  },
  {
    id: "theVeerBend",
    name: "VEERS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 7, kind: "veer", color: null },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 17, col: 6, kind: "volley", color: "red" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 29, col: 8, kind: "veer", color: null },
      { beat: 35, col: 4, kind: "volley", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 6, color: "cyan" },
      { beat: 45, col: 7, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerPeak",
    name: "VEER PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 4, kind: "veer", color: null },
      { beat: 8, col: 2, color: "red" },
      { beat: 12, col: 0, kind: "volley", color: "cyan" },
      { beat: 15, col: 1, color: "cyan" },
      { beat: 15, col: 9, color: "cyan" },
      { beat: 22, col: 4, kind: "veer", color: null },
      { beat: 26, col: 2, color: "red" },
      { beat: 26, col: 8, color: "red" },
      { beat: 30, col: 10, kind: "volley", color: "red" },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
      { beat: 41, col: 4, kind: "veer", color: null },
      { beat: 45, col: 7, kind: "volley", color: "cyan" },
    ],
    pods: [
      { beat: 19, col: 6, row: 3, kind: "ward" },
      { beat: 34, col: 0, row: 4, kind: "ward" },
    ],
  },
];
