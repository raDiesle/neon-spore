/**
 * Which tests `bun run check:fast` runs
 *
 * `bun run check` is four and a half minutes, and until 10 September 2026 a
 * lane paid it twice per item: once before committing, because the commit rule
 * said so, and once inside `bun run land`, on the rebased tree — the run that
 * actually counts. The first run was a full answer to a question the landing
 * asks again anyway, and twice in one session it was thrown away when another
 * lane moved `main` mid-check. The owner asked for it to go.
 *
 * This is what replaced it: the tests a change can have reached, and nothing
 * else. The table of what reaches what is `tools/hooks/scope.ts`'s — the Stop
 * hook has answered this question every turn since the hooks were written, and
 * a second copy of that table would be a second place for it to drift. Two
 * differences from the hook's use of it:
 *
 * - The hook scopes a *turn* (what differs from `HEAD`); this scopes a *lane*
 *   (what differs from the trunk, committed or not), so a change made three
 *   commits ago is still tested.
 * - Where the table says "run everything" — a change under `packages/sim`,
 *   `packages/content`, the root `package.json` — the hook does. This does
 *   not: it runs the changed package's own tests and leaves the rest to the
 *   landing. That is the whole point of a fast check. What it keeps, always,
 *   are the two sweeps: `purity.test.ts`, which reads every file under `sim`
 *   and `content` for a wall clock, a random number or a DOM global, and
 *   `copies.test.ts`, which reads them for a rule spelled out by hand instead
 *   of called. Those are the two that catch a candidate's mistakes, and they
 *   run in fifteen seconds.
 *
 * A green `check:fast` is a reason to commit. It is not a reason to believe the
 * tree is good — that is `bun run land`'s full check, and the only result that
 * counts.
 */

import { scopeFor } from "../hooks/scope.js";

/** The two tests that read the whole tree, and so run whatever changed. */
export const SWEEPS: readonly string[] = [
  "packages/sim/test/copies.test.ts",
  "packages/sim/test/purity.test.ts",
];

/**
 * The workspace member a path sits in — `packages/render`, `tools/queue` —
 * which is where its tests are; or nothing, for a file outside every member.
 */
function memberOf(path: string): string | undefined {
  const m = /^(packages|apps|tools)\/([^/]+)\//.exec(path);
  return m ? `${m[1]}/${m[2]}` : undefined;
}

/**
 * The `bun test` filters for a set of changed paths: for each, the hook's
 * directories when its table has a narrow answer, the path's own member when
 * it asks for everything; and the two sweeps either way. Asked one path at a
 * time, because the table answers "everything" for the *set* — one
 * `package.json` in a diff of ten would otherwise silence the nine narrow
 * answers beside it. A sweep already under a listed directory is not named
 * twice.
 */
export function fastScopeFor(paths: readonly string[]): string[] {
  const dirs = new Set<string>();
  for (const path of paths) {
    const scoped = scopeFor([path]);
    if (scoped.length > 0) for (const d of scoped) dirs.add(d);
    else {
      const member = memberOf(path);
      if (member) dirs.add(member);
    }
  }
  for (const sweep of SWEEPS) {
    if (![...dirs].some((d) => sweep.startsWith(`${d}/`))) dirs.add(sweep);
  }
  return [...dirs].sort();
}

/**
 * Every path this lane has changed against the trunk: what the branch has
 * committed since it forked, what is edited on disk, and what is new and not
 * yet added. `git diff <base>` with no second ref already covers the first two;
 * the third is the file a session wrote a minute ago and has not staged.
 */
export function changedSince(base: string, cwd: string): string[] {
  const out = (args: string[]) =>
    Bun.spawnSync(["git", ...args], { cwd })
      .stdout.toString()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  const fork = out(["merge-base", base, "HEAD"])[0] ?? base;
  return [
    ...new Set([
      ...out(["diff", "--name-only", fork]),
      ...out(["ls-files", "--others", "--exclude-standard"]),
    ]),
  ];
}
