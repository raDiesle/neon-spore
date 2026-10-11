import type { Point } from "@neon-spore/content";
import { lengthOf } from "./goo-beat.js";
import { fbm } from "./goo-noise.js";
import { PALETTE } from "./palette.js";
import { type PullTrack, pullTrackPoint } from "./pull-track.js";

/**
 * **The edge of the tolerance, only where the drop touches it.** The owner,
 * 10 October 2026, on OFF PATH · FAILS PAST ½ TILE: *i like to show red
 * border when ball is touching it, but remove the dotted lanes left and
 * right.* So there are no walls along the path and no line down its middle:
 * a short red edge comes up beside the drop on the side it has strayed to as
 * its rim nears the limit, and flares where it was let go when it crosses.
 */

/**
 * A red edge `reach + r` out from the middle, on the side of `off`, a few
 * drops long round `k` along the track, `alpha` strong — uneven, as goo is,
 * and fading out at its two ends.
 */
export function edge(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  k: number,
  off: Point,
  reach: number,
  r: number,
  alpha: number,
  time: number,
): void {
  if (alpha <= 0.01) return;
  const q0 = pullTrackPoint(t, k);
  const side = -off.x * q0.dy + off.y * q0.dx >= 0 ? 1 : -1;
  const len = lengthOf(t) || 1;
  const half = (r * 2.4) / len;
  const n = 18;
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const q = pullTrackPoint(t, k - half + 2 * half * u);
    const d = (reach + r) * side * (1 + 0.05 * fbm(u * 3 + time * 0.8, 4));
    pts.push({ x: q.x - q.dy * d, y: q.y + q.dx * d });
  }
  ctx.save();
  // Butt ends: round ones overlap on every joint and, added on, bead the line.
  ctx.lineCap = "butt";
  for (let i = 1; i <= n; i++) {
    const a = pts[i - 1] as Point;
    const b = pts[i] as Point;
    const fade = Math.sin(((i - 0.5) / n) * Math.PI) * alpha;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = PALETTE.red;
    ctx.globalAlpha = 0.25 * fade;
    ctx.lineWidth = r * 0.6;
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = fade;
    ctx.lineWidth = r * 0.16;
    ctx.stroke();
    ctx.strokeStyle = PALETTE.redRim;
    ctx.globalAlpha = 0.8 * fade;
    ctx.lineWidth = r * 0.05;
    ctx.stroke();
  }
  ctx.restore();
}
