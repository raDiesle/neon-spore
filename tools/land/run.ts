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
 *   bun run land --unverified "<what>"   repeatable; queue what went unchecked
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

import { crlfOnDisk, crlfRefusal } from "./crlf.js";
import { doneTwiceSaid } from "./done-twice.js";
import { git, gitOrDie } from "./git.js";
import { type Landing, plan, SWEPT_NOTHING } from "./land.js";
import { writeNotes } from "./note-commit.js";
import { type Landed, LOG_FORMAT, parseLanded } from "./notes.js";
import { droppedAfter, droppedRefusal } from "./queue-dropped.js";
import { everHeldIn, queueSnapshots, refusal, resurrectedAfter } from "./queue-guard.js";
import { trunkMove, trunkRaced } from "./race.js";
import { rerace } from "./race-retry.js";
import { checkGreen } from "./red-check.js";
import { replay } from "./replay.js";
import { badge, describe } from "./say.js";
import { send } from "./send.js";
import { readState, trunkTree } from "./state.js";
import { sweep } from "./sweep.js";
import { installFrozen, oldBunRefusal } from "./toolchain.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const noPush = argv.includes("--no-push");
const forcePush = argv.includes("--push");
const keep = argv.includes("--keep");
const sweepOnly = argv.includes("--sweep");
const TRUNK = "main";

const { state, unreached, deepened } = await readState(root, TRUNK, {
  noPush,
  forcePush,
  keep,
  sweepOnly,
});
if (deepened) console.log(deepened);
if (unreached) console.log(unreached);
const branch = state.branch;

