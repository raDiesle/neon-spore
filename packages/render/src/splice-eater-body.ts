import { SAC_SKIN, sacPoints } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { drawEaterHead } from "./splice-eater-head.js";
import { splinePath } from "./spline.js";

/**
 * THE SPLICE eater's body (`splice-eater.ts` says when and where): something
 * inside the hold's right wall that has **broken through it twice** — its head
 * near the top, on a neck, and the back end of its body lower down (the owner,
 * 25 September 2026: *the head broke through the side, and the bottom of the
 * body through more bottom down; it eats the ball and pees out of its back,
 * poisoning the ship*).
 *
 * Both are the shape sheet's **TENDRIL** laid on its side and stretched to a
 * length rather than moved, so neither comes loose from the wall it is in. The
 * neck starts in the wall's own purple and turns red on its way to the head
 * (`splice-eater-head.ts`); torn flaps of wall lie over both roots, so they
 * read as coming through the ship rather than lying on it.
 */

/** The TENDRIL draft's numbers (`tools/shape-sheet/src/drafts/creatures.ts`). */
const BIAS = 0.34;
const RX = 24;
const RY = 66;
/** Where its ends fall in those units, from `sacPoints`'s bias; the fat end is the far one. */
const TOP = RY * (1 - BIAS);
const SPAN = RY * (1 + BIAS) + TOP;

export interface EaterPose {
  /** From the wall to the middle of the head, in pixels. */
  len: number;
  /** Across the head, in pixels. */
  wide: number;
  /** How far the head hangs below its root. */
  sag: number;
  /** 0 shut, 1 gaping. */
  open: number;
  /** 0 to 1: how long the drool is, and how often it drips. */
  hunger: number;
  /** Where the eyes look. */
  look: { x: number; y: number };
}

/** A TENDRIL out of the wall at `x, y`, lying leftward, `thick` across. */
function tendril(
  x: number,
  y: number,
  len: number,
  thick: number,
  sag: number,
  b: number,
): { path: Path2D; along: (f: number) => { x: number; y: number } } {
  const along = (f: number) => ({ x: x - f * len, y: y + sag * f * f });
  const ky = thick / (RX * 2);
  const pts = sacPoints(b * 0.3, BIAS, RX, RY, SAC_SKIN, 32).map((p) => {
    const a = along(1 - (p.y + TOP) / SPAN);
    return { x: a.x, y: a.y + p.x * ky };
  });
  return { path: splinePath(pts, true), along };
}

/** Wall colour at the root, the creature's own at the far end. */
function skin(ctx: CanvasRenderingContext2D, x: number, len: number, end: string): CanvasGradient {
  const g = ctx.createLinearGradient(x, 0, x - len, 0);
  g.addColorStop(0, PALETTE.sheenDeep);
  g.addColorStop(0.18, rgba(PALETTE.sheenMid, 0.8));
  g.addColorStop(0.55, PALETTE.sheenWarm);
  g.addColorStop(1, end);
  return g;
}

/**
 * Torn flaps of wall round a root, curling out over it. `r` is the hole's
 * half-height; the flaps are fixed, because a hole does not heal on the beat.
 */
export function drawTornLip(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = rgba(PALETTE.sheenMid, 0.85);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.45);
  ctx.lineWidth = Math.max(0.8, r * 0.06);
  for (const [a, len, w] of [
    [-1.9, 0.55, 0.32],
    [-2.6, 0.4, 0.26],
    [2.5, 0.5, 0.3],
    [1.8, 0.42, 0.24],
    [3.1, 0.3, 0.2],
  ] as const) {
    const bx = x + Math.cos(a) * r * 0.9;
    const by = y + Math.sin(a) * r;
    const tx = x + Math.cos(a) * r * (0.9 + len);
    const ty = y + Math.sin(a) * r * (1 + len * 0.6);
    const nx = -Math.sin(a) * r * w;
    const ny = Math.cos(a) * r * w;
    ctx.beginPath();
    ctx.moveTo(bx - nx, by - ny);
    ctx.lineTo(tx, ty);
    ctx.lineTo(bx + nx, by + ny);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

/** The head on its neck, out of the wall at `x, y`. Returns the mouth. */
export function drawEaterBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pose: EaterPose,
  b: number,
): { x: number; y: number } {
  const { len, wide, sag } = pose;
  const neck = tendril(x, y, len, wide * 0.5, sag, b);
  ctx.fillStyle = skin(ctx, x, len, PALETTE.red);
  ctx.fill(neck.path);
  // Folds across the neck, where it bends.
  ctx.strokeStyle = rgba(PALETTE.redDark, 0.35);
  ctx.lineWidth = Math.max(0.8, wide * 0.02);
  ctx.beginPath();
  for (let f = 0.25; f < 0.8; f += 0.13) {
    const a = neck.along(f);
    ctx.moveTo(a.x, a.y - wide * 0.14);
    ctx.quadraticCurveTo(a.x - wide * 0.05, a.y, a.x, a.y + wide * 0.14);
  }
  ctx.stroke();
  drawTornLip(ctx, x, y, wide * 0.36);
  return drawEaterHead(ctx, neck.along(1), wide, pose.open, pose.hunger, pose.look, b);
}

/**
 * The back end, out of the lower hole: a TENDRIL whose fat end is a swollen
 * sac with a vent in it. `swell` 0 to 1 is what it has swallowed coming down
 * to it. Returns the vent, which is where the poison comes out.
 */
export function drawEaterRear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  swell: number,
  b: number,
): { x: number; y: number } {
  const len = t * (1.6 + 0.2 * swell);
  const thick = t * (0.95 + 0.35 * swell);
  const body = tendril(x, y, len, thick, t * 0.15, b);
  ctx.fillStyle = skin(ctx, x, len, rgba(PALETTE.red, 0.9));
  ctx.fill(body.path);
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.4);
  ctx.lineWidth = Math.max(1, t * 0.04);
  ctx.stroke(body.path);
  // Segments across the sac, the green of what is in it showing through.
  ctx.strokeStyle = rgba(PALETTE.redDark, 0.4);
  ctx.beginPath();
  for (const f of [0.45, 0.62, 0.78]) {
    const a = body.along(f);
    ctx.moveTo(a.x, a.y - thick * 0.4);
    ctx.quadraticCurveTo(a.x - t * 0.08, a.y, a.x, a.y + thick * 0.4);
  }
  ctx.stroke();
  const v = body.along(0.93);
  if (swell > 0) {
    const g = ctx.createRadialGradient(v.x + t * 0.2, v.y, 0, v.x + t * 0.2, v.y, thick * 0.6);
    g.addColorStop(0, rgba(PALETTE.venom, 0.7 * swell));
    g.addColorStop(1, rgba(PALETTE.venom, 0));
    ctx.fillStyle = g;
    ctx.fill(body.path);
  }
  // The vent, puckered, and open while it pours.
  ctx.beginPath();
  ctx.ellipse(v.x, v.y, t * (0.05 + 0.05 * swell), t * (0.08 + 0.1 * swell), 0, 0, Math.PI * 2);
  ctx.fillStyle = swell > 0.5 ? PALETTE.venomDeep : PALETTE.redDark;
  ctx.fill();
  drawTornLip(ctx, x, y, thick * 0.5);
  return v;
}
