import { LIGHT_HALF } from "@neon-spore/content";
import type { Color } from "@neon-spore/sim";
import {
  davitBoomPath,
  davitChainPath,
  davitHook,
  davitHookPath,
  davitHookRadius,
  davitMastPath,
} from "./davit-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/** A step's colour on the canvas: its cannon's, or the hull's rim for one either answers (§32's rule, shared). */
export function davitColour(color: Color | "either"): { body: string; rim: string } {
  if (color === "either") return { body: PALETTE.hullRim, rim: PALETTE.hullRim };
  return { body: PALETTE[color], rim: color === "red" ? PALETTE.redRim : PALETTE.cyanRim };
}

/** The mast's own socket: a dark steel foot the boom always stands out of. */
export function drawDavitMast(ctx: CanvasRenderingContext2D, l: Layout): void {
  const path = davitMastPath(l);
  ctx.fillStyle = rgba(PALETTE.davitSteelDark, 0.9);
  ctx.fill(path);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.davitSteel, 0.9);
  ctx.stroke(path);
}

/** The boom itself: yardarm steel, key-lit, standing to `stand` and swung to `angle`. */
export function drawDavitBoom(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  angle: number,
  stand: number,
  time: number,
): void {
  const path = davitBoomPath(l, angle, stand);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.davitSteel, 0.95);
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, -l.tile * 0.6, l.tile * 0.6, LIGHT_HALF.rock, 0.02 * Math.sin(time * 0.5));
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.davitSteelDark, 0.95);
  ctx.stroke(path);
  ctx.restore();
}

/** A pulsing halo round the boom while a lean is being asked to steer it here. */
export function drawDavitAsk(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  angle: number,
  beatPhase: number,
): void {
  const path = davitBoomPath(l, angle, 1);
  const pulse = 0.6 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, path, PALETTE.hullRim, STROKE.outline, pulse);
}

/** The slack chain hanging off the boom's tip. */
export function drawDavitChain(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  angle: number,
  sag: number,
): void {
  const path = davitChainPath(l, angle, sag);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.davitChain, 0.85);
  ctx.stroke(path);
}

/** The hook at the chain's end: dark unlit, glowing the step's colour, with a ring closing as a fire step's window runs out. */
export function drawDavitHook(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  angle: number,
  sag: number,
  glow: number,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const hook = davitHookPath(l, angle, sag);
  const r = davitHookRadius(l);
  if (lit === null) {
    ctx.fillStyle = rgba(PALETTE.davitSteelDark, 0.9 * glow + 0.1);
    ctx.fill(hook);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.davitSteel, 0.9);
    ctx.stroke(hook);
    return;
  }
  const { body, rim } = davitColour(lit.color);
  ctx.fillStyle = rgba(body, glow * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(hook);
  strokeGlow(ctx, hook, rim, STROKE.inner, 0.8 + glow);
  const point = davitHook(l, angle, sag);
  const ring = new Path2D();
  ring.arc(point.x, point.y, r * 1.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}
