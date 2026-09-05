#!/usr/bin/env bun

/**
 * `bun run land` — put this lane on the trunk, linearly, and leave nothing
 * behind.
 *
 * Run it from inside the lane's own worktree. It replays the lane onto the
 * trunk, runs `bun run check` on the result, and only then fast-forwards — so
 * a red tree stops at the rebase rather than after the trunk has moved.
 *
 *   bun run land                 rebase, check, fast-forward main, note, sweep
 *   bun run land --dry-run       say what it would do and stop
 *   bun run land --keep          move the trunk and sweep nothing; carry on here
 *   bun run land --sweep         the cleanup a --keep landing deferred
 *   bun run land --push          send origin/main too, whatever the sweep did
 *   bun run land --no-push       land, and leave origin/main alone regardless
 *
 * The one thing it will not do is merge. If the fast-forward is not available
 * the landing is refused, because the alternative is a fork in a history that
 * is linear on purpose.
 *
 * **Everything after the fast-forward happens without being asked.** Writing
 * the release note, deleting the branch, removing the worktree, and sweeping
 * whatever other lanes are already on the trunk — none of that is a command
 * anybody types, because the moment a lane's work is on `main` is the moment
 * all of it becomes true, and a cleanup step somebody has to remember is a
 * cleanup step that leaves twenty-seven directories standing.
 *
 * **`--keep` is the landing that is not the end of anything.** A lane whose
 * next prompt is already coming still wants its work on the trunk — the trunk
 * moves under it either way, and a rebase left to grow is the expensive
 * mistake. So the trunk takes the commits, the release note is written, and
 * the sweep does not run: the branch, this worktree and every other spent lane
 * stay exactly where they were, and the next turn carries on in place.
 *
 * **The push rides on the sweep.** `origin/main` goes when the sweep actually
 * cleared a lane away, not on every landing — see `pushNow`, and note that
 * `--keep` therefore never pushes on its own. `bun run push` sends it in
 * between.
 *
 * **`--sweep` is the other half of `--keep`, asked for later.** A lane that
 * landed with `--keep` is on the trunk with its branch and its worktree still
 * standing, and every ordinary landing refuses it from then on — it carries
 * nothing the trunk has not got. So the cleanup had no command at all, and the
 * only way to finish the lane was the `git worktree remove` this file exists to
 * keep nobody typing. `--sweep` skips the replay, the check and the
 * fast-forward, because the trunk already has all three, and runs everything
 * that comes after them.
 */

import { git, gitOrDie } from "./git.js";
import {
  type Landing,
  type LandState,
  plan,
  pushNow,
  SWEPT_NOTHING,
  uncommittedOf,
} from "./land.js";
import { type Landed, LOG_FORMAT, parseLanded } from "./notes.js";
import { badge, describe } from "./say.js";
import { sweep, writeNotes } from "./sweep.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const noPush = argv.includes("--no-push");
const forcePush = argv.includes("--push");
const keep = argv.includes("--keep");
const sweepOnly = argv.includes("--sweep");
const TRUNK = "main";

/** What `uncommittedOf` needs, asked of one worktree. */
async function uncommitted(cwd: string): Promise<string[]> {
  const [changed, untracked] = await Promise.all([
    git(["diff", "--name-only", "HEAD"], cwd),
    git(["ls-files", "--others", "--exclude-standard"], cwd),
  ]);
  return uncommittedOf(changed, untracked);
}

/** Which worktree has the trunk checked out, if any. */
async function trunkTree(): Promise<string> {
  const out = await git(["worktree", "list", "--porcelain"], root);
  let path = "";
  for (const line of out.split("\n")) {
    if (line.startsWith("worktree ")) path = line.slice("worktree ".length);
    if (line === `branch refs/heads/${TRUNK}`) return path;
  }
  return "";
}

const branch = (await git(["rev-parse", "--abbrev-ref", "HEAD"], root)) || "HEAD";
const tree = await trunkTree();
const state: LandState = {
  branch,
  trunk: TRUNK,
  dirty: await uncommitted(root),
  ahead: Number(await git(["rev-list", "--count", `${TRUNK}..HEAD`], root)) || 0,
  behind: Number(await git(["rev-list", "--count", `HEAD..${TRUNK}`], root)) || 0,
  trunkTree: tree,
  trunkDirty: tree ? await uncommitted(tree) : [],
  trunkStaged: tree
    ? (await git(["diff", "--cached", "--name-only"], tree)).split("\n").filter(Boolean)
    : [],
  hasOrigin: (await git(["remote", "get-url", "origin"], root)) !== "",
  noPush,
  forcePush,
  keep,
  sweepOnly,
};

