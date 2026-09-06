/**
 * The picture's sub-tick smoothing, behind a flag.
 *
 * `beatPhase` already carries a creature across a beat, but only at tick
 * granularity: it is `(world.tick % tpb) / tpb`, a function of the tick that
 * last *ran*, so a frame landing between two ticks draws the position it drew
 * before, verbatim, until the next tick catches up. The loop had the missing
 * fraction the whole time and threw it away — `accumulate`'s remainder is the
 * wall-clock time already elapsed toward a tick that has not happened yet
 * (`loop.ts`). At a display faster than the tick rate that gap is judder.
 *
 * `interpolatedBeatPhase` folds it back in. Nothing about the simulation
 * moves: the world is stepped on exactly the ticks it was stepped on before,
 * and what changes is only where the same world is *drawn*.
 *
 * **Offered, not shipped.** The picture drawn for one `World` differs from the
 * one that ships, so by CLAUDE.md's *a look is offered, never replaced* this
 * stays off unless `?interpolate=1` asks for it — `raster.ts`'s arrangement,
 * and for its reason: the only way to choose between two motions is to watch
 * both. See `docs/looks.md`.
 */
const INTERPOLATE_PARAM = "interpolate";

/** Pure, so the rule can be tested without a browser — the shape `raster.ts` uses. */
export function interpolationRequested(url: string): boolean {
  const parsed = new URL(url, "http://game.invalid/");
  const value = parsed.searchParams.get(INTERPOLATE_PARAM);
  return value !== null && value !== "0";
}

/**
 * `tick` is the last tick `step` actually ran and `alpha` is in `[0, 1)`, the
 * fraction of the next tick already elapsed.
 *
 * The result stays in `[0, 1)` the way `beatPhase` always has; it is simply
 * allowed to lead the tick that produced it by up to one tick of wall clock.
 */
export function interpolatedBeatPhase(tick: number, alpha: number, ticksPerBeat: number): number {
  return ((tick + alpha) % ticksPerBeat) / ticksPerBeat;
}
