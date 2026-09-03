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
   * Push `origin/main` once the trunk has moved. On by default — an
   * unpushed `main` is invisible to a cloud session, which clones `origin`
   * and never sees this checkout — and off only when there is no `origin` to
   * push to, or `--no-push` said so explicitly.
   */
  push: boolean;
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
    push: state.hasOrigin && !state.noPush,
    warn,
  };
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
  if (landing.push) lines.push(`  push     origin/${state.trunk}`);
  return [...lines, ...landing.warn.map((w) => `  ⚠ ${w}`)];
}
