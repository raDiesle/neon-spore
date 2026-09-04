/**
 * Everything that happens after the fast-forward and does not touch a ref:
 * the release note, and the sweep of everything a landing leaves spent —
 * the lane's branch and its worktree once it has sat idle. The spent delegate
 * specs under `.claude/tmp` go too, from `specs.ts`.
 *
 * Split out of `run.ts` because that file's job is deciding and moving refs;
 * this file's job is cleanup, and it was most of `run.ts`'s length.
 */

import { join } from "node:path";
import { partitionMerged } from "./claims.js";
import { git, gitOrDie } from "./git.js";
import { idleDays, KEEP_DAYS } from "./idle.js";
import { type Cleanup, type LandState, SWEPT_NOTHING } from "./land.js";
import { type Landed, prepend } from "./notes.js";
import { orphanWorktrees, removeOrphan } from "./orphans.js";
import { sweepSpecs } from "./specs.js";
import { removeWorktree } from "./worktree.js";

/** Every worktree by the branch it holds, so a sweep knows what to remove first. */
async function worktreesByBranch(root: string): Promise<Map<string, string>> {
  const out = await git(["worktree", "list", "--porcelain"], root);
  const held = new Map<string, string>();
  let path = "";
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
    if (line.startsWith("branch refs/heads/")) {
      held.set(line.slice("branch refs/heads/".length), path);
    }
  }
  return held;
}

/**
 * The release note, written where the fact is known.
 *
 * It is a second commit on the trunk rather than an amendment to the lane's
 * own, and deliberately so: the tree `bun run check` went green on is the tree
 * that just landed, and editing a file into it afterwards would make the green
 * result a result about something else. A docs-only commit is the cheap half of
 * that trade.
 *
 * `git commit --only` names the path rather than `git add` + `git commit`,
 * so this touches exactly the file it wrote and nothing the trunk's own index
 * was already holding — an owner mid-`git add` on the trunk worktree does not
 * get their staged files swept into a commit they never asked for.
 *
 * Nothing is asked of the reader and nothing is asked of the session — the
 * entry is derived from the commit subject and its first paragraph, which the
 * commit already had to carry.
 */
export async function writeNotes(state: LandState, landed: Landed[], TRUNK: string): Promise<void> {
  if (landed.length === 0) return;
  if (!state.trunkTree) {
    console.log(`  ⚑ no release note — nothing has ${TRUNK} checked out`);
    return;
  }
  const path = join(state.trunkTree, "docs/release-notes.md");
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : "";
  await Bun.write(path, prepend(existing, landed));
  const what = landed.length === 1 ? "one landing" : `${landed.length} landings`;
  await gitOrDie(
    ["commit", "--only", "docs/release-notes.md", "-q", "-m", `Release notes for ${what}`],
    state.trunkTree,
  );
  console.log(`  noted    docs/release-notes.md — ${what}`);
}

/**
 * Sweeping is part of landing, not tidying afterwards — but the branch and the
 * worktree are two different things and they do not go at the same moment.
 *
 * **The branch goes now.** Its tip is an ancestor of `main`, so `git branch -d`
 * cannot lose anything, and a fix found during review does not belong on it
 * anyway: `CLAUDE.md` sends new work to a fresh branch off the current trunk,
 * because a revived branch is missing every landing since.
 *
 * **The worktree this process is standing in stays.** Removing it would pull
 * the floor out from under whoever is still working in it — the session's
 * working directory would simply cease to exist, every tool call after that
 * fails, and on Windows the removal half-succeeds anyway: a held handle keeps
 * the directory while git drops the registry entry, which is the exact orphan
 * this file exists to stop making. What the tree gets instead is `main`'s tip,
 * detached (git will not let two worktrees hold the branch itself). Its content
 * is then byte-identical to the trunk, so it is not a stale checkout somebody
 * can wander into and read superseded code from — it is a current one, ready
 * for `git switch -c` the moment the review turns something up.
 *
 * The detach itself goes through `gitOrDie`, not the swallowing `git()`: a
 * tree that fails to move onto `main`'s tip and says nothing about it is
 * exactly the litter this tool exists to remove — a worktree left on a
 * deleted branch, discovered only when the next command in it fails for a
 * reason that does not mention why.
 *
 * **Every other merged worktree gets `KEEP_DAYS` idle days first.** Its code is
 * worth nothing the moment it is on the trunk, but its `node_modules` is worth
 * the minute a fresh worktree spends on `bun install`, and the review that
 * finds something to adjust usually happens a day or two after the landing, not
 * during it. Idle rather than old: a tree somebody worked in yesterday is never
 * taken, however long ago it was made. Past that, it is litter — a full copy of
 * the repository at an earlier state of the trunk, down a path that looks
 * exactly like a path into the repository.
 *
 * **A claim on a queue item is not a spent branch**, however merged it looks.
 * `partitionMerged` above holds that rule and says why it cost a session's work.
 *
 * **A kept tree keeps its branch.** The two are one thing to a person, and
 * deleting the branch out from under a worktree somebody may still be sitting
 * in buys nothing: `git branch --merged` will offer it again at the next
 * landing, and by then the tree is either gone or in use.
 *
 * What it returns is the count of what it took away, because that is what
 * decides whether the trunk goes to `origin` — see `pushNow`. The lane's own
 * branch is left out of the count on purpose: it goes on every landing, so it
 * says nothing about whether this one ended anything.
 */
