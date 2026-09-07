import { hullRow, type SimConfig } from "./config.js";
import type { CrossDir } from "./cross.js";
import { removeCreature } from "./field.js";
import { METEOR_TIER_KINDS } from "./kinds.js";
import { spanOf } from "./span.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * **A rock authored to cross the field instead of falling down a column**, and
 * the first thing in this game that is a *path* rather than a creature.
 *
 * Every other body that crosses is its own kind — THE CAROM's diagonal, THE
 * COIL's flight, THE GHOST's prowl — because in each of those the crossing is
 * only half of what makes the thing: a carom has a crust the cannon opens, a
 * coil a dome that chains, a ghost a column one seat cannot see. A plain rock
 * has none of that, so this is a field on the arrival and not a kind in the
 * bestiary (`WaveEntry.cross`) — the arrangement `RockSize` argues for said
 * about a route. Five tiers crossed with three routes would be fifteen entries
 * in `CREATURES` to express one new fact.
 *
 * ## It comes in from a wall and it goes out of the other one
 *
 * A crossing rock **is never dropped in from the top**. It enters at the wall
 * it is walking away from, on the row the wave named, on the beat the wave
 * named, so the first thing either player sees of it is a body already
 * travelling in the row it will hold. It walks that row `rockCrossCols` a beat
 * and **leaves the field at the far side**, and it is gone the moment it is
 * off: it never turns, never sinks and never comes round again.
 *
 * That is the owner's own correction, and it is what the creature *is*. It was
 * built to turn at each wall and sink two rows at every turn — THE COIL's rule
 * — which made it a body that worked its way down the field in flights and
 * eventually reached the ship. He asked for the other thing plainly: a rock
 * that comes over one side and disappears out of the other, rather than one
 * that drops a tile and goes on being on the screen.
 *
 * **So it is a window rather than an arrival**, which is `PodEntry.cross`'s
 * shape said about a hazard instead of a gift: the pair has exactly as long as
 * the crossing takes, and what expires is an opportunity rather than the hull.
 *
 * ## What it costs, since it never reaches the ship
 *
 * A rock stops a bolt (`resolve`'s rock branch) and nothing turns a rock away
 * but the shield at the hull. One that crosses in front of the pair therefore
 * never hurts them and cannot be answered — what it does is **close a column
 * at a time to the cannon**, sweeping, for as long as it takes to pass. So its
 * price is paid by whatever else the wave is sending: a body that had to be
 * shot in the beats the rock was standing in its lane is a body that reaches
 * the hull. The wave is the composition; this is one moving wall in it.
 *
 * **The authored column is not where it appears.** Which side it comes over
 * follows from the heading and nothing else (`rockEntryCol`), so the cell the
 * author painted it in fixes the *beat* and gives the arrival a place on the
 * director's map; the row and the side are the two things the panel asks for.
 *
 * **`crossField` is deliberately not called here**, and it is the one place in
 * this file that looks like a re-derived rule and is not. That function is the
 * turn — it truncates a stride at the wall and reverses — and this body has no
 * turn in it. Calling it and then undoing the reversal would be a longer way of
 * writing `col += dir * stride` with a bug waiting in it.
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

/** Which way it is going. Never read `rockDir` directly — the step, the wall
 * it entered at and the side it will leave by are readings of one number. */
export function rockHeading(c: Creature): RockCross {
  return c.rockDir ?? 1;
}

/** The row it walks along, for the whole of its life. Absent means the top
 * row, which is what absent means downstream. */
export function rockCrossRow(c: Creature): number {
  return c.rockRow ?? 0;
}

/**
 * The row a crossing rock is *given*, clamped to a row it can actually cross.
 * Never the hull row: a body standing there is one `resolveHull` answers at
 * the end of the beat, so a rock authored onto it would be an arrival wearing
 * a crossing's clothes.
 */
export function rockCrossRowFor(cfg: SimConfig, row: number | undefined): number {
  return Math.max(0, Math.min(hullRow(cfg) - 1, row ?? 0));
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
  row: number,
): { rockDir: RockCross; rockRow: number } {
  return { rockDir: cross, rockRow: row };
}

/**
 * The column a crossing rock enters at: the wall it is walking **away from**,
 * so the whole field is ahead of it.
 *
 * `span` rather than one, for the exit test's reason said at the other end: a
 * two-column body has to stand where its whole width fits, and the wall it
 * touches and the wall the shield has to cover are one number.
 */
export function rockEntryCol(cols: number, span: number, dir: RockCross): number {
  return dir > 0 ? 0 : Math.max(0, cols - span);
}

/**
 * One beat of a crossing rock, in place of the fall every other rock takes.
 *
 * The body is allowed to step **past** the wall before it is taken off, so the
 * last thing drawn of it is the body sliding out of the field rather than
 * blinking out on the edge column. `advancePods` does exactly this for a pod
 * that crosses, and for the same reason.
 */
export function stepRockAcross(world: World, c: Creature): void {
  const cfg = world.cfg;
  c.col += rockHeading(c) * cfg.rockCrossCols;
  const span = spanOf(c);
  if (c.col > cfg.cols || c.col + span < 0) removeCreature(world, c.id);
}
