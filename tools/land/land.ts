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
  /** Things that are not refusals and are worth saying before the work starts. */
  warn: string[];
}

export type Plan = { go: false; why: string } | Landing;

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

  const warn: string[] = [];
  if (state.trunkDirty.length > 0 && state.trunkTree) {
    warn.push(
      `${state.trunkTree} has ${state.trunkDirty.length} uncommitted of its own; the fast-forward refuses if it touches one`,
    );
  }
  return { go: true, rebase: state.behind > 0, moveRef: state.trunkTree === "", warn };
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
  return [...lines, ...landing.warn.map((w) => `  ⚠ ${w}`)];
}
