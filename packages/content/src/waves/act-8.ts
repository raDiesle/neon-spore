import type { Wave } from "../wave-types.js";

/**
 * Waves 89 to 98 of the game, in the order they are played: THE LIMPET's block
 * and the boss THE WARDEN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_8: Wave[] = [
  {
    id: "theLimpet",
    name: "THE LIMPET",
    guide: {
      scene: "theLimpet",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 8, kind: "meteor", color: null },
      { beat: 30, col: 3, kind: "meteor", color: null },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 50, col: 8, kind: "meteor", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
  {
    id: "theLimpetAgain",
    name: "LITTLE LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "weight", color: null },
      { beat: 8, col: 3, kind: "weight", color: null },
      { beat: 15, col: 5, kind: "weight", color: null },
      { beat: 22, col: 3, kind: "weight", color: null },
      { beat: 28, col: 7, kind: "weight", color: null },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetSpread",
    name: "LIMPET BLOOM",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "weight", color: null },
      { beat: 5, col: 6, kind: "weight", color: null },
      { beat: 12, col: 1, kind: "weight", color: null },
      { beat: 18, col: 6, kind: "weight", color: null },
      { beat: 23, col: 4, kind: "weight", color: null },
      { beat: 28, col: 9, kind: "weight", color: null },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetReach",
    name: "LIMPET PILGRIM",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "weight", color: null },
      { beat: 6, col: 4, kind: "meteor", color: null },
      { beat: 11, col: 0, kind: "weight", color: null },
      { beat: 17, col: 6, kind: "meteor", color: null },
      { beat: 22, col: 10, kind: "weight", color: null },
      { beat: 28, col: 2, kind: "meteor", color: null },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetPair",
    name: "LIMPET TOGETHER",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 1, kind: "weight", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 14, col: 1, kind: "beatbox", color: null, beats: 3 },
      { beat: 20, col: 0, color: "cyan" },
      { beat: 26, col: 2, kind: "weight", color: null },
      { beat: 30, col: 5, color: "red" },
      { beat: 34, col: 0, kind: "beatbox", color: null, beats: 4 },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
  {
    id: "theLimpetBreathe",
    name: "LIMPET SIESTA",
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
    name: "LIMPET RELIC",
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
    name: "LIMPET ILLUSION",
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
    name: "LIMPET STORM",
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
      { beat: 20, col: 0, row: 4, kind: "pod" },
      { beat: 36, col: 5, row: 3, kind: "pod" },
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
