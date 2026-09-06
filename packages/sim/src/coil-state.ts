import type { SimConfig } from "./config.js";
import type { CrossDir } from "./cross.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **What a coil is right now**: which way it is going, whether it is still
 * wearing its dome, and how long ago the charge landed on it.
 *
 * Split off `coil.ts` when the escape wall and the standing ward took that
 * file past its 250-line limit, and along the seam the creature itself reads
 * on. Everything here is a *reading* — a question anybody may ask of a body on
 * the field and get the same answer back — and everything left next door
 * **changes** one: the crossing, the dome coming off, the charge going on to
 * the next dome and the wall the freed rock runs for.
 *
 * The split is one-way on purpose. `coil.ts` calls into here and nothing here
 * calls back, so the three fields a coil carries have exactly one file that
 * interprets them and exactly one file that writes them.
 *
 * Every one of these is a rule the rest of the simulation must **call** rather
 * than re-derive. `c.kind === "coil"` spelled out by hand is a second copy of
 * "is this one still shut", and `c.coilLit !== undefined` is a second copy of
 * "has the chain reached it" — both pass every type check, and both are how
 * two devices come to disagree about a body neither of them can see failing.
 */

/**
 * Which way across the field it is going. `-1` is to the left, which is where
 * every coil sets off — `CrossDir` under this creature's own name, the way
 * `CaromDir` is: the wall it turns at is `cross.ts`, which THE CAROM and THE
 * VOLLEY already cross the field by.
 */
export type CoilDir = CrossDir;

/**
 * Which way this one is going. Call it rather than reading `coilDir` by hand:
 * the step, the lean render draws and the wall it is heading for are three
 * readings of one number, and a second copy of the fallback is how they come
 * to disagree about which side of the field the pair should be looking at.
 *
 * The fallback is **left**, because that is the one thing every coil has in
 * common: it comes in at the right wall (`coilOnSpawn`).
 */
export function coilHeading(c: Creature): CoilDir {
  return c.coilDir ?? -1;
}

/** Whether this body is still wearing its dome. The kind *is* the state, for
 * `claspIsShielded`'s reason: a `shielded` flag beside it would be a second
 * truth about one body that the fingerprint could agree with while the two
 * devices disagreed. */
export function coilIsDomed(c: Creature): boolean {
  return c.kind === "coil";
}

/**
 * The fields a coil arrives with. It always sets off **to the left**, which is
 * the whole of what "comes in at the right wall" means once the wave has put
 * it in a column — deliberately not `crossAwayFromWall`, which THE CAROM and
 * THE VOLLEY use: those two are balls and the long first crossing is what buys
 * them their bounces, while this one is a body with a direction, and a coil
 * authored near the left wall that set off rightwards would be entering from
 * the wrong side of the field.
 */
export function coilOnSpawn(): { coilDir: CoilDir } {
  return { coilDir: -1 };
}

/**
 * The beat the charge landed on this one, or nothing at all for a coil no
 * chain has reached. Read it through here and never by hand: the bolt render
 * draws, the beat the dome comes open on and the warning the pair is acting on
 * are three readings of one number.
 *
 * **A moment and not a countdown**, for `Creature.veilStruckTick`'s reason and
 * a sharper version of it: a stored countdown would be ticked by the same beat
 * loop that pops the domes, so a coil chained by a body standing *later* in
 * `world.creatures` would lose a beat that one standing earlier kept — a
 * creature whose timing depended on array order, which is the definition of a
 * thing two devices can be made to disagree about.
 */
export function coilCharged(c: Creature): boolean {
  return c.coilLit !== undefined;
}

/** Beats since the charge was sent to this one; negative for a coil no chain
 * has reached, which is a value the count can never take. */
export function coilChargeAge(world: World, c: Creature): number {
  return c.coilLit === undefined ? -1 : world.beat - c.coilLit;
}

/** Whether the charge has arrived and this dome comes open on this beat. */
export function coilDue(cfg: SimConfig, world: World, c: Creature): boolean {
  return coilCharged(c) && coilChargeAge(world, c) >= cfg.coilJumpBeats;
}
