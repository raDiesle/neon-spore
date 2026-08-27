import type { Wave } from "./wave-types.js";

export type { Wave, WaveEntry } from "./wave-types.js";

/**
 * Every wave in the game, in order. Nothing but the list — what a wave is made
 * of is `wave-types.ts`, because this file is the half that grows.
 */
export const WAVES: Wave[] = [
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
  {
    name: "BULB QUEEN",
    sentence: "The one where she opens for two beats, and drops a torch on a clock of its own.",
    hint: "Two marks, one real. P1 sees what is coming, P2 sees where — say both.",
    entries: [],
    pods: [{ beat: 2, col: 3, row: 4 }],
    boss: { kind: "queen", col: 3, petals: 9 },
  },
  {
    name: "THE MIRROR",
    sentence: "The one where the boss is your own ship, and it asks for your moves back.",
    hint: "Watch, then do the same. Say every step out loud — the pod is bait.",
    entries: [],
    boss: {
      kind: "mirror",
      rounds: [
        ["fireRed", "guard"],
        ["cannonLeft", "cannonRight", "cannonRight"],
        ["intake", "fireRed", "intake", "fireCyan", "intake", "fireRed"],
      ],
    },
  },
  {
    name: "THE WARDEN",
    sentence:
      "The one where it holds one of your controls and only the other one of you can get it back.",
    hint: "It takes the cannon, then the shield, then the cannon. Whoever is free pulls the line — and the rim's colour is the shot.",
    entries: [],
    boss: { kind: "warden" },
  },
  {
    name: "THE RUNT",
    sentence: "The one where a shot that lands is the mistake.",
    hint: "Small and colourless — leave it alone. A real target is coming too; say which column is which.",
    entries: [
      { beat: 0, col: 3, kind: "runt", color: null },
      { beat: 1, col: 5, color: "cyan" },
    ],
  },
  {
    name: "ON THE BEAT",
    sentence: "The one where firing on sight is the miss.",
    hint: "It swells and shrinks on the beat. Wait for it — a shot on the wrong one does nothing at all.",
    entries: [{ beat: 0, col: 3, kind: "throb", color: null }],
  },
  {
    name: "THE VANE",
    sentence: "The one where the column you were told is never the column it lands in.",
    hint: "The arm folds every arrival about the column it is standing in. Count from the arm, not from the edge.",
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 3, col: 5, color: "red" },
      { beat: 6, col: 0, kind: "meteor", color: null },
      { beat: 9, col: 4, color: "cyan" },
      { beat: 12, col: 6, kind: "meteor", color: null },
      { beat: 15, col: 2, color: "red" },
      { beat: 18, col: 3, kind: "meteorMedium", color: null },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 24, col: 1, kind: "meteor", color: null },
      { beat: 27, col: 5, color: "red" },
      { beat: 30, col: 0, kind: "meteorMedium", color: null },
      { beat: 33, col: 3, color: "cyan" },
    ],
    boss: { kind: "vane" },
  },
  {
    name: "meteor testings",
    sentence: "meteor testings",
    hint: "meteor testings",
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 0, col: 1, kind: "meteorMedium", color: null },
      { beat: 0, col: 2, kind: "meteorFast", color: null },
      { beat: 0, col: 3, kind: "meteorFaster", color: null },
      { beat: 0, col: 4, kind: "meteorFastest", color: null },
      { beat: 0, col: 5, kind: "torch", color: null },
    ],
  },
];
