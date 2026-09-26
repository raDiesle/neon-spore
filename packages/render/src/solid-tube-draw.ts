import type { SeenRing, Vec3 } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { SHADOW, type Skin, sectionGradient } from "./solid-tube-light.js";

export type { Skin } from "./solid-tube-light.js";

/**
 * A TUBE OF A RIG, DRAWN: the outline `seeTube` found, filled, and lit across
 * its width as the cylinder it is (`packages/content/src/solid-tube.ts`).
 *
 * The five zones of `tools/director/src/skins/light.ts`, and where each is:
 *
 * - **terminator** — where `ringLight` crosses into shadow; a stop falls on it
 *   because the samples in `KS` are dense round the middle;
 * - **specular** — the `sheen` stop where the section is square to the key;
 * - **reflected** — a cool stop just inside the dark edge, the light that
 *   came back off whatever the body is over;
 * - **rim** — `rimTube`, a thin additive line along the outline, brightest on
 *   the side away from the light where a rim reads as one;
 * - **contact** — not here: it is where one part bears on another, so it is
 *   the rig's to draw (`solid-haze.ts`).
 *
 * A shadow is `#0B1024`, never black. Nothing casts a shadow onto anything
 * else (`docs/spec/graphics.md`).
 */

const SEAM = 0.08;
const OUT = 0.3;
/** How far apart, in screen pixels, the rings a tube is shaded by may be. */
const STEP_PX = 6;

interface Pt {
  readonly x: number;
  readonly y: number;
}

/** The outline of a seen tube: one edge, round the far end, back, round the near. */
export function tubePath(rings: readonly SeenRing[]): Path2D {
  const p = new Path2D();
  const n = rings.length;
  if (n === 0) return p;
  const first = rings[0] as SeenRing;
  const last = rings[n - 1] as SeenRing;
  p.moveTo(first.left.x, first.left.y);
  for (let i = 1; i < n; i++)
    p.lineTo((rings[i] as SeenRing).left.x, (rings[i] as SeenRing).left.y);
  const ae = Math.atan2(last.e.y, last.e.x);
  p.arc(last.c.x, last.c.y, last.r, ae, ae - Math.PI, true);
  for (let i = n - 2; i >= 0; i--)
    p.lineTo((rings[i] as SeenRing).right.x, (rings[i] as SeenRing).right.y);
  const as = Math.atan2(first.e.y, first.e.x);
  p.arc(first.c.x, first.c.y, first.r, as + Math.PI, as, true);
  p.closePath();
  return p;
}

/** Fill and light a seen tube. Returns its outline, for whatever is clipped to it next. */
export function drawTube(
  ctx: CanvasRenderingContext2D,
  rings: readonly SeenRing[],
  skin: Skin,
  alpha = 1,
): Path2D {
  const outline = tubePath(rings);
  if (rings.length < 2 || alpha <= 0) return outline;
  ctx.save();
  ctx.fillStyle = rgba(skin.base, alpha);
  ctx.fill(outline);
  ctx.clip(outline);
  const fine = densify(rings);
  for (let i = 0; i < fine.length - 1; i++) {
    shadeSegment(ctx, fine[i] as SeenRing, fine[i + 1] as SeenRing, skin, alpha);
  }
  capLight(ctx, rings[0] as SeenRing, -1, skin, alpha);
  capLight(ctx, rings[rings.length - 1] as SeenRing, 1, skin, alpha);
  ctx.restore();
  return outline;
}

/**
 * Rings in between the authored ones, a few pixels apart on the screen: each
 * slice's gradient is sized to its own ring, so where the width changes fast
 * a coarse spine shows as steps along the outline.
 */
function densify(rings: readonly SeenRing[]): SeenRing[] {
  const out: SeenRing[] = [];
  for (let i = 0; i < rings.length - 1; i++) {
    const a = rings[i] as SeenRing;
    const b = rings[i + 1] as SeenRing;
    const gap = Math.hypot(b.c.x - a.c.x, b.c.y - a.c.y) + Math.abs(b.r - a.r) * 2;
    const n = Math.max(1, Math.min(8, Math.ceil(gap / STEP_PX)));
    for (let j = 0; j < n; j++) out.push(between(a, b, j / n));
  }
  out.push(rings[rings.length - 1] as SeenRing);
  return out;
}