export async function sweep(state: LandState, root: string, TRUNK: string): Promise<Cleanup> {
  if (!state.trunkTree) return SWEPT_NOTHING;
  let trees = 0;
  let branches = 0;

  // Onto the trunk's tip, and off the lane's branch so `git branch -d` does not
  // refuse a ref that is still checked out somewhere.
  try {
    await gitOrDie(["checkout", "--detach", "--quiet", TRUNK], root);
  } catch (error) {
    console.log(
      `✗ ${root} would not move onto ${TRUNK}'s tip: ${(error as Error).message.split("\n")[0]}`,
    );
    console.log(`  status of ${root}:`);
    console.log(
      (await git(["status", "--short"], root)) || "  (nothing — the checkout itself failed)",
    );
    process.exit(2);
  }

  const held = await worktreesByBranch(root);
  const merged = (
    await git(["branch", "--merged", TRUNK, "--format=%(refname:short)"], state.trunkTree)
  )
    .split("\n")
    .map((line) => line.trim())
    .filter((name) => name && name !== TRUNK);

  const { spent, claims } = partitionMerged(merged, state.branch);
  for (const name of claims) {
    console.log(`  kept     ${name} — a queue claim; its own landing releases it`);
  }

  for (const name of spent) {
    const path = held.get(name);
    if (path && path !== state.trunkTree && path !== root) {
      const idle = await idleDays(path);
      if (idle < KEEP_DAYS) {
        const days = idle < 1 ? "today" : `${Math.floor(idle)}d idle`;
        console.log(`  kept     ${name} — ${days}, swept after ${KEEP_DAYS} idle days`);
        continue; // Its branch stays with it.
      }
      try {
        await removeWorktree(state.trunkTree, path);
        trees++;
        console.log(`  removed  ${path} (${Math.floor(idle)}d idle)`);
      } catch (error) {
        console.log(`  ⚑ ${(error as Error).message}`);
        continue; // Its branch stays too: deleting one and not the other is worse than neither.
      }
    }
    const gone = await git(["branch", "-d", name], state.trunkTree);
    if (gone && name !== state.branch) branches++;
    console.log(
      gone
        ? `  swept    ${name}`
        : `  ⚑ ${name} still holds something git will not lose — left standing`,
    );
  }

  if (root !== state.trunkTree) {
    console.log(`  kept     ${root}`);
    console.log(`           on ${TRUNK}'s tip, detached — git switch -c <name> to carry on here`);
  }

  // Directories git has forgotten about: the litter left by a removal that
  // reported success and was wrong, from before any of this verified itself.
  for (const orphan of await orphanWorktrees(state.trunkTree)) {
    if (orphan.path === root) continue; // Somebody is standing in it — see above.
    if (orphan.dirty) {
      console.log(`  ⚑ ${orphan.path} has uncommitted work, or cannot be read — left in place`);
      continue;
    }
    try {
      await removeOrphan(state.trunkTree, orphan);
      trees++;
      console.log(`  removed  ${orphan.path} (git had forgotten it)`);
    } catch (error) {
      console.log(`  ⚑ ${(error as Error).message}`);
    }
  }

  await sweepSpecs(root);
  return { trees, branches };
}
