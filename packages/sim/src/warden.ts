import type { WardenState } from "./boss-state.js";
import { type Creature, WARDEN_COLS } from "./types.js";
import { NO_TETHER, wardenCycleBeat, wardenPhase } from "./warden-cycle.js";
import { attach, cutTether, wardenTether } from "./warden-rope.js";
import type { World } from "./world.js";

/**
 * THE WARDEN's whole choreography: a gate held open by a rope somebody is
 * pulling.
 *
 * It splits no information — both screens show everything it does — because the
 * Bulb Queen already owns that coupling. What it splits is the pair's two hands.
 * A line comes down out of the rim; player 1 takes the handle and pulls it
 * aside, and the hatch in the middle of the ring — with the eyelids behind it —
 * opens **by degrees, in proportion to the tension**. Player 2 fires the rim's
 * colour into the open eye. A hit takes a plate, shuts eye and hatch together
 * and snaps the line back.
 *
 * One player cannot do it, and that is the point rather than a side effect: the
 * seat holding the rope cannot fire, and the seat firing cannot feel the pull —
 * they read it off how far the hatch has come open. The talking is not
 * decoration on the mechanic, it is the mechanic.
 *
 * Nothing here is random. The colour and the phase follow from the cycle count
 * and the plates, so the fight is the same fight on both devices without a
 * single draw from the rng.
 *
 * `docs/spec/bosses.md` 11.4 is the design; this is only the clock. **The hand
 * and the line are `warden-rope.ts`**, which was cut out of here along the seam
 * the boss actually has: a clock answers on the beat and a control answers on
 * the tick, and only one of the two grows every time a control does.
 */

/** One beat of the boss. Dispatched from `stepBoss`. */
export function stepWarden(world: World, b: WardenState): void {
  const body = world.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return; // The last plate came off; it is gone.
  // A line the world lost track of leaves its id behind, and clearing it here
  // rather than at the next attach matters because `resetClock` puts `nextId`
  // back to 1: a stale id is a live id again the moment a run starts over.
  if (b.tetherId !== NO_TETHER && wardenTether(world) === null) cutTether(world, b);
  if (wardenCycleBeat(world.cfg, world.waveBeat) === 0) attach(world, b, body);
  drift(b, body, wardenPhase(b.plates).drift);
}

/**
 * The pupil slides a column or two a beat, back and forth inside the rim, so
 * the column that matters changes while the body does not.
 *
 * It keeps sliding while the hatch is open, on purpose. A gate the pair can hold
 * open for as long as they like would otherwise ask nothing of player 2 at all;
 * with the eye still walking, the shot is a column the two of them have to name
 * to each other across a voice delay while one of them holds the rope.
 */
function drift(b: WardenState, body: Creature, step: number): void {
  const lo = body.col;
  const hi = body.col + WARDEN_COLS - 1;
  let col = b.pupilCol + b.pupilDir * step;
  if (col < lo || col > hi) {
    b.pupilDir = b.pupilDir === 1 ? -1 : 1;
    col = b.pupilCol + b.pupilDir * step;
  }
  b.pupilCol = Math.max(lo, Math.min(hi, col));
}
