import { type SimConfig, ticksPerBeat } from "./config.js";
import type { Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE LANCE: marking, re-grounded on the raster — and, since the owner took
 * the lance's own button away, re-grounded a second time on the trigger.
 *
 * Marking (docs/spec/couplings.md 2) was written for free flight — player 1
 * held an aim beam on a creature until the mark locked and player 2 fired the
 * matching colour. There is no beam any more; there is a column. So the mark
 * is on the column, and the thing that locks is the cannon lobe itself.
 *
 * **There is no LANCE button, and that is the change.** The lobe used to be
 * filled by a fifth button on a panel of its own, which meant one wave in the
 * whole game shipped a control nothing else could use. Now it is filled by
 * **holding the colour**: player 2 keeps her thumb on red or on cyan, the fill
 * closes round that lobe, and at the top it goes on its own — a big shot in
 * the colour that was held. A tap is a shot, as it always was; the hold is the
 * only new thing a thumb can do, and every panel in the game that carries a
 * colour carries it.
 *
 * **The cost is the hold and nothing else.** Three beats of thumb is six
 * ordinary shots not fired, which is the whole price — the owner's own answer
 * on 7 September 2026. What it buys is the *column*, in that colour: every
 * body of it standing there, however many, where an ordinary shot has to be
 * fired at one at a time.
 *
 * **The beam is the weapon, and nothing travels.** It used to fire a slow bolt
 * that passed through three bodies on its way up; the owner watched the fill
 * and said the beam itself is the thing that kills. So at the top of the fill
 * the column burns on that tick — a rock or a wrong colour still stops it
 * where it stands — and the beam holds where it reached for `lanceBeamBeats`
 * before it goes. That is also the field's own rule kept rather than bent:
 * nothing the players control travels.
 *
 * **The cannon still has to stand still, and that is the coupling that
 * survived.** The mark is on a column, so a cannon that leaves the column it
 * was filling in has nothing left to have marked and the fill drops to
 * nothing and starts again. The thumb is player 2's and the column is player
 * 1's: neither of them can do this alone, which is the same sentence the
 * lance always said with the halves swapped.
 *
 * **Sliding never eats the shot.** The fill resets, the *hold* does not — a
 * lift after the cannon moved still fires the ordinary shot the thumb was
 * always owed. That is the one thing that would have made the hold unplayable:
 * player 1 slides constantly, and a trigger whose shots quietly vanished when
 * he did would be a broken trigger rather than a coupling.
 */

/**
 * A thumb on a colour, and how long it has been there.
 *
 * One object rather than three fields on the world, for `ShotCharge`'s reason:
 * it is one thing with parts, and every part of it is settled by a press or by
 * the departure. There is deliberately no column in it — a cannon that moves
 * resets the fill, so while this is filling the column *is* `cannonCol`, and a
 * second copy of it could only ever disagree.
 */
export interface Prime {
  /** Tick the fill started from. Reset, not cleared, when the cannon slides. */
  tick: number;
  /** Which lobe is held — the colour a full lance leaves in. */
  color: Color;
  /**
   * The lance has gone and the thumb is still down. It owes nothing more: no
   * second fill while the finger rests there, and no ordinary shot on the
   * lift. A thumb that wants another one lifts and presses again.
   */
  spent: boolean;
}

/**
 * Ticks of holding before the lobe is full. At least one, so a config that
 * asks for no wait at all still has a moment to be ready *at* rather than
 * dividing by zero on its way to a percentage.
 */
export function primeTicks(cfg: SimConfig): number {
  return Math.max(1, Math.round(cfg.lancePrimeBeats * ticksPerBeat(cfg)));
}

/**
 * The thumb goes down on a colour. A second press while one is already filling
 * changes nothing — the fill is timed from the first, or a stray repeat from
 * the host would silently restart a lobe that was nearly full.
 */
export function startPrime(world: World, color: Color): void {
  if (world.prime !== null) return;
  world.prime = { tick: world.tick, color, spent: false };
}

/**
 * The thumb lifts, or the run is left. Nothing else clears a hold — the cannon
 * moving and the maw opening *reset* it instead (`spillPrime`), because the
 * shot the lift owes is not theirs to take away.
 */
export function endPrime(world: World): void {
  world.prime = null;
}

/**
 * The fill drops to nothing and starts again, under a thumb that never moved:
 * the cannon slid out of the column it was marking, or the maw opened on the
 * same lobe. True when there was something in there to lose, which is what the
 * caller reports as a spill.
 */
export function spillPrime(world: World): boolean {
  const held = world.prime;
  if (held === null || held.spent) return false;
  const had = world.tick - held.tick > 0;
  held.tick = world.tick;
  return had;
}

/** Whether a lobe is filling at all — a thumb down that has not yet fired. */
export function priming(world: World): boolean {
  return world.prime !== null && !world.prime.spent;
}

/** The colour being held, or null for no thumb on a colour at all. */
export function primeColor(world: World): Color | null {
  return priming(world) ? (world.prime?.color ?? null) : null;
}

/**
 * How full the lobe is, in thousandths. 1000 is a lance about to go, 0 is a
 * thumb that is not down. render/ draws this and nothing re-derives it: the
 * ring on the button and the beam up the column are the same number twice.
 */
export function primeChargeMilli(world: World): number {
  const held = world.prime;
  if (held === null || held.spent) return 0;
  const have = world.tick - held.tick;
  return Math.max(0, Math.min(MILLI, Math.round((have * MILLI) / primeTicks(world.cfg))));
}

/** Whether the lobe is full — the tick the lance goes, and none after it. */
export function lanceReady(world: World): boolean {
  const held = world.prime;
  if (held === null || held.spent) return false;
  return world.tick - held.tick >= primeTicks(world.cfg);
}

/**
 * The lobe is spent. Called by the departure itself, so the thumb resting on
 * the button afterwards fills nothing and owes nothing (`Prime.spent`).
 */
export function spendPrime(world: World): void {
  if (world.prime !== null) world.prime.spent = true;
}

/**
 * The beam standing in a column after it has burnt it.
 *
 * World state rather than the renderer's, for the reason a bullet in flight
 * was: two devices that disagree about whether a column is on fire have
 * desynced. It carries no rule of its own — the burning is over on the tick it
 * starts (`burnColumn` in `bullets.ts`) — but it is the picture both players
 * read, and a picture kept on one frame rate would run at two speeds.
 */
export interface LanceBeam {
  col: number;
  color: Color;
  /** Ticks it still stands. Zero means this is its last one. */
  left: number;
  /**
   * How far up the column it reached, in thousandths of a tile from the top of
   * the field — the position of whatever stopped it, or 0 for a column it
   * burnt the whole way. Drawn, so the beam ends at the rock that blocked it
   * rather than pretending to have gone through.
   */
  topMilli: number;
}

/** Ticks the beam stands for. At least one, so it is always seen. */
export function beamTicks(cfg: SimConfig): number {
  return Math.max(1, Math.round(cfg.lanceBeamBeats * ticksPerBeat(cfg)));
}

/** Count this tick off the beam, and put it out when it is done. */
export function stepBeam(world: World): void {
  const beam = world.beam;
  if (beam === null) return;
  if (beam.left > 0) beam.left -= 1;
  else world.beam = null;
}
