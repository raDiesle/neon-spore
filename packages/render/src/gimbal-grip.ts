import {
  BEARING_TURN,
  type GimbalRing,
  type GimbalState,
  gimbalTurning,
  INNER,
  NO_BEARING,
  OUTER,
  type SimConfig,
} from "@neon-spore/sim";
import { gimbalKnobAt, gimbalKnobSize } from "./gimbal-knob.js";
import { gimbalCentre, gimbalRingR } from "./gimbal-shape.js";
import { hitCircle, type Layout } from "./layout.js";
import { PULL_GRAB } from "./pull-knob.js";
import type { Field, Hold, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The ring under each thumb**: where a hand may take hold of it and what a
 * turn of it says. What it looks like — THE MAZE's knob, lever and channel,
 * the owner's one turn for every wave (5 October 2026) — is `gimbal-knob.ts`,
 * and the knob is answered here at the place that file draws it.
 *
 * The drawing and the hit test are in one file, which is `layout.ts`'s
 * standing rule — a control is never drawn in one place and answered in
 * another. This is the whole-circle handle in the game that **both** seats
 * have one of at once, so the two halves drifting apart would drift apart
 * twice over, once per seat, and only one of them would ever be looked at.
 *
 * **A bearing, read on the face the hand is on.** The rings are drawn as
 * circles rather than flattened (`gimbal-shape.ts`), so the angle under the
 * finger is the angle on the rim and there is nothing to unsquash. What goes
 * on the wire is the bearing this seat's own screen shows, which is what the
 * simulation reads it as — and the mirror between the two faces is applied
 * there, once, where the boss's one line lives (`sim/gimbal-hand.ts`).
 *
 * **The fold is undone here**, and for this reason: a finger
 * chasing a mark round a circle is following a body rather than pointing at a
 * column, so on a turned screen the bearing is mirrored back before it is
 * sent and a thumb chasing the mark it can see chases the right one
 * (`field-flip.ts`). What leaves the device is identical on both.
 *
 * **Geometry says which ring is whose, so the seat is checked against the
 * ring rather than carried beside it**: the outer is the pilot's and the inner
 * the navigator's, always, and a seat is only ever shown its own
 * (`view-role-clocks-c.ts`). So a press from the wrong seat has nothing to
 * fall through to and simply misses.
 */

/** How far off the rim a thumb still has hold of it — half a tile, because a
 * rim is a hair-thin circle and a thumb is not. */
export function gimbalGrabR(l: Layout): number {
  return l.tile * 0.5;
}

/** The ring this seat grips, and nothing for a seat that is neither. */
function ringOf(seat: 1 | 2): GimbalRing {
  return seat === 1 ? OUTER : INNER;
}

/** The target name each ring answers to — the simulation's own two. */
function targetOf(ring: GimbalRing): "gimbalOuter" | "gimbalInner" {
  return ring === OUTER ? "gimbalOuter" : "gimbalInner";
}

/**
 * Where round the drum a point is, in thousandths of a turn clockwise from the
 * top — this seat's face, with the fold undone — or `NO_BEARING` for a point
 * too near the middle to have one.
 *
 * The dead spot is the crank's and for the crank's reason: a finger that has
 * wandered in to the drum swings through whole quadrants on a pixel of
 * movement, and on this boss every one of those swings is a turn the other
 * seat is told about.
 */
function bearing(l: Layout, cx: number, cy: number, x: number, y: number): number {
  const dx = x - cx;
  const dy = y - cy;
  const dead = l.tile * 0.5;
  if (dx * dx + dy * dy < dead * dead) return NO_BEARING;
  const turn = (Math.atan2(dy, dx) + Math.PI / 2) / (Math.PI * 2);
  const drawn = Math.round((turn - Math.floor(turn)) * BEARING_TURN) % BEARING_TURN;
  return l.flip ? (BEARING_TURN - drawn) % BEARING_TURN : drawn;
}

/**
 * **Where the hand on this seat's ring is standing**, for the halo, the
 * verdict, the ghost thumb of a rehearsal and the cue word pointing at it
 * (`handle-place.ts`): the knob, at the bearing the ring itself is *at*, drawn
 * on the face of the seat that grips it, at every pull handle's radius.
 *
 * **The ring is named rather than worked out from the role**, which every
 * other handle in the game could do without: a rig may ask for both seats'
 * marks on one beat and a screen asks for its own, and a reading that took
 * the ring off `l.role` would answer the pilot's question on the navigator's
 * ring whenever the rig's screen asked.
 */
export function gimbalRingCircle(
  l: Layout,
  cfg: SimConfig,
  s: GimbalState,
  ring: GimbalRing,
): { x: number; y: number; r: number } | null {
  if (!gimbalTurning(s)) return null;
  const on = gimbalKnobAt(l, gimbalCentre(l, cfg), s, ring);
  return { x: on.x, y: on.y, r: gimbalKnobSize(l, cfg) };
}

/**
 * A thumb going on the knob — answered `PULL_GRAB` times wider than it is
 * drawn, as every pull handle is — or anywhere on the rim, which is the older
 * grab and still takes a thumb that lands there. The grab carries no bearing: the first sample is
 * a starting point, and a grab claiming to be at the top would turn the ring
 * by however far round the finger happened to land (`sim/gimbal-hand.ts`).
 */
export function gimbalRingUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "gimbal");
  if (s === null || !gimbalTurning(s)) return null;
  const ring = ringOf(field.seat);
  const at = gimbalCentre(l, field.cfg);
  const r = gimbalRingR(l, ring);
  const d = Math.hypot(x - at.x, y - at.y);
  const knob = gimbalKnobAt(l, at, s, ring);
  const grab = { ...knob, r: gimbalKnobSize(l, field.cfg) * PULL_GRAB };
  if (Math.abs(d - r) > gimbalGrabR(l) && !hitCircle(grab, x, y)) return null;
  const target = targetOf(ring);
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: NO_BEARING },
    hold: { kind: "drag", target, player: field.seat, originX: at.x, originY: at.y },
  };
}

/**
 * The same thumb, moved: where round the drum it now is. The hold carries the
 * drum's own centre in place of the origin a carried handle keeps, exactly as
 * the crank carries its button's (`touch-drag.ts`).
 */
export function gimbalRingTurn(
  l: Layout,
  hold: Extract<Hold, { kind: "drag" }>,
  x: number,
  y: number,
): Touch {
  const command = {
    kind: "drag",
    target: hold.target,
    on: true,
    fromMilli: bearing(l, hold.originX, hold.originY, x, y),
  } as const;
  return { player: hold.player, command, hold };
}

/** Whether a hand is on the ring at all, which is what the knob's light asks. */
export function gimbalHeld(s: GimbalState, ring: GimbalRing): boolean {
  return s.handMilli[ring] !== NO_BEARING;
}
