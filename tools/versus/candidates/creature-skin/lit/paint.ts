import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import type { BodyPaint } from "../../../../../packages/render/src/living-skin.js";
import { rgba } from "../../../../../packages/render/src/meteor-look.js";

/**
 * The paint LIT is made of, kept out of `index.ts` so that file stays the
 * argument rather than a wall of canvas calls.
 *
 * Nothing here caches a frame, and nothing here decides where the light is:
 * `litRound` is the shipped ramp at the shipped `KEY`, called the way
 * `meteor-look.ts` calls it, so what this candidate argues about is what a
 * body is *made of* and not where the sun is.
 */

/** How far the flesh is carried from the deep toward the body's own colour.
 * The whole candidate turns on this number: at 0 it is the shipped skin with
 * an unlit gradient over it, and past about a half the body stops being a
 * silhouette and starts being a lamp. */
const FLESH = 0.42;

/** The inner rim, as a share of the contour's own reach, and how much of the
 * pale rim colour it carries. Drawn **before** the light, so the far half of
 * it is taken back down — a bevel painted after the ramp is a bright ring on
 * a dark side, which is the one thing that reads as a sticker. */
const BEVEL = 0.15;
const BEVEL_ALPHA = 0.32;

/** The sheen: a soft light gathered under the lit shoulder, in the body's own
 * hue rather than in white, because a creature takes no `lift` — brightening
 * moves a red body a measurable distance toward cyan (`key-light.ts`). */
const SHEEN_ALPHA = 0.2;

export function lit(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  rule: CanvasFillRule,
  p: BodyPaint,
): void {
  const reach = Math.max(p.rx, p.ry);

  // The flesh. The shipped fill is the deep — very nearly the background — so
  // there is nothing for a light to carve: a body has to have a body before it
  // can have a terminator on it.
  ctx.fillStyle = mixHex(p.dark, p.hex, FLESH);
  ctx.fill(path, rule);

  ctx.save();
  ctx.clip(path, rule);
  ctx.strokeStyle = p.rim;
  ctx.globalAlpha = BEVEL_ALPHA;
  ctx.lineWidth = reach * BEVEL;
  ctx.stroke(path);
  ctx.globalAlpha = 1;

  // The key light, undone by the rotation the transform already carries, so a
  // throb's turn and a dart's lean move the body under a light that stays
  // where it is.
  litRound(ctx, 0, 0, reach, "value", p.rot);

  // The sheen goes on after the ramp: it is light *coming off* the surface,
  // and a ramp over it would be the surface shading its own highlight.
  const sheen = ctx.createRadialGradient(0, -reach * 0.34, 0, 0, -reach * 0.34, reach * 0.8);
  sheen.addColorStop(0, p.hex);
  sheen.addColorStop(1, rgba(p.hex, 0));
  ctx.globalAlpha = SHEEN_ALPHA;
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = sheen;
  ctx.fill(path, rule);
  ctx.restore();

  // The neon edge, unchanged. It is the identity of the whole game and the
  // one thing on this body that is state rather than material — a wrong
  // colour puts it out (`living-draw.ts`'s `blocked` branch, which never
  // reaches this file at all).
  strokeGlow(ctx, path, p.hex, Math.max(1, p.r * 0.1) / p.scale, 1);
}
