import type { InputDelay } from "@neon-spore/net";
import {
  beatPhaseTicks,
  MILLI,
  slowing,
  slowRateMilli,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

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

/**
 * **How many ticks ahead a press made now should be scheduled.**
 *
 * `InputDelay` holds a number of milliseconds and `ticksAt` turns it into
 * ticks at one rate. That is the whole answer for a wait spent entirely at one
 * rate, and it is wrong for a wait that *crosses a boundary*: a thumb inside
 * one of THE SLOW's windows asked for eight ticks because a tick was worth
 * 25 ms there, and if the window closed two ticks later the remaining six were
 * worth 8⅓ ms each and the press was answered after 70 ms rather than the 195
 * the link asked for. Short is the direction that costs the run — the peer's
 * promise may not have arrived — so the wait is walked instead of divided:
 * every tick still inside the window is spent at the slow rate, and what is
 * left over is spent at the ordinary one.
 *
 * The other direction needs no walk. A press made *before* a window opens is
 * over-delayed by the same arithmetic, which costs a little feel on one press
 * and never a stall — and a window is only ever opened from the beat the
 * simulation is on (`sim/slow.ts`), so nothing here can see one coming.
 *
 * Both devices walk the same ladder: `slowFromBeat` and `slowToBeat` are
 * hashed fields, and the rate and the beat length are config.
 */
export function ticksAhead(delay: InputDelay, world: World): number {
  const rate = tickMs(world);
  if (!slowing(world)) return delay.ticksAt(rate);
  const left = ticksLeftSlow(world);
  if (left * rate >= delay.ms) return delay.ticksAt(rate);
  const over = delay.ms - left * rate;
  return left + Math.ceil(over / (1000 / world.cfg.tickHz));
}

/**
 * Ticks from here to the tick the window closes on.
 *
 * Counted forward from the tick line rather than by multiplying a beat back
 * into ticks, which is the mistake `sim/beat-clock.ts` exists to refuse:
 * `world.beat` is a *label* and runs behind `tick / ticksPerBeat`. The beats
 * between here and the end are whole ones — `onBeat` fires on every multiple
 * of `ticksPerBeat` — so the distance is those beats less however far into the
 * current one this tick already is.
 */
function ticksLeftSlow(world: World): number {
  const beats = world.slowToBeat - world.beat;
  return beats * ticksPerBeat(world.cfg) - beatPhaseTicks(world.cfg, world.tick);
}
