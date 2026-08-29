import type { Wave } from "../wave-types.js";

/**
 * Act one: the tutorial arc. Every wave here teaches exactly one thing on top
 * of the ones before it, and it ends on `FINALE`, which asks for all of them
 * at once. `waves.ts` is the barrel that concatenates this with the other
 * acts — see it for why the list was split by act in the first place.
 */
export const WAVES_ACT_1: Wave[] = [
  {
    name: "FIRST STEP",
    sentence: "The one where you only have to be in the right column.",
    hint: "Slide the cannon onto the column — it always fires straight up.",
    entries: [{ beat: 0, col: 2, color: "red" }],
  },
  {
    name: "TWO COLOURS",
    sentence: "The one where colour starts to matter.",
    hint: "Pick the colour, then the column. Only both together land a hit.",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 3, col: 4, color: "cyan" },
    ],
  },
  {
    name: "ALTERNATING",
    sentence: "The one where you never keep the same colour twice.",
    hint: "Three in a row, colours alternate.",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 2, col: 3, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
    ],
  },
  {
    name: "THE ROCK",
    sentence: "The one where neither of you can do it alone.",
    hint: "Player 2 slides the shield into the column, player 1 triggers on contact.",
    entries: [{ beat: 0, col: 3, kind: "meteor", color: null }],
  },
  {
    name: "TWO ROCKS",
    sentence: "The one where the same handover has to happen twice in a row.",
    hint: "Slide, trigger, slide, trigger.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    name: "THE HAND",
    sentence: "The one where three arrive on the same beat and the shield is one column.",
    hint: "One shield, three rocks, the same beat. Press and hold two of them back.",
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 0, col: 5, kind: "meteor", color: null },
    ],
  },
  {
    name: "TORCH",
    sentence: "The one where the only warning is on the other player's screen.",
    hint: "Twice as wide, and the fastest thing there is. P1 reads the radar, P2 has the shield.",
    entries: [
      { beat: 6, col: 1, kind: "torch", color: null },
      { beat: 12, col: 5, kind: "torch", color: null },
      { beat: 18, col: 3, kind: "torch", color: null },
    ],
  },
  {
    name: "SHIELD, THEN CANNON",
    sentence: "The one where you switch jobs mid-wave.",
    hint: "Deflect the rock first, then shoot the creature.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 3, color: "cyan" },
    ],
  },
  {
    name: "THE WALL",
    sentence: "The one where the cannon never stops moving.",
    hint: "A broad front — change columns fast.",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 2, color: "red" },
      { beat: 2, col: 4, color: "cyan" },
      { beat: 3, col: 6, color: "red" },
    ],
  },
  {
    name: "SHOOT AND SHIELD",
    sentence: "The one that alternates between the two jobs on a fixed beat.",
    hint: "Creature, rock, creature, rock.",
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 3, col: 4, kind: "meteor", color: null },
      { beat: 6, col: 5, color: "red" },
      { beat: 9, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    name: "IN ITS SHADOW",
    sentence: "The one where you hold back the very thing you are trying to shoot.",
    hint: "A rock stops your shot too. Hold the one behind it until the rock is gone.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 1, col: 3, color: "red" },
      { beat: 8, col: 5, kind: "meteor", color: null },
      { beat: 9, col: 5, color: "cyan" },
    ],
  },
  {
    name: "CROWDED",
    sentence: "The one where the jobs overlap and you have to say what you are doing.",
    hint: "It overlaps now. Tell each other what you are taking.",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 1, col: 5, color: "cyan" },
      { beat: 3, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 0, color: "red" },
      { beat: 6, col: 6, color: "cyan" },
    ],
  },
  {
    name: "SALVAGE",
    sentence: "The one where shooting something is only half of getting it.",
    hint: "Shoot the pod loose, chase it, then SUCK as it reaches the hull.",
    entries: [
      { beat: 2, col: 1, color: "cyan" },
      { beat: 7, col: 5, color: "red" },
    ],
    pods: [{ beat: 0, col: 3, row: 3 }],
  },
  {
    name: "FINALE",
    sentence: "The one where everything you have learned arrives at once.",
    hint: "All of it together.",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 6, color: "red" },
      { beat: 2, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 4, col: 4, color: "red" },
      { beat: 7, col: 1, kind: "meteor", color: null },
      { beat: 7, col: 5, kind: "meteor", color: null },
    ],
  },
];
