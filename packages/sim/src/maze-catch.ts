import { mazeClickAngle, mazeDragTurn, mazeEntranceCol, mazeWrap } from "./maze.js";
import type { MazeState } from "./maze-state.js";
import type { MazeWheel } from "./maze-wheel.js";
import type { World } from "./world.js";

/**
 * **How THE MAZE's wheel catches, lets go and coasts** — the feel of the
 * string after the hand has decided where it is going (`maze-controls.ts`).
 *
 * The owner, 5 October 2026, of the lever: *when the circle is locked in below
 * an entrance and the player releases, it should stay more locked to it … with
 * smooth fast movement, not jumping*; *when the player releases it should stay
 * on its current position and not snap back*; and *it should slide a little
 * more when released, in the direction the player was moving, except when it is
 * locked in*. Three answers, all here:
 *  - **the catch eases.** A way in coming within the snap window used to be
 *    set on the column in one tick; now the lock is taken at once — the light,
 *    the shot's permission — and the wheel travels the rest over a few ticks
 *    (`settleMilli`). A detent let go of eases the same way rather than
 *    jumping the whole break distance;
 *  - **the knob stays where it was let go** (`leverMilli`), so the next grab
 *    starts where the last one ended;
 *  - **a release coasts** (`glideMilli`): the hand's last speed carries the
 *    knob and the wheel on a little, slowing, and a coast that reaches a column
 *    catches on it like a pull. A release in a click does not coast.
 *
 * Every number in it is an integer and every step is per tick, so the coast
 * and the ease are the same on both devices.
 */

/** A part of `rest` to move this tick: `share` thousandths of it, at least `least`, never past it. */
function easeStep(rest: number, share: number, least: number): number {
  const mag = Math.min(
    Math.abs(rest),
    Math.max(least, Math.trunc((Math.abs(rest) * share) / 1000)),
  );
  return rest < 0 ? -mag : mag;
}

/** The shortest signed turn from `from` to `to`, in thousandths of a degree. */
function turnBetween(from: number, to: number): number {
  const d = mazeWrap(to - from);
  return d > 180_000 ? d - 360_000 : d;
}

/**
 * Coming out of a click. That is the whole of "pull again": the detent holds
 * until somebody pulls out of it, and the wheel is disarmed until the rim is
 * clear of every column, or it would click straight back into the one it was
 * just pulled out of. An ease still carrying the wheel onto the click is
 * dropped with it — the wheel is being taken somewhere else.
 */
export function mazeBreakDetent(m: MazeState): void {
  if (m.lockedWay >= 0) m.armed = false;
  m.lockedCol = -1;
  m.lockedWay = -1;
  m.settleMilli = 0;
}

/**
 * A way in onto a column, if one has come round to one and the wheel is armed
 * for it. Called by every gesture rather than written twice: which angle
 * counts as *on* a column is one rule, and a second copy of it is how the
 * thumb and the hand come to stop in two different places.
 *
 * The lock is taken on this tick; the wheel is carried the rest of the way
 * onto the column by `stepMazeCatch`, a little each tick, so the light reads
 * as standing *on* the column without the drum jumping to it.
 */
export function mazeClickIntoColumn(world: World, m: MazeState, wheel: MazeWheel): boolean {
  let clear = true;
  for (const [way] of wheel.entrances.entries()) {
    const col = mazeEntranceCol(world.cfg, wheel, m.angleMilli, way);
    if (col < 0) continue;
    clear = false;
    if (!m.armed) continue;
    const on = mazeClickAngle(world.cfg, wheel, m.angleMilli, way, col);
    m.settleMilli = turnBetween(m.angleMilli, on);
    m.lockedWay = way;
    m.lockedCol = col;
    m.turn = 0;
    m.glideMilli = 0;
    world.events.push({ type: "mazeCommit", mouth: way, col });
    return true;
  }
  // Between two columns the wheel is armed again, and the next one catches.
  if (clear) m.armed = true;
  return false;
}

/**
 * The hand let go of the string. Out of a click it coasts on by its last
 * speed, so many ticks' worth of it and no further than the cap; in one it
 * stays put. Either way the knob stays where it is.
 */
export function mazeLetGo(world: World, m: MazeState): void {
  const cfg = world.cfg;
  const cap = cfg.mazeGlideMaxMilli;
  const coast = m.leverVelMilli * cfg.mazeGlideTicks;
  m.glideMilli = m.lockedWay >= 0 ? 0 : Math.max(-cap, Math.min(cap, coast));
  m.leverVelMilli = 0;
}

/**
 * A tick of the ease and the coast. The ease first, so a wheel easing onto a
 * column is on it before anything else asks; the coast after, checked for a
 * catch after every step of it. A hand on the string forgets its speed a
 * little every tick, so a hand that stopped before it let go does not coast.
 */
export function stepMazeCatch(world: World, m: MazeState, wheel: MazeWheel): void {
  const cfg = world.cfg;
  if (m.dragging) m.leverVelMilli = Math.trunc(m.leverVelMilli / 2);
  if (m.settleMilli !== 0) {
    const s = easeStep(m.settleMilli, cfg.mazeEaseMilli, cfg.mazeEaseLeastMilli);
    m.angleMilli = mazeWrap(m.angleMilli + s);
    m.settleMilli -= s;
    if (m.lockedWay < 0) mazeClickIntoColumn(world, m, wheel);
  }
  if (m.glideMilli !== 0 && !m.dragging) {
    const g = easeStep(m.glideMilli, cfg.mazeEaseMilli, cfg.mazeGlideLeastMilli);
    m.glideMilli -= g;
    m.leverMilli += g;
    m.angleMilli = mazeWrap(m.angleMilli + mazeDragTurn(cfg, g));
    mazeClickIntoColumn(world, m, wheel);
  }
}

/** The ease finished at once and the coast dropped: the shot is going in. */
export function mazeSettleNow(m: MazeState): void {
  m.angleMilli = mazeWrap(m.angleMilli + m.settleMilli);
  m.settleMilli = 0;
  m.glideMilli = 0;
}
