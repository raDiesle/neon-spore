import type { Wave } from "../wave-types.js";

/**
 * Waves 243 to 252 of the game, in the order they are played: THE CLAW's block,
 * the filler before THE THROAT and the boss THE THROAT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_18: Wave[] = [
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
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 4, kind: "strand", color: "red", beads: 2 },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 20, col: 2, kind: "veer", color: null },
      { beat: 27, col: 0, color: "cyan" },
      { beat: 35, col: 10, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerThroatRecall",
    name: "CLAW LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 1, kind: "strand", color: "cyan", beads: 3 },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 16, col: 9, kind: "throb", color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 27, col: 1, kind: "strand", color: "red", beads: 5 },
      { beat: 33, col: 3, color: "cyan" },
      { beat: 38, col: 9, kind: "throb", color: "red" },
    ],
  },
  {
    id: "fillerThroatBend",
    name: "CLAW PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 1, kind: "strand", color: "cyan", beads: 3 },
      { beat: 13, col: 3, color: "red" },
      { beat: 19, col: 0, kind: "veer", color: null },
      { beat: 25, col: 2, color: "cyan" },
      { beat: 25, col: 8, color: "cyan" },
      { beat: 30, col: 5, kind: "strand", color: "red", beads: 5 },
      { beat: 36, col: 7, kind: "veer", color: null },
      { beat: 41, col: 3, color: "cyan" },
      { beat: 41, col: 6, color: "cyan" },
      { beat: 46, col: 8, kind: "strand", color: "cyan", beads: 3 },
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
