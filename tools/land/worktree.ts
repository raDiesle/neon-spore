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
 * Take a spent worktree off disk, verified rather than trusted, and only then
 * tell git it is gone.
 *
 * The refusal exists to avoid losing work, so that is what gets checked first —
 * before any attempt, not inferred afterward from why a removal failed. An
 * empty `git status --porcelain` means there is no work in there to lose; a
 * dirty or unreadable tree (`isDirty` fails safe on both) is never touched, and
 * this throws naming the path before trying anything.
 *
 * **The directory goes first and the registry entry second**, which is the
 * opposite of what this used to do. `git worktree remove` deregisters and
 * *then* deletes, and on Windows the delete is the half that fails —
 * `Directory not empty`, a lagging handle inside the `node_modules` every
 * worktree has to have of its own (`CLAUDE.md`: the main tree's must never be
 * linked in). Twenty-four removals on 5 September 2026 produced twenty-four of
 * those, each one finished by hand with `rm -rf`. The landing survived it
 * because of the fallback below, but the window between the two halves is
 * exactly the orphan `orphans.ts` exists to report: a sweep interrupted in
 * there leaves a directory git has already forgotten.
 *
 * So there is no window. `rm` takes the tree, with the same plain retries the
 * lagging handle wants — it is transient, not adversarial (`retry.ts`) — and
 * `git worktree prune` runs only once the path is confirmed gone, which makes
 * deregistering a bookkeeping step that cannot be interrupted into litter.
 *
 * If the directory still stands after all of that, this throws naming the path —
 * never a bare git error pointing at the wrong thing, and never a silent
 * return.
 */
export async function removeWorktree(root: string, path: string): Promise<void> {
  if (await isDirty(root, path)) {
    throw new Error(`${path}: uncommitted work — left in place`);
  }

  const failed = await removeUntilGone(
    path,
    () => rm(path, { recursive: true, force: true }),
    retryOpts(REMOVE_ATTEMPTS),
  );
  if (failed !== undefined) {
    throw new Error(
      `${path}: still on disk after ${REMOVE_ATTEMPTS} attempts — a file inside it is ` +
        `still held open (${failed})`,
    );
  }
  // Confirmed gone, so this is the deregistration rather than the removal. It
  // is also the only step git does here, which is why a failure in it cannot
  // leave a half-removed lane behind.
  await gitOrDie(["worktree", "prune"], root).catch(() => {});
}
