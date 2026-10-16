import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 193 to 202 of the game, in the order they are played: THE CLAW's block
 * and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_19: Wave[] = [
  {
    id: "theClaw",
    name: "THE CLAW",
    guide: {
      scene: "theClaw",
    },
    entries: [],
    pods: [
      { beat: 2, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 18, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 34, col: 0, row: 3, kind: "pod", cross: 1, speed: 3 },
      { beat: 50, col: 10, row: 5, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawAgain",
    name: "CLAW AGAIN",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 8, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 16, col: 0, row: 3, kind: "pod", cross: 1 },
      { beat: 24, col: 0, row: 5, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawSpread",
    name: "CLAW WIDE",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 8, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 17, col: 0, row: 3, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawReach",
    name: "CLAW AT THE EDGE",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 5, kind: "pod", cross: -1 },
      { beat: 8, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 15, col: 10, row: 4, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawPair",
    name: "CLAW IN PAIRS",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 9, col: 0, row: 3, kind: "pod", cross: 1 },
      { beat: 17, col: 0, row: 4, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawBreathe",
    name: "CLAW AT EASE",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 10, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 19, col: 0, row: 5, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawRecall",
    name: "CLAW RECALLED",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 11, col: 0, row: 6, kind: "pod", cross: 1 },
      { beat: 19, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 28, col: 10, row: 4, kind: "pod", cross: -1, speed: 3 },
    ],
    controls: "claw",
  },
  {
    id: "theClawBend",
    name: "CLAW TWICE",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 5, kind: "pod", cross: -1 },
      { beat: 7, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 15, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 23, col: 10, row: 6, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawPeak",
    name: "CLAW PEAK",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 5, kind: "pod", cross: -1 },
      { beat: 7, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 17, col: 10, row: 6, kind: "pod", cross: -1, speed: 3 },
      { beat: 23, col: 0, row: 3, kind: "pod", cross: 1 },
      { beat: 29, col: 10, row: 5, kind: "pod", cross: -1 },
      { beat: 35, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 41, col: 10, row: 6, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    guide: {
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 28, col: 8, kind: "meteor", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 10, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 60, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, kind: "meteor", color: null },
      { beat: 82, col: 2, color: "cyan" },
    ],
    boss: { kind: "gorge", levels: GORGE_LEVELS },
    bossType: "normal",
  },
];
