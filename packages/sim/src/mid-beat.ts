import { ticksPerBeat } from "./config.js";
import type { Bullet, Creature } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **Where a thing stands between two beats**, in thousandths of a tile.
 *
 * Cut out of `bullets.ts` when THE LOCK arrived: these three were private to
 * the hit test for as long as the hit test was the only thing that had to know
 * where a body actually is, and a shot that steers towards one is the second.
 * The seam is the honest one — next door is what a shot *does*, and this is
 * where everything it does that to is standing on this tick.
 *
 * All of it is integer arithmetic off `world.tick`, so two devices round the
 * same way.
 */

/**
 * Where a bullet stands, in thousandths of a tile counted downwards from row 0.
 * Exactly what render/ draws — `row - subMilli / 1000`.
 */
export function bulletMilli(b: Bullet): number {
  return b.row * MILLI - b.subMilli;
}

/**
 * Where a creature stands, in the same units. A creature glides one tile per
 * beat, so between two beats it is genuinely between two rows, and that is the
 * position the eye judges a hit by — `fromRow + (row - fromRow) * beatPhase`,
 * the line render/ draws it on (packages/render/src/creatures.ts).
 *
 * Collision used to compare whole rows instead, and two shots in a hundred
 * went straight through: a creature that dropped a row in the same tick the
 * bullet left it swapped places with the shot without either ever noticing.
 */
export function creatureMilli(world: World, c: Creature): number {
  const tpb = ticksPerBeat(world.cfg);
  const phase = world.tick % tpb;
  return c.fromRow * MILLI + Math.round(((c.row - c.fromRow) * phase * MILLI) / tpb);
}

/**
 * The **lane** a creature is in, on this tick, rounded to the nearest column.
 *
 * `creatureMilli` above makes this correction to the row and states the
 * reason: a body glides between two beats, and that glide is the position the
 * eye judges a hit by. Sideways it was never made, because for a long time
 * nothing changed lanes — and then the dart did, two columns at a time, and
 * THE CAROM did, three. For most of every beat those bodies are drawn between
 * two lanes (`drawnCol`) while the simulation has already written down the one
 * they are going to, so a shot fired at what is on the screen went through
 * empty column and a shot that connected did so a beat before it looked like
 * it should.
 *
 * Rounded rather than covering both lanes: a bolt goes up the middle of a
 * column, and a body part-way across is in whichever lane it is nearest. The
 * generous version would make a body crossing three lanes a beat hittable in
 * all of them, which is not a hitbox, it is an apology.
 *
 * **A locked shot steers at this number and at no other**, which is the second
 * reason it is worth having a name (`lock.ts`). A mark on the field promises a
 * hit, so what the shot aims at has to be the lane the hit test is going to
 * ask about — not a smoother reading of the same body, which would land beside
 * it one tick in a thousand and break the promise for no gain anybody can see.
 */
export function creatureLane(world: World, c: Creature): number {
  const from = c.fromCol ?? c.col;
  if (from === c.col) return c.col;
  const tpb = ticksPerBeat(world.cfg);
  const phase = world.tick % tpb;
  return from + Math.round(((c.col - from) * phase) / tpb);
}
