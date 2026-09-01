#!/usr/bin/env bun

/**
 * `bun run land` — put this lane on the trunk, linearly, and leave nothing
 * behind.
 *
 * Run it from inside the lane's own worktree. It replays the lane onto the
 * trunk, runs `bun run check` on the result, and only then fast-forwards — so
 * a red tree stops at the rebase rather than after the trunk has moved.
 *
 *   bun run land                 rebase, check, fast-forward main, sweep
 *   bun run land --dry-run       say what it would do and stop
 *   bun run land --push          push the trunk to origin afterwards
 *
 * The one thing it will not do is merge. If the fast-forward is not available
 * the landing is refused, because the alternative is a fork in a history that
 * is linear on purpose.
 *
 * **Everything after the fast-forward happens without being asked.** Writing
 * the release note, deleting the branch, removing the worktree, and sweeping
 * whatever other lanes are already on the trunk — none of that is a command
 * anybody types, because the moment a lane's work is on `main` is the moment
 * all four become true, and a cleanup step somebody has to remember is a
 * cleanup step that leaves twenty-seven directories standing.
 */

import { join } from "node:path";
import { describe, type LandState, plan } from "./land.js";
import { type Landed, LOG_FORMAT, parseLanded, prepend } from "./notes.js";
import { idleDays, KEEP_DAYS, orphanWorktrees, removeOrphan, removeWorktree } from "./worktree.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const wantsPush = argv.includes("--push");
const TRUNK = "main";

async function git(args: string[], cwd = root): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return code === 0 ? out.trim() : "";
}

async function gitOrDie(args: string[], cwd = root): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`${err.trim() || out.trim()}`);
  return out.trim();
}

function dirtyOf(porcelain: string): string[] {
  return porcelain
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().replace(/^\S+\s+/, ""));
}

/** Which worktree has the trunk checked out, if any. */
async function trunkTree(): Promise<string> {
  const out = await git(["worktree", "list", "--porcelain"]);
  let path = "";
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
    if (line === `branch refs/heads/${TRUNK}`) return path;
  }
  return "";
}

