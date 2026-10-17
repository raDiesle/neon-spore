import type { Wave } from "../wave-types.js";

/**
 * Waves 109 to 118 of the game, in the order they are played: THE BEATBOX's
 * block and the boss THE WARDEN.
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
    id: "theBeatboxSpread",
    name: "BEATBOX DRIFT",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 5, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 10, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 16, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 21, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 27, col: 3, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theBeatboxReach",
    name: "BEATBOX AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 6, col: 5, kind: "meteor", color: null },
      { beat: 12, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 18, col: 5, kind: "meteor", color: null },
      { beat: 23, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 29, col: 5, kind: "meteor", color: null },
    ],
  },
  {
    id: "theBeatboxPair",
    name: "BEATBOX ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 2, kind: "beatbox", color: null, beats: 3 },
      { beat: 9, col: 5, color: "red" },
      { beat: 15, col: 8, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 21, col: 6, color: "red" },
      { beat: 32, col: 1, color: "red" },
      { beat: 37, col: 2, kind: "beatbox", color: null, beats: 2 },
    ],
    pods: [{ beat: 26, col: 9, row: 3, kind: "pod" }],
  },
  {
    id: "theBeatboxBreathe",
    name: "SLEEPY BEATBOX",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 8, col: 4, kind: "beatbox", color: null, beats: 2 },
      { beat: 14, col: 3, color: "red" },
      { beat: 21, col: 9, kind: "meteor", color: null },
      { beat: 29, col: 3, color: "red" },
      { beat: 36, col: 4, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theBeatboxRecall",
    name: "OLD BEATBOX SONG",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 4, kind: "beatbox", color: null, beats: 2 },
      { beat: 10, col: 2, color: "red" },
      { beat: 15, col: 4, kind: "torch", color: null },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 26, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 32, col: 3, color: "red" },
      { beat: 38, col: 8, kind: "torch", color: null },
    ],
  },
  {
    id: "theBeatboxBend",
    name: "BEATBOX SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 8, kind: "beatbox", color: null, beats: 2 },
      { beat: 11, col: 6, color: "red" },
      { beat: 16, col: 1, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 27, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 32, col: 0, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 37, col: 3, color: "cyan" },
      { beat: 37, col: 7, color: "cyan" },
      { beat: 43, col: 5, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theBeatboxPeak",
    name: "BEATBOX RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 4, kind: "beatbox", color: null, beats: 4 },
      { beat: 8, col: 10, color: "red" },
      { beat: 12, col: 5, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 20, col: 7, kind: "beatbox", color: null, beats: 3 },
      { beat: 24, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 32, col: 0, kind: "beatbox", color: null, beats: 3 },
      { beat: 36, col: 10, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 6, color: "cyan" },
      { beat: 44, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 48, col: 10, kind: "meteor", color: null, cross: 1, row: 4 },
    ],
  },
  {
    id: "theWarden",
    name: "THE WARDEN",
    guide: {
      scene: "theWarden",
    },
    entries: [],
    boss: { kind: "warden" },
    bossType: "normal",
    controls: "standard5",
  },
];
