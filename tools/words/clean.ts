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
  "CATCH AND AIM",
  "CROWDED",
  "CYAN",
  "FINALE",
  "FIRST STEP",
  "IN ITS SHADOW",
  "LINE CARD",
  "PINBALL",
  "SALVAGE",
  "SCREEN CARD",
  "SHIELD, THEN CANNON",
  "SHOOT AND SHIELD",
  "SNAKE",
  "THE ANTIPHON",
  "THE BALLOON",
  "THE BATON",
  "THE BEATBOX",
  "THE BELLOWS",
  "THE CAIRN",
  "THE CANDLE",
  "THE CAROM",
  "THE CHOIR",
  "THE CHOKE",
  "THE CLASP",
  "THE CLAW",
  "THE CODEX",
  "THE COIL",
  "THE COUNT",
  "THE CRAWLER",
  "THE CROSSING",
  "THE CRYSTAL",
  "THE CURTAIN",
  "THE CUT",
  "THE DART",
  "THE DIASTOLE",
  "THE ECHO",
  "THE FENCE",
  "THE FILAMENT",
  "THE FLEET",
  "THE FLIP",
  "THE GAP",
  "THE GAUGE",
  "THE GHOST",
  "THE GIMBAL",
  "THE GORGE",
  "THE GUM",
  "THE GYRE",
  "THE HAND",
  "THE HANDOVER",
  "THE HASP",
  "THE HIVE",
  "THE HUSK",
  "THE INSTAR",
  "THE JAM",
  "THE LANCE",
  "THE LEAD",
  "THE LEAK",
  "THE LEDGER",
  "THE LEECH",
  "THE LID",
  "THE LIMPET",
  "THE LURE",
  "THE MAGNET",
  "THE MAZE",
  "THE MINE",
  "THE MIRROR",
  "THE MOULT",
  "THE ORRERY",
  "THE PULSE",
  "THE PURGE",
  "THE RATCHET",
  "THE RECOIL",
  "THE REPRISE",
  "THE RIND",
  "THE ROCK",
  "THE SCOUT",
  "THE SCUTTLE",
  "THE SHELL",
  "THE SINEW",
  "THE SPLICE",
  "THE SPOOL",
  "THE STARE",
  "THE STRAND",
  "THE SURGE",
  "THE TASTER",
  "THE THROAT",
  "THE THROB",
  "THE TWITCH",
  "THE UNDERTOW",
  "THE VANE",
  "THE VEER",
  "THE VEIL",
  "THE VOLLEY",
  "THE WALL",
  "THE WARD",
  "THE WARDEN",
  "THE WEIGHT",
  "THE WELL",
  "THE WISP",
  "TORCH",
  "TWO COLOURS",
  "TWO ROCKS",
  "antiphon",
  "balloon",
  "baton",
  "beatbox",
  "bellows",
  "briefing",
  "cairn",
  "candle",
  "cannonFault",
  "carom",
  "choir",
  "chute",
  "clasp",
  "codexFault",
  "coil",
  "countdown",
  "crawler",
  "crystal",
  "curtain",
  "dart",
  "diastole",
  "echo",
  "fence",
  "filament",
  "fleet",
  "flipFault",
  "ghost",
  "gimbal",
  "gorge",
  "grip",
  "gum",
  "gyre",
  "handoverFault",
  "hasp",
  "hive",
  "husk",
  "instar",
  "lance",
  "lead",
  "ledger",
  "leech",
  "lid",
  "limpet",
  "lock",
  "lure",
  "magnet",
  "maze",
  "meteor",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
  "meteorMedium",
  "mine",
  "mirror",
  "moult",
  "mount",
  "orrery",
  "pinball",
  "pulse",
  "purge",
  "queen",
  "ratchet",
  "recoil",
  "reprise",
  "rind",
  "rockCross",
  "scout",
  "scuttle",
  "shell",
  "shieldFault",
  "sinew",
  "snake",
  "splice",
  "spool",
  "stare",
  "steerFault",
  "strand",
  "surge",
  "taster",
  "tether",
  "throat",
  "throb",
  "torch",
  "undertow",
  "vane",
  "veer",
  "veil",
  "volley",
  "ward",
  "warden",
  "weight",
  "well",
  "wisp",
];

/**
 * How many lines may still fail. 290 of 717 on 21 September 2026, the day the
 * rules were written; the rewrite lanes bring it down.
 *
 * **It went up once, the same day, and only a new rule may do that.** The
 * owner settled ward against plate against guard against shield, that became
 * a sixth vocabulary row, and sixty-six lines the checker had never asked
 * about started failing — sixteen of them for the first time. A number that
 * may never rise would have meant the answer could not be enforced until the
 * whole corpus was rewritten, which is the rewrite the number exists to
 * pace. So: a rule added, remeasured, and a sentence here saying which rule
 * and how much. A lane that has written no rule may still only lower it.
 *
 * 290 to 305: sixteen newly failing, less the one wave *named* THE WARD, which
 * the row does not reach (`measure.ts` — a name is a proper noun). The
 * sixty-six lines that row found were swept by 23 September 2026, the last of
 * them `tether`'s.
 */
export const CEILING = 4;
