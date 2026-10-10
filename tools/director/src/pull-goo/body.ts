import type { Point } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { hash, lumps, mix } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **A body of GOO**: a closed contour with lumps that creep, pulled into a
 * teardrop the way it leans and flattened onto the ground when it lands —
 * then lit as a living slime, with a neon rim glowing out of it rather than
 * a white line round it (the owner on OOZE: *the white border looks boring,
 * maybe some neon is cool*).
 */

export interface GooBody {
  readonly at: Point;
  readonly r: number;
  readonly seed: number;
  /** The way it leans, a unit vector, and how far it is drawn out that way. */
  readonly lean?: Point;
  readonly stretch?: number;
  /** Wider and lower than round above 1, taller below; squashed onto its own bottom. */
  readonly squash?: number;
  /** Lumps on top of the style's own, for a shudder. */
  readonly shake?: number;
  /** How sharp the drawn-out end is: 3 a rounded lean, 10 a falling drop's tail. */
  readonly point?: number;
  /** How far round its lumps have turned, in radians; `DROP_SPIN` a second when not given. */
  readonly spin?: number;
  /** Lobes standing out of the rim, `depth` of the radius: a drop in bloom. */
  readonly petals?: { readonly n: number; readonly depth: number };
}

/** Radians a second every GOO drop turns, whatever else it is doing — the owner, 10
 * October 2026, on SINK: *can we keep the rotating of the ball*, which BLOOM had. */
export const DROP_SPIN = 1;

/** The seed every GOO drop is drawn with, so the one under the hand and the one an
 * ending or a failure plays have the same lumps. */
export const DROP_SEED = 11;

/** The GOO drop at `at`, everything else as given. */
export const drop = (at: Point, r: number, rest: Partial<GooBody> = {}): GooBody => ({
  at,
  r,
  seed: DROP_SEED,
  ...rest,
});

/** Where the rim is at screen angle `a`, as an offset from `centre(b)`: the lumps, the
 * lean and the petals, squashed. A ball's surface is laid onto this (`ball.ts`), so what
 * goes round its limb goes round the rim actually drawn, lumps and all. */
export function rimAt(b: GooBody, style: GooStyle, time: number, a: number): Point {
  const sq = b.squash ?? 1;
  const lean = b.lean ?? { x: 0, y: 0 };
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const turned = a - (b.spin ?? time * DROP_SPIN);
  const lump =
    style.lumpy * lumps(turned, time * style.creep, b.seed) +
    (b.shake ?? 0) * lumps(turned, time * 9, b.seed + 5);
  const toward = Math.max(0, ca * lean.x + sa * lean.y);
  const petal = b.petals ? b.petals.depth * (0.5 + 0.5 * Math.cos(b.petals.n * turned)) ** 2 : 0;
  const d = b.r * (1 + lump + petal) * (1 + (b.stretch ?? 0) * toward ** (b.point ?? 3));
  return { x: ca * d * sq, y: (sa * d) / sq };
}

/** The middle a squashed body is squashed about: sat on its own bottom. */
export function centre(b: GooBody): Point {
  return { x: b.at.x, y: b.at.y + b.r * (1 - 1 / (b.squash ?? 1)) };
}

/** The contour, smoothed through the midpoints of its samples so it has no corner. */
export function bodyPath(b: GooBody, style: GooStyle, time: number): Path2D {
  const n = 44;
  const c = centre(b);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const o = rimAt(b, style, time, (i / n) * Math.PI * 2);
    pts.push({ x: c.x + o.x, y: c.y + o.y });
  }
  const p = new Path2D();
  const mid = (i: number): Point => {
    const u = pts[i % n] as Point;
    const v = pts[(i + 1) % n] as Point;
    return { x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 };
  };
  const m0 = mid(0);
  p.moveTo(m0.x, m0.y);
  for (let i = 1; i <= n; i++) {
    const c = pts[i % n] as Point;
    const m = mid(i);
    p.quadraticCurveTo(c.x, c.y, m.x, m.y);
  }
  p.closePath();
  return p;
}

