/**
 * Keeping the screen on while the world ticks.
 *
 * A phone dims and then locks on an idle timer that counts *touches*, and
 * this game is played in long holds: a thumb resting on THE SURGE's bulb, a
 * hand on a handle, a guard held through a volley. A pair three minutes into
 * an act with both thumbs down and no tap for forty seconds is exactly the
 * input a phone reads as an abandoned page — and the other phone is still in
 * the room, still playing, so the dim is a desync the pair have to talk their
 * way out of.
 *
 * **Nothing here is load-bearing.** A browser without the API, and a phone in
 * battery saver that refuses, both play exactly the same game; every path
 * fails quietly, because a rejection is not a reason for a run not to start.
 * `install.ts` next door is written to the same rule for the same reason.
 */

import type { RunState } from "./run-state.js";

/** The half of `WakeLockSentinel` this file uses. */
export interface ScreenLock {
  /** The browser drops the lock when the tab is hidden and says so here. */
  readonly released: boolean;
  release: () => Promise<void>;
}

/** The half of `navigator.wakeLock` this file uses. */
export interface ScreenLocks {
  request: (type: "screen") => Promise<ScreenLock>;
}

/** The browser's own, where there is one. Read off `globalThis` rather than
 * typed against the DOM lib, which has no `wakeLock` on every target we build
 * for — and a missing one is the ordinary case here, not an error. */
export function screenLocks(): ScreenLocks | null {
  const nav = (globalThis as { navigator?: { wakeLock?: ScreenLocks } }).navigator;
  return nav?.wakeLock ?? null;
}

/** What a test asks; the game asks it nothing. */
export interface Awake {
  /** Whether a lock is held right now. */
  held: () => boolean;
  /** Resolves when the request or release in flight has landed. */
  settled: () => Promise<void>;
}

const NOTHING: Awake = { held: () => false, settled: () => Promise.resolve() };

/**
 * The lock follows the run, and the run is the absence of every hold
 * (`run-state.ts`).
 *
 * **That is also the re-request the API needs.** The browser drops the lock
 * when the tab is hidden and does not give it back, so something has to ask
 * again on the way in — and the tab going away is already one of the five
 * named holds, so coming back is a change of this same answer and arrives
 * here as one. There is no second listener on `visibilitychange` because
 * there is nothing for a second one to say: a tab hidden while the menu was
 * up comes back to a menu, and a menu wants no lock.
 *
 * A sentinel the browser released behind our back is still checked for all
 * the same (`released`), because a phone may drop it for reasons that are
 * none of this file's business — battery saver arriving mid-run is one.
 */
export function bindAwake(run: RunState, locks = screenLocks()): Awake {
  if (!locks) return NOTHING;
  let lock: ScreenLock | null = null;
  // One chain, so a request and the release that overtakes it cannot both be
  // in flight: a run that starts and is paused inside the same second would
  // otherwise leave the phone holding a lock nobody asked for any more.
  let chain: Promise<void> = Promise.resolve();

  const take = async (): Promise<void> => {
    if (!run.running()) return;
    if (lock && !lock.released) return;
    lock = await locks.request("screen").catch(() => null);
  };

  const drop = async (): Promise<void> => {
    const held = lock;
    lock = null;
    if (held && !held.released) await held.release().catch(() => {});
  };

  const after = (step: () => Promise<void>): void => {
    chain = chain.then(step).catch(() => {});
  };

  run.onChange((running) => after(running ? take : drop));
  // `?play=1` goes straight to the field and puts no hold down on the way, so
  // a lock taken only on the first change would never be taken at all there.
  if (run.running()) after(take);

  return { held: () => lock !== null && !lock.released, settled: () => chain };
}
