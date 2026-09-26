/**
 * What a landing says to `origin` once the trunk has moved: the trunk itself
 * when `pushNow` says so, the count held back when it does not, and the lane's
 * own branch taken off `origin` when a cloud session put it there.
 *
 * Split out of `run.ts` on 26 September 2026, when re-reading the trunk's
 * holder before the move (`trunkMove`) took that file to its 250-line ceiling.
 * The seam is the one the file already had: everything above it moves the
 * trunk here, and everything in this file only tells `origin` about it.
 */

import { git, gitOrDie, runner } from "./git.js";
import { type Cleanup, type Landing, type LandState, pushNow } from "./land.js";
import { deleteRemote, deletionLine } from "./remote-branch.js";

export async function send(
  going: Landing,
  cleanup: Cleanup,
  state: LandState,
  root: string,
): Promise<void> {
  const { branch, trunk } = state;
  const tree = state.trunkTree || root;
  if (pushNow(going, cleanup)) {
    try {
      await gitOrDie(["push", "origin", `${trunk}:${trunk}`], tree);
      console.log(`  pushed   origin/${trunk}`);
    } catch {
      const sha = await git(["rev-parse", "--short", trunk], tree);
      console.log(`✗ ${trunk} is at ${sha} locally; origin was not updated — run: bun run push`);
      process.exit(2);
    }
  } else if (going.mayPush) {
    const behind =
      Number(await git(["rev-list", "--count", `origin/${trunk}..${trunk}`], tree)) || 0;
    const many = behind === 1 ? "commit" : "commits";
    console.log(`  held     origin/${trunk} — ${behind} ${many} unpushed; bun run push sends them`);
  }

  // The branch on `origin`, which only a clone with no worktrees ever put
  // there — a cloud session pushes its lane so the turn has somewhere to
  // report from, and then lands it. Asked once and said in one line either
  // way (`remote-branch.ts`).
  if (going.sweeps && going.moveRef && going.mayPush) {
    const onOrigin = await git(["ls-remote", "--heads", "origin", branch], root);
    if (onOrigin) console.log(deletionLine(await deleteRemote(runner(root), branch), branch));
  }
}
