import type { Wave } from "../wave-types.js";

/**
 * Waves 123 to 132 of the game, in the order they are played: THE BEATBOX's
 * block, the filler before THE GAUGE and the boss THE GAUGE.
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
      { beat: 28, col: 0, kind: "morsel", color: "cyan" },
      { beat: 34, col: 8, color: "red" },
      { beat: 40, col: 7, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theBeatboxRecall",
    name: "BEATBOX LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 14, col: 8, color: "red" },
      { beat: 19, col: 10, kind: "beatbox", color: null, beats: 3 },
      { beat: 26, col: 0, color: "red" },
      { beat: 33, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 38, col: 7, color: "red" },
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
      { beat: 23, col: 3, kind: "morsel", color: "cyan" },
      { beat: 27, col: 1, kind: "beatbox", color: null, beats: 3 },
      { beat: 31, col: 2, color: "red" },
      { beat: 31, col: 8, color: "red" },
      { beat: 35, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 43, col: 7, kind: "morsel", color: "cyan" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerGaugeBreathe",
    name: "BEATBOX HUSH",
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 7, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 15, col: 5, color: "red" },
      { beat: 23, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 31, col: 4, color: "red" },
      { beat: 38, col: 1, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "fillerGaugeRecall",
    name: "BEATBOX SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 4, kind: "beatbox", color: null, beats: 2 },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 16, col: 1, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 28, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 34, col: 7, color: "red" },
      { beat: 40, col: 10, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
  },
  {
    id: "fillerGaugeBend",
    name: "CROOKED BEATBOX",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 10, kind: "beatbox", color: null, beats: 4 },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 18, col: 4, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 24, col: 5, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 29, col: 10, kind: "beatbox", color: null, beats: 4 },
      { beat: 35, col: 1, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 43, col: 1, color: "cyan" },
      { beat: 43, col: 9, color: "cyan" },
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
