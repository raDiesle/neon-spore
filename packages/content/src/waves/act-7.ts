import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 167 to 178 of the game, in the order they are played: the filler before
 * THE MAZE, the boss THE MAZE, THE LIMPET's block, the filler before THE GAUGE
 * and the boss THE GAUGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_7: Wave[] = [
  {
    id: "fillerMazeBreathe",
    name: "SOFT MAZE",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 13, col: 9, color: "red" },
      { beat: 19, col: 4, kind: "seeder", color: "red" },
      { beat: 26, col: 9, color: "red" },
      { beat: 39, col: 4, color: "red" },
    ],
    pods: [
      { beat: 7, col: 4, row: 3, kind: "pod" },
      { beat: 32, col: 8, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerMazeRecall",
    name: "OLD MAZE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 3, kind: "throb", color: "red" },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 17, col: 7, kind: "magnet", color: "red" },
      { beat: 23, col: 5, color: "red" },
      { beat: 28, col: 0, kind: "seeder", color: "cyan" },
      { beat: 35, col: 10, color: "cyan" },
    ],
  },
  {
    id: "fillerMazeBend",
    name: "MAZE RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 16, col: 5, kind: "seeder", color: "red" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 27, col: 1, kind: "throb", color: "red" },
      { beat: 37, col: 3, color: "cyan" },
      { beat: 37, col: 6, color: "cyan" },
      { beat: 43, col: 7, kind: "seeder", color: "red" },
      { beat: 48, col: 5, kind: "throb", color: "red" },
    ],
    pods: [
      { beat: 5, col: 10, row: 3, kind: "pod" },
      { beat: 32, col: 4, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theMaze",
    name: "THE MAZE",
    guide: {
      scene: "theMaze",
    },
    entries: [],
    boss: { kind: "maze", rounds: MAZE_ROUNDS },
    bossType: "special",
    controls: "standard5",
  },
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
    id: "theLimpetPair",
    name: "LIMPET DUET",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 3, kind: "seeder", color: "red" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 17, col: 8, kind: "meteor", color: null },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 26, col: 5, kind: "torch", color: null },
      { beat: 30, col: 6, color: "cyan" },
      { beat: 36, col: 2, kind: "seeder", color: "cyan" },
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
      { beat: 0, col: 4, color: "cyan" },
      { beat: 11, col: 0, color: "red" },
      { beat: 17, col: 1, kind: "countdown", color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 29, col: 0, kind: "rind", color: "cyan" },
      { beat: 37, col: 6, color: "red" },
    ],
    pods: [{ beat: 6, col: 3, row: 4, kind: "husk" }],
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
      { beat: 0, col: 8, color: "cyan" },
      { beat: 3, col: 0, kind: "torch", color: null },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 21, col: 0, color: "red" },
      { beat: 21, col: 10, color: "red" },
      { beat: 27, col: 2, kind: "throb", color: "red" },
      { beat: 31, col: 5, kind: "torch", color: null },
      { beat: 36, col: 0, color: "red" },
      { beat: 36, col: 10, color: "red" },
      { beat: 45, col: 3, kind: "throb", color: "red" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 14, col: 1, row: 3, kind: "pod" },
      { beat: 41, col: 6, row: 3, kind: "pod" },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "fillerGaugeBreathe",
    name: "GAUGE HUSH",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 9, kind: "morsel", color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 20, col: 4, kind: "rind", color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 35, col: 6, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "fillerGaugeRecall",
    name: "GAUGE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 3, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 18, col: 10, kind: "recoil", color: "red" },
      { beat: 24, col: 1, color: "red" },
      { beat: 32, col: 2, kind: "magnet", color: "cyan" },
      { beat: 38, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerGaugeBend",
    name: "CROOKED GAUGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 3, kind: "countdown", color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 3, kind: "echo", color: "cyan" },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 0, kind: "morsel", color: "red" },
      { beat: 34, col: 7, kind: "countdown", color: "cyan" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 2, kind: "echo", color: "red" },
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
