import type { Point } from "@neon-spore/content";
import { bodyPath } from "../../../../packages/render/src/goo-body.js";
import { SPAWN } from "../../../../packages/render/src/goo-moment.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import type { PressView } from "./view.js";

/**
 * **What calls a finger to a press no finger has touched yet** — the hold's
 * call (`hold-goo/call.ts`) in a tap rhythm: where the hold's halo breathes in
 * and out, slow, the press's flashes twice, quick — *tap tap* — then waits,
 * and each flash hops the drop and throws a ring. So a hold and a press differ
 * before either is touched, on the same drop.
 *
 * `knocks` is how a call is played: the times of its hops in one round, and
 * how long a round lasts. THE PRESS LAB's KNOCK plays as many as the mark asks.
 */

export interface Knocks {
  readonly at: readonly number[];
  readonly round: number;
}

/** *Tap tap*, then a wait. */
const TAP_TAP: Knocks = { at: [0, 0.2], round: 1.1 };

/** Each knock's hop, 1 at once and gone in about a fifth of a second. */
const HOP = 14;
/** Seconds a knock's ring takes to spread and fade. */
const RING = 0.45;

export function tapCall(v: PressView): number {
  return knock(v, TAP_TAP);
}

/** Play `k` round the mark; how high it hops the drop now, 0..1. */
export function knock(v: PressView, k: Knocks): number {
  const { ctx, at, r } = v;
  const s = Math.max(0, v.born - SPAWN) % k.round;
  let hop = 0;
  ctx.save();
  ctx.strokeStyle = GOO.neon;
  for (const t of k.at) {
    const dt = s - t;
    if (dt < 0) continue;
    hop = Math.max(hop, Math.exp(-dt * HOP));
    const u = dt / RING;
    if (u >= 1) continue;
    ctx.globalAlpha = 0.75 * (1 - u) ** 1.5;
    ctx.lineWidth = r * 0.09 * (1 - u) + 0.3;
    ctx.stroke(bodyPath({ at, r: r * (1.1 + 0.8 * u), seed: 29 }, GOO, v.time));
  }
  ctx.restore();
  flash(ctx, at, r, 0.08 + 0.4 * hop);
  return hop;
}

/** The halo round the mark, `alpha` strong. */
function flash(ctx: CanvasRenderingContext2D, at: Point, r: number, alpha: number): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(at.x, at.y, r * 0.7, at.x, at.y, r * 2.5);
  halo.addColorStop(0, GOO.neon);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
