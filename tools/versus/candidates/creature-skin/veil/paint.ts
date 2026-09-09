import { KEY } from "../../../../../packages/content/src/index.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { BodyPaint } from "../../../../../packages/render/src/living-skin.js";

/**
 * The paint VEIL is made of. Nothing here caches a frame, and nothing here
 * invents a light angle: `KEY` is imported and then *undone* by the rotation
 * the transform already carries, so a turning body turns under a light that
 * stays put.
 */

/** How far in from the rim the glow reaches, as a share of the contour's own
 * reach. Under about a third it is a second outline; over about a half the
 * body has no dark middle left and the whole claim is gone. */
const REACH_IN = 0.42;

/** How bright the rim is where the membrane is thickest. */
const INNER = 0.55;

/** How far the gradient's centre is pushed toward the light, as a share of
 * reach. This is the whole of the three-dimensional read: the band is thin
 * where the surface faces the light and thick where it turns away, which is
 * what a rounded translucent shell does. */
const OFFSET = 0.3;

export function veil(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  rule: CanvasFillRule,
  p: BodyPaint,
): void {
  const reach = Math.max(p.rx, p.ry);
  ctx.fillStyle = p.dark;
  ctx.fill(path, rule);

  // `KEY` in body space: the transform carries `rot`, so the field's own light
  // direction has to be turned back by it.
  const cos = Math.cos(-p.rot);
  const sin = Math.sin(-p.rot);
  const kx = KEY.x * cos - KEY.y * sin;
  const ky = KEY.x * sin + KEY.y * cos;
  const cx = kx * reach * OFFSET;
  const cy = ky * reach * OFFSET;

  const bleed = ctx.createRadialGradient(cx, cy, reach * (1 - REACH_IN), cx, cy, reach * 1.15);
  bleed.addColorStop(0, rgba(p.hex, 0));
  bleed.addColorStop(0.62, rgba(p.hex, INNER * 0.3));
  bleed.addColorStop(1, rgba(p.rim, INNER));

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = bleed;
  ctx.fill(path, rule);
  ctx.restore();

  strokeGlow(ctx, path, p.hex, Math.max(1, p.r * 0.1) / p.scale, 1);
}
