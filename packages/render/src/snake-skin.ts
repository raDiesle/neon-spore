import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { PALETTE } from "./palette.js";
import type { Arena } from "./snake-draw.js";

/**
 * What the body is made of: its contour, its light and its scales.
 *
 * The owner sent a drawing of a python — a gradient down the back, a diamond
 * skin, a shadow on the ground under it — and asked for that in the round
 * rather than beside it. **Most of that drawing cannot survive here**: the
 * head is about thirty pixels long on a phone against a hundred and twenty in
 * the reference, so its palate ridges and heat pits arrive as grey mud. What
 * does survive is the part that works on a *shape* rather than on a detail:
 * light coming from one direction, a ground shadow, and a texture coarse
 * enough to be a tile's own size. That is what is here.
 *
 * **The light is the arena's, not the body's.** One gradient down the whole
 * arena, cached by layout, and every part of the body reads out of it wherever
 * it happens to be lying. A gradient across each segment would be truer to the
 * drawing and would also make a body that changed colour when it turned a
 * corner, which is the opposite of reading as one animal.
 *
 * The colours stay the ship's — cyan down the length, violet at the head
 * (`snake-draw.ts` on why green is not available). Stateless like everything
 * else that draws here: the only thing that outlives a frame is the gradient
 * slot, which is keyed on the layout and rebuilt when it changes.
 */

/** The width of the body at the head and at the very end of the tail. */
export const HEAD_HALF = 0.4;
export const TAIL_HALF = 0.13;

/** How far the lit ribbon is pushed towards the light, as a share of the
 * body's half-width. Far enough to read as a round back, near enough that the
 * dark side is still a side rather than an outline. */
const LIT_OFFSET = 0.34;

export interface Point {
  x: number;
  y: number;
}

const backSlot = gradientSlot<CanvasGradient>();

/**
 * The light on the arena: brighter at the top edge, falling to the bottom.
 * Layout-only, so the slot holds it from the second frame on.
 */
export function backGradient(ctx: CanvasRenderingContext2D, arena: Arena): CanvasGradient {
  const h = arena.tile * arena.rows;
  return slotGradient(ctx, backSlot, `${arena.y},${h}`, () => {
    const g = ctx.createLinearGradient(0, arena.y, 0, arena.y + h);
    g.addColorStop(0, "#1B5468");
    g.addColorStop(0.55, "#123C4C");
    g.addColorStop(1, "#0A2530");
    return g;
  });
}

/**
 * Both sides of a tapered ribbon along `joints`, `halfAt(i)` wide at each one.
 *
 * Pulled out of `drawLength` because the lit ribbon is the same contour at a
 * smaller width — two copies of this loop would be two chances for the
 * highlight to stop following the body it is meant to be lying on.
 */
export function ribbonSides(
  joints: Point[],
  halfAt: (i: number) => number,
): { left: Point[]; right: Point[] } {
  const left: Point[] = [];
  const right: Point[] = [];
  for (const [i, p] of joints.entries()) {
    const prev = joints[i - 1] ?? p;
    const next = joints[i + 1] ?? p;
    // The normal of the direction the body runs in here, which for a corner is
    // the average of the two sides — that is what rounds a turn off.
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -(dy / len) * halfAt(i);
    const ny = (dx / len) * halfAt(i);
    left.push({ x: p.x + nx, y: p.y + ny });
    right.push({ x: p.x - nx, y: p.y - ny });
  }
  return { left, right };
}

/** The contour those two sides close into, ending in a point at the tail. */
export function traceRibbon(
  ctx: CanvasRenderingContext2D,
  joints: Point[],
  sides: ReturnType<typeof ribbonSides>,
): void {
  const { left, right } = sides;
  ctx.beginPath();
  ctx.moveTo(left[0]?.x ?? 0, left[0]?.y ?? 0);
  for (const p of left.slice(1)) ctx.lineTo(p.x, p.y);
  const end = joints[joints.length - 1];
  if (end) ctx.lineTo(end.x, end.y);
  for (const p of right.slice(0, -1).reverse()) ctx.lineTo(p.x, p.y);
  ctx.closePath();
}

