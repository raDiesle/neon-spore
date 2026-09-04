/**
 * Whether a lane can land on the trunk, and what landing it would do.
 *
 * An autonomous run finishes several branches in an afternoon and the trunk
 * has to stay linear, so the landings happen one after another and every one
 * of them is the same three steps: replay the lane onto the trunk, prove the
 * tree is green, fast-forward. Hand-driving that is where a merge commit gets
 * in — a `git merge` typed at the wrong moment looks exactly like the right
 * one until the history has a fork in it.
 *
 * The deciding lives here, away from git, so it can be tested without one.
 * `run.ts` is the half that fetches and moves refs.
 */

export interface LandState {
  /** The lane being landed. */
  branch: string;
  /** Usually `main`. */
  trunk: string;
  /** Uncommitted paths in the lane's own worktree. */
  dirty: readonly string[];
  /** Commits the lane has that the trunk has not. */
  ahead: number;
  /** Commits the trunk has that the lane has not — every one of them a replay. */
  behind: number;
  /** The worktree holding the trunk, or "" when nothing has it checked out. */
  trunkTree: string;
  /** Uncommitted paths there: a fast-forward walks over that tree's files. */
  trunkDirty: readonly string[];
  /** Staged paths there — the release note commit must touch only its own file. */
  trunkStaged: readonly string[];
  /** Whether `git remote get-url origin` resolves — nothing to push to otherwise. */
  hasOrigin: boolean;
  /** `--no-push` was given: land, but leave `origin` alone. */
  noPush: boolean;
  /** `--push` was given: push this landing whether or not it swept anything. */
  forcePush: boolean;
}

export interface Landing {
  go: true;
  /** The lane has to be replayed onto the trunk before it can fast-forward. */
  rebase: boolean;
  /**
   * No worktree holds the trunk, so the landing is a ref move rather than a
   * merge — which is the shape of every clone that only checks out lanes.
   */
  moveRef: boolean;
  /**
   * Whether a push is *available* to this landing: there is an `origin` to
   * push to and `--no-push` did not forbid it. Whether it actually happens is
   * `pushNow`, which needs something only the sweep can say.
   */
  mayPush: boolean;
  /** `--push`: send the trunk whatever the sweep does or does not clear away. */
  forced: boolean;
  /** Things that are not refusals and are worth saying before the work starts. */
  warn: string[];
}

export type Plan = { go: false; why: string } | Landing;

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

function these(paths: readonly string[]): string {
  const shown = paths.slice(0, 3).join(", ");
  return paths.length > 3 ? `${shown} and ${paths.length - 3} more` : shown;
}

/**
 * The refusals are ordered by what is most useful to hear. A dirty lane is
 * told about before "nothing to land", because uncommitted work is usually
 * *why* there is nothing to land, and hearing the second sends you looking in
 * the wrong place.
 */
export function plan(state: LandState): Plan {
  if (!state.branch || state.branch === "HEAD") {
    return { go: false, why: "this worktree is not on a branch" };
  }
  if (state.branch === state.trunk) {
    return {
      go: false,
      why: `you are standing on ${state.trunk}; a lane lands, a trunk is landed on`,
    };
  }
  if (state.dirty.length > 0) {
    const many = state.dirty.length === 1 ? "file" : "files";
    return {
      go: false,
      why: `${state.dirty.length} uncommitted ${many} here — a lane lands what it committed: ${these(state.dirty)}`,
    };
  }
  if (state.ahead === 0) {
    return { go: false, why: `${state.branch} carries nothing ${state.trunk} has not got already` };
  }
  if (state.trunkStaged.includes("docs/release-notes.md")) {
    return {
      go: false,
      why: `${state.trunkTree} has docs/release-notes.md staged — that is the file this landing writes; unstage it first`,
    };
  }

  const warn: string[] = [];
  if (state.trunkDirty.length > 0 && state.trunkTree) {
    warn.push(
      `${state.trunkTree} has ${state.trunkDirty.length} uncommitted of its own; the fast-forward refuses if it touches one`,
    );
  }
  if (state.trunkStaged.length > 0 && state.trunkTree) {
    warn.push(
      `${state.trunkTree} has ${state.trunkStaged.length} staged of its own; the release-note commit will not touch them, but they will still be there afterwards`,
    );
  }
  return {
    go: true,
    rebase: state.behind > 0,
    moveRef: state.trunkTree === "",
    mayPush: state.hasOrigin && !state.noPush,
    forced: state.forcePush,
    warn,
  };
}

/**
 * What a landing's sweep actually took away.
 *
 * The lane's own branch is deliberately not counted. It is deleted by every
 * landing there has ever been, so counting it would make "push after a
 * cleanup" mean "push every time", which is the frequency this exists to get
 * away from.
 */
export interface Cleanup {
  /** Worktrees removed — merged ones past their idle window, and orphans. */
  trees: number;
  /** Branches deleted other than the one this landing is standing on. */
  branches: number;
}

/** A landing that swept nothing: what `--dry-run` and a refused sweep both produce. */
export const SWEPT_NOTHING: Cleanup = { trees: 0, branches: 0 };

/** Whether the sweep ended some lane's life, rather than only tidying this one's. */
export function swept(cleanup: Cleanup): boolean {
  return cleanup.trees > 0 || cleanup.branches > 0;
}

/**
 * Whether this landing pushes `origin/main`.
 *
 * The trunk used to go to `origin` on every landing, which on a day of steady
 * work is a push per turn — most of them carrying a single commit onto a
 * remote nobody was reading yet. The push is now the *end of a lane's life*
 * rather than the end of a turn: it rides on the sweep, and goes when the
 * sweep cleared a worktree away or deleted some other lane's branch. Between
 * those, `main` moves locally and `bun run push` sends it on demand.
 *
 * Two things override that, and both are cases where waiting for a sweep
 * would mean waiting forever:
 *
 * - `--push`, which is the owner saying so.
 * - `moveRef` — nothing has the trunk checked out, which is the shape of a
 *   clone that only ever checks out lanes. There are no worktrees there to
 *   sweep, and the push *is* the hand-off: a cloud session's whole output is
 *   what `origin` ends up holding.
 */
export function pushNow(landing: Landing, cleanup: Cleanup): boolean {
  if (!landing.mayPush) return false;
  if (landing.forced || landing.moveRef) return true;
  return swept(cleanup);
}

/** The pre-flight, in the order the steps will happen. */
export function describe(state: LandState, landing: Landing): string[] {
  const lines = [
    `${state.branch} → ${state.trunk}: ${state.ahead} to land, ${state.behind} to replay over`,
  ];
  if (landing.rebase) lines.push(`  rebase   onto ${state.trunk}`);
  lines.push("  check    bun run check");
  lines.push(
    landing.moveRef
      ? `  land     move ${state.trunk} — no worktree holds it`
      : `  land     fast-forward ${state.trunk} in ${state.trunkTree}`,
  );
  if (landing.mayPush) {
    lines.push(
      landing.forced || landing.moveRef
        ? `  push     origin/${state.trunk}`
        : `  push     origin/${state.trunk} — only if the sweep clears a lane away`,
    );
  }
  return [...lines, ...landing.warn.map((w) => `  ⚠ ${w}`)];
}
