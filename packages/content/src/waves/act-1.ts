import { INSTAR_SCRIPT } from "../instar-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Act one: the tutorial arc. Every wave here teaches exactly one thing on top
 * of the ones before it, and it ends on `FINALE`, which asks for all of them
 * at once. `waves.ts` is the barrel that concatenates this with the other
 * acts — see it for why the list was split by act in the first place.
 *
 * **TWO COLOURS carries no guide, and it used to.** CYAN introduces the second
 * colour a wave earlier now and shows what the wrong one costs, so a guide here
 * would be the same lesson twice in consecutive waves — padding, whichever of
 * the two was written first. What is left for that wave to be is the first time
 * both colours arrive inside one wave: nothing new to learn, one thing to keep
 * straight. The note is up here rather than beside the wave because the
 * director rebuilds the array on every save and keeps only what stands above it
 * (`tools/director/src/serialize.ts`) — a comment inside an entry is a comment
 * with one save left to live.
 *
 * **The panel grows with the arc**, which is the other half of the same rule.
 * The first eight waves name a rung of the standard ladder rather than the
 * standard panel — STANDARD 1 through 4, each one button more than the one
 * before it (`control-sets-table.ts`) — so a pair meeting the game is handed
 * exactly the controls the wave they are on asks for, in the places those
 * controls will keep for the rest of the game. SALVAGE is where the full
 * panel arrives, because the maw is the last thing the ladder holds back and
 * the pod is the one thing in the game that asks for it.
 */
export const WAVES_ACT_1: Wave[] = [
  {
    id: "firstStep",
    name: "FIRST STEP",
    guide: {
      scene: "firstStep",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 5, color: "red" },
      { beat: 15, col: 7, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 31, col: 10, color: "red" },
      { beat: 39, col: 3, color: "red" },
      { beat: 43, col: 0, color: "red" },
      { beat: 47, col: 5, color: "red" },
      { beat: 48, col: 5, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "firstStepAgain",
    name: "STEADY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 7, col: 5, color: "red" },
      { beat: 13, col: 4, color: "red" },
      { beat: 21, col: 6, color: "red" },
      { beat: 29, col: 4, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "firstStepReach",
    name: "SIDE TO SIDE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 6, color: "red" },
      { beat: 12, col: 1, color: "red" },
      { beat: 18, col: 8, color: "red" },
      { beat: 23, col: 4, color: "red" },
      { beat: 29, col: 8, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "firstStepPair",
    name: "QUICKER",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 2, color: "red" },
      { beat: 9, col: 10, color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 20, col: 2, color: "red" },
      { beat: 26, col: 10, color: "red" },
      { beat: 30, col: 1, color: "red" },
      { beat: 36, col: 4, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "cyan",
    name: "CYAN",
    guide: {
      scene: "cyan",
    },
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 3, col: 7, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "cyanAgain",
    name: "ONLY CYAN",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 16, col: 4, color: "cyan" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 30, col: 4, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "twoColours",
    name: "TWO COLOURS",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 3, col: 7, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "alternating",
    name: "ALTERNATING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 2, col: 5, color: "red" },
      { beat: 4, col: 8, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theInstar",
    name: "THE INSTAR",
    entries: [],
    boss: { kind: "instar", steps: INSTAR_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theRock",
    name: "THE ROCK",
    guide: {
      scene: "theRock",
    },
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 4, col: 3, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theHand",
    name: "THE HAND",
    variant: true,
    guide: {
      scene: "theHand",
    },
    entries: [
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 0, col: 8, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theRockAgain",
    name: "FIVE ROCKS",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "meteor", color: null },
      { beat: 7, col: 5, kind: "meteor", color: null },
      { beat: 15, col: 4, kind: "meteor", color: null },
      { beat: 21, col: 5, kind: "meteor", color: null },
      { beat: 28, col: 4, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theRockReach",
    name: "WIDE ROCKS",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "meteor", color: null },
      { beat: 5, col: 4, kind: "meteor", color: null },
      { beat: 10, col: 8, kind: "meteor", color: null },
      { beat: 15, col: 2, kind: "meteor", color: null },
      { beat: 20, col: 8, kind: "meteor", color: null },
      { beat: 26, col: 3, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theRockPair",
    name: "ROCKS BETWEEN",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 8, kind: "meteor", color: null },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 20, col: 7, color: "cyan" },
      { beat: 24, col: 2, kind: "meteor", color: null },
      { beat: 30, col: 0, color: "cyan" },
      { beat: 34, col: 2, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "torch",
    name: "TORCH",
    guide: {
      scene: "torch",
    },
    entries: [
      { beat: 6, col: 2, kind: "torch", color: null },
      { beat: 12, col: 8, kind: "torch", color: null },
      { beat: 18, col: 5, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
];
