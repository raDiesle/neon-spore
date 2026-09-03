/**
 * Fixed-timestep driver. Wall-clock time exists here and nowhere below:
 * the simulation only ever hears "one tick has passed".
 */
export interface Loop {
  stop(): void;
}

/**
 * The clock and the frame source, so the loop can be run by hand.
 *
 * Both default to the browser's own, which is what every caller in the game
 * uses. A test hands over its own instead: what is worth proving here is the
 * catch-up cap and that `stop` really ends the chain, and neither can be
 * observed from outside without control of the two things time comes in
 * through.
 */
export interface LoopClock {
  now?: () => number;
  raf?: (frame: (now: number) => void) => void;
}

/**
 * The largest jump the loop will believe, in milliseconds.
 *
 * A backgrounded tab comes back with minutes on the clock, and without this
 * the loop would run every tick of them in one frame — tens of thousands of
 * them, in front of a player who has just looked at their phone again. Time
 * the loop refuses is time the simulation never hears about, which is right:
 * nobody was playing.
 */
export const MAX_CATCH_UP_MS = 250;

export function startLoop(
  tickHz: number,
  onTick: () => void,
  onFrame: () => void,
  clock: LoopClock = {},
): Loop {
  const now = clock.now ?? (() => performance.now());
  const raf = clock.raf ?? ((frame) => requestAnimationFrame(frame));
  const tickMs = 1000 / tickHz;
  let last = now();
  let accumulator = 0;
  let running = true;

  const frame = (at: number): void => {
    if (!running) return;
    accumulator += Math.min(MAX_CATCH_UP_MS, at - last);
    last = at;
    while (accumulator >= tickMs) {
      onTick();
      accumulator -= tickMs;
    }
    onFrame();
    raf(frame);
  };
  raf(frame);

  return {
    stop() {
      running = false;
    },
  };
}
