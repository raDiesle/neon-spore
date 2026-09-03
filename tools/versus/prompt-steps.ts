/**
 * Steps 0 to 3 of a vote prompt: the header, the staleness refusal, the
 * adoption itself, the grep for readers the vote never showed, and the derived
 * sheets a content change makes stale.
 *
 * One exported function per step, each taking the same `Prompt` and returning
 * its lines, because `votePrompt` was a single 315-line function whose only
 * structure was a row of banner comments — a shape where the step you want is
 * found by scrolling and the context it reads is whatever happens to be in
 * scope. `Prompt` is that context, named: nothing here reads the raw `Vote`.
 *
 * Steps 4 to 7 — which run whether or not anything won — are next door in
 * `prompt-close.ts`.
 */

import { changes } from "./prompt-changes.js";
import { Count, count, named, quoted, row, wrap } from "./prompt-text.js";
import { declaration, patchedFields, type Variant } from "./variant.js";

/**
 * Everything the steps share, worked out once from the vote. The derived
 * fields are here rather than recomputed per step for the reason the `old`
 * column is read once: two answers to the same question is how a prompt ends
 * up contradicting itself halfway down.
 */
export interface Prompt {
  /** The question, `ship:hull-skin`. */
  readonly slot: string;
  /** `hull skin` — the slot's own words, for the prose. */
  readonly subject: string;
  readonly candidates: readonly Variant[];
  /** The winner, or `null` for `KEEP CURRENT`. */
  readonly won: Variant | null;
  /** Any candidate, for the shape they all share. */
  readonly shape: Variant;
  /** What the records said before anything was applied, per patch of `won`. */
  readonly current: readonly Record<string, unknown>[];
  /** `packages/render`, or both packages, as the slot's patches name them. */
  readonly pkgs: string[];
  /** Every candidate's directory, winner included — step 4 removes them all. */
  readonly dirs: string[];
  /** The files `won` patches, deduplicated. Empty for a keep. */
  readonly files: string[];
  /** Whether anything under `packages/content/` is being written. */
  readonly isContent: boolean;
  /** The widest candidate name, so the header's two columns line up. */
  readonly nameWidth: number;
  readonly why: string;
  readonly head: string;
  readonly dirty: boolean;
  readonly date: string;
}

/** The header: what was voted on, what won, what lost, and against what sha. */
export function header(p: Prompt): string[] {
  const out = [
    wrap(
      `Neon Spore, on \`main\`. ${Count(p.candidates.length)} candidate ` +
        `look${p.candidates.length === 1 ? "" : "s"} for the ${p.subject} ` +
        "were drawn side by side in the director's VERSUS tab — one world, one " +
        "frame, animated, both sides through the shipping renderer at 380 x 820 " +
        "CSS pixels, uncapped — and one was chosen by eye. Adopt what won, " +
        "remove every candidate in the slot, commit.",
    ),
    "",
    row("slot", p.slot),
  ];
  if (p.won) out.push(row("won", named(p.won.name, p.nameWidth, `"${p.won.sentence}"`)));
  else out.push(row("won", named("current", p.nameWidth, `nothing changes in ${quoted(p.pkgs)}`)));
  for (const c of p.candidates) {
    if (c === p.won) continue;
    out.push(row("lost", named(c.name, p.nameWidth, `"${c.sentence}"`)));
  }
  out.push(
    row("why", p.why),
    row("voted", `${p.date}, against ${p.head.slice(0, 7)}, tree ${p.dirty ? "dirty" : "clean"}`),
    "",
  );
  return out;
}

/** 0 — the refusal that makes the `old` column mean something. */
export function beforeAnything(): string[] {
  return [
    wrap(
      "**0. BEFORE ANYTHING ELSE.** Every change below is written `old -> new`. " +
        "If a left-hand value is not what the file says right now, this prompt is " +
        "stale — the record moved after the vote, or the candidate did. Stop, and " +
        "say which value disagreed and what it says instead. Do not work out which " +
        "is newer, do not adopt the spirit of it, and do not re-run the comparison " +
        "yourself.",
    ),
    "",
  ];
}

/** 1 — the adoption, one lettered patch at a time. Nothing for a keep. */
export function adopt(p: Prompt): string[] {
  const { won, files } = p;
  if (!won) return [];
  const dirs1 = new Set(files.map((f) => f.slice(0, f.lastIndexOf("/"))));
  const where =
    dirs1.size === 1 ? `, ${files.length > 1 ? "both" : ""} under \`${[...dirs1][0]}\`` : "";
  const out = [
    wrap(
      `**1. ADOPT \`${won.name}\`.** ${Count(files.length)} ` +
        `file${files.length === 1 ? "" : "s"}${where}, and these values are ` +
        "the whole of it.",
    ),
  ];
  won.patches.forEach((patch, i) => {
    const letter = String.fromCharCode(97 + i);
    const rest = Object.keys(patch.target).filter((k) => !patchedFields(patch).includes(k));
    out.push("", `  (${letter}) ${declaration(patch.where)}`);
    out.push(...changes(patch, p.current[i] ?? {}));
    out.push("");
    out.push(
      wrap(
        (rest.length > 0 && rest.length <= 6
          ? `${quoted(rest)} do not change. `
          : "No other field of this record changes. ") +
          `The doc comment directly above \`${patch.where.symbol}\` is the file's ` +
          "claim about it, not decoration — read it, and if this change makes " +
          "any clause of it false, rewrite that clause. Do not delete it, and " +
          "do not leave it standing if it is now wrong.",
        "      ",
      ),
    );
  });
  out.push("");
  return out;
}

/** 2 — every reader of a changed record, found by grep rather than by memory. */
export function readers(p: Prompt): string[] {
  const { won, files, subject } = p;
  if (!won) return [];
  const symbols = [...new Set(won.patches.map((patch) => patch.where.symbol))];
  const out = [
    wrap(
      "**2. FIND THE READERS THE VOTE DID NOT SHOW YOU.** Run " +
        `${symbols.length === 1 ? "it" : "each of these"}, and read the output ` +
        "rather than watching it exit:",
    ),
    "",
  ];
  for (const s of symbols) out.push(`        git grep -n "\\b${s}\\b" -- packages apps tools`);
  out.push(
    "",
    wrap(
      "Every hit is a reader of a record this prompt just changed. The " +
        `${count(files.length)} file${files.length === 1 ? "" : "s"} under step 1 ` +
        `${files.length === 1 ? "is the one" : "are the ones"} it changed on ` +
        "purpose. For each of the others decide only this: does it draw the " +
        `${subject} somewhere the vote did not show — a menu, a sheet, a card, a ` +
        "test that pins a number? Name what you find, in the report and in step " +
        '7\'s commit body. Do not "fix" any of them, and do not add a second record ' +
        "so that one of them can keep the old numbers.",
    ),
    "",
  );
  return out;
}

/** 3 — the committed sheets a content record is built into. Content only. */
export function regenerate(p: Prompt): string[] {
  if (!p.won || !p.isContent) return [];
  return [
    "**3. REGENERATE WHAT IS DERIVED FROM THEM.**",
    "",
    "        bun run shapes",
    "",
    wrap(
      "`tools/shape-sheet/shape-sheet.svg` and " +
        "`tools/shape-sheet/motion-sheet.svg` are committed files built from " +
        "the records step 1 just changed, and nothing in `bun run check` would " +
        "notice one of them becoming a lie. A derived artefact that is " +
        "committed goes stale in silence, so run this and stage whatever it " +
        "rewrites. If it rewrites nothing, stage nothing — that is a correct " +
        "outcome, not a failure.",
    ),
    "",
  ];
}
