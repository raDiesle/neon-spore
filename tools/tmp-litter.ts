/**
 * The directories a browser run leaves under `.claude/tmp`, and when one of
 * them is spent.
 *
 * Its own file at the top of `tools/` beside `retry.ts` because two tools that
 * must not import each other both need the same rule. `tools/frames/browser.ts`
 * makes these directories and sweeps them before it makes another;
 * `tools/land/specs.ts` sweeps them on a landing, next to the spent delegate
 * specs it already clears. Writing the prefix out twice would be a rule
 * re-derived rather than called, and `tools/land` must not gain a dependency on
 * `playwright-core` to avoid it.
 */

import { join } from "node:path";

/**
 * What every browser profile directory this repository makes is called.
 *
 * A run used to let `chromium.launch()` pick its own name under the system temp
 * directory, where nothing here could recognise it: a run that is killed,
 * interrupted or times out never reaches its `finally`, and the profile outlives
 * it outside the repository, where `git status` is clean and no sweep looks. A
 * cleanup on 6 September 2026 found 46 of them holding 508 MB, one still with a
 * headless Chrome attached. Naming them is what makes them findable.
 */
export const PROFILE_PREFIX = "neon-spore-chrome-";

/** Where the repository keeps the litter it owns, spent delegate specs included. */
export function tmpRoot(root: string): string {
  return join(root, ".claude", "tmp");
}

/**
 * An hour, in milliseconds: how old a profile has to be before a sweep is
 * entitled to assume the run that made it is over.
 *
 * The age is the whole safety, exactly as it is in `frames/scratch.ts`. Two of
 * these tools run at once often enough — a lane taking a picture while a perf
 * sweep is going — and a sweep that took a directory by name alone would pull
 * the profile out from under a browser that is still using it. An hour is
 * comfortably longer than the three-minute sweep that is the longest run here.
 */
export const PROFILE_STALE_MS = 3_600_000;

/** One directory's identity, so the rule below can be tested without a disk. */
export interface DirStat {
  name: string;
  mtimeMs: number;
}

/**
 * Which of these entries are spent browser profiles. Pure, and separately
 * tested, because getting it wrong deletes things.
 */
export function staleProfiles(
  entries: readonly DirStat[],
  now: number,
  staleMs = PROFILE_STALE_MS,
): string[] {
  return entries
    .filter((e) => e.name.startsWith(PROFILE_PREFIX) && now - e.mtimeMs > staleMs)
    .map((e) => e.name);
}
