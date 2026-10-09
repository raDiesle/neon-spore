import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawSurgeSeam, type SeamDraw } from "./surge-gauge.js";
import { surgeSeamEnds } from "./surge-shape.js";
import { showsSurgePressure } from "./view-role-clocks.js";

/** How far each lip stands off the seam at the burst, as a share of the
 * half-height. Opened by the square root of the pressure, so the first
 * notch's band — low on the gauge — is already a mouth and not a sliver. */
const GAPE = 0.42;

/**
 * The seam parted by the pressure, on the screen that is shown it: two lips
 * drawn apart round a dark opening that glows from inside as the charge
 * climbs — the design's *a single number drawn as a gap* (§9). On the
 * pilot's screen it is the shipped line, because a seam that opened there
 * would be the pressure he is not shown; the body swells on hers alone for
 * the same reason (`surge-draw.ts`).
 */
export function paintGapingSeam(d: SeamDraw): void {
  const { ctx, l, c, rx, ry, pressure, time } = d;
  if (d.everting || pressure <= 0 || !showsSurgePressure(l.role)) {
    drawSurgeSeam(d);
    return;
  }
  const { left, right } = surgeSeamEnds(c, rx);
  const sag = ry * 0.12;
  const g = ry * GAPE * Math.sqrt(pressure) * (1 + 0.08 * Math.sin(time * 7));
  const upper = new Path2D();
  upper.moveTo(left, c.y);
  upper.quadraticCurveTo(c.x, c.y + sag - g * 2, right, c.y);
  const lower = new Path2D();
  lower.moveTo(left, c.y);
  lower.quadraticCurveTo(c.x, c.y + sag + g * 2, right, c.y);
  const mouth = new Path2D();
  mouth.moveTo(left, c.y);
  mouth.quadraticCurveTo(c.x, c.y + sag - g * 2, right, c.y);
  mouth.quadraticCurveTo(c.x, c.y + sag + g * 2, left, c.y);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.background, 0.92);
  ctx.fill(mouth);
  ctx.clip(mouth);
  // The inside, lit hotter the nearer the burst.
  const glow = ctx.createRadialGradient(c.x, c.y + sag, 0, c.x, c.y + sag, rx * 0.8);
  glow.addColorStop(0, rgba(PALETTE.hullRim, 0.25 + 0.55 * pressure));
  glow.addColorStop(1, rgba(PALETTE.hull, 0));
  ctx.fillStyle = glow;
  ctx.fill(mouth);
  ctx.restore();
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.55 + 0.4 * pressure);
  ctx.lineWidth = STROKE.outline * 1.2;
  ctx.stroke(upper);
  ctx.stroke(lower);
  ctx.restore();
}