const decided = plan(state);
if (!decided.go) {
  console.log(`✗ ${decided.why}`);
  process.exit(1);
}
// The same object, under a name whose type says it is going. `decided` is
// narrowed by the guard above, and that narrowing does not reach inside a
// function declared beside it.
const going: Landing = decided;
// Asked before anything moves, not diagnosed after the rebase: a bun below the
// pin cannot read `bun.lock`, and the frozen install below is where that used
// to come out, nameless (`toolchain.ts`).
const oldBun = oldBunRefusal(Bun.version, going.sweepOnly);
if (oldBun !== null) {
  for (const line of oldBun) console.log(line);
  process.exit(1);
}
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
  // Where the trunk stands before any of this. Asked again just before the ref
  // move, because nothing holds it in between and the check is minutes long
  // (`trunkRaced`).
  let trunkBefore = await git(["rev-parse", TRUNK], root);

  const show = (rev: string, file: string) => git(["show", `${rev}:${file}`], root);
  const run = (args: string[]) => git(args, root);
  // The replay and its two guards over the queue, as one call: a trunk that
  // moved during the check is replayed onto again (`race-retry.ts`).
  const replayGuarded = async (): Promise<{ ok: boolean; said: string[] }> => {
    // Read before the replay, asked after it: what the trunk had taken out of
    // the queue, and what the lane branched from. A rebase that resolves
    // `docs/queue.md` in the lane's favour puts every removed entry back in
    // one move, and nothing else notices (`queue-guard.ts`).
    const mergeBase = (await git(["merge-base", TRUNK, "HEAD"], root)) || TRUNK;
    const queueBefore = await queueSnapshots(TRUNK, show, mergeBase);
    // The same snapshots asked the other way: an entry both this lane and the
    // trunk took out was done twice, and is said rather than refused (`done-twice.ts`).
    const said = await doneTwiceSaid(queueBefore, mergeBase, TRUNK, run);
    const replayed = await replay(root, TRUNK);
    if (!replayed.ok) {
      said.push(`✗ ${branch} does not replay onto ${TRUNK}; nothing was moved`);
      if (replayed.conflicted.length > 0)
        said.push(`  conflicts in ${replayed.conflicted.join(", ")}`);
      else if (replayed.said) said.push(`  ${replayed.said}`);
      return { ok: false, said };
    }
    said.push(`  rebased  onto ${await git(["rev-parse", "--short", TRUNK], root)}`);
    for (const file of new Set(replayed.resolved)) {
      said.push(`  merged   ${file} — the trunk's copy, carrying this lane's own edits`);
    }
    // The second half of the guard: the trunk's whole history, asked only of
    // the entries the three snapshots read as newly filed (`queue-guard.ts`).
    const back = await resurrectedAfter(root, queueBefore, everHeldIn(run, TRUNK));
    if (back.length > 0) return { ok: false, said: [...said, ...refusal(TRUNK, back)] };
    // Its mirror: an entry the trunk has that this lane took out unclosed (`queue-dropped.ts`).
    const laneLog = await run(["log", "--format=%B", `${TRUNK}..HEAD`]);
    const gone = await droppedAfter(root, queueBefore, branch, laneLog);
    if (gone.length > 0) return { ok: false, said: [...said, ...droppedRefusal(TRUNK, gone)] };
    return { ok: true, said };
  };
  if (going.rebase) {
    const replayed = await replayGuarded();
    for (const line of replayed.said) console.log(line);
    if (!replayed.ok) process.exit(1);
  }

  // The install a replay can leave stale, frozen so a lockfile drift is the
  // landing's to report (`toolchain.ts`).
  const installErr = await installFrozen(root);
  if (installErr !== null) {
    console.log(`✗ bun install --frozen-lockfile failed after the rebase; ${TRUNK} was not moved`);
    console.log(installErr);
    process.exit(1);
  }

  // Asked before the check rather than diagnosed after it. A tracked file with
  // CRLF on disk fails the lint as a whole-file formatter diff that names a
  // formatter and no cause, and `git status` can be clean the whole time
  // (`crlf.ts`).
  const crlf = crlfOnDisk(await git(["ls-files", "--eol"], root));
  if (crlf.length > 0) {
    for (const line of crlfRefusal(crlf, TRUNK)) console.log(line);
    process.exit(1);
  }

  if (!(await checkGreen(root, TRUNK, ["check"]))) process.exit(1);
  console.log("  checked  green");

  // The trunk moved during the check: replayed onto again and checked over
  // both diffs when what arrived is none of this lane's, a bounded number of
  // times, rather than refused and the whole check thrown away (`raceRetry`).
  for (let tries = 0; ; tries++) {
    const now = await git(["rev-parse", TRUNK], root);
    const raced = trunkRaced(TRUNK, trunkBefore, now);
    if (!raced) break;
    const again = await rerace({
      root,
      trunk: TRUNK,
      before: trunkBefore,
      now,
      tries,
      replay: async () => {
        const replayed = await replayGuarded();
        const installErr = replayed.ok ? await installFrozen(root) : null;
        if (installErr !== null) replayed.said.push(`✗ bun install failed: ${installErr}`);
        return { ok: replayed.ok && installErr === null, said: replayed.said };
      },
      check: (since) => checkGreen(root, TRUNK, ["check:fast", "--since", since]),
    });
    for (const line of again.said) console.log(line);
    if (!again.ok) {
      console.log(`✗ ${raced}`);
      process.exit(1);
    }
    console.log("  checked  green, over both diffs");
    trunkBefore = now;
  }

  const head = await git(["rev-parse", "HEAD"], root);
  const landingLog = await git(
    ["log", "--reverse", "--date=short", `--format=${LOG_FORMAT}`, `${TRUNK}..HEAD`],
    root,
  );
  const landed = parseLanded(landingLog);
  // The holder read again, and handed on: the note and the sweep after this
  // commit in whichever tree holds the trunk now (`trunkMove`).
  const move = trunkMove(TRUNK, state.trunkTree, await trunkTree(root, TRUNK));
  if (move.said) console.log(`  ⚑ ${move.said}`);
  state.trunkTree = move.tree;
  try {
    if (move.tree === "") await gitOrDie(["branch", "--force", TRUNK, head], root);
    else await gitOrDie(["merge", "--ff-only", branch], move.tree);
  } catch (error) {
    console.log(`✗ ${TRUNK} would not fast-forward: ${(error as Error).message.split("\n")[0]}`);
    process.exit(1);
  }

  console.log(`✓ ${TRUNK} is at ${await git(["rev-parse", "--short", TRUNK], root)}`);
  for (const commit of landed) console.log(`  ${commit.sha} ${commit.subject}`);
  return landed;
}

const landed = going.sweepOnly ? [] : await moveTrunk();

await writeNotes(state, landed, TRUNK, root, argv);
const cleanup = going.sweeps ? await sweep(state, root, TRUNK) : SWEPT_NOTHING;
if (!going.sweeps) console.log(`  kept     ${branch} and every worktree — --keep swept nothing`);

await send(going, cleanup, state, root);

console.log(badge(branch, TRUNK, await git(["rev-parse", "--short", TRUNK], root), state.ahead));
