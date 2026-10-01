import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { type LampreyPose, lampreyToothAt } from "./lamprey-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE LAMPREY's marks**: what says which thumb goes where. **The jaw's
 * band** is a flat ellipse on the hull under the mouth, as wide as the grip
 * reaches either side of it, so the pinner can see how far a thumb may lag
 * the crawl. **The tooth's ring** is round the one lit tooth, with the
 * window running down round it. Each breathes on its beat on the screen of
 * the seat it asks and is only faint on the other's, in the hull rim's
 * white: the only cannon's colour on the eel is the gullet
 * (`lamprey-draw.ts`).
 */

/** How faint the other seat's mark is. */
const OTHER = 0.3;
/** How tall the jaw's band is on the hull, in tiles. */
const BAND = 0.32;
/** The tooth's ring, in mouth radii, and how far out its window runs. */
const RING = 0.3;
const WINDOW = 0.42;

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

/** The jaw's band on the hull, `grip` columns either side of the mouth. */
export function drawLampreyJawMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  grip: number,
  full: boolean,
  beatPhase: number,
): void {
  const band = new Path2D();
  band.ellipse(x, l.hullY, (grip + 0.5) * l.tile, BAND * l.tile, 0, 0, Math.PI * 2);
  lightMark(ctx, band, full, beatPhase);
}

/**
 * The ring round the lit tooth. `full` is the tapper's screen: it breathes,
 * and an arc outside it runs down with the tooth's window, `left` of it.
 */
export function drawLampreyToothMark(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  tooth: number,
  left: number,
  full: boolean,
  beatPhase: number,
): void {
  const at = lampreyToothAt(p, tooth);
  const ring = new Path2D();
  ring.ellipse(at.x, at.y, p.r * RING, p.r * RING * (0.5 + 0.5 * p.tilt), 0, 0, Math.PI * 2);
  lightMark(ctx, ring, full, beatPhase);
  if (!full || left <= 0) return;
  const arc = new Path2D();
  const n = 32;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (Math.PI * 2 * left * i) / n;
    const x = at.x + p.r * WINDOW * Math.cos(a);
    const y = at.y + p.r * WINDOW * (0.5 + 0.5 * p.tilt) * Math.sin(a);
    if (i === 0) arc.moveTo(x, y);
    else arc.lineTo(x, y);
  }
  strokeGlowFaded(ctx, arc, PALETTE.hullRim, STROKE.inner, 0.55, 1);
}