/**
 * A shadow on the floor under whatever is filled next.
 *
 * The single biggest thing the reference does that this round did not: the
 * body sat *in* the grid rather than over it, and a shape with nothing under
 * it reads as a hole. Offset down and right, matching the light this file
 * puts at the top of the arena.
 */
export function castShadow(ctx: CanvasRenderingContext2D, arena: Arena): void {
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = arena.tile * 0.22;
  ctx.shadowOffsetX = arena.tile * 0.08;
  ctx.shadowOffsetY = arena.tile * 0.12;
}

export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * The lit side of the back: the same ribbon at a third of the width, pushed
 * towards the light. It is drawn inside a clip of the full contour, so a turn
 * that swings it off the body crops rather than smears.
 */
export function litRibbon(
  ctx: CanvasRenderingContext2D,
  joints: Point[],
  halfAt: (i: number) => number,
): void {
  // **Across the body, never along it.** The first attempt lifted the ribbon
  // straight up the screen, which on a body running vertically — the state
  // this round spends most of its time in — slid the highlight along its own
  // length and showed nothing at all. So it moves along the *normal*, and the
  // normal is flipped to whichever of its two directions faces the light.
  const lifted = joints.map((p, i) => {
    const prev = joints[i - 1] ?? p;
    const next = joints[i + 1] ?? p;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -(dy / len);
    let ny = dx / len;
    // Up if it can be; for a body running straight up and down both normals
    // are level, and the tie goes to the left so the lit side never swaps
    // from one frame to the next.
    if (ny > 0 || (ny === 0 && nx > 0)) {
      nx = -nx;
      ny = -ny;
    }
    const off = halfAt(i) * LIT_OFFSET;
    return { x: p.x + nx * off, y: p.y + ny * off };
  });
  // Three passes rather than one. A single ribbon at a single alpha put a hard
  // crease down the back — an edge is exactly what a round thing does not
  // have — and a gradient cannot be laid across a shape that turns corners.
  // Nested widths at a low alpha stack into a falloff instead, which is the
  // same trick `glow.ts` uses on the hull for the same reason.
  for (const width of [0.62, 0.42, 0.24]) {
    const sides = ribbonSides(lifted, (i) => halfAt(i) * width);
    traceRibbon(ctx, lifted, sides);
    ctx.fillStyle = "rgba(191,246,255,.07)";
    ctx.fill();
  }
}

/**
 * The skin: rows of scales across the body, coarse enough to be seen.
 *
 * The reference tiles a twenty-unit diamond, which at this arena's tile would
 * be four diamonds across the widest part of the body and none of them a whole
 * pixel of edge. So a scale here is a *tile-sized* thing — three across the
 * back, one row a segment — and it stops before the tail, where the body is
 * too narrow to carry any texture at all.
 */
export function drawScales(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  joints: Point[],
  halfAt: (i: number) => number,
): void {
  ctx.strokeStyle = "rgba(4,26,34,.5)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  // **A row every third of a tile, not a row a joint.** A joint is a whole
  // tile apart and the body is three of them when a round opens, so a texture
  // hung off the joints put two rows on a whole snake. This walks the length
  // at its own spacing and reads the width off the fractional joint it is
  // between, which is the same taper the contour was built from.
  const step = arena.tile * 0.34;
  for (let i = 0; i + 1 < joints.length; i++) {
    const a = joints[i];
    const b = joints[i + 1];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const span = Math.hypot(dx, dy);
    if (span < 1) continue;
    const ux = dx / span;
    const uy = dy / span;
    const angle = Math.atan2(dy, dx);
    for (let d = step / 2; d < span; d += step) {
      const t = d / span;
      const half = halfAt(i) + (halfAt(i + 1) - halfAt(i)) * t;
      if (half < arena.tile * 0.16) continue;
      const px = a.x + dx * t;
      const py = a.y + dy * t;
      for (const across of [-0.5, 0.5]) {
        const cx = px - uy * half * across;
        const cy = py + ux * half * across;
        const r = half * 0.38;
        ctx.moveTo(cx - ux * r, cy - uy * r);
        ctx.arc(cx, cy, r, angle + Math.PI, angle);
      }
    }
  }
  ctx.stroke();
}

/** The rim light along the body's edge, over the fill and under the spine. */
export function rimStroke(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = PALETTE.shield;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}
