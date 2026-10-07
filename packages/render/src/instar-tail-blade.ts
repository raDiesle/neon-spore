import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { drawGlint } from "./instar-hide.js";
import type { Point } from "./instar-place.js";
import { faded, type Look, toward } from "./instar-plate.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE INSTAR's tail ends in a fork of two of these** (`instar-tail.ts`): a
 * fin of skin stretched over three bony rays, its free edge scalloped between
 * them and rippling, and a hooked barb of bone at the tip. The owner, 7 October
 * 2026: *improve the tail end visual to look more cool and natural living* —
 * it was two crescents of ground bone, which read as a pair of shears.
 *
 * The barb is where the old crescent's point was, so the mark a thumb chases
 * is still under it; the fin's outline is what a bolt meets (`bladePoints`).
 */

/** How far the fin bellies out from the line fork → tip, as a share of its length, and how far it ripples. */
const BELLY = 0.42;
const RIPPLE = 0.07;
const RIPPLE_RATE = 3.1;
/** Where along the fin its two inner rays reach the free edge. */
const RAYS = [0.38, 0.7] as const;

/** One fin of the fork, from `from` to its barb at `tip`; `s` is the side its back faces. */
export function drawBlade(
  ctx: CanvasRenderingContext2D,
  from: Point,
  tip: Point,
  s: number,
  look: Look,
) {
  const { r, fade, threat, time } = look;
  const fin = finShape(from, tip, s, r, time);
  const p = new Path2D();
  const [first, ...rest] = fin.outline;
  p.moveTo((first as Point).x, (first as Point).y);
  for (const q of rest) p.lineTo(q.x, q.y);
  p.closePath();
  ctx.save();
  // Skin with the light through it: dense at the root, thin and lit toward the edge.
  const g = ctx.createLinearGradient(from.x, from.y, fin.edge.x, fin.edge.y);
  g.addColorStop(0, rgba(PALETTE.sheenDeep, 0.95 * fade));
  g.addColorStop(0.55, rgba(PALETTE.hull, 0.6 * fade));
  g.addColorStop(1, rgba(PALETTE.hullRim, 0.35 * fade));
  ctx.fillStyle = g;
  ctx.fill(p);
  // The rays: bone from the root out to the edge, one path for all three.
  const rays = new Path2D();
  for (const end of fin.rays) {
    const bend = toward(toward(from, end, 0.5), fin.edge, 0.12);
    rays.moveTo(from.x, from.y);
    rays.quadraticCurveTo(bend.x, bend.y, end.x, end.y);
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = faded(PALETTE.rockDark, fade);
  ctx.lineWidth = r * 0.05;
  ctx.stroke(rays);
  ctx.strokeStyle = faded(PALETTE.rock, fade, 0.7);
  ctx.lineWidth = r * 0.018;
  ctx.stroke(rays);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.sheenRim, fade), STROKE.inner, 0.35 * fade);
  drawBarb(ctx, fin, r, fade);
  drawGlint(ctx, toward(from, tip, 0.85), r * 0.025, fade, 0.6);
  if (threat > 0) strokeGlow(ctx, p, faded(PALETTE.red, fade), STROKE.outline, threat * fade);
}

/** The barb at the tip: a hook of bone curling back over the fin's edge. */
function drawBarb(
  ctx: CanvasRenderingContext2D,
  fin: ReturnType<typeof finShape>,
  r: number,
  fade: number,
): void {
  const { tip, along, out } = fin;
  const w = r * 0.09;
  const root = { x: tip.x - along.x * r * 0.4, y: tip.y - along.y * r * 0.4 };
  const hook = {
    x: tip.x + out.x * r * 0.2 - along.x * r * 0.05,
    y: tip.y + out.y * r * 0.2 - along.y * r * 0.05,
  };
  ctx.save();
  ctx.fillStyle = faded(PALETTE.rockDark, fade);
  ctx.beginPath();
  ctx.moveTo(root.x + out.x * w, root.y + out.y * w);
  ctx.quadraticCurveTo(tip.x + out.x * w, tip.y + out.y * w, hook.x, hook.y);
  ctx.quadraticCurveTo(
    tip.x - out.x * w * 0.3,
    tip.y - out.y * w * 0.3,
    root.x - out.x * w,
    root.y - out.y * w,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = faded(PALETTE.rock, fade, 0.8);
  ctx.lineWidth = Math.max(0.6, w * 0.3);
  ctx.beginPath();
  ctx.moveTo(root.x + out.x * w * 0.6, root.y + out.y * w * 0.6);
  ctx.quadraticCurveTo(tip.x + out.x * w * 0.7, tip.y + out.y * w * 0.7, hook.x, hook.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * The fin from `from` to `tip` this frame: its outline — the root, out along
 * the scalloped free edge through the ends of its rays to the barb, and back
 * down the straight leading edge — the rays' ends, and the frame it is laid in.
 * Out, away from the other fin, is its back.
 */
function finShape(from: Point, tip: Point, s: number, r: number, time: number) {
  const len = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  const along = { x: (tip.x - from.x) / len, y: (tip.y - from.y) / len };
  const out = { x: s * along.y, y: -s * along.x };
  const at = (u: number, o: number): Point => ({
    x: from.x + along.x * len * u + out.x * len * o,
    y: from.y + along.y * len * u + out.y * len * o,
  });
  // The free edge bellies out between the root and the barb, and ripples down its length.
  const edgeAt = (u: number): number =>
    Math.sin(Math.PI * u) ** 0.8 * (BELLY + RIPPLE * Math.sin(time * RIPPLE_RATE - u * 5 + s));
  const rays = [...RAYS.map((u) => at(u, edgeAt(u))), tip];
  const outline: Point[] = [{ x: from.x - out.x * r * 0.08, y: from.y - out.y * r * 0.08 }];
  let last = 0;
  for (const u of [...RAYS, 1]) {
    // Between two rays the skin sags in toward the leading edge.
    for (const k of [0.25, 0.5, 0.75]) {
      const v = last + (u - last) * k;
      outline.push(at(v, edgeAt(v) * (1 - 0.22 * Math.sin(Math.PI * k))));
    }
    outline.push(u === 1 ? tip : at(u, edgeAt(u)));
    last = u;
  }
  // The leading edge, bowed a little the other way.
  for (const u of [0.75, 0.5, 0.25]) outline.push(at(u, -0.06 * Math.sin(Math.PI * u)));
  outline.push({ x: from.x + out.x * r * 0.04, y: from.y + out.y * r * 0.04 });
  return { outline, rays, tip, along, out, edge: at(0.5, BELLY) };
}

/** The fin's outline this frame — where a bolt meets it (`instar-limb-stop.ts`). */
export function bladePoints(from: Point, tip: Point, s: number, r: number, time = 0): Point[] {
  return finShape(from, tip, s, r, time).outline;
}
