#!/usr/bin/env bun

/**
 * The turn is over and the lane is finished. Stop: land it on the local trunk,
 * and put the rest to the owner.
 *
 * This used to be `auto-land.ts`, and it landed: it ran `bun run land` itself,
 * so a finished turn moved the trunk, swept the tree and pushed `origin` with
 * nobody typing anything. That solved the right problem — a lane left sitting
 * on a branch is a rebase that grows every day — and overshot it. Landing is
 * where a lane's life ends: the trunk moves, the worktree is swept, the remote
 * is written. The owner asked for that moment to be a question rather than a
 * notification after the fact, and on 10 September 2026 he split it in two.
 * The local trunk moving is the reversible half, and the half that keeps the
 * rebase small, so it is not asked about: a finished lane always lands with
 * `bun run land --keep` before the turn ends. What is still his to choose is
 * the part that reaches past this checkout — whether `origin` gets `main`, and
 * whether the lane is over — and that is asked after the landing, not instead.
 *
 * So the questions git can answer are asked here, and answering them all blocks
 * the stop and sends the session back with the landing to run and three options
 * to put to the owner. The landing is the session's to run rather than this
 * file's: it is minutes of `bun run check` whose output the session has to see
 * when it goes red, and on this machine a check run from a shell without `bash`
 * on its PATH goes red on twelve hook tests for no fault of the lane's.
 * Everything this file will not do — a dirty tree, a branch that is not ahead,
 * the main checkout — is a silent exit, which is most turns.
 *
 * It does not collide with `check-on-stop.ts`, which shares this event and runs
 * beside it: that one returns immediately when the tree is clean, and this one
 * returns immediately when it is not. It runs no check of its own: the commit
 * was let through by `bun run check:fast` (`tools/check/fast-scope.ts`), and
 * the full check is the landing's.
 *
 * A landing deletes the branch it just landed, so the worktree it was standing
 * in is left on a detached `HEAD` — `tools/land/sweep.ts` says why the tree
 * itself stays. That used to end the session's ability to land anything else:
 * this file asked `git rev-parse --abbrev-ref HEAD`, read `HEAD`, and exited as
 * "not on a lane's own branch", so every commit after the first landing went
 * into detachment and stayed there, silently. A detached tree with commits on
 * it is a lane: it is handed a branch here and asked about like any other. One
 * with nothing on it is the ordinary state after a landing, and exits quietly.
 *
 * **It asks once per commit, not once per turn.** A landing that could not go
 * through — a red check, a trunk behind `origin` — leaves the lane clean and
 * ahead, and would otherwise be put to the session again at the end of every
 * turn with nothing new to say. The commit asked about is written to the
 * worktree's own git directory and the question is not repeated until `HEAD`
 * moves; a landing that went through needs no note, because the branch is no
 * longer ahead.
 *
 * `NO_LANE_PROMPT=1` turns it off for a session that decides for itself.
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
  // Asked once per commit, not once per turn. A landing that failed leaves the
  // lane ahead, and would otherwise be put to the session again at the end of
  // every turn with nothing new to say. New work moves `HEAD`, and new work is
  // what makes the question worth asking a second time.
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
 * The landing is the whole of it. What `--keep` leaves undone — does `origin`
 * get the trunk, is the lane over — used to be put to the owner as three
 * options, and on 11 September 2026 he retired the question: he says `bun run
 * push`, `bun run sweep` or a director deploy himself, whenever he wants one.
 * So the session lands, reports, and stops; doing any of those three unasked
 * because the work is obviously finished is the behaviour this file exists to
 * stop, and asking about them is the behaviour he stopped.
 */
export function question(branch: string, ahead: number): string {
  const count = ahead === 1 ? "1 commit" : `${ahead} commits`;
  return [
    `${branch} is finished — ${count}, nothing uncommitted. Land it on the local`,
    "trunk now, from the Bash tool:  bun run land --keep  — the local main moves and",
    "nothing else does: no sweep, no push, work carries on here. If it goes red,",
    "fix that first. Once it has landed, say what landed and stop.",
    "",
    "Do not ask whether to push, sweep or deploy, and do not do any of them: the",
    "owner asks for  bun run push ,  bun run sweep  or a director deploy himself,",
    "whenever he wants one.",
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