/** The neon round a path: three soft passes added onto the field, widest faintest. */
export function glow(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  neon: string,
  r: number,
  strength = 1,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = neon;
  ctx.lineJoin = "round";
  for (const [w, a] of [
    [0.95, 0.07],
    [0.55, 0.11],
    [0.25, 0.2],
  ] as const) {
    ctx.lineWidth = r * w;
    ctx.globalAlpha = a * strength;
    ctx.stroke(p);
  }
  ctx.restore();
}

/** Lit as a slime: neon round it, lit through from the top left, wet on top. `red` and
 * `green` wash the whole of it towards the game's refusal and count. */
export function paintBody(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
): void {
  const p = bodyPath(b, style, time);
  const { at, r } = b;
  const neon = mix(mix(style.neon, PALETTE.red, tint.red), PALETTE.good, tint.green ?? 0);
  const alpha = tint.alpha ?? 1;
  glow(ctx, p, neon, r, alpha * 1.3);
  ctx.save();
  const g = ctx.createRadialGradient(
    at.x - r * 0.32,
    at.y - r * 0.38,
    r * 0.05,
    at.x,
    at.y,
    r * 1.2,
  );
  g.addColorStop(0, style.core);
  g.addColorStop(0.45, style.body);
  g.addColorStop(1, style.deep);
  ctx.globalAlpha = alpha * (1 - style.clear * 0.55);
  ctx.fillStyle = g;
  ctx.fill(p);
  for (const [c, k] of [
    [PALETTE.red, tint.red],
    [PALETTE.good, tint.green ?? 0],
  ] as const) {
    if (k <= 0) continue;
    ctx.globalAlpha = alpha * k * 0.6;
    ctx.fillStyle = c;
    ctx.fill(p);
  }
  ctx.clip(p);
  if (style.bubbles > 0) bubbles(ctx, at, r, style, time, b.seed, alpha);
  if (style.sheen) sheen(ctx, at, r, neon, time, alpha);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = neon;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = r * 0.11;
  ctx.stroke(p);
  ctx.strokeStyle = mix(neon, "#FFFFFF", 0.55);
  ctx.globalAlpha = alpha * 0.7;
  ctx.lineWidth = r * 0.035;
  ctx.stroke(p);
  // Wet on top: one soft highlight and one hard glint.
  ctx.fillStyle = "#FFFFFF";
  ctx.globalAlpha = alpha * 0.22;
  ctx.beginPath();
  ctx.ellipse(at.x - r * 0.3, at.y - r * 0.42, r * 0.42, r * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.85;
  ctx.beginPath();
  ctx.ellipse(at.x - r * 0.42, at.y - r * 0.5, r * 0.11, r * 0.06, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Bubbles hung in the jelly, drifting slowly up and round. */
function bubbles(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
  seed: number,
  alpha: number,
): void {
  ctx.lineWidth = r * 0.04;
  for (let i = 0; i < style.bubbles; i++) {
    const a = hash(seed + i * 3.1) * Math.PI * 2 + time * 0.3 * (hash(i + 9) - 0.5);
    const d = r * (0.2 + 0.5 * hash(seed + i * 5.7));
    const rise = ((time * 0.15 + hash(i * 2.3)) % 1) * r * 0.3;
    const q = { x: at.x + Math.cos(a) * d, y: at.y + Math.sin(a) * d - rise };
    const s = r * (0.07 + 0.09 * hash(i * 7.9 + seed));
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = style.core;
    ctx.beginPath();
    ctx.arc(q.x, q.y, s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.arc(q.x - s * 0.35, q.y - s * 0.35, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** An oily sheen: a band of neon sliding over the top, slowly, and back. */
function sheen(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  neon: string,
  time: number,
  alpha: number,
): void {
  const x = at.x + r * 0.9 * Math.sin(time * 0.9);
  const g = ctx.createLinearGradient(x - r * 0.6, at.y - r, x + r * 0.6, at.y);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, neon);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha * 0.45;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y - r * 0.35, r * 1.1, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}
