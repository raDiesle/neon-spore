/**
 * Removing a lane's worktree, verified rather than trusted — and the litter
 * left behind when an earlier removal was not.
 *
 * This used to live in `tools/checks`, where a person ran it by hand after
 * deciding a branch was spent. There is no such deciding any more: a lane is
 * spent the moment its work is on `main`, which is a question git can answer,
 * so the sweep happens inside the landing and nobody is asked to run anything.
 * `run.ts` calls it one line after the fast-forward.
 *
 * Kept apart from `run.ts` because it is the whole answer to one question —
 * *how does a directory actually leave disk* — and because the retry policy is
 * worth testing without a filesystem behind it.
 */

import { readdir, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export interface RetryOpts {
  attempts: number;
  delayMs: number;
  exists: (path: string) => Promise<boolean>;
  wait: (ms: number) => Promise<void>;
}

/**
 * Run `remove`, then ask `exists` whether it worked — never the exit code
 * alone, because on Windows `git worktree remove` and a plain `rm -rf` can
 * both report success or failure and be wrong either way while a lagging file
 * handle still holds the directory open (`node_modules` after a `bun install`
 * is the usual culprit).
 *
 * The handle is transient, not adversarial: measured on this machine, a second
 * attempt seconds later succeeded every time with nothing forced and nothing
 * killed. So this retries the same plain removal a few times with a short wait
 * between, rather than escalating to anything sharper — and it asks the
 * filesystem after *every* attempt, including ones where `remove` itself did
 * not throw, because a removal that reports success is not proof the directory
 * is actually gone.
 *
 * Returns `undefined` once the path is confirmed gone, or the last error seen
 * if every attempt left it standing. What a directory that will not go *means*
 * is the caller's decision, not this one's — this only says whether it went.
 */
export async function removeUntilGone(
  path: string,
  remove: () => Promise<void>,
  opts: RetryOpts,
): Promise<string | undefined> {
  let lastError = "";
  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try {
      await remove();
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (!(await opts.exists(path))) return undefined;
    if (attempt < opts.attempts) await opts.wait(opts.delayMs);
  }
  return lastError || "still on disk after removal";
}

/**
 * Directories on disk that git's own worktree list does not mention — the
 * litter a half-finished removal leaves once the directory survives a `remove`
 * that reported success, or a `prune` runs before anyone checked the directory
 * was actually gone. Plain set difference; both lists are pre-resolved to
 * absolute paths by the caller so a trailing slash or a different case does not
 * read as a mismatch.
 */
export function orphanPaths(onDisk: readonly string[], registered: readonly string[]): string[] {
  const known = new Set(registered);
  return onDisk.filter((path) => !known.has(path));
}

async function git(root: string, args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`git ${args.join(" ")}: ${err.trim() || out.trim()}`);
  return out;
}

/**
 * Whether a worktree has uncommitted files — and **true** when it cannot be
 * asked at all.
 *
 * That asymmetry is the whole point. This answer is what stops the sweep from
 * removing a directory somebody still has work in, so an unreadable tree has to
 * fail the same way a dirty one does. Guessing the other way loses work.
 */
async function isDirty(root: string, worktree: string): Promise<boolean> {
  const proc = Bun.spawn(["git", "-C", worktree, "status", "--porcelain"], {
    cwd: root,
    stdout: "pipe",
    stderr: "ignore",
  });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out.trim() !== "" : true;
}

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

function retryOpts(attempts: number): RetryOpts {
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

/**
 * How many **idle** days a merged worktree is left standing before the sweep
 * takes it. `LAND_KEEP_DAYS` overrides it; `0` sweeps immediately.
 *
 * Not zero by default, because the directory outlives the branch in usefulness:
 * its commits are all on `main` and worth nothing, but its `node_modules` is
 * worth the minute a fresh worktree spends on `bun install`, and the review that
 * finds something to adjust usually happens a day or two after the landing.
 *
 * Five rather than three because a weekend is two days — three would take
 * Friday's tree before Monday morning.
 *
 * The one case this cannot cover is a chat session abandoned for longer than
 * the window and then resumed: its working directory is gone, and the session
 * pays a couple of failed tool calls before it re-orients. Nothing is lost when
 * that happens — every commit the tree held is on `main`, which is the
 * precondition for sweeping it at all, so the only casualty is the
 * `node_modules` that made keeping it worthwhile. Raise the window if that
 * trade comes out the other way in practice; no window at all is what left
 * twenty-seven checkouts standing.
 */
export const KEEP_DAYS = keepDays(process.env.LAND_KEEP_DAYS);

/** Exported for the test: a typo must not read as "sweep everything now". */
export function keepDays(raw: string | undefined, fallback = 5): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const days = Number(raw);
  return Number.isFinite(days) && days >= 0 ? days : fallback;
}

/**
 * Days since anything last happened in a worktree — **idle**, not age.
 *
 * Age is the wrong measure: it would take a tree that was worked in yesterday
 * simply because it was created last week, and spare one nobody has opened
 * since it was made. Git keeps per-worktree administrative files under
 * `.git/worktrees/<name>/` and writes them on essentially every command that
 * touches the tree — `status` refreshes the index, `add` and `commit` rewrite
 * it, `checkout` rewrites HEAD — so the newest mtime in that directory is a
 * good answer to "when did somebody last work in here".
 *
 * Returns 0 when it cannot be told, which keeps the tree: an unanswerable
 * question is never grounds for deleting a directory.
 */
export async function idleDays(worktree: string, now = Date.now()): Promise<number> {
  let admin: string;
  try {
    admin = (await git(worktree, ["rev-parse", "--path-format=absolute", "--git-dir"])).trim();
  } catch {
    return 0;
  }
  if (!admin) return 0;

  let newest = 0;
  for (const name of await readdirSafe(admin)) {
    const info = await stat(join(admin, name)).catch(() => null);
    if (info) newest = Math.max(newest, info.mtimeMs);
  }
  const self = await stat(admin).catch(() => null);
  if (self) newest = Math.max(newest, self.mtimeMs);
  if (newest === 0) return 0;

  return Math.max(0, (now - newest) / 86_400_000);
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
  await git(root, ["worktree", "prune"]).catch(() => {});
}
