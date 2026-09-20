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

import { git, gitOrDie } from "./git.js";
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

/** The refusal a tree with uncommitted work gets — a rebase walks over them. */
function tooDirty(what: string, dirty: readonly string[]): Reconciled {
  const many = dirty.length === 1 ? "file" : "files";
  return {
    ok: false,
    lines: [
      `  ✗ ${what} has ${dirty.length} uncommitted ${many}, and a rebase walks over them`,
      `    ${dirty.slice(0, 4).join(", ")}${dirty.length > 4 ? ", …" : ""}`,
    ],
  };
}

/** The replay itself, reported the same way wherever it was run. */
function reported(
  out: Awaited<ReturnType<typeof replay>>,
  head: string,
  trunk: string,
): Reconciled {
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
  return { ok: true, lines: [head, ...settled] };
}

/**
 * **No worktree holds the trunk, which is every session started from a phone.**
 *
 * A cloud clone is one checkout standing on its own lane branch; `main` is a
 * ref beside it and nothing has it out. This used to refuse with *check main
 * out somewhere and run this again*, which is a worktree added by hand before
 * the command that exists to save the hand-work will run at all — and it was
 * paid on 20 September 2026, to reconcile a trunk that had been unreconcilable
 * since the 19th.
 *
 * `note-commit.ts` already has the answer for its own half of the same problem:
 * where there is no second checkout, the session's own is the trunk's content,
 * so it writes there and moves the ref afterwards. This is that, with a rebase
 * in the middle — the trunk is checked out detached here, replayed, and the ref
 * is forced onto what came out. The lane is put back at the end whether the
 * replay worked or not, so the session ends standing where it started.
 *
 * The one thing it will not do is walk over work: a dirty checkout refuses,
 * exactly as a dirty trunk worktree does, because there the files at risk are
 * the session's own.
 */
async function inPlace(root: string, trunk: string): Promise<Reconciled> {
  const dirty = await uncommitted(root);
  if (dirty.length > 0) return tooDirty("this checkout", dirty);
  // Where to put the checkout back. A branch name when there is one, the sha
  // when HEAD is already detached — `git checkout` takes either.
  const was =
    (await git(["symbolic-ref", "--quiet", "--short", "HEAD"], root)) ||
    (await git(["rev-parse", "HEAD"], root));
  if (was === "") {
    return { ok: false, lines: [`  ✗ this checkout is not standing on anything to put back`] };
  }
  try {
    await gitOrDie(["checkout", "--quiet", "--detach", trunk], root);
  } catch (why) {
    return { ok: false, lines: [`  ✗ could not check ${trunk} out here: ${String(why)}`] };
  }
  try {
    const out = await replay(root, `origin/${trunk}`);
    if (out.ok) await gitOrDie(["branch", "--force", trunk, "HEAD"], root);
    return reported(out, `  rebased  ${trunk} onto origin/${trunk} in this checkout`, trunk);
  } finally {
    // Always, and before anything is printed: a session left detached on the
    // trunk would commit its next piece of work onto no branch at all.
    await gitOrDie(["checkout", "--quiet", was], root);
  }
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
  if (tree === "") return inPlace(root, trunk);
  const dirty = await uncommitted(tree);
  if (dirty.length > 0) return tooDirty(tree, dirty);

  const out = await replay(tree, `origin/${trunk}`);
  return reported(out, `  rebased  ${trunk} onto origin/${trunk} in ${tree}`, trunk);
}
