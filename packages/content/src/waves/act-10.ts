import type { Wave } from "../wave-types.js";

/**
 * Waves 119 to 128 of the game, in the order they are played: THE LIMPET's
 * block and the boss THE FLEET.
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
      { beat: 0, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 8, col: 3, kind: "beatbox", color: null, beats: 4 },
      { beat: 15, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 22, col: 3, kind: "beatbox", color: null, beats: 3 },
      { beat: 28, col: 7, kind: "beatbox", color: null, beats: 2 },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetSpread",
    name: "LIMPET BLOOM",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 5, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 12, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 18, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 23, col: 4, kind: "beatbox", color: null, beats: 2 },
      { beat: 28, col: 9, kind: "beatbox", color: null, beats: 2 },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetReach",
    name: "LIMPET PILGRIM",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "beatbox", color: null, beats: 3 },
      { beat: 6, col: 5, color: "red" },
      { beat: 11, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 17, col: 5, color: "red" },
      { beat: 22, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 27, col: 5, color: "red" },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetPair",
    name: "LIMPET TOGETHER",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 16, col: 4, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 26, col: 3, kind: "morsel", color: "cyan" },
      { beat: 31, col: 2, color: "red" },
      { beat: 37, col: 3, kind: "beatbox", color: null, beats: 4 },
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
      { beat: 0, col: 1, color: "cyan" },
      { beat: 8, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 16, col: 2, color: "cyan" },
      { beat: 24, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 32, col: 3, color: "cyan" },
      { beat: 40, col: 1, kind: "beatbox", color: null, beats: 2 },
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
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 4, kind: "beatbox", color: null, beats: 3 },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 7, kind: "meteor", color: null },
      { beat: 22, col: 9, color: "red" },
      { beat: 27, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 39, col: 8, kind: "meteor", color: null },
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
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 22, col: 5, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 34, col: 3, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 46, col: 4, kind: "beatbox", color: null, beats: 2 },
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
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 8, col: 9, color: "cyan" },
      { beat: 12, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 20, col: 6, kind: "meteor", color: null },
      { beat: 24, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 7, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 36, col: 1, kind: "meteor", color: null },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 44, col: 10, kind: "beatbox", color: null, beats: 3 },
      { beat: 48, col: 4, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
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
