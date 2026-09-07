import { hullRow } from "./config.js";
import { type CrossDir, crossField } from "./cross.js";
import { METEOR_TIER_KINDS } from "./kinds.js";
import { spanOf } from "./span.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * **A rock authored to cross the field instead of holding its lane**, and the
 * first thing in this game that is a *path* rather than a creature.
 *
 * Every other body that crosses is its own kind — THE CAROM's diagonal, THE
 * COIL's flight, THE GHOST's prowl — because in each of those the crossing is
 * only half of what makes the thing: a carom has a crust the cannon opens, a
 * coil a dome that chains, a ghost a column one seat cannot see. A plain rock
 * has none of that. It is the one arrival in the game whose whole content is
 * *where it will be*, and that is exactly the fact a crossing changes.
 *
 * So this is a field on the arrival and not a kind in the bestiary
 * (`WaveEntry.cross`), the arrangement `RockSize` argues for said about a
 * route: the pair does the identical thing about a crossing rock and a falling
 * one — one of them says a column and the other stands in it with the shield —
 * and what changes is how long that number stays true. Five tiers crossed with
 * three routes would be fifteen entries in `CREATURES` to express one new fact.
 *
 * ## It comes in from the side
 *
 * A crossing rock **is never dropped in from the top**. It enters at the wall
 * it is walking away from, on the row the wave named, on the beat the wave
 * named — so the first thing either player sees of it is a body already
 * travelling, at the edge of the field, in the row it will hold. The owner
 * asked for exactly that, and it is what makes the route read as a route: a
 * body that fell in first would spend its opening beats doing what every other
 * rock does, and the turn sideways would be a trick played on the pair rather
 * than a shape they were shown.
 *
 * It **walks that row**, `rockCrossCols` a beat, turning at each wall it
 * reaches. `crossField` is the whole of the sideways move, so the truncated
 * stride and the turn landing *on* the wall are the rule two other creatures
 * already play by rather than a third copy of it.
 *
 * And at each turn it **sinks** `rockCrossDropRows`, which is THE COIL's rule
 * and the reason this body reaches the ship at all: a rock that only crossed
 * would never arrive, and a wave holds open until its field is empty. So the
 * wall is the only place it drops, the pair gets a whole flight to agree on a
 * column, and the arithmetic that ends the wave is the one every other
 * arrival's is.
 *
 * **The authored column is not where it appears.** Which side it comes over
 * follows from the heading and nothing else (`rockEntryCol`), so the cell the
 * author painted it in fixes the *beat* and gives the arrival a place on the
 * director's map; the row and the side are the two things the panel asks for.
 *
 * **A hand is not refused.** The kind is still a rock, so `isGrippable` says
 * yes exactly as it did — but there is no fall here for a brake to scale, and
 * the drop at a wall is `cfg`'s number plain. That is the same bargain THE
 * CAROM's crust strikes from the other side: a hand is worth nothing against
 * a body that travels rather than falls.
 */

/** Which way along its row a crossing rock is going. `1` is to the right. */
export type RockCross = CrossDir;

/**
 * Whether a rock of this kind may be authored onto a crossing at all: the five
 * tiers and the torch.
 *
 * THE VEER is a rock and is deliberately out. Its kind is what makes it step
 * sideways as it falls (`veer.ts`), so a body that both veered and crossed
 * would be moving by two rules at once — which is the whole of what
 * `own-step.ts` exists to prevent.
 *
 * Called by the director rather than re-derived there, so the panel cannot
 * offer a route the field then quietly refuses (`entry-fields-rock.ts`).
 */
export function rockMayCross(kind: CreatureKind): boolean {
  return (METEOR_TIER_KINDS as readonly CreatureKind[]).includes(kind) || kind === "torch";
}

/**
 * Whether this body crosses rather than falls. Call it rather than testing
 * `rockDir` by hand: the presence of that field *is* the path, and a second
 * spelling of that is how a body comes to be stepped twice in one beat.
 */
export function rockCrosses(c: Creature): boolean {
  return c.rockDir !== undefined;
}

/** Which way it is going. Never read `rockDir` directly — the step and the
 * wall it is heading for are two readings of one number. */
export function rockHeading(c: Creature): RockCross {
  return c.rockDir ?? 1;
}

/** The row it walks along, which is also the row it stops falling at. Absent
 * means the top of the field, so a rock told to cross and given no row crosses
 * from the moment it arrives. */
export function rockCrossRow(c: Creature): number {
  return c.rockRow ?? 0;
}

/**
 * The fields a crossing rock arrives with, or nothing at all for one that
 * falls.
 *
 * Both are authored and neither is derived: which way it sets off is the whole
 * of what the wave is saying, and a heading read off the column — which is
 * what THE CAROM and THE GHOST do — would make a rock placed in the third
 * column and a rock placed in the fifth two different arrivals for a reason
 * the author never wrote down.
 */
export function rockCrossOnSpawn(
  cross: RockCross,
  row: number | undefined,
): { rockDir: RockCross; rockRow: number } {
  return { rockDir: cross, rockRow: Math.max(0, row ?? 0) };
}

/**
 * The column a crossing rock enters at: the wall it is walking **away from**,
 * so the whole field is ahead of it.
 *
 * `span` rather than one, for `crossField`'s reason said about an entry: a
 * two-column body has to stand where its whole width fits, and the wall it
 * touches and the wall the shield has to cover are one number.
 */
export function rockEntryCol(cols: number, span: number, dir: RockCross): number {
  return dir > 0 ? 0 : Math.max(0, cols - span);
}

/**
 * One beat of a crossing rock, in place of the fall every other rock takes.
 * One phase, because there is nothing to come in from: the body entered at the
 * wall already standing in the row it walks.
 */
export function stepRockAcross(world: World, c: Creature): void {
  const cfg = world.cfg;
  const step = crossField(cfg.cols, c.col, spanOf(c), rockHeading(c), cfg.rockCrossCols);
  c.col = step.col;
  c.rockDir = step.dir;
  // The wall is the only place it sinks. A body that dropped every beat would
  // be a carom without a crust, and the pair would never have the beats they
  // need to agree on a column and then stand in it.
  if (step.turned) c.row = Math.min(c.row + cfg.rockCrossDropRows, hullRow(cfg));
}
