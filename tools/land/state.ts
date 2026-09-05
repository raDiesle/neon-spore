import { git, trunkAgainstOrigin } from "./git.js";
import type { LandState } from "./land.js";

/**
 * The facts a landing is decided from, read off git.
 *
 * `land.ts` is pure and `run.ts` moves refs; this is the third thing, and it
 * was cut out of `run.ts` when that file went over its 250 lines. Reading and
 * deciding are different jobs — every one of these numbers is a question put to
 * a repository, and `plan` must be answerable without one.
 */

/**
 * Uncommitted work in a worktree: paths whose **content** differs from `HEAD`,
 * plus files git is not tracking yet.
 *
 * Deliberately not `git status --porcelain`. Git keeps a cached stat for every
 * index entry, and a file rewritten with identical bytes invalidates that cache
 * without changing anything — on this machine the harness does exactly that to
 * `.claude/launch.json`. `status` then reports ` M` for a file whose blob
 * matches `HEAD`, `git update-index --refresh` does not clear it, and a landing
 * stops on a file the lane never touched, saying the lane has uncommitted work
 * when it has none. Content cannot lie that way: `git diff --name-only HEAD`
 * sees a stat-only difference as no difference at all.
 *
 * The untracked half has to come from `git ls-files --others`, because a diff
 * against `HEAD` is blind to a file git has never heard of — and a new file
 * the lane forgot to add is exactly the uncommitted work worth refusing for.
 */
export function uncommittedOf(changedVsHead: string, untracked: string): string[] {
  const paths = (out: string) =>
    out
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  return [...new Set([...paths(changedVsHead), ...paths(untracked)])].sort();
}

/** Uncommitted paths in a worktree — changed and untracked, as one list. */
async function uncommitted(cwd: string): Promise<string[]> {
  const [changed, untracked] = await Promise.all([
    git(["diff", "--name-only", "HEAD"], cwd),
    git(["ls-files", "--others", "--exclude-standard"], cwd),
  ]);
  return uncommittedOf(changed, untracked);
}

/** Which worktree has the trunk checked out, if any. */
export async function trunkTree(root: string, trunk: string): Promise<string> {
  const out = await git(["worktree", "list", "--porcelain"], root);
  let path = "";
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
    if (line === `branch refs/heads/${trunk}`) return path;
  }
  return "";
}

/** What `--no-push`, `--push`, `--keep` and `--sweep` were on this run. */
export interface Flags {
  noPush: boolean;
  forcePush: boolean;
  keep: boolean;
  sweepOnly: boolean;
}

/**
 * Everything `plan` needs, and one line for the caller to print: whether
 * `origin` answered. An unreachable remote is not a refusal — a landing has to
 * work with no network — so the staleness is measured against the ref already
 * here and this says so (`trunkAgainstOrigin`).
 */
export async function readState(
  root: string,
  trunk: string,
  flags: Flags,
): Promise<{ state: LandState; unreached: string }> {
  const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"], root)) || "HEAD";
  const hasOrigin = (await git(["remote", "get-url", "origin"], root)) !== "";
  const { stale, fetched } = await trunkAgainstOrigin(root, trunk, hasOrigin);
  const tree = await trunkTree(root, trunk);
  return {
    unreached:
      hasOrigin && !fetched
        ? `  \u2691 could not reach origin; ${trunk} is measured against the ref already here`
        : "",
    state: {
      branch,
      trunk,
      dirty: await uncommitted(root),
      ahead: Number(await git(["rev-list", "--count", `${trunk}..HEAD`], root)) || 0,
      behind: Number(await git(["rev-list", "--count", `HEAD..${trunk}`], root)) || 0,
      trunkTree: tree,
      trunkDirty: tree ? await uncommitted(tree) : [],
      trunkStaged: tree
        ? (await git(["diff", "--cached", "--name-only"], tree)).split("\n").filter(Boolean)
        : [],
      hasOrigin,
      trunkStale: stale,
      ...flags,
    },
  };
}
