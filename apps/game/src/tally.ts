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

export function throttledTally(
  send: (wave: number, score: number) => void,
): (wave: number, score: number) => void {
  let toldAt = 0;
  return (wave, score) => {
    const now = performance.now();
    if (now - toldAt < EVERY_MS) return;
    toldAt = now;
    send(wave, score);
  };
}
