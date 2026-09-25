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
import { gimbalCentre, gimbalFaceMilli, gimbalPoint, gimbalRingR } from "./gimbal-shape.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Field, Hold, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The ring under each thumb**: where a hand may take hold of it, what a turn
 * of it says, and the knurl that tells the seat it can be turned.
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
 * **Where the hand on this seat's ring is standing**, for the ghost thumb of a
 * rehearsal and for the cue word pointing at it (`handle-place.ts`).
 *
 * A ring has no place it hangs — the rim is the whole control — so what this
 * answers is the point on the rim at the bearing the ring itself is *at*,
 * drawn on the face of the seat that grips it. That is where the mark will be
 * met, which is where a thumb about to go on is about to go on.
 *
 * **The ring is named rather than worked out from the role**, which every
 * other handle in the game could do without: the desk asks for both seats'
 * marks on one beat and a screen asks for its own, and a reading that took
 * the ring off `l.role` would answer the pilot's question on the navigator's
 * ring whenever the rig's screen asked (`tools/director/src/stage-cue-key.ts`).
 */
export function gimbalRingCircle(
  l: Layout,
  cfg: SimConfig,
  s: GimbalState,
  ring: GimbalRing,
): { x: number; y: number; r: number } | null {
  if (!gimbalTurning(s)) return null;
  const at = gimbalCentre(l, cfg);
  const on = gimbalPoint(at, gimbalRingR(l, ring), gimbalFaceMilli(l, s.atMilli[ring], ring));
  return { x: on.x, y: on.y, r: gimbalGrabR(l) };
}

/**
 * A thumb going on the rim. The grab carries no bearing: the first sample is
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
  if (Math.abs(d - r) > gimbalGrabR(l)) return null;
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

/**
 * The knurl: short ticks across this seat's own rim, so a thumb that has moved
 * the ring less than a tooth's width still sees that it was heard.
 *
 * It is worth more here than on any other handle: the rings are silent
 * until one sits true, and on this boss the pair is already being lied to
 * about direction. A rim with no texture on it would leave a navigator who has
 * turned the wrong way unable to tell that from a rim that is not hers.
 */
export function drawGimbalKnurl(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: { x: number; y: number },
  ring: GimbalRing,
  faceMilli: number,
  held: boolean,
): void {
  const r = gimbalRingR(l, ring);
  const path = new Path2D();
  const ticks = 24;
  for (let i = 0; i < ticks; i++) {
    const milli = (faceMilli + (i * BEARING_TURN) / ticks) % BEARING_TURN;
    const inner = gimbalPoint(at, r - l.tile * 0.12, milli);
    const outer = gimbalPoint(at, r + l.tile * 0.12, milli);
    path.moveTo(inner.x, inner.y);
    path.lineTo(outer.x, outer.y);
  }
  strokeGlow(ctx, path, held ? PALETTE.pod : PALETTE.hullRim, STROKE.inner, held ? 0.7 : 0.3);
}

/** Whether a hand is on the ring at all, which is what the knurl asks. */
export function gimbalHeld(s: GimbalState, ring: GimbalRing): boolean {
  return s.handMilli[ring] !== NO_BEARING;
}
