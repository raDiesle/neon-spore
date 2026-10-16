import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p13.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P14: Wave[] = [
  {
    id: "theChokeReach",
    name: "CHOKE AT THE EDGE",
    variant: true,
    entries: [
      { beat: 6, col: 9, kind: "shell", color: "red" },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 21, col: 5, kind: "shell", color: "cyan" },
      { beat: 27, col: 1, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 0, row: 4, kind: "purge", husk: true },
      { beat: 16, col: 0, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theChokePair",
    name: "CHOKE IN PAIRS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 15, col: 2, kind: "shell", color: "red" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 29, col: 9, color: "cyan" },
      { beat: 33, col: 10, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 6, col: 8, row: 4, kind: "purge", husk: true },
      { beat: 24, col: 8, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theChokeBreathe",
    name: "CHOKE AT EASE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 24, col: 10, kind: "shell", color: "cyan" },
      { beat: 32, col: 0, color: "red" },
    ],
    pods: [{ beat: 8, col: 9, row: 4, kind: "purge", husk: true }],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 4, kind: "throb", color: "red" },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 32, col: 8, color: "red" },
      { beat: 38, col: 10, kind: "throb", color: "red" },
    ],
    pods: [
      { beat: 6, col: 10, row: 4, kind: "purge", husk: true },
      { beat: 26, col: 9, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theChokeBend",
    name: "CHOKE TWICE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 5, kind: "shell", color: "cyan" },
      { beat: 24, col: 4, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 34, col: 5, kind: "shell", color: "cyan" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
    ],
    pods: [
      { beat: 6, col: 2, row: 4, kind: "purge", husk: true },
      { beat: 29, col: 3, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theChokePeak",
    name: "CHOKE PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 9, color: "cyan" },
      { beat: 12, col: 3, kind: "shell", color: "cyan" },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 20, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 5, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 32, col: 3, kind: "shell", color: "cyan" },
      { beat: 36, col: 6, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 48, col: 5, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 4, col: 3, row: 4, kind: "purge", husk: true },
      { beat: 24, col: 1, row: 4, kind: "purge", husk: true },
      { beat: 44, col: 2, row: 4, kind: "purge", husk: true },
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
  {
    id: "theRind",
    name: "THE RIND",
    guide: {
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 5, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "cyan" },
      { beat: 18, col: 3, kind: "rind", color: "cyan" },
      { beat: 21, col: 8, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindAgain",
    name: "RINDS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "red" },
      { beat: 16, col: 7, kind: "rind", color: "red" },
      { beat: 24, col: 2, kind: "rind", color: "red" },
      { beat: 32, col: 3, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theRindSpread",
    name: "RINDS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "rind", color: "red" },
      { beat: 5, col: 7, kind: "rind", color: "cyan" },
      { beat: 10, col: 9, kind: "rind", color: "red" },
      { beat: 17, col: 10, kind: "rind", color: "red" },
      { beat: 23, col: 9, kind: "rind", color: "red" },
      { beat: 29, col: 10, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theRindReach",
    name: "RINDS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "rind", color: "red" },
      { beat: 12, col: 0, kind: "rind", color: "red" },
      { beat: 24, col: 2, kind: "rind", color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 5, row: 4, kind: "purge", husk: true },
      { beat: 18, col: 6, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theRindPair",
    name: "RIND AND HUSK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 8, kind: "rind", color: "red" },
      { beat: 9, col: 10, color: "cyan" },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 29, col: 6, color: "red" },
      { beat: 34, col: 5, kind: "rind", color: "cyan" },
    ],
    pods: [
      { beat: 14, col: 4, row: 4, kind: "purge", husk: true },
      { beat: 23, col: 5, row: 3, kind: "ward" },
    ],
  },
  {
    id: "theRindBreathe",
    name: "EASY RINDS",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 8, col: 5, kind: "rind", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 24, col: 1, kind: "rind", color: "cyan" },
      { beat: 32, col: 9, color: "cyan" },
      { beat: 40, col: 3, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindRecall",
    name: "RIND RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 1, kind: "rind", color: "red" },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 16, col: 4, kind: "weight", color: null },
      { beat: 22, col: 5, color: "red" },
      { beat: 27, col: 3, kind: "rind", color: "cyan" },
      { beat: 32, col: 4, color: "cyan" },
      { beat: 37, col: 1, kind: "weight", color: null },
    ],
  },
];
