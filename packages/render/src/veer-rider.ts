import type { ClownDisc } from "@neon-spore/content";
import { halo } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import type { VeerRider } from "./veer-look.js";

/**
 * **The shipped rider**: the colours, the light and the order THE VEER's clown
 * is drawn in, over a figure `veer-clown.ts` has already placed.
 *
 * Moved here out of `veer-clown.ts` when the rider became a record a
 * candidate could patch, for `throb-look.ts`'s reason: the record needs the
 * paint and the caller needs the record, so with the paint left there the two
 * would import each other. Nothing about where a disc sits is decided here —
 * `clownFigure` in `content` placed every one of them, and the palette draws
 * the same figure as a contour.
 */

/** One filled, outlined disc — the head, the nose and the pompom are all one. */
export function ball(
  ctx: CanvasRenderingContext2D,
  d: ClownDisc,
  fill: string,
  line: string,
): void {
  ctx.beginPath();
  ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
}

/**
 * The face: two eyes and a grin in the background's own dark so they read as
 * holes rather than as a second material, and the nose last — the one
 * coloured thing on the whole rock, with a breath of its own light under it.
 * Shared with the candidate riders, because whatever the rider is made of, a
 * clown whose nose is stone is not a clown anybody sees.
 */
export function drawFace(v: VeerRider): void {
  const { ctx, f } = v;
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  for (const eye of f.eyes) ctx.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2);
  ctx.fill();
  // The grin is struck wide and low, clear of the nose that goes over it —
  // drawn tight to the nose it read as a shadow under one rather than as a
  // mouth, which loses the only mark on this face that is doing any work
  // besides "somebody is up there".
  ctx.beginPath();
  ctx.arc(f.grin.x, f.grin.y, f.grin.r, f.grin.from, f.grin.to);
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = f.grin.width;
  ctx.lineCap = "round";
  ctx.stroke();
  // The eye lands on the face before it lands on anything else, which is the
  // entire reason the hue was spent. Small enough that it never grows into
  // the ring of colour a shot could be aimed at.
  halo(ctx, f.nose.x, f.nose.y, f.noseGlow, PALETTE.clownNose, 0.35);
  ball(ctx, f.nose, PALETTE.clownNose, PALETTE.clownNoseRim);
}

/** A breath of light around the rider while it braces, and none at all
 * otherwise — the same way the dart's pilot flame lights just before a run. */
export function drawBrace(v: VeerRider): void {
  if (v.brace > 0.01) {
    halo(v.ctx, v.f.brace.x, v.f.brace.y, v.f.brace.r, PALETTE.rock, v.brace * 0.28);
  }
}

export function drawClownRider(v: VeerRider): void {
  const { ctx, f } = v;
  ctx.save();

  // The ruff, where the rider meets the stone: five discs along the rock's
  // shoulder. A collar rather than a straight line, because the one thing that
  // has to be plain at a tile thirty pixels wide is that the figure is *on*
  // the rock and not floating over it.
  for (const bead of f.ruff) ball(ctx, bead, PALETTE.rock, PALETTE.rockDark);

  // The head.
  ball(ctx, f.head, PALETTE.rock, PALETTE.rockDark);

  // The hat: a cone off the crown with a pompom on the tip, leaning into the
  // pull. It is the tallest thing on the figure and the one that carries the
  // silhouette — a clown read at arm's length is a triangle over a circle.
  ctx.beginPath();
  ctx.moveTo(f.hat[0]!.x, f.hat[0]!.y);
  for (const p of f.hat.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  ball(ctx, f.pompom, PALETTE.text, PALETTE.rockDark);

  drawFace(v);
  ctx.restore();
  drawBrace(v);
}
