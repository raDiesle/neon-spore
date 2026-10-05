import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { type LampreyPose, lampreyToothAt } from "./lamprey-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE LAMPREY's tooth mark**: the ring round the one lit tooth in a
 * `teeth`. It breathes on its beat on the worker's screen and is only faint
 * on the holder's, in the hull rim's white: the only cannon's colour on the
 * eel is the gullet (`lamprey-draw.ts`). The time left is THE SLOW's own
 * clock, not the mark's; the tail and the head are knobs
 * (`lamprey-handles.ts`).
 */

/** How faint the other seat's mark is. */
const OTHER = 0.3;
/** The tooth's ring, in mouth radii. */
const RING = 0.3;

/** The breath of a full mark on its beat. */
const pulseOf = (beatPhase: number): number => 0.65 + 0.35 * Math.cos(beatPhase * Math.PI * 2);

/** A mark's path, full on the seat it asks and faint on the other's. */
function lightMark(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  full: boolean,
  beatPhase: number,
): void {
  if (!full) {
    ctx.fillStyle = rgba(PALETTE.hullRim, OTHER * 0.4);
    ctx.fill(path);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
    ctx.stroke(path);
    return;
  }
  const pulse = pulseOf(beatPhase);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.3 * pulse);
  ctx.fill(path);
  strokeGlowFaded(ctx, path, PALETTE.hullRim, STROKE.inner, pulse, 1);
}

/** The ring round the lit tooth: `full` on the worker's screen, where it breathes. */
export function drawLampreyToothMark(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  tooth: number,
  full: boolean,
  beatPhase: number,
): void {
  const at = lampreyToothAt(p, tooth);
  const ring = new Path2D();
  ring.ellipse(at.x, at.y, p.r * RING, p.r * RING * (0.5 + 0.5 * p.tilt), 0, 0, Math.PI * 2);
  lightMark(ctx, ring, full, beatPhase);
}
