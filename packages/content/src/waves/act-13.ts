import { SNAKE_ROUNDS } from "../snake-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 230 to 239 of the game, in the order they are played: THE VEER's block,
 * the filler before SNAKE and the boss SNAKE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_13: Wave[] = [
  {
    id: "theVeer",
    name: "THE VEER",
    guide: {
      scene: "theVeer",
    },
    entries: [
      { beat: 0, col: 5, kind: "veer", color: null },
      { beat: 18, col: 8, kind: "veer", color: null },
      { beat: 34, col: 3, kind: "veer", color: null },
      { beat: 42, col: 10, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerAgain",
    name: "VEER AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "veer", color: null },
      { beat: 8, col: 7, kind: "veer", color: null },
      { beat: 15, col: 4, kind: "veer", color: null },
      { beat: 23, col: 6, kind: "veer", color: null },
      { beat: 29, col: 3, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerReach",
    name: "LONG VEER ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "veer", color: null },
      { beat: 6, col: 5, kind: "meteor", color: null },
      { beat: 11, col: 1, kind: "veer", color: null },
      { beat: 17, col: 6, kind: "meteor", color: null },
      { beat: 22, col: 2, kind: "veer", color: null },
      { beat: 27, col: 6, kind: "meteor", color: null },
    ],
  },
  {
    id: "theVeerPair",
    name: "VEER AND HEAVY ROCK",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 10, kind: "veer", color: null },
      { beat: 10, col: 1, color: "red" },
      { beat: 18, col: 6, kind: "meteorMedium", color: null },
      { beat: 23, col: 1, color: "cyan" },
      { beat: 27, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 33, col: 9, color: "red" },
      { beat: 39, col: 10, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerRecall",
    name: "VEER REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 13, col: 0, color: "red" },
      { beat: 19, col: 8, kind: "dart", color: "cyan" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 31, col: 0, kind: "veer", color: null },
      { beat: 38, col: 10, color: "red" },
    ],
  },
  {
    id: "theVeerPeak",
    name: "VEER APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 10, kind: "veer", color: null },
      { beat: 8, col: 9, color: "red" },
      { beat: 11, col: 4, kind: "meteorMedium", color: null },
      { beat: 19, col: 2, color: "cyan" },
      { beat: 19, col: 8, color: "cyan" },
      { beat: 22, col: 0, kind: "recoil", color: "red" },
      { beat: 28, col: 7, kind: "veer", color: null },
      { beat: 34, col: 0, color: "red" },
      { beat: 34, col: 10, color: "red" },
      { beat: 38, col: 1, kind: "meteorMedium", color: null },
      { beat: 44, col: 8, kind: "recoil", color: "red" },
    ],
  },
  {
    id: "fillerSnakeBreathe",
    name: "LAZY VEER",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 20, col: 4, kind: "veer", color: null },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 35, col: 4, kind: "veer", color: null },
    ],
  },
  {
    id: "fillerSnakeRecall",
    name: "ANCIENT VEER",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 6, kind: "veer", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 16, col: 5, kind: "seeder", color: "cyan" },
      { beat: 21, col: 6, color: "red" },
      { beat: 27, col: 7, kind: "veer", color: null },
      { beat: 33, col: 4, color: "cyan" },
      { beat: 38, col: 9, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "fillerSnakeBend",
    name: "CROOKED VEER",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 8, kind: "veer", color: null },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 17, col: 4, kind: "meteorMedium", color: null },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 28, col: 5, kind: "veer", color: null },
      { beat: 33, col: 1, kind: "meteorMedium", color: null },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 6, color: "red" },
      { beat: 44, col: 3, kind: "veer", color: null },
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
