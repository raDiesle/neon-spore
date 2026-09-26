import {
  type Frame,
  litIn,
  onRing,
  type Ring,
  ringNormal,
  type SeenRing,
  SIDE,
  see,
  seeTube,
  tubeFrames,
  turn,
  view,
} from "@neon-spore/content";
import { rgba } from "./hex.js";
import type { Point } from "./instar-place.js";
import { drawLamp, faded } from "./instar-plate.js";
import { PALETTE } from "./palette.js";

/**
 * **What sits on THE INSTAR's long body, placed round it** — the owner, 26
 * September 2026: *when boss is shown from the side, it looks very ugly*, and
 * *more 3 dimensional*. The body is a tube of the rig (`solid-tube.ts`), and
 * everything on its surface — the scales, the lamps, the ridge down the back —
 * is put at an angle round a ring of it rather than laid out in the picture.
 *
 * An angle here runs from the back: `0` the back, `π/2` the flank facing the
 * player, `π` the belly. The body rolls a little about its own length
 * (`instar-profile-life.ts`); every angle is read with the roll added, so the
 * rows walk round under a light that stays where it is, the near ones toward
 * the limb and away, the far ones over the back into view — the reveal no pose
 * can make (`.claude/skills/depth`). A row past the limb is not drawn; a row
 * near it is foreshortened by the section itself, since its neighbours crowd
 * together there on the screen.
 */

const W = view(SIDE);
const SHADOW = "#0B1024";

/** THE INSTAR's body as the rig sees it. */
export interface Body {
  readonly rings: readonly Ring[];
  readonly frames: readonly Frame[];
  readonly seen: readonly SeenRing[];
  /** Which way round the frames turn: the sign that makes `π/2` face the player. */
  readonly side: 1 | -1;
  /** Whether the frames' own `0` is the back, or the belly: it starts from "up",
   * and a spine that leaves the neck running backward has its back underneath. */
  readonly upright: boolean;
}

/** A point on the surface: where on the screen, how squarely it faces the player, how lit. */
export interface Placed {
  readonly x: number;
  readonly y: number;
  readonly near: number;
  readonly lit: number;
}

/** The body whose outline runs along `top` and `bottom`, one ring per pair. */
export function bodyOf(top: readonly Point[], bottom: readonly Point[]): Body {
  const rings = top.map((t, i) => {
    const b = bottom[i] as Point;
    const c = { x: (t.x + b.x) / 2, y: (t.y + b.y) / 2, z: 0 };
    return { c, r: Math.hypot(t.x - b.x, t.y - b.y) / 2 };
  });
  const frames = tubeFrames(rings);
  const f0 = frames[0] as Frame;
  const side = turn(f0.b, W).z >= 0 ? 1 : -1;
  const t0 = top[0] as Point;
  const c0 = (rings[0] as Ring).c;
  const upright = f0.n.x * (t0.x - c0.x) + f0.n.y * (t0.y - c0.y) >= 0;
  return { rings, frames, seen: seeTube(rings, frames, W), side, upright };
}

/** Where angle `a` from the back round ring `i` lands, `lift` radii out from the surface. */
export function place(body: Body, i: number, a: number, lift = 0): Placed {
  const ang = body.upright ? a * body.side : Math.PI - a * body.side;
  const frame = body.frames[i] as Frame;
  const p = see(onRing(body.rings[i] as Ring, frame, ang, lift), W);
  const n = ringNormal(frame, ang);
  return { x: p.x, y: p.y, near: turn(n, W).z, lit: litIn(n, W) };
}

/** The screen direction the body runs at ring `i`, neck toward rear. */
function along(body: Body, i: number): Point {
  const e = (body.seen[i] as SeenRing).e;
  return { x: e.y, y: -e.x };
}

/** How far apart the scale rows are round the body, and how far off the back the first. */
const SCALE_ROW = 0.3;
const SCALE_FROM = 0.28;

