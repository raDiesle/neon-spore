import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-4.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_4_P2: Wave[] = [
  {
    id: "theLanceBend",
    name: "LANCE TWICE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 12, col: 6, color: "red" },
      { beat: 24, col: 2, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
    pods: [
      { beat: 6, col: 10, row: 4, kind: "ward" },
      { beat: 18, col: 7, row: 3, kind: "purge" },
      { beat: 29, col: 5, row: 3, kind: "ward" },
      { beat: 34, col: 10, row: 3, kind: "purge" },
    ],
  },
  {
    id: "theLancePeak",
    name: "LANCE PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 4, col: 1, row: 4, kind: "ward" },
      { beat: 12, col: 10, row: 3, kind: "purge" },
      { beat: 20, col: 7, row: 3, kind: "ward" },
      { beat: 24, col: 0, row: 3, kind: "purge" },
      { beat: 32, col: 3, row: 4, kind: "ward" },
      { beat: 36, col: 2, row: 3, kind: "purge" },
    ],
  },
  {
    id: "bulbQueen",
    name: "BULB QUEEN",
    guide: {
      scene: "bulbQueen",
    },
    entries: [],
    pods: [{ beat: 2, col: 5, row: 4, kind: "purge" }],
    boss: { kind: "queen", col: 5, petals: 9 },
    bossType: "normal",
    controls: "standard5",
  },
];
