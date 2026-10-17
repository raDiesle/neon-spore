/**
 * **The words the composer names a wave with**, by the mood of its step
 * (`compose-names.ts`, which reads them). Plain words a player can say out
 * loud, mystic or fun, and none the game already means something by
 * (`test/compose-names.test.ts`).
 */

/** The mood of a step: how a composed wave's id ends (`compose-steps.ts`). */
export type Mood = "Again" | "Spread" | "Reach" | "Pair" | "Breathe" | "Recall" | "Bend" | "Peak";

/** `#` is the block's thing, `%` the thing a Pair step pairs it with. No word
 * here is a creature's, a boss's or the design vocabulary's — a name is never
 * mistaken for an instruction (`compose-names.test.ts`). */
export const MOODS: Readonly<Record<Mood, readonly string[]>> = {
  Again: [
    "# DAWN",
    "FIRST #",
    "# AWAKENS",
    "HELLO #",
    "# MORNING",
    "LITTLE #",
    "# RISING",
    "NEW # MOON",
  ],
  Spread: ["# BLOOM", "# RAIN", "# DRIFT", "# SEEDS", "# CONFETTI", "# SPRINKLE", "SPRING OF #"],
  Reach: [
    "FAR #",
    "# HORIZON",
    "# VOYAGE",
    "# AT WORLD END",
    "LONG # ROAD",
    "# PILGRIM",
    "OUTER #",
  ],
  Pair: ["# MEETS %", "# AND %", "# DUET", "# TANGO", "# WALTZ", "# ALLIANCE", "# PARTY"],
  Breathe: ["# LULLABY", "# DREAM", "SLEEPY #", "# HUSH", "SOFT #", "# PICNIC", "LAZY #"],
  Recall: ["# LEGEND", "# RELIC", "# REUNION", "OLD # SONG", "# SAGA", "ANCIENT #", "# HOMECOMING"],
  Bend: ["# MIRAGE", "# RIDDLE", "# TRICK", "CROOKED #", "# ILLUSION", "# PARADOX", "# SPELL"],
  Peak: [
    "# STORM",
    "# ECLIPSE",
    "# INFERNO",
    "# THUNDER",
    "# OVERDRIVE",
    "# RAPTURE",
    "# APOCALYPSE",
  ],
};

/** Put in front of a mood's name when every one of them is taken. */
export const SPARE_WORDS = [
  "GOLDEN",
  "SILENT",
  "WILD",
  "VELVET",
  "HOLLOW",
  "NEON",
  "STARLIT",
  "COSMIC",
  "MIDNIGHT",
  "BRAVE",
];