const decided = plan(state);
if (!decided.go) {
  console.log(`✗ ${decided.why}`);
  process.exit(1);
}
// The same object, under a name whose type says it is going. `decided` is
// narrowed by the guard above, and that narrowing does not reach inside a
// function declared beside it.
const going: Landing = decided;
for (const line of describe(state, going)) console.log(line);
if (dryRun) process.exit(0);

/**
 * The landing proper: replay, install, check, fast-forward, and say what moved.
 *
 * A function rather than the straight line it used to be, because there is now
 * one run that skips all of it — `--sweep`, which is a lane whose work reached
 * the trunk under an earlier `--keep` and has only its cleanup left. Everything
 * after this is the same either way.
 */
async function moveTrunk(): Promise<Landed[]> {
  if (going.rebase) {
    const proc = Bun.spawn(["git", "rebase", TRUNK], { cwd: root, stdout: "pipe", stderr: "pipe" });
    const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
    if (code !== 0) {
      const conflicted = await git(["diff", "--name-only", "--diff-filter=U"], root);
      await git(["rebase", "--abort"], root);
      console.log(`✗ ${branch} does not replay onto ${TRUNK}; nothing was moved`);
      if (conflicted) console.log(`  conflicts in ${conflicted.split("\n").join(", ")}`);
      else console.log(`  ${err.trim().split("\n")[0] ?? ""}`);
      process.exit(1);
    }
    console.log(`  rebased  onto ${await git(["rev-parse", "--short", TRUNK], root)}`);
  }

  // A replay can bring a workspace package the lane never had — `tools/orphans`
  // arrived that way — and `node_modules` is then stale between the rebase and
  // the check. What the check reports is `Cannot find module '@neon-spore/…'` in
  // a file the lane never opened, which reads as a rebase disaster and is
  // thirteen milliseconds of work. Cheap, idempotent, and it runs after the
  // replay rather than before it, which is the whole point.
  //
  // `--frozen-lockfile` because a silent lockfile drift here is a landing
  // problem, not a `bun run check` problem — the check would report it as a
  // mysterious dependency failure with no mention of the lockfile at all.
  const install = Bun.spawn(["bun", "install", "--frozen-lockfile"], {
    cwd: root,
    stdout: "ignore",
    stderr: "pipe",
  });
  const [installErr, installCode] = await Promise.all([
    new Response(install.stderr).text(),
    install.exited,
  ]);
  if (installCode !== 0) {
    console.log(`✗ bun install --frozen-lockfile failed after the rebase; ${TRUNK} was not moved`);
    console.log(installErr.trim());
    process.exit(1);
  }

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

  const head = await git(["rev-parse", "HEAD"], root);
  const landingLog = await git(
    ["log", "--reverse", "--date=short", `--format=${LOG_FORMAT}`, `${TRUNK}..HEAD`],
    root,
  );
  const landed = parseLanded(landingLog);
  try {
    if (going.moveRef) await gitOrDie(["branch", "--force", TRUNK, head], root);
    else await gitOrDie(["merge", "--ff-only", branch], state.trunkTree);
  } catch (error) {
    console.log(`✗ ${TRUNK} would not fast-forward: ${(error as Error).message.split("\n")[0]}`);
    process.exit(1);
  }

  console.log(`✓ ${TRUNK} is at ${await git(["rev-parse", "--short", TRUNK], root)}`);
  for (const commit of landed) console.log(`  ${commit.sha} ${commit.subject}`);
  return landed;
}

const landed = going.sweepOnly ? [] : await moveTrunk();

await writeNotes(state, landed, TRUNK);
const cleanup = going.sweeps ? await sweep(state, root, TRUNK) : SWEPT_NOTHING;
if (!going.sweeps) console.log(`  kept     ${branch} and every worktree — --keep swept nothing`);

if (pushNow(going, cleanup)) {
  try {
    await gitOrDie(["push", "origin", `${TRUNK}:${TRUNK}`], state.trunkTree || root);
    console.log(`  pushed   origin/${TRUNK}`);
  } catch {
    const sha = await git(["rev-parse", "--short", TRUNK], state.trunkTree || root);
    console.log(`✗ ${TRUNK} is at ${sha} locally; origin was not updated — run: bun run push`);
    process.exit(2);
  }
} else if (going.mayPush) {
  const unpushed = await git(
    ["rev-list", "--count", `origin/${TRUNK}..${TRUNK}`],
    state.trunkTree || root,
  );
  const behind = Number(unpushed) || 0;
  const many = behind === 1 ? "commit" : "commits";
  console.log(`  held     origin/${TRUNK} — ${behind} ${many} unpushed; bun run push sends them`);
}

console.log(badge(branch, TRUNK, await git(["rev-parse", "--short", TRUNK], root), state.ahead));
