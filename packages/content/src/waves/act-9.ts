import type { Wave } from "../wave-types.js";

/**
 * Waves 191 to 201 of the game, in the order they are played: the filler before
 * THE PLUMB, the boss THE PLUMB, THE LEECH's block and the filler before THE
 * LAMPREY.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_9: Wave[] = [
  {
    id: "fillerPlumbBreathe",
    name: "LAZY PLUMB",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 7, col: 0, kind: "morsel", color: "red" },
      { beat: 13, col: 6, color: "red" },
      { beat: 26, col: 1, color: "cyan" },
      { beat: 33, col: 7, kind: "torch", color: null },
      { beat: 39, col: 5, color: "cyan" },
    ],
    pods: [{ beat: 19, col: 10, row: 4, kind: "husk" }],
  },
  {
    id: "fillerPlumbRecall",
    name: "PLUMB REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 9, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 28, col: 6, kind: "morsel", color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 38, col: 0, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "fillerPlumbBend",
    name: "PLUMB MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 4, kind: "rind", color: "cyan" },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 31, col: 10, kind: "magnet", color: "cyan" },
      { beat: 36, col: 5, kind: "rind", color: "red" },
      { beat: 42, col: 2, color: "red" },
      { beat: 42, col: 8, color: "red" },
    ],
    pods: [{ beat: 18, col: 0, row: 4, kind: "husk" }],
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
  {
    id: "theLeech",
    name: "THE LEECH",
    guide: {
      scene: "theLeech",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 22, col: 5, color: "red" },
      { beat: 30, col: 6, color: "cyan" },
      { beat: 38, col: 5, color: "red" },
      { beat: 52, col: 6, color: "cyan" },
      { beat: 60, col: 5, color: "red" },
    ],
    faults: [
      { kind: "leech", at: 12, beats: 12 },
      { kind: "leech", at: 44, beats: 16 },
    ],
  },
  {
    id: "theLeechPair",
    name: "LEECH DUET",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 20, col: 8, color: "red" },
      { beat: 24, col: 9, kind: "torch", color: null },
      { beat: 30, col: 10, color: "red" },
      { beat: 36, col: 3, kind: "beatbox", color: null, beats: 3 },
    ],
    pods: [{ beat: 16, col: 6, row: 4, kind: "husk" }],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "theLeechRecall",
    name: "LEECH SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 9, kind: "morsel", color: "red" },
      { beat: 12, col: 0, color: "cyan" },
      { beat: 20, col: 9, kind: "countdown", color: "red" },
      { beat: 26, col: 8, color: "red" },
      { beat: 31, col: 6, kind: "shell", color: "cyan" },
      { beat: 37, col: 9, color: "red" },
    ],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "theLeechPeak",
    name: "LEECH THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 5, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 4, col: 8, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 8, col: 7, color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 16, col: 6, kind: "morsel", color: "red" },
      { beat: 19, col: 7, color: "red" },
      { beat: 23, col: 0, kind: "magnet", color: "red" },
      { beat: 31, col: 5, color: "red" },
      { beat: 31, col: 8, color: "red" },
      { beat: 36, col: 0, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 43, col: 10, kind: "morsel", color: "cyan" },
    ],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "fillerLampreyBreathe",
    name: "LAMPREY DREAM",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 8, col: 10, kind: "countdown", color: "cyan" },
      { beat: 14, col: 0, color: "red" },
      { beat: 22, col: 10, kind: "strand", color: "cyan", beads: 3 },
      { beat: 30, col: 3, color: "red" },
      { beat: 37, col: 10, kind: "meteor", color: null },
    ],
  },
  {
    id: "fillerLampreyRecall",
    name: "OLD LAMPREY SONG",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 3, kind: "rind", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 5, kind: "recoil", color: "cyan" },
      { beat: 22, col: 0, color: "red" },
      { beat: 29, col: 10, kind: "strand", color: "red", beads: 2 },
      { beat: 36, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerLampreyBend",
    name: "LAMPREY TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 1, kind: "countdown", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 9, kind: "meteor", color: null },
      { beat: 24, col: 1, color: "red" },
      { beat: 24, col: 9, color: "red" },
      { beat: 29, col: 5, kind: "gyre", color: null },
      { beat: 34, col: 8, kind: "countdown", color: "red" },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 45, col: 2, kind: "meteor", color: null },
    ],
  },
];
