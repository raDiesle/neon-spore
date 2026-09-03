/**
 * VERSUS — the text a vote puts on the clipboard, and the only thing it leaves.
 *
 * A vote writes no file, no git, no localStorage and no server call. After the
 * prompt has been pasted and run, `main` holds one version and no candidates,
 * so the whole decision rides on one string built here. It lives beside
 * `variant.ts` rather than in the director because it is pure string work with
 * no DOM in it, which is exactly the part worth a test.
 *
 * The reader it is written for is a session pasting it three weeks late with
 * no memory of the vote. Two things follow, and they are the whole design.
 *
 * Every field carries its own `old -> new`, with the left-hand side read off
 * the live record at the moment of the vote rather than copied into the
 * candidate. A record that has since moved makes one left-hand value disagree
 * with the file, and step 0 turns that into a refusal instead of a silent
 * revert of somebody's later edit. The instruction there is to *name which
 * value disagreed*, never to work out which is newer: a cold session cannot
 * know, and guessing destroys work quietly.
 *
 * And nothing here predicts a result. `git grep` is emitted with no claim
 * about what it will find — the one place proposal 3's prompt was wrong was a
 * sentence asserting what that grep would return, and it was wrong about five
 * files. `docs/versus.md` carries the design and the template.
 *
 * **This file is now the vote, the refusals and the running order, and nothing
 * else.** The text layout is in `prompt-text.ts`, one patch's `old -> new` in
 * `prompt-changes.ts`, and the steps themselves in `prompt-steps.ts` and
 * `prompt-close.ts`. It was one 509-line file with a 315-line function in it,
 * the longest in the repository and the only entry left in `KNOWN_LONG`.
 */

import { packagesOf } from "./prompt-changes.js";
import { check, commit, removeSlot, whatNotToDo } from "./prompt-close.js";
import { adopt, beforeAnything, header, type Prompt, readers, regenerate } from "./prompt-steps.js";
import { currentValues, type Variant } from "./variant.js";

/** One decision, and everything the prompt cannot derive from the registry. */
export interface Vote {
  /** The question, `ship:hull-skin`. */
  readonly slot: string;
  /** Every candidate offered in it, winner included, in registry order. */
  readonly candidates: readonly Variant[];
  /** The winner, one of `candidates` — or `null`, which is `KEEP CURRENT`. */
  readonly won: Variant | null;
  /**
   * What the records said *before* anything was applied, one entry per patch
   * of `won`, in the same order. Read with `readCurrent` at the moment of the
   * vote; never copied into a candidate, because a copy of a shipped value in
   * a tool is the drift this whole arrangement exists to prevent.
   */
  readonly current: readonly Record<string, unknown>[];
  /** The sentence a person typed before pressing. Quoted verbatim. */
  readonly why: string;
  /** The sha the vote was cast against. Shortened to git's own seven. */
  readonly head: string;
  /** Whether the tree was dirty then — the values may not be in any commit. */
  readonly dirty: boolean;
  /** `2026-08-27`. Passed in: nothing here reads a clock. */
  readonly date: string;
}

/** The `old` column, read off the live records. Call it before `apply`. */
export function readCurrent(v: Variant): Record<string, unknown>[] {
  return v.patches.map(currentValues);
}

/**
 * The three refusals, before a single line of prose is built. Each one is a
 * prompt that would otherwise be pasted and run: a slot with nothing in it, a
 * winner from another slot, a patch reaching into the simulation, or an `old`
 * column that does not line up with the patches it is meant to describe.
 */
function refuse(vote: Vote): Variant {
  const { slot, candidates, won } = vote;
  const shape = candidates[0];
  if (!shape) throw new Error(`votePrompt: ${slot} has no candidates`);
  if (won && !candidates.includes(won)) {
    throw new Error(`votePrompt: ${won.name} is not a candidate of ${slot}`);
  }
  for (const c of candidates) {
    for (const p of c.patches) {
      // Not a style rule. The simulation is not votable, and a prompt that
      // ever named a path under it would be asking for the one change this
      // whole directory exists to stay out of.
      if (p.where.file.startsWith("packages/sim/")) {
        throw new Error(`votePrompt: ${slot} patches ${p.where.file} — sim is not votable`);
      }
    }
  }
  if (won && vote.current.length !== won.patches.length) {
    throw new Error(
      `votePrompt: ${won.name} has ${won.patches.length} patches and ` +
        `${vote.current.length} current readings — they are read per patch, in order`,
    );
  }
  return shape;
}

/** Everything the steps share, worked out once. */
function prompted(vote: Vote, shape: Variant): Prompt {
  const { slot, candidates, won } = vote;
  return {
    slot,
    subject: slot.slice(slot.indexOf(":") + 1).replace(/-/g, " "),
    candidates,
    won,
    shape,
    current: vote.current,
    pkgs: packagesOf(shape),
    dirs: candidates.map((c) => c.dir),
    files: [...new Set((won?.patches ?? []).map((p) => p.where.file))],
    isContent: (won?.patches ?? []).some((p) => p.where.file.startsWith("packages/content/")),
    nameWidth: Math.max(...candidates.map((c) => c.name.length)),
    why: vote.why,
    head: vote.head,
    dirty: vote.dirty,
    date: vote.date,
  };
}

/**
 * The whole text, for `ADOPT <name>` when `won` is a candidate and for
 * `KEEP CURRENT` when it is null. The two forms differ in five places and no
 * others — the `won` row, the `lost` rows, steps 1 to 3 and step 6's
 * `shapes:report`, step 7's staging list, and the readers — which is what
 * `test/prompt.test.ts` holds them to. A keep is an adoption whose file list
 * happens to be empty, and making it look like a different, easier kind of job
 * is how a decided slot survives on the sheet with a vote button still under it.
 */
export function votePrompt(vote: Vote): string {
  const p = prompted(vote, refuse(vote));
  const out = [
    ...header(p),
    ...beforeAnything(),
    ...adopt(p),
    ...readers(p),
    ...regenerate(p),
    ...removeSlot(p),
    ...whatNotToDo(p),
    ...check(p),
    ...commit(p),
  ];
  return `${out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()}\n`;
}
