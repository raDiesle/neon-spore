import { PALETTE } from "../../../../packages/render/src/palette.js";
import { type Seed, tipOf, turn, type V } from "./seed.js";

/**
 * **The seed's spikes and skins** — what a SMART-family candidate may change
 * and still be SMART. The owner asked on 16 October 2026 for different kinds
 * of spikes and different surfaces on the variants; the sphere, its seven
 * directions, its tumble and its seam stay the same in every one, so a player
 * who has learned one knows the others.
 *
 * `stud` and `smooth` are SMART's own. Everything here turns with the roll,
 * so a skin is a surface on the sphere and not a sticker on the screen.
 */

export type SpikeKind = "stud" | "cone" | "cap" | "crystal" | "thorn";
export type SkinKind = "smooth" | "spots" | "facets" | "panels" | "stripes";

const RIM_N = 32;
const DEEP = "#7A4C0C";

/** One spike along `d`, dimmer round the back. */
export function drawSpike(
  ctx: CanvasRenderingContext2D,
  s: Seed,
  d: V,
  flash: number,
  kind: SpikeKind,
) {
  const near = (d.z + 1) / 2;
  const bx = s.x + d.x * s.R * 0.85;
  const by = s.y + d.y * s.R * 0.85;
  const t0 = tipOf(s, d);
  // A pointed spike stands further out than a stud, or it reads as a nub.
  const out = kind === "stud" || kind === "cap" ? 1 : 1.35;
  const tip = { x: bx + (t0.x - bx) * out, y: by + (t0.y - by) * out };
  // The spike's direction on the screen, and across it.
  const len = Math.hypot(tip.x - bx, tip.y - by) || 1;
  const ux = (tip.x - bx) / len;
  const uy = (tip.y - by) / len;
  const hot = flash > 0.5 ? "#FFFFFF" : PALETTE.podRim;
  ctx.globalAlpha = 0.25 + 0.75 * near;
  ctx.fillStyle = PALETTE.pod;
  ctx.strokeStyle = PALETTE.pod;
  if (kind === "stud" || kind === "cap") {
    const end = kind === "cap" ? 0.75 : 1;
    ctx.lineWidth = s.R * (kind === "cap" ? 0.14 : 0.2);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + (tip.x - bx) * end, by + (tip.y - by) * end);
    ctx.stroke();
    ctx.fillStyle = hot;
    ctx.beginPath();
    if (kind === "stud") ctx.arc(tip.x, tip.y, s.R * 0.12, 0, Math.PI * 2);
    else {
      // A round cap facing out along `d`: a disc seen at its own slant.
      const a = s.R * 0.3;
      const cx = bx + (tip.x - bx) * end;
      const cy = by + (tip.y - by) * end;
      ctx.ellipse(
        cx,
        cy,
        Math.max(a * 0.3, a * Math.abs(d.z)),
        a,
        Math.atan2(uy, ux),
        0,
        Math.PI * 2,
      );
    }
    ctx.fill();
    return;
  }
  if (kind === "thorn") {
    // Curled the same way round on every spike, so the tumble reads as a pinwheel.
    const w = s.R * 0.2;
    const mx = (bx + tip.x) / 2 - uy * len * 0.45;
    const my = (by + tip.y) / 2 + ux * len * 0.45;
    ctx.beginPath();
    ctx.moveTo(bx - uy * w, by + ux * w);
    ctx.quadraticCurveTo(mx, my, tip.x, tip.y);
    ctx.quadraticCurveTo(mx - uy * w * 1.6, my + ux * w * 1.6, bx + uy * w, by - ux * w);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hot;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, s.R * 0.1, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // A cone or a crystal: a shape across the spike, filled in two lit halves.
  const w = s.R * (kind === "cone" ? 0.34 : 0.28);
  const mid = kind === "cone" ? 0 : 0.45;
  const wx = bx + (tip.x - bx) * mid;
  const wy = by + (tip.y - by) * mid;
  const sides: [number, string][] = [
    [1, kind === "crystal" ? hot : PALETTE.pod],
    [-1, kind === "crystal" ? PALETTE.pod : DEEP],
  ];
  for (const [side, fill] of sides) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(wx - uy * w * side, wy + ux * w * side);
    ctx.lineTo(tip.x, tip.y);
    ctx.closePath();
    ctx.fill();
  }
}

/** A circle on the sphere, drawn where it faces the viewer. */
export function ringOn(
  ctx: CanvasRenderingContext2D,
  s: Seed,
  at: (a: number) => V,
  width: number,
  alpha = 1,
) {
  ctx.lineWidth = width;
  let prev: V | null = null;
  for (let i = 0; i <= RIM_N; i++) {
    const p = turn(at((i / RIM_N) * Math.PI * 2), s.roll);
    if (prev && p.z > 0 && prev.z > 0) {
      ctx.globalAlpha = (0.3 + 0.5 * p.z) * alpha;
      ctx.beginPath();
      ctx.moveTo(s.x + prev.x * s.R, s.y + prev.y * s.R);
      ctx.lineTo(s.x + p.x * s.R, s.y + p.y * s.R);
      ctx.stroke();
    }
    prev = p;
  }
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
export function drawSkin(ctx: CanvasRenderingContext2D, s: Seed, kind: SkinKind) {
  if (kind === "smooth") return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.R, 0, Math.PI * 2);
  ctx.clip();
  if (kind === "spots") {
    ctx.fillStyle = PALETTE.podRim;
    for (const p0 of SPOTS) {
      const p = turn(p0, s.roll);
      if (p.z <= 0) continue;
      ctx.globalAlpha = 0.25 + 0.4 * p.z;
      const a = s.R * 0.16;
      ctx.beginPath();
      ctx.ellipse(
        s.x + p.x * s.R,
        s.y + p.y * s.R,
        a * Math.max(0.2, p.z),
        a,
        Math.atan2(p.y, p.x),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  } else if (kind === "facets") {
    const pts = ICO.map((p) => turn(p, s.roll));
    ctx.strokeStyle = PALETTE.podRim;
    ctx.lineWidth = s.R * 0.05;
    for (const [i, j] of EDGES) {
      const a = pts[i];
      const b = pts[j];
      if (!a || !b || a.z + b.z <= 0) continue;
      ctx.globalAlpha = 0.25 + 0.5 * ((a.z + b.z) / 2);
      ctx.beginPath();
      ctx.moveTo(s.x + a.x * s.R, s.y + a.y * s.R);
      ctx.lineTo(s.x + b.x * s.R, s.y + b.y * s.R);
      ctx.stroke();
    }
  } else if (kind === "panels") {
    ctx.strokeStyle = PALETTE.podRim;
    ringOn(ctx, s, (a) => ({ x: 0, y: Math.cos(a), z: Math.sin(a) }), s.R * 0.12, 1.2);
    ringOn(ctx, s, (a) => ({ x: Math.cos(a), y: Math.sin(a), z: 0 }), s.R * 0.12, 1.2);
  } else {
    ctx.strokeStyle = PALETTE.podRim;
    for (const h of [-0.5, 0.5]) {
      const rr = Math.sqrt(1 - h * h);
      ringOn(ctx, s, (a) => ({ x: Math.cos(a) * rr, y: h, z: Math.sin(a) * rr }), s.R * 0.18, 0.55);
    }
  }
  ctx.restore();
}
