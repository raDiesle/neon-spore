import type { Wave } from "../wave-types.js";

/**
 * Waves 143 to 152 of the game, in the order they are played: THE LIMPET's
 * block, the filler before THE FLEET and the boss THE FLEET.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_10: Wave[] = [
  {
    id: "theLimpet",
    name: "THE LIMPET",
    guide: {
      scene: "theLimpet",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 8, kind: "meteor", color: null },
      { beat: 32, col: 3, kind: "meteor", color: null },
      { beat: 46, col: 0, kind: "meteor", color: null },
      { beat: 54, col: 8, kind: "meteor", color: null },
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
      { beat: 0, col: 4, kind: "weight", color: null },
      { beat: 7, col: 3, kind: "weight", color: null },
      { beat: 14, col: 7, kind: "weight", color: null },
      { beat: 21, col: 5, kind: "weight", color: null },
      { beat: 27, col: 7, kind: "weight", color: null },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetReach",
    name: "FAR LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "weight", color: null },
      { beat: 5, col: 9, color: "red" },
      { beat: 13, col: 5, kind: "weight", color: null },
      { beat: 18, col: 1, color: "red" },
      { beat: 23, col: 5, kind: "weight", color: null },
      { beat: 28, col: 1, color: "red" },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetPair",
    name: "LIMPET DUET",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 10, kind: "weight", color: null },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 16, col: 7, kind: "beatbox", color: null, beats: 3 },
      { beat: 20, col: 4, color: "cyan" },
      { beat: 28, col: 5, color: "red" },
      { beat: 36, col: 4, kind: "weight", color: null },
    ],
    pods: [{ beat: 24, col: 0, row: 3, kind: "pod" }],
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
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 1, kind: "weight", color: null },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 19, col: 8, kind: "morsel", color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 29, col: 2, kind: "weight", color: null },
      { beat: 35, col: 3, color: "red" },
      { beat: 40, col: 2, kind: "morsel", color: "cyan" },
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
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 4, kind: "weight", color: null },
      { beat: 8, col: 5, color: "red" },
      { beat: 12, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 20, col: 1, color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 26, col: 8, kind: "weight", color: null },
      { beat: 31, col: 3, kind: "beatbox", color: null, beats: 3 },
      { beat: 35, col: 3, color: "red" },
      { beat: 35, col: 7, color: "red" },
      { beat: 39, col: 9, kind: "weight", color: null },
      { beat: 43, col: 6, kind: "beatbox", color: null, beats: 3 },
      { beat: 47, col: 1, color: "red" },
      { beat: 47, col: 9, color: "red" },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "fillerFleetBreathe",
    name: "LAZY LIMPET",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 2, kind: "weight", color: null },
      { beat: 14, col: 8, color: "red" },
      { beat: 22, col: 6, kind: "weight", color: null },
      { beat: 28, col: 7, color: "red" },
      { beat: 36, col: 0, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerFleetRecall",
    name: "LIMPET SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 3, kind: "weight", color: null },
      { beat: 12, col: 7, color: "red" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 28, col: 8, kind: "weight", color: null },
      { beat: 33, col: 2, color: "cyan" },
    ],
    pods: [{ beat: 17, col: 1, row: 3, kind: "pod" }],
  },
  {
    id: "fillerFleetBend",
    name: "LIMPET TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 1, kind: "weight", color: null },
      { beat: 12, col: 4, color: "red" },
      { beat: 17, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 22, col: 5, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 9, kind: "weight", color: null },
      { beat: 33, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 43, col: 3, kind: "weight", color: null },
    ],
  },
  {
    id: "theFleet",
    name: "THE FLEET",
    guide: {
      scene: "theFleet",
    },
    entries: [],
    boss: {
      kind: "fleet",
      ships: [
        { col: 1, row: 1, len: 5, dir: "h" },
        { col: 8, row: 0, len: 4, dir: "v" },
        { col: 3, row: 5, len: 3, dir: "h" },
        { col: 0, row: 6, len: 3, dir: "v" },
        { col: 7, row: 8, len: 2, dir: "h" },
      ],
    },
    bossType: "special",
    controls: "fleet",
  },
];
