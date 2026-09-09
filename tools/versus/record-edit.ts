/**
 * Writing one candidate's field values into the shipped record, in the file.
 *
 * This is the half of an adoption that used to be a person's job: the vote put
 * a prompt on the clipboard and a session opened `hull.ts` and retyped four
 * numbers into it. Every step of that was mechanical and every step of it
 * could go wrong quietly, which is the worst shape a task can have — the
 * expensive half, somebody looking at two phones, is already spent by then.
 *
 * **It refuses far more readily than it writes**, and that is the design. A
 * refusal costs one session five minutes with the file open; a wrong write
 * reverts somebody's later edit and nobody finds out until the look is wrong
 * on a phone. So the value already in the file has to be the value the live
 * record holds, spelled the same way once whitespace is taken out of the
 * question, and anything this cannot see its way through — a missing symbol, a
 * field it cannot find at the top level of the literal, a function — comes back
 * as a `Refusal` naming what it could not do.
 *
 * The comparison is against the **live** record, read at the moment of the
 * adoption, never against a value copied into the candidate. That is the same
 * rule the vote prompt was built on and the reason a candidate never carries a
 * shipped value: a copy in a tool is drift waiting to happen.
 */

import { show } from "./text.js";

/** One field written, and what it said before. */
export interface Edit {
  readonly field: string;
  readonly from: string;
  readonly to: string;
}

/** Why nothing was written. The caller prints it and changes no file at all. */
export interface Refusal {
  readonly why: string;
}

export type Rewrite = { readonly text: string; readonly edits: Edit[] } | Refusal;

export function isRefusal(r: Rewrite): r is Refusal {
  return "why" in r;
}

/**
 * Whitespace and a trailing comma are the two differences that mean nothing
 * between a value in a file and the same value rendered by `show`: a tuple of
 * four stops is written one per line in the source and on one line here.
 * Everything else that differs is a record that has moved, and is a refusal.
 */
function same(a: string, b: string): boolean {
  const flat = (s: string): string => s.replace(/,\s*$/, "").replace(/\s+/g, "");
  return flat(a) === flat(b);
}

/**
 * The span of the object literal `export const <symbol>` is assigned, as
 * offsets into the source, or undefined when the declaration is not there.
 *
 * A hand-rolled scan rather than a parser because the whole job is three
 * characters wide — find a brace, count to its partner, ignore what is inside
 * a string or a comment — and because a parser would put a dependency in a
 * directory whose whole point is that it has no `package.json`.
 */
function literalSpan(src: string, symbol: string): { open: number; close: number } | undefined {
  const decl = new RegExp(`export\\s+const\\s+${symbol}\\b`).exec(src);
  if (!decl) return undefined;
  const open = src.indexOf("{", decl.index);
  if (open < 0) return undefined;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(src, i);
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      if (i < 0) return undefined;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1;
      if (i < 1) return undefined;
      continue;
    }
    if (c === "{" || c === "[" || c === "(") depth++;
    if (c === "}" || c === "]" || c === ")") {
      depth--;
      if (depth === 0) return { open, close: i };
    }
  }
  return undefined;
}

/** The index of the quote closing the string that opens at `i`. */
function skipString(src: string, i: number): number {
  const quote = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") {
      j++;
      continue;
    }
    if (src[j] === quote) return j;
  }
  return src.length;
}

/**
 * Where one field's value starts and ends inside a literal, at the literal's
 * own top level and nowhere deeper.
 *
 * Depth is the whole of it. `rim` appears twice in a record that carries a
 * nested `glow: { rim: … }`, and the one this may write is the outer one; the
 * inner is somebody else's field with the same name. A field found only at
 * depth two is reported as not found, which is a refusal rather than a wrong
 * write.
 */
function fieldSpan(
  src: string,
  span: { open: number; close: number },
  field: string,
): { from: number; to: number } | undefined {
  let depth = 0;
  let found: number | undefined;
  for (let i = span.open; i <= span.close; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(src, i);
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1;
      continue;
    }
    if (c === "{" || c === "[" || c === "(") {
      depth++;
      continue;
    }
    if (c === "}" || c === "]" || c === ")") {
      depth--;
      if (found !== undefined && depth === 0) return { from: found, to: i };
      continue;
    }
    if (found !== undefined && c === "," && depth === 1) return { from: found, to: i };
    if (found !== undefined || depth !== 1) continue;
    const head = new RegExp(`^\\s*${field}\\s*:`).exec(src.slice(i, i + field.length + 8));
    if (head && /[\s{,]/.test(src[i - 1] ?? "")) found = i + head[0].length;
  }
  return undefined;
}

/**
 * The source with every field of one patch written into the record, or the
 * first reason it will not be.
 *
 * `current` is what the live record says right now, so a value in the file that
 * disagrees with it is a record somebody has edited since the candidate was
 * written — and the honest thing to do with that is stop and name the field,
 * never guess which of the two is newer.
 */
export function rewriteRecord(
  src: string,
  symbol: string,
  fields: Record<string, unknown>,
  current: Record<string, unknown>,
): Rewrite {
  const span = literalSpan(src, symbol);
  if (!span) return { why: `no \`export const ${symbol}\` with an object literal in this file` };

  const edits: Edit[] = [];
  let out = src;
  // Right to left, so an edit never moves the offsets of one not yet made.
  const spans = Object.keys(fields)
    .sort()
    .map((field) => ({ field, at: fieldSpan(src, span, field) }));

  for (const { field, at } of spans) {
    if (typeof fields[field] === "function" || typeof current[field] === "function") {
      return {
        why: `\`${field}\` holds a function — adopt can only read one back through the runtime, transpiled, so it would write what the record computes rather than how the file spells it. Take this slot by hand.`,
      };
    }
    if (!at) return { why: `no \`${field}:\` at the top level of \`${symbol}\`` };
    const was = src.slice(at.from, at.to).trim();
    if (!same(was, show(current[field]))) {
      return {
        why: `\`${symbol}.${field}\` reads ${was} in the file and ${show(current[field])} at runtime. The record has moved since this candidate was written; nothing was changed.`,
      };
    }
    edits.push({ field, from: was, to: show(fields[field]) });
  }

  for (const { field, at } of [...spans].reverse()) {
    if (!at) continue;
    const lead = /^\s*/.exec(src.slice(at.from, at.to))?.[0] ?? " ";
    out = out.slice(0, at.from) + lead + show(fields[field]) + out.slice(at.to);
  }
  return { text: out, edits };
}
