/**
 * Removing a lane's worktree, verified rather than trusted.
 *
 * This used to live in `tools/checks`, where a person ran it by hand after
 * deciding a branch was spent. There is no such deciding any more: a lane is
 * spent the moment its work is on `main`, which is a question git can answer,
 * so the sweep happens inside the landing and nobody is asked to run anything.
 * `run.ts` calls it one line after the fast-forward.
 *
 * Kept apart from `run.ts` because it is the whole answer to one question —
 * *how does a directory actually leave disk*. The retry policy behind it is in
 * `retry.ts`, the idle window in `idle.ts`, and the litter an earlier removal
 * left behind in `orphans.ts`.
 */

import { rm } from "node:fs/promises";
import { gitOrDie } from "./git.js";
import { REMOVE_ATTEMPTS, removeUntilGone, retryOpts } from "./retry.js";

/**
 * Whether a worktree has uncommitted files — and **true** when it cannot be
 * asked at all.
 *
 * That asymmetry is the whole point. This answer is what stops the sweep from
 * removing a directory somebody still has work in, so an unreadable tree has to
 * fail the same way a dirty one does. Guessing the other way loses work — which
 * is also why it goes through `gitOrDie` rather than the swallowing `git()`,
 * whose `""` on failure would read as clean.
 */
export async function isDirty(root: string, worktree: string): Promise<boolean> {
  try {
    return (await gitOrDie(["-C", worktree, "status", "--porcelain"], root)) !== "";
  } catch {
    return true;
  }
}

/**
 * `git worktree remove`, verified rather than trusted, and the one refusal
 * worth talking it out of.
 *
 * The refusal exists to avoid losing work, so that is what gets checked first —
 * before any attempt, not inferred afterward from *why* `git worktree remove`
 * failed. An empty `git status --porcelain` means there is no work in there to
 * lose; a dirty or unreadable tree (`isDirty` fails safe on both) is never
 * touched, and this throws naming the path before trying anything.
 *
 * Once that is settled, the thing usually left in the way is `node_modules`
 * holding a lagging handle, not an actually-occupied directory — every worktree
 * needs its own (`CLAUDE.md`: the main tree's must never be linked in). The
 * handle is transient, so `git worktree remove` itself gets a few plain retries
 * first. Only when that never gets through does a manual `rm` get tried, once,
 * and `git worktree prune` runs *after* the directory is confirmed gone, never
 * before: pruning on a hope is exactly how a stuck lane turns into litter
 * nothing can find again — the failure `orphanPaths` exists to report once it
 * has already happened elsewhere.
 *
 * If the directory still stands after all of that, this throws naming the path —
 * never a bare git error pointing at the wrong thing, and never a silent
 * return.
 */
export async function removeWorktree(root: string, path: string): Promise<void> {
  if (await isDirty(root, path)) {
    throw new Error(`${path}: uncommitted work — left in place`);
  }

  const gitFailed = await removeUntilGone(
    path,
    () => gitOrDie(["worktree", "remove", path], root).then(() => undefined),
    retryOpts(REMOVE_ATTEMPTS),
  );
  if (gitFailed === undefined) return;

  const rmFailed = await removeUntilGone(
    path,
    () => rm(path, { recursive: true, force: true }),
    retryOpts(1),
  );
  if (rmFailed !== undefined) {
    throw new Error(
      `${path}: still on disk after ${REMOVE_ATTEMPTS + 1} attempts — a file inside it is ` +
        `still held open (${rmFailed})`,
    );
  }
  // Confirmed gone at this point, so the registry entry still naming it is
  // stale, not load-bearing — clearing it is cleanup, not what made the
  // removal succeed.
  await gitOrDie(["worktree", "prune"], root).catch(() => {});
}
