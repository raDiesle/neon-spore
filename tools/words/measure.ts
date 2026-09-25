/**
 * What makes a line of player-facing text readable, as numbers a test can
 * hold. The prose behind each rule — and the before-and-after that earned it —
 * is `.claude/skills/game-words`.
 *
 * **Every rule here is about a reader who is not reading in their first
 * language, on a phone, under a beat, and who then has to say the line out
 * loud to somebody else.** That last clause is the one that makes this game's
 * text different from most games' text and it is why the limits are lower than
 * a style guide would ask for: a sentence a player has to read twice is a wave
 * lost, and a clause they cannot repeat from memory never reaches the other
 * phone at all.
 *
 * **Nothing here scores.** A readability index would put every line on one
 * axis and give a lane a number to argue with. These are six named failures
 * instead, each of which points at the word to change.
 */

export type RuleId =
  | "over-budget"
  | "long-sentence"
  | "clause-load"
  | "held-breath"
  | "passive"
  | "word";

export interface Finding {
  rule: RuleId;
  detail: string;
}

/**
 * Words a line may spend, by the screen it is read on.
 *
 * `half` is the tightest because it is the one a player reads *and then says*:
 * the sixteen numbered steps the boss guides already ship in run 3 to 17 words,
 * and 18 is that shape with room to breathe. `both` gets more because it is
 * read once, by both players, before anybody has to act. `what` sits under a
 * menu button on a phone. A `name` is a name.
 */
export const BUDGET: Record<string, number> = {
  name: 4,
  both: 30,
  half: 18,
  what: 30,
};

/** A sentence longer than this is two sentences. */
export const MAX_SENTENCE_WORDS = 18;

/** Commas and colons a sentence may hold before it is a list of conditions. */
export const MAX_CLAUSE_MARKS = 2;

/**
 * **A semicolon and an em dash are banned outright, and this is the rule that
 * fires most.** Both of them join two complete thoughts into one breath, which
 * is exactly what a reader repeating a line out loud cannot carry. A full stop
 * costs one character and splits the thought where the voice already splits
 * it. The en dash goes with them: on a phone it is an em dash that did not
 * render.
 */
const HELD_BREATH = /[;—–]/;

/**
 * The words a player reads, and the ones that mean the same thing and must not
 * appear. Small on purpose: every row here is a term the repository already
 * settled somewhere else and then contradicted in player-facing text.
 *
 * The four that were *not* settled — ward against guard against plate against
 * shield — were an `Asks` entry in `docs/queue.md`, because deciding which
 * word a player reads for the thing they slide under a rock is the owner's,
 * not a checker's. He answered **shield** on 21 September 2026: it is what the
 * control is labelled today, so the button a thumb is already on says it and
 * nothing on the panel moves. `guard` stays the control's id in the code, and
 * this row is only ever asked about text a player reads.
 */
export const VOCABULARY: ReadonlyArray<readonly [RegExp, string, string]> = [
  [/\blanes?\b/i, "lane", "column — CLAUDE.md fixes the word and the strip is drawn in columns"],
  [/\bbolts?\b/i, "bolt", "shot — what the player presses is a trigger and what leaves is a shot"],
  [/\bpilot\b/i, "pilot", "Player 1 — a player is never shown the word pilot anywhere"],
  [/\bnavigator\b/i, "navigator", "Player 2 — a player is never shown the word navigator anywhere"],
  [/\bseats?\b/i, "seat", "screen — seat is the code's word for a screen and reaches no player"],
  // One row for the three, because the finding a lane wants is *which word to
  // write*, and it is the same answer whichever of them it found. `warden`,
  // `plated` and `guardrail` are not matched: the boundary is the whole word.
  [
    /\b(?:wards?|warded|warding|guards?|guarded|plates?)\b/i,
    "ward, plate or guard",
    "shield — one word for it, and the control already says it. Say what a hand does: put the shield under it",
  ],
];

/**
 * `is held`, `are thrown`, `is being reached for`. The exceptions are the
 * participles English also uses as plain adjectives, and they were read off
 * the shipped text rather than guessed: `is open` and `is broken` describe a
 * thing, and a rule that flags them is a rule a lane learns to ignore.
 */
const PASSIVE = /\b(?:is|are|was|were|be|been|being)\s+(\w+(?:ed|en))\b/i;
const ADJECTIVAL = new Set([
  // participles English also uses as plain adjectives
  "open",
  "broken",
  "hidden",
  "closed",
  "shut",
  "dead",
  "lit",
  "sunken",
  // and the words that merely end in the same two letters
  "red",
  "even",
  "often",
  "seven",
  "eleven",
  "between",
  "thirteen",
  "fourteen",
  "golden",
  "wooden",
  "sudden",
]);

export function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Full stops, question marks and bangs end a sentence. Nothing else does. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Every rule, against one line. Empty means the line is readable. */
export function findings(text: string, kind: string): Finding[] {
  const out: Finding[] = [];
  const budget = BUDGET[kind];
  if (budget !== undefined && words(text) > budget) {
    out.push({ rule: "over-budget", detail: `${words(text)} words, budget ${budget}` });
  }
  const held = HELD_BREATH.exec(text);
  if (held) {
    out.push({ rule: "held-breath", detail: `"${held[0]}" joins two thoughts — use a full stop` });
  }
  for (const sentence of sentences(text)) {
    const n = words(sentence);
    if (n > MAX_SENTENCE_WORDS) {
      out.push({
        rule: "long-sentence",
        detail: `${n} words in one sentence: "${clip(sentence)}"`,
      });
    }
    const marks = clauseMarks(sentence);
    if (marks > MAX_CLAUSE_MARKS) {
      out.push({ rule: "clause-load", detail: `${marks} clause marks in "${clip(sentence)}"` });
    }
    const passive = PASSIVE.exec(sentence);
    if (passive && !ADJECTIVAL.has(passive[1]!.toLowerCase())) {
      out.push({ rule: "passive", detail: `"${passive[0]}" — say who does it` });
    }
  }
  // **A name is a proper noun and the vocabulary does not reach it.** Every row
  // here says which word a player reads *for a thing*; a wave called THE WARD is
  // a title, and renaming one reaches the director, the perf rows and the
  // baselines. Without this line that wave carries a finding no lane may act on.
  if (kind !== "name") {
    for (const [pattern, banned, use] of VOCABULARY) {
      if (pattern.test(text)) out.push({ rule: "word", detail: `"${banned}" — use ${use}` });
    }
  }
  return out;
}

/**
 * Commas that end a clause, and not the ones that separate items.
 *
 * `LEFT, RIGHT, UP, DOWN` and `three, two, one, zero` are four commas and no
 * clauses at all: a player says each of those as one breath, which is the
 * thing this rule exists to protect. So a mark counts only when what stands
 * before it is three words or more, which is the shortest run in the shipped
 * text that is really a clause.
 */
function clauseMarks(sentence: string): number {
  const parts = sentence.split(/[,:]/);
  let marks = 0;
  for (let i = 0; i < parts.length - 1; i++) {
    if (words(parts[i] ?? "") >= 3) marks++;
  }
  return marks;
}

function clip(s: string): string {
  return s.length > 48 ? `${s.slice(0, 45)}…` : s;
}
