import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-3-p3.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_3_P4: Wave[] = [
  {
    id: "theClaspBend",
    name: "CLASPS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 7, kind: "clasp", color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 16, col: 0, kind: "shell", color: "red" },
      { beat: 21, col: 3, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 27, col: 7, kind: "clasp", color: "cyan" },
      { beat: 33, col: 4, kind: "shell", color: "cyan" },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 6, color: "cyan" },
      { beat: 44, col: 10, kind: "clasp", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theClaspPeak",
    name: "CLASP PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 4, col: 1, kind: "clasp", color: "cyan" },
      { beat: 8, col: 2, color: "red" },
      { beat: 12, col: 4, kind: "shell", color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 20, col: 9, kind: "clasp", color: "cyan" },
      { beat: 24, col: 4, kind: "shell", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 1, kind: "clasp", color: "cyan" },
      { beat: 36, col: 2, kind: "shell", color: "red" },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
      { beat: 44, col: 5, kind: "clasp", color: "red" },
      { beat: 48, col: 8, kind: "shell", color: "cyan" },
    ],
    controls: "standard5",
  },
];
