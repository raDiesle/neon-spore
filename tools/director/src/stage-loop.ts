/**
 * The stage's clock: a fixed-timestep loop of its own rather than the game's.
 *
 * Reaching into `apps/game`'s loop would cross a boundary the workspace
 * deliberately refuses — a tool may not import an application — so the twenty
 * lines are written again here, and the caller hands them the two calls that
 * differ: one tick of the world, one frame of the picture.
 *
 * Written *once* here. `raster-field.ts` and `versus-pair.ts` each carried a
 * copy, the first saying in a comment that it was "the same fixed-timestep loop
 * `stage.ts` runs" and then re-typing it. Three copies of a catch-up cap is a
 * cap that will be raised in one of them; `loop-once.test.ts` holds it at one.
 * The two hooks below are what the copies differed by, and nothing more.
 */
export interface StageLoop {
  /** The tick rate, read fresh — TUNING can change it mid-run. */
  tickHz(): number;
  /** One tick of the simulation, or the paused stand-in for one. */
  advance(): void;
  /**
   * One frame. `dt` is the simulated seconds the world just moved through,
   * `real` the wall-clock seconds since the last frame — the same number
   * unless a `scale` is given, and different things to a caller that pauses.
   */
  paint(dt: number, real: number): void;
  /**
   * Simulated seconds from real ones. Returns 0 to hold the world still while
   * frames keep coming, which is how VERSUS pauses and freezes without
   * stopping the picture. Omitted, a second of wall clock is a second.
   */
  scale?(real: number): number;
  /**
   * Whether to run another frame at all. `raster-field.ts` answers with
   * `canvas.isConnected`, so a sheet closed by the page stops stepping a world
   * nobody can see. Omitted, only `stop()` ends the loop.
   */
  alive?(): boolean;
}

/** What a caller keeps in order to end the loop it started. */
export interface StageLoopHandle {
  stop(): void;
}

export function runStageLoop({ tickHz, advance, paint, scale, alive }: StageLoop): StageLoopHandle {
  let last = performance.now();
  let carry = 0;
  let raf = 0;
  let stopped = false;
  const frame = (now: number): void => {
    if (stopped || (alive !== undefined && !alive())) return;
    // Asked for before the work rather than after, the way `versus-pair.ts`
    // always did it: a throw in `paint` then costs one frame instead of the
    // whole loop, and a stopped loop has already returned above.
    raf = requestAnimationFrame(frame);
    const real = Math.min(0.25, (now - last) / 1000);
    last = now;
    const dt = scale === undefined ? real : scale(real);
    const hz = tickHz();
    carry += dt * hz;
    // Never more than a second's catch-up, so an away tab does not burst.
    const steps = Math.min(Math.floor(carry), hz);
    for (let i = 0; i < steps; i++) advance();
    carry -= steps;
    paint(dt, real);
  };
  raf = requestAnimationFrame(frame);
  return {
    stop(): void {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}
