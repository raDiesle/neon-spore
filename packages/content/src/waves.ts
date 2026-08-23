import type { Color, CreatureKind } from "@neon-spore/sim";

/**
 * Waves are data, never code. Columns are authored against a 7-column field
 * and remapped by `buildQueue`; `beat` is the offset from the start of the wave.
 *
 * Every wave must pass the one-sentence test (docs/spec/wave-design.md):
 * if `sentence` cannot be written, the wave is padding and gets cut.
 */
export interface WaveEntry {
  beat: number;
  col: number;
  kind: CreatureKind;
  /** "alt" alternates, "any" is drawn from the seeded rng, or a fixed colour. */
  color: Color | "alt" | "any" | null;
}

export interface Wave {
  name: string;
  /** The one-sentence test. Not flavour text — the reason the wave exists. */
  sentence: string;
  /** Shown to both players on first play. */
  hint: string;
  entries: WaveEntry[];
}

export const WAVES: Wave[] = [
  {
    name: "FIRST STEP",
    sentence: "The one where you only have to be in the right column.",
    hint: "Slide the cannon onto the column — it always fires straight up.",
    entries: [{ beat: 0, col: 2, kind: "slick", color: "red" }],
  },
  {
    name: "TWO COLOURS",
    sentence: "The one where colour starts to matter.",
    hint: "Pick the colour, then the column. Only both together land a hit.",
    entries: [
      { beat: 0, col: 2, kind: "slick", color: "red" },
      { beat: 3, col: 4, kind: "bulb", color: "cyan" },
    ],
  },
  {
    name: "ALTERNATING",
    sentence: "The one where you never keep the same colour twice.",
    hint: "Three in a row, colours alternate.",
    entries: [
      { beat: 0, col: 1, kind: "slick", color: "alt" },
      { beat: 2, col: 3, kind: "bulb", color: "alt" },
      { beat: 4, col: 5, kind: "slick", color: "alt" },
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
    name: "SHIELD, THEN CANNON",
    sentence: "The one where you switch jobs mid-wave.",
    hint: "Deflect the rock first, then shoot the creature.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 3, kind: "slick", color: "any" },
    ],
  },
  {
    name: "THE WALL",
    sentence: "The one where the cannon never stops moving.",
    hint: "A broad front — change columns fast.",
    entries: [
      { beat: 0, col: 0, kind: "slick", color: "alt" },
      { beat: 1, col: 2, kind: "bulb", color: "alt" },
      { beat: 2, col: 4, kind: "slick", color: "alt" },
      { beat: 3, col: 6, kind: "bulb", color: "alt" },
    ],
  },
  {
    name: "SHOOT AND SHIELD",
    sentence: "The one that alternates between the two jobs on a fixed beat.",
    hint: "Creature, rock, creature, rock.",
    entries: [
      { beat: 0, col: 2, kind: "slick", color: "alt" },
      { beat: 3, col: 4, kind: "meteor", color: null },
      { beat: 6, col: 5, kind: "bulb", color: "alt" },
      { beat: 9, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    name: "CROWDED",
    sentence: "The one where the jobs overlap and you have to say what you are doing.",
    hint: "It overlaps now. Tell each other what you are taking.",
    entries: [
      { beat: 0, col: 1, kind: "slick", color: "alt" },
      { beat: 1, col: 5, kind: "bulb", color: "alt" },
      { beat: 3, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 0, kind: "slick", color: "alt" },
      { beat: 6, col: 6, kind: "bulb", color: "alt" },
    ],
  },
  {
    name: "FINALE",
    sentence: "The one where everything you have learned arrives at once.",
    hint: "All of it together.",
    entries: [
      { beat: 0, col: 0, kind: "slick", color: "alt" },
      { beat: 0, col: 6, kind: "bulb", color: "alt" },
      { beat: 2, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, kind: "slick", color: "alt" },
      { beat: 4, col: 4, kind: "bulb", color: "alt" },
      { beat: 7, col: 1, kind: "meteor", color: null },
      { beat: 7, col: 5, kind: "meteor", color: null },
    ],
  },
];
