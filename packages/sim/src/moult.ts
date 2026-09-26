import { markMoment } from "./balance.js";
import { hullRow, type SimConfig } from "./config.js";
import { damageSpan } from "./hull-damage.js";
import { guardArmed, shieldRow } from "./hull-guard.js";
import { cargoLost, mawOpen, takeCargo } from "./pod-intake.js";
import type { PodKind } from "./pod-types.js";
import { spanOf } from "./span.js";
import { type Creature, occupiesCol } from "./types.js";
import { wardTurns } from "./ward.js";
import type { World } from "./world.js";

/**
 * THE MOULT: one body that is a rock half the time and a cargo the other half,
 * and the first arrival where **which control answers it** is the thing that
 * expires.
 *
 * Every other body in this game asks one question and asks it for the whole
 * fall. A rock wants the dome; a slick wants a colour; a pod wants the mouth.
 * The pair's work is to find the answer and get there in time, and once they
 * have found it the answer keeps. This one turns over from a rock to a cargo
 * and back every `moultBeats`, all the way down, so the answer the pair agreed
 * on at the top of the field is wrong by the bottom of it about half the time.
 * **What it is on the beat it reaches the ship is the whole of what happens**,
 * and that beat is arithmetic both of them can do before it lands.
 *
 * **Nothing kills it.** In rock form a shot leaves a crater exactly as it does
 * on a meteor and takes nothing off; in cargo form a shot is simply spent.
 * There is no colour on it and so no ammunition that could have been right —
 * the balloon's argument, and it holds here for a second reason: the cannon's
 * job on this creature is to *stand somewhere*, and a pair that had learned to
 * shoot at one would be a pair spending the thing they are supposed to be
 * aiming.
 *
 * **The two ends are the two the game already has.** As a rock it is warded or
 * it breaks the hull, on the shield's own row, by `wardTurns` and `damageSpan`.
 * As a cargo it must go into the maw — the cannon in its column and the mouth
 * open — and one that does not is a hit **and the wave is lost**, which is the
 * shipped pod rule and not a new one (`pod-intake.ts`). It has no physics of
 * its own at all: it falls a tile a beat like the plain tier and the last
 * stretch steers at the cannon the way a freed pod's does, so the catch is the
 * same catch.
 *
 * **The turn is read off the shared beat and nothing is stored.** THE VEIL's
 * arrangement, and the reason is sharper here: the form is drawn on both
 * screens and the *next* form on the navigator's, so the body, the ghost
 * beside it and the count under it are three pictures of one number. Two
 * moults on a field therefore turn over together, which is the feature — the
 * pair reads one clock and calls one timing, and "pod in two beats, open" is a
 * sentence about the wave rather than about a body.
 *
 * **The clock is `waveBeat` and not `beat`**, which is the one place this
 * creature parts from the veil, and it is the difference between a composable
 * wave and a coin toss. A veil rolls its colour at spawn, so where in the run
 * its wave started changes nothing anybody authored; a moult is authored to
 * *land* as one thing or the other — the whole wave below is that sentence
 * three times — and a run clock would make the same entry a rock on one
 * playthrough and a cargo on the next for a reason the author never wrote
 * down. `waveBeat` is the clock a wave's own entries are written in, and it is
 * in the fingerprint already (`hash.ts`).
 *
 * **The seat that is told is the seat that cannot act.** Both screens carry
 * the form it is in now; only the navigator is shown the one that is coming,
 * and every control this creature answers to — the cannon's column, the
 * trigger, the mouth — is the pilot's. So the call is a timing and it has to
 * be said out loud, which is the whole creature (`docs/spec/roles.md`).
 */

/**
 * Whether every moult on the field is wearing its cargo this beat.
 *
 * A fixed cycle off `world.waveBeat`, the clock the wave's own entries are
 * written in and both players already have on the HUD and in the ear. It
 * starts as a rock — the half of it that arrives from above, and the half a
 * pair coming off any other wave already knows what to do with — and the cargo
 * is what the field turns into underneath them.
 */
export function moultIsPod(cfg: SimConfig, beat: number): boolean {
  const period = Math.max(1, cfg.moultBeats);
  // Floored division on a beat that is never negative, and the guard is here
  // rather than trusted: `%` on a negative number in this language answers a
  // negative, and a single beat of that would turn every moult on the field
  // over on the wrong side of the count.
  return Math.floor(Math.max(0, beat) / period) % 2 === 1;
}

/**
 * Beats until it turns over, counted from `beat`. Never zero: on the beat it
 * turns, the answer is the whole period again, because what is standing there
 * now has just arrived and has a full cycle to run. `veilBeatsToMorph`'s rule
 * word for word, and the number the navigator reads out.
 */
export function moultBeatsToTurn(cfg: SimConfig, beat: number): number {
  const period = Math.max(1, cfg.moultBeats);
  return period - (Math.max(0, beat) % period);
}

/**
 * What it turns into next — the one fact drawn on the navigator's screen and
 * not on the pilot's. A function rather than `!moultIsPod(...)` at each site:
 * the ghost beside the body, the word in the strip and the timing the pair
 * calls are three readings of it, and the day a moult has three forms the
 * negation would quietly become wrong in two of the three.
 */
export function moultNextIsPod(cfg: SimConfig, beat: number): boolean {
  return !moultIsPod(cfg, beat);
}

