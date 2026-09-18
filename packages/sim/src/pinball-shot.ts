import type { SimConfig } from "./config.js";
import type { PinballState } from "./pinball.js";
import { pinCannonMilli, pinHeightMilli, pinLaunchVelocity } from "./pinball-board.js";
import type { PinBall } from "./pinball-contact.js";
import type { World } from "./world.js";

/**
 * One shot of PINBALL: where the ball waits, what firing it does, whether the
 * cannon would take it back, and putting the loop back to the start.
 *
 * Split out of `pinball.ts` on line count, along the seam that file already
 * had: next door is the **round** — its phases, its boards and everything it
 * remembers between ticks — and this is the three functions that are about a
 * single shot inside one. It is also the half that had to know where the ship
 * is, which is the other reason it is worth its own file: `pinball.ts` is now
 * state and nothing else, and every reach for `world.cannonCol` is here.
 *
 * Not in `pinball-round.ts`, which is where the clock lives, because
 * `pinball-controls.ts` needs `launchBall` and the round needs the controls —
 * a launch in the round would close that cycle over the one function both of
 * them want.
 */

/**
 * Whether a ball at this place across the table would be taken by a cannon in
 * this column.
 *
 * **One rule, and the two things that ask it ask it from opposite ends of a
 * flight.** The round asks it once, at the floor, to decide whether the hull
 * pays (`pinball-round.ts`); the field's cue asks it every tick of the flight,
 * to decide whether the pilot is owed the word `MOVE`
 * (`render/boss-cue-read-h.ts`). Written as a comparison in the round, the
 * second caller would have had to write it again — and a cue that went out
 * half a tile before the catch does would be the field lying about a catch the
 * simulation is about to allow. It is extracted rather than copied and then
 * caught, which is the only reason `test/copies-table.ts` has no row for it.
 *
 * It says nothing at all about where the ball is *going*: that is the round's
 * whole difficulty and the pair's to work out.
 */
export function pinCaught(cfg: SimConfig, xMilli: number, col: number): boolean {
  return Math.abs(xMilli - pinCannonMilli(cfg, col)) <= cfg.pinballCatchMilli;
}

/**
 * The shot back to the start of its own loop: needle at one end, bar empty,
 * nothing lit, no run of takes behind it. The cannon is deliberately left
 * where it stands — it is the one thing the pair has been steering and putting
 * it back would undo a decision they had already made out loud.
 */
export function resetShot(state: PinballState): void {
  state.shot = "aim";
  state.angleDir = 1;
  state.powerMilli = 0;
  state.powerDir = 1;
  state.lit = [];
  state.hitRun = 0;
}

/**
 * Where the ball sits waiting, which is the cannon's own muzzle.
 *
 * **The round has no position of its own any more.** The catcher is the ship's
 * cannon, so where it stands is `world.cannonCol` — the same field the strip
 * writes on every ordinary wave and the same one the hull is drawn from. A
 * second copy of it on the round would be two answers to where the ship is.
 *
 * The state is still asked for, and not because it is read: every caller has
 * one, and a signature that dropped it would have to be found again the first
 * time a shot starts anywhere but the middle of the cannon.
 */
export function pinRestingBall(world: World, _state: PinballState): PinBall {
  return {
    xMilli: pinCannonMilli(world.cfg, world.cannonCol),
    yMilli: pinHeightMilli(world.cfg) - world.cfg.pinballCatchMilli,
    vxMilli: 0,
    vyMilli: 0,
  };
}

/** Fire what the two seats have agreed on. */
export function launchBall(world: World, state: PinballState): void {
  const v = pinLaunchVelocity(world.cfg, state.angleMilli, state.powerMilli);
  state.ball = pinRestingBall(world, state);
  state.ball.vxMilli = v.vxMilli;
  state.ball.vyMilli = v.vyMilli;
  state.shot = "flight";
  state.flightBeat = world.beat;
}
