import type { SimConfig, TrapezeState, TrapezeStep } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { trapezeAnchor, trapezeGongPx, trapezeGongR, trapezeRope } from "./trapeze-shape.js";

/**
 * **How high the swing goes, and how high it has to go** (the owner, 7
 * October 2026: *which angle has to be reached must be made clear too*).
 *
 * Under the plank's path runs its arc, faint from one end of the swing's
 * reach to the other. On it, from the bottom toward the gong, a bar is filled
 * as far as the swing goes now — **the gauge** — with a tick at the far end
 * of the swing on both sides; the rest of the way to the gong is dashed. The
 * gauge reaching the gong is the swing high enough: the gong lights, and the
 * next time the swing turns at its side, the alien kicks it
 * (`sim/trapeze-step.ts`).
 *
 * Between levels the next level's gong hangs dim where it will be, so the
 * pair can see where they are going before it lights.
 */

/** How far under the plank's path the gauge runs, in tiles. */
const BELOW = 0.75;
/** How dim a gong not yet lit is. */
const WAITING = 0.4;

/** Canvas angle of the swing's angle `deg`: nought straight down, positive to the right. */
const canvasAngle = (deg: number) => ((90 - deg) * Math.PI) / 180;

/** An arc on the gauge's circle from swing angle `a` to `b`. */
function gauge(l: Layout, cfg: SimConfig, a: number, b: number): Path2D {
  const at = trapezeAnchor(l, cfg);
  const path = new Path2D();
  const from = canvasAngle(a);
  const to = canvasAngle(b);
  path.arc(at.x, at.y, trapezeRope(l, cfg) + BELOW * l.tile, from, to, to < from);
  return path;
}

/** The arc, the gauge filled to the swing's reach on the gong's side, and the dashes on to the gong. */
export function drawTrapezeArc(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: TrapezeState,
  step: TrapezeStep | null,
  lit: boolean,
): void {
  const max = cfg.trapezeMaxMilli / 1000;
  const reach = s.ampMilli / 1000;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.14);
  ctx.stroke(gauge(l, cfg, -max, max));
  if (step !== null) {
    const side = step.gongSide;
    const goal = step.gongMilli / 1000;
    const k = lit ? 1 : WAITING;
    ctx.setLineDash([0.12 * l.tile, 0.16 * l.tile]);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.trapezeBrassLit, 0.5 * k);
    if (reach < goal) ctx.stroke(gauge(l, cfg, side * reach, side * goal));
    ctx.setLineDash([]);
    const filled = gauge(l, cfg, 0, side * Math.min(reach, goal));
    strokeGlow(ctx, filled, PALETTE.trapezeBrassLit, STROKE.outline * 1.4, k, 1);
  }
  // The far end of the swing, both sides: how high it goes now.
  for (const side of [-1, 1]) {
    const tick = new Path2D();
    const at = trapezeAnchor(l, cfg);
    const a = canvasAngle(side * reach);
    const r = trapezeRope(l, cfg) + BELOW * l.tile;
    tick.moveTo(at.x + Math.cos(a) * (r - 0.22 * l.tile), at.y + Math.sin(a) * (r - 0.22 * l.tile));
    tick.lineTo(at.x + Math.cos(a) * (r + 0.22 * l.tile), at.y + Math.sin(a) * (r + 0.22 * l.tile));
    strokeGlow(ctx, tick, PALETTE.hullRim, STROKE.inner, 0.8, 1);
  }
  ctx.restore();
}

/**
 * The gong of `step`, hung on a cord at the end of the swing on its side:
 * dim until its level lights, and ringing bright once the swing goes high
 * enough to kick it.
 */
export function drawTrapezeGong(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  step: TrapezeStep,
  s: TrapezeState,
  lit: boolean,
): void {
  const at = trapezeGongPx(l, cfg, step);
  const r = trapezeGongR(l);
  const ready = lit && s.ampMilli >= step.gongMilli;
  ctx.save();
  ctx.globalAlpha *= lit ? 1 : WAITING;
  const cord = new Path2D();
  cord.moveTo(at.x, at.y - r);
  cord.lineTo(at.x, at.y - r - 0.9 * l.tile);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.trapezeRopeDark;
  ctx.stroke(cord);
  const disc = new Path2D();
  disc.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fillStyle = ready ? PALETTE.trapezeBrassLit : PALETTE.trapezeBrass;
  ctx.fill(disc);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.trapezeBrassDark;
  ctx.stroke(disc);
  const boss = new Path2D();
  boss.arc(at.x, at.y, r * 0.4, 0, Math.PI * 2);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(boss);
  if (ready) strokeGlow(ctx, disc, PALETTE.trapezeBrassLit, STROKE.outline, 1, 1);
  ctx.restore();
}
