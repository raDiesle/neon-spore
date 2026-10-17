import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 242 to 253 of the game, in the order they are played: THE FENCE's
 * block, the filler before THE PULSE and the boss THE PULSE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_20: Wave[] = [
  {
    id: "theFence",
    name: "THE FENCE",
    guide: {
      scene: "theFence",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null },
      { beat: 12, col: 5, kind: "fence", color: null },
      { beat: 24, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theGap",
    name: "THE GAP",
    variant: true,
    guide: {
      scene: "theGap",
    },
    entries: [
      { beat: 0, col: 8, kind: "fence", color: null },
      { beat: 12, col: 2, kind: "fence", color: null },
      { beat: 26, col: 10, kind: "fence", color: null },
      { beat: 40, col: 0, kind: "fence", color: null },
      { beat: 56, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theCut",
    name: "THE CUT",
    variant: true,
    guide: {
      scene: "theCut",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [5] },
      { beat: 16, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [8] },
      { beat: 32, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [2] },
      { beat: 48, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [7] },
    ],
  },
  {
    id: "theFenceAgain",
    name: "NEW FENCE MOON",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "fence", color: null },
      { beat: 8, col: 4, kind: "fence", color: null },
      { beat: 15, col: 8, kind: "fence", color: null },
      { beat: 23, col: 1, kind: "fence", color: null },
      { beat: 29, col: 9, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceReach",
    name: "FAR FENCE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "fence", color: null },
      { beat: 5, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 13, col: 4, color: "red" },
      { beat: 19, col: 8, kind: "fence", color: null },
      { beat: 25, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 31, col: 9, color: "red" },
    ],
  },
  {
    id: "theFencePair",
    name: "FENCE AND STRAND",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 7, kind: "fence", color: null },
      { beat: 10, col: 1, color: "red" },
      { beat: 17, col: 10, kind: "strand", color: "red", beads: 2 },
      { beat: 22, col: 1, color: "red" },
      { beat: 30, col: 6, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 34, col: 3, color: "cyan" },
      { beat: 40, col: 6, kind: "fence", color: null },
    ],
  },
  {
    id: "theFenceRecall",
    name: "FENCE MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 2, kind: "fence", color: null },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 19, col: 5, kind: "shell", color: "red" },
      { beat: 25, col: 0, color: "red" },
      { beat: 32, col: 10, kind: "fence", color: null },
      { beat: 39, col: 1, color: "red" },
    ],
  },
  {
    id: "theFencePeak",
    name: "FENCE ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 8, kind: "fence", color: null },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 18, col: 9, kind: "strand", color: "red", beads: 5 },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 30, col: 9, kind: "throb", color: "red" },
      { beat: 35, col: 4, kind: "fence", color: null },
      { beat: 39, col: 1, color: "red" },
      { beat: 39, col: 9, color: "red" },
      { beat: 44, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 48, col: 10, kind: "throb", color: "red" },
    ],
  },
  {
    id: "fillerPulseBreathe",
    name: "FENCE DREAM",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 4, kind: "fence", color: null },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 19, col: 2, kind: "strand", color: "red", beads: 5 },
      { beat: 25, col: 4, color: "red" },
      { beat: 31, col: 9, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 37, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerPulseRecall",
    name: "FENCE HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 8, kind: "fence", color: null },
      { beat: 10, col: 2, color: "red" },
      { beat: 16, col: 10, kind: "rind", color: "cyan" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 27, col: 8, kind: "fence", color: null },
      { beat: 32, col: 10, color: "red" },
      { beat: 39, col: 1, kind: "rind", color: "red" },
    ],
  },
  {
    id: "fillerPulseBend",
    name: "FENCE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 9, kind: "fence", color: null },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 8, kind: "strand", color: "red", beads: 2 },
      { beat: 22, col: 4, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 27, col: 6, kind: "fence", color: null },
      { beat: 33, col: 4, kind: "strand", color: "cyan", beads: 3 },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 43, col: 6, kind: "fence", color: null },
    ],
  },
  {
    id: "pulse",
    name: "THE PULSE",
    guide: {
      scene: "thePulse",
    },
    entries: [],
    boss: { kind: "pulse", stages: PULSE_STAGES },
    bossType: "special",
    controls: "pulse",
  },
];
