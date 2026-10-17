import type { Wave } from "../wave-types.js";

/**
 * Waves 103 to 112 of the game, in the order they are played: THE CROSSING's
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
      { beat: 6, col: 5, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 12, col: 7, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 18, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 25, col: 7, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 31, col: 5, kind: "meteor", color: null, cross: 1, row: 4 },
    ],
  },
  {
    id: "theCrossingReach",
    name: "OUTER CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 5, col: 4, kind: "meteor", color: null },
      { beat: 10, col: 9, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 15, col: 0, kind: "meteor", color: null },
      { beat: 21, col: 9, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 27, col: 1, kind: "meteor", color: null },
    ],
  },
  {
    id: "theCrossingPair",
    name: "CROSSING AND GLUTTON",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 8, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 8, kind: "glutton", color: "cyan" },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 27, col: 4, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 32, col: 2, color: "cyan" },
      { beat: 37, col: 10, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "theCrossingRecall",
    name: "CROSSING LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 10, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 11, col: 6, color: "red" },
      { beat: 17, col: 0, kind: "torch", color: null },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 27, col: 7, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 33, col: 6, color: "red" },
      { beat: 38, col: 8, kind: "torch", color: null },
    ],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 4, col: 10, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 8, col: 9, color: "red" },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 16, col: 3, kind: "glutton", color: "cyan" },
      { beat: 20, col: 9, color: "red" },
      { beat: 24, col: 6, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 28, col: 2, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 32, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 36, col: 3, kind: "glutton", color: "red" },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 44, col: 5, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 48, col: 10, kind: "meteor", color: null, cross: -1, row: 7 },
    ],
  },
  {
    id: "fillerGaugeBreathe",
    name: "LAZY CROSSING",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 7, col: 1, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 15, col: 5, color: "red" },
      { beat: 23, col: 9, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 31, col: 8, color: "red" },
      { beat: 38, col: 3, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
  },
  {
    id: "fillerGaugeRecall",
    name: "CROSSING REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 10, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 22, col: 4, color: "red" },
      { beat: 27, col: 2, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 33, col: 5, color: "cyan" },
    ],
    pods: [{ beat: 17, col: 5, row: 3, kind: "pod" }],
  },
  {
    id: "fillerGaugeBend",
    name: "CROSSING RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 6, col: 7, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 12, col: 7, color: "red" },
      { beat: 17, col: 3, color: "red" },
      { beat: 23, col: 0, kind: "glutton", color: "red" },
      { beat: 29, col: 5, color: "cyan" },
      { beat: 35, col: 3, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 41, col: 4, color: "cyan" },
      { beat: 41, col: 7, color: "cyan" },
      { beat: 46, col: 7, kind: "glutton", color: "cyan" },
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
