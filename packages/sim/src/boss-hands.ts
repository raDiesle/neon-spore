import { antiphonHeard, stepAntiphonTurn } from "./antiphon-hand.js";
import { diastoleHeard } from "./diastole-hand.js";
import { filamentHeard } from "./filament-hand.js";
import { instarHeard } from "./instar-hand.js";
import { queenHeard } from "./queen-hand.js";
import { stareLidHeard } from "./stare-hand.js";
import { surgeHeard } from "./surge-hand.js";
import type { TimedCommand } from "./types.js";
import type { World } from "./world.js";

/**
 * **The choreographed bosses' hands, read on the tick** — the second page
 * of what `step.ts` does with a command before the clock moves.
 *
 * Cut out of `step.ts` when THE DIASTOLE's clamp would have put it over its
 * 250-line limit, at the seam that file's own comments had drawn seven times
 * running: each of these is one boss's thumb, heard off the wire on the
 * tick for a reason of its own that is written beside it, and none of them
 * is the field's. The field's hands — the maze string, the rope, the cord,
 * the grip, the crank, the ring, the arrows, the balloons, the sinew — stay
 * where they were, in the order they run; these run after them and before
 * THE WEIGHT's clock, exactly where the block was.
 *
 * The order between them does not matter — one boss is installed at a time —
 * and it is kept as the bosses were built.
 */
export function bossHandsHeard(world: World, commands: readonly TimedCommand[]): void {
  // THE STARE's lid, on the tick because the instant it shuts is the instant
  // the watched seat is free, and *go* is said on a tick (`stare-hand.ts`).
  for (const c of commands) stareLidHeard(world, c.player, c.command);
  // THE SURGE's one handle, on the tick because the fight is two lifts
  // inside one beat of each other, and the tick is what a lift is timed by
  // (`surge-hand.ts`).
  for (const c of commands) surgeHeard(world, c.player, c.command);
  // THE ANTIPHON's thumb on the organ, on the tick because what it does is
  // turn a shape a finger is watching (`antiphon-hand.ts`).
  for (const c of commands) antiphonHeard(world, c.player, c.command);
  stepAntiphonTurn(world);
  // THE INSTAR's marks, on the tick because a tap is a tap when it lands and
  // a pull is where the thumb is now (`instar-hand.ts`).
  for (const c of commands) instarHeard(world, c.player, c.command);
  // THE FILAMENT's two thumbs, on the tick: a tile is lit when the thumb
  // reaches it, and the beat only says whether that was too soon (`filament-hand.ts`).
  for (const c of commands) filamentHeard(world, c.player, c.command);
  // THE BULB QUEEN's marks under player 1's thumb, on the tick because a pry
  // is a press when it lands and a hold is where the thumb is now (`queen-hand.ts`).
  for (const c of commands) queenHeard(world, c.player, c.command);
  // THE DIASTOLE's clamp, on the tick because *now* is said on a tick, and a
  // clamp that waited for the beat would catch the beat after the one that
  // was said (`diastole-hand.ts`).
  for (const c of commands) diastoleHeard(world, c.player, c.command);
}
