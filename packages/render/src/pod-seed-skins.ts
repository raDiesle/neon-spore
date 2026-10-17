import { faded } from "./pod-fade.js";
import { type Seed, turn, type V } from "./pod-seed.js";
import type { SeedPaint } from "./pod-seed-paint.js";

/**
 * **The seed's skins** — the surface over the body and under the seam, and
 * the circle-on-the-sphere the seam itself is drawn with. `smooth` is SMART's
 * own; `pod-seed-spikes.ts` is the rest of what a pod on the seed may change
 * and still be the pod. Everything here turns with the roll, so a skin is a
 * surface on the sphere and not a sticker on the screen.
 */

export type SkinKind = "smooth" | "spots" | "facets" | "panels" | "stripes";

const RIM_N = 32;

/** A circle on the sphere, drawn where it faces the viewer — one path and one
 * stroke, however many pieces of it are in front: a pod on the field is in
 * the frame's op budget (`wave-budget.test.ts`), several at once. */
export function ringOn(
  ctx: CanvasRenderingContext2D,
  s: Seed,
  at: (a: number) => V,
  width: number,
  alpha = 1,
) {
  ctx.lineWidth = width;
  ctx.globalAlpha = faded(0.65 * alpha);
  ctx.beginPath();
  let prev: V | null = null;
  for (let i = 0; i <= RIM_N; i++) {
    const p = turn(at((i / RIM_N) * Math.PI * 2), s.roll);
    if (p.z > 0) {
      if (prev && prev.z > 0) ctx.lineTo(s.x + p.x * s.R, s.y + p.y * s.R);
      else ctx.moveTo(s.x + p.x * s.R, s.y + p.y * s.R);
    }
    prev = p;
  }
  ctx.stroke();
}

/** Twelve points spread over the sphere — the spots' places. */
const SPOTS: V[] = Array.from({ length: 12 }, (_, i) => {
  const yy = 1 - ((i + 0.5) / 12) * 2;
  const rr = Math.sqrt(1 - yy * yy);
  const a = i * 2.4 + 1.1;
  return { x: Math.cos(a) * rr, y: yy, z: Math.sin(a) * rr };
});

/** The icosahedron's twelve corners, normalised, and its thirty edges. */
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO: V[] = (
  [
    [0, 1, PHI],
    [0, -1, PHI],
    [0, 1, -PHI],
    [0, -1, -PHI],
    [1, PHI, 0],
    [-1, PHI, 0],
    [1, -PHI, 0],
    [-1, -PHI, 0],
    [PHI, 0, 1],
    [-PHI, 0, 1],
    [PHI, 0, -1],
    [-PHI, 0, -1],
  ] as [number, number, number][]
).map(([x, y, z]) => {
  const n = Math.hypot(x, y, z);
  return { x: x / n, y: y / n, z: z / n };
});
const EDGES: [number, number][] = [];
for (let i = 0; i < ICO.length; i++)
  for (let j = i + 1; j < ICO.length; j++) {
    const a = ICO[i];
    const b = ICO[j];
    if (a && b && a.x * b.x + a.y * b.y + a.z * b.z > 0.4) EDGES.push([i, j]);
  }

/** The surface, over the body and under the seam. */
export function drawSkin(ctx: CanvasRenderingContext2D, s: Seed, kind: SkinKind, paint: SeedPaint) {
  if (kind === "smooth") return;
  if (kind === "spots") {
    // A spot needs no clip and no save: at the limb it is squashed along the
    // radius, so it cannot stand past the rim, and it sets every state it
    // uses. The real pod wears spots, in the frame's op budget
    // (`wave-budget.test.ts`).
    // One fill for every spot in front: the limb's foreshortening says depth.
    ctx.fillStyle = paint.seam;
    ctx.globalAlpha = faded(0.5);
    ctx.beginPath();
    for (const p0 of SPOTS) {
      const p = turn(p0, s.roll);
      if (p.z <= 0) continue;
      const a = s.R * 0.16;
      const minor = a * Math.max(0.2, p.z);
      const ang = Math.atan2(p.y, p.x);
      const cx = s.x + p.x * s.R;
      const cy = s.y + p.y * s.R;
      ctx.moveTo(cx + Math.cos(ang) * minor, cy + Math.sin(ang) * minor);
      ctx.ellipse(cx, cy, minor, a, ang, 0, Math.PI * 2);
    }
    ctx.fill();
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.R, 0, Math.PI * 2);
  ctx.clip();
  if (kind === "facets") {
    const pts = ICO.map((p) => turn(p, s.roll));
    ctx.strokeStyle = paint.seam;
    ctx.lineWidth = s.R * 0.05;
    // Every near edge in one stroke: the clip at the limb says depth.
    ctx.globalAlpha = faded(0.55);
    ctx.beginPath();
    for (const [i, j] of EDGES) {
      const a = pts[i];
      const b = pts[j];
      if (!a || !b || a.z + b.z <= 0) continue;
      ctx.moveTo(s.x + a.x * s.R, s.y + a.y * s.R);
      ctx.lineTo(s.x + b.x * s.R, s.y + b.y * s.R);
    }
    ctx.stroke();
  } else if (kind === "panels") {
    ctx.strokeStyle = paint.seam;
    ringOn(ctx, s, (a) => ({ x: 0, y: Math.cos(a), z: Math.sin(a) }), s.R * 0.12, 1.2);
    ringOn(ctx, s, (a) => ({ x: Math.cos(a), y: Math.sin(a), z: 0 }), s.R * 0.12, 1.2);
  } else {
    ctx.strokeStyle = paint.seam;
    for (const h of [-0.5, 0.5]) {
      const rr = Math.sqrt(1 - h * h);
      ringOn(ctx, s, (a) => ({ x: Math.cos(a) * rr, y: h, z: Math.sin(a) * rr }), s.R * 0.18, 0.55);
    }
  }
  ctx.restore();
}
