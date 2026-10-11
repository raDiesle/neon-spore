import type { Point } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { drop, type GooBody } from "./body.js";
import { clamp01, hash, mix, settle } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **How a GOO drop is taken, and how it goes while it is pulled**: SQUISH —
 * pressed flat under the thumb, it springs up wobbling and a few drops of goo
 * splash off it onto the field, where they lie a while; pulled, it stretches
 * and quivers. The owner, 10 October 2026, asked for variants of the grab and
 * picked SQUISH of LEAN, SQUISH, LIFT and CHARGE; on 11 October: *remove other
 * "Grab" and keep "grab * squish" to be used in "fizz"*.
 */

/** The drop under the hand: where, how big, the way it is pulled, how near the edge of
 * the path its rim is, and how long ago it was taken. */
export interface Hold {
  readonly at: Point;
  readonly r: number;
  readonly way: Point;
  readonly near: number;
  readonly grabbed: number;
  readonly time: number;
}

/** The held drop's body: pressed flat as it is taken, springing up, then stretched. */
export function heldBody(h: Hold): GooBody {
  const stretch = 0.22 + 0.15 * h.near;
  const into = smoothstep(clamp01(h.grabbed / 0.3));
  return drop(h.at, h.r, {
    lean: h.way,
    stretch: stretch * into + 0.07 * Math.sin(h.time * 9) * into,
    shake: 0.12 * h.near + 0.05 * into,
    squash: 1 + 0.4 * settle(h.grabbed, 7, 19),
  });
}

/** Over the held drop: the light from inside it as it is taken. */
export function overHeld(ctx: CanvasRenderingContext2D, h: Hold, style: GooStyle): void {
  inner(ctx, h.at, h.r, style.neon, 0.35 * (1 - clamp01(h.grabbed / 0.25)));
}

/** Light inside the drop, `alpha` strong. */
function inner(ctx: CanvasRenderingContext2D, at: Point, r: number, color: string, alpha: number) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, r * 1.2);
  g.addColorStop(0, mix(color, "#FFFFFF", 0.6));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** SQUISH's splash: seconds its drops fly before they land, how long they lie on the
 * field after, and how long they take to fade — the owner, 10 October 2026: *keeping
 * the spashing on the field just a little bit longer*. */
const FLY = 0.22;
const LIE = 0.9;
const FADE = 0.5;

/**
 * A few drops of goo thrown off the rim as the thumb presses, landing on the
 * field round where it was taken and lying there flattened a while before
 * they fade — drawn by the channel, under the drop, at the start, so they
 * stay where they fell when the drop is pulled away.
 */
export function fieldSplash(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  grabbed: number,
): void {
  if (grabbed >= FLY + LIE + FADE) return;
  const fly = clamp01(grabbed / FLY);
  const fade = 1 - clamp01((grabbed - FLY - LIE) / FADE);
  ctx.save();
  ctx.fillStyle = style.neon;
  for (let i = 0; i < 8; i++) {
    const a = hash(i * 4.1 + 2) * Math.PI * 2;
    const d = r * (1 + (0.5 + 0.8 * hash(i * 2.9)) * (1 - (1 - fly) ** 2));
    const size = r * (0.06 + 0.07 * hash(i * 6.3));
    const x = at.x + Math.cos(a) * d;
    // In the air it arcs up and comes down; on the field it lies flat and spreads a little.
    const y = at.y + Math.sin(a) * d - r * 0.5 * Math.sin(Math.PI * fly);
    const flat = fly < 1 ? 1 : 1 + 0.4 * clamp01((grabbed - FLY) / 0.15);
    ctx.globalAlpha = 0.85 * fade;
    ctx.beginPath();
    ctx.ellipse(x, y, size * flat, (size / flat) * 0.85, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
