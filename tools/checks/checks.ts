/**
 * The history's checks joined to the ledger's decisions: what is still
 * outstanding, and which branches that leaves spent.
 *
 * Pure on purpose — every question this page and the CLI answer is a join
 * over two lists, and a join is the kind of thing that should be tested
 * without a repository to run it against.
 */

import type { Decision, Verdict } from "./ledger.js";
import { sameCommit } from "./ledger.js";
import type { Check, CheckCommit } from "./trailers.js";

export interface CheckState extends Check {
  full: string;
  /** When the commit landed, not when the check was decided. */
  date: string;
  subject: string;
  verdict: Verdict | null;
  decidedOn: string;
  note: string;
}

/** Newest first, the order `git log` hands them over in. */
export function joinChecks(commits: CheckCommit[], decisions: Decision[]): CheckState[] {
  const states: CheckState[] = [];
  for (const commit of commits) {
    for (const check of commit.checks) {
      // The last word wins: a check looked at twice keeps the later verdict.
      let decision: Decision | undefined;
      for (const d of decisions) {
        if (sameCommit(d.sha, check.sha) && d.text === check.text) decision = d;
      }
      states.push({
        ...check,
        full: commit.full,
        date: commit.date,
        subject: commit.subject,
        verdict: decision?.verdict ?? null,
        decidedOn: decision?.date ?? "",
        note: decision?.note ?? "",
      });
    }
  }
  return states;
}

/**
 * A failed check is decided, not outstanding. What it asks for is a fix, and
 * a fix is a commit of its own carrying its own `Check:` — so leaving the
 * failure on the list would ask for the same look twice.
 */
export function outstanding(states: readonly CheckState[]): CheckState[] {
  return states.filter((s) => s.verdict === null);
}

export function runnable(states: readonly CheckState[]): CheckState[] {
  return outstanding(states).filter((s) => s.command !== null);
}

export interface Branch {
  /** `claude/thing` — one entry whether it sits here, on origin, or both. */
  name: string;
  local: boolean;
  remote: boolean;
  /** Every commit on it is on `main` already. */
  merged: boolean;
  /** The worktree holding it, if one does — otherwise empty. */
  worktree: string;
  /** HEAD is on it. Nothing deletes the branch it is standing on. */
  current: boolean;
  /** How many of the checks it carries nobody has decided. */
  undecided: number;
}

/** Which of these checks sit on commits the branch can reach. */
export function undecidedOn(reachable: ReadonlySet<string>, states: readonly CheckState[]): number {
  return outstanding(states).filter((s) => reachable.has(s.full)).length;
}

/**
 * Which commits a branch tip can reach, read off `main`'s own newest-first
 * line instead of a `merge-base --is-ancestor` per commit. `main` is never
 * merged into (`CLAUDE.md`: the history is linear, fast-forward only), so a
 * tip that sits on that line at all sits at exactly one position in it, and
 * everything from there to the end is exactly what it is an ancestor of.
 *
 * `null` when the tip is not on the line at all — an unmerged branch, which
 * `branchReason` already reports as "still ahead of main" without a count.
 *
 * This turns what used to be one `merge-base` spawn per commit per branch —
 * branches times outstanding checks, the multiplication that made the sheet
 * time out — into one `git log` read of `main`, done once, and a plain index
 * lookup per branch.
 */
export function reachableAlong(
  mainLine: readonly string[],
  tip: string,
): ReadonlySet<string> | null {
  const at = mainLine.indexOf(tip);
  return at === -1 ? null : new Set(mainLine.slice(at));
}

/**
 * A worktree holding it is not a reason to keep it — `CLAUDE.md` says a
 * worktree is a working tool and goes when the task does, so the worktree is
 * removed first and the branch after it. Only an undecided check, work that
 * never reached `main`, or standing on it keeps a branch alive.
 */
export function branchReady(branch: Branch): boolean {
  return branch.merged && branch.undecided === 0 && !branch.current;
}

/** Why it is not ready, or what is left of it. Said in the page and the CLI. */
export function branchReason(branch: Branch): string {
  if (branch.current) return "you are standing on it";
  if (!branch.merged) return "still ahead of main";
  if (branch.undecided === 1) return "1 check outstanding";
  if (branch.undecided > 1) return `${branch.undecided} checks outstanding`;
  return branch.worktree ? "merged and checked — its worktree goes too" : "merged and checked";
}

/**
 * A `main` that has not been pulled answers every question about branches
 * wrongly, and confidently: work that landed reads as "still ahead of main",
 * so `--clean` finds nothing spent and says "no branch is spent yet" as if it
 * had looked. Reading a stale list is merely incomplete and the warning
 * covers it; acting on one is the wrong answer in the shape of a right one,
 * so the flags that act stop instead.
 */
export function staleStops(behind: number, acting: boolean): boolean {
  return behind > 0 && acting;
}
