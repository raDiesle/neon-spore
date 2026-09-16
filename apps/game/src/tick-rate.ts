import { MILLI, slowRateMilli, type World } from "@neon-spore/sim";

/**
 * **How long one tick is worth in the hand, right now.**
 *
 * The seam this sits on is written down in `sim/index-run.ts`: the simulation
 * says *which beats are slowed* and the app says *how long a tick is worth*.
 * So the conversion cannot live in `packages/sim`, and it may not be written
 * twice here either — two copies is two clocks, and the second one to go stale
 * would be the one nobody is watching.
 *
 * Both callers ask it every frame rather than remembering it. The loop asks so
 * the picture runs at the rate a boss opened (`frame.ts`); the scheduler asks
 * so a press is answered the same number of *milliseconds* later whether or
 * not a window is open (`link-run.ts`, `net/delay.ts`). Two devices get the
 * same answer out of it because the window's boundaries are hashed fields and
 * the rate is a config one.
 *
 * The rate comes off the world's own config rather than arriving beside it: a
 * `tickHz` a caller passed in is a second copy of a number the world already
 * holds, and the two disagreeing is a whole game running at the wrong speed
 * with nothing saying so.
 */
export function tickMs(world: World): number {
  return (1000 / world.cfg.tickHz) * (MILLI / slowRateMilli(world));
}
