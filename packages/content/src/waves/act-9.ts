import type { Wave } from "../wave-types.js";

/**
 * Waves 133 to 142 of the game, in the order they are played: THE BEATBOX's
 * block, the filler before THE FLEET and the boss THE FLEET.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_9: Wave[] = [
  {
    id: "theBeatbox",
    name: "THE BEATBOX",
    guide: {
      scene: "theBeatbox",
    },
    entries: [
      { beat: 0, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 24, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 32, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 48, col: 8, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "theBeatboxAgain",
    name: "HELLO BEATBOX",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 6, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 13, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 21, col: 4, kind: "beatbox", color: null, beats: 2 },
      { beat: 27, col: 7, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "theBeatboxReach",
    name: "BEATBOX VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 5, col: 5, color: "red" },
      { beat: 10, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 16, col: 4, color: "red" },
      { beat: 22, col: 0, kind: "beatbox", color: null, beats: 4 },
      { beat: 27, col: 5, color: "red" },
    ],
  },
  {
    id: "theBeatboxPair",
    name: "BEATBOX PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 16, col: 10, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 22, col: 5, color: "cyan" },
      { beat: 28, col: 0, kind: "seeder", color: "red" },
      { beat: 34, col: 8, color: "red" },
      { beat: 40, col: 7, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theBeatboxRecall",
    name: "BEATBOX LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 20, col: 10, kind: "beatbox", color: null, beats: 4 },
      { beat: 28, col: 4, color: "cyan" },
      { beat: 33, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 38, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theBeatboxPeak",
    name: "BEATBOX ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 4, kind: "beatbox", color: null, beats: 2 },
      { beat: 8, col: 1, color: "cyan" },
      { beat: 13, col: 7, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 19, col: 0, color: "red" },
      { beat: 19, col: 10, color: "red" },
      { beat: 23, col: 3, kind: "seeder", color: "red" },
      { beat: 27, col: 1, kind: "beatbox", color: null, beats: 3 },
      { beat: 31, col: 2, color: "red" },
      { beat: 31, col: 8, color: "red" },
      { beat: 35, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 43, col: 7, kind: "seeder", color: "red" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerFleetBreathe",
    name: "LAZY BEATBOX",
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 8, col: 2, kind: "beatbox", color: null, beats: 3 },
      { beat: 15, col: 1, color: "cyan" },
      { beat: 21, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 35, col: 8, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "fillerFleetRecall",
    name: "BEATBOX SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 0, color: "red" },
      { beat: 17, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 23, col: 3, color: "red" },
      { beat: 29, col: 5, kind: "beatbox", color: null, beats: 3 },
      { beat: 34, col: 9, color: "red" },
      { beat: 40, col: 5, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "fillerFleetBend",
    name: "BEATBOX TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 0, kind: "beatbox", color: null, beats: 4 },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 19, col: 4, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 25, col: 2, color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 31, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 36, col: 1, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 47, col: 4, kind: "beatbox", color: null, beats: 2 },
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
