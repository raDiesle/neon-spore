import { SNAKE_ROUNDS } from "../snake-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 142 to 151 of the game, in the order they are played: HEAVY ROCKS's
 * block, the filler before SNAKE and the boss SNAKE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_12: Wave[] = [
  {
    id: "theWard",
    name: "HEAVY ROCKS",
    guide: {
      scene: "theWard",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 8, col: 4, kind: "meteorMedium", color: null },
      { beat: 16, col: 7, kind: "meteorFast", color: null },
      { beat: 24, col: 3, kind: "meteorFaster", color: null },
      { beat: 32, col: 9, kind: "meteorFastest", color: null },
    ],
  },
  {
    id: "theWardAgain",
    name: "HEAVY ROCK RISING",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "meteorMedium", color: null },
      { beat: 8, col: 4, kind: "meteorMedium", color: null },
      { beat: 16, col: 3, kind: "meteorMedium", color: null },
      { beat: 24, col: 7, kind: "meteorMedium", color: null },
      { beat: 31, col: 3, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardReach",
    name: "LONG HEAVY ROCK ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "meteorMedium", color: null },
      { beat: 7, col: 10, kind: "meteor", color: null },
      { beat: 13, col: 5, kind: "meteorMedium", color: null },
      { beat: 18, col: 10, kind: "meteor", color: null },
      { beat: 25, col: 0, kind: "meteorMedium", color: null },
      { beat: 32, col: 9, kind: "meteor", color: null },
    ],
  },
  {
    id: "theWardPair",
    name: "HEAVY ROCK PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 9, kind: "meteorMedium", color: null },
      { beat: 11, col: 4, color: "red" },
      { beat: 17, col: 6, kind: "weight", color: null },
      { beat: 22, col: 9, color: "red" },
      { beat: 26, col: 5, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 32, col: 4, color: "cyan" },
      { beat: 38, col: 7, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardRecall",
    name: "HEAVY ROCK REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 5, kind: "meteorMedium", color: null },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 4, kind: "morsel", color: "red" },
      { beat: 22, col: 5, color: "red" },
      { beat: 28, col: 2, kind: "meteorMedium", color: null },
      { beat: 34, col: 10, color: "red" },
      { beat: 39, col: 0, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "theWardPeak",
    name: "HEAVY ROCK OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 2, kind: "meteorMedium", color: null },
      { beat: 4, col: 8, kind: "meteorMedium", color: null },
      { beat: 8, col: 5, color: "red" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 16, col: 0, kind: "weight", color: null },
      { beat: 24, col: 4, color: "cyan" },
      { beat: 28, col: 6, kind: "glutton", color: "red" },
      { beat: 32, col: 0, color: "cyan" },
      { beat: 32, col: 10, color: "cyan" },
      { beat: 39, col: 1, kind: "meteorMedium", color: null },
      { beat: 43, col: 2, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerSnakeBreathe",
    name: "HEAVY ROCK PICNIC",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 0, kind: "meteorMedium", color: null },
      { beat: 14, col: 5, color: "red" },
      { beat: 20, col: 6, kind: "meteorMedium", color: null },
      { beat: 26, col: 3, color: "red" },
      { beat: 34, col: 1, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "fillerSnakeRecall",
    name: "HEAVY ROCK MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 9, kind: "meteorMedium", color: null },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 17, col: 1, kind: "meteorMedium", color: null },
      { beat: 25, col: 2, color: "cyan" },
      { beat: 31, col: 10, kind: "meteorMedium", color: null },
      { beat: 36, col: 7, color: "cyan" },
    ],
  },
  {
    id: "fillerSnakeBend",
    name: "HEAVY ROCK TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 4, kind: "meteorMedium", color: null },
      { beat: 6, col: 7, kind: "meteorMedium", color: null },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 17, col: 4, color: "cyan" },
      { beat: 22, col: 0, kind: "weight", color: null },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 33, col: 5, kind: "meteorMedium", color: null },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 7, color: "cyan" },
      { beat: 43, col: 5, kind: "weight", color: null },
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
