import {
  type GimbalRing,
  type GimbalState,
  gimbalRingTrue,
  gimbalTeeth,
  gimbalTurning,
  NO_BEARING,
  type World,
} from "@neon-spore/sim";
import { paintHoop } from "./gimbal-depth.js";
import { gimbalOpenPhase, gimbalShearPhase, gimbalSpinMilli } from "./gimbal-drum.js";
import { drawGimbalKnurl, gimbalHeld } from "./gimbal-grip.js";
import {
  gimbalMarkFace,
  gimbalPinPath,
  gimbalPoint,
  gimbalRimPath,
  gimbalRingFace,
  gimbalRingR,
  gimbalTeethPath,
  type Point,
} from "./gimbal-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The half of THE GIMBAL a hand is on**: one ring, drawn on the screen of
 * the seat that grips it, with its teeth, its pins and that seat's own mark.
 *
 * Its own file rather than an arm of `gimbal-draw.ts`, which was 259 lines
 * the moment it was written, and the seam is the boss's own: next door is
 * the yoke, the drum and the leak — things both seats are shown and neither
 * can touch — and here is the one thing on the screen that answers a thumb.
 * The grip's hit test will be written against these same paths (`layout.ts`'s
 * standing rule that a control is drawn and found in one file), so the rim a
 * finger is measured against cannot drift from the rim it was given.
 */

/**
 * One ring, on the screen of the seat that grips it: the rim, its teeth and
 * the sockets of the ones already sheared, the two pins that say which ring
 * this is, and — while it is being turned — this seat's own mark outside the
 * rim. A ring standing at true glows; once every tooth is gone it spins free.
 */
export function drawGimbalRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GimbalState,
  ring: GimbalRing,
  at: Point,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const r = gimbalRingR(l, ring);
  const open = gimbalOpenPhase(s, cfg, beat, beatPhase);
  const shear = gimbalShearPhase(s, cfg, beat, beatPhase);
  const face = gimbalRingFace(l, s, ring) + gimbalSpinMilli(open, time);
  const of = s.marks.length;
  const left = gimbalTeeth(s);
  const at_true = gimbalTurning(s) && gimbalRingTrue(s, cfg, beat, ring);

  paintHoop(ctx, at, r, l.tile, ring, time);
  const rim = gimbalRimPath(at, r);
  ctx.lineWidth = STROKE.outline;
  if (at_true) strokeGlow(ctx, rim, PALETTE.rock, STROKE.outline, 1.4);
  else {
    ctx.strokeStyle = PALETTE.rock;
    ctx.stroke(rim);
  }

  const sockets = gimbalTeethPath(l, at, r, face, left, of, true);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(sockets);
  const teeth = gimbalTeethPath(l, at, r, face, left, of, false);
  ctx.fillStyle = at_true ? PALETTE.rock : rgba(PALETTE.rock, 0.8);
  ctx.fill(teeth);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.stroke(teeth);
  if (shear > 0) drawShear(ctx, at, r, face, left, of, shear);

  const pins = gimbalPinPath(l, at, r, ring);
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(pins);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.rock;
  ctx.stroke(pins);

  // The knurl last of the rim's own furniture and before the mark, so a thumb
  // that has moved the ring less than a tooth still sees it was heard
  // (`gimbal-grip.ts`, where the hit test this is the visible half of lives).
  if (gimbalTurning(s)) drawGimbalKnurl(ctx, l, at, ring, face, gimbalHeld(s, ring));

  const mark = gimbalTurning(s) ? gimbalMarkFace(l, s, beat, ring) : NO_BEARING;
  if (mark !== NO_BEARING) drawMark(ctx, l, at, r, mark, at_true, time);
}

/** The tooth coming off, at the place on the rim it is coming off — a white flare that grows and goes. */
function drawShear(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  face: number,
  left: number,
  of: number,
  shear: number,
): void {
  const gone = Math.max(0, of - left - 1);
  const on = gimbalPoint(at, r, face + (gone * 1000) / Math.max(1, of));
  const flare = new Path2D();
  flare.ellipse(on.x, on.y, r * 0.09 * (1 + shear), r * 0.09 * (1 + shear), 0, 0, Math.PI * 2);
  strokeGlow(ctx, flare, PALETTE.hullRim, STROKE.inner, 2 * (1 - shear));
}

/**
 * This seat's mark: a wedge outside the rim, pointing in at the bearing the
 * ring has to be brought to, filled once the ring is standing on it.
 *
 * It was a bare tick for one frame and read as a stray line off the edge of
 * the picture rather than as a thing being pointed at. A wedge has a
 * direction in it, which is the whole of what a mark on a circle has to say.
 */
function drawMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  r: number,
  milli: number,
  hit: boolean,
  time: number,
): void {
  const tip = gimbalPoint(at, r + l.tile * 0.14, milli);
  const back = l.tile * 0.54;
  const wide = 26;
  const left = gimbalPoint(at, r + l.tile * 0.14 + back, milli - wide);
  const right = gimbalPoint(at, r + l.tile * 0.14 + back, milli + wide);
  const wedge = new Path2D();
  wedge.moveTo(tip.x, tip.y);
  wedge.lineTo(left.x, left.y);
  wedge.lineTo(right.x, right.y);
  wedge.closePath();
  const beatOf = hit ? 1.6 : 0.8 + 0.3 * Math.sin(time * 5);
  ctx.fillStyle = rgba(PALETTE.hullRim, hit ? 0.9 : 0.2);
  ctx.fill(wedge);
  strokeGlow(ctx, wedge, PALETTE.hullRim, STROKE.inner, beatOf);
}
