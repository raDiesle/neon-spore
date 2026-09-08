import type { SimConfig } from "./config.js";
import { reachMilliPerTick, reachOut } from "./reach.js";
import type { Command } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE CLAW's crank: the arm does not come home by itself any more, it is
 * **wound** home.
 *
 * The press sends the arm up its column and nothing recalls it (`reach.ts`).
 * What used to happen next was that it turned round and came back down at its
 * own speed with whatever it had closed on, which made the whole of the panel
 * one button: the pair spent a press and then watched. So the return is a
 * gesture now — a finger going round and round inside the crank on player 1's
 * half of the band — and the rope comes in for exactly as long as the hand
 * keeps turning.
 *
 * **The hand says where it is, not how far it has come.** Every other thing a
 * hand carries in this game reports a displacement from where it grabbed
 * (`Command`'s `drag`), because a wheel is turned by how far the hand has
 * travelled and a lost message has to heal itself. A crank cannot be written
 * that way: a finger going round the same circle for four turns is back where
 * it grabbed four times over, so the displacement is nought at exactly the
 * moments the most has been wound. What a hand on a crank has to say is its
 * **bearing** — which way round the circle it currently is, in thousandths of
 * a turn, clockwise from the top — and that is an absolute the way `cannonCol`
 * is: the next one supersedes the last, a message coalesced away costs
 * nothing, and the device that has the crank's centre under its own finger is
 * the only one that ever knew a pixel.
 *
 * **The turning is what winds, and the simulation is what turns it into
 * rope.** Two devices are handed the same bearings on the same ticks and both
 * work out the same step, so the arm is in one place on both screens. The
 * reference is the last bearing this hand reported: the first sample after a
 * hand goes on says only where it started, which is why a press carries
 * `NO_CRANK` instead of a bearing — a grab that pretended to be at the top of
 * the circle would wind up to half a turn of rope the finger never travelled.
 *
 * **It is a ratchet.** Only the winding way counts; turning back does nothing
 * at all, rather than paying the rope out again. A pawl is a real mechanism
 * and it is the forgiving one: a hand scrubbing back and forth still brings
 * the arm home, half as fast, and a thumb that slips round the wrong way
 * cannot undo what the pair has already wound.
 */

/** A full turn of the crank, in thousandths. Bearings are `0`..`TURN - 1`. */
export const TURN = 1000;

/**
 * No hand on the crank, and the value a press carries instead of a bearing.
 *
 * One value for the two states, because they are one state: a hand that has
 * just gone on has no reference yet, and neither has a crank nobody is
 * touching. Anything negative reads as this, so a caller has nothing to get
 * wrong (`crankHeard`).
 */
export const NO_CRANK = -1;

/**
 * The largest step this reads as *turning* rather than as a hand that jumped:
 * half a turn.
 *
 * Past it, the shorter way round is the other way and the sample is the
 * ratchet's reverse, which winds nothing. A real finger reports many times a
 * second and cannot cover half a circle between two of them; a synthetic one
 * — the desk keyboard, a rehearsal — is written to stay well inside it.
 */
const MAX_STEP = TURN / 2;

/**
 * How far the drum is turned, in thousandths of a turn, clockwise from where
 * it stands with the arm home.
 *
 * Derived from the rope that is still out rather than counted separately: the
 * crank and the arm are one mechanism, so a drum angle stored beside
 * `reachMilli` would be a second copy of the same fact and the two would drift
 * apart the first time anything else moved the arm. Negative, because the drum
 * stands turned *out* by whatever is hanging and comes back to nought as it is
 * wound in — which is what makes the knob on the panel turn the same way the
 * finger does (`render/src/crank-dial.ts`).
 */
export function crankTurnedMilli(world: World): number {
  const perTurn = Math.max(1, world.cfg.windTilesPerTurn);
  const out = Math.round((world.reachMilli * TURN) / (perTurn * MILLI));
  // Written this way round rather than as `-Math.round(...)`: an arm at home
  // is nought turns, and negating a nought gives `-0`, which is a different
  // number to everything that compares against it.
  return out === 0 ? 0 : -out;
}

/** Whether the crank has anything to wind: the arm is out and on its way
 * back. Asked by the panel, which lights it only then, and by the winding
 * itself — a crank turned with the arm home turns nothing. */
export function crankBites(world: World): boolean {
  return reachOut(world) && world.reachDir < 0;
}

/**
 * One message from the hand on the crank.
 *
 * Player 1's, and the seat is checked here rather than left to the panel for
 * `lidHeard`'s reason: a `drag` is one of the kinds no panel may refuse
 * (`content/src/control-sets-keys.ts`), so this is the only place that can say
 * whose gesture it is.
 */
export function crankHeard(world: World, player: 1 | 2, command: Command): void {
  if (player !== 1 || command.kind !== "drag" || command.target !== "crank") return;
  // The hand off the crank, or a hand that has just gone on: either way there
  // is no reference and the next bearing is only a starting point.
  if (!command.on || command.fromMilli < 0) {
    world.crankAtMilli = NO_CRANK;
    return;
  }
  const at = ((command.fromMilli % TURN) + TURN) % TURN;
  const was = world.crankAtMilli;
  world.crankAtMilli = at;
  if (was === NO_CRANK) return;
  const step = (at - was + TURN) % TURN;
  // The other way round the circle, which the pawl does not take.
  if (step === 0 || step > MAX_STEP) return;
  if (!crankBites(world)) return;
  // Thousandths of a turn times tiles per turn is thousandths of a tile, and
  // the whole of it is integers — two devices cannot round this apart.
  world.reachMilli = Math.max(0, world.reachMilli - step * world.cfg.windTilesPerTurn);
}

/**
 * How far a bearing advances in one tick for a hand that is **not a hand**:
 * the desk keyboard, and a rehearsal's ghost thumb.
 *
 * Neither can go round a circle, so the rig turns for them — at the speed the
 * arm used to come home under its own power, which is the honest stand-in: a
 * key held down is worth exactly the return this panel used to give away.
 * Read off the two numbers that already say it rather than a constant of its
 * own, so a change to either speed reaches the keyboard in the same edit
 * (`packages/sim/test/purity.test.ts` keeps a table against the second copy).
 */
export function windPerTickMilli(cfg: SimConfig): number {
  return Math.max(1, Math.round(reachMilliPerTick(cfg) / Math.max(1, cfg.windTilesPerTurn)));
}
