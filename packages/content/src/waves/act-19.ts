import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 232 to 241 of the game, in the order they are played: THE CLAW's block,
 * the filler before THE GORGE and the boss THE GORGE.
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
    name: "FIRST CLAW",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 6, kind: "pod", cross: 1 },
      { beat: 11, col: 0, row: 6, kind: "pod", cross: 1 },
      { beat: 22, col: 0, row: 4, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawReach",
    name: "CLAW WANDERER",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 6, kind: "pod", cross: 1 },
      { beat: 9, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 18, col: 10, row: 6, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawPair",
    name: "CLAW ALLIANCE",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 8, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 17, col: 0, row: 3, kind: "pod", cross: 1 },
      { beat: 26, col: 0, row: 4, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawRecall",
    name: "ANCIENT CLAW",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 9, col: 0, row: 6, kind: "pod", cross: 1 },
      { beat: 18, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 26, col: 10, row: 3, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawPeak",
    name: "CLAW THUNDER",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 8, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 15, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 23, col: 0, row: 3, kind: "pod", cross: 1 },
      { beat: 30, col: 0, row: 4, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "fillerGorgeBreathe",
    name: "SLEEPY CLAW",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 21, col: 8, kind: "veer", color: null },
      { beat: 29, col: 4, color: "cyan" },
      { beat: 35, col: 9, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeRecall",
    name: "OLD CLAW SONG",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 10, kind: "strand", color: "red", beads: 5 },
      { beat: 11, col: 4, color: "red" },
      { beat: 16, col: 2, kind: "shell", color: "cyan" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 27, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 39, col: 4, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeBend",
    name: "CLAW SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 8, kind: "strand", color: "red", beads: 5 },
      { beat: 12, col: 5, color: "red" },
      { beat: 18, col: 2, kind: "veer", color: null },
      { beat: 23, col: 4, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 28, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 34, col: 9, kind: "veer", color: null },
      { beat: 39, col: 4, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 3, kind: "strand", color: "red", beads: 5 },
    ],
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
