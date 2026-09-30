/**
 * **A trunk that moved during the check**, replayed onto and checked narrowly.
 *
 * The git-facing half of `raceRetry` (`race.ts`), which decides; this reads
 * the two diffs it decides over, replays, and runs the narrowed check. Both
 * the replay and the check are handed in, so a test can move a real trunk
 * between the check and the move without a minutes-long `bun run check`
 * (`test/race-retry.test.ts`), and `replay-guarded.ts` can hand in the replay with its
 * queue guard and its frozen install.
 */

import { git } from "./git.js";
import { raceRetry } from "./race.js";
import { SETTLED } from "./replay.js";

export interface Rerace {
  root: string;
  trunk: string;
  /** Where the trunk stood when the lane was last checked, and where it stands now. */
  before: string;
  now: string;
  /** How many times this landing has already replayed after a race. */
  tries: number;
  /** The replay onto the trunk as it stands now; `said` is why, when it stops. */
  replay: () => Promise<{ ok: boolean; said: string[] }>;
  /** The narrowed check over everything since `since` — both diffs at once. */
  check: (since: string) => Promise<boolean>;
}

/** What the race came to: replayed and green, or refused — and the lines to print, indented. */
export interface Reraced {
  ok: boolean;
  said: string[];
}

async function names(root: string, from: string, to: string): Promise<string[]> {
  const out = await git(["diff", "--name-only", from, to], root);
  return out ? out.split("\n").filter(Boolean) : [];
}

/**
 * Replay onto `now` and check again, when what arrived touches none of this
 * lane's files but the records. The lane's own diff is read against `before`,
 * which the lane was replayed onto, so it holds this lane's work and nothing
 * the trunk took; the check is asked from `before` too, which after the second
 * replay is both.
 */
export async function rerace(r: Rerace): Promise<Reraced> {
  const decided = raceRetry(
    r.trunk,
    await names(r.root, r.before, "HEAD"),
    await names(r.root, r.before, r.now),
    SETTLED,
    r.tries,
  );
  if (!decided.retry) return { ok: false, said: [`  ⚑ ${decided.why}`] };
  const said = [`  ⚑ ${decided.said}`];
  const replayed = await r.replay();
  said.push(...replayed.said);
  if (!replayed.ok) return { ok: false, said };
  const green = await r.check(r.before);
  if (!green) said.push(`  ⚑ check:fast went red after the second replay`);
  return { ok: green, said };
}
