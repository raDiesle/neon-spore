import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P3: Wave[] = [
  {
    id: "theLimpetBreathe",
    name: "LIMPET AT EASE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 1, kind: "weight", color: null },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 22, col: 4, kind: "meteor", color: null },
      { beat: 30, col: 6, color: "cyan" },
      { beat: 36, col: 8, kind: "weight", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
  {
    id: "theLimpetRecall",
    name: "LIMPET RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 0, kind: "weight", color: null },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 16, col: 5, kind: "torch", color: null },
      { beat: 22, col: 9, color: "red" },
      { beat: 28, col: 5, kind: "weight", color: null },
      { beat: 33, col: 7, color: "red" },
      { beat: 38, col: 4, kind: "torch", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
  {
    id: "theLimpetBend",
    name: "LIMPET TWICE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 7, kind: "weight", color: null },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 4, kind: "beatbox", color: null, beats: 3 },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 27, col: 4, kind: "weight", color: null },
      { beat: 33, col: 2, kind: "beatbox", color: null, beats: 2 },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 7, color: "cyan" },
      { beat: 44, col: 9, kind: "weight", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
  {
    id: "theLimpetPeak",
    name: "LIMPET PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 10, kind: "weight", color: null },
      { beat: 8, col: 3, color: "cyan" },
      { beat: 12, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 16, col: 5, color: "cyan" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 24, col: 3, kind: "weight", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 32, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 40, col: 2, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 44, col: 8, kind: "weight", color: null },
      { beat: 48, col: 0, kind: "beatbox", color: null, beats: 4 },
    ],
    pods: [
      { beat: 20, col: 0, row: 4, kind: "ward" },
      { beat: 36, col: 5, row: 3, kind: "ward" },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
  {
    id: "theWarden",
    name: "THE WARDEN",
    guide: {
      scene: "theWarden",
    },
    entries: [],
    boss: { kind: "warden" },
    bossType: "normal",
    controls: "standard5",
  },
];
