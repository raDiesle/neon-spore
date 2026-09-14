/**
 * Whether an entry has gone stale: written before something landed on the
 * files it names.
 *
 * Across the last seventy lanes in `docs/time-log.md` the most frequent
 * bottleneck was *reading*, and half of those were an entry the tree had moved
 * out from under — the files it named had been split or renamed, or a later
 * commit had already done the thing. The session that claimed it found out by
 * reading, which is the expensive way. So the listing says it first: an entry
 * is **stale** when any file its `Files:` line names was touched on the trunk
 * by a commit dated after the entry's `Found:` date, or is not on the trunk at
 * all. Nothing is deleted or rewritten for it — the mark is for the session
 * that claims the item, so it re-reads before it works.
 *
 * The date is the day, not the moment: an entry is queued in the commit that
 * found it, and that commit usually touches the very files it names, so a
 * same-day commit is the entry's own landing rather than something that came
 * after. The comparison is therefore strictly later.
 *
 * **And the trunk's own bookkeeping does not count** (`BOOKKEEPING`). Every
 * landing writes `docs/time-log.md` because `CLAUDE.md` requires one, every
 * claim and every `queue done` writes `docs/queue.md`, and `bun run land`
 * writes `docs/release-notes.md` — so an entry naming any of them was stale
 * from the next landing onward, permanently, however untouched its real
 * subject was. On 14 September 2026 both entries left in the queue were marked
 * against a commit that changed none of their code: it had written a time-log
 * row and a queue claim, and nothing else they named. A warning that fires on
 * every entry forever says nothing about any of them, which is the one thing
 * this mark exists to avoid.
 */

import type { Ran } from "./git.js";
import type { Item } from "./queue.js";

/** The newest trunk commit on one of the entry's files, when it is later than the entry. */
export interface Newer {
  readonly sha: string;
  readonly date: string;
  readonly subject: string;
}

export type Staleness =
  | { readonly kind: "fresh" }
  /** A named file is not on the trunk: moved, split or deleted since. */
  | { readonly kind: "gone"; readonly file: string }
  /** A named file was changed after the entry was written. */
  | { readonly kind: "newer"; readonly newer: Newer };

/** The trunk as this module reads it — a file list and a log, so a test can hand in a repository of its own. */
export interface Trunk {
  /** Every path on the trunk, as `git ls-tree -r --name-only` prints them. */
  readonly tree: readonly string[];
  /** `git log -1 --format=%h%x09%cs%x09%s <trunk> -- <paths>`, or what it printed. */
  readonly log: (paths: readonly string[]) => Ran;
}

/**
 * The files a landing writes by rule rather than by intent, which therefore
 * say nothing about whether an entry's own subject has moved.
 *
 * `docs/INDEX.md` is here for a different reason from the rest: it is
 * generated, and it changes whenever any file anywhere is added or renamed. A
 * rename that matters to an entry is already caught, and caught better, by the
 * `gone` check below, which names the missing file instead of pointing at a
 * commit.
 */
export const BOOKKEEPING: readonly string[] = [
  "docs/queue.md",
  "docs/parked.md",
  "docs/time-log.md",
  "docs/release-notes.md",
  "docs/INDEX.md",
];

/**
 * The entry's files with the bookkeeping taken out — **unless that leaves
 * nothing**, in which case the entry really is about one of those files and
 * they are all it has to be judged on. Over-warning on an entry about
 * `docs/queue.md` itself is the cheap direction to be wrong in; never warning
 * on anything is the expensive one.
 */
export function substantive(files: readonly string[]): readonly string[] {
  const kept = files.filter((f) => !BOOKKEEPING.includes(f.replace(/^[.][/]/, "")));
  return kept.length > 0 ? kept : files;
}

/** The `Found:` line's date, or "" when the entry has none a machine can read. */
export function foundDate(item: Pick<Item, "found">): string {
  return /^\d{4}-\d{2}-\d{2}/.exec(item.found)?.[0] ?? "";
}

/**
 * Whether a `Files:` path names something on the trunk. A path is a file, a
 * directory (with or without its slash) or a glob — `packages/render/test/
 * *-budget.test.ts` is how an entry names four files at once — and each is
 * matched the way a reader would: the file itself, anything under the
 * directory, anything the pattern fits.
 */
export function existsIn(tree: readonly string[], path: string): boolean {
  const clean = path.replace(/^[.][/]/, "").replace(/[/]$/, "");
  if (/[*?]/.test(clean)) return tree.some((p) => globMatch(clean, p));
  return tree.some((p) => p === clean || p.startsWith(`${clean}/`));
}

/** `*` and `?` stop at a slash, `**` does not; nothing else is special. */
function globMatch(pattern: string, path: string): boolean {
  if (pattern === "") return path === "";
  if (pattern.startsWith("**")) {
    const rest = pattern.slice(2);
    for (let i = 0; i <= path.length; i++) if (globMatch(rest, path.slice(i))) return true;
    return false;
  }
  const head = pattern[0];
  if (head === "*") {
    const rest = pattern.slice(1);
    for (let i = 0; i <= path.length; i++) {
      if (i > 0 && path[i - 1] === "/") return false;
      if (globMatch(rest, path.slice(i))) return true;
    }
    return false;
  }
  if (path === "") return false;
  if (head === "?") return path[0] !== "/" && globMatch(pattern.slice(1), path.slice(1));
  return head === path[0] && globMatch(pattern.slice(1), path.slice(1));
}

/** One line of `git log --format=%h%x09%cs%x09%s`, or null when there was none. */
export function parseLog(out: string): Newer | null {
  const line = out.split("\n")[0]?.trim() ?? "";
  const m = /^(\S+)\t(\d{4}-\d{2}-\d{2})\t(.*)$/.exec(line);
  return m ? { sha: m[1] ?? "", date: m[2] ?? "", subject: m[3] ?? "" } : null;
}

/** The entry's staleness against the trunk. An entry with no date or no files is left alone: `problemsIn` already says what is wrong with it. */
export function staleness(item: Item, trunk: Trunk): Staleness {
  const since = foundDate(item);
  if (!since || item.files.length === 0) return { kind: "fresh" };
  // Every file it names, bookkeeping included: a named file that is not on the
  // trunk has moved whatever kind of file it is, and that is worth saying.
  const gone = item.files.find((f) => !existsIn(trunk.tree, f));
  if (gone !== undefined) return { kind: "gone", file: gone };
  const r = trunk.log(substantive(item.files));
  const newer = r.ok ? parseLog(r.out) : null;
  if (newer && newer.date > since) return { kind: "newer", newer };
  return { kind: "fresh" };
}

/** The listing's line under an entry, or undefined when there is nothing to say. */
export function staleLine(s: Staleness, trunk = "main"): string | undefined {
  if (s.kind === "gone") return `stale — ${s.file} is not on ${trunk}; re-read before working it`;
  if (s.kind === "newer") {
    const { sha, date, subject } = s.newer;
    return `stale — a file it names changed after it: ${sha} ${subject} (${date}); re-read before working it`;
  }
  return undefined;
}
