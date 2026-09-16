/**
 * **The other rebase: the trunk against `origin/main`.**
 *
 * `land`'s replay covers a lane landing onto the trunk. It does not cover what
 * happens when two sessions both push — the local trunk and `origin`'s have
 * each grown commits the other has not, `bun run push` refuses with *origin/main
 * has N commits yours has not*, and the session reconciles by hand.
 *
 * That hand-reconciliation happened three times on 16 September 2026, twice to
 * one session and once to another, and it was the same four files and the same
 * resolution every time: `docs/queue.md`, `docs/INDEX.md`, `docs/time-log.md`
 * and `docs/release-notes.md` — take origin's copy whole, put this side's own
 * entries back. Every one of those is a file one tool writes and nobody edits,
 * which is to say every one of them is a conflict nobody authored; the fourth
 * is the only one the landing's replay never meets, because `note-commit.ts`
 * writes the release note on the trunk *after* the rebase.
 *
 * So this is `replay.ts` pointed at the other pair of branches, and the whole
 * of what it adds is the two questions a rebase of the trunk asks that a
 * rebase of a lane does not: **which worktree has the trunk checked out**, and
 * **is it clean**. A rebase walks over that tree's files, and it is usually not
 * the tree the session is standing in.
 *
 * It refuses the way the replay refuses. A conflict in anything but those four
 * files stops, a record that would lose a row stops, and the trunk is left
 * exactly where it was — `replay` aborts its own rebase. Nothing here decides
 * anything; a real disagreement is still a person's.
 */

import { git } from "./git.js";
import { replay } from "./replay.js";
import { trunkTree, uncommittedOf } from "./state.js";

export interface Reconciled {
  ok: boolean;
  /** What to print, in order, already indented the way `push.ts` prints. */
  lines: string[];
}

/** Uncommitted paths in a worktree — changed and untracked, as one list. */
async function uncommitted(cwd: string): Promise<string[]> {
  const [changed, untracked] = await Promise.all([
    git(["diff", "--name-only", "HEAD"], cwd),
    git(["ls-files", "--others", "--exclude-standard"], cwd),
  ]);
  return uncommittedOf(changed, untracked);
}

/**
 * Replay the local trunk onto `origin/<trunk>`, settling the records and
 * stopping on anything else.
 *
 * Called only when the push is actually behind: there is nothing to reconcile
 * otherwise, and a rebase that would be a fast-forward is still a rebase, which
 * is a tree walked and a commit rewritten for no reason.
 */
export async function reconcile(root: string, trunk: string): Promise<Reconciled> {
  const tree = await trunkTree(root, trunk);
  if (tree === "") {
    return {
      ok: false,
      // Nothing has the trunk checked out, so there is no worktree to rebase
      // in. It is rare — `land` keeps `main` in the main checkout — and the
      // answer is a person's, because whatever is standing on that branch is
      // not something a push should move.
      lines: [
        `  ✗ no worktree has ${trunk} checked out, so it cannot be replayed onto origin/${trunk}`,
        `    check ${trunk} out somewhere and run this again`,
      ],
    };
  }
  const dirty = await uncommitted(tree);
  if (dirty.length > 0) {
    const many = dirty.length === 1 ? "file" : "files";
    return {
      ok: false,
      lines: [
        `  ✗ ${tree} has ${dirty.length} uncommitted ${many}, and a rebase walks over them`,
        `    ${dirty.slice(0, 4).join(", ")}${dirty.length > 4 ? ", …" : ""}`,
      ],
    };
  }

  const out = await replay(tree, `origin/${trunk}`);
  const settled =
    out.resolved.length > 0
      ? [`  settled  ${[...new Set(out.resolved)].join(", ")}`]
      : ["  settled  nothing to settle — the records agreed"];
  if (!out.ok) {
    const stopped =
      out.conflicted.length > 0
        ? `  ✗ ${out.conflicted.join(", ")} — this one is a real disagreement, and it is yours`
        : `  ✗ the replay stopped: ${out.said || "git said nothing about why"}`;
    return { ok: false, lines: [...settled, stopped, `    ${trunk} is where it was`] };
  }
  return { ok: true, lines: [`  rebased  ${trunk} onto origin/${trunk} in ${tree}`, ...settled] };
}
