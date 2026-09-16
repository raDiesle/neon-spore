/**
 * The ~250-line ceiling, written once and read by both things that care.
 *
 * `packages/sim/test/limits.test.ts` is the rule and stays the rule: a file
 * over the limit is a red `bun run check`. What it cannot do is arrive in
 * time. Across the 296 lanes in `docs/time-log.md`, 27 of them spent 375
 * minutes on this ceiling, and the shape of the loss was always the same —
 * the file was discovered to be over **when the check went red**, with the
 * change already spread through it, so the seam had to be chosen under a diff
 * that was about something else. `docs/lane-speed.md` has the reading; one
 * lane on 16 September lost 55 minutes to five files going over in turn.
 *
 * So the same numbers are read a second time by `after-edit-size.ts`, which
 * says a file is filling up at the moment it is written, while there is still
 * a choice about where to cut. **One copy, in a module rather than in either
 * of them**: the constants cannot live in the test, because a hook importing a
 * test file would run its `describe` blocks, and they must not live in the
 * hook, because a rule the hook owns is a rule the check does not.
 */

/** The ceiling. A source file over this fails `limits.test.ts`. */
export const LIMIT = 250;

/**
 * How much of a file's ceiling is spent before the hook says anything.
 *
 * A share rather than a number, so moving the ceiling moves the warning with
 * it — the alternative is a second constant that goes stale silently, which is
 * the failure this module exists to stop one level up. 88% of 250 is 220, and
 * the thirty lines that leaves are about a paragraph: enough to finish the
 * thought being written and then decide, rather than enough to forget.
 */
export const MARK_SHARE = 0.88;

/**
 * `waves.ts` used to be the one file that could not be split by the lane that
 * fills it: the director rewrote the `WAVES` array in place, and
 * `serialize.ts` found `export const WAVES: Wave[] = [` and regenerated
 * everything after it, so an array spread across two files would have been
 * flattened back into one the next time anybody saved a wave in the editor.
 *
 * It is split now, by act, into `packages/content/src/waves/act-*.ts` —
 * `act-1.ts` is the tutorial arc, `act-2.ts` is the first five bosses,
 * `act-3.ts` is everything after them. `waves.ts` itself is only the barrel
 * that concatenates the three, so it stays short no matter how many waves the
 * acts hold; `tools/director/src/serialize.ts` regenerates one act file at a
 * time. There is currently nothing left in `KNOWN_LONG` — an act file that
 * fills up in its own turn gets a fourth act beside it, not an entry here.
 */
/**
 * Files over the limit that the ratchet did not use to reach, at the length
 * they had when it started reaching them. They may shrink and never grow.
 *
 * **It is empty, and the aim is that it stays empty.** It was seeded with five
 * tool entry points — the class the old glob missed, because it only looked
 * inside `src/` and a tool's entry point sits above one — rather than split on
 * the spot, since five seams chosen by a lane that owns none of the five are
 * five seams nobody chose. All five have since been split by lanes that did own
 * them, the last being `tools/versus/prompt.ts` at 509 lines.
 *
 * A new entry is a promise to split a file later, and the only reason to make
 * one is that the split is a real decision the current lane cannot make.
 */
export const KNOWN_LONG: Record<string, number> = {};

/** What a file is held to: its own recorded maximum, or the ceiling. */
export function ceiling(rel: string): number {
  return KNOWN_LONG[rel] ?? LIMIT;
}

/** The count at which the hook speaks about this file. */
export function mark(rel: string): number {
  return Math.round(ceiling(rel) * MARK_SHARE);
}

/**
 * Whether the ceiling applies to this path at all, given relative to the root.
 *
 * The same exclusions `limits.test.ts` has always made, and it now makes them
 * by calling this. The glob over there reaches the whole tree rather than only
 * what is under a `src/` directory: a file outside one is still a file
 * somebody has to read, and the four longest in the repository were all
 * outside one. A test is exempt because a test is read the
 * way the thing it tests is read — a fixture that lists one of everything is
 * long because the thing it lists is long, and splitting it would only hide
 * that.
 */
export function counted(rel: string): boolean {
  const p = rel.replaceAll("\\", "/");
  if (!p.endsWith(".ts") || p.endsWith(".test.ts")) return false;
  if (p.includes("node_modules/") || p.includes("dist/") || p.includes("/test/")) return false;
  return /^(packages|apps|tools)\//.test(p);
}

/**
 * Lines as `wc -l` and every editor count them: a trailing newline ends the
 * last line, it does not begin an empty one, and an empty file has none at all.
 */
export function lineCount(text: string): number {
  if (text === "") return 0;
  return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
}

/**
 * The one line the hook prints, or nothing.
 *
 * It names the file, its count and what it is held to, in that order, because
 * the only question being answered is *how much room is left*. The clause
 * after the dash is the whole reason for saying it early at all: a seam is
 * cheap to choose now and expensive to choose from under an unrelated diff.
 */
export function notice(rel: string, lines: number): string | null {
  const p = rel.replaceAll("\\", "/");
  if (!counted(p) || lines < mark(p)) return null;
  const max = ceiling(p);
  const where = "packages/sim/test/limits.test.ts";
  if (lines > max) {
    return `${p} is ${lines} lines, past the ${max}-line ceiling — bun run check is red until it is split (${where}).`;
  }
  const room =
    lines === max ? `at the ${max}-line ceiling` : `${max - lines} under the ${max}-line ceiling`;
  return `${p} is ${lines} lines, ${room} — choose the seam now, while this diff is the one that is about it (${where}).`;
}
