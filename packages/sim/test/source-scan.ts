/**
 * Comments and string literals are not code, and both guards over this tree —
 * the determinism bans in `purity.test.ts` and the re-derived-rule table in
 * `copies.test.ts` — have to strip them before matching. They share it here so
 * the two cannot drift into disagreeing about what counts as code.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The repository root, three levels up from `packages/sim/test`. */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * Directories no guard over this tree reads, as they appear inside a
 * repository-relative path.
 *
 * The first three are the ones every walk has always skipped: what was
 * installed, what was built, and a lane's own checkout under `.claude`, which
 * is a whole second copy of the repository and would double every guard.
 *
 * **`tools/probe/scratch` is the fourth, and it is the one worth a paragraph.**
 * A probe there is a throwaway a session writes to ask a running world a
 * question — git-ignored by design, run by nothing, asserting nothing. On 17
 * September 2026 it turned out that saying so was not the same as arranging
 * it: `tsconfig.json` read the directory until that day, and `copies.test.ts`
 * read it for an hour longer, failing a lane over `60 / cfg.bpm` written in a
 * scratch file nobody could see in the diff. A guard that reads a throwaway
 * holds a session's rough working to the standard of shipped code, which is
 * the opposite of what a scratch directory is for.
 */
export const UNREAD = ["node_modules", "dist", ".claude", "tools/probe/scratch"] as const;

/**
 * Whether a guard reads this path, given relative to the root.
 *
 * Every walk that reaches the whole tree asks this rather than writing its own
 * chain of `includes`, which is how the four grew apart in the first place.
 * Slashes are normalised first: a Windows checkout hands a glob back with
 * backslashes, and `tools/probe/scratch` matches neither spelling by accident.
 */
export function read(rel: string): boolean {
  const p = rel.replaceAll("\\", "/");
  return !UNREAD.some((skip) => p.includes(skip));
}

/**
 * Comments and string literals are not code. Stripping them keeps the guards
 * honest: `purity.test.ts` names `Math.random` in a ban and must not fail
 * itself, and a message that explains a rule may quote it.
 *
 * **One pass, left to right, rather than a regex per kind.** Until 29
 * September 2026 it was five `replace` calls, each run over what the last had
 * left, so a quote inside a template or a backtick inside a string was read by
 * a later pass as the start of one. The template pass was broken outright: its
 * escape sat inside its character class, the class matched nothing, and only
 * an empty pair of backticks was ever stripped — every guard read template
 * text as code. A template's `${…}` holes are kept, nested or not: they are
 * code, and blanking them would hide a ban inside one. A regex literal is
 * still read as code, as it was by the passes.
 */
export function stripNonCode(source: string): string {
  let out = "";
  // The brace depth each open `${` was opened at, innermost last: the `}`
  // that brings the depth back to it closes the hole and resumes the text.
  const holes: number[] = [];
  let depth = 0;
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end < 0 ? source.length : end + 2;
      out += " ";
    } else if (c === "/" && next === "/") {
      const end = source.indexOf("\n", i);
      i = end < 0 ? source.length : end;
      out += " ";
    } else if ((c === '"' || c === "'") && quotedEnd(source, i) > 0) {
      i = quotedEnd(source, i);
      out += '""';
    } else if (c === "`" || (c === "}" && holes.at(-1) === depth)) {
      if (c === "}") holes.pop();
      const text = templateText(source, i + 1);
      if (text.hole) holes.push(depth);
      out += c === "`" ? '"" ' : " ";
      i = text.end;
    } else {
      if (c === "{") depth++;
      if (c === "}") depth--;
      out += c;
      i++;
    }
  }
  return out;
}

/**
 * One past the closing quote of the string opening at `start`, or -1 when its
 * line ends first. A body is anything but its closing quote or a backslash, or
 * a backslash-escaped pair — never "any letter except n": `[^"\\n]` once
 * excluded the letter n itself, so a hint with "navigator" in it was read as
 * code (`bosses.md` 11.0 caught it). A quote with no close on its line is an
 * apostrophe in something this does not parse, and is left as code rather
 * than let it swallow the lines after it.
 */
function quotedEnd(source: string, start: number): number {
  const q = source[start];
  for (let j = start + 1; j < source.length; j++) {
    const c = source[j];
    if (c === "\\") j++;
    else if (c === q) return j + 1;
    else if (c === "\n") return -1;
  }
  return -1;
}

/** A template's text from `start`: where it stops, and whether at a `${`. */
function templateText(source: string, start: number): { end: number; hole: boolean } {
  for (let j = start; j < source.length; j++) {
    const c = source[j];
    if (c === "\\") j++;
    else if (c === "`") return { end: j + 1, hole: false };
    else if (c === "$" && source[j + 1] === "{") return { end: j + 2, hole: true };
  }
  return { end: source.length, hole: false };
}
