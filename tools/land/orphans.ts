/**
 * The litter left behind when a removal was trusted instead of verified:
 * directories under `.claude/worktrees` that git's own worktree list has never
 * heard of.
 *
 * Its own file because it is a different question from removing a worktree —
 * that one asks *how does a directory leave disk*, this one asks *which
 * directories should not still be here* — and because the set difference at its
 * centre is worth testing without a filesystem behind it.
 */

import { rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { treeKey } from "../ports.js";
import { gitOrDie } from "./git.js";
import { REMOVE_ATTEMPTS, readdirSafe, removeUntilGone, retryOpts } from "./retry.js";
import { isDirty } from "./worktree.js";

/**
 * Directories on disk that git's own worktree list does not mention — the
 * litter a half-finished removal leaves once the directory survives a `remove`
 * that reported success, or a `prune` runs before anyone checked the directory
 * was actually gone.
 *
 * Plain set difference, over `treeKey` rather than the raw strings: on Windows
 * git prints the path with whatever case it was given and `readdir` prints it
 * with the case on disk, so `C:\Users\...` and `c:/users/...` are one directory
 * that a string compare would report as an orphan and then try to delete out
 * from under a live worktree. The paths that come back are the caller's own
 * spellings; only the comparison is folded.
 */
export function orphanPaths(onDisk: readonly string[], registered: readonly string[]): string[] {
  const known = new Set(registered.map(treeKey));
  return onDisk.filter((path) => !known.has(treeKey(path)));
}

export interface Orphan {
  /** Absolute path, resolved. */
  path: string;
  /** Uncommitted work, or unreadable — either way, left alone. */
  dirty: boolean;
}

/**
 * `.claude/worktrees/` directories that `git worktree list` has never heard of.
 *
 * Read off the *main* checkout's own `.claude/worktrees`, found through the
 * shared `.git` directory rather than assumed from `root`, so this answers the
 * same question no matter which worktree it runs from.
 */
export async function orphanWorktrees(root: string): Promise<Orphan[]> {
  const common = await gitOrDie(["rev-parse", "--path-format=absolute", "--git-common-dir"], root);
  const mainRoot = dirname(common);
  const dir = join(mainRoot, ".claude", "worktrees");

  const onDisk: string[] = [];
  for (const name of await readdirSafe(dir)) {
    const full = join(dir, name);
    if ((await stat(full).catch(() => null))?.isDirectory()) onDisk.push(resolve(full));
  }
  if (onDisk.length === 0) return [];

  const listing = await gitOrDie(["worktree", "list", "--porcelain"], root);
  const registered = listing
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => resolve(line.slice("worktree ".length).trim()));

  const orphans = orphanPaths(onDisk, registered);
  return Promise.all(orphans.map(async (path) => ({ path, dirty: await isDirty(root, path) })));
}

/**
 * Remove one orphan directory — same uncommitted-work refusal as
 * `removeWorktree`, same retry-and-verify, but no `git worktree remove` to try
 * first: git has already forgotten this path, which is the entire reason it
 * showed up here.
 */
export async function removeOrphan(root: string, orphan: Orphan): Promise<void> {
  if (orphan.dirty) {
    throw new Error(`${orphan.path}: uncommitted work, or unreadable — left in place`);
  }
  const failed = await removeUntilGone(
    orphan.path,
    () => rm(orphan.path, { recursive: true, force: true }),
    retryOpts(REMOVE_ATTEMPTS),
  );
  if (failed !== undefined) {
    throw new Error(`${orphan.path}: still on disk after ${REMOVE_ATTEMPTS} attempts (${failed})`);
  }
  // Whatever administrative trace git still had for this path — there should be
  // none, but a stray one is harmless to clear and costly to leave.
  await gitOrDie(["worktree", "prune"], root).catch(() => {});
}
