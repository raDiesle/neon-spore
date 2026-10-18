import type { Wave } from "../wave-types.js";

/**
 * Waves 180 to 189 of the game, in the order they are played: THE LIMPET's
 * block, the filler before THE GAUGE and the boss THE GAUGE.
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
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 24, col: 5, kind: "meteor", color: null },
      { beat: 32, col: 5, kind: "meteor", color: null },
      { beat: 46, col: 5, kind: "meteor", color: null },
      { beat: 54, col: 5, kind: "meteor", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "theLimpetAgain",
    name: "LITTLE LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 8, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 15, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 23, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 29, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetReach",
    name: "FAR LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 6, col: 0, kind: "meteor", color: null },
      { beat: 14, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 19, col: 3, kind: "meteor", color: null },
      { beat: 25, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 31, col: 0, kind: "meteor", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "theLimpetPair",
    name: "LIMPET DUET",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 1, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 18, col: 0, kind: "seeder", color: "cyan" },
      { beat: 22, col: 1, color: "red" },
      { beat: 28, col: 2, kind: "magnet", color: "cyan" },
      { beat: 32, col: 3, color: "cyan" },
      { beat: 36, col: 2, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "theLimpetRecall",
    name: "OLD LIMPET SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 5, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 15, col: 4, kind: "echo", color: "cyan" },
      { beat: 20, col: 1, color: "cyan" },
      { beat: 26, col: 5, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 31, col: 8, color: "red" },
      { beat: 37, col: 6, kind: "echo", color: "red" },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "theLimpetPeak",
    name: "LIMPET APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 4, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 0, color: "red" },
      { beat: 16, col: 10, color: "red" },
      { beat: 22, col: 3, kind: "seeder", color: "red" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 31, col: 5, kind: "lure", color: "cyan" },
      { beat: 35, col: 1, color: "red" },
      { beat: 35, col: 9, color: "red" },
      { beat: 39, col: 5, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 43, col: 8, kind: "seeder", color: "red" },
      { beat: 47, col: 3, color: "cyan" },
      { beat: 47, col: 6, color: "cyan" },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "fillerGaugeBreathe",
    name: "LIMPET HUSH",
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 8, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 14, col: 8, color: "cyan" },
      { beat: 20, col: 4, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 36, col: 8, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "fillerGaugeRecall",
    name: "LIMPET SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 6, kind: "shell", color: "red" },
      { beat: 22, col: 5, color: "cyan" },
      { beat: 27, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 32, col: 10, color: "red" },
      { beat: 40, col: 5, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerGaugeBend",
    name: "CROOKED LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 5, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 26, col: 9, kind: "seeder", color: "cyan" },
      { beat: 33, col: 0, color: "red" },
      { beat: 38, col: 5, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 44, col: 4, color: "cyan" },
      { beat: 44, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theGauge",
    name: "THE GAUGE",
    guide: {
      scene: "theGauge",
    },
    entries: [],
    boss: { kind: "gauge" },
    bossType: "special",
    controls: "gauge",
  },
];
