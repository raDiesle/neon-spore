import type { RunMark } from "@neon-spore/net";
import { clockText, playSeconds, retriesText, type World } from "@neon-spore/sim";

/**
 * How far this device has got, up to the room now and then.
 *
 * Every few seconds rather than every frame: it is a line on a screen the pair
 * read when they come back, not something anybody is waiting for, and a socket
 * carrying inputs at 120 Hz has better things to do. The room keeps the better
 * of the two seats' figures and never reads it (`apps/server/src/tally.ts`).
 *
 * Split out of `main.ts` when the ship became touchable and that file reached
 * its length limit. It is the one thing in there that was neither wiring nor
 * the loop — a rate limit with a clock of its own — so it is the piece that
 * reads as a unit away from the rest.
 */
const EVERY_MS = 5000;

export function throttledTally(send: (mark: RunMark) => void): (mark: RunMark) => void {
  let toldAt = 0;
  return (mark) => {
    const now = performance.now();
    if (now - toldAt < EVERY_MS) return;
    toldAt = now;
    send(mark);
  };
}

/** Where a run stands: the wave, the clock and the retries (`sim/wave-fail.ts`). */
export function runMark(world: World): RunMark {
  return { wave: world.wave, seconds: playSeconds(world), retries: world.retries };
}

/** A mark's clock and retries as a phrase: `3:42 · 2 retries`. */
export function runMarkText(mark: { seconds: number; retries: number }): string {
  return `${clockText(mark.seconds)} · ${retriesText(mark.retries).toLowerCase()}`;
}
