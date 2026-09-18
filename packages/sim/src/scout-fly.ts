import type { SimConfig } from "./config.js";
import { ticksPerBeat } from "./config.js";
import { MAZE_TURN, mazeCosMilli, mazeSinMilli, mazeWrap } from "./maze.js";
import type { ScoutState } from "./scout.js";
import { scoutPrimed, stepScoutReel } from "./scout-hand.js";

/**
 * One tick of the flight, and the four things that decide how it feels.
 *
 * The scout moves on the **tick** and not on the beat, which is the whole
 * reason this file exists: a ship that moved once a beat would be a chess
 * piece, and the owner asked for movement that is fluent. The tick is still
 * the deterministic counter — no wall clock reaches in here, so two devices
 * fly exactly the same ship or neither does.
 *
 * **Turn, burn, drag, carry**, in that order, and the order is the feel:
 *
 * - The nose turns first, so a burn pressed in the same tick as the crank
 *   moved goes where the pair just pointed rather than where it pointed
 *   before. A round about one person aiming for another person is a round
 *   where the aim is never a tick behind the word.
 * - The burn adds to the travel; it does not replace it. That is the
 *   difference between a ship and a cursor, and it is why the arena is flown
 *   in arcs.
 * - The drag takes a share of the whole travel, which is what brings it to
 *   rest without anybody pressing anything — `scoutDragMilli` says what that
 *   costs in feel.
 * - Only then does it move, by a beat's travel divided by the beat's ticks,
 *   so the tempo of the wave changes how often it steps and never how far it
 *   gets in a beat.
 *
 * **No trigonometry runs here.** `mazeSinMilli` is a table with a bisection
 * over it, and `packages/sim/test/purity.test.ts` refuses `Math.sin` in this
 * package for the reason that test states: two engines may round it
 * differently in the last bit, and this rounds it into a stored integer.
 */

/** The heading's travel, in thousandths: 0 is straight up the arena. */
export function scoutNose(headingMilli: number): { colMilli: number; rowMilli: number } {
  // Up is a falling row number, so the row takes the negative cosine: at 0 the
  // nose is (0, -1000), at a quarter turn it is (1000, 0).
  return { colMilli: mazeSinMilli(headingMilli), rowMilli: -mazeCosMilli(headingMilli) };
}

/**
 * The speed, squared, in thousandths squared. Squared because a magnitude
 * wants a square root and this package has no deterministic one — every
 * question asked of a distance here is asked of its square instead.
 */
function speedSq(scout: ScoutState): number {
  return scout.vColMilli * scout.vColMilli + scout.vRowMilli * scout.vRowMilli;
}

/**
 * One tick of flight. The scout's own step, with the walls that hold it in.
 *
 * The walls are not a hazard and never fail anything: the ship is pushed back
 * at `scoutBounceMilli` of the speed it arrived with, which loses about half
 * of it. A pair that flew into the edge has lost the time, which is the whole
 * of the punishment — the owner's rule is that the *enemies* cost the hull.
 */
