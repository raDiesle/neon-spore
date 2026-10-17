import type { Wave } from "../wave-types.js";

/**
 * Waves 123 to 132 of the game, in the order they are played: THE LIMPET's
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
      { beat: 0, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 8, col: 3, kind: "beatbox", color: null, beats: 4 },
      { beat: 15, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 22, col: 3, kind: "beatbox", color: null, beats: 3 },
      { beat: 28, col: 7, kind: "beatbox", color: null, beats: 2 },
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
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 8, col: 7, color: "red" },
      { beat: 13, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 19, col: 7, color: "cyan" },
      { beat: 23, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 28, col: 7, color: "red" },
      { beat: 33, col: 5, kind: "meteor", color: null, cross: 1, row: 4 },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "theLimpetRecall",
    name: "LIMPET RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 3, color: "red" },
      { beat: 16, col: 8, kind: "torch", color: null },
      { beat: 22, col: 3, color: "red" },
      { beat: 28, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 33, col: 5, color: "red" },
      { beat: 38, col: 7, kind: "torch", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "theLimpetPeak",
    name: "LIMPET STORM",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 6, kind: "beatbox", color: null, beats: 3 },
      { beat: 8, col: 1, color: "red" },
      { beat: 12, col: 7, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 16, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 24, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 32, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 44, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 48, col: 9, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
    pods: [
      { beat: 20, col: 3, row: 4, kind: "husk" },
      { beat: 36, col: 9, row: 4, kind: "husk" },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "fillerFleetBreathe",
    name: "SLEEPY LIMPET",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 14, col: 9, color: "red" },
      { beat: 20, col: 10, kind: "beatbox", color: null, beats: 4 },
      { beat: 28, col: 7, color: "red" },
      { beat: 35, col: 8, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "fillerFleetRecall",
    name: "OLD LIMPET SONG",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 9, kind: "beatbox", color: null, beats: 3 },
      { beat: 11, col: 7, color: "red" },
      { beat: 16, col: 0, kind: "morsel", color: "red" },
      { beat: 21, col: 4, color: "red" },
      { beat: 27, col: 5, kind: "beatbox", color: null, beats: 3 },
      { beat: 32, col: 3, color: "red" },
      { beat: 37, col: 10, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "fillerFleetBend",
    name: "LIMPET SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 4, color: "red" },
      { beat: 17, col: 7, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 22, col: 5, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 33, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 43, col: 3, kind: "beatbox", color: null, beats: 2 },
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
