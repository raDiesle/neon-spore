import { SNAKE_ROUNDS } from "../snake-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 143 to 152 of the game, in the order they are played: THE LIMPET's
 * block, the filler before SNAKE and the boss SNAKE.
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
      { beat: 0, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 7, col: 3, kind: "beatbox", color: null, beats: 4 },
      { beat: 14, col: 7, kind: "beatbox", color: null, beats: 3 },
      { beat: 21, col: 5, kind: "beatbox", color: null, beats: 3 },
      { beat: 27, col: 7, kind: "beatbox", color: null, beats: 2 },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetReach",
    name: "FAR LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 5, col: 9, color: "red" },
      { beat: 13, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 18, col: 1, color: "red" },
      { beat: 23, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 28, col: 1, color: "red" },
    ],
    faults: [{ kind: "limpet", at: 6, beats: 12 }],
  },
  {
    id: "theLimpetPair",
    name: "LIMPET DUET",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 6, color: "red" },
      { beat: 16, col: 7, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 34, col: 2, color: "red" },
      { beat: 38, col: 1, kind: "beatbox", color: null, beats: 3 },
    ],
    pods: [{ beat: 28, col: 4, row: 3, kind: "pod" }],
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
      { beat: 7, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 19, col: 8, kind: "morsel", color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 29, col: 2, kind: "beatbox", color: null, beats: 3 },
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
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 10, kind: "beatbox", color: null, beats: 4 },
      { beat: 8, col: 9, color: "red" },
      { beat: 13, col: 3, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 18, col: 1, color: "cyan" },
      { beat: 18, col: 9, color: "cyan" },
      { beat: 22, col: 6, kind: "torch", color: null },
      { beat: 26, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 30, col: 2, color: "red" },
      { beat: 30, col: 8, color: "red" },
      { beat: 38, col: 1, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 42, col: 3, kind: "torch", color: null },
      { beat: 48, col: 0, color: "red" },
      { beat: 48, col: 10, color: "red" },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "fillerSnakeBreathe",
    name: "LAZY LIMPET",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 8, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 16, col: 4, color: "red" },
      { beat: 23, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 31, col: 6, color: "red" },
      { beat: 39, col: 3, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "fillerSnakeRecall",
    name: "ANCIENT LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 10, kind: "beatbox", color: null, beats: 3 },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 18, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 29, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 37, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerSnakeBend",
    name: "CROOKED LIMPET",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 19, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 25, col: 2, color: "cyan" },
      { beat: 25, col: 8, color: "cyan" },
      { beat: 31, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 37, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 42, col: 1, color: "cyan" },
      { beat: 42, col: 9, color: "cyan" },
      { beat: 48, col: 9, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "snake",
    name: "SNAKE",
    guide: {
      scene: "snake",
    },
    entries: [],
    boss: { kind: "snake", rounds: SNAKE_ROUNDS },
    bossType: "special",
    controls: "snake",
  },
];
