import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 112 to 122 of the game, in the order they are played: the boss THE
 * GEODE, THE CROSSING's block, the filler before THE MAZE and the boss THE
 * MAZE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_7: Wave[] = [
  {
    id: "theGeode",
    name: "THE GEODE",
    guide: {
      both: "A stone falls on the ship, and only the lance cuts it. Burn each crack with a beam in its colour. Each cut breaks a piece in two.",
      p1: "Only you see each crack's colour: say it. Slide the cannon under the crack named, and keep still.",
      p2: "Only you see where each crack is: say where. Hold the colour you hear until the beam goes.",
    },
    entries: [],
    boss: {
      kind: "geode",
      steps: [
        { beats: 20, cracks: [{ at: 2, color: "red" }] },
        {
          beats: 24,
          cracks: [
            { at: -3, color: "cyan" },
            { at: 3, color: "red" },
          ],
        },
        {
          beats: 28,
          cracks: [
            { at: -4, color: "red" },
            { at: 0, color: "cyan" },
            { at: 0, color: "cyan" },
            { at: 4, color: "red" },
          ],
        },
        {
          beats: 22,
          cracks: [
            { at: -1, color: "red" },
            { at: -1, color: "cyan" },
          ],
        },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theCrossing",
    name: "THE CROSSING",
    guide: {
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 5, color: "red" },
      { beat: 16, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 32, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 40, col: 4, color: "red" },
      { beat: 48, col: 8, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 56, col: 3, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theCrossingAgain",
    name: "CROSSING DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 7, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 13, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 19, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 27, col: 4, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "theCrossingReach",
    name: "OUTER CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 6, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 12, col: 8, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 18, col: 1, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 24, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 29, col: 2, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theCrossingPair",
    name: "CROSSING AND SEEDER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 16, col: 5, kind: "seeder", color: "red" },
      { beat: 20, col: 2, color: "red" },
      { beat: 26, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 30, col: 6, color: "red" },
      { beat: 35, col: 5, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theCrossingRecall",
    name: "OLD CROSSING SONG",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 5, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 29, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 35, col: 1, color: "cyan" },
    ],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 1, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 5, col: 9, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 9, col: 0, color: "red" },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 18, col: 8, kind: "seeder", color: "red" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 27, col: 3, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 31, col: 5, color: "red" },
      { beat: 31, col: 8, color: "red" },
      { beat: 36, col: 0, kind: "seeder", color: "red" },
      { beat: 43, col: 9, color: "cyan" },
      { beat: 47, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 47, col: 7, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "fillerMazeBreathe",
    name: "SOFT CROSSING",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 7, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 14, col: 3, color: "red" },
      { beat: 22, col: 4, kind: "meteor", color: null },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 34, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 40, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerMazeRecall",
    name: "CROSSING SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 7, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 17, col: 6, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 28, col: 9, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 34, col: 6, color: "cyan" },
      { beat: 39, col: 7, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
  },
  {
    id: "fillerMazeBend",
    name: "CROSSING RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 6, col: 7, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 17, col: 3, color: "cyan" },
      { beat: 23, col: 1, kind: "seeder", color: "red" },
      { beat: 29, col: 2, color: "red" },
      { beat: 34, col: 9, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 42, col: 0, color: "cyan" },
      { beat: 42, col: 10, color: "cyan" },
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
];
