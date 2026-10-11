import { KEY, type Point } from "@neon-spore/content";
import { centre, type GooBody, rimAt, smoothPath } from "./goo-body.js";
import { mix } from "./goo-noise.js";
import type { GooStyle } from "./goo-style.js";
import { PALETTE } from "./palette.js";

/**
 * **The way to pull, moulded into a soft drop** — the owner, 11 October 2026,
 * on SOFT PLASTIC: *make the arrow looking not so geometrical, but follow the
 * rotating unequal rounded shape of the button*, and *make sure the arrow does
 * not overlap with the borders … smaller and reduce some of vertical
 * movement*. So it is one filled outline rather than three strokes: a shaft
 * that thickens into a fat rounded head, every point of it laid onto the
 * drop's own rim (`rimAt`) — its lumps, their turn, its squash and lean — so
 * it bulges and gives as the drop does, and stays well inside the neon edge.
 * It slides along itself only a little, and sinks a little as it is pressed.
 */

/** One arrow before it is laid on the drop: its middle, its radius and its way. */
export interface ArrowAt {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly dx: number;
  readonly dy: number;
}

/** How long the arrow is as a share of the drop's radius, held and not, and how far it
 * slides along itself. */
export const SOFT_REACH = 0.84;
export const SOFT_HELD = 0.76;
export const SOFT_SLIDE = 0.04;

/** The outline, along the way (`u`) and across it (`v`), in the arrow's radius: tail,
 * shaft thickening to the neck, the two barbs, the tip. Smoothed when drawn, so every
 * corner comes out round. */
const OUTLINE: readonly (readonly [number, number])[] = [
  [-0.72, 0],
  [-0.66, 0.15],
  [-0.08, 0.2],
  [-0.14, 0.44],
  [0.0, 0.52],
  [0.64, 0.08],
  [0.72, 0],
  [0.64, -0.08],
  [0.0, -0.52],
  [-0.14, -0.44],
  [-0.08, -0.2],
  [-0.66, -0.15],
];

/** Points along each edge, so the drop's lumps bend the edges and not just the corners. */
const SPLIT = 4;

/** How much more the arrow takes the drop's lumps than its place in the drop would give
 * it, so the unevenness reads on something so much smaller than the rim. */
const TAKE = 1.9;

/** The outline of `w`, laid onto `body`'s rim: a point at angle `phi` and distance `d`
 * from the drop's middle lands where the rim at `phi` is, scaled by `d` over the radius,
 * its lumps taken `TAKE` times over. */
function moulded(w: ArrowAt, body: GooBody, style: GooStyle, time: number): Path2D {
  const c = centre(body);
  const ox = c.x - body.at.x;
  const oy = c.y - body.at.y;
  const smooth = { ...style, lumpy: 0 };
  const pts: Point[] = [];
  for (let i = 0; i < OUTLINE.length; i++) {
    const [u0, v0] = OUTLINE[i] as readonly [number, number];
    const [u1, v1] = OUTLINE[(i + 1) % OUTLINE.length] as readonly [number, number];
    for (let k = 0; k < SPLIT; k++) {
      const f = k / SPLIT;
      const u = (u0 + (u1 - u0) * f) * w.r;
      const v = (v0 + (v1 - v0) * f) * w.r;
      const x = w.x - body.at.x + w.dx * u - w.dy * v;
      const y = w.y - body.at.y + w.dy * u + w.dx * v;
      const phi = Math.atan2(y, x);
      const rim = rimAt(body, style, time, phi);
      const even = rimAt(body, smooth, time, phi);
      const lump = 1 + TAKE * (Math.hypot(rim.x, rim.y) / Math.hypot(even.x, even.y) - 1);
      const out = (Math.hypot(x, y) / body.r) * lump;
      pts.push({ x: body.at.x + ox + even.x * out, y: body.at.y + oy + even.y * out });
    }
  }
  return smoothPath(pts);
}

/** The arrows of a pull, moulded into `body`: a dark bed under them, a soft neon round
 * them, and a satin face lit from the top left like the drop itself. */
export function paintSoftArrows(
  ctx: CanvasRenderingContext2D,
  arrows: readonly ArrowAt[],
  o: { body: GooBody; style: GooStyle; time: number; neon: string; alpha: number },
): void {
  const { body, style, time, neon, alpha } = o;
  ctx.save();
  ctx.lineJoin = "round";
  for (const w of arrows) {
    if (w.r <= 0.05) continue;
    const p = moulded(w, body, style, time);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = PALETTE.background;
    ctx.strokeStyle = PALETTE.background;
    ctx.globalAlpha = 0.7 * alpha;
    ctx.lineWidth = w.r * 0.2;
    ctx.stroke(p);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = neon;
    ctx.globalAlpha = 0.4 * alpha;
    ctx.lineWidth = w.r * 0.14;
    ctx.stroke(p);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(
      w.x + KEY.x * w.r * 0.5,
      w.y + KEY.y * w.r * 0.5,
      w.x - KEY.x * w.r * 0.5,
      w.y - KEY.y * w.r * 0.5,
    );
    g.addColorStop(0, mix(neon, "#FFFFFF", 0.85));
    g.addColorStop(1, mix(neon, "#FFFFFF", 0.45));
    ctx.fillStyle = g;
    ctx.globalAlpha = alpha;
    ctx.fill(p);
  }
  ctx.restore();
}
