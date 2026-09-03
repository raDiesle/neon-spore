/**
 * The stage's clock: a fixed-timestep loop of its own rather than the game's.
 *
 * Reaching into `apps/game`'s loop would cross a boundary the workspace
 * deliberately refuses — a tool may not import an application — so the twenty
 * lines are written again here, and `stage.ts` hands them the two calls that
 * differ: one tick of the world, one frame of the picture.
 */
export interface StageLoop {
  /** The tick rate, read fresh — TUNING can change it mid-run. */
  tickHz(): number;
  /** One tick of the simulation, or the paused stand-in for one. */
  advance(): void;
  /** One frame, given the seconds since the last. */
  paint(dt: number): void;
}

export function runStageLoop({ tickHz, advance, paint }: StageLoop): void {
  let last = performance.now();
  let carry = 0;
  const frame = (now: number): void => {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    const hz = tickHz();
    carry += dt * hz;
    // Never more than a second's catch-up, so an away tab does not burst.
    const steps = Math.min(Math.floor(carry), hz);
    for (let i = 0; i < steps; i++) advance();
    carry -= steps;
    paint(dt);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
