/**
 * Removing a worktree's directory, verified rather than trusted, and the
 * orphans left behind when an earlier removal was not.
 *
 * Split out of `repo.ts` to keep that file to reading the trunk and the
 * ledger — this one file is the whole answer to "how does a directory
 * actually leave disk", used by `deleteBranch` for a registered worktree
 * and by `bun run checks --clean` again for the litter a half-finished
 * removal left with no registry entry at all.
 */

import { readdir, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { git, isDirty } from "./repo.js";
import { orphanPaths, removeUntilGone } from "./sweep.js";

/** Whether a path is still on disk. */
async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readdirSafe(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

/** How many plain retries a stuck handle gets, and how long to wait between. */
const REMOVE_ATTEMPTS = 3;
const REMOVE_DELAY_MS = 1500;

function retryOpts(attempts: number) {
  return {
    attempts,
    delayMs: REMOVE_DELAY_MS,
    exists: pathExists,
    wait: (ms: number) => Bun.sleep(ms),
  };
}

/**
 * `git worktree remove`, verified rather than trusted, and the one refusal
 * worth talking it out of.
 *
 * The refusal exists to avoid losing work, so that is what gets checked
 * first — before any attempt, not inferred afterward from *why* `git
 * worktree remove` failed. An empty `git status --porcelain` means there is
 * no work in there to lose; a dirty or unreadable tree (`isDirty` fails safe
 * on both) is never touched, and this throws naming the path before trying
 * anything.
 *
 * Once that is settled, the thing usually left in the way is `node_modules`
 * holding a lagging handle, not an actually-occupied directory — every
 * worktree needs its own (`CLAUDE.md`: the main tree's must never be linked
 * in). The handle is transient, so `git worktree remove` itself gets a few
 * plain retries first — see `removeUntilGone` in `sweep.ts` for why a retry
 * rather than a fight. Only when that never gets through does a manual `rm`
 * get tried, once, and `git worktree prune` runs *after* the directory is
 * confirmed gone, never before: pruning on a hope is exactly how a stuck
 * lane turns into litter nothing can find again — the failure `orphanPaths`
 * exists to report once it has already happened elsewhere.
 *
 * If the directory still stands after all of that, this throws naming the
 * path — never a bare git error pointing at the wrong thing, and never a
 * silent return.
 */
export async function removeWorktree(root: string, path: string): Promise<void> {
  if (await isDirty(root, path)) {
    throw new Error(`${path}: uncommitted work — left in place`);
  }

  const gitFailed = await removeUntilGone(
    path,
    () => git(root, ["worktree", "remove", path]).then(() => undefined),
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
  await git(root, ["worktree", "prune"]).catch(() => {});
}

export interface Orphan {
  /** Absolute path, resolved. */
  path: string;
  /** Uncommitted work, or unreadable — either way, left alone. */
  dirty: boolean;
}

/**
 * `.claude/worktrees/` directories that `git worktree list` has never heard
 * of — the litter `docs/parked.md` measured at 22 in one day. Read off the
 * *main* checkout's own `.claude/worktrees`, found through the shared `.git`
 * directory rather than assumed from `root`, so this answers the same
 * question no matter which worktree it runs from.
 */
export async function orphanWorktrees(root: string): Promise<Orphan[]> {
  const common = (
    await git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"])
  ).trim();
  const mainRoot = dirname(common);
  const dir = join(mainRoot, ".claude", "worktrees");
  const names = await readdirSafe(dir);

  const onDisk: string[] = [];
  for (const name of names) {
    const full = join(dir, name);
    if ((await stat(full).catch(() => null))?.isDirectory()) onDisk.push(resolve(full));
  }
  if (onDisk.length === 0) return [];

  const listing = await git(root, ["worktree", "list", "--porcelain"]);
  const registered = listing
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => resolve(line.slice("worktree ".length).trim()));

  const orphans = orphanPaths(onDisk, registered);
  return Promise.all(orphans.map(async (path) => ({ path, dirty: await isDirty(root, path) })));
}

/**
 * Remove one orphan directory — same uncommitted-work refusal as
 * `removeWorktree`, same retry-and-verify, but no `git worktree remove` to
 * try first: git has already forgotten this path, which is the entire
 * reason it showed up here.
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
  // Whatever administrative trace git still had for this path — there
  // should be none, but a stray one is harmless to clear and costly to leave.
  await git(root, ["worktree", "prune"]).catch(() => {});
}
