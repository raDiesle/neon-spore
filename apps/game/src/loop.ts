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

/**
 * How many ticks a wall-clock gap is worth, and what is left over.
 *
 * `remainder` is always in `[0, tickMs)` — the wall-clock time already elapsed
 * toward a tick that has not run yet — and `remainder / tickMs` is the
 * fraction `interpolate.ts` folds into `beatPhase` behind its flag. It was
 * being carried and discarded before anything read it.
 *
 * Pure, and split out for that reason: the catch-up cap and this arithmetic
 * are the whole of what can be wrong here, and neither wants a
 * `requestAnimationFrame` to check.
 */
export function accumulate(
  accumulator: number,
  elapsedMs: number,
  tickMs: number,
): { ticks: number; remainder: number } {
  const total = accumulator + Math.min(MAX_CATCH_UP_MS, elapsedMs);
  const ticks = Math.floor(total / tickMs);
  return { ticks, remainder: total - ticks * tickMs };
}

/**
 * `tickMs` is **asked once a frame**, not computed once at the start.
 *
 * It was `const tickMs = 1000 / tickHz` here until 16 September 2026, and one
 * number for the life of a run is exactly what THE SLOW needed changed: a span
 * of beats played at a fraction of wall-clock rate is a span in which a tick
 * is worth more milliseconds, and nothing else about it moves
 * (`docs/decisions.md` #33). The simulation still runs the same integer steps
 * on the same tick numbers at the same `ticksPerBeat` — a slow window cannot
 * be told from an ordinary one by `hashWorld`, and it is not supposed to be.
 * What the window is *for* lives entirely above this line: the caller asks the
 * world which beats are slowed (`sim/slow.ts`) and hands the answer down as a
 * length of tick.
 *
 * A rate that changes between two frames is safe by the arithmetic already
 * here: `accumulate` floors and subtracts with the same `tickMs`, so the
 * remainder it returns is always inside `[0, tickMs)` and `alpha` stays in
 * `[0, 1)` across a boundary in either direction. A window closing simply
 * leaves a remainder large enough to spend a tick or two on the next frame,
 * which is the catch-up path the loop has always had.
 */
export function startLoop(
  tickMs: () => number,
  onTick: () => void,
  onFrame: (alpha: number) => void,
  clock: LoopClock = {},
): Loop {
  const now = clock.now ?? (() => performance.now());
  const raf = clock.raf ?? ((frame) => requestAnimationFrame(frame));
  let last = now();
  let accumulator = 0;
  let running = true;

  const frame = (at: number): void => {
    if (!running) return;
    const ms = tickMs();
    const { ticks, remainder } = accumulate(accumulator, at - last, ms);
    last = at;
    accumulator = remainder;
    for (let i = 0; i < ticks; i++) onTick();
    onFrame(remainder / ms);
    raf(frame);
  };
  raf(frame);

  return {
    stop() {
      running = false;
    },
  };
}
