/**
 * One patch's `old -> new`, which is the half of a vote prompt a cold session
 * actually checks against the files before writing anything.
 *
 * The left-hand column is read off the live record at the moment of the vote
 * and never copied into a candidate, so a record that has moved since makes one
 * value disagree — and step 0 turns that disagreement into a refusal instead of
 * a silent revert of somebody's later edit. That is the whole reason this
 * rendering exists rather than a list of new values.
 */

import { block, show, wrap } from "./prompt-text.js";
import { type Patch, patchedFields, type Variant } from "./variant.js";

/**
 * One record's changes. Short values go in an aligned `old -> new` table; a
 * replacement function or a tuple of four stops gets its own before-and-after,
 * because a value that will not fit in a column is still a value that has to
 * be checked against the file before it is written.
 */
export function changes(p: Patch, current: Record<string, unknown>): string[] {
  const out: string[] = [];
  const next = p.fields as Record<string, unknown>;
  const short: [string, string, string][] = [];
  const long: string[] = [];
  for (const f of patchedFields(p)) {
    const [o, n] = [show(current[f]), show(next[f])];
    if (o.length <= 28 && n.length <= 28 && !o.includes("\n") && !n.includes("\n")) {
      short.push([f, o, n]);
    } else long.push(f);
  }
  if (short.length > 0) {
    const fw = Math.max(...short.map((s) => s[0].length)) + 3;
    const ow = Math.max(...short.map((s) => s[1].length)) + 2;
    out.push("");
    for (const [f, o, n] of short) out.push(`          ${f.padEnd(fw)}${o.padEnd(ow)}->  ${n}`);
  }
  for (const f of long) {
    // A function is the one value the tool cannot quote off the file: it only
    // has the live one, and what `toString` hands back has been through the
    // transpiler, so it is what the record *computes* and not how the file
    // spells it. Saying "reads exactly this" there would fail step 0 on every
    // whitespace difference, which is a refusal that teaches a session to
    // ignore refusals. So the claim is weakened to exactly what is true.
    const fn = typeof current[f] === "function" || typeof next[f] === "function";
    out.push(
      "",
      wrap(
        fn
          ? `\`${f}\` is a function, and the tool can only read it back through ` +
              "the runtime, transpiled — compare what it computes, not how it is " +
              "spelled. Right now it computes this:"
          : `\`${f}\` reads exactly this right now —`,
        "      ",
      ),
      "",
    );
    out.push(...block(show(current[f])), "");
    out.push(
      wrap(
        fn ? "and it must compute exactly this instead:" : "— and must read exactly this instead:",
        "      ",
      ),
      "",
    );
    out.push(...block(show(next[f])));
  }
  return out;
}

/** `packages/render`, or both packages, as the slot's patches name them. */
export function packagesOf(v: Variant): string[] {
  const seen = new Set(v.patches.map((p) => p.where.file.split("/").slice(0, 2).join("/")));
  return [...seen].sort();
}
