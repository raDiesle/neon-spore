/**
 * Whether this worktree's install is still the one the tree needs
 *
 * A worktree is installed once and then goes stale silently. `main` gains a
 * workspace package, or an existing one gains a dependency on another; the lane
 * rebases onto it, and nothing links the new name into the consumer's
 * `node_modules` — at which point the first thing that says anything is `tsc`,
 * reporting `Cannot find module '@neon-spore/content'` in eight files nobody
 * touched, across `tools/probe/` and `apps/server/`. Every one of those errors
 * looks like a real break in the tree under test. The cure is one `bun install`;
 * the cost of not knowing that is a turn spent reading code that was never
 * wrong.
 *
 * So `bun run check` asks this first, before the typecheck, because the whole
 * point is to replace `tsc`'s answer with the true one. `CLAUDE.md` already
 * warns that a *fresh* worktree needs its own install. This is the case it does
 * not cover: an existing one, correct when it was made, that stopped being
 * correct while nobody was looking.
 *
 * Bun links a workspace dependency **into the consumer**, not into the root —
 * `apps/game/node_modules/@neon-spore/sim`, and the repository root has no
 * `@neon-spore` directory at all. So the question is asked once per edge of the
 * dependency graph rather than once per package, which is also the only version
 * of it that notices a dependency added to a package that was already installed.
 *
 * The deciding is here and takes a `has`, so it is tested on strings rather
 * than by renaming a directory aside.
 */

/** One workspace member: where it lives, what it is called, what it imports. */
export interface Member {
  dir: string;
  name: string;
  /** Every dependency it declares, workspace or not. */
  deps: string[];
}

/** One missing link: the package that needs it, and the name it needs. */
export interface Missing {
  dir: string;
  dep: string;
}

/**
 * The workspace edges with no link behind them.
 *
 * `has` answers for a repository-relative path. Only dependencies that are
 * themselves workspace members are asked about: an external one is hoisted to
 * the root or not, by rules that are Bun's rather than this repository's, and a
 * preflight that guesses at them is a preflight that cries wolf.
 */
export function unlinked(members: readonly Member[], has: (path: string) => boolean): Missing[] {
  const workspace = new Set(members.map((m) => m.name));
  const out: Missing[] = [];
  for (const member of members) {
    for (const dep of member.deps) {
      if (!workspace.has(dep)) continue;
      if (!has(`${member.dir}/node_modules/${dep}`)) out.push({ dir: member.dir, dep });
    }
  }
  return out;
}

/**
 * What the preflight says when it refuses, first line already carrying the ✗.
 *
 * The command it names is `bun install --force`, not `bun install`. A worktree
 * that was installed once has a lockfile Bun considers satisfied, so a plain
 * install prints `Checked N installs (no changes)` and writes nothing — the
 * links stay missing and the next `bun run check` refuses again for the same
 * reason. Only `--force` writes the junctions back. A refusal that named the
 * command which does nothing would cost a session one more round of the same
 * error, which is the round this preflight exists to remove.
 */
export function refusal(missing: readonly Missing[]): string[] {
  const many = missing.length === 1 ? "link is" : "links are";
  const lines = [
    `✗ ${missing.length} workspace ${many} missing in this worktree — run bun install --force here, from a native shell`,
  ];
  for (const { dir, dep } of missing) lines.push(`  ${dir} needs ${dep}`);
  lines.push(
    "  a plain bun install says `no changes` and writes no link; only --force recreates them",
    "  tsc would have blamed the code instead: `Cannot find module` in files this lane never opened",
  );
  return lines;
}
