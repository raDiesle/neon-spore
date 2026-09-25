/**
 * Whether an imported name is used anywhere in its file — the half of
 * `imports.ts` that decides, cut out of it on 25 September 2026 when
 * skipping comments beside a hit took that file to 220 lines.
 *
 * A name stays whenever there is any doubt. It is dropped only when it occurs
 * nowhere else in the file outside a comment — a use in a string, a type
 * position or a template's substitution all keep it, and so does a mention the
 * scanner is unsure about. A property or object key of the same spelling is
 * not a mention: `bead.flying` kept an unused `flying` in three lists when
 * `baton.test.ts` was split on 24 September 2026.
 */

import { CODE, COMMENT } from "./classify.js";
import type { ImportDecl } from "./scan.js";

/**
 * Whether the character at `i` is between two pieces of code: whitespace, or
 * any part of a comment. A comment has to be skipped as well, or its last
 * character stands in for the code before a name — the `.` that ends
 * `// (`canvas-stub.ts`).` made the call on the next line,
 * `setDefaultTimeout(FRAME_TIMEOUT_MS);`, read as `.setDefaultTimeout`, and
 * `boss-anchor-c.test.ts` had a live import called unused on 25 September 2026.
 */
function between(text: string, kind: Uint8Array, i: number): boolean {
  return kind[i] === COMMENT || /\s/.test(text[i] ?? "");
}

/** Where the nearest code before `at` is, or -1. */
function before(text: string, kind: Uint8Array, at: number): number {
  let i = at - 1;
  while (i >= 0 && between(text, kind, i)) i--;
  return i;
}

/** The nearest code character from `at` on, or "". */
function after(text: string, kind: Uint8Array, at: number): string {
  let i = at;
  while (i < text.length && between(text, kind, i)) i++;
  return text[i] ?? "";
}

/**
 * Whether a hit in code is only a name *spelled* the same: a property after
 * `.` or `?.` — never a spread's `...`, which reads the binding — or an
 * object key that is not a shorthand, `{ name: 1 }` or `, name: 1`. A key
 * after anything else stays a use, because `c ? name : d` is one.
 */
function sameSpelling(text: string, kind: Uint8Array, at: number, end: number): boolean {
  const dot = before(text, kind, at);
  const prev = text[dot] ?? "";
  if (prev === ".") return text.slice(dot - 2, dot + 1) !== "...";
  return (prev === "{" || prev === ",") && after(text, kind, end) === ":";
}

/**
 * Whether `name` is written anywhere in `text` that is neither a comment, an
 * import, nor a property or key of the same spelling. A hit in a string still
 * counts, since the scanner cannot tell a string from a type there.
 */
export function usedElsewhere(
  name: string,
  text: string,
  kind: Uint8Array,
  decls: readonly ImportDecl[],
): boolean {
  if (name === "") return true;
  const word = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
  for (let hit = word.exec(text); hit !== null; hit = word.exec(text)) {
    const at = hit.index;
    if (kind[at] === COMMENT) continue;
    if (decls.some((d) => at >= d.start && at < d.end)) continue;
    if (kind[at] === CODE && sameSpelling(text, kind, at, at + name.length)) continue;
    return true;
  }
  return false;
}
