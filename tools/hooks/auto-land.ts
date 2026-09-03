#!/usr/bin/env bun

/**
 * The turn is over and the lane is finished: put it on the trunk without being
 * asked, and say so in one line the owner can see from a phone.
 *
 * It lands only when the lane is *already* finished, which is a handful of
 * questions git can answer and none a session has to be trusted with — see
 * `whyNotLanding`. Anything else and it exits silently, which is most turns.
 * `bun run land` does the rest and refuses on its own terms too (it rebases,
 * checks, and only then fast-forwards), so this file never decides whether the
 * work is *good* — only whether the lane looks done.
 *
 * It does not collide with `check-on-stop.ts`, which shares this event and runs
 * beside it: that one returns immediately when the tree is clean, and this one
 * returns immediately when it is not.
 *
 * A landing deletes the branch it just landed, so the worktree it was standing
 * in is left on a detached `HEAD` — `tools/land/sweep.ts` says why the tree
 * itself stays. That used to end the session's ability to land anything else:
 * this file asked `git rev-parse --abbrev-ref HEAD`, read `HEAD`, and exited as
 * "not on a lane's own branch". Every commit after the first landing went into
 * detachment and stayed there, silently, which is the same nothing-happens
 * failure the hooks were moved off bash to stop. So a detached tree with
 * commits on it is a lane: it is handed a branch here and landed like any
 * other. A detached tree with nothing on it is the ordinary state after a
 * landing, and still exits quietly.
 *
 * `NO_AUTO_LAND=1` turns it off for a session that wants to land by hand.
 *
 * Moved off bash with the other three, and this is the one that mattered most:
 * `bash .claude/hooks/auto-land.sh` in a PowerShell session meant a finished
 * lane simply never landed, and the only evidence was the absence of a badge
 * nobody was waiting for.
 */

import { readPayload, stopHookActive } from "./payload.ts";

/** Either separator: git says `/` for a worktree's path and Windows says the other. */
const SEPARATOR = /[/\\]/;

/** Everything the decision is made of, so the decision itself touches nothing. */
export interface LaneState {
  /** `NO_AUTO_LAND=1`, for a session that lands by hand. */
  readonly disabled: boolean;
  /** A blocked stop already sent the session back to work. */
  readonly stopHookActive: boolean;
  /** False in the main checkout, whose git dir *is* the common one. */
  readonly inWorktree: boolean;
  /** The branch name, `HEAD` when detached, or "" when git could not say. */
  readonly branch: string;
  /** Uncommitted work is unfinished work. */
  readonly dirty: boolean;
  /** Commits this branch has that `main` does not. */
  readonly ahead: number;
}

/**
 * Why this turn does not land, or `null` when the lane looks done.
 *
 * A string rather than a boolean because every one of these is a silent exit,
 * and a silent exit that cannot say which question it failed is the thing that
 * makes a hook impossible to debug from a phone.
 */
export function whyNotLanding(s: LaneState): string | null {
  if (s.disabled) return "NO_AUTO_LAND=1";
  if (s.stopHookActive) return "a blocked stop is already in progress";
  if (!s.inWorktree) return "this is the main checkout, not a lane's worktree";
  if (s.branch === "" || s.branch === "main") {
    return `not on a lane's own branch (${s.branch || "unknown"})`;
  }
  if (s.dirty) return "the worktree has uncommitted work";
  // A detached `HEAD` reaches this line on purpose, and this is the question
  // that sorts the two kinds of them: nothing on it is the ordinary state after
  // a landing, and commits on it are a lane whose branch the landing took away.
  if (s.ahead === 0) return "the branch is not ahead of main";
  return null;
}

/** Whether the lane needs a branch opened for it before `bun run land` will look at it. */
export function isDetached(branch: string): boolean {
  return branch === "HEAD";
}

/**
 * The name a detached lane gets back: the worktree's own directory name under
 * `claude/`, which in the ordinary case is exactly the branch the landing
 * deleted, because a lane's tree and its branch are made out of one word. A
 * suffix is added only when something already holds that name — a branch
 * quietly opened over the wrong commits is worse than one that reads badly.
 */
export function branchForDetached(worktree: string, taken: readonly string[]): string {
  const base = worktree.split(SEPARATOR).filter(Boolean).pop() ?? "lane";
  const wanted = `claude/${base}`;
  if (!taken.includes(wanted)) return wanted;
  for (let n = 2; ; n++) {
    const next = `${wanted}-${n}`;
    if (!taken.includes(next)) return next;
  }
}

/**
 * The badge. `systemMessage` is the one channel a Stop hook has to the chat
 * itself, so the whole landing has to read at a glance in it.
 */
export function badge(branch: string, sha: string, ahead: number): string {
  const count = ahead === 1 ? "1 commit" : `${ahead} commits`;
  return `🟢 ╺━╸ L A N D E D ! ╺━╸ ${branch} → main @ ${sha} (${count})`;
}

function git(...args: string[]): string | null {
  const proc = Bun.spawnSync(["git", ...args]);
  return proc.exitCode === 0 ? proc.stdout.toString().trim() : null;
}

function laneState(stopActive: boolean): LaneState {
  // A worktree's own git dir sits under the shared one; the main checkout's is
  // the shared one. Landing from the main checkout is not what this is for.
  const gitDir = git("rev-parse", "--absolute-git-dir");
  const common = git("rev-parse", "--path-format=absolute", "--git-common-dir");
  const ahead = git("rev-list", "--count", "main..HEAD");
  return {
    disabled: process.env.NO_AUTO_LAND === "1",
    stopHookActive: stopActive,
    inWorktree: gitDir !== null && common !== null && gitDir !== common,
    branch: git("rev-parse", "--abbrev-ref", "HEAD") ?? "",
    dirty: (git("status", "--porcelain") ?? "") !== "",
    ahead: Number(ahead ?? 0) || 0,
  };
}

/** The lane's own branch, opening one first when the last landing left the tree detached. */
function branchToLand(state: LaneState): string | null {
  if (!isDetached(state.branch)) return state.branch;
  const root = git("rev-parse", "--show-toplevel") ?? process.cwd();
  const taken = (git("branch", "--format=%(refname:short)") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const branch = branchForDetached(root, taken);
  if (git("switch", "--quiet", "-c", branch) === null) return null;
  process.stderr.write(
    `auto-land: the last landing left this worktree detached; ${branch} opened over its ${state.ahead} commits\n`,
  );
  return branch;
}

async function main(): Promise<void> {
  const state = laneState(stopHookActive(await readPayload()));
  if (whyNotLanding(state) !== null) process.exit(0);

  const branch = branchToLand(state);
  if (branch === null) {
    process.stderr.write(
      "auto-land: this worktree is detached with commits on it and no branch would open over them — main was not moved\n",
    );
    process.exit(2);
  }

  const proc = Bun.spawn([process.execPath, "run", "land"], { stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  const output = `${out}${err}`;
  if (code !== 0) {
    const tail = output.split("\n").slice(-25).join("\n");
    process.stderr.write(`auto-land: ${branch} did not land — main was not moved:\n${tail}\n`);
    process.exit(2);
  }

  process.stderr.write(`${output}\n`);
  const sha = git("rev-parse", "--short", "main") ?? "main";
  process.stdout.write(
    `${JSON.stringify({ systemMessage: badge(branch, sha, state.ahead), suppressOutput: true })}\n`,
  );
  process.exit(0);
}

if (import.meta.main) await main();
