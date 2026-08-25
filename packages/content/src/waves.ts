import type { BossEntry, Color, CreatureKind, PodEntry } from "@neon-spore/sim";

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
  /**
   * Only the rock is named here. A living creature's kind follows from its
   * colour (`kindForColor`) — one kind is one colour and one silhouette, so
   * naming both would be naming the same thing twice and inviting them to
   * disagree.
   */
  kind?: Extract<CreatureKind, "meteor">;
  /** A fixed colour, or null for the rock. */
  color: Color | null;
}

export interface Wave {
  name: string;
  /** The one-sentence test. Not flavour text — the reason the wave exists. */
  sentence: string;
  /** Shown to both players on first play. */
  hint: string;
  entries: WaveEntry[];
  /**
   * Pods left hanging in the field. Their own list, because a pod is not an
   * enemy: it is never cleared and it never blocks the end of the wave. Columns
   * are authored against the same 7-column field as `entries`; the row is
   * absolute, and a pod never hangs on the hull row.
   */
  pods?: PodEntry[];
  /**
   * What the wave authors when the queen is in it. `col` is authored against
   * the same 7-column field as everything else.
   */
  boss?: BossEntry;
}

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
    hint: "A shot in its column knocks the pod loose — any colour works. Chase it down with the cannon and hit SUCK the moment it reaches the hull.",
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
    sentence: "The one where she opens for two beats, and a rock falls fast on a clock of its own.",
    hint: "Only the mark in her middle takes a shot. Say the column and the colour — one of you has each half. Every eight beats a rock grows out of one side of her and falls fast — whoever calls colour, watch which side glows before it drops.",
    entries: [],
    pods: [{ beat: 2, col: 3, row: 4 }],
    boss: { col: 3, petals: 9 },
  },
];
