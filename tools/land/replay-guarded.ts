/**
 * **The replay with its guards over the queue, and the race that repeats it.**
 *
 * Cut out of `run.ts` when the guard against dropped entries took that file to
 * the size line. The two belong together because they are one seam: the
 * landing replays once before the check, and again — the same call, guards and
 * all — each time the trunk moves during it (`race-retry.ts`). `run.ts` keeps
 * the plan, the check and the report.
 */

import { doneTwiceSaid } from "./done-twice.js";
import { git } from "./git.js";
import { droppedAfter, droppedRefusal } from "./queue-dropped.js";
import {
  everHeldIn,
  queueSnapshots,
  refusal,
  restoredIn,
  resurrectedAfter,
  unrestored,
} from "./queue-guard.js";
import { trunkRaced } from "./race.js";
import { rerace } from "./race-retry.js";
import { checkGreen } from "./red-check.js";
import { replay } from "./replay.js";
import { installFrozen } from "./toolchain.js";

/** Replayed with both guards passed, or refused — and the lines to print. */
export interface Guarded {
  ok: boolean;
  said: string[];
}

/**
 * The replay and its two guards over the queue, as one call.
 *
 * **The guards run whether or not there is anything to replay.** A refused
 * landing has already rebased the lane, so the same command run again found
 * nothing to replay and — when the guards lived inside the replay — skipped
 * them and landed the entry it had just refused: THE BLISTER's lanes 5 to 8,
 * on 8 October 2026. `rebase` false asks the same questions of the tree as it
 * stands. An entry put back on purpose says so in a commit message,
 * `Restored: <title>` (`restoredIn`), not by running the landing twice.
 */
export async function replayGuarded(
  root: string,
  trunk: string,
  branch: string,
  rebase: boolean,
): Promise<Guarded> {
  const show = (rev: string, file: string) => git(["show", `${rev}:${file}`], root);
  const run = (args: string[]) => git(args, root);
  // Read before the replay, asked after it: what the trunk had taken out of
  // the queue, and what the lane branched from. A rebase that resolves
  // `docs/queue.md` in the lane's favour puts every removed entry back in
  // one move, and nothing else notices (`queue-guard.ts`).
  const mergeBase = (await git(["merge-base", trunk, "HEAD"], root)) || trunk;
  const queueBefore = await queueSnapshots(trunk, show, mergeBase);
  // The same snapshots asked the other way: an entry both this lane and the
  // trunk took out was done twice, and is said rather than refused (`done-twice.ts`).
  const said = await doneTwiceSaid(queueBefore, mergeBase, trunk, run);
  const replayed = rebase ? await replay(root, trunk) : null;
  if (replayed !== null && !replayed.ok) {
    said.push(`✗ ${branch} does not replay onto ${trunk}; nothing was moved`);
    if (replayed.conflicted.length > 0)
      said.push(`  conflicts in ${replayed.conflicted.join(", ")}`);
    else if (replayed.said) said.push(`  ${replayed.said}`);
    return { ok: false, said };
  }
  if (replayed !== null) {
    said.push(`  rebased  onto ${await git(["rev-parse", "--short", trunk], root)}`);
    for (const file of new Set(replayed.resolved)) {
      said.push(`  merged   ${file} — the trunk's copy, carrying this lane's own edits`);
    }
  }
  const laneLog = await run(["log", "--format=%B", `${trunk}..HEAD`]);
  // The second half of the guard: the trunk's whole history, asked only of
  // the entries the three snapshots read as newly filed (`queue-guard.ts`).
  // An entry the lane's own commits say it restored is let through.
  const restored = restoredIn(laneLog);
  const found = await resurrectedAfter(root, queueBefore, everHeldIn(run, trunk));
  const back = unrestored(found, restored);
  for (const title of restored) said.push(`  restored ${title} — on this lane's word`);
  if (back.length > 0) return { ok: false, said: [...said, ...refusal(trunk, back)] };
  // Its mirror: an entry the trunk has that this lane took out unclosed (`queue-dropped.ts`).
  const gone = await droppedAfter(root, queueBefore, branch, laneLog);
  if (gone.length > 0) return { ok: false, said: [...said, ...droppedRefusal(trunk, gone)] };
  return { ok: true, said };
}

/**
 * The trunk moved during the check: replayed onto again and checked over both
 * diffs when what arrived is none of this lane's, a bounded number of times,
 * rather than refused and the whole check thrown away (`raceRetry`). Lines are
 * said as they happen, since a retry runs a check of its own; `null` is a
 * trunk that holds still, and otherwise the race that would not settle.
 */
export async function settleRaces(
  root: string,
  trunk: string,
  branch: string,
  checkedAt: string,
  say: (line: string) => void,
): Promise<string | null> {
  let before = checkedAt;
  for (let tries = 0; ; tries++) {
    const now = await git(["rev-parse", trunk], root);
    const raced = trunkRaced(trunk, before, now);
    if (!raced) return null;
    const again = await rerace({
      root,
      trunk,
      before,
      now,
      tries,
      replay: async () => {
        const replayed = await replayGuarded(root, trunk, branch, true);
        const installErr = replayed.ok ? await installFrozen(root) : null;
        if (installErr !== null) replayed.said.push(`✗ bun install failed: ${installErr}`);
        return { ok: replayed.ok && installErr === null, said: replayed.said };
      },
      check: (since) => checkGreen(root, trunk, ["check:fast", "--since", since]),
    });
    for (const line of again.said) say(line);
    if (!again.ok) return raced;
    say("  checked  green, over both diffs");
    before = now;
  }
}
