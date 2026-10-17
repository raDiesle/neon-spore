import type { Wave } from "../wave-types.js";

/**
 * Waves 253 to 262 of the game, in the order they are played: THE CLAW's block,
 * the filler before THE THROAT and the boss THE THROAT.
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
    name: "CLAW HORIZON",
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
    name: "CLAW DUET",
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
    name: "CLAW HOMECOMING",
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
    id: "fillerThroatBreathe",
    name: "CLAW PICNIC",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 2, kind: "strand", color: "red", beads: 5 },
      { beat: 15, col: 3, color: "red" },
      { beat: 21, col: 0, kind: "veer", color: null },
      { beat: 29, col: 8, color: "cyan" },
      { beat: 35, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
  },
  {
    id: "fillerThroatRecall",
    name: "CLAW LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 9, kind: "strand", color: "red", beads: 5 },
      { beat: 13, col: 0, color: "red" },
      { beat: 23, col: 6, color: "cyan" },
      { beat: 29, col: 5, kind: "strand", color: "cyan", beads: 3 },
      { beat: 34, col: 1, color: "cyan" },
    ],
    pods: [{ beat: 18, col: 5, row: 4, kind: "husk" }],
  },
  {
    id: "fillerThroatBend",
    name: "CLAW PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 8, kind: "strand", color: "cyan", beads: 3 },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 8, kind: "veer", color: null },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 6, color: "cyan" },
      { beat: 28, col: 2, kind: "strand", color: "red", beads: 5 },
      { beat: 34, col: 3, kind: "veer", color: null },
      { beat: 39, col: 1, color: "red" },
      { beat: 39, col: 9, color: "red" },
      { beat: 45, col: 7, kind: "strand", color: "red", beads: 5 },
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
];
