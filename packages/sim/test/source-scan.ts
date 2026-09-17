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
 */
export function stripNonCode(source: string): string {
  return (
    source
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
      .replace(/`(?:[^`\]|[\s\S])*`/g, '""')
      // A quoted string's own body is anything but its closing quote or a
      // literal backslash, or a backslash-escaped pair — never "any letter
      // except n": `[^"\\n]` used to exclude the letter n itself, so a hint
      // string with an ordinary word like "navigator" in it was never
      // stripped and read as real code. `bosses.md` 11.0's own hint text is
      // what caught it.
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, '""')
  );
}
