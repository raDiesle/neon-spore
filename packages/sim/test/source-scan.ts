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
