/**
 * **A worktree behind the local `main`, told so at its first line** — and
 * brought up to it when nothing of its own is in the way.
 *
 * `CLAUDE.md`'s step for bringing the trunk up merges `origin/main`. On 6
 * October 2026 the local `main` held 88 landings `origin/main` did not, among
 * them THE LAMPREY's rework, and a lane built for an hour on the old design
 * before `bun run land` met thirty conflicting files. Landings are only pushed
 * when the owner says `bun run push`, so the local `main` is routinely ahead,
 * and a worktree made from an older commit cannot see that from `origin`.
 *
 * So the session-start hook asks the one question here: how many commits does
 * the local `main` have that this worktree's `HEAD` does not. A clean worktree
 * with no commits of its own is fast-forwarded, which is the same step the
 * session would take by hand; one with its own commits or uncommitted work is
 * only told, because moving it is a rebase and that is the session's to run.
 * Outside a worktree, or on `main` itself, it says nothing.
 */

/** What git said about the tree, gathered by `trunkState`. */
export interface TrunkState {
  /** Whether this checkout is a linked worktree rather than the main one. */
  worktree: boolean;
  /** The checked-out branch, or "HEAD" when detached. */
  branch: string;
  /** Commits on the local `main` that `HEAD` lacks. */
  behind: number;
  /** Commits on `HEAD` that the local `main` lacks. */
  ahead: number;
  /** Whether `git status --porcelain` printed nothing. */
  clean: boolean;
}

/** What to do about it: nothing, fast-forward, or only say so. */
export type TrunkMove = { kind: "none" } | { kind: "forward" } | { kind: "say"; said: string };

/** The decision, with no git in it, so the test can hold every branch of it. */
export function trunkMove(s: TrunkState): TrunkMove {
  if (!s.worktree || s.branch === "main" || s.behind === 0) return { kind: "none" };
  if (s.ahead === 0 && s.clean) return { kind: "forward" };
  const n = landings(s.behind);
  const why = s.ahead > 0 ? `${s.ahead} commit(s) of its own` : "uncommitted work";
  const how = s.clean ? "`git rebase main`" : "`git rebase main` once that work is committed";
  return {
    kind: "say",
    said:
      `the local main holds ${n} this worktree does not, and it has ${why}, so it was not moved. ` +
      `Bring it up with ${how} before building on the old trunk.`,
  };
}

function landings(n: number): string {
  return n === 1 ? "1 commit" : `${n} commits`;
}

/** One git answer, trimmed; "" when git fails. */
function ask(args: string[], cwd: string): string {
  const out = Bun.spawnSync(["git", ...args], { cwd, stdout: "pipe", stderr: "ignore" });
  return out.success ? out.stdout.toString().trim() : "";
}

/** The tree's state, or null when this is no repository or there is no local `main`. */
export function trunkState(cwd: string): TrunkState | null {
  if (ask(["rev-parse", "--verify", "--quiet", "refs/heads/main"], cwd) === "") return null;
  const gitDir = ask(["rev-parse", "--absolute-git-dir"], cwd);
  const common = ask(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd);
  if (gitDir === "" || common === "") return null;
  const count = (range: string) => Number(ask(["rev-list", "--count", range], cwd) || "0");
  return {
    worktree: gitDir !== common,
    branch: ask(["rev-parse", "--abbrev-ref", "HEAD"], cwd),
    behind: count("HEAD..main"),
    ahead: count("main..HEAD"),
    clean: ask(["status", "--porcelain"], cwd) === "",
  };
}

/** Ask, act, and answer with the line to print, or null when there is nothing to say. */
export function bringUp(cwd: string): string | null {
  const state = trunkState(cwd);
  if (state === null) return null;
  const move = trunkMove(state);
  if (move.kind === "none") return null;
  if (move.kind === "say") return move.said;
  const done = Bun.spawnSync(["git", "merge", "--ff-only", "--quiet", "main"], {
    cwd,
    stdout: "ignore",
    stderr: "ignore",
  });
  const n = landings(state.behind);
  if (!done.success)
    return `the local main holds ${n} this worktree does not, and the fast-forward failed.`;
  return `this worktree was ${n} behind the local main and is fast-forwarded to it.`;
}