/**
 * What this one gives if it is swallowed. Authored per arrival like every
 * pod's cargo and never rolled (`SpawnEntry.cargo`), because a pair that
 * watches one turn over has to be able to tell what catching it is worth
 * before it decides whether to be under it.
 *
 * A ward when the wave says nothing, and that is the useful default rather
 * than an arbitrary one: a ward holds the dome armed without a trigger, which
 * is exactly what the pair needs for the *other* half of this same body on its
 * next turn. Catching one pays for warding the next.
 */
export function moultCargo(c: Creature): PodKind {
  return c.moultCargo ?? "ward";
}

/** The fields a moult arrives with. Nothing rolled — the cargo is the wave's. */
export function moultOnSpawn(cargo: PodKind | undefined): { moultCargo: PodKind } {
  return { moultCargo: cargo ?? "ward" };
}

/**
 * The sideways half of a moult's beat, taken **beside** the fall rather than
 * instead of it — THE VEER's arrangement, and the only other body that steps
 * and falls on one beat.
 *
 * Inside `podHomeTiles` of the mouth it takes one column a beat toward
 * whatever column the cannon is holding, which is a freed pod's last stretch
 * at a whole tile instead of thousandths. The pair's work stays "be in the
 * right column, be open at the right time" rather than becoming a tracking
 * problem laid on top of a timing one — and it is the same steer in both
 * forms, deliberately: the body does not know yet what it will be wearing when
 * it lands, so it cannot steer by it. What that buys the pilot is one column
 * to stand in for either answer, and what it costs is that standing there is
 * no longer optional.
 */
export function stepMoult(world: World, c: Creature): void {
  const mouth = hullRow(world.cfg);
  if (mouth - c.row > world.cfg.podHomeTiles) return;
  if (c.col === world.cannonCol) return;
  c.col += c.col < world.cannonCol ? 1 : -1;
}

/**
 * A shot met one. Nothing here ever returns the bullet to the column: a moult
 * stops a bolt in both of its forms, and the two things that happen to the
 * bolt are the only difference a shot can make to this creature.
 */
export function moultStruck(world: World, c: Creature): void {
  if (moultIsPod(world.cfg, world.waveBeat)) {
    // Spent on a cargo, which is a thing a shot has nothing to say to. Not a
    // colour miss — it carries no colour, so no ammunition could have been
    // right (`balloonStruck`'s argument) — and deliberately not a *free* shot
    // either: the bolt is gone, and on a wave where the cannon has to be under
    // the body at the bottom that is a trigger pressed instead of a column
    // held.
    world.events.push({ type: "reject", col: c.col, row: c.row });
    return;
  }
  // A rock cannot be broken because it does not live. The crater is the rule
  // made visible, and it is the same crater `resolve` leaves on a meteor —
  // which is the point of drawing it: a pair that shoots this half learns
  // nothing new, and learns it in the picture they already know.
  c.holes = Math.min(world.cfg.maxHoles, c.holes + 1);
  world.events.push({ type: "hole", col: c.col, row: c.row, kind: c.kind, span: spanOf(c) });
}

/**
 * A moult that has got as far as the ship's end of the field. Returns whether
 * it **stays on the field**, which is `resolveFence`'s contract and for the
 * same reason: this body has two answers and neither of them is the ordinary
 * one, so `resolveHull` hands it over whole rather than trying to thread it
 * through a branch written for rocks.
 *
 * Three gates, in this order, and the order is the rule:
 *
 * 1. **The dome answers a rock a row early**, where the dome actually is
 *    (`shieldRow`) — so a moult wearing its shell is turned at the surface and
 *    not from inside the plating. In cargo form that row says nothing at all:
 *    the mouth is on the ship.
 * 2. **Nothing is through on the beat it reaches the ship's row.** `fromRow`
 *    is the row the picture is still gliding it out of, so the trigger, the
 *    cannon and the mouth all still reach it for one more beat — the beat the
 *    pair watches it land.
 * 3. Then it is what it is, and it is answered as that.
 *
 * **Which form decides is the form on the beat it is finally resolved**, not
 * the one it wore on the beat it arrived. That is the creature rather than an
 * accident of the ordering: a body that turned over during its own grace beat
 * has to be answered as what the pair can see standing on the hull, and the
 * pair can see it.
 */
export function moultArrives(world: World, c: Creature): boolean {
  const shipRow = hullRow(world.cfg);
  const pod = moultIsPod(world.cfg, world.waveBeat);

  if (
    !pod &&
    c.row >= shieldRow(world.cfg) &&
    occupiesCol(c, world.shieldCol) &&
    guardArmed(world)
  ) {
    // Turned. `wardTurns` takes the guard record and the balance moment,
    // because they are the same for every body the dome answers.
    return wardTurns(world, c, shieldRow(world.cfg));
  }
  if (c.row < shipRow) return true;
  if (c.fromRow < shipRow) return true;

  if (pod) {
    if (world.cannonCol === c.col && mawOpen(world)) {
      takeCargo(world, c.col, moultCargo(c));
      return false;
    }
    // It broke on the skin. The pod rule exactly, the lost wave included —
    // and no `guard` try is recorded, because the dome was never the thing
    // that was supposed to be there and a pair learning from their own tally
    // must not be told they mistimed a shield they were right not to raise.
    cargoLost(world, c.col);
    return false;
  }

  world.guard.tries += 1;
  if (occupiesCol(c, world.shieldCol)) world.guard.mistimed += 1;
  markMoment(world, false);
  damageSpan(world, c, "heavy");
  return false;
}
