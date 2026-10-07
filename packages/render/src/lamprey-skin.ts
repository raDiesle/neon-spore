import { KEY } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { lampreyWidth, type Point } from "./lamprey-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LAMPREY's skin**: what makes the olive tube read as an eel — a fin
 * flaring round the tail with its rays, a dark ridge down the back, mottling,
 * the rings of its segments, a wet streak on the side the key light reaches,
 * and under them, drawn on top, the gill pores and the eyes
 * (`lamprey-gills.ts`).
 *
 * **It moves with the beat and never the wall clock** (`wave` is the pose's):
 * the fin's edge ripples tailward, so it stands still with the game paused. Everything is placed along the spine, so it crawls, leaps and
 * bends with the body.
 */

/** A point on the spine, which way is across the body there, and the body's half-width. */
export interface Station extends Point {
  nx: number;
  ny: number;
  w: number;
}

/** The spine as stations: each point, its normal and the body's half-width at it. */
export function lampreyStations(l: Layout, spine: readonly Point[]): Station[] {
  const n = spine.length - 1;
  return spine.map((at, i) => {
    const a = spine[Math.max(0, i - 1)] ?? at;
    const b = spine[Math.min(n, i + 1)] ?? at;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return {
      x: at.x,
      y: at.y,
      nx: -(b.y - a.y) / len,
      ny: (b.x - a.x) / len,
      w: lampreyWidth(l, i / n),
    };
  });
}

/** Where the fin starts, as a share of the body, and how far past the body it reaches, in tiles. */
const FIN_FROM = 0.5;
const FIN_REACH = 0.3;
/** The scallops along the fin's edge, and how far each ripples it. */
const FIN_RIPPLE = 0.22;

/**
 * The fin: a membrane round the back half that flares toward the tail and
 * wraps its tip, its edge rippling tailward, ribbed with rays. Drawn before
 * the body, which covers its middle.
 */
export function drawLampreyFin(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  spine: readonly Point[],
  wave: number,
): void {
  const st = lampreyStations(l, spine);
  const n = st.length - 1;
  const from = Math.floor(n * FIN_FROM);
  const reach = (i: number): number => {
    const f = (i - from) / (n - from);
    const flare = Math.sin(Math.min(1, f * 1.15) * Math.PI * 0.5) ** 1.5;
    const ripple = 1 + FIN_RIPPLE * Math.sin(i * 1.7 - wave * 3);
    return (st[i]?.w ?? 0) + FIN_REACH * l.tile * flare * ripple;
  };
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = from; i <= n; i++) {
    const s = st[i];
    if (s === undefined) continue;
    const r = reach(i);
    left.push({ x: s.x + s.nx * r, y: s.y + s.ny * r });
    right.push({ x: s.x - s.nx * r, y: s.y - s.ny * r });
  }
  // Round the tip: on past the last station by the fin's reach.
  const tip = st[n];
  const prev = st[n - 1];
  if (tip !== undefined && prev !== undefined) {
    const dx = tip.x - prev.x;
    const dy = tip.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const out = reach(n) * 1.1;
    left.push({ x: tip.x + (dx / len) * out, y: tip.y + (dy / len) * out });
  }
  const fin = smooth([...left, ...right.reverse()]);
  ctx.fillStyle = rgba(PALETTE.lampreyFin, 0.62);
  ctx.fill(fin);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(PALETTE.lampreyFin, 0.85);
  ctx.stroke(fin);
  // The rays: from the body's edge out to the fin's, every other station.
  const rays = new Path2D();
  for (let i = from + 1; i <= n; i += 2) {
    const s = st[i];
    if (s === undefined) continue;
    const r = reach(i) * 0.94;
    for (const side of [1, -1]) {
      rays.moveTo(s.x + s.nx * s.w * side, s.y + s.ny * s.w * side);
      rays.lineTo(s.x + s.nx * r * side, s.y + s.ny * r * side);
    }
  }
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.45);
  ctx.stroke(rays);
}

/** A closed curve through `pts`, rounded at each corner. */
function smooth(pts: readonly Point[]): Path2D {
  const path = new Path2D();
  const first = pts[0] ?? { x: 0, y: 0 };
  path.moveTo(first.x, first.y);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i] ?? first;
    const q = pts[i + 1] ?? first;
    path.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
  }
  path.closePath();
  return path;
}

/** The mottling: a blotch at these stations, on this side and this far across, as a share of the width. */
const BLOTCHES = [
  [5, 0.45, 0.32],
  [8, -0.5, 0.28],
  [11, 0.3, 0.3],
  [13, -0.35, 0.26],
  [16, 0.5, 0.24],
  [18, -0.25, 0.26],
  [21, 0.35, 0.22],
  [24, -0.4, 0.2],
] as const;

/**
 * The surface, clipped to the body: the mottling, the segments' rings, the
 * dark ridge down the back and the wet streak toward the light.
 */
export function drawLampreyHide(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  spine: readonly Point[],
  body: Path2D,
): void {
  const st = lampreyStations(l, spine);
  const n = st.length - 1;
  ctx.save();
  ctx.clip(body);

  const blotches = new Path2D();
  for (const [i, across, size] of BLOTCHES) {
    const s = st[Math.round((i * n) / 28)];
    if (s === undefined) continue;
    const r = s.w * size * 1.6;
    const x = s.x + s.nx * s.w * across;
    const y = s.y + s.ny * s.w * across;
    blotches.moveTo(x + r, y);
    blotches.ellipse(x, y, r, r * 0.7, Math.atan2(s.ny, s.nx), 0, Math.PI * 2);
  }
  ctx.fillStyle = rgba(PALETTE.lampreyHideDark, 0.28);
  ctx.fill(blotches);

  // The rings: a chevron across the body at each station, its point tailward.
  const rings = new Path2D();
  for (let i = 4; i < n - 1; i++) {
    const s = st[i];
    const t = st[i + 1];
    if (s === undefined || t === undefined) continue;
    rings.moveTo(s.x + s.nx * s.w, s.y + s.ny * s.w);
    rings.quadraticCurveTo(
      s.x + (t.x - s.x) * 0.9,
      s.y + (t.y - s.y) * 0.9,
      s.x - s.nx * s.w,
      s.y - s.ny * s.w,
    );
  }
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.3);
  ctx.stroke(rings);

  // The ridge down the back, thinning to the tail.
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.4);
  for (let i = 1; i < n - 2; i += 3) {
    const a = st[i];
    const b = st[Math.min(n - 2, i + 3)];
    if (a === undefined || b === undefined) continue;
    ctx.lineWidth = a.w * 0.42;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // The wet streak: the spine pushed toward the key light, along the front of the body.
  const streak = new Path2D();
  for (let i = 1; i < n * 0.8; i++) {
    const s = st[i];
    if (s === undefined) continue;
    const x = s.x + KEY.x * s.w * 0.55;
    const y = s.y + KEY.y * s.w * 0.55;
    if (i === 1) streak.moveTo(x, y);
    else streak.lineTo(x, y);
  }
  ctx.lineWidth = l.tile * 0.09;
  ctx.strokeStyle = "rgba(255,255,240,0.2)";
  ctx.stroke(streak);
  ctx.lineWidth = l.tile * 0.035;
  ctx.strokeStyle = "rgba(255,255,240,0.35)";
  ctx.stroke(streak);
  ctx.restore();
}
