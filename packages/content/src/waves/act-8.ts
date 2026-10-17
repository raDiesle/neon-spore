import type { Wave } from "../wave-types.js";

/**
 * Waves 123 to 132 of the game, in the order they are played: THE CROSSING's
 * block, the filler before THE GAUGE and the boss THE GAUGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_8: Wave[] = [
  {
    id: "theCrossing",
    name: "THE CROSSING",
    guide: {
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 5, color: "red" },
      { beat: 16, col: 10, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 32, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 40, col: 2, color: "red" },
      { beat: 48, col: 10, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 56, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theCrossingAgain",
    name: "CROSSING DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 7, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 14, col: 7, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 21, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 29, col: 5, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
  },
  {
    id: "theCrossingReach",
    name: "OUTER CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 7, col: 0, kind: "meteor", color: null },
      { beat: 14, col: 9, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 20, col: 5, kind: "meteor", color: null },
      { beat: 26, col: 9, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 32, col: 4, kind: "meteor", color: null },
    ],
  },
  {
    id: "theCrossingPair",
    name: "CROSSING AND GLUTTON",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 8, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 12, col: 3, color: "red" },
      { beat: 17, col: 1, kind: "glutton", color: "red" },
      { beat: 23, col: 0, color: "red" },
      { beat: 33, col: 2, color: "red" },
      { beat: 38, col: 3, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
    pods: [{ beat: 28, col: 1, row: 3, kind: "pod" }],
  },
  {
    id: "theCrossingRecall",
    name: "OLD CROSSING SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 0, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 19, col: 1, kind: "morsel", color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 30, col: 2, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 35, col: 0, color: "cyan" },
    ],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 4, col: 3, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 4, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 8, col: 8, color: "cyan" },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 16, col: 7, kind: "glutton", color: "red" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 25, col: 6, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 29, col: 2, color: "cyan" },
      { beat: 29, col: 8, color: "cyan" },
      { beat: 33, col: 1, kind: "glutton", color: "red" },
      { beat: 41, col: 4, color: "cyan" },
      { beat: 45, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 45, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
  },
  {
    id: "fillerGaugeBreathe",
    name: "CROSSING HUSH",
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 8, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 14, col: 8, color: "cyan" },
      { beat: 20, col: 4, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 36, col: 8, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "fillerGaugeRecall",
    name: "CROSSING SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 10, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 23, col: 3, color: "red" },
      { beat: 29, col: 9, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 35, col: 8, color: "red" },
    ],
    pods: [{ beat: 18, col: 4, row: 3, kind: "pod" }],
  },
  {
    id: "fillerGaugeBend",
    name: "CROOKED CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 2, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 5, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 26, col: 9, kind: "glutton", color: "red" },
      { beat: 33, col: 0, color: "red" },
      { beat: 38, col: 5, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 44, col: 4, color: "cyan" },
      { beat: 44, col: 7, color: "cyan" },
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
