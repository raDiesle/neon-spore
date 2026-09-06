import { hullRow, ticksPerBeat } from "./config.js";
import { breachHull } from "./hull.js";
import { freePod } from "./pods.js";
import { MILLI, type World } from "./world.js";

/**
 * THE CLAW's arm: the cannon's column, reached up instead of fired along.
 *
 * The panel is `claw` in `control-sets.ts` and the field under it is the
 * ordinary field — the same grid, the same hull, the same bodies coming down
 * it. What changes is player 1's half of the ship: the swelling that was a gun
 * is an arm, it slides on the same strip and stands in the same
 * `world.cannonCol`, and one press sends it up the column it is standing in.
 *
 * **Out and back, closing on the first thing it meets.** Nothing recalls it,
 * so the press is a commitment for as long as `reachTilesPerBeat` takes to
 * cross the field twice — and the thing it meets is whatever happens to be in
 * that column by the time the tip gets there, not whatever was in it when
 * somebody said so. That gap is the whole of the panel.
 *
 * **A pod is what it is for, and a body is what it must not touch.** A pod is
 * carried home and let go at the hull, where it falls the last of the way and
 * the *other* seat's mouth has to be open for it — the same `resolveIntake`
 * every pod in the game has always gone through, so a catch here is two hands
 * exactly as a catch in SALVAGE is. A body is crushed instead, and the hull
 * pays `damageReach` for it: less than the body would have cost by landing,
 * which is what makes reaching into a rock an answer rather than a mistake,
 * and what lets this panel carry rocks at all (`groupsCoveredBy`).
 *
 * **Nothing here travels a field.** The arm is the cannon's own reach, on a
 * hull that does not move, in a column the pair names the way they name every
 * other column in this game (`docs/decisions.md` #21).
 */

/** The arm at rest, on the hull, holding nothing. Every wave starts here. */
export const ARM_HOME = 0;

/** How far the arm moves in a tick, in thousandths of a tile. */
export function reachMilliPerTick(world: World): number {
  return Math.max(1, Math.round((world.cfg.reachTilesPerBeat * MILLI) / ticksPerBeat(world.cfg)));
}

/** Whether the arm is out at all — the one question the picture and the rules
 * both ask, so neither writes `reachDir !== 0` for itself. */
export function reachOut(world: World): boolean {
  return world.reachDir !== ARM_HOME;
}

/**
 * The row the tip has got to, counted from the hull upwards, in thousandths.
 * `hullRow` is the floor and 0 is the top of the field.
 */
export function reachTipMilli(world: World): number {
  return hullRow(world.cfg) * MILLI - world.reachMilli;
}

/**
 * A press. It is refused while the arm is already out — the arm is committed,
 * and a second press that quietly restarted it would be a control that lies
 * about what it answered.
 *
 * **It emits no event of its own**, and neither does a catch or a strike. THE
 * GAUGE set that precedent for a good reason: everything the picture and the
 * ear want is already on the world — where the arm is, what it is holding —
 * and `breachHull` and `resolveIntake` already say the two things that carry a
 * sound. An event here would be a third copy of a fact two files already have.
 */
export function reachHeard(world: World): void {
  if (reachOut(world)) return;
  world.reachDir = 1;
  world.reachCol = world.cannonCol;
  world.reachMilli = 0;
  world.reachHeld = 0;
}

/**
 * One tick of the arm.
 *
 * On the tick rather than on the beat, for the reason the cannon's own slide
 * is: the arm is a hand rather than a queue, and a pair watching it climb has
 * to see it climb. What it *meets* is checked at the tip's new position every
 * tick, so nothing can pass through it between two beats.
 */
export function stepReach(world: World): void {
  if (!reachOut(world)) return;
  const step = reachMilliPerTick(world);

  if (world.reachDir > 0) {
    world.reachMilli += step;
    // The top of the field, and nothing found. It turns round rather than
    // stopping there: an arm parked at the ceiling would be a control the pair
    // had spent with nothing to show and no way to get it back.
    if (reachTipMilli(world) <= 0) {
      world.reachMilli = hullRow(world.cfg) * MILLI;
      world.reachDir = -1;
      return;
    }
    strike(world);
    return;
  }

  world.reachMilli -= step;
  if (world.reachMilli > 0) return;
  // Home, and whatever it is carrying is let go at the hull — from there it is
  // an ordinary falling pod and the mouth is somebody else's to open.
  world.reachMilli = 0;
  world.reachDir = ARM_HOME;
  const held = world.reachHeld;
  world.reachHeld = 0;
  if (held === 0) return;
  const pod = world.pods.find((p) => p.id === held);
  if (pod === undefined) return;
  pod.colMilli = world.reachCol * MILLI;
  pod.rowMilli = (hullRow(world.cfg) - 1) * MILLI;
  freePod(world, pod);
}

/**
 * Whatever the tip has arrived on this tick, if anything.
 *
 * A pod first and a body second, and the order is not arbitrary: a pod and a
 * rock can occupy one tile only while one of them is arriving, and a claw that
 * chose the rock there would punish a pair for being exactly right.
 */
function strike(world: World): void {
  const tip = reachTipMilli(world);
  const row = Math.round(tip / MILLI);

  const half = Math.round(world.cfg.hitHeightMilli / 2);
  const pod = world.pods.find(
    (p) =>
      !p.loose &&
      Math.round(p.colMilli / MILLI) === world.reachCol &&
      Math.abs(p.rowMilli - tip) <= half,
  );
  if (pod !== undefined) {
    world.reachHeld = pod.id;
    world.reachDir = -1;
    world.score += world.cfg.scoreReachCatch;
    return;
  }

  const body = world.creatures.find((c) => c.col === world.reachCol && c.row === row);
  if (body === undefined) return;
  // Crushed, and the hull pays for it. The column is the arm's own rather than
  // the body's, which are the same number — it is written from the arm so that
  // a body two tiles wide leaves its scar where the hand actually closed.
  world.creatures = world.creatures.filter((c) => c !== body);
  world.reachDir = -1;
  breachHull(world, world.reachCol, body.kind, row, world.cfg.damageReach, body.color);
}