function between(a: SeenRing, b: SeenRing, k: number): SeenRing {
  if (k === 0) return a;
  const m = (p: number, q: number) => p + (q - p) * k;
  const v = (p: Vec3, q: Vec3): Vec3 => ({ x: m(p.x, q.x), y: m(p.y, q.y), z: m(p.z, q.z) });
  return {
    c: { x: m(a.c.x, b.c.x), y: m(a.c.y, b.c.y), z: m(a.c.z, b.c.z), s: m(a.c.s, b.c.s) },
    left: { x: m(a.left.x, b.left.x), y: m(a.left.y, b.left.y) },
    right: { x: m(a.right.x, b.right.x), y: m(a.right.y, b.right.y) },
    r: m(a.r, b.r),
    e: v(a.e, b.e),
    f: v(a.f, b.f),
    tz: m(a.tz, b.tz),
  };
}

/**
 * One stretch between two rings, lit across by the nearer ring's section.
 *
 * The gradient is built once per light, along a unit line from 0 to 1, and
 * laid across each slice by a transform: a path is fixed where it was built,
 * but a gradient is read under the transform in force when it fills. That is
 * one `createLinearGradient` per distinct section rather than one per slice.
 */
function shadeSegment(
  ctx: CanvasRenderingContext2D,
  a: SeenRing,
  b: SeenRing,
  skin: Skin,
  alpha: number,
): void {
  const rx = (a.right.x + b.right.x) / 2;
  const ry = (a.right.y + b.right.y) / 2;
  const ux = (a.left.x + b.left.x) / 2 - rx;
  const uy = (a.left.y + b.left.y) / 2 - ry;
  if (ux * ux + uy * uy < 1e-4) return;
  // A little longer each way, so no seam of the base shows between two, and
  // pushed out past the outline so the clip, not the quad, is the edge. The
  // stops are opaque, so the overlap cannot stack into a band.
  const ext = (p: Pt, q: Pt, c: Pt): Pt => ({
    x: p.x + (p.x - q.x) * SEAM + (p.x - c.x) * OUT,
    y: p.y + (p.y - q.y) * SEAM + (p.y - c.y) * OUT,
  });
  const al = ext(a.left, b.left, a.c);
  const bl = ext(b.left, a.left, b.c);
  const br = ext(b.right, a.right, b.c);
  const ar = ext(a.right, b.right, a.c);
  ctx.beginPath();
  ctx.moveTo(al.x, al.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(ar.x, ar.y);
  ctx.closePath();
  ctx.save();
  ctx.transform(ux, uy, -uy, ux, rx, ry);
  ctx.fillStyle = sectionGradient(ctx, a, skin, alpha);
  ctx.fill();
  ctx.restore();
}

/**
 * The end of a tube pointed at the viewer is a dome, not a slice: lit as a
 * ball, weighted by how squarely it points out, so a side view shows nothing
 * of it and an end-on one shows all of it. Only the end coming *toward* the
 * viewer — `out` is which way is outward along the spine there — since the
 * far one is behind the tube and is drawn over by it.
 */
function capLight(
  ctx: CanvasRenderingContext2D,
  ring: SeenRing,
  out: 1 | -1,
  skin: Skin,
  alpha: number,
): void {
  const toward = ring.tz * out;
  if (toward <= 0.2 || ring.r < 1) return;
  const k = Math.min(1, (toward - 0.2) / 0.6) * alpha;
  const { x, y } = ring.c;
  const r = ring.r;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r);
  g.addColorStop(0, rgba(skin.sheen, 0.3 * k));
  g.addColorStop(0.45, rgba(skin.lift, 0.12 * k));
  g.addColorStop(0.8, rgba(SHADOW, 0.3 * k));
  g.addColorStop(1, rgba(SHADOW, 0.55 * k));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** The rim: a thin additive line round the outline, in the rim colour. */
export function rimTube(
  ctx: CanvasRenderingContext2D,
  outline: Path2D,
  hex: string,
  width: number,
  alpha = 1,
): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.clip(outline);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(hex, 0.35 * alpha);
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.stroke(outline);
  ctx.restore();
}
