import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 76 to 87 of the game, in the order they are played: THE CROSSING's
 * block, the boss THE MAZE, THE LIMPET's block, the boss THE GAUGE, THE
 * BEATBOX's block, the boss THE FLEET, HOLD TOGETHER's block and the boss THE
 * PLUMB.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_4: Wave[] = [
  {
    id: "theCrossing",
    name: "THE CROSSING",
    hints: "theCrossing",
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
    id: "theCrossingRecall",
    name: "OLD CROSSING SONG",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 20, col: 0, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 25, col: 2, color: "cyan" },
      { beat: 30, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 35, col: 0, color: "red" },
      { beat: 42, col: 9, kind: "meteor", color: null },
      { beat: 48, col: 1, color: "cyan" },
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
  {
    id: "theLimpet",
    name: "THE LIMPET",
    hints: "theLimpet",
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 24, col: 5, kind: "meteor", color: null },
      { beat: 32, col: 5, kind: "meteor", color: null },
      { beat: 46, col: 5, kind: "meteor", color: null },
      { beat: 54, col: 5, kind: "meteor", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
    ],
  },
  {
    id: "theLimpetRecall",
    name: "OLD LIMPET SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 7, kind: "morsel", color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 9, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 23, col: 10, color: "red" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 39, col: 2, kind: "morsel", color: "cyan" },
      { beat: 44, col: 9, color: "cyan" },
    ],
    pods: [{ beat: 29, col: 2, row: 3, kind: "pod" }],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 31, beats: 14 },
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
    id: "theBeatboxRecall",
    name: "BEATBOX LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 2, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 0, color: "red" },
      { beat: 17, col: 4, kind: "morsel", color: "red" },
      { beat: 23, col: 0, color: "red" },
      { beat: 29, col: 7, kind: "beatbox", color: null, beats: 2 },
      { beat: 35, col: 9, color: "red" },
      { beat: 40, col: 3, kind: "torch", color: null },
      { beat: 46, col: 9, color: "red" },
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
    id: "theWeightRecall",
    name: "OLD TOGETHER SONG",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 5, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 7, kind: "meteor", color: null },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 29, col: 0, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 35, col: 1, color: "red" },
      { beat: 41, col: 8, kind: "seeder", color: "red" },
      { beat: 46, col: 5, color: "red" },
    ],
  },
  {
    id: "thePlumb",
    name: "THE PLUMB",
    guide: {
      both: "Each drags a stone. Pull away from the low side, together, until the bob hangs true. Both weights true light the core. Shoot it in its colour.",
      p1: "1. When a weight lights, drag the left stone.\n2. Pull away from the low side. Say how far you are.\n3. One pull is not enough: hold it with the other until the bob is true.\n4. When the core shows a colour, fire it.",
      p2: "1. When a weight lights, drag the right stone.\n2. Pull away from the low side. Say how far you are.\n3. One pull is not enough: hold it with the other until the bob is true.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "plumb",
      steps: [
        { ask: "left", skewMilli: -3000, rangeMilli: 600, color: "either", beats: 6 },
        { ask: "left", skewMilli: 2800, rangeMilli: 400, color: "either", beats: 4 },
        { ask: "right", skewMilli: 3200, rangeMilli: 600, color: "either", beats: 6 },
        { ask: "right", skewMilli: -2800, rangeMilli: 400, color: "either", beats: 4 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "red", beats: 6 },
        { ask: "both", skewMilli: -2800, rangeMilli: 500, color: "either", beats: 3 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "cyan", beats: 6 },
        { ask: "both", skewMilli: 3000, rangeMilli: 450, color: "either", beats: 3 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
