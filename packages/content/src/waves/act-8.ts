import type { Wave } from "../wave-types.js";

/**
 * Waves 178 to 189 of the game, in the order they are played: THE BEATBOX's
 * block, the filler before THE FLEET, the boss THE FLEET and HOLD TOGETHER's
 * block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_8: Wave[] = [
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
    id: "theBeatboxPair",
    name: "BEATBOX PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 14, col: 1, color: "cyan" },
      { beat: 20, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 26, col: 4, color: "red" },
      { beat: 31, col: 8, kind: "beatbox", color: null, beats: 2 },
      { beat: 37, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theBeatboxRecall",
    name: "BEATBOX LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 19, col: 0, kind: "throb", color: "red" },
      { beat: 26, col: 10, color: "red" },
      { beat: 32, col: 3, kind: "beatbox", color: null, beats: 2 },
      { beat: 37, col: 5, color: "red" },
    ],
  },
  {
    id: "theBeatboxPeak",
    name: "BEATBOX ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 8, col: 7, color: "red" },
      { beat: 12, col: 9, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 17, col: 4, color: "red" },
      { beat: 17, col: 7, color: "red" },
      { beat: 21, col: 10, kind: "beatbox", color: null, beats: 4 },
      { beat: 29, col: 6, kind: "torch", color: null },
      { beat: 34, col: 1, color: "cyan" },
      { beat: 34, col: 9, color: "cyan" },
      { beat: 38, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 42, col: 2, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 45, col: 3, color: "red" },
      { beat: 45, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerFleetBreathe",
    name: "LAZY FLEET",
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 7, col: 2, kind: "countdown", color: "cyan" },
      { beat: 13, col: 3, color: "cyan" },
      { beat: 19, col: 9, kind: "shell", color: "cyan" },
      { beat: 27, col: 6, color: "cyan" },
      { beat: 33, col: 2, kind: "seeder", color: "red" },
      { beat: 39, col: 9, color: "cyan" },
    ],
  },
  {
    id: "fillerFleetRecall",
    name: "FLEET SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 0, kind: "blister", color: null, row: 3 },
      { beat: 11, col: 9, color: "red" },
      { beat: 19, col: 1, kind: "gyre", color: null },
      { beat: 25, col: 7, color: "red" },
      { beat: 30, col: 6, kind: "shell", color: "red" },
      { beat: 36, col: 10, color: "cyan" },
    ],
  },
  {
    id: "fillerFleetBend",
    name: "FLEET TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 9, kind: "gyre", color: null },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 27, col: 5, kind: "morsel", color: "red" },
      { beat: 33, col: 0, kind: "gyre", color: null },
      { beat: 38, col: 5, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 43, col: 8, kind: "meteor", color: null },
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
  {
    id: "theWeight",
    name: "HOLD TOGETHER",
    guide: {
      scene: "holdTogether",
    },
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 14, col: 8, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 22, col: 3, color: "red" },
      { beat: 34, col: 2, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 42, col: 10, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
    ],
  },
  {
    id: "theWeightPair",
    name: "TOGETHER DUET",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 9, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 17, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 21, col: 0, color: "red" },
      { beat: 26, col: 8, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 38, col: 7, kind: "torch", color: null },
    ],
  },
  {
    id: "theWeightRecall",
    name: "OLD TOGETHER SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 2, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 0, kind: "magnet", color: "cyan" },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 30, col: 1, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 35, col: 0, color: "cyan" },
      { beat: 40, col: 3, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theWeightPeak",
    name: "TOGETHER STORM",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 3, col: 2, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 6, col: 1, color: "cyan" },
      { beat: 9, col: 8, kind: "beatbox", color: null, beats: 2 },
      { beat: 17, col: 0, color: "red" },
      { beat: 17, col: 10, color: "red" },
      { beat: 22, col: 5, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 26, col: 8, kind: "magnet", color: "red" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 32, col: 9, color: "cyan" },
      { beat: 39, col: 10, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 46, col: 0, kind: "beatbox", color: null, beats: 4 },
    ],
  },
];
