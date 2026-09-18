import type { SimConfig } from "./config.js";
import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import type { ScoutPoint, ScoutState } from "./scout.js";
import { scoutCleared, scoutCurrent, scoutHome, scoutMawOpen, scoutStand } from "./scout.js";
import { stepScoutFlight, stepScoutHazards } from "./scout-fly.js";
import type { World } from "./world.js";

/**
 * What the scout is touching, and the two ways an arena ends badly.
 *
 * **A distance is asked squared.** There is no deterministic square root in
 * this package (`scout-fly.ts` says why), and none is needed: whether two
 * circles overlap is whether the square of the gap is under the square of
 * their radii added up, which is three multiplications and no rounding at all.
 *
 * **A touch and the clock running out do the same thing**, and that is
 * deliberate: one failure, one word, one picture. The scout stops where it
 * was, the hull is broken, and a hit is the wave lost (`wave-fail.ts`) — the
 * picture holds so the catch is seen, then the whole wave is played again.
 * SNAKE settled this shape and its own doc argues it: a round with a second
 * try of its own could never be reached once a hit stopped the field.
 */

/** Whether two round things overlap, both radii in thousandths of a tile. */
function touching(a: ScoutPoint, aRadius: number, b: ScoutPoint, bRadius: number): boolean {
  const dCol = a.colMilli - b.colMilli;
  const dRow = a.rowMilli - b.rowMilli;
  const reach = aRadius + bRadius;
  return dCol * dCol + dRow * dRow <= reach * reach;
}

/**
 * Whether the little ship is standing on the mother ship's mouth.
 *
 * **One rule, and the two things that ask it want opposite answers from it.**
 * The round asks it at the bank, to decide whether what is aboard comes off
 * (`bankAtHome`); the field's cue asks it every tick, to decide whether the
 * navigator is owed the word `OPEN` (`render/boss-cue-read-h.ts`). Written as
 * a `touching` call in one of them, the other would have had to write it again
 * out of two radii and a squared distance — and a word that arrived half a
 * tile before the bank would be the field promising a press the simulation is
 * about to refuse.
 *
 * It says nothing about what is aboard, and nothing about the arena: a mote,
 * a hazard and a route are the navigator's screen and the pair's sentence.
 */
export function scoutAtHome(cfg: SimConfig, scout: ScoutState): boolean {
  const home = scoutHome(cfg.cols, cfg.rows);
  return touching(scout, cfg.scoutRadiusMilli, home, cfg.scoutHomeRadiusMilli);
}

/**
 * The index of a mote the scout is on top of and is not already holding, or -1.
 *
 * One a tick is enough: two motes close enough to be inside the ship at once
 * would be one mote as far as a pair talking about the arena is concerned, and
 * the next tick takes the second anyway.
 */
export function scoutMoteAt(cfg: SimConfig, scout: ScoutState): number {
  const motes = scoutCurrent(scout).motes;
  for (let i = 0; i < motes.length; i++) {
    if (scout.carrying.includes(i) || scout.banked.includes(i)) continue;
    const mote = motes[i];
    if (mote && touching(scout, cfg.scoutRadiusMilli, mote, cfg.scoutMoteRadiusMilli)) return i;
  }
  return -1;
}

/** The index of a hazard that has the scout, or -1. */
export function scoutHazardAt(cfg: SimConfig, scout: ScoutState): number {
  for (let i = 0; i < scout.hazards.length; i++) {
    const hazard = scout.hazards[i];
    if (hazard && touching(scout, cfg.scoutRadiusMilli, hazard, cfg.scoutHazardRadiusMilli)) {
      return i;
    }
  }
  return -1;
}

/**
 * One tick of the play phase, and whether the whole round is over: `true`
 * every authored arena was cleared, `false` it was lost, `null` still flying.
 *
 * The shape `stepSnake` and `stepGauge` both have, for the reason those two
 * give: the phases belong to the file that owns the clock, and this one owns
 * the arithmetic.
 */
export function stepScoutArena(world: World, scout: ScoutState): boolean | null {
  const cfg = world.cfg;
  // Cleared first, so the last mote taken on the last tick of an arena wins it
  // rather than losing it to the clock by a tick.
  if (scoutCleared(scout)) return openNextArena(world, scout);
  if (world.beat - scout.arenaBeat >= scoutCurrent(scout).beats) return ranOut(world, scout);

  stepScoutFlight(cfg, scout);
  stepScoutHazards(cfg, scout);

  const caught = scoutHazardAt(cfg, scout);
  if (caught >= 0) return caughtBy(world, scout, caught);

  const mote = scoutMoteAt(cfg, scout);
  if (mote >= 0) scout.carrying.push(mote);
  bankAtHome(world, scout);
  // Banking the last mote does not end the tick: the arena is asked at the top
  // of the next one, so the picture gets a tick with the scout sitting on the
  // mother ship and nothing left to fetch.
  return null;
}

/**
 * Home, with the mouth open: everything aboard comes off.
 *
 * Two hands, exactly as THE CLAW's catch is two hands — the pilot has to bring
 * the ship back and the other seat has to have opened for it. A ship that
 * arrives with the mouth shut is not punished: it is simply still carrying,
 * and the pair go round again, which is the one place in this round where a
 * mistake costs time rather than the hull.
 */
function bankAtHome(world: World, scout: ScoutState): void {
  if (scout.carrying.length === 0) return;
  const cfg = world.cfg;
  if (!scoutMawOpen(scout, world.tick, cfg.scoutMawTicks)) return;
  if (!scoutAtHome(cfg, scout)) return;
  for (const at of scout.carrying) scout.banked.push(at);
  scout.carrying = [];
}

/**
 * The arena is cleared. The next one, or the round won.
 *
 * Standing the scout up again goes through `scoutStand`, which is the same
 * call `boss-round.ts` makes to reach an arena a headless run could never win
 * to — so the second arena is the same arena either way it was arrived at.
 */
function openNextArena(world: World, scout: ScoutState): boolean | null {
  if (scout.arena + 1 >= scout.arenas.length) return true;
  scoutStand(scout, scout.arena + 1, world.beat);
  return null;
}

/**
 * Caught. The hull pays and the wave is lost.
 *
 * The tick is remembered rather than the beat because the scout moves on the
 * tick (`ScoutState.caughtTick`), and the hazard's index with it: the picture
 * flashes the one that did it, and the seat that is about to be told what went
 * wrong is told the same thing the picture says.
 */
function caughtBy(world: World, scout: ScoutState, index: number): boolean {
  scout.caughtTick = world.tick;
  scout.caughtBy = index;
  scout.vColMilli = 0;
  scout.vRowMilli = 0;
  scout.burning = false;
  scout.turn = 0;
  // SNAKE's own crash, argument and arguments alike: the middle column because
  // there is no column in this round to blame, a rock's kind because that is
  // what a scar off the field has always been drawn as, and `heavy` because
  // the thing that caught it was moving.
  breachHull(world, midCol(world.cfg), "meteorFastest", 0, "heavy");
  return false;
}

/**
 * The clock ran out with motes still hanging. The same cost as a touch, for
 * the reason at the top of this file: one failure, one word, one picture.
 *
 * `light` rather than `heavy` is the one difference, and SNAKE draws the same
 * distinction: nothing hit the ship, the pair simply did not finish.
 */
function ranOut(world: World, scout: ScoutState): boolean {
  scout.vColMilli = 0;
  scout.vRowMilli = 0;
  scout.burning = false;
  scout.turn = 0;
  breachHull(world, midCol(world.cfg), "meteorFastest", 0, "light");
  return false;
}
