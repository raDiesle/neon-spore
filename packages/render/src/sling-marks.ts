import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { slingCordPath, slingCupPath, slingCupRadius } from "./sling-shape.js";

/** A step's colour on the canvas: its cannon's, or the hull's rim for one either answers (§32). */
export function slingColour(color: Color | "either"): { body: string; rim: string } {
  if (color === "either") return { body: PALETTE.hullRim, rim: PALETTE.hullRim };
  return { body: PALETTE[color], rim: color === "red" ? PALETTE.redRim : PALETTE.cyanRim };
}

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
  const { body, rim } = slingColour(lit.color);
  ctx.fillStyle = rgba(body, glow * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(cup);
  strokeGlow(ctx, cup, rim, STROKE.inner, 0.8 + glow);
  const ring = new Path2D();
  ring.arc(0, -r * 0.2, r * 1.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}
