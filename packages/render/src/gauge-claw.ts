import type { Point } from "@neon-spore/content";
import { GAUGE_FULL } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { rgba } from "./hex.js";
import { OWN_SKIN } from "./hull-skin.js";
import { PALETTE } from "./palette.js";
import { ARM_FINGER_TILES, ARM_SHAFT_TILES, drawClawFingers } from "./reach-arm.js";

/**
 * THE GAUGE as the ship's own hand — the owner, 20 September 2026: *the
 * control idea should stay, but the visual a lot.* The dial was a circle read
 * as a circle; it is now the claw THE CLAW's panel already carries, standing
 * on the crown of the ship where the cannon sits and **turning** through the
 * half-round the needle swept, a dotted line out of it saying where it will
 * grab, and — on the navigator's screen only — a pod where the band was.
 *
 * **Not one number of the round moved.** The claw points at `angleFor` of the
 * needle's thousandths and the pod stands at `angleFor` of the mark's, both
 * about the pivot `gaugeDial` has always put at the bottom of the half-circle,
 * so every reading is still `gauge.ts`'s.
 *
 * **The pod's width is the span.** The call is one comparison, the needle
 * within `gaugeSpanNow` of the mark, which about the pivot is an angle either
 * side of the mark's. Drawn at radius `R`, the two rays at that angle cross the
 * pod's own tangent at `R·tan θ` either side of its middle, and that is its
 * half-width — so the dotted line passes inside the pod on exactly the calls
 * that land. Its height follows from its width, and a band wound tight is a
 * smaller pod.
 */

/** How far the claw's rails reach before its hand, as a share of the radius. */
const RISE = 0.3;
/** How far out the dotted line runs, past the pod's far edge. */
const LINE_REACH = 1.08;

/**
 * Where the claw is and how its hand stands: which way it points, how far out
 * its fingers are from the pivot, and how far apart. At rest that is the
 * needle, the rise and the open hand; a call sends it out along its own line
 * and back (`gauge-catch.ts`), and nothing else ever moves it.
 */
export interface ClawPose {
  aimMilli: number;
  /** From the pivot to the fingers' root, in pixels. */
  length: number;
  /** How far out either finger stands, in pixels. */
  out: number;
}

/** The hand's own measures in pixels: its rise at rest, the rails' half-gap,
 * and how far the fingers reach past their root. */
export function clawHand(dial: Dial): { rise: number; half: number; reach: number } {
  const rise = dial.r * RISE;
  return {
    rise,
    half: Math.max(1, rise * ARM_SHAFT_TILES * 1.6),
    reach: rise * ARM_FINGER_TILES * 1.6,
  };
}

/** The claw standing at home, open, pointing where the needle is. */
export function clawAtRest(dial: Dial, needleMilli: number): ClawPose {
  const hand = clawHand(dial);
  return { aimMilli: needleMilli, length: hand.rise, out: hand.half * 2.1 };
}

/** The unit direction a value on the dial points in. Left is 0, right is full. */
export function along(milli: number): Point {
  const a = Math.PI + (milli / GAUGE_FULL) * Math.PI;
  return { x: Math.cos(a), y: Math.sin(a) };
}

/** The canvas turned so that "up" is the way `milli` points, about the pivot. */
export function aimAt(ctx: CanvasRenderingContext2D, dial: Dial, milli: number): void {
  const d = along(milli);
  ctx.translate(dial.cx, dial.cy);
  ctx.rotate(Math.atan2(d.y, d.x) + Math.PI / 2);
}

/**
 * The claw, rooted in the crown and standing as `pose` says: two rails and THE
 * CLAW's own fingers (`reach-arm.ts`), in that arm's proportions with the rise
 * standing in for a tile — the same shares the REACH button takes
 * (`action-face.ts`).
 */
export function drawGaugeClaw(ctx: CanvasRenderingContext2D, dial: Dial, pose: ClawPose): void {
  const { rise, half, reach } = clawHand(dial);
  ctx.save();
  aimAt(ctx, dial, pose.aimMilli);
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 2.6;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(side * half, rise * 0.1);
    ctx.lineTo(side * half, -pose.length);
    ctx.stroke();
  }
  drawClawFingers(ctx, 0, -pose.length, half, reach, false, pose.out);
  // The joint it turns on, over the rails' feet: an arm that swings needs
  // something to swing *about*, and two rails meeting the crown at a slant
  // read as a hand leaning on the ship rather than one mounted in it.
  ctx.beginPath();
  ctx.arc(0, 0, half * 1.35, 0, Math.PI * 2);
  ctx.fillStyle = OWN_SKIN.body[1];
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.hullRim;
  ctx.beginPath();
  ctx.arc(0, 0, half * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Where the claw will grab: a line of dots from its fingertips out past the
 * pod's far edge. It is what the needle was, and both screens carry it — the
 * pilot is the one who turns it, and she has to see it to call it.
 */
export function drawGaugeLine(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  needleMilli: number,
  alpha = 1,
): void {
  if (alpha <= 0) return;
  const { rise, reach } = clawHand(dial);
  const from = rise + reach + 6;
  ctx.save();
  aimAt(ctx, dial, needleMilli);
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85 * alpha);
  ctx.setLineDash([0.1, 9]);
  ctx.beginPath();
  ctx.moveTo(0, -from);
  ctx.lineTo(0, -dial.r * LINE_REACH);
  ctx.stroke();
  ctx.restore();
}
