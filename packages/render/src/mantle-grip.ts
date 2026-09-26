import {
  type MantleState,
  mantleDone,
  mantleFinale,
  mantleVenting,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { mantleArrived, mantleValvePose } from "./mantle-pose.js";
import {
  mantleCentre,
  mantleHandleRest,
  mantleKnobDrop,
  mantleLift,
  mantleReach,
  mantleRing,
  type Side,
} from "./mantle-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The thumbs on THE MANTLE** — half two of the look lane, and the half that
 * makes the shell answer a hand at all.
 *
 * Its own page beside `mantle-handle.ts` for `spool-grip.ts`' reason: the
 * knob a finger is answered at is the one `mantleHandleRest` puts on the
 * screen for the drawing, off the same valve pose, and all this file adds is
 * *whether* the press counts.
 *
 * **Geometry says whose handle is whose, on both phones.** The left knob is
 * Player 1's and the right Player 2's (`sim/mantle-hand.ts`), and both
 * screens show both, because the sum is the one number the fight is about. A
 * thumb on the other seat's knob falls through to whatever is behind it, as
 * the simulation would refuse it anyway.
 *
 * **A dark handle still takes a thumb.** From the drop into frame until the
 * shell splits, a press on a knob is held here even while the simulation is
 * not counting it: a thumb laid on the knob before the handles light is the
 * one ready to pull when they do, and it is not a thumb on the cannon behind.
 *
 * **The core is tapped by either seat.** The finish alternates, and the ring
 * says whose tap is next; the wrong seat's tap is swallowed here and refused
 * by the simulation, silently, rather than moving a lobe it did not mean to.
 */

/** Whether the handles are there to take hold of: every phase but the split and the dark. */
export function mantleTakesPull(s: MantleState): boolean {
  return !mantleFinale(s) && !mantleDone(s);
}

/** A valve for a seat: the pilot's is the left, the navigator's the right. */
export function mantleSide(seat: 1 | 2): Side {
  return seat === 1 ? -1 : 1;
}

/**
 * A knob where it stands this frame, at `depthMilli` down its groove: the
 * rest `mantleHandleRest` gives on this frame's valve pose, lifted while the
 * shell is still dropping in, and drawn down by the depth.
 */
export function mantleKnobCircle(
  l: Layout,
  cfg: SimConfig,
  s: MantleState,
  side: Side,
  beat: number,
  beatPhase: number,
  depthMilli = 0,
): Circle {
  const pose = mantleValvePose(s, cfg, side, beat, beatPhase);
  const rest = mantleHandleRest(l, mantleCentre(l, cfg), side, pose);
  const lift = mantleLift(l, mantleArrived(s, cfg, beat, beatPhase));
  return {
    x: rest.x,
    y: rest.y - lift + mantleKnobDrop(l, depthMilli),
    r: handleRadius(l, cfg),
  };
}

/** A knob where a seat's thumb has it — at its depth in the simulation. */
export function mantleKnobStanding(
  l: Layout,
  world: World,
  s: MantleState,
  seat: 1 | 2,
  beatPhase: number,
): Circle {
  const depth = s.depthMilli[seat === 1 ? 0 : 1];
  return mantleKnobCircle(l, world.cfg, s, mantleSide(seat), world.beat, beatPhase, depth);
}

/** The ring round the bared core, which is the whole of what a finishing tap is answered on. */
export function mantleCoreCircle(l: Layout, cfg: SimConfig): Circle {
  return mantleRing(l, mantleCentre(l, cfg));
}

/**
 * The vent on the seam's crack (§23 row 9), which is what shutting it is
 * answered on: a little above the shell's middle, clear of both knobs.
 */
export function mantleVentCircle(l: Layout, cfg: SimConfig): Circle {
  const at = mantleCentre(l, cfg);
  const { rx, ry } = mantleReach(l);
  return { x: at.x, y: at.y + ry * 0.05, r: Math.max(handleRadius(l, cfg), rx * 0.42) };
}

/** What a tap on the core is answered on this frame: the vent while it hisses, the ring while the finish runs. */
export function mantleCoreTarget(l: Layout, cfg: SimConfig, s: MantleState): Circle | null {
  if (mantleVenting(s)) return mantleVentCircle(l, cfg);
  return mantleFinale(s) ? mantleCoreCircle(l, cfg) : null;
}

/**
 * A press on this seat's knob. `bossOf(field, "mantle")` is `null` on every
 * wave without the shell. The grab reports no depth: the knob is at the top
 * of its groove, and every move after it is how far down the thumb has
 * carried it, in thousandths of a tile (`touch-move.ts`) — which is the
 * depth the simulation reads straight (`sim/mantle-hand.ts`).
 */
export function mantleHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "mantle");
  if (s === null || !mantleTakesPull(s)) return null;
  const seat = field.seat;
  const knob = mantleKnobCircle(l, field.cfg, s, mantleSide(seat), field.beat, field.beatPhase);
  if (!hitCircle(knob, x, y)) return null;
  const target = seat === 1 ? "mantleLeft" : "mantleRight";
  return {
    player: seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: seat, originX: x, originY: y },
  };
}

/** A tap on the vent or the bared core, from either seat, for as long as either is open. */
export function mantleCoreUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "mantle");
  const circle = s === null ? null : mantleCoreTarget(l, field.cfg, s);
  if (circle === null || !hitCircle(circle, x, y)) return null;
  const seat = field.seat;
  return {
    player: seat,
    command: { kind: "drag", target: "mantleCore", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "mantleCore", player: seat, originX: x, originY: y },
  };
}
