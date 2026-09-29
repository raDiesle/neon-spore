import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { slingCordPath, slingCupPath, slingCupRadius } from "./sling-shape.js";
import { stepColour } from "./step-colour.js";

/** One side's cord: cord-brown at rest, glowing white while this side is the one asked to draw it. */
export function drawSlingCord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  tension: number,
  asking: boolean,
  beatPhase: number,
): void {
  const path = slingCordPath(l, side, tension);
  if (asking) {
    const pulse = 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2);
    strokeGlow(ctx, path, PALETTE.hullRim, STROKE.outline, pulse);
    return;
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.slingCord, 0.85);
  ctx.stroke(path);
}

/** The cup at the crotch: dark steel unlit, glowing the step's colour, with a ring closing as a fire step's window runs out. */
export function drawSlingCup(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  glow: number,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const cup = slingCupPath(l);
  const r = slingCupRadius(l);
  if (lit === null) {
    ctx.fillStyle = rgba(PALETTE.slingSteelDark, 0.9);
    ctx.fill(cup);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.slingSteel, 0.9);
    ctx.stroke(cup);
    return;
  }
  const { body, rim } = stepColour(lit.color);
  ctx.fillStyle = rgba(body, glow * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(cup);
  strokeGlow(ctx, cup, rim, STROKE.inner, 0.8 + glow);
  const ring = new Path2D();
  ring.arc(0, -r * 0.2, r * 1.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}

/** How far past the cup a cooling tick's ring runs out before it is gone, in cup radii. */
const TICK_REACH = 2.4;

/**
 * **The spent yoke cooling** (§32 row 11, its sixth pose): the cup white-hot
 * as the cool opens and back to the fork's own scoured grey by `cooled` 1,
 * a halo round it dying with it, and a ring ticked off it on every beat,
 * fainter each time — no cannon colour, since nothing is being asked for.
 * Drawn in the crotch's frame, in the cup's place; called only while it cools.
 */
export function drawSlingHeat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cooled: number,
  beatPhase: number,
): void {
  const cup = slingCupPath(l);
  const r = slingCupRadius(l);
  const heat = 1 - cooled;
  const colour = mixHex(PALETTE.slingHeat, PALETTE.slingSteel, cooled);
  ctx.fillStyle = rgba(colour, 0.95);
  ctx.fill(cup);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.slingSteelDark, 0.9);
  ctx.stroke(cup);
  if (heat <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = new Path2D();
  halo.ellipse(0, -r * 0.2, r * 2.2, r * 1.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(colour, 0.28 * heat);
  ctx.fill(halo);
  const ring = new Path2D();
  const out = r * (1 + (TICK_REACH - 1) * beatPhase);
  ring.ellipse(0, -r * 0.2, out, out * 0.8, 0, 0, Math.PI * 2);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(colour, 0.85 * heat * (1 - beatPhase));
  ctx.stroke(ring);
  ctx.restore();
}
