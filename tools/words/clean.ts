/**
 * The waves and mechanics whose player-facing text already reads cleanly, and
 * the number of lines that still do not.
 *
 * **This list only grows and that number only falls.** It is the whole
 * enforcement mechanism, and the shape was chosen after counting: 160 of the
 * 189 subjects failed the rules on the day they were written, so a list of
 * what is *waived* would have been 85% of the corpus and would have meant
 * nothing. A list of what is *held* is small, it is honest about where the
 * game stands, and it makes the next rewrite a line added here rather than a
 * line deleted somewhere.
 *
 * **What each half catches.** `CLEAN` catches a rewritten wave sliding back —
 * once a subject is on it, every line it owns is held to the rules for good.
 * `CEILING` catches a *new* wave authored in the old register, which `CLEAN`
 * cannot see because a new name was never on it.
 *
 * Nothing here is generated. `bun run words --clean` prints the two values as
 * they stand, and a lane pastes them in with the rewrite that earned them.
 */

/**
 * Subjects every line of which passes `findings`. A wave name or a mechanic
 * id, exactly as `playerText` writes it before the first ` · `.
 *
 * The boss guides are most of it, and that is the argument the skill makes
 * from data: they are the ones written as numbered steps, and the register is
 * what puts them here rather than the subject being simpler.
 */
export const CLEAN: readonly string[] = [
  "ALTERNATING",
  "BULB QUEEN",
  "CROWDED",
  "CYAN",
  "FINALE",
  "IN ITS SHADOW",
  "PINBALL",
  "SHIELD, THEN CANNON",
  "SHOOT AND SHIELD",
  "SNAKE",
  "THE GAUGE",
  "THE MAZE",
  "THE MIRROR",
  "THE PULSE",
  "THE TWITCH",
  "THE WALL",
  "TORCH",
  "TWO COLOURS",
  "fleet",
  "meteor",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
  "meteorMedium",
  "mirror",
  "queen",
  "torch",
  "ward",
  "warden",
];

/**
 * How many lines may still fail. 290 of 717 on 21 September 2026, the day the
 * rules were written; the rewrite lanes bring it down.
 */
export const CEILING = 290;
