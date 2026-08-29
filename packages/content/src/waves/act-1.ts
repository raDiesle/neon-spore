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
    guide: {
      both: "One ship, two screens — and the two screens do not show the same thing. What is coming is on one of them; the control that answers it is on the other. This first one is flat, wide and always red.",
      p1: "Yours is the cannon, the shield's trigger and the maw. Slide your strip until the cannon stands in its column, and say which column.",
      p2: "Yours is the shield itself, and the two colours. Press red — nothing leaves the hull until you do.",
    },
    entries: [{ beat: 0, col: 2, color: "red" }],
  },
  {
    name: "TWO COLOURS",
    sentence: "The one where colour starts to matter.",
    guide: {
      both: "Round, swollen, and always cyan. Same fall, same lane — the colour is the whole of the difference.",
      p1: "The column is still yours to stand in. Say the colour you can see.",
      p2: "Cyan for this one. A wrong colour is spent, not missed.",
    },
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 3, col: 4, color: "cyan" },
    ],
  },
  {
    name: "ALTERNATING",
    sentence: "The one where you never keep the same colour twice.",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 2, col: 3, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
    ],
  },
  {
    name: "THE ROCK",
    sentence: "The one where neither of you can do it alone.",
    guide: {
      both: "Dead rock. It cannot be shot, and it stops a shot of yours going up its column.",
      p1: "It announces itself on your strip, before it is on the field. Trigger the shield at the moment it lands — not before.",
      p2: "Slide the shield into its column and hold it there. You cannot fire it yourself.",
    },
    entries: [{ beat: 0, col: 3, kind: "meteor", color: null }],
  },
  {
    name: "TWO ROCKS",
    sentence: "The one where the same handover has to happen twice in a row.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    name: "THE HAND",
    sentence: "The one where three arrive on the same beat and the shield is one column.",
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 0, col: 5, kind: "meteor", color: null },
    ],
  },
  {
    name: "TORCH",
    sentence: "The one where the only warning is on the other player's screen.",
    guide: {
      both: "Rock again, twice as wide, and the fastest thing in the field. It cannot be shot either.",
      p1: "It is on your strip and on nobody else's. Call it before it arrives.",
      p2: "It covers two columns at once. The shield has to sit across both of them.",
    },
    entries: [
      { beat: 6, col: 1, kind: "torch", color: null },
      { beat: 12, col: 5, kind: "torch", color: null },
      { beat: 18, col: 3, kind: "torch", color: null },
    ],
  },
  {
    name: "SHIELD, THEN CANNON",
    sentence: "The one where you switch jobs mid-wave.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 3, color: "cyan" },
    ],
  },
  {
    name: "THE WALL",
    sentence: "The one where the cannon never stops moving.",
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
    guide: {
      both: "It hangs where it was left. Shooting it loose is only half of getting it — after that it sinks and drifts.",
      p1: "Chase it with the cannon and open the maw as it reaches the hull. It mends the ship.",
      p2: "Free it with a shot of either colour, then say which way it is drifting.",
    },
    entries: [
      { beat: 2, col: 1, color: "cyan" },
      { beat: 7, col: 5, color: "red" },
    ],
    pods: [{ beat: 0, col: 3, row: 3 }],
  },
  {
    name: "FINALE",
    sentence: "The one where everything you have learned arrives at once.",
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
