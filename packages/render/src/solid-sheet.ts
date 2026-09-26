import { litIn, type Seen, see, turn, unit, type Vec3, type View } from "@neon-spore/content";
import { rgba } from "./hex.js";
import type { Skin } from "./solid-tube-draw.js";

/**
 * A SHEET OF A RIG: skin stretched flat between bones — a wing's membrane, a
 * fin, a sail. One polygon in model space, seen as the view sees it and lit
 * by its own normal, so as the wing beats and turns its face to the key and
 * away again it brightens and goes dark on its own, with nothing animated.
 *
 * The normal is Newell's, which holds for a polygon a little out of plane,
 * and is turned to face the viewer before it is lit: a membrane is seen from
 * both sides, and thin enough that either side takes the light.
 *
 * Three fills, back to front: the skin's own colour, nearly opaque, so the
 * sheet covers what is behind it; its lit colour, by how square it is to the
 * key; and, given a `glow`, the light coming *through* it — the sheen at one
 * point going to the cool dark at another, the skin lit from behind near the
 * bones and shadowed toward the hem. A shadow is `#0B1024`, never black.
 */

const SHADOW = "#0B1024";

/** A sheet as the view sees it. */
export interface SeenSheet {
  readonly pts: readonly Seen[];
  /** How much of the key its viewer-facing side takes, 0..1. */
  readonly lit: number;
  /** Its mean depth, for the painter. */
  readonly z: number;
}

/** Newell's normal of a closed polygon, unit length. */
export function newell(points: readonly Vec3[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i] as Vec3;
    const b = points[(i + 1) % points.length] as Vec3;
    x += (a.y - b.y) * (a.z + b.z);
    y += (a.z - b.z) * (a.x + b.x);
    z += (a.x - b.x) * (a.y + b.y);
  }
  return unit({ x, y, z });
}

export function seeSheet(points: readonly Vec3[], w: View): SeenSheet {
  const n = newell(points);
  const toward = turn(n, w).z < 0 ? { x: -n.x, y: -n.y, z: -n.z } : n;
  const pts = points.map((p) => see(p, w));
  const z = pts.reduce((s, p) => s + p.z, 0) / Math.max(1, pts.length);
  return { pts, lit: litIn(toward, w), z };
}

export function sheetPath(s: SeenSheet): Path2D {
  const p = new Path2D();
  for (const [i, q] of s.pts.entries()) {
    if (i === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  }
  p.closePath();
  return p;
}

/** Where the light through a sheet comes in, and the hem it fades out at: indices into its points. */
export interface Glow {
  readonly from: number;
  readonly to: number;
}

/** Fill and light a seen sheet. Returns its outline, for whatever is clipped to it next. */
export function drawSheet(
  ctx: CanvasRenderingContext2D,
  s: SeenSheet,
  skin: Skin,
  alpha = 1,
  glow?: Glow,
): Path2D {
  const path = sheetPath(s);
  if (s.pts.length < 3 || alpha <= 0) return path;
  ctx.save();
  ctx.fillStyle = rgba(skin.base, 0.9 * alpha);
  ctx.fill(path);
  ctx.fillStyle = rgba(skin.lift, (0.06 + 0.34 * s.lit) * alpha);
  ctx.fill(path);
  const a = glow && s.pts[glow.from];
  const b = glow && s.pts[glow.to];
  if (a && b) {
    const through = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    through.addColorStop(0, rgba(skin.sheen, (0.18 + 0.2 * s.lit) * alpha));
    through.addColorStop(0.55, rgba(skin.lift, 0.08 * alpha));
    through.addColorStop(1, rgba(SHADOW, 0.5 * alpha));
    ctx.fillStyle = through;
    ctx.fill(path);
  }
  ctx.restore();
  return path;
}
