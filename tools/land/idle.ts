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
 * since it was made. So the question is which file on disk moves when work
 * happens and stays still while nobody is working.
 *
 * It is not the administrative directory. `.git/worktrees/<name>/` was the
 * first answer here, on the reasoning that git writes something in there on
 * essentially every command that touches the tree — which is exactly what makes
 * it useless: `status`, `rev-parse` and the sweep's own probe all rewrite it, so
 * the clock is reset by looking at it. Measured across forty worktrees on
 * 5 September 2026, every one read 0.0 idle days, several of them last actually
 * worked in two days earlier, and `KEEP_DAYS` was therefore unreachable. Forty
 * checkouts had accumulated, each with its own `node_modules`.
 *
 * `logs/HEAD` inside that directory is the answer instead: the reflog of the one
 * ref this worktree owns, appended to when that ref *moves* — a checkout, a
 * commit, a rebase, a reset — and by nothing that merely reads. On the same
 * forty trees at the same moment it spread them from 0.1 to 12.3 hours and
 * separated the live sessions from the litter cleanly.
 *
 * Returns 0 when it cannot be told, which keeps the tree: an unanswerable
 * question is never grounds for deleting a directory. A worktree whose reflog
 * was expired or never written therefore reads as worked-in a moment ago, which
 * is the safe way round.
 */
export async function idleDays(worktree: string, now = Date.now()): Promise<number> {
  let admin: string;
  try {
    admin = await gitOrDie(["rev-parse", "--path-format=absolute", "--git-dir"], worktree);
  } catch {
    return 0;
  }
  if (!admin) return 0;
  return idleFrom(admin, now);
}

/** When a path was last written, or `null` — the only disk this file touches. */
export type MtimeOf = (path: string) => Promise<number | null>;

const statMtime: MtimeOf = async (path) => (await stat(path).catch(() => null))?.mtimeMs ?? null;

/**
 * The policy half, over an administrative directory somebody else has already
 * found — split out so a test can hand it a clock and a fake disk and say which
 * file it was allowed to look at. Reading a second file here would be the whole
 * defect coming back.
 */
export async function idleFrom(
  admin: string,
  now: number,
  mtimeOf: MtimeOf = statMtime,
): Promise<number> {
  const written = await mtimeOf(join(admin, "logs", "HEAD"));
  if (written === null) return 0;
  return Math.max(0, (now - written) / 86_400_000);
}