export function stepScoutFlight(cfg: SimConfig, scout: ScoutState, tick: number): void {
  // The line first, and it replaces the flight rather than adding to it: a
  // ship being reeled home is not one player 1 is flying, so his turn and his
  // burn do nothing until her thumb comes off (`scout-hand.ts`).
  if (stepScoutReel(cfg, scout, tick)) {
    const tpbReel = ticksPerBeat(cfg);
    scout.colMilli += Math.round(scout.vColMilli / tpbReel);
    scout.rowMilli += Math.round(scout.vRowMilli / tpbReel);
    bounce(cfg, scout);
    return;
  }

  if (scout.turn !== 0) {
    scout.headingMilli = mazeWrap(scout.headingMilli + scout.turn * cfg.scoutTurnMilliDeg);
  }

  if (scout.burning && scoutPrimed(cfg, scout, tick)) {
    const nose = scoutNose(scout.headingMilli);
    scout.vColMilli += Math.round((nose.colMilli * cfg.scoutBurnMilli) / 1000);
    scout.vRowMilli += Math.round((nose.rowMilli * cfg.scoutBurnMilli) / 1000);
  }

  scout.vColMilli = Math.round((scout.vColMilli * cfg.scoutDragMilli) / 1000);
  scout.vRowMilli = Math.round((scout.vRowMilli * cfg.scoutDragMilli) / 1000);

  // The cap is a second helping of drag rather than a hard clamp, so a ship
  // held at full burn settles onto its top speed instead of hitting a ceiling
  // one tick and falling off it the next. A clamp would also have to scale two
  // numbers by a ratio, which is the square root this package does not have.
  const max = cfg.scoutMaxSpeedMilli;
  if (speedSq(scout) > max * max) {
    scout.vColMilli = Math.round((scout.vColMilli * 900) / 1000);
    scout.vRowMilli = Math.round((scout.vRowMilli * 900) / 1000);
  }

  const tpb = ticksPerBeat(cfg);
  scout.colMilli += Math.round(scout.vColMilli / tpb);
  scout.rowMilli += Math.round(scout.vRowMilli / tpb);
  bounce(cfg, scout);
}

/** The arena's edges, in thousandths of a tile, inset by the scout's own size. */
function walls(cfg: SimConfig): { lo: number; hiCol: number; hiRow: number } {
  return {
    lo: cfg.scoutRadiusMilli,
    hiCol: cfg.cols * 1000 - cfg.scoutRadiusMilli,
    hiRow: cfg.rows * 1000 - cfg.scoutRadiusMilli,
  };
}

function bounce(cfg: SimConfig, scout: ScoutState): void {
  const { lo, hiCol, hiRow } = walls(cfg);
  const back = cfg.scoutBounceMilli;
  if (scout.colMilli < lo) {
    scout.colMilli = lo;
    scout.vColMilli = Math.round((-scout.vColMilli * back) / 1000);
  } else if (scout.colMilli > hiCol) {
    scout.colMilli = hiCol;
    scout.vColMilli = Math.round((-scout.vColMilli * back) / 1000);
  }
  if (scout.rowMilli < lo) {
    scout.rowMilli = lo;
    scout.vRowMilli = Math.round((-scout.vRowMilli * back) / 1000);
  } else if (scout.rowMilli > hiRow) {
    scout.rowMilli = hiRow;
    scout.vRowMilli = Math.round((-scout.vRowMilli * back) / 1000);
  }
}

/**
 * One tick of a hazard: straight on, and round at the walls.
 *
 * The turn is a mirror rather than a bounce — a hazard keeps its speed, so a
 * seat that has watched one cross the arena knows exactly when it comes back.
 * A hazard that lost speed at the wall would make the sentence that warns
 * about it wrong the second time it is said.
 */
export function stepScoutHazards(cfg: SimConfig, scout: ScoutState): void {
  const tpb = ticksPerBeat(cfg);
  const edge = cfg.scoutHazardRadiusMilli;
  const hiCol = cfg.cols * 1000 - edge;
  const hiRow = cfg.rows * 1000 - edge;
  for (const hazard of scout.hazards) {
    hazard.colMilli += Math.round(hazard.vColMilli / tpb);
    hazard.rowMilli += Math.round(hazard.vRowMilli / tpb);
    if (hazard.colMilli < edge || hazard.colMilli > hiCol) {
      hazard.colMilli = Math.max(edge, Math.min(hiCol, hazard.colMilli));
      hazard.vColMilli = -hazard.vColMilli;
    }
    if (hazard.rowMilli < edge || hazard.rowMilli > hiRow) {
      hazard.rowMilli = Math.max(edge, Math.min(hiRow, hazard.rowMilli));
      hazard.vRowMilli = -hazard.vRowMilli;
    }
  }
}

/** A whole turn, re-exported so a caller need not reach into THE MAZE for it. */
export const SCOUT_TURN = MAZE_TURN;
