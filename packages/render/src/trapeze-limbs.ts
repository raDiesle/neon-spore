import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { Point } from "./trapeze-shape.js";

/**
 * **The seat and the alien's limbs**, for `trapeze-alien.ts`, in the seat's
 * own frame: the origin the seat, up the ropes, forward the way the alien
 * faces, in pixels of a tile `T`. A limb is a thick rounded stroke on a
 * darker one; the far one of a pair is drawn a shade darker and set back.
 * Cut from `trapeze-alien.ts` for length.
 */

/** The seat board's half-depth and thickness, and how far its top face shows, in tiles. */
const SEAT = 0.32;
const SEAT_THICK = 0.14;
const SEAT_TOP = 0.07;
/** The thigh along the seat and the shin off the knee, and how thick a limb is, in tiles. */
const THIGH = 0.3;
const SHIN = 0.46;
const LIMB = 0.15;
/** Where the hands hold the rope, up from the seat, in tiles. */
const GRIP_UP = 0.78;

/** The seat board end-on: its front face, and its top a little above it, the far edge darker. */
export function drawSeat(ctx: CanvasRenderingContext2D, T: number): void {
  const top = new Path2D();
  top.moveTo(-SEAT * T, 0);
  top.lineTo(SEAT * T, 0);
  top.lineTo((SEAT + SEAT_TOP) * T, -SEAT_TOP * T);
  top.lineTo((-SEAT + SEAT_TOP) * T, -SEAT_TOP * T);
  top.closePath();
  ctx.fillStyle = mixHex(PALETTE.trapezeWood, PALETTE.trapezeRope, 0.35);
  ctx.fill(top);
  const front = new Path2D();
  front.roundRect(-SEAT * T, 0, 2 * SEAT * T, SEAT_THICK * T, 0.04 * T);
  ctx.fillStyle = PALETTE.trapezeWood;
  ctx.fill(front);
  ctx.lineWidth = 0.05 * T;
  ctx.strokeStyle = PALETTE.trapezeRopeDark;
  ctx.stroke(front);
  ctx.stroke(top);
}

/** A thigh along the seat and a shin at `shin` off forward, with a foot; `far` darker and set back by `back`. */
export function drawLeg(
  ctx: CanvasRenderingContext2D,
  T: number,
  hip: Point,
  shin: number,
  back: number,
  far: boolean,
): void {
  const knee = { x: hip.x + THIGH * T - back, y: hip.y - 0.02 * T };
  const foot = { x: knee.x + Math.cos(shin) * SHIN * T, y: knee.y + Math.sin(shin) * SHIN * T };
  const leg = new Path2D();
  leg.moveTo(hip.x - back, hip.y - 0.05 * T);
  leg.lineTo(knee.x, knee.y);
  leg.lineTo(foot.x, foot.y);
  limb(ctx, T, leg, far);
  const toe = new Path2D();
  toe.ellipse(
    foot.x + 0.06 * T,
    foot.y,
    0.13 * T,
    0.08 * T,
    shin - Math.PI / 2 + 1.4,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = far ? PALETTE.trapezeAlienDark : PALETTE.trapezeAlien;
  ctx.fill(toe);
  ctx.lineWidth = 0.04 * T;
  ctx.strokeStyle = PALETTE.trapezeAlienDark;
  ctx.stroke(toe);
}

/** An arm from `shoulder` to the rope, a hand round it; `far` darker and set back. */
export function drawArm(
  ctx: CanvasRenderingContext2D,
  T: number,
  shoulder: Point,
  back: number,
  far: boolean,
): void {
  const hand = { x: 0.03 * T - back, y: -GRIP_UP * T };
  const elbow = {
    x: (shoulder.x + hand.x) / 2 + 0.16 * T,
    y: (shoulder.y + hand.y) / 2 + 0.04 * T,
  };
  const arm = new Path2D();
  arm.moveTo(shoulder.x - back, shoulder.y);
  arm.lineTo(elbow.x, elbow.y);
  arm.lineTo(hand.x, hand.y);
  limb(ctx, T, arm, far, 0.8);
  const fist = new Path2D();
  fist.arc(hand.x, hand.y, 0.09 * T, 0, Math.PI * 2);
  ctx.fillStyle = far ? PALETTE.trapezeAlienDark : PALETTE.trapezeAlien;
  ctx.fill(fist);
  ctx.lineWidth = 0.04 * T;
  ctx.strokeStyle = PALETTE.trapezeAlienDark;
  ctx.stroke(fist);
}

/** A limb as a thick rounded stroke on a darker one. */
function limb(ctx: CanvasRenderingContext2D, T: number, path: Path2D, far: boolean, k = 1): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = (LIMB + 0.06) * T * k;
  ctx.strokeStyle = PALETTE.trapezeAlienDark;
  ctx.stroke(path);
  ctx.lineWidth = LIMB * T * k;
  ctx.strokeStyle = far
    ? mixHex(PALETTE.trapezeAlien, PALETTE.trapezeAlienDark, 0.55)
    : PALETTE.trapezeAlien;
  ctx.stroke(path);
}
