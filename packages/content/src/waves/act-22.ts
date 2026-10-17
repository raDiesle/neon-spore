import type { Wave } from "../wave-types.js";

/**
 * Waves 283 to 295 of the game, in the order they are played: the filler before
 * THE THROAT, the boss THE THROAT and THE CLAW's block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_22: Wave[] = [
  {
    id: "fillerThroatBreathe",
    name: "SLEEPY STRAND",
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 10, kind: "strand", color: "red", beads: 2 },
      { beat: 14, col: 5, color: "cyan" },
      { beat: 21, col: 8, kind: "veer", color: null },
      { beat: 29, col: 9, color: "red" },
      { beat: 37, col: 6, kind: "glutton", color: "red" },
    ],
  },
  {
    id: "fillerThroatRecall",
    name: "OLD STRAND SONG",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 5, kind: "strand", color: "red", beads: 5 },
      { beat: 10, col: 7, color: "red" },
      { beat: 15, col: 4, kind: "seeder", color: "red" },
      { beat: 21, col: 0, color: "cyan" },
      { beat: 26, col: 7, kind: "strand", color: "red", beads: 2 },
      { beat: 31, col: 5, color: "cyan" },
      { beat: 36, col: 1, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "fillerThroatBend",
    name: "STRAND SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 10, kind: "veer", color: null },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 28, col: 7, kind: "strand", color: "red", beads: 5 },
      { beat: 34, col: 5, kind: "veer", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 46, col: 5, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theThroat",
    name: "THE THROAT",
    guide: {
      scene: "theThroat",
    },
    entries: [
      { beat: 4, col: 5, color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 20, col: 7, color: "cyan" },
      { beat: 28, col: 2, kind: "meteor", color: null },
      { beat: 36, col: 8, color: "cyan" },
      { beat: 44, col: 5, kind: "meteor", color: null },
      { beat: 50, col: 2, color: "red" },
      { beat: 54, col: 8, color: "cyan" },
      { beat: 62, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, color: "cyan" },
      { beat: 78, col: 2, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 32, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 58, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 70, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 84, col: 10, row: 4, kind: "pod", cross: -1 },
    ],
    boss: { kind: "throat" },
    bossType: "normal",
    controls: "throat",
  },
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
    id: "theClawSpread",
    name: "CLAW SCATTER",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 5, kind: "pod", cross: 1 },
      { beat: 9, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 18, col: 0, row: 6, kind: "pod", cross: 1 },
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
      { beat: 0, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 9, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 17, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 25, col: 10, row: 5, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawBreathe",
    name: "CLAW LULLABY",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 11, col: 10, row: 3, kind: "pod", cross: -1 },
      { beat: 23, col: 0, row: 6, kind: "pod", cross: 1 },
      { beat: 33, col: 0, row: 4, kind: "pod", cross: 1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawRecall",
    name: "ANCIENT CLAW",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 0, row: 6, kind: "pod", cross: 1 },
      { beat: 9, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 18, col: 0, row: 3, kind: "pod", cross: 1 },
      { beat: 27, col: 10, row: 4, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawBend",
    name: "CLAW MIRAGE",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 9, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 18, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 25, col: 10, row: 5, kind: "pod", cross: -1 },
      { beat: 33, col: 10, row: 3, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theClawPeak",
    name: "CLAW THUNDER",
    variant: true,
    entries: [],
    pods: [
      { beat: 0, col: 10, row: 4, kind: "pod", cross: -1 },
      { beat: 8, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 15, col: 10, row: 6, kind: "pod", cross: -1 },
      { beat: 23, col: 10, row: 5, kind: "pod", cross: -1 },
      { beat: 30, col: 10, row: 6, kind: "pod", cross: -1 },
    ],
    controls: "claw",
  },
];
