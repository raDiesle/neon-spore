#!/usr/bin/env bun

/**
 * The turn is over and the lane is finished. Stop, and put the choice to the
 * owner — do not take it.
 *
 * This used to be `auto-land.ts`, and it landed: it ran `bun run land` itself,
 * so a finished turn moved the trunk, swept the tree and pushed `origin` with
 * nobody typing anything. That solved the right problem — a lane left sitting
 * on a branch is a rebase that grows every day — and overshot it. Landing is
 * where a lane's life ends: the trunk moves, the worktree is swept, the remote
 * is written. The owner asked for that moment to be a question rather than a
 * notification after the fact.
 *
 * So the questions git can answer are still asked here, and answering them all
 * now blocks the stop instead of starting a landing. The session is sent back
 * with three options to put to the owner and the command for each. Everything
 * this file will not do — a dirty tree, a branch that is not ahead, the main
 * checkout — is still a silent exit, which is most turns.
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
 * commits on it is a lane: it is handed a branch here and asked about like any
 * other. A detached tree with nothing on it is the ordinary state after a
 * landing, and still exits quietly.
 *
 * **It asks once per commit, not once per turn.** "More to come" is one of the
 * three answers, so a lane deliberately left open would otherwise be put to the
 * owner again at the end of every turn until he gave in and landed it. The
 * commit asked about is written to the worktree's own git directory and the
 * question is not repeated until `HEAD` moves.
 *
 * `NO_LANE_PROMPT=1` turns it off for a session that decides for itself.
 *
 * Moved off bash with the other three, and this is the one that mattered most:
 * `bash .claude/hooks/auto-land.sh` in a PowerShell session meant a finished
 * lane simply never landed, and the only evidence was the absence of a badge
 * nobody was waiting for.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readPayload, stopHookActive } from "./payload.ts";

/** Either separator: git says `/` for a worktree's path and Windows says the other. */
const SEPARATOR = /[/\\]/;

/** Everything the decision is made of, so the decision itself touches nothing. */
export interface LaneState {
  /** `NO_LANE_PROMPT=1`, for a session that decides for itself. */
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
  /** The commit the lane is standing on. */
  readonly head: string;
  /** The commit this worktree was last asked about, or "" if it never has been. */
  readonly askedFor: string;
}

/**
 * Why this turn says nothing, or `null` when the lane is finished and the
 * owner should be asked what to do with it.
 *
 * A string rather than a boolean because every one of these is a silent exit,
 * and a silent exit that cannot say which question it failed is the thing that
 * makes a hook impossible to debug from a phone.
 */
export function whyNotAsking(s: LaneState): string | null {
  if (s.disabled) return "NO_LANE_PROMPT=1";
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
  // Asked once per commit, not once per turn. "More to come" is one of the
  // three answers, and a lane deliberately left open would otherwise be put to
  // the owner again at the end of every turn until he gave in and landed it.
  // New work moves `HEAD`, and new work is what makes the question worth
  // asking a second time.
  if (s.head !== "" && s.head === s.askedFor) return "this commit was already put to the owner";
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
 * What the session is sent back to do. It is written as an instruction rather
 * than a suggestion because a blocked stop is the session's whole account of
 * why it is still going, and "consider asking" is how a rule becomes optional.
 *
 * The three options are the owner's own, and the fourth one a session would
 * invent — landing quietly because the work is obviously finished — is the
 * behaviour this file was changed to stop.
 */
export function question(branch: string, ahead: number): string {
  const count = ahead === 1 ? "1 commit" : `${ahead} commits`;
  return [
    `${branch} is finished — ${count}, nothing uncommitted — and landing it is the`,
    "owner's call rather than yours. Put it to them as one question with these three",
    "options, then do what the answer says:",
    "",
    "  a) Finished        bun run land --push  — land, sweep, and send main to origin",
    "  b) More to come    nothing lands; keep the lane open for the next prompt",
    "  c) Land and stay   bun run land --keep  — main moves, nothing is swept, origin",
    "                                            is left alone, work carries on here",
    "",
    "Ask once, land nothing before the answer, and do not invent a fourth option.",
  ].join("\n");
}

function git(...args: string[]): string | null {
  const proc = Bun.spawnSync(["git", ...args]);
  return proc.exitCode === 0 ? proc.stdout.toString().trim() : null;
}

/**
 * Where the last commit put to the owner is written down: the worktree's own
 * git directory, which is per-tree, never committed, and swept along with the
 * tree when the tree goes.
 */
function askedPath(): string | null {
  const dir = git("rev-parse", "--absolute-git-dir");
  return dir === null ? null : `${dir}/lane-finished-asked`;
}

function readAsked(): string {
  const path = askedPath();
  if (path === null) return "";
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return "";
  }
}

/** Best effort: a note that cannot be written means the question is asked twice, not lost. */
function rememberAsked(head: string): void {
  const path = askedPath();
  if (path === null || head === "") return;
  try {
    writeFileSync(path, `${head}\n`);
  } catch {
    // Read-only or gone; asking again is the harmless failure of the two.
  }
}

function laneState(stopActive: boolean): LaneState {
  // A worktree's own git dir sits under the shared one; the main checkout's is
  // the shared one. Asking about the main checkout is not what this is for.
  const gitDir = git("rev-parse", "--absolute-git-dir");
  const common = git("rev-parse", "--path-format=absolute", "--git-common-dir");
  const ahead = git("rev-list", "--count", "main..HEAD");
  return {
    disabled: process.env.NO_LANE_PROMPT === "1",
    stopHookActive: stopActive,
    inWorktree: gitDir !== null && common !== null && gitDir !== common,
    branch: git("rev-parse", "--abbrev-ref", "HEAD") ?? "",
    dirty: (git("status", "--porcelain") ?? "") !== "",
    ahead: Number(ahead ?? 0) || 0,
    head: git("rev-parse", "HEAD") ?? "",
    askedFor: readAsked(),
  };
}

/** The lane's own branch, opening one first when the last landing left the tree detached. */
function branchToOffer(state: LaneState): string | null {
  if (!isDetached(state.branch)) return state.branch;
  const root = git("rev-parse", "--show-toplevel") ?? process.cwd();
  const taken = (git("branch", "--format=%(refname:short)") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const branch = branchForDetached(root, taken);
  if (git("switch", "--quiet", "-c", branch) === null) return null;
  const many = state.ahead === 1 ? "commit" : "commits";
  process.stderr.write(
    `lane-finished: the last landing left this worktree detached; ${branch} opened over its ${state.ahead} ${many}\n`,
  );
  return branch;
}

async function main(): Promise<void> {
  const state = laneState(stopHookActive(await readPayload()));
  if (whyNotAsking(state) !== null) process.exit(0);

  const branch = branchToOffer(state);
  if (branch === null) {
    process.stderr.write(
      "lane-finished: this worktree is detached with commits on it and no branch would open over them — say so and stop\n",
    );
    process.exit(2);
  }

  rememberAsked(state.head);
  process.stderr.write(`${question(branch, state.ahead)}\n`);
  process.exit(2);
}

if (import.meta.main) await main();