/** The scales, in rows round the body: each a small arc hanging toward the belly. */
export function drawScales(
  ctx: CanvasRenderingContext2D,
  body: Body,
  clip: Path2D,
  size: number,
  roll: number,
  fade: number,
): void {
  const n = body.rings.length;
  if (size < 2 || fade <= 0 || n < 3) return;
  const a0 = (body.seen[0] as SeenRing).c;
  const a1 = (body.seen[n - 1] as SeenRing).c;
  const gap = Math.hypot(a1.x - a0.x, a1.y - a0.y) / (n - 1);
  const step = Math.max(1, Math.round(size / Math.max(1, gap)));
  ctx.save();
  ctx.clip(clip);
  ctx.lineWidth = Math.max(0.6, size * 0.14);
  for (let row = 0; SCALE_FROM + row * SCALE_ROW < Math.PI - 0.15; row++) {
    const a = SCALE_FROM + row * SCALE_ROW + roll;
    const probe = place(body, n >> 1, a);
    if (probe.near < 0.04) continue;
    const seen = Math.min(1, probe.near * 3);
    ctx.strokeStyle = rgba(PALETTE.hullRim, (0.05 + 0.22 * probe.lit) * seen * fade);
    ctx.beginPath();
    for (let i = 1 + ((row % 2) * step) / 2; i < n - 1; i += step) {
      const k = Math.round(i);
      const p = place(body, k, a);
      const q = place(body, k, a + 0.15);
      const rr = (body.rings[k] as Ring).r * 0.15 || 1;
      const t = along(body, k);
      const bx = ((q.x - p.x) / rr) * size * 0.7;
      const by = ((q.y - p.y) / rr) * size * 0.7;
      ctx.moveTo(p.x - (t.x * size) / 2, p.y - (t.y * size) / 2);
      ctx.quadraticCurveTo(p.x + bx, p.y + by, p.x + (t.x * size) / 2, p.y + (t.y * size) / 2);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** The lamps' angle off the back: low on the flank, where the old flat row sat. */
const LAMP_AT = 1.85;

/** A row of lamps down the flank, every `every` rings, foreshortened toward the limb. */
export function drawLamps(
  ctx: CanvasRenderingContext2D,
  body: Body,
  r: number,
  roll: number,
  time: number,
  fade: number,
  every: number,
): void {
  for (let i = every; i < body.rings.length - every; i += every) {
    const p = place(body, i, LAMP_AT + roll);
    if (p.near < 0.08) continue;
    const pulse = 0.6 + 0.4 * Math.sin(time * 2.4 - (i / every) * 0.5);
    const seen = Math.min(1, p.near * 2);
    drawLamp(ctx, p, r * 0.035 * (0.55 + 0.45 * p.near), fade * seen, pulse);
  }
}

/** Either side of the back the two ridge rows stand, in radians off it. */
const RIDGE_SPREAD = 0.45;

/**
 * One row of the ridge: small spines swept back along the body, each two
 * faces with the one toward the key lit. `far` is the row across the back from
 * the player, cooler and dimmer — depth read as haze — and drawn before the
 * hide, so the body covers its roots and only its tips show over the back.
 */
export function drawRidge(
  ctx: CanvasRenderingContext2D,
  body: Body,
  r: number,
  roll: number,
  fade: number,
  far: boolean,
  every: number,
): void {
  if (fade <= 0) return;
  const a = (far ? -RIDGE_SPREAD : RIDGE_SPREAD) + roll;
  const n = body.rings.length - 1;
  const lit = faded(far ? PALETTE.sheenCold : PALETTE.rock, fade, far ? 0.5 : 0.85);
  const dark = faded(far ? SHADOW : PALETTE.rockDark, fade, far ? 0.8 : 0.95);
  ctx.save();
  for (let i = every * 2; i < n - every; i += every) {
    const u = i / n;
    const base = place(body, i, a);
    if (!far && base.near < 0) continue;
    const tip = place(body, i, a, 0.85 * (1 - 0.45 * u));
    const t = along(body, i);
    const w = r * (0.08 - 0.03 * u);
    const tx = tip.x + t.x * w * 1.2;
    const ty = tip.y + t.y * w * 1.2;
    for (const [s, fill] of [
      [-1, lit],
      [1, dark],
    ] as const) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(base.x + s * t.x * w, base.y + s * t.y * w);
      ctx.lineTo(base.x, base.y);
      ctx.lineTo(tx, ty);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}
