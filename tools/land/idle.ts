/**
 * How long a merged worktree is left standing, and how long it has been since
 * anybody worked in one.
 *
 * Its own file because it is a policy question rather than a removal: nothing
 * here touches disk except to read an mtime, and the number it produces is the
 * only thing standing between a directory somebody is using and the sweep.
 */

import { stat } from "node:fs/promises";
import { join } from "node:path";
import { gitOrDie } from "./git.js";
import { readdirSafe } from "./retry.js";

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
    admin = await gitOrDie(["rev-parse", "--path-format=absolute", "--git-dir"], worktree);
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
