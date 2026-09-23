import { blobPoints, POD, type Point } from "@neon-spore/content";
import { GAUGE_FULL } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { halo, strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { OWN_SKIN } from "./hull-skin.js";
import { PALETTE } from "./palette.js";
import { ARM_FINGER_TILES, ARM_SHAFT_TILES, drawClawFingers } from "./reach-arm.js";
import { splinePath } from "./spline.js";

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

/** How far out the pod stands, as a share of the radius — `gaugeBandMid`'s. */
export const POD_REACH = 0.81;
/** How far the claw's rails reach before its hand, as a share of the radius. */
const RISE = 0.3;
/** How far out the dotted line runs, past the pod's far edge. */
const LINE_REACH = 1.08;
/** The ship's crest: how far the cannon lobe stands above the skin, how wide
 * its shoulder is, and how far the skin falls away toward the screen's edges. */
const LIFT = 0.12;
const SHOULDER = 0.26;
const SAG = 0.1;
/** How far down the ship's body is painted before it is the dark. */
const DEPTH = 0.4;

/** The unit direction a value on the dial points in. Left is 0, right is full. */
function along(milli: number): Point {
  const a = Math.PI + (milli / GAUGE_FULL) * Math.PI;
  return { x: Math.cos(a), y: Math.sin(a) };
}

/** The canvas turned so that "up" is the way `milli` points, about the pivot. */
function aimAt(ctx: CanvasRenderingContext2D, dial: Dial, milli: number): void {
  const d = along(milli);
  ctx.translate(dial.cx, dial.cy);
  ctx.rotate(Math.atan2(d.y, d.x) + Math.PI / 2);
}

/**
 * The half-width the pod is drawn at, in pixels: `R·tan θ`, θ the span's own
 * angle about the pivot. Exported because it is the one claim this picture
 * makes that a test can hold (`gauge-claw.test.ts`).
 */
export function podHalfWidth(dial: Dial, spanMilli: number): number {
  const theta = Math.min(Math.PI * 0.45, (spanMilli / GAUGE_FULL) * Math.PI);
  return dial.r * POD_REACH * Math.tan(theta);
}

/**
 * A stretch of the ship's skin under the pivot, with the cannon lobe standing
 * at the middle so its crown is the pivot itself. The contour is the hull's —
 * an ellipse far wider than the screen, so only the flat arc around its apex
 * shows — and the paint is `OWN_SKIN`'s, fading to the dark within a few
 * tenths of the radius so the round's tally below still stands on nothing.
 */
export function drawGaugeShip(ctx: CanvasRenderingContext2D, dial: Dial, width: number): void {
  const { cx, cy, r } = dial;
  const half = Math.max(width / 2, r) + 8;
  const pts: Point[] = [];
  for (let i = 0; i <= 48; i++) {
    const x = cx - half + (2 * half * i) / 48;
    const u = Math.abs(x - cx) / (r * SHOULDER);
    const bump = u >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * u));
    const fall = ((x - cx) / half) ** 2;
    pts.push({ x, y: cy + r * LIFT * (1 - bump) + r * SAG * fall });
  }
  const skin = splinePath(pts, false);
  const body = new Path2D(skin);
  body.lineTo(cx + half, cy + r * (LIFT + SAG + DEPTH));
  body.lineTo(cx - half, cy + r * (LIFT + SAG + DEPTH));
  body.closePath();

  const [bright, mid, deep] = OWN_SKIN.body;
  const fill = ctx.createLinearGradient(0, cy, 0, cy + r * (LIFT + SAG + DEPTH));
  fill.addColorStop(0, rgba(bright, 0.55));
  fill.addColorStop(0.3, rgba(mid, 0.5));
  fill.addColorStop(0.65, rgba(deep, 0.35));
  fill.addColorStop(1, rgba(PALETTE.background, 0));
  ctx.fillStyle = fill;
  ctx.fill(body);
  strokeGlow(ctx, skin, OWN_SKIN.rim, 2.4, 1);
}

/**
 * The claw, rooted in the crown and turned to where the needle is: two rails
 * and THE CLAW's own open fingers (`reach-arm.ts`), in that arm's proportions
 * with the rise standing in for a tile — the same shares the REACH button
 * takes (`action-face.ts`).
 */
export function drawGaugeClaw(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  needleMilli: number,
): void {
  const rise = dial.r * RISE;
  const half = Math.max(1, rise * ARM_SHAFT_TILES * 1.6);
  ctx.save();
  aimAt(ctx, dial, needleMilli);
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 2.6;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(side * half, rise * 0.1);
    ctx.lineTo(side * half, -rise);
    ctx.stroke();
  }
  drawClawFingers(ctx, 0, -rise, half, rise * ARM_FINGER_TILES * 1.6, false);
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
): void {
  const rise = dial.r * RISE;
  const from = rise + rise * ARM_FINGER_TILES * 1.6 + 6;
  ctx.save();
  aimAt(ctx, dial, needleMilli);
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.setLineDash([0.1, 9]);
  ctx.beginPath();
  ctx.moveTo(0, -from);
  ctx.lineTo(0, -dial.r * LINE_REACH);
  ctx.stroke();
  ctx.restore();
}

/**
 * The pod, standing still at the mark, its width across the claw's sweep. The
 * contour is the moored pod's (`POD`, `pods.ts`) held at one instant so the
 * width it is judged by does not breathe, and scaled on its own widest point
 * rather than on `rx`: the lobes stand past the ellipse, and a pod scaled on
 * the ellipse would be wider than the call it is standing for. No mark in the
 * middle — this is not a cargo of any kind, only where the claw has to be.
 */
export function drawGaugePod(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  markMilli: number,
  spanMilli: number,
  glow: number,
): void {
  const w = podHalfWidth(dial, spanMilli);
  const outline = blobPoints(0, 0, POD.rx, POD.ry, POD.lobes, POD.depth, 0, 0, POD.seed);
  const widest = Math.max(...outline.map((p) => Math.abs(p.x)));
  const scale = w / widest;
  const path = splinePath(outline, true);
  const at = dial.r * POD_REACH;
  const d = along(markMilli);

  halo(ctx, dial.cx + d.x * at, dial.cy + d.y * at, w * 2.2, PALETTE.pod, 0.12 + 0.1 * glow);
  ctx.save();
  aimAt(ctx, dial, markMilli);
  ctx.translate(0, -at);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.pod, Math.max(1.5, w * 0.12) / scale, 0.8 + 0.4 * glow);
  ctx.globalAlpha = 0.45 + 0.55 * glow;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, widest * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
