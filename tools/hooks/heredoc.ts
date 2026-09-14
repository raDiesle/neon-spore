import { heredocDelimiter, heredocEnd } from "./shell-words.ts";

/**
 * The one rule about a heredoc's *body*, which `guard.ts` otherwise treats as
 * data: the Bash tool rewrites that body before the shell sees it, and halves
 * every doubled backslash in it, quoted delimiter or not. Measured on
 * 14 September 2026 with a `cat <<'EOF'` of six lines — `\\0` came out `\0`,
 * `b\\0` came out `b\0`, and a single backslash before a letter survived.
 *
 * Eight `docs/time-log.md` entries since 3 September record the same friction:
 * a JavaScript string, a Python bytes literal or a regex written through a
 * heredoc, halved, rerun, and finally written through the Edit tool or through
 * Python with `chr(92)`. Nothing in the tree said so, and every session found
 * it again. A refusal at the hook is the sentence nobody had to read.
 *
 * Its own file because `guard.ts` and `shell-words.ts` are both a dozen lines
 * under the limit, and because this is the only rule that reads a body rather
 * than an argument.
 */

/** Why the line was refused, and what to do instead — the shape `guard.ts` prints. */
export const HALVED_BACKSLASH = {
  blocked:
    "a heredoc body with a doubled backslash reaches the shell with one — the Bash tool halves it before the shell reads it.",
  instead:
    "Write the text with the Write or Edit tool, or through Python with chr(92) standing in for the backslash. A body with single backslashes only is left alone.",
} as const;

/**
 * Every heredoc body in `line`, in order: the text between the line the `<<`
 * is on and the line carrying its delimiter. A herestring (`<<<`) has no body
 * and is not one of them.
 *
 * `<<` inside a quoted argument is read as a heredoc too. A bash line quoting
 * one is a line *about* a heredoc, which is rarer than a heredoc and never
 * carries a doubled backslash by accident; a scanner that also read quotes
 * would be the third copy of `commandsIn`.
 */
export function heredocBodies(line: string): string[] {
  const bodies: string[] = [];
  let i = line.indexOf("<<");
  while (i !== -1) {
    const found = heredocDelimiter(line, i);
    if (!found) {
      i = line.indexOf("<<", i + 3);
      continue;
    }
    const newline = line.indexOf("\n", found.next);
    if (newline === -1) break;
    const end = heredocEnd(line, newline + 1, found.delim);
    // `heredocEnd` answers with the end of the delimiter's own line, or the
    // line's end when nothing closes the body; the delimiter is not body.
    const lines = line.slice(newline + 1, end).split("\n");
    if (lines.at(-1)?.trim() === found.delim) lines.pop();
    bodies.push(lines.join("\n"));
    i = line.indexOf("<<", end);
  }
  return bodies;
}

/** The refusal a bash line earns for a heredoc body the tool would rewrite, or null. */
export function heredocRefusal(line: string): typeof HALVED_BACKSLASH | null {
  return heredocBodies(line).some((body) => body.includes("\\\\")) ? HALVED_BACKSLASH : null;
}
