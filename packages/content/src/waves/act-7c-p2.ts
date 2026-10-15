import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7c.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7C_P2: Wave[] = [
  {
    id: "theChoirBend",
    name: "CHOIRS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 1, kind: "choir", color: "cyan" },
      { beat: 11, col: 5, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 22, col: 3, kind: "choir", color: "red" },
      { beat: 27, col: 5, color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 33, col: 8, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 39, col: 1, kind: "choir", color: "red" },
      { beat: 44, col: 0, color: "red" },
      { beat: 44, col: 10, color: "red" },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 3, kind: "choir", color: "cyan" },
      { beat: 7, col: 1, color: "red" },
      { beat: 7, col: 9, color: "red" },
      { beat: 11, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 14, col: 7, kind: "shell", color: "red" },
      { beat: 18, col: 1, color: "red" },
      { beat: 18, col: 9, color: "red" },
      { beat: 22, col: 5, kind: "choir", color: "cyan" },
      { beat: 26, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 26, col: 7, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 30, col: 3, color: "red" },
      { beat: 30, col: 6, color: "red" },
      { beat: 34, col: 8, kind: "shell", color: "cyan" },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 42, col: 7, kind: "choir", color: "cyan" },
      { beat: 45, col: 0, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 48, col: 3, color: "cyan" },
      { beat: 48, col: 7, color: "cyan" },
    ],
  },
];
