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
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 3, color: "red" },
      { beat: 7, col: 4, color: "red" },
      { beat: 10, col: 6, color: "red" },
      { beat: 12, col: 5, color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 21, col: 0, color: "red" },
      { beat: 27, col: 6, color: "red" },
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
      { beat: 0, col: 2, color: "cyan" },
      { beat: 3, col: 4, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "twoColours",
    name: "TWO COLOURS",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 3, col: 4, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "alternating",
    name: "ALTERNATING",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 2, col: 3, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theRock",
    name: "THE ROCK",
    guide: {
      scene: "theRock",
    },
    entries: [{ beat: 0, col: 3, kind: "meteor", color: null }],
    controls: "standard3",
  },
  {
    id: "twoRocks",
    name: "TWO ROCKS",
    guide: {
      scene: "twoRocks",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theHand",
    name: "THE HAND",
    guide: {
      scene: "theHand",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 0, col: 5, kind: "meteor", color: null },
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
      { beat: 6, col: 1, kind: "torch", color: null },
      { beat: 12, col: 5, kind: "torch", color: null },
      { beat: 18, col: 3, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "shieldThenCannon",
    name: "SHIELD, THEN CANNON",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 3, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "theWall",
    name: "THE WALL",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 2, color: "red" },
      { beat: 2, col: 4, color: "cyan" },
      { beat: 3, col: 6, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "shootAndShield",
    name: "SHOOT AND SHIELD",
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 3, col: 4, kind: "meteor", color: null },
      { beat: 6, col: 5, color: "red" },
      { beat: 9, col: 2, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "inItsShadow",
    name: "IN ITS SHADOW",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 1, col: 3, color: "red" },
      { beat: 8, col: 5, kind: "meteor", color: null },
      { beat: 9, col: 5, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "crowded",
    name: "CROWDED",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 1, col: 5, color: "cyan" },
      { beat: 3, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 0, color: "red" },
      { beat: 6, col: 6, color: "cyan" },
    ],
    controls: "standard4",
  },
];
