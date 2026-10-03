import {
  type GimbalRing,
  type GimbalState,
  gimbalAligned,
  gimbalRingAsks,
  gimbalRingTrue,
  gimbalTeeth,
  gimbalTurning,
  NO_BEARING,
  type World,
} from "@neon-spore/sim";
import { gimbalOpenPhase, gimbalShearPhase, gimbalSpinMilli } from "./gimbal-drum.js";
import { drawGimbalKnurl, gimbalHeld, gimbalRingCircle } from "./gimbal-grip.js";
import {
  gimbalMarkFace,
  gimbalPoint,
  gimbalRimPath,
  gimbalRingFace,
  gimbalRingR,
  gimbalTeethPath,
  type Point,
} from "./gimbal-shape.js";
import { strokeGlow } from "./glow.js";
import { drawVerdictRing, type GripVerdicts } from "./grip-verdict.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
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
 * the sockets of the ones already sheared, and the two pins that say which
 * ring this is. Both rings standing true glow; once every tooth is gone they
 * spin free. Its mark is the partner's to see (`gimbal-partner.ts`).
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
  verdicts: GripVerdicts,
): void {
  const cfg = world.cfg;
  const r = gimbalRingR(l, ring);
  const open = gimbalOpenPhase(s, cfg, beat, beatPhase);
  const shear = gimbalShearPhase(s, cfg, beat, beatPhase);
  const face = gimbalRingFace(l, s, ring) + gimbalSpinMilli(open, time);
  const of = s.marks.length;
  const left = gimbalTeeth(s);
  // The rim glows for the pair, never for one ring: each seat is shown the
  // partner's mark, and a rim that lit on its own mark would be that mark.
  const at_true = gimbalAligned(s, beat);

  // Drawn through the rig (`gimbal-tilt-draw.ts`), the hoop, the teeth and the
  // pins are solid parts already, and only what is flat on them is drawn here.
  // White-hot when the pair is locked, the rims standing on the light of
  // `gimbal-beam.ts` — the owner's *increase the visual if it's correct*.
  if (at_true) {
    strokeGlow(ctx, gimbalRimPath(at, r), PALETTE.hullRim, STROKE.outline * 1.6, 2.4);
  }

  const sockets = gimbalTeethPath(l, at, r, face, left, of, true);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(sockets);
  if (shear > 0) drawShear(ctx, at, r, face, left, of, shear);

  // The knurl last of the rim's own furniture and before the mark, so a thumb
  // that has moved the ring less than a tooth still sees it was heard
  // (`gimbal-grip.ts`, where the hit test this is the visible half of lives).
  if (gimbalTurning(s)) drawGimbalKnurl(ctx, l, at, ring, face, gimbalHeld(s, ring));

  // Where the ring is met: the halo while it asks for a hand, and the verdict
  // of the last one (`gimbal-marks.ts`).
  const grip = gimbalRingCircle(l, cfg, s, ring);
  if (grip !== null && gimbalRingAsks(s, ring)) drawMarkHalo(ctx, grip.x, grip.y, grip.r, time);

  // A ring's own mark is drawn only on the screen that shows both rings: on a
  // seat's own it is the partner who sees it (`gimbal-partner.ts`).
  const mark =
    gimbalTurning(s) && l.role === "test" ? gimbalMarkFace(l, s, beat, ring) : NO_BEARING;
  if (mark !== NO_BEARING) drawGimbalMark(ctx, l, at, r, mark, gimbalRingTrue(s, beat, ring), time);
  const v = verdicts.at(ring);
  if (grip !== null && v !== null) drawVerdictRing(ctx, grip.x, grip.y, grip.r, v);
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
 * A mark: a wedge outside the rim, pointing in at the bearing the
 * ring has to be brought to, filled once the ring is standing on it.
 *
 * It was a bare tick for one frame and read as a stray line off the edge of
 * the picture rather than as a thing being pointed at. A wedge has a
 * direction in it, which is the whole of what a mark on a circle has to say.
 */
export function drawGimbalMark(
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
