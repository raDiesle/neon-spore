import {
  beatStartTick,
  type Creature,
  chargeDueTick,
  faultOn,
  steerHeading,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { aimColumn } from "./autopilot-aim.js";

/**
 * **THE CHOKE, on AUTO**: the cannon strip answers nobody and the cannon
 * walks wall to wall on its own (`choke.ts`), while player 2 goes on firing.
 *
 * So there is no standing under the body nearest the hull: the cannon gets
 * there when the walk brings it. The hand answers what the cannon is under
 * *now* — the lowest body it can reach from this column, a magnet from the
 * column beside it — and fires as it passes. Until 15 October 2026 it waited
 * for the walk to reach the lowest body and let everything it passed under on
 * the way go by, and five of THE CHOKE's eight composed waves were lost.
 *
 * And it keeps the cannon free for what is coming: a shot up at a body high
 * on the field is in the air for a beat, and a lower body in the column the
 * walk steps into next would go by under it.
 */

/** Whether the walk is in force: the cannon goes where it goes. */
export function walking(w: World): boolean {
  return faultOn(w, "steer") !== null;
}

/** Whether the cannon, standing in `col`, can answer `c` from there. */
export function reachedFrom(c: Creature, col: number): boolean {
  if (c.kind === "magnet") return Math.abs(c.col - col) === 1;
  return aimColumn(c) === col;
}

/** The column the walk steps into next. */
export function nextStep(w: World): number {
  return w.cannonCol + steerHeading(w);
}

/**
 * Whether a shot pressed now leaves before the walk steps again. The walk
 * steps on the beat, and at the game's charge a press late in a beat leaves
 * on that beat (`chargeDueTick`) — out of the column the cannon has just
 * walked into, up past the body it was fired at.
 */
export function leavesHere(w: World): boolean {
  return chargeDueTick(w.cfg, w.tick) < beatStartTick(w.cfg, w.tick) + ticksPerBeat(w.cfg);
}
