import { SNAKE_ROUNDS } from "../snake-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-4-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_4_P3: Wave[] = [
  {
    id: "theGhostPair",
    name: "GHOST AND WISP",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 9, kind: "ghost", color: "cyan", path: "across" },
      { beat: 10, col: 7, color: "red" },
      { beat: 15, col: 3, kind: "wisp", color: null },
      { beat: 20, col: 9, color: "cyan" },
      { beat: 24, col: 0, kind: "shell", color: "cyan" },
      { beat: 30, col: 10, color: "cyan" },
      { beat: 35, col: 8, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "theGhostBreathe",
    name: "EASY GHOSTS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 8, col: 4, kind: "ghost", color: "cyan", path: "across" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 22, col: 6, kind: "meteor", color: null },
      { beat: 30, col: 10, color: "cyan" },
      { beat: 37, col: 2, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "theGhostRecall",
    name: "GHOST RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 10, kind: "ghost", color: "cyan" },
      { beat: 11, col: 1, color: "red" },
      { beat: 17, col: 8, kind: "shell", color: "cyan" },
      { beat: 23, col: 7, color: "red" },
      { beat: 28, col: 5, kind: "ghost", color: "red" },
      { beat: 33, col: 8, color: "cyan" },
      { beat: 38, col: 6, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theGhostBend",
    name: "GHOSTS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 4, kind: "ghost", color: "cyan", path: "across" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 0, kind: "wisp", color: null },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 2, kind: "ghost", color: "red" },
      { beat: 33, col: 9, kind: "wisp", color: null },
      { beat: 38, col: 4, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 43, col: 1, kind: "ghost", color: "red" },
    ],
  },
  {
    id: "theGhostPeak",
    name: "GHOST PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 9, kind: "ghost", color: "red" },
      { beat: 8, col: 10, color: "red" },
      { beat: 12, col: 5, kind: "wisp", color: null },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 6, color: "red" },
      { beat: 24, col: 6, kind: "ghost", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 5, kind: "wisp", color: null },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 44, col: 10, kind: "ghost", color: "red" },
      { beat: 48, col: 9, kind: "wisp", color: null },
    ],
    pods: [
      { beat: 20, col: 3, row: 3, kind: "purge" },
      { beat: 36, col: 1, row: 3, kind: "purge" },
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