/** Every worktree by the branch it holds, so a sweep knows what to remove first. */
async function worktreesByBranch(): Promise<Map<string, string>> {
  const out = await git(["worktree", "list", "--porcelain"]);
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

const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"])) || "HEAD";
const tree = await trunkTree();
const state: LandState = {
  branch,
  trunk: TRUNK,
  dirty: dirtyOf(await git(["status", "--porcelain"])),
  ahead: Number(await git(["rev-list", "--count", `${TRUNK}..HEAD`])) || 0,
  behind: Number(await git(["rev-list", "--count", `HEAD..${TRUNK}`])) || 0,
  trunkTree: tree,
  trunkDirty: tree ? dirtyOf(await git(["status", "--porcelain"], tree)) : [],
};

const decided = plan(state);
if (!decided.go) {
  console.log(`✗ ${decided.why}`);
  process.exit(1);
}
for (const line of describe(state, decided)) console.log(line);
if (dryRun) process.exit(0);

if (decided.rebase) {
  const proc = Bun.spawn(["git", "rebase", TRUNK], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
  if (code !== 0) {
    const conflicted = await git(["diff", "--name-only", "--diff-filter=U"]);
    await git(["rebase", "--abort"]);
    console.log(`✗ ${branch} does not replay onto ${TRUNK}; nothing was moved`);
    if (conflicted) console.log(`  conflicts in ${conflicted.split("\n").join(", ")}`);
    else console.log(`  ${err.trim().split("\n")[0] ?? ""}`);
    process.exit(1);
  }
  console.log(`  rebased  onto ${await git(["rev-parse", "--short", TRUNK])}`);
}

// A replay can bring a workspace package the lane never had — `tools/orphans`
// arrived that way — and `node_modules` is then stale between the rebase and
// the check. What the check reports is `Cannot find module '@neon-spore/…'` in
// a file the lane never opened, which reads as a rebase disaster and is
// thirteen milliseconds of work. Cheap, idempotent, and it runs after the
// replay rather than before it, which is the whole point.
await Bun.spawn(["bun", "install"], { cwd: root, stdout: "ignore", stderr: "ignore" }).exited;

const check = Bun.spawn(["bun", "run", "check"], { cwd: root, stdout: "pipe", stderr: "pipe" });
const [checkOut, checkErr, checkCode] = await Promise.all([
  new Response(check.stdout).text(),
  new Response(check.stderr).text(),
  check.exited,
]);
if (checkCode !== 0) {
  console.log(`✗ bun run check is red on the replayed lane; ${TRUNK} was not moved`);
  console.log(`${checkOut}${checkErr}`.trim().split("\n").slice(-25).join("\n"));
  process.exit(1);
}
console.log("  checked  green");

const head = await git(["rev-parse", "HEAD"]);
const landingLog = await git([
  "log",
  "--reverse",
  "--date=short",
  `--format=${LOG_FORMAT}`,
  `${TRUNK}..HEAD`,
]);
const landed: Landed[] = parseLanded(landingLog);
try {
  if (decided.moveRef) await gitOrDie(["branch", "--force", TRUNK, head]);
  else await gitOrDie(["merge", "--ff-only", branch], state.trunkTree);
} catch (error) {
  console.log(`✗ ${TRUNK} would not fast-forward: ${(error as Error).message.split("\n")[0]}`);
  process.exit(1);
}

console.log(`✓ ${TRUNK} is at ${await git(["rev-parse", "--short", TRUNK])}`);
for (const commit of landed) console.log(`  ${commit.sha} ${commit.subject}`);

/**
 * The release note, written where the fact is known.
 *
 * It is a second commit on the trunk rather than an amendment to the lane's
 * own, and deliberately so: the tree `bun run check` went green on is the tree
 * that just landed, and editing a file into it afterwards would make the green
 * result a result about something else. A docs-only commit is the cheap half of
 * that trade.
 *
 * Nothing is asked of the reader and nothing is asked of the session — the
 * entry is derived from the commit subject and its first paragraph, which the
 * commit already had to carry.
 */
async function writeNotes(): Promise<void> {
  if (landed.length === 0) return;
  if (!state.trunkTree) {
    console.log(`  ⚑ no release note — nothing has ${TRUNK} checked out`);
    return;
  }
  const path = join(state.trunkTree, "docs/release-notes.md");
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : "";
  await Bun.write(path, prepend(existing, landed));
  await gitOrDie(["add", "docs/release-notes.md"], state.trunkTree);
  const what = landed.length === 1 ? "one landing" : `${landed.length} landings`;
  await gitOrDie(["commit", "-q", "-m", `Release notes for ${what}`], state.trunkTree);
  console.log(`  noted    docs/release-notes.md — ${what}`);
}

await writeNotes();

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
 * **Every other merged worktree gets `KEEP_DAYS` idle days first.** Its code is
 * worth nothing the moment it is on the trunk, but its `node_modules` is worth
 * the minute a fresh worktree spends on `bun install`, and the review that
 * finds something to adjust usually happens a day or two after the landing, not
 * during it. Idle rather than old: a tree somebody worked in yesterday is never
 * taken, however long ago it was made. Past that, it is litter — a full copy of
 * the repository at an earlier state of the trunk, down a path that looks
 * exactly like a path into the repository.
 *
 * **A kept tree keeps its branch.** The two are one thing to a person, and
 * deleting the branch out from under a worktree somebody may still be sitting
 * in buys nothing: `git branch --merged` will offer it again at the next
 * landing, and by then the tree is either gone or in use.
 */
async function sweep(): Promise<void> {
  if (!state.trunkTree) return;

  // Onto the trunk's tip, and off the lane's branch so `git branch -d` does not
  // refuse a ref that is still checked out somewhere.
  await git(["checkout", "--detach", "--quiet", TRUNK], root);

  const held = await worktreesByBranch();
  const merged = (await git(["branch", "--merged", TRUNK, "--format=%(refname:short)"], tree))
    .split("\n")
    .map((line) => line.trim())
    .filter((name) => name && name !== TRUNK);

  for (const name of merged) {
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
        console.log(`  removed  ${path} (${Math.floor(idle)}d idle)`);
      } catch (error) {
        console.log(`  ⚑ ${(error as Error).message}`);
        continue; // Its branch stays too: deleting one and not the other is worse than neither.
      }
    }
    const gone = await git(["branch", "-d", name], state.trunkTree);
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
      console.log(`  removed  ${orphan.path} (git had forgotten it)`);
    } catch (error) {
      console.log(`  ⚑ ${(error as Error).message}`);
    }
  }
}

await sweep();

if (wantsPush) {
  try {
    await gitOrDie(["push", "origin", `${TRUNK}:${TRUNK}`], state.trunkTree || root);
    console.log(`  pushed   origin/${TRUNK}`);
  } catch (error) {
    console.log(`  ⚠ push to origin/${TRUNK} failed: ${(error as Error).message.split("\n")[0]}`);
  }
}
