import type { Point } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { paintBody } from "./body.js";
import { fallen, IMPACT, SPLASH } from "./moment.js";
import { clamp01, hash, mix, settle } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **The two ends of a GOO pull that are events**: a count, sealed by a glob
 * of slime falling onto the place and splashing round it — the owner on
 * OOZE, 10 October 2026: *let it look like you would let slime fall down from
 * top like a splash around area (not too wide)* — and a failure, where the
 * drop spits red goo where it was let go. Neither has a line or a word in it.
 */

/** Droplets thrown up and out, falling back under their own weight. */
function spray(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  e: number,
  o: { n: number; seed: number; color: string; reach: number; up: number; life: number },
): void {
  if (e < 0 || e >= o.life) return;
  ctx.save();
  ctx.fillStyle = o.color;
  for (let i = 0; i < o.n; i++) {
    const a = -Math.PI * (0.5 + (hash(o.seed + i) - 0.5) * o.up);
    const v = r * o.reach * (0.5 + 0.5 * hash(o.seed + i * 3.3));
    const x = at.x + Math.cos(a) * v * e;
    const y = at.y + Math.sin(a) * v * e + 0.5 * r * 34 * e * e;
    const s = r * (0.08 + 0.12 * hash(o.seed + i * 7.7)) * (1 - e / o.life);
    ctx.globalAlpha = 1 - (e / o.life) ** 2;
    ctx.beginPath();
    ctx.ellipse(x, y, s, s * 1.25, a + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A soft flash of colour added onto the field round `at`. */
function flash(ctx: CanvasRenderingContext2D, at: Point, r: number, color: string, k: number) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = k;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Counted `age` seconds ago, at the place `q`: the glob falls, lands, splashes and sinks away. */
export function countSplash(
  ctx: CanvasRenderingContext2D,
  q: Point,
  r: number,
  age: number,
  style: GooStyle,
  time: number,
): void {
  if (age >= SPLASH) return;
  if (age < IMPACT) {
    const at = fallen(q, r, age, IMPACT);
    paintBody(
      ctx,
      { at, r: r * 0.75, seed: 41, lean: { x: 0, y: -1 }, stretch: 1.3, point: 10 },
      style,
      time,
      { red: 0, green: 0.55 },
    );
    return;
  }
  const e = age - IMPACT;
  const fade = 1 - clamp01((e - 0.45) / (SPLASH - IMPACT - 0.45));
  flash(ctx, q, r * 2.6, PALETTE.good, 0.55 * (1 - clamp01(e / 0.35)));
  spray(ctx, { x: q.x, y: q.y + r * 0.3 }, r, e, {
    n: 11,
    seed: 17,
    color: mix(PALETTE.good, style.body, 0.25),
    reach: 9,
    up: 1.4,
    life: 0.45,
  });
  arms(ctx, q, r, e, style, fade, time);
  const squash = 1.75 - 0.45 * clamp01(e / 0.4) + 0.25 * settle(e, 6, 18);
  paintBody(
    ctx,
    {
      at: q,
      r: r * (0.85 + 0.25 * clamp01(e * 10)),
      seed: 23,
      squash,
      shake: 0.45 * Math.exp(-e * 3),
    },
    style,
    time,
    { red: 0, green: 0.75, alpha: fade },
  );
}

/** The goo thrown out sideways where the glob lands: lumps flung along the
 * ground either side, none the same size, drawn back in as the splash sinks. */
function arms(
  ctx: CanvasRenderingContext2D,
  q: Point,
  r: number,
  e: number,
  style: GooStyle,
  fade: number,
  time: number,
): void {
  const out = clamp01(e / 0.12) * (1 - 0.35 * clamp01((e - 0.3) / 0.5));
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const a = Math.PI / 2 - side * (Math.PI * (0.32 + 0.16 * hash(i * 2.7)));
    const d = r * (1.15 + 0.7 * hash(i * 4.1)) * out;
    // Thrown up into an uneven crown, then sinking back to the ground with the splash.
    const up = r * (0.25 + 0.9 * hash(i * 8.3)) * Math.sin(clamp01(e / 0.5) * Math.PI);
    const at = { x: q.x + Math.cos(a) * d * 1.2, y: q.y + r * 0.4 - up };
    paintBody(
      ctx,
      { at, r: r * (0.12 + 0.2 * hash(i * 6.3)), seed: 50 + i, lean: { x: 0, y: 1 }, stretch: 0.6 },
      style,
      time,
      { red: 0, green: 0.75, alpha: fade },
    );
  }
}

/** A fresh drop landing in its start, `t` seconds after it began to fall: a few small specks. */
export function landSpecks(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  t: number,
  span: number,
  style: GooStyle,
) {
  spray(ctx, { x: at.x, y: at.y + r * 0.6 }, r, t - span, {
    n: 6,
    seed: 5,
    color: style.body,
    reach: 3,
    up: 1.7,
    life: 0.35,
  });
}

/** Failed `f` seconds ago where the drop lies: it spits red goo, and a red flush. */
export function failSpray(ctx: CanvasRenderingContext2D, at: Point, r: number, f: number) {
  flash(ctx, at, r * 2.4, PALETTE.red, 0.5 * (1 - clamp01(f / 0.3)));
  spray(ctx, at, r, f, { n: 8, seed: 61, color: PALETTE.red, reach: 4, up: 2, life: 0.55 });
}
